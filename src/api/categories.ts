import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export const categoriesApi = {
  listCategories: () => 
    apiRequest<ApiResponse>("categories", "GET"),
  
  // Admin Endpoints
  adminListCategories: () => 
    apiRequest<ApiResponse>("admin/categories", "GET"),
};
