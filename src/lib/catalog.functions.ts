import { categoriesApi } from "@/api/categories";
import { productsApi } from "@/api/products";

export type Category = { id: string; name: string; slug: string; sort_order: number };
export type Product = {
  id: string; name: string; slug: string; description: string | null;
  price_ghs: number; unit: string; min_order_qty: number; stock_qty: number;
  image_url: string | null; category_id: string | null;
  categories: { slug: string; name: string } | null;
};
export type WhatsappGroup = { id: string; region: string; invite_url: string | null; description: string | null; sort_order: number };

export const listCategories = async (): Promise<Category[]> => {
  const res = await categoriesApi.listCategories();
  return (res.data ?? []) as Category[];
};

export const listProducts = async (input?: { data?: { category?: string; q?: string } }): Promise<Product[]> => {
  const params = input?.data || {};
  const res = await productsApi.listProducts(params);
  return (res.data ?? []) as Product[];
};

export const getProductBySlug = async (input: { data: { slug: string } }): Promise<Product | null> => {
  const res = await productsApi.getProductBySlug(input.data.slug);
  return (res.data ?? null) as Product | null;
};

export const listWhatsappGroups = async (): Promise<WhatsappGroup[]> => {
  // Mock or wait for Whatsapp endpoint
  return [];
};
