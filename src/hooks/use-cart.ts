"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CartItem } from "@/api/cart";
import {
  useAddToCart,
  useClearCart,
  useGetCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/query/cart";
import { useUserStore } from "@/store/store";

export type { CartItem };

export function useCart() {
  const router = useRouter();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const { data: items = [], isFetched, isLoading } = useGetCart({ enabled: isLoggedIn });

  const addMut = useAddToCart();
  const updateMut = useUpdateCartItem();
  const removeMut = useRemoveCartItem();
  const clearMut = useClearCart();

  const add = useCallback(
    async (item: { productId: string | number; qty: number }) => {
      if (!isLoggedIn) {
        toast.error("Please sign in to add items to your cart");
        router.push("/auth");
        return;
      }

      await addMut.mutateAsync({
        product_id: item.productId,
        quantity: item.qty,
      });
    },
    [addMut, isLoggedIn, router],
  );

  const setQty = useCallback(
    async (cartItemId: number, qty: number) => {
      if (qty < 1) return;
      await updateMut.mutateAsync({ itemId: cartItemId, quantity: qty });
    },
    [updateMut],
  );

  const remove = useCallback(
    async (cartItemId: number) => {
      await removeMut.mutateAsync(cartItemId);
    },
    [removeMut],
  );

  const clear = useCallback(async () => {
    await clearMut.mutateAsync();
  }, [clearMut]);

  const total = items.reduce((sum, item) => sum + item.pricGhs * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const hydrated = !isLoggedIn || isFetched;
  const isUpdating =
    addMut.isPending ||
    updateMut.isPending ||
    removeMut.isPending ||
    clearMut.isPending;

  return {
    items,
    add,
    setQty,
    remove,
    clear,
    total,
    count,
    hydrated,
    isLoading,
    isUpdating,
    isLoggedIn,
  };
}
