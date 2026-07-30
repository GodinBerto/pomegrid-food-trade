"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { useAdminListProducts, useAdminUpsertProduct, useAdminDeleteProduct } from "@/query/products";
import { useListCategories } from "@/query/categories";
import { formatGHS } from "@/lib/format";

export default function AdminProducts() {
    const { data: products = [] as any[], isLoading: isLoadingProducts } = useAdminListProducts();
    const { data: cats = [] as any[], isLoading: isLoadingCats } = useListCategories();
    
    const { mutateAsync: upsertMut, isPending: isUpserting } = useAdminUpsertProduct();
    const { mutateAsync: deleteMut, isPending: isDeleting } = useAdminDeleteProduct();

    const [editing, setEditing] = useState<any | null>(null);

    if (isLoadingProducts || isLoadingCats) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Products ({products.length})</h2>
                <button
                    onClick={() => setEditing({ name: "", slug: "", price: 0, unit: "bag", min_order_qty: 1, stock_qty: 0, is_active: true, category_id: cats[0]?.id ?? null })}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                    <Plus className="h-4 w-4" /> New product
                </button>
            </div>

            <div className="mt-6 space-y-2">
                {products.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-4 rounded-2xl bg-muted p-4">
                        <div className="flex-1">
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-xs text-muted-foreground">{p.slug} · per {p.unit}</div>
                        </div>
                        <div className="text-sm font-bold">{formatGHS(Number(p.price))}</div>
                        <span className={p.is_active ? "rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary" : "rounded-full bg-background px-3 py-1 text-xs text-muted-foreground"}>
                            {p.is_active ? "Active" : "Hidden"}
                        </span>
                        <button onClick={() => setEditing(p)} className="rounded-full bg-background px-4 py-1.5 text-sm font-medium">Edit</button>
                        <button onClick={async () => {
                            if (confirm("Delete this product?")) {
                                try {
                                    await deleteMut(p.id.toString());
                                    toast.success("Deleted");
                                } catch (e: any) {
                                    toast.error(e.message);
                                }
                            }
                        }} className="grid h-9 w-9 place-items-center rounded-full bg-background text-destructive disabled:opacity-50" disabled={isDeleting}><Trash2 className="h-4 w-4" /></button>
                    </div>
                ))}
            </div>

            {editing && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-background p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">{editing.id ? "Edit product" : "New product"}</h3>
                            <button onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-4 grid gap-3">
                            <input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Name" className="rounded-2xl bg-muted px-4 py-3 text-sm" />
                            <input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="slug-like-this" className="rounded-2xl bg-muted px-4 py-3 text-sm" />
                            <select value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })} className="rounded-2xl bg-muted px-4 py-3 text-sm">
                                <option value="">— No category —</option>
                                {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description" rows={3} className="rounded-2xl bg-muted px-4 py-3 text-sm" />
                            <div className="grid grid-cols-2 gap-3">
                                <label className="text-xs">Price (GHS)
                                    <input type="number" step="0.01" value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm" />
                                </label>
                                <label className="text-xs">Unit
                                    <input value={editing.unit ?? ""} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm" />
                                </label>
                                <label className="text-xs">Min order
                                    <input type="number" value={editing.min_order_qty ?? 1} onChange={(e) => setEditing({ ...editing, min_order_qty: Number(e.target.value) })} className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm" />
                                </label>
                                <label className="text-xs">Stock
                                    <input type="number" value={editing.stock_qty ?? 0} onChange={(e) => setEditing({ ...editing, stock_qty: Number(e.target.value) })} className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm" />
                                </label>
                            </div>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> Active (visible in shop)
                            </label>
                            <button
                                disabled={isUpserting}
                                onClick={async () => {
                                    if (!editing.name || !editing.slug) { toast.error("Name and slug are required"); return; }
                                    try {
                                        await upsertMut({
                                            id: editing.id?.toString(),
                                            name: editing.name,
                                            slug: editing.slug,
                                            description: editing.description ?? "",
                                            price: Number(editing.price ?? 0),
                                            unit: editing.unit || "bag",
                                            min_order_qty: Number(editing.min_order_qty ?? 1),
                                            stock_qty: Number(editing.stock_qty ?? 0),
                                            is_active: !!editing.is_active,
                                            category_id: editing.category_id?.toString() ?? null,
                                        });
                                        toast.success("Product saved");
                                        setEditing(null);
                                    } catch (e: any) {
                                        toast.error(e.message);
                                    }
                                }}
                                className="rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                            >
                                {isUpserting ? "Saving…" : "Save product"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
