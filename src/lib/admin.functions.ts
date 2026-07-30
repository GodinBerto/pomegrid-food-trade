import { adminApi } from "@/api/admin";
import { productsApi } from "@/api/products";
import { ordersApi } from "@/api/orders";
import { categoriesApi } from "@/api/categories";

export const isCurrentUserAdmin = async () => {
  const res = await adminApi.isAdminCheck();
  return { isAdmin: res.data?.isAdmin || false };
};

export type AdminProduct = {
  id: string; name: string; slug: string; description: string | null;
  price_ghs: number; unit: string; min_order_qty: number; stock_qty: number;
  is_active: boolean; category_id: string | null;
};

export const adminListProducts = async (): Promise<AdminProduct[]> => {
  const res = await productsApi.adminListProducts();
  return (res.data ?? []) as AdminProduct[];
};

export const adminUpsertProduct = async (input: { data: any }) => {
  const res = await productsApi.adminUpsertProduct(input.data);
  return res.data;
};

export const adminDeleteProduct = async (input: { data: { id: number } }) => {
  const res = await productsApi.adminDeleteProduct(input.data.id);
  return res.data;
};

export type AdminOrder = {
  id: string; user_id: string; status: string; total_ghs: number;
  contact_phone: string | null; delivery_region: string | null; delivery_address: string | null;
  notes: string | null; created_at: string;
  order_items: Array<{ id: string; product_name: string; qty: number; unit_price_ghs: number }>;
};

export const adminListOrders = async (): Promise<AdminOrder[]> => {
  const res = await ordersApi.adminListOrders();
  return (res.data ?? []) as AdminOrder[];
};

export const adminUpdateOrderStatus = async (input: { data: { id: number; status: string } }) => {
  const res = await ordersApi.adminUpdateOrderStatus(input.data);
  return res.data;
};

export type AdminWhatsapp = { id: string; region: string; invite_url: string | null; description: string | null; is_active: boolean; sort_order: number };

export const adminListWhatsapp = async (): Promise<AdminWhatsapp[]> => {
  return [];
};

export const adminUpdateWhatsapp = async (input: { data: any }) => {
  return { ok: true };
};

export const adminListCategories = async () => {
  const res = await categoriesApi.adminListCategories();
  return res.data ?? [];
};
