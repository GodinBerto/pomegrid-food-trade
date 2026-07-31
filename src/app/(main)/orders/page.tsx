"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetMyOrders } from "@/query/orders";
import { formatGHS } from "@/lib/format";
import { logoutUser } from "@/lib/auth";
import { useUserStore } from "@/store/store";
import { toast } from "sonner";

export default function OrdersPage() {
    const { data: orders = [], isLoading, isError, error } = useGetMyOrders();
    const { isLoggedIn } = useUserStore();
    const router = useRouter();

    async function signOut() {
        await logoutUser();
        toast.success("Signed out");
        router.push("/");
    }

    if (!isLoggedIn) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-20 text-center">
                <h1 className="text-2xl font-bold">Sign in to view your orders</h1>
                <p className="mt-2 text-muted-foreground">Track your wholesale orders after signing in.</p>
                <Link href="/auth" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                    Sign in
                </Link>
            </div>
        );
    }

    if (isLoading) {
        return <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">Loading orders...</div>;
    }

    if (isError) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
                <h1 className="text-3xl font-bold">My orders</h1>
                <div className="mt-8 rounded-3xl bg-muted p-10 text-center">
                    <p className="text-muted-foreground">
                        {error instanceof Error ? error.message : "Could not load your orders."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">My orders</h1>
                <button onClick={signOut} className="rounded-full bg-muted px-4 py-2 text-sm font-medium">Sign out</button>
            </div>

            {orders.length === 0 ? (
                <div className="mt-10 rounded-3xl bg-muted p-10 text-center">
                    <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                    <Link href="/shop" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground">Start shopping</Link>
                </div>
            ) : (
                <div className="mt-8 space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="rounded-3xl bg-muted p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <div className="text-xs text-muted-foreground">Order #{String(order.id).slice(0, 8)}</div>
                                    <div className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</div>
                                </div>
                                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                    {order.status}
                                </span>
                            </div>
                            <div className="mt-4 space-y-1 text-sm">
                                {(order.order_items ?? []).map((item) => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>{item.product_name} × {item.qty}</span>
                                        <span>{formatGHS(Number(item.unit_price_ghs) * item.qty)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-input pt-3">
                                <span className="text-sm text-muted-foreground">Delivery: {order.delivery_region ?? "—"}</span>
                                <span className="font-bold text-primary">{formatGHS(Number(order.total_ghs))}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
