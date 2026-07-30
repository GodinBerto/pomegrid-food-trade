import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/api/payments";

export const useInitializePayment = () => {
  return useMutation({
    mutationFn: paymentsApi.initializePayment,
  });
};

export const useVerifyPayment = (reference: string) => {
  return useQuery({
    queryKey: ["payment", reference],
    queryFn: async () => (await paymentsApi.verifyPayment(reference)).data,
    enabled: !!reference,
  });
};
