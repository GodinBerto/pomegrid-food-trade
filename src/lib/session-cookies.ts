export const ACCESS_TOKEN_COOKIES = ["access_token", "access_token_cookie"] as const;
export const REFRESH_TOKEN_COOKIES = ["refresh_token", "refresh_token_cookie"] as const;

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
};

export function readCookie(cookies: CookieStore, names: readonly string[]) {
  for (const name of names) {
    const value = cookies.get(name)?.value;
    if (value) return value;
  }

  return undefined;
}

export function hasCookieSession(cookies: CookieStore) {
  return Boolean(
    readCookie(cookies, ACCESS_TOKEN_COOKIES) ||
      readCookie(cookies, REFRESH_TOKEN_COOKIES),
  );
}
