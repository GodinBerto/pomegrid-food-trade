"use client";

import Link from "@/components/no-prefetch-link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatGHS, categoryImage } from "@/lib/format";

export default function CartPage() {
  const {
    items,
    setQty,
    remove,
    total,
    hydrated,
    clear,
    isUpdating,
    isLoggedIn,
  } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-14 lg:px-8">Loading cart…</div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Sign in to view your cart</h1>
        <p className="mt-2 text-muted-foreground">
          Your cart is saved to your account once you sign in.
        </p>
        <Link
          href="/auth"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-muted">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our wholesale catalog to get started.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <h1 className="text-3xl font-bold">Your cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="flex items-center gap-4 rounded-2xl bg-muted p-4"
            >
              <div className="h-16 w-16 overflow-hidden rounded-xl">
                <img
                  src={it.imageUrl || categoryImage(null)}
                  alt={it.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{it.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatGHS(it.price_ghs)} each
                </div>
                {!it.isActive && (
                  <div className="mt-1 text-xs font-medium text-destructive">
                    Currently unavailable
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 rounded-full bg-background p-1">
                <button
                  disabled={isUpdating}
                  onClick={() =>
                    it.qty <= 1 ? remove(it.id) : setQty(it.id, it.qty - 1)
                  }
                  className="grid h-8 w-8 place-items-center rounded-full bg-muted disabled:opacity-60"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">
                  {it.qty}
                </span>
                <button
                  disabled={isUpdating}
                  onClick={() => setQty(it.id, it.qty + 1)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-muted disabled:opacity-60"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="w-24 text-right font-semibold">
                {formatGHS(it.price_ghs * it.qty)}
              </div>
              <button
                disabled={isUpdating}
                onClick={() => remove(it.id)}
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-destructive disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            disabled={isUpdating}
            onClick={() => clear()}
            className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-60"
          >
            Clear cart
          </button>
        </div>

        <aside className="h-fit rounded-3xl bg-primary p-6 text-primary-foreground">
          <div className="text-sm opacity-80">Order total</div>
          <div className="mt-1 text-3xl font-bold">{formatGHS(total)}</div>
          <div className="mt-1 text-xs opacity-80">
            Delivery calculated after checkout.
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-full bg-primary-foreground py-3 text-center text-sm font-semibold text-primary"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
