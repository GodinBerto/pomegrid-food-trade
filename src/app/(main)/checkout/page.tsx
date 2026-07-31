"use client";

import Link from "@/components/no-prefetch-link";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { formatGHS } from "@/lib/format";
import { Lock } from "lucide-react";
import { useInitializePayment } from "@/query/payments";
import { useUserStore } from "@/store/store";

export default function Checkout() {
  const { items, total, hydrated, isLoggedIn } = useCart();
  const { mutateAsync: initPaymentMut } = useInitializePayment();
  const { user } = useUserStore();

  const activeRegions = ["Greater Accra", "Ashanti", "Northern"];
  const regionList = activeRegions;

  const [phone, setPhone] = useState(user?.phone ?? "");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "standard">(
    "standard",
  );
  const [region, setRegion] = useState(
    user?.region ?? regionList[0] ?? "Greater Accra",
  );
  const [address, setAddress] = useState(user?.address ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!hydrated) {
    return <div className="mx-auto max-w-4xl px-4 py-14">Loading…</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Sign in to checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Your cart is linked to your account.
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
        <h1 className="text-2xl font-bold">Nothing to checkout</h1>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Browse products
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const orderPayload = {
        contact_phone: phone,
        delivery_region: region,
        delivery_address: deliveryType === "standard" ? address : "PICKUP",
        notes: `[${deliveryType === "pickup" ? "Pickup" : "Standard delivery"}] ${notes}`,
        items: items.map((item) => ({
          product_id: item.productId,
          qty: item.qty,
        })),
      };

      sessionStorage.setItem("pendingOrder", JSON.stringify(orderPayload));

      const amountInKobo = Math.round(total * 100);
      const res = await initPaymentMut({
        email: user?.email || "customer@pomegrid.com",
        amount: amountInKobo,
        callback_url: `${window.location.origin}/checkout/verify`,
      });

      if (res.data?.authorization_url) {
        toast.success("Redirecting to secure payment…");
        window.location.href = res.data.authorization_url;
      } else {
        throw new Error("Failed to initialize payment");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initialize payment",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <form
        onSubmit={onSubmit}
        className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-4 rounded-3xl bg-muted p-6">
          <h2 className="text-lg font-semibold">Delivery details</h2>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Phone number
            </label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-2xl bg-background px-4 py-3 text-sm"
              placeholder="+233…"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Delivery type
            </label>
            <select
              value={deliveryType}
              onChange={(e) =>
                setDeliveryType(e.target.value as "pickup" | "standard")
              }
              className="mt-1 w-full rounded-2xl bg-background px-4 py-3 text-sm"
            >
              <option value="standard">Standard delivery</option>
              <option value="pickup">Pickup</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              {deliveryType === "pickup"
                ? "Collect your order from our regional pickup point."
                : "We deliver to your address in the selected region."}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full rounded-2xl bg-background px-4 py-3 text-sm"
            >
              {regionList.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Only regions we currently serve are listed.
            </p>
          </div>

          {deliveryType === "standard" && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Delivery address
              </label>
              <input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-2xl bg-background px-4 py-3 text-sm"
                placeholder="Market, town, landmark"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-2xl bg-background px-4 py-3 text-sm"
              placeholder="Anything we should know?"
            />
          </div>
        </div>

        <aside className="h-fit rounded-3xl bg-primary p-6 text-primary-foreground">
          <div className="text-sm font-semibold opacity-80">Order summary</div>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.qty}
                </span>
                <span>{formatGHS(item.price_ghs * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-primary-foreground/20 pt-4 text-xl font-bold">
            Total: {formatGHS(total)}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary-foreground py-3 text-center text-sm font-semibold text-primary disabled:opacity-60"
          >
            <Lock className="h-4 w-4" />
            {loading ? "Processing…" : "Proceed to secure payment"}
          </button>
          <p className="mt-3 text-xs opacity-80">
            Your order is placed now. You'll be guided through secure payment
            and delivery next.
          </p>
        </aside>
      </form>
    </div>
  );
}
