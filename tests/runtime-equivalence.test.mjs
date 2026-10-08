import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { verifyRuntimeEquivalence } from '../scripts/verify-runtime-equivalence.mjs';

const script = fileURLToPath(new URL('../scripts/verify-runtime-equivalence.mjs', import.meta.url));

function repository(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'finance-runtime-equivalence-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  function git(...args) {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  }
  function write(path, content) {
    const target = join(cwd, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  function commit(message) {
    git('add', '.');
    git('-c', 'user.name=Local regression', '-c', 'user.email=regression@local.invalid',
      '-c', 'commit.gpgsign=false', 'commit', '-qm', message);
    return git('rev-parse', 'HEAD');
  }
  git('init', '-q');
  write('src/app.ts', 'export const application = 1;\n');
  write('package.json', JSON.stringify({
    scripts: { build: 'vite build' },
    dependencies: { react: '18.3.1' },
    devDependencies: { vite: '8.3.0' },
  }));
  const deployedRevision = commit('Initial disposable source');
  return { cwd, git, write, commit, deployedRevision };
}

test('identical committed inputs are equivalent', (t) => {
  const repo = repository(t);
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision: repo.deployedRevision });
  assert.equal(result.runtimeEquivalent, true);
  assert.deepEqual(result.changedPaths, []);
  assert.equal(result.deployedRevision, repo.deployedRevision);
  assert.equal(result.sourceRevision, repo.deployedRevision);
});

test('different commits with identical complete trees remain equivalent', (t) => {
  const repo = repository(t);
  repo.git('-c', 'user.name=Local regression', '-c', 'user.email=regression@local.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-qm', 'New identity, same inputs');
  const sourceRevision = repo.git('rev-parse', 'HEAD');
  assert.notEqual(sourceRevision, repo.deployedRevision);
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision });
  assert.equal(result.runtimeEquivalent, true);
  assert.deepEqual(result.changedPaths, []);
});

test('changes to production and build inputs require a new deployment', async (t) => {
  for (const path of [
    'src/app.ts', 'public/icon.svg', 'index.html', 'package-lock.json', 'vercel.json',
    'vite.config.ts', 'postcss.config.js', 'postcss.config.cjs', 'tsconfig.node.json',
    'scripts/write-release-revision.mjs', 'scripts/release-revision.mjs',
    'scripts/validate-public-env.mjs', 'scripts/verify-release-toolchain.mjs',
    '.npmrc', 'new-build-helper.mjs',
  ]) {
    await t.test(path, (child) => {
      const repo = repository(child);
      repo.write(path, 'changed build input\n');
      const sourceRevision = repo.commit(`Change ${path}`);
      const result = verifyRuntimeEquivalence({ ...repo, sourceRevision });
      assert.equal(result.runtimeEquivalent, false);
      assert.deepEqual(result.changedPaths, [path]);
    });
  }
});

test('package build, lifecycle, runtime, and package-manager changes are included', async (t) => {
  for (const [name, change] of [
    ['build script', { scripts: { build: 'vite build --mode development' } }],
    ['prebuild lifecycle', { scripts: { build: 'vite build', prebuild: 'node build.mjs' } }],
    ['runtime engine', { engines: { node: '>=24' } }],
    ['package manager', { packageManager: 'npm@11.0.0' }],
    ['dependency', { dependencies: { react: '19.0.0' } }],
  ]) {
    await t.test(name, (child) => {
      const repo = repository(child);
      const manifest = JSON.parse(readFileSync(join(repo.cwd, 'package.json'), 'utf8'));
      repo.write('package.json', JSON.stringify({ ...manifest, ...change }));
      const result = verifyRuntimeEquivalence({ ...repo, sourceRevision: repo.commit(name) });
      assert.equal(result.runtimeEquivalent, false);
      assert.deepEqual(result.changedPaths, ['package.json']);
    });
  }
});

test('documentation and dedicated test paths are included as possible build inputs', (t) => {
  const repo = repository(t);
  const paths = [
    'README.md', 'DEPLOYMENT.md', 'AGENTS.md', 'docs/release.md',
    'evidence/review.json', 'tests/regression.mjs', 'src/test/component.tsx',
    'e2e/journey.ts', 'e2e-credentialed/isolated.ts', '.storybook/main.ts',
    '.github/workflows/ci.yml', 'tools/finance4all-evidence/tests/test_gate.py',
  ];
  for (const path of paths) repo.write(path, 'documentation or dedicated test input\n');
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision: repo.commit('Only review inputs') });
  assert.equal(result.runtimeEquivalent, false);
  assert.deepEqual(result.changedPaths, [...paths].sort());
  assert.deepEqual(result.excludedPaths, []);
});

