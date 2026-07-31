"use client";

import Link from "@/components/no-prefetch-link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Package,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { logoutUser } from "@/lib/auth";
import { useIsAdminCheck } from "@/query/admin";
import { useUserStore } from "@/store/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { count, hydrated } = useCart();
  const { isLoggedIn, user } = useUserStore();
  const { data: adminStatus } = useIsAdminCheck();

  const signedIn = isLoggedIn;
  const isAdmin = adminStatus?.isAdmin === true;

  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const links = [
    { to: "/shop", label: "Shop" },
    { to: "/whatsapp", label: "WhatsApp Groups" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
            P
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight">Pomegrid</div>
            <div className="text-[11px] font-medium text-secondary">
              Food Trade
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              href={l.to}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-primary-soft hover:text-primary ${path === l.to ? "bg-primary-soft text-primary font-semibold" : "text-foreground/80"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full bg-muted text-foreground"
          >
            <ShoppingBag className="h-5 w-5" />
            {hydrated && count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 text-[11px] font-bold text-secondary-foreground">
                {count}
              </span>
            )}
          </Link>

          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full bg-muted outline-none hover:bg-muted/80">
                <UserIcon className="h-5 w-5 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user?.full_name || user?.name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="cursor-pointer">
                    <Package className="mr-2 h-4 w-4" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await logoutUser();
                    window.location.href = "/";
                  }}
                  className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth"
              className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:inline-block"
            >
              Sign in
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground sm:inline-block"
            >
              Admin
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full bg-muted md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden">
          <div className="mx-4 mb-4 rounded-2xl bg-muted p-2">
            {links.map((l) => (
              <Link
                key={l.to}
                href={l.to}
                className="block rounded-xl px-4 py-3 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href={signedIn ? "/orders" : "/auth"}
              className="mt-1 block rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              {signedIn ? "My Orders" : "Sign in"}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="mt-1 block rounded-xl bg-secondary px-4 py-3 text-center text-sm font-semibold text-secondary-foreground"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
