"use client";

import Link from "@/components/no-prefetch-link";
import { useRouter } from "next/navigation";
import { useState, use, useEffect } from "react";
import { toast } from "sonner";
import {
  ShoppingBag,
  MessagesSquare,
  Minus,
  Plus,
  ArrowLeft,
  CheckCircle2,
  X,
} from "lucide-react";
import { resolveImageUrl } from "@/api/products";
import { useGetProductBySlug } from "@/query/products";
import { formatGHS, productPrice } from "@/lib/format";
import { useCart } from "@/hooks/use-cart";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: product, isLoading } = useGetProductBySlug(slug);
  const { add, isUpdating } = useCart();
  const router = useRouter();

  const [qty, setQty] = useState<number>(0);
  const [initialized, setInitialized] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (product && !initialized) {
      setQty(product.min_order_qty || 1);
      setInitialized(true);
    }
  }, [product, initialized]);

  useEffect(() => {
    setActive(0);
  }, [product?.id, product?.images?.length]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link
          href="/shop"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const gallery = (product.images ?? [])
    .map((image) => resolveImageUrl(image.image_url))
    .filter((url): url is string => Boolean(url));

  const waMsg = encodeURIComponent(
    `Hi Pomegrid, I'm interested in ${product.name} (${product.unit}). Please share availability.`,
  );
  const waUrl = `https://wa.me/?text=${waMsg}`;

  async function handleAdd() {
    try {
      await add({
        productId: product!.id,
        qty,
      });
      setShowModal(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="flex gap-4">
          {gallery.length > 1 && (
            <div className="flex flex-col gap-3">
              {gallery.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  onClick={() => setActive(index)}
                  className={`h-20 w-20 overflow-hidden rounded-2xl transition-opacity ${active === index ? "ring-2 ring-primary" : "opacity-60 hover:opacity-100"}`}
                >
                  <img
                    src={src}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          {gallery.length > 0 ? (
            <div className="flex-1 overflow-hidden rounded-3xl bg-muted">
              <img
                src={gallery[active] ?? gallery[0]}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden rounded-3xl bg-muted">
              <img
                src={resolveImageUrl(product.image_url)}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            </div>
          )}
        </div>

        <div>
          {product.categories?.name && (
            <div className="text-xs font-semibold uppercase tracking-wider text-secondary">
              {product.categories.name}
            </div>
          )}
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 text-3xl font-bold text-primary">
            {formatGHS(productPrice(product))}
          </div>
          <div className="text-sm text-muted-foreground">
            per {product.unit} · minimum order {product.min_order_qty}
          </div>

          {product.description && (
            <p className="mt-6 text-foreground/80">{product.description}</p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-muted p-1">
              <button
                onClick={() => setQty(Math.max(product.min_order_qty, qty - 1))}
                className="grid h-9 w-9 place-items-center rounded-full bg-background"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={product.min_order_qty}
                value={qty}
                onChange={(e) =>
                  setQty(
                    Math.max(
                      product.min_order_qty,
                      Number(e.target.value) || product.min_order_qty,
                    ),
                  )
                }
                className="w-14 bg-transparent text-center text-lg font-semibold"
              />
              <button
                onClick={() => setQty(qty + 1)}
                className="grid h-9 w-9 place-items-center rounded-full bg-background"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              {product.stock_qty} in stock
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleAdd}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <ShoppingBag className="h-4 w-4" />{" "}
              {isUpdating ? "Adding…" : "Add to cart"}
            </button>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground"
            >
              <MessagesSquare className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-background p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary-soft text-secondary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Added to your cart</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {qty} × {product.name} is now in your cart. Proceed to secure
              payment or continue shopping.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => router.push("/checkout")}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
              >
                Proceed to payment
              </button>
              <button
                onClick={() => router.push("/cart")}
                className="rounded-full bg-muted px-6 py-3 text-sm font-semibold"
              >
                View cart
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Continue shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
