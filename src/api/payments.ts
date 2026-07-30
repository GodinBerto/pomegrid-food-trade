import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export const paymentsApi = {
  initializePayment: (data: any) =>
    apiRequest<ApiResponse>("food_trade/payments/initialize", "POST", data),
  verifyPayment: (reference: string) =>
    apiRequest<ApiResponse>(`food_trade/payments/verify/${reference}`, "GET"),
};
