import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders";

export const usePlaceOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.placeOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useGetMyOrders = () => {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => (await ordersApi.getMyOrders()).data,
  });
};

export const useAdminListOrders = () => {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await ordersApi.adminListOrders()).data,
  });
};

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.adminUpdateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};
