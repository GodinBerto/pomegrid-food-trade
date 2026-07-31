import { useUserStore } from "@/store/store";
import Cookies from "js-cookie";
import {
  ACCESS_TOKEN_COOKIES,
  REFRESH_TOKEN_COOKIES,
} from "@/lib/session-cookies";

// src/api/client.ts
const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_APP_API_URL ||
  process.env.NEXT_PUBLIC_CLOUD_HOSTED_URL ||
  "/api/v1/";
const USE_DEV_PROXY =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_DEV_PROXY === "true";
const PLATFORM_PROXY_SETTING = process.env.NEXT_PUBLIC_USE_PLATFORM_PROXY;
const USE_PLATFORM_PROXY =
  PLATFORM_PROXY_SETTING === "true" ||
  (process.env.NODE_ENV === "production" && PLATFORM_PROXY_SETTING !== "false");
const USE_PROXY_TUNNEL = USE_DEV_PROXY || USE_PLATFORM_PROXY;
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const CSRF_TOKEN_COOKIE = "csrf_token";
const REFRESH_CSRF_COOKIE = "refresh_csrf_token";
const LEGACY_REFRESH_CSRF_COOKIE = "csrf_refresh_token";
const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const REFRESH_ENDPOINT = "auth/refresh";

const readBrowserCookie = (names: readonly string[]) => {
  for (const name of names) {
    const value = Cookies.get(name);
    if (value) return value;
  }

  return undefined;
};

const removeBrowserCookies = (names: readonly string[]) => {
  for (const name of names) {
    Cookies.remove(name);
  }
};

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiRequestOptions = {
  headers?: HeadersInit;
  skipAuth?: boolean;
  skipRefresh?: boolean;
};

let activeRefreshRequest: Promise<boolean> | null = null;
let refreshFailed = false;

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/^\/+/, "");

const ensureTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`);

const getCookieOptions = (expiresInDays: number) => {
  const isHttps =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : process.env.NODE_ENV !== "development";

  return {
    expires: expiresInDays,
    secure: isHttps,
    sameSite: "Lax" as const,
    path: "/",
  };
};

const resolveApiBaseUrl = () => {
  if (!RAW_API_BASE_URL) return "/api/v1/";

  // Use relative API paths when a local or deployment proxy is handling requests.
  if (USE_PROXY_TUNNEL) {
    try {
      const parsed = new URL(RAW_API_BASE_URL);
      const pathname = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "/api/v1";
      return ensureTrailingSlash(pathname.startsWith("/") ? pathname : `/${pathname}`);
    } catch {
      return ensureTrailingSlash(
        RAW_API_BASE_URL.startsWith("/") ? RAW_API_BASE_URL : `/${RAW_API_BASE_URL}`,
      );
    }
  }

  return ensureTrailingSlash(RAW_API_BASE_URL);
};

const API_BASE_URL = resolveApiBaseUrl();

export const buildApiUrl = (endpoint: string) => {
  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL
    : `${API_BASE_URL}/`;
  return `${normalizedBase}${normalizeEndpoint(endpoint)}`;
};

const getAccessToken = () => {
  const cookieToken = readBrowserCookie(ACCESS_TOKEN_COOKIES);
  if (cookieToken) return cookieToken;

  try {
    return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || undefined;
  } catch {
    return undefined;
  }
};

const getRefreshCsrfToken = () => {
  const cookieToken =
    Cookies.get(CSRF_TOKEN_COOKIE) ||
    Cookies.get(REFRESH_CSRF_COOKIE) ||
    Cookies.get(LEGACY_REFRESH_CSRF_COOKIE);
  if (cookieToken) return cookieToken;

  try {
    return (
      localStorage.getItem(CSRF_TOKEN_COOKIE) ||
      localStorage.getItem(REFRESH_CSRF_COOKIE) ||
      localStorage.getItem(LEGACY_REFRESH_CSRF_COOKIE) ||
      undefined
    );
  } catch {
    return undefined;
  }
};

const getRefreshToken = () => {
  const cookieToken = readBrowserCookie(REFRESH_TOKEN_COOKIES);
  if (cookieToken) return cookieToken;

  try {
    return localStorage.getItem(REFRESH_TOKEN_COOKIE) || undefined;
  } catch {
    return undefined;
  }
};

const setRefreshToken = (refreshToken?: string) => {
  if (!refreshToken) return;

  for (const name of REFRESH_TOKEN_COOKIES) {
    Cookies.set(name, refreshToken, getCookieOptions(30));
  }

  try {
    localStorage.setItem(REFRESH_TOKEN_COOKIE, refreshToken);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const clearRefreshToken = () => {
  removeBrowserCookies(REFRESH_TOKEN_COOKIES);

  try {
    localStorage.removeItem(REFRESH_TOKEN_COOKIE);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const setRefreshCsrfToken = (csrfToken?: string) => {
  if (!csrfToken) return;

  Cookies.set(CSRF_TOKEN_COOKIE, csrfToken, getCookieOptions(30));
  Cookies.set(REFRESH_CSRF_COOKIE, csrfToken, getCookieOptions(7));

  try {
    localStorage.setItem(CSRF_TOKEN_COOKIE, csrfToken);
    localStorage.setItem(REFRESH_CSRF_COOKIE, csrfToken);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const clearRefreshCsrfToken = () => {
  Cookies.remove(CSRF_TOKEN_COOKIE);
  Cookies.remove(REFRESH_CSRF_COOKIE);
  Cookies.remove(LEGACY_REFRESH_CSRF_COOKIE);

  try {
    localStorage.removeItem(CSRF_TOKEN_COOKIE);
    localStorage.removeItem(REFRESH_CSRF_COOKIE);
    localStorage.removeItem(LEGACY_REFRESH_CSRF_COOKIE);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const clearAccessToken = () => {
  removeBrowserCookies(ACCESS_TOKEN_COOKIES);
  try {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

const safeParseJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

const extractErrorMessage = (
  payload: Record<string, any> | null,
  fallback: string = "Something went wrong",
) => {
  if (!payload) return fallback;

  return payload.message || payload.msg || payload.error || fallback;
};

const shouldAttemptRefresh = (
  statusCode: number,
  payload: Record<string, any> | null,
) => {
  if (statusCode !== 401 && statusCode !== 403 && statusCode !== 422) {
    return false;
  }

  const tokenErrorPatterns = [
    "token has expired",
    "signature has expired",
    "bad authorization header",
    "missing authorization header",
    "jwt",
    "token",
    "subject must be a string",
    "invalid subject",
  ];

  const hasSessionContext = Boolean(
    getAccessToken() ||
    getRefreshCsrfToken() ||
    getRefreshToken() ||
    useUserStore.getState().isLoggedIn,
  );

  if (!hasSessionContext) return false;

  if (statusCode === 401 || statusCode === 403) {
    return true;
  }

  const message = extractErrorMessage(payload, "").toLowerCase();
  return tokenErrorPatterns.some((pattern) => message.includes(pattern));
};

const buildHeaders = (
  endpoint: string,
  isFormData: boolean,
  options: ApiRequestOptions,
) => {
  const headers = new Headers(options.headers);
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  const publicAuthEndpoints = new Set([
    "auth/login",
    "auth/register",
    "auth/register-admin",
    REFRESH_ENDPOINT,
  ]);

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (
    !options.skipAuth &&
    !publicAuthEndpoints.has(normalizedEndpoint) &&
    !headers.has("Authorization")
  ) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (normalizedEndpoint === REFRESH_ENDPOINT && !headers.has("X-CSRF-TOKEN")) {
    const csrfToken = getRefreshCsrfToken();
    if (csrfToken) {
      headers.set("X-CSRF-TOKEN", csrfToken);
    }
  }

  return headers;
};

const performRequest = async (
  endpoint: string,
  method: HttpMethod,
  body: unknown,
  isFormData: boolean,
  options: ApiRequestOptions,
) => {
  const requestUrl = buildApiUrl(endpoint);

  try {
    return await fetch(requestUrl, {
      method,
      headers: buildHeaders(endpoint, isFormData, options),
      credentials: "include",
      body: body
        ? isFormData
          ? (body as FormData)
          : JSON.stringify(body)
        : undefined,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Failed to reach API (${requestUrl}). Check backend availability and CORS/proxy config.`,
      );
    }

    throw error;
  }
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return {} as T;
  }

  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
};

const clearAuthState = () => {
  clearAccessToken();
  clearRefreshToken();
  clearRefreshCsrfToken();
  useUserStore.getState().logout();
};

export const hasSession = () => {
  return Boolean(
    getAccessToken() ||
    getRefreshCsrfToken() ||
    getRefreshToken() ||
    useUserStore.getState().isLoggedIn
  );
};

const extractRefreshPayload = (payload: Record<string, any> | null) => {
  const nestedData =
    payload?.data && typeof payload.data === "object" ? payload.data : payload;

  return {
    accessToken: nestedData?.access_token as string | undefined,
    refreshToken: nestedData?.refresh_token as string | undefined,
    csrfToken: nestedData?.csrf_token as string | undefined,
    requiresRetry: Boolean(
      nestedData?.requires_retry ?? payload?.requires_retry,
    ),
  };
};

