import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export const categoriesApi = {
  listCategories: () =>
    apiRequest<ApiResponse>("food_trade/categories", "GET"),

  // Admin Endpoints
  adminListCategories: () =>
    apiRequest<ApiResponse>("food_trade/admin/categories", "GET"),
};
