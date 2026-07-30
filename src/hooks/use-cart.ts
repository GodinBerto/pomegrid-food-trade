import { useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  unit: string;
  pricGhs: number;
  qty: number;
  imageUrl?: string | null;
};

const KEY = "pomegrid_cart_v1";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("pomegrid-cart-change"));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(read());
    setHydrated(true);
    const handler = () => setItems(read());
    window.addEventListener("pomegrid-cart-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("pomegrid-cart-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const add = useCallback((item: CartItem) => {
    const current = read();
    const existing = current.find((i) => i.productId === item.productId);
    let next: CartItem[];
    if (existing) {
      next = current.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i));
    } else {
      next = [...current, item];
    }
    write(next);
    setItems(next);
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    const next = read().map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, qty) } : i));
    write(next);
    setItems(next);
  }, []);

  const remove = useCallback((productId: string) => {
    const next = read().filter((i) => i.productId !== productId);
    write(next);
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.pricGhs * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, add, setQty, remove, clear, total, count, hydrated };
}
