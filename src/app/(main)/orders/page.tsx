"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetMyOrders } from "@/query/orders";
import { formatGHS } from "@/lib/format";
import { toast } from "sonner";
import { useUserStore } from "@/store/store";

export default function OrdersPage() {
    const { data: orders = [] as any[], isLoading } = useGetMyOrders();
    const router = useRouter();
    const { logout } = useUserStore();

    async function signOut() {
        logout();
        toast.success("Signed out");
        router.push("/");
    }

    if (isLoading) {
        return <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">Loading orders...</div>;
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
                    {orders.map((o: any) => (
                        <div key={o.id} className="rounded-3xl bg-muted p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <div className="text-xs text-muted-foreground">Order #{o.id.toString().slice(0, 8)}</div>
                                    <div className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                                </div>
                                <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                    {o.status}
                                </span>
                            </div>
                            <div className="mt-4 space-y-1 text-sm">
                                {(o.order_items || [] as any[]).map((it: any) => (
                                    <div key={it.id} className="flex justify-between">
                                        <span>{it.product_name} × {it.qty}</span>
                                        <span>{formatGHS(Number(it.unit_price) * it.qty)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-center justify-between border-t border-input pt-3">
                                <span className="text-sm text-muted-foreground">Delivery: {o.delivery_region ?? "—"}</span>
                                <span className="font-bold text-primary">{formatGHS(Number(o.total_price))}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
