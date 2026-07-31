import { authApi } from "@/api/auth";
import { adminApi } from "@/api/admin";
import { clearAuthSession, hasSession } from "@/lib/apiClient";
import { useUserStore, type User } from "@/store/store";

export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  if (user.role === "admin" || user.is_admin === true) {
    return true;
  }

  if (user.user_type === "admin") {
    return true;
  }

  if (Array.isArray(user.roles)) {
    return user.roles.some(
      (entry) =>
        entry === "admin" ||
        (typeof entry === "object" && entry !== null && (entry as { role?: string }).role === "admin"),
    );
  }

  return false;
}

export function getPostLoginPath(user: User | null | undefined): string {
  return isAdminUser(user) ? "/admin" : "/";
}

export async function resolvePostLoginPath(user: User | null | undefined): Promise<string> {
  if (isAdminUser(user)) {
    return "/admin";
  }

  try {
    const res = await adminApi.isAdminCheck();
    if (res.data?.isAdmin === true) {
      return "/admin";
    }
  } catch {
    // Fall back to the standard user home route.
  }

  return "/";
}

export async function fetchAndStoreUser(): Promise<User | null> {
  const res = await authApi.getMe();
  const user = res?.data ?? null;
  if (user) {
    useUserStore.getState().login(user);
  }
  return user;
}

export async function hydrateAuthSession(): Promise<void> {
  if (!hasSession()) {
    if (useUserStore.getState().isLoggedIn) {
      useUserStore.getState().logout();
    }
    return;
  }

  try {
    await fetchAndStoreUser();
  } catch {
    clearAuthSession();
  }
}

export async function logoutUser(): Promise<void> {
  try {
    if (hasSession()) {
      await authApi.logout();
    }
  } catch {
    // Clear local session even when the backend logout call fails.
  } finally {
    clearAuthSession();
  }
}
