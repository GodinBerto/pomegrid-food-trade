"use client";

import Link from "@/components/no-prefetch-link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useListCategories } from "@/query/categories";
import { useListProducts } from "@/query/products";
import { formatGHS, productPrice } from "@/lib/format";
import { Search } from "lucide-react";
import { resolveImageUrl, type ProductListItem } from "@/api/products";

type CategoryItem = {
  id: string | number;
  name: string;
  slug: string;
};

export default function ShopClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || undefined;
  const [term, setTerm] = useState(searchParams.get("q") || "");
  const { data: categories = [] as CategoryItem[] } = useListCategories();
  const { data: products = [] as ProductListItem[] } = useListProducts({
    category,
  });

  const filteredProducts = products.filter((p) => {
    if (term && !p.name.toLowerCase().includes(term.toLowerCase()))
      return false;
    return true;
  });

  const buildShopUrl = (nextCategory?: string, nextTerm?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    if (nextTerm) {
      params.set("q", nextTerm);
    } else {
      params.delete("q");
    }

    const query = params.toString();
    return `/shop${query ? `?${query}` : ""}`;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildShopUrl(category, term), { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="text-3xl font-bold sm:text-4xl">Wholesale farm produce</h1>
      <p className="mt-2 text-muted-foreground">
        All categories except fish. For fish, visit aqua.pomegrid.com.
      </p>

      <form
        onSubmit={handleSearch}
        className="mt-6 flex items-center gap-2 rounded-full bg-muted px-4 py-2"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search products..."
          className="flex-1 bg-transparent py-1.5 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          Search
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={buildShopUrl(undefined, term)} className={pill(!category)}>
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={buildShopUrl(c.slug, term)}
            className={pill(category === c.slug)}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((p) => (
          <Link
            key={p.id}
            href={`/products/${p.slug}`}
            className="group flex flex-col overflow-hidden rounded-3xl bg-background ring-1 ring-black/4 transition-all hover:-translate-y-1"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img
                src={resolveImageUrl(p.image_url)}
                alt={p.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute left-3 top-3 rounded-full bg-background/95 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary backdrop-blur">
                {p.categories?.name ?? "Produce"}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <div className="text-sm font-bold leading-snug line-clamp-2">
                {p.name}
              </div>
              <div className="text-xs text-muted-foreground">
                per {p.unit ?? "unit"}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div className="text-lg font-extrabold text-primary">
                  {formatGHS(productPrice(p))}
                </div>
                <div className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  View →
                </div>
              </div>
            </div>
          </Link>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full rounded-3xl bg-muted p-10 text-center text-sm text-muted-foreground">
            No products match your search.
          </div>
        )}
      </div>
    </div>
  );
}

function pill(active: boolean) {
  return active
    ? "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
    : "rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground/80 hover:bg-primary-soft";
}