const getRefreshRequestOptions = (): ApiRequestOptions => {
  return {
    skipAuth: true,
    skipRefresh: true,
  };
};

const refreshAccessToken = async (): Promise<boolean> => {
  if (activeRefreshRequest) {
    return activeRefreshRequest;
  }

  activeRefreshRequest = (async () => {
    try {
      const refreshToken = getRefreshToken();
      const refreshBody = refreshToken
        ? { refresh_token: refreshToken }
        : undefined;
      const refreshResponse = await performRequest(
        REFRESH_ENDPOINT,
        "POST",
        refreshBody,
        false,
        getRefreshRequestOptions(),
      );

      const refreshPayload =
        await safeParseJson<Record<string, any>>(refreshResponse);
      const refreshData = extractRefreshPayload(refreshPayload);

      if (!refreshResponse.ok || !refreshData.accessToken) {
        refreshFailed = true;
        clearAuthState();
        return false;
      }

      setAuthSession(
        refreshData.accessToken,
        refreshData.csrfToken,
        refreshData.refreshToken,
      );

      if (refreshData.requiresRetry) {
        const retryRefreshToken = refreshData.refreshToken || getRefreshToken();
        const retryBody = retryRefreshToken
          ? { refresh_token: retryRefreshToken }
          : undefined;
        const retryResponse = await performRequest(
          REFRESH_ENDPOINT,
          "POST",
          retryBody,
          false,
          getRefreshRequestOptions(),
        );

        const retryPayload =
          await safeParseJson<Record<string, any>>(retryResponse);
        const retryData = extractRefreshPayload(retryPayload);

        if (!retryResponse.ok || !retryData.accessToken) {
          refreshFailed = true;
          clearAuthState();
          return false;
        }

        setAuthSession(
          retryData.accessToken,
          retryData.csrfToken,
          retryData.refreshToken,
        );
      }

      return true;
    } catch (error) {
      refreshFailed = true;
      clearAuthState();
      return false;
    } finally {
      activeRefreshRequest = null;
    }
  })();

  return activeRefreshRequest;
};

export const setAccessToken = (token: string) => {
  for (const name of ACCESS_TOKEN_COOKIES) {
    Cookies.set(name, token, getCookieOptions(1));
  }
  try {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore storage errors in private browsing / restricted environments.
  }
};

export const setAuthSession = (
  accessToken: string,
  csrfToken?: string,
  refreshToken?: string,
) => {
  refreshFailed = false;
  setAccessToken(accessToken);
  setRefreshCsrfToken(csrfToken);
  setRefreshToken(refreshToken);
};

export const clearAuthSession = () => {
  clearAuthState();
};

export const apiRequest = async <T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  isFormData: boolean = false,
  options: ApiRequestOptions = {},
): Promise<T> => {
  if (!options.skipRefresh && refreshFailed) {
    const stillHasSession = Boolean(
      getAccessToken() || getRefreshToken() || getRefreshCsrfToken(),
    );
    if (stillHasSession) {
      throw new Error("Session expired. Please log in again.");
    }
    refreshFailed = false;
  }

  const normalizedEndpoint = normalizeEndpoint(endpoint);
  const isRefreshEndpoint = normalizedEndpoint === REFRESH_ENDPOINT;

  let response = await performRequest(
    endpoint,
    method,
    body,
    isFormData,
    options,
  );

  if (!response.ok) {
    const errorPayload = await safeParseJson<Record<string, any>>(response);

    if (
      !options.skipRefresh &&
      !isRefreshEndpoint &&
      shouldAttemptRefresh(response.status, errorPayload)
    ) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        response = await performRequest(
          endpoint,
          method,
          body,
          isFormData,
          options,
        );

        if (response.ok) {
          return parseResponse<T>(response);
        }

        const retryErrorPayload =
          await safeParseJson<Record<string, any>>(response);
        throw new Error(extractErrorMessage(retryErrorPayload));
      }

      refreshFailed = true;
      clearAuthState();
      throw new Error("Session expired. Please log in again.");
    }

    const lowerMessage = extractErrorMessage(errorPayload, "").toLowerCase();
    // if (
    //   (response.status === 401 ||
    //     response.status === 403 ||
    //     response.status === 422) &&
    //   (lowerMessage.includes("token") ||
    //     lowerMessage.includes("authorization") ||
    //     lowerMessage.includes("jwt") ||
    //     lowerMessage.includes("subject must be a string") ||
    //     lowerMessage.includes("invalid subject"))
    // ) {
    //   refreshFailed = true;
    //   clearAuthState();
    //   throw new Error("Session expired. Please log in again.");
    // }

    throw new Error(extractErrorMessage(errorPayload));
  }

  return parseResponse<T>(response);
};
