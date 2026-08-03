"use client";

import Link from "@/components/no-prefetch-link";
import { ArrowRight, ShieldCheck, Truck, MessagesSquare } from "lucide-react";
import { useListCategories } from "@/query/categories";
import { useListWeeklyProducts } from "@/query/products";
import { categoryImage, formatGHS, productImage } from "@/lib/format";
import { ProductItem } from "./shop/page";

export default function Home() {
  const { data: categories = [] as any[] } = useListCategories();
  const { data: weeklyProducts = [] as any[] } = useListWeeklyProducts();
  const featured = weeklyProducts.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="/images/bgs/hero.jpg"
          alt="Fresh Ghanaian farm produce"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-black/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-primary-foreground lg:px-8 lg:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              Pomegrid Food Trade
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Wholesale farm produce, sourced across Ghana.
            </h1>
            <p className="mt-5 max-w-xl text-base opacity-95 sm:text-lg">
              Yam, cassava, tomatoes, pepper, grains and more — bought in bulk,
              ready for resellers, restaurants and markets.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary"
              >
                Browse products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/whatsapp"
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground"
              >
                <MessagesSquare className="h-4 w-4" /> Join WhatsApp group
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Truck,
              title: "Bulk delivery",
              body: "Sourced directly from farmers across all 16 regions of Ghana.",
            },
            {
              icon: ShieldCheck,
              title: "Quality graded",
              body: "Every bag, crate and drum is sorted and graded before dispatch.",
            },
            {
              icon: MessagesSquare,
              title: "Live pricing",
              body: "Join a regional WhatsApp group for daily price updates.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-3xl bg-muted p-6">
              <f.icon className="h-6 w-6 text-primary" />
              <div className="mt-4 text-lg font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Weekly Products</h2>
          <Link href="/shop" className="text-sm font-semibold text-primary">
            Browse all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p: ProductItem) => (
            <Link
              key={p.id}
              href={`/products/${p.slug}`}
              className="group flex flex-col overflow-hidden rounded-3xl bg-background ring-1 ring-black/4 transition-all hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                  src={productImage(p)}
                  alt={p.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <div className="text-sm font-bold leading-snug line-clamp-2">
                  {p.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  per {p.unit}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="text-lg font-extrabold text-primary">
                    {formatGHS(Number(p.price))}
                  </div>
                  <div className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    View →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Shop by category</h2>
          <Link href="/shop" className="text-sm font-semibold text-primary">
            See all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c: any) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="group relative block aspect-4/5 overflow-hidden rounded-3xl transition-transform hover:-translate-y-1"
            >
              <img
                src={categoryImage(c.image_url)}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <div className="text-[10px] font-semibold uppercase tracking-widest opacity-80">
                  Category
                </div>
                <div className="mt-1 text-lg font-bold leading-tight">
                  {c.name}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold opacity-90">
                  Shop now <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 lg:px-8">
        <div className="rounded-3xl bg-secondary p-10 text-secondary-foreground lg:p-14">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Trade with your region
              </h2>
              <p className="mt-2 opacity-90">
                Join the Pomegrid WhatsApp group for your region and get daily
                updates on supply, price and delivery.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <Link
                href="/whatsapp"
                className="rounded-full bg-secondary-foreground px-6 py-3 text-sm font-semibold text-secondary"
              >
                Pick your region
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
