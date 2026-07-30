import { ordersApi } from "@/api/orders";

export const placeOrder = async (input: { data: any }) => {
  const res = await ordersApi.placeOrder(input.data);
  return res.data;
};

export type MyOrder = {
  id: string; status: string; total_ghs: number; created_at: string; delivery_region: string | null;
  order_items: Array<{ id: string; product_name: string; qty: number; unit_price_ghs: number }>;
};

export const getMyOrders = async (): Promise<MyOrder[]> => {
  const res = await ordersApi.getMyOrders();
  return (res.data ?? []) as MyOrder[];
};
