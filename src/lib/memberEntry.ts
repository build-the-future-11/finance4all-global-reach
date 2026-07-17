/** Build signup URLs that return members to a portal destination after auth. */
export function signupWithNext(portalPath: string): string {
  const path = portalPath.startsWith("/") ? portalPath : `/${portalPath}`;
  return `/signup?next=${encodeURIComponent(path)}`;
}

export function loginWithNext(portalPath: string): string {
  const path = portalPath.startsWith("/") ? portalPath : `/${portalPath}`;
  return `/login?next=${encodeURIComponent(path)}`;
}
