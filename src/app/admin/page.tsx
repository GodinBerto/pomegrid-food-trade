"use client";

import Link from "next/link";
import { useAdminListOrders } from "@/query/orders";
import { useAdminListProducts } from "@/query/products";
import { useListProducts } from "@/query/products";
import { formatGHS } from "@/lib/format";

export default function AdminOverview() {
    const { data: orders = [] as any[] } = useAdminListOrders();
    const { data: products = [] as any[] } = useAdminListProducts();

    const revenue = orders.reduce((sum: number, order: { total_ghs?: number; total_price?: number }) => {
        return sum + Number(order.total_ghs ?? order.total_price ?? 0);
    }, 0);
    const pending = orders.filter((order: { status: string }) => order.status === "pending").length;

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Total revenue" value={formatGHS(revenue)} />
            <Stat label="Total orders" value={orders.length.toString()} />
            <Stat label="Pending orders" value={pending.toString()} tone="secondary" />
            <Stat label="Active products" value={products.filter((p: { is_active?: boolean }) => p.is_active).length.toString()} />

            <div className="col-span-full rounded-3xl bg-muted p-6">
                <h2 className="text-lg font-semibold">Recent orders</h2>
                <div className="mt-4 space-y-2">
                    {orders.slice(0, 5).map((o: any) => (
                        <div key={o.id} className="flex items-center justify-between rounded-2xl bg-background p-4 text-sm">
                            <div>
                                <div className="font-semibold">#{o.id.toString().slice(0, 8)}</div>
                                <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                            </div>
                            <div className="text-xs uppercase tracking-wide">{o.status}</div>
                            <div className="font-bold">{formatGHS(Number(o.total_ghs ?? o.total_price ?? 0))}</div>
                        </div>
                    ))}
                    {orders.length === 0 && <div className="text-sm text-muted-foreground">No orders yet.</div>}
                </div>
                <Link href="/admin/orders" className="mt-4 inline-block text-sm font-semibold text-primary">Manage orders →</Link>
            </div>
        </div>
    );
}

function Stat({ label, value, tone = "primary" }: { label: string; value: string; tone?: "primary" | "secondary" }) {
    const cls = tone === "secondary" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground";
    return (
        <div className={`rounded-3xl p-6 ${cls}`}>
            <div className="text-sm opacity-80">{label}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
        </div>
    );
}
