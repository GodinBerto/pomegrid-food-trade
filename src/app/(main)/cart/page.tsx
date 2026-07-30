"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatGHS, categoryImage } from "@/lib/format";

export default function CartPage() {
    const { items, setQty, remove, total, hydrated, clear } = useCart();

    if (!hydrated) return <div className="mx-auto max-w-4xl px-4 py-14 lg:px-8">Loading cart…</div>;

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-20 text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-muted">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
                <p className="mt-2 text-muted-foreground">Browse our wholesale catalog to get started.</p>
                <Link href="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Browse products</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
            <h1 className="text-3xl font-bold">Your cart</h1>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                <div className="space-y-3">
                    {items.map((it) => (
                        <div key={it.productId} className="flex items-center gap-4 rounded-2xl bg-muted p-4">
                            <div className="h-16 w-16 overflow-hidden rounded-xl">
                                <img src={it.imageUrl || categoryImage(null)} alt={it.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold">{it.name}</div>
                                <div className="text-xs text-muted-foreground">per {it.unit} · {formatGHS(it.pricGhs)}</div>
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-background p-1">
                                <button onClick={() => setQty(it.productId, it.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><Minus className="h-3.5 w-3.5" /></button>
                                <span className="w-10 text-center text-sm font-semibold">{it.qty}</span>
                                <button onClick={() => setQty(it.productId, it.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-muted"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                            <div className="w-24 text-right font-semibold">{formatGHS(it.pricGhs * it.qty)}</div>
                            <button onClick={() => remove(it.productId)} className="grid h-9 w-9 place-items-center rounded-full bg-background text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                    ))}
                    <button onClick={clear} className="text-sm text-muted-foreground hover:text-destructive">Clear cart</button>
                </div>

                <aside className="h-fit rounded-3xl bg-primary p-6 text-primary-foreground">
                    <div className="text-sm opacity-80">Order total</div>
                    <div className="mt-1 text-3xl font-bold">{formatGHS(total)}</div>
                    <div className="mt-1 text-xs opacity-80">Delivery calculated after checkout.</div>
                    <Link href="/checkout" className="mt-6 block rounded-full bg-primary-foreground py-3 text-center text-sm font-semibold text-primary">
                        Proceed to checkout
                    </Link>
                </aside>
            </div>
        </div>
    );
}
