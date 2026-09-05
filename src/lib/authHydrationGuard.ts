export interface AuthHydrationGuard {
  begin: () => number;
  snapshot: () => number;
  isCurrent: (token: number) => boolean;
  invalidate: () => void;
}

export function createAuthHydrationGuard(): AuthHydrationGuard {
  let generation = 0;

  return {
    begin() {
      generation += 1;
      return generation;
    },
    snapshot() {
      return generation;
    },
    isCurrent(token: number) {
      return token === generation;
    },
    invalidate() {
      generation += 1;
    },
  };
}
