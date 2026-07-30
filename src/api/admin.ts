import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export const adminApi = {
  isAdminCheck: () => 
    apiRequest<ApiResponse<{ isAdmin: boolean }>>("admin/is-admin", "GET"),
};
