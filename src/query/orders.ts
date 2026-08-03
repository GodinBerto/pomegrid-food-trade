import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type UserOrder } from "@/api/orders";
import { CART_QUERY_KEY } from "@/query/cart";
import { useUserStore } from "@/store/store";

export const MY_ORDERS_QUERY_KEY = ["my-orders"];

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useGetMyOrders = () => {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);

  return useQuery<UserOrder[]>({
    queryKey: MY_ORDERS_QUERY_KEY,
    queryFn: async () => (await ordersApi.getMyOrders()).data ?? [],
    enabled: isLoggedIn,
  });
};

export const useAdminListOrders = () => {
  return useQuery<UserOrder[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => (await ordersApi.adminListOrders()).data as UserOrder[],
  });
};

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.adminUpdateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: MY_ORDERS_QUERY_KEY });
    },
  });
};