test('a docs-only commit that changes the actual Tailwind CSS stage is rejected', (t) => {
  const repo = repository(t);
  for (const path of ['package.json', 'postcss.config.js', 'src/index.css']) {
    repo.write(path, readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
  }
  repo.write('.gitignore', 'node_modules/\n');
  symlinkSync(fileURLToPath(new URL('../node_modules', import.meta.url)), join(repo.cwd, 'node_modules'), 'dir');
  const deployedRevision = repo.commit('Current production CSS inputs');

  // Compile in fresh processes rooted at the disposable repository so Tailwind
  // uses its real automatic source detection without scanning this test itself.
  const compile = `
    import { createHash } from 'node:crypto';
    import { readFileSync } from 'node:fs';
    import { createRequire } from 'node:module';
    import { resolve } from 'node:path';
    import { pathToFileURL } from 'node:url';
    const require = createRequire(resolve('package.json'));
    const postcss = require('postcss');
    const config = (await import(pathToFileURL(resolve('postcss.config.js')))).default;
    const plugins = Object.entries(config.plugins).map(([name, options]) => require(name)(options));
    const result = await postcss(plugins).process(readFileSync('src/index.css', 'utf8'), {
      from: resolve('src/index.css'),
    });
    process.stdout.write(JSON.stringify({
      sha256: createHash('sha256').update(result.css).digest('hex'),
      sentinelRule: /z-index:\\s*194731(?:[;}])/.test(result.css),
      dependencies: result.messages.filter(message => message.type === 'dependency').map(message => message.file),
    }));
  `;
  function cssStage() {
    return JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', compile], {
      cwd: repo.cwd,
      encoding: 'utf8',
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }));
  }

  const before = cssStage();
  const path = 'docs/runtime-css-example.md';
  repo.write(path, 'Build example: <div class="z-[194731]">Example</div>\n');
  const sourceRevision = repo.commit('Documentation candidate consumed by Tailwind');
  const after = cssStage();
  assert.equal(before.sentinelRule, false);
  assert.equal(after.sentinelRule, true);
  assert.notEqual(after.sha256, before.sha256);
  assert.ok(after.dependencies.includes(join(repo.cwd, path)));

  const result = verifyRuntimeEquivalence({ cwd: repo.cwd, deployedRevision, sourceRevision });
  assert.equal(result.runtimeEquivalent, false);
  assert.deepEqual(result.changedPaths, [path]);
});

test('a runtime deletion remains a mismatch', (t) => {
  const repo = repository(t);
  rmSync(join(repo.cwd, 'src/app.ts'));
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision: repo.commit('Remove runtime') });
  assert.equal(result.runtimeEquivalent, false);
  assert.deepEqual(result.changedPaths, ['src/app.ts']);
});

test('moving runtime input into documentation reports both tracked paths', (t) => {
  const repo = repository(t);
  mkdirSync(join(repo.cwd, 'docs'));
  renameSync(join(repo.cwd, 'src/app.ts'), join(repo.cwd, 'docs/app.ts'));
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision: repo.commit('Move runtime') });
  assert.equal(result.runtimeEquivalent, false);
  assert.deepEqual(result.changedPaths, ['docs/app.ts', 'src/app.ts']);
});

test('similarly named production paths are not excluded', (t) => {
  const repo = repository(t);
  repo.write('src/test-utils.ts', 'export const helper = 1;\n');
  repo.write('docs-runtime/generated.json', '{}\n');
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision: repo.commit('Runtime neighbors') });
  assert.equal(result.runtimeEquivalent, false);
  assert.deepEqual(result.changedPaths, ['docs-runtime/generated.json', 'src/test-utils.ts']);
});

test('comparison from a repository subdirectory still covers root build inputs', (t) => {
  const repo = repository(t);
  repo.write('postcss.config.js', 'export default { plugins: {} };\n');
  const sourceRevision = repo.commit('Root configuration changed');
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision, cwd: join(repo.cwd, 'src') });
  assert.equal(result.runtimeEquivalent, false);
  assert.deepEqual(result.changedPaths, ['postcss.config.js']);
});

test('diff.relative configuration cannot hide root build changes from a subdirectory', (t) => {
  const repo = repository(t);
  repo.write('postcss.config.js', 'export default { plugins: {} };\n');
  const sourceRevision = repo.commit('Root configuration changed');
  repo.git('config', 'diff.relative', 'true');
  const result = verifyRuntimeEquivalence({ ...repo, sourceRevision, cwd: join(repo.cwd, 'src') });
  assert.equal(result.runtimeEquivalent, false);
  assert.deepEqual(result.changedPaths, ['postcss.config.js']);
});

test('invalid, abbreviated, branch, and missing commit identities fail closed', (t) => {
  const repo = repository(t);
  for (const bad of ['', 'main', repo.deployedRevision.slice(0, 12), '-h', 'A'.repeat(40), '0'.repeat(40)]) {
    assert.throws(() => verifyRuntimeEquivalence({ ...repo, sourceRevision: bad }), /source revision/);
    assert.throws(() => verifyRuntimeEquivalence({ ...repo, deployedRevision: bad, sourceRevision: repo.deployedRevision }), /deployed revision/);
  }
});

test('CLI records match and mismatch receipts with distinct successful and failure exits', (t) => {
  const repo = repository(t);
  const receipt = join(repo.cwd, 'receipt.json');
  function run(sourceRevision) {
    return spawnSync(process.execPath, [script,
      '--deployed-revision', repo.deployedRevision, '--source-revision', sourceRevision,
      '--receipt', receipt,
    ], { cwd: repo.cwd, encoding: 'utf8' });
  }
  const accepted = run(repo.deployedRevision);
  assert.equal(accepted.status, 0, accepted.stderr);
  assert.equal(JSON.parse(readFileSync(receipt, 'utf8')).runtimeEquivalent, true);
  rmSync(receipt);
  repo.write('postcss.config.js', 'export default { plugins: {} };\n');
  const sourceRevision = repo.commit('Build input changed');
  const rejected = run(sourceRevision);
  assert.equal(rejected.status, 1, rejected.stderr);
  const recorded = JSON.parse(readFileSync(receipt, 'utf8'));
  assert.equal(recorded.runtimeEquivalent, false);
  assert.equal(recorded.sourceRevision, sourceRevision);
  assert.deepEqual(recorded.changedPaths, ['postcss.config.js']);
  const invalid = run('main');
  assert.equal(invalid.status, 2);
  assert.equal(invalid.stdout, '');
  assert.match(invalid.stderr, /source revision must be/);
});
