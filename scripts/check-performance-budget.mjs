import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import assert from 'node:assert/strict';

const files = (await readdir(new URL('../dist/assets/', import.meta.url))).filter(name => name.endsWith('.js'));
const sizes = await Promise.all(files.map(async name => ({ name, gzipBytes: gzipSync(await readFile(new URL('../dist/assets/' + name, import.meta.url))).length })));
const total = sizes.reduce((sum, file) => sum + file.gzipBytes, 0);
console.log(JSON.stringify({ source: process.env.EXPECTED_SOURCE_SHA, totalGzipBytes: total, allJavaScriptBudget: 512 * 1024, largestChunkBudget: 200 * 1024, sizes }, null, 2));
assert.ok(sizes.length > 0, 'No production JavaScript assets found');
assert.ok(total <= 512 * 1024, 'Total production JavaScript exceeds 512 KiB gzip');
assert.ok(sizes.every(file => file.gzipBytes <= 200 * 1024), 'A production JavaScript chunk exceeds 200 KiB gzip');
