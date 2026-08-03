import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export type PaymentInitializeResponse = {
  authorization_url?: string;
};

export type PaymentVerificationResponse = {
  status?: string;
  gateway_payload?: {
    status?: string;
    gateway_response?: string;
  };
  success?: boolean;
  message?: string;
};

export const paymentsApi = {
  initializePayment: (data: unknown) =>
    apiRequest<ApiResponse<PaymentInitializeResponse>>(
      "food_trade/payments/initialize",
      "POST",
      data,
    ),
  verifyPayment: (reference: string) =>
    apiRequest<ApiResponse<PaymentVerificationResponse>>(
      `food_trade/payments/verify/${reference}`,
      "GET",
    ),
};
