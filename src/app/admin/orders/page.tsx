"use client";

import { useAdminListOrders, useAdminUpdateOrderStatus } from "@/query/orders";
import { formatGHS } from "@/lib/format";
import { toast } from "sonner";
import type { UserOrder, OrderItem } from "@/api/orders";

const STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default function AdminOrders() {
  const { data: orders = [], isLoading } = useAdminListOrders();
  const { mutateAsync: updateOrder } = useAdminUpdateOrderStatus();

  if (isLoading) return <div>Loading orders...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold">Orders ({orders.length})</h2>
      <div className="mt-6 space-y-3">
        {orders.map((o: UserOrder) => (
          <div key={o.id} className="rounded-3xl bg-muted p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">
                  Order #{o.id.toString().slice(0, 8)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString()}
                </div>
              </div>
              <select
                value={o.status}
                onChange={async (e) => {
                  try {
                    await updateOrder({
                      id: o.id,
                      status: e.target.value,
                    });
                    toast.success("Updated");
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Failed to update",
                    );
                  }
                }}
                className="rounded-full bg-background px-4 py-2 text-sm font-semibold"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 grid gap-1 text-sm">
              {o.order_items?.map((it: OrderItem) => (
                <div key={it.id} className="flex justify-between">
                  <span>
                    {it.product_name} × {it.qty}
                  </span>
                  <span>{formatGHS(Number(it.unit_price) * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-input pt-3 text-sm">
              <div className="text-muted-foreground">
                {o.delivery_region ?? "—"} · {o.contact_phone ?? "no phone"}
                {o.delivery_address ? <> · {o.delivery_address}</> : null}
              </div>
              <div className="font-bold">
                {formatGHS(Number(o.total_price ?? o.total_ghs ?? 0))}
              </div>
            </div>
            {o.notes && (
              <div className="mt-2 rounded-2xl bg-background p-3 text-sm">
                📝 {o.notes}
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="rounded-3xl bg-muted p-10 text-center text-muted-foreground">
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
