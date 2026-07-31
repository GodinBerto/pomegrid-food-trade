"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageCircle,
  Menu,
  X,
  LogOut,
  Home,
  Tags,
} from "lucide-react";
import { isAdminUser, logoutUser } from "@/lib/auth";
import { hasSession } from "@/lib/apiClient";
import { useIsAdminCheck } from "@/query/admin";
import { useUserStore } from "@/store/store";

const NAV: ReadonlyArray<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeReady, setStoreReady] = useState(
    () => (useUserStore as any).persist?.hasHydrated?.() ?? false,
  );
  const { user, isLoggedIn } = useUserStore();
  const {
    data: adminStatus,
    isLoading: checkingAdmin,
    isFetched,
    isError,
  } = useIsAdminCheck();

  const isAdmin = adminStatus?.isAdmin === true || isAdminUser(user);
  const hasAuthSession = isLoggedIn || hasSession();

  useEffect(() => {
    if (storeReady) return;
    const onFinishHydration = (useUserStore as any).persist?.onFinishHydration;
    if (!onFinishHydration) {
      setStoreReady(true);
      return;
    }
    return onFinishHydration(() => {
      setStoreReady(true);
    });
  }, [storeReady]);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  useEffect(() => {
    if (!storeReady) return;

    if (!hasAuthSession) {
      router.replace("/auth");
      return;
    }

    if (isFetched && adminStatus?.isAdmin === false && !isAdminUser(user)) {
      router.replace("/");
    }
  }, [storeReady, hasAuthSession, isFetched, adminStatus, user, router]);

  const current = NAV.find((n) =>
    n.exact ? path === n.to : path.startsWith(n.to),
  );
  const pageTitle = current?.label ?? "Admin";

  if (
    !storeReady ||
    !hasAuthSession ||
    checkingAdmin ||
    (!isAdmin && !isFetched && !isError)
  ) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-20 text-sm text-muted-foreground">
        Checking admin access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">
          You do not have permission to access the admin panel.
        </p>
        <Link
          href="/"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-muted/40">
      <aside className="hidden w-64 shrink-0 flex-col bg-primary text-primary-foreground md:flex">
        <SidebarInner path={path} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-primary text-primary-foreground">
            <SidebarInner path={path} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-background px-4 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Admin
              </div>
              <h1 className="truncate text-xl font-bold">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium sm:inline-flex"
            >
              <Home className="h-4 w-4" /> View site
            </Link>
            <button
              onClick={async () => {
                await logoutUser();
                window.location.href = "/";
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm font-medium"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarInner({
  path,
  onClose,
}: {
  path: string;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground text-primary font-bold">
            P
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold">Pomegrid</div>
            <div className="text-[11px] opacity-80">Admin panel</div>
          </div>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full bg-primary-foreground/10"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const active = n.exact ? path === n.to : path.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              href={n.to}
              className={
                active
                  ? "flex items-center gap-3 rounded-xl bg-primary-foreground px-4 py-2.5 text-sm font-semibold text-primary"
                  : "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-primary-foreground/90 hover:bg-primary-foreground/10"
              }
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-[11px] opacity-70">© Pomegrid Food Trade</div>
    </>
  );
}
