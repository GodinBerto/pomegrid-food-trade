"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { paymentsApi } from "@/api/payments";
import { usePlaceOrder } from "@/query/orders";
import { useCart } from "@/hooks/use-cart";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function VerifyPaymentPage() {
  const router = useRouter();
  const { mutateAsync: placeOrderMut } = usePlaceOrder();
  const { clear } = useCart();

  const [status, setStatus] = useState<
    "verifying" | "placing_order" | "success" | "error"
  >("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams("");
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setStatus("error");
      setErrorMessage("No payment reference found.");
      return;
    }

    async function processPayment() {
      try {
        // 1. Verify Payment
        setStatus("verifying");
        const res = await paymentsApi.verifyPayment(reference as string);

        const responseSuccess = res.ok ?? res.success;
        if (!responseSuccess) {
          throw new Error(res.message || "Payment verification failed");
        }

        const paymentData = res.data;
        const paymentStatus = String(
          paymentData?.status ??
            paymentData?.gateway_payload?.status ??
            (paymentData?.success ? "success" : ""),
        ).toLowerCase();

        if (paymentStatus !== "success") {
          const statusLabel =
            paymentData?.status ??
            paymentData?.gateway_payload?.status ??
            "unknown";
          const fallbackMessage =
            paymentData?.message ??
            paymentData?.gateway_payload?.gateway_response ??
            "Payment verification did not return a successful status.";
          throw new Error(
            `Payment is not successful yet. Status: ${statusLabel}. ${fallbackMessage}`,
          );
        }

        // 2. Place the order
        setStatus("placing_order");
        const savedOrder = sessionStorage.getItem("pendingOrder");
        if (!savedOrder) {
          throw new Error(
            "Order details not found. Please contact support if you were charged.",
          );
        }

        const orderPayload = JSON.parse(savedOrder);
        // Optionally inject payment reference into the order payload if backend needs it
        orderPayload.payment_reference = reference;

        await placeOrderMut(orderPayload);

        // 3. Success
        sessionStorage.removeItem("pendingOrder");
        clear();
        setStatus("success");
        toast.success("Payment successful and order placed!");

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/orders");
        }, 2000);
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred");
        toast.error(err.message || "Verification failed");
      }
    }

    processPayment();
  }, [placeOrderMut, clear, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      {status === "verifying" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h1 className="text-xl font-bold">Verifying your payment...</h1>
          <p className="text-sm text-muted-foreground">
            Please don't close this window.
          </p>
        </div>
      )}

      {status === "placing_order" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <h1 className="text-xl font-bold">Creating your order...</h1>
          <p className="text-sm text-muted-foreground">Just a moment...</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-green-600">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">Redirecting to your orders...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-red-600">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <div className="mt-4 flex gap-4">
            <Link
              href="/checkout"
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground"
            >
              Try Again
            </Link>
            <Link
              href="/contact"
              className="rounded-full bg-secondary px-6 py-2 text-sm font-semibold text-secondary-foreground"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
