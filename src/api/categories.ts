import { apiRequest } from "@/lib/apiClient";
import { ApiResponse } from "./products";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  image_url?: string | null;
  is_active?: number | boolean;
};

export type CategoryInput = {
  name: string;
  slug: string;
  sort_order?: number;
  image_url?: string | null;
  is_active?: number | boolean;
};

export type CategoryUpdateInput = {
  name?: string;
  slug?: string;
  sort_order?: number;
  image_url?: string | null;
  is_active?: number | boolean;
};

export const categoriesApi = {
  listCategories: () =>
    apiRequest<ApiResponse<Category[]>>("food_trade/categories", "GET"),

  adminListCategories: () =>
    apiRequest<ApiResponse<Category[]>>("food_trade/admin/categories", "GET"),
  adminGetCategory: (categoryId: number) =>
    apiRequest<ApiResponse<Category>>(
      `food_trade/admin/categories/${categoryId}`,
      "GET",
    ),
  adminCreateCategory: (data: CategoryInput) =>
    apiRequest<ApiResponse<{ id: number }>>(
      "food_trade/admin/categories",
      "POST",
      data,
    ),
  adminUpdateCategory: (categoryId: number, data: CategoryUpdateInput) =>
    apiRequest<ApiResponse>(
      `food_trade/admin/categories/${categoryId}`,
      "PUT",
      data,
    ),
  adminDeleteCategory: (categoryId: number) =>
    apiRequest<ApiResponse>(
      `food_trade/admin/categories/${categoryId}`,
      "DELETE",
    ),
};
