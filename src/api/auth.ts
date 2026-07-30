import { apiRequest } from "@/lib/apiClient";

export interface AuthResponse {
  status: string;
  message: string;
  data: any;
}

export const authApi = {
  login: (data: any) => apiRequest<AuthResponse>("auth/login", "POST", data),
  logout: () => apiRequest<AuthResponse>("auth/logout", "POST"),
  getMe: () => apiRequest<AuthResponse>("auth/me", "GET"),
  verifyUser: () => apiRequest<AuthResponse>("food-trader/verify-user", "GET"),
  register: (data: any) => apiRequest<AuthResponse>("auth/register", "POST", data),
};
