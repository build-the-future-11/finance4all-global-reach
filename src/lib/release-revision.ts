export interface ReleaseRevisionPayload {
  revision?: string;
  sha?: string;
}

export function readReleaseRevision(value: ReleaseRevisionPayload | null) {
  const revision = value?.revision ?? value?.sha;
  return revision && /^[0-9a-f]{40}$/i.test(revision) ? revision : null;
}
