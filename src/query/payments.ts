import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentsApi, type PaymentVerificationResponse } from "@/api/payments";

export const useInitializePayment = () => {
  return useMutation({
    mutationFn: paymentsApi.initializePayment,
  });
};

export const useVerifyPayment = (reference: string) => {
  return useQuery<PaymentVerificationResponse | undefined>({
    queryKey: ["payment", reference],
    queryFn: async () => (await paymentsApi.verifyPayment(reference)).data,
    enabled: !!reference,
  });
};
