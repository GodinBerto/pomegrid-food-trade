"use client";

import { useEffect, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, ImagePlus, Sparkles } from "lucide-react";
import {
  productsApi,
  resolveImageUrl,
  type AdminProduct,
  type WeeklyProduct,
} from "@/api/products";
import {
  useAdminDeleteProduct,
  useAdminListProducts,
  useAdminUpsertProduct,
  useCreateWeeklyProduct,
  useDeleteWeeklyProduct,
  useListWeeklyProducts,
} from "@/query/products";
import { useAdminListCategories } from "@/query/categories";
import { formatGHS, productImage, productPrice } from "@/lib/format";
import { uploadProductImageToCloudinary } from "@/lib/cloudinary";

type ProductForm = {
  id?: number | string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  unit: string;
  min_order_qty: number;
  stock_qty: number;
  is_active: boolean;
  category_id?: string | number | null;
  image_url?: string | null;
};

const emptyProduct = (categoryId?: string | number | null): ProductForm => ({
  name: "",
  slug: "",
  description: "",
  price: 0,
  unit: "bag",
  min_order_qty: 1,
  stock_qty: 0,
  is_active: true,
  category_id: categoryId ?? null,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminProducts() {
  const { data: products = [], isLoading: isLoadingProducts } =
    useAdminListProducts();
  const { data: cats = [], isLoading: isLoadingCats } =
    useAdminListCategories();

  const { mutateAsync: upsertMut, isPending: isUpserting } =
    useAdminUpsertProduct();
  const { mutateAsync: deleteMut, isPending: isDeleting } =
    useAdminDeleteProduct();

  const [editing, setEditing] = useState<ProductForm | null>(null);
  const [imageItems, setImageItems] = useState<
    Array<{
      id?: number;
      image_url: string;
      file?: File;
      previewUrl?: string;
    }>
  >([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const { data: weeklyProducts = [] as WeeklyProduct[] } =
    useListWeeklyProducts();
  const { mutateAsync: createWeeklyMut, isPending: isCreatingWeekly } =
    useCreateWeeklyProduct();
  const { mutateAsync: deleteWeeklyMut } = useDeleteWeeklyProduct();

  const saving = isUpserting || isUploadingImages || isCreatingWeekly;

  useEffect(() => {
    return () => {
      imageItems.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [imageItems]);

  function resetImages() {
    imageItems.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setImageItems([]);
  }

  function closeEditor() {
    resetImages();
    setEditing(null);
  }

  function openCreate() {
    resetImages();
    setEditing(emptyProduct(cats[0]?.id));
  }

  async function handleSetWeeklyProduct(product: AdminProduct) {
    if (!product?.name) return;

    const requestName = product.name.toLowerCase();
    const existingWeekly = weeklyProducts.find(
      (wp: WeeklyProduct) => wp.name?.toLowerCase() === requestName,
    );

    if (existingWeekly?.id) {
      try {
        await deleteWeeklyMut(existingWeekly.id);
        toast.success("Weekly product removed.");
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to remove weekly product",
        );
      }
      return;
    }

    try {
      await createWeeklyMut({
        name: product.name,
        description: product.description ?? "",
        price: Number(productPrice(product)),
        image_url: product.image_url ?? productImage(product),
        status: "active",
        category_id: product.category_id,
      });
      toast.success("Product marked as weekly product.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to mark weekly product",
      );
    }
  }

  async function openEdit(product: AdminProduct) {
    resetImages();
    setEditing({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: productPrice(product),
      unit: product.unit ?? "bag",
      min_order_qty: Number(product.min_order_qty ?? 1),
      stock_qty: Number(product.stock_qty ?? 0),
      is_active: !!product.is_active,
      category_id: product.category_id ?? null,
      image_url: product.image_url ?? null,
    });

    setLoadingImages(true);
    try {
      if (product.id === undefined || product.id === null) {
        setImageItems([]);
        setLoadingImages(false);
        return;
      }

      const res = await productsApi.getProductImages(product.id);
      const loaded = res.data ?? [];
      if (loaded.length > 0) {
        setImageItems(
          loaded.map((image) => ({
            id: image.id,
            image_url: image.image_url,
          })),
        );
      } else if (product.image_url) {
        setImageItems([
          {
            id: 0,
            image_url: product.image_url,
          },
        ]);
      } else {
        setImageItems([]);
      }
    } catch {
      setImageItems(
        product.image_url
          ? [
              {
                id: 0,
                image_url: product.image_url,
              },
            ]
          : [],
      );
    } finally {
      setLoadingImages(false);
    }
  }

  function handleImageSelect(files: FileList | null) {
    if (!files?.length) return;

    const selected = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!selected.length) {
      toast.error("Please choose image files only");
      return;
    }

    const newItems = selected.map((file) => ({
      file,
      image_url: "",
      previewUrl: URL.createObjectURL(file),
    }));

    setImageItems((current) => [...current, ...newItems]);
  }

  function removeImage(index: number) {
    setImageItems((current) => {
      const item = current[index];
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return current.filter((_, i) => i !== index);
    });
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    setImageItems((current) => {
      const next = [...current];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    const hasImages = imageItems.length > 0 || Boolean(editing.image_url);
    if (!editing.id && !hasImages) {
      toast.error("Add at least one product image");
      return;
    }
    if (editing.id && !hasImages) {
      toast.error("Keep or add at least one product image");
      return;
    }

    try {
      setIsUploadingImages(true);
      const uploadedUrls = await Promise.all(
        imageItems.map(async (item) => {
          if (item.file) {
            return uploadProductImageToCloudinary(item.file);
          }
          return item.image_url;
        }),
      );
      const imageUrls = uploadedUrls.filter(Boolean) as string[];

      const payload = {
        id: editing.id,
        name: editing.name.trim(),
        slug: editing.slug.trim(),
        description: editing.description ?? "",
        price_ghs: Number(editing.price ?? 0),
        unit: editing.unit || "bag",
        min_order_qty: Number(editing.min_order_qty ?? 1),
        stock_qty: Number(editing.stock_qty ?? 0),
        is_active: editing.is_active ? 1 : 0,
        category_id: editing.category_id ?? null,
      };

      if (imageUrls.length > 0) {
        await upsertMut({
          ...payload,
          image_url: imageUrls[0],
          images: imageUrls,
        });
      } else {
        await upsertMut(payload);
      }
      toast.success("Product saved");
      closeEditor();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save product",
      );
    } finally {
      setIsUploadingImages(false);
    }
  }

  if (isLoadingProducts || isLoadingCats) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products ({products.length})</h2>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New product
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {products.map((product: AdminProduct) => (
          <div
            key={product.id}
            className="flex items-center gap-4 rounded-2xl bg-muted p-4"
          >
            <div className="h-14 w-14 overflow-hidden rounded-xl bg-background">
              <img
                src={productImage(product)}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{product.name}</div>
              <div className="text-xs text-muted-foreground">
                {product.slug} · per {product.unit}
              </div>
            </div>
            <div className="text-sm font-bold">
              {formatGHS(productPrice(product))}
            </div>
            <span
              className={
                product.is_active
                  ? "rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary"
                  : "rounded-full bg-background px-3 py-1 text-xs text-muted-foreground"
              }
            >
              {product.is_active ? "Active" : "Hidden"}
            </span>
            <button
              type="button"
              onClick={() => handleSetWeeklyProduct(product)}
              className={`grid h-9 w-9 place-items-center rounded-full transition cursor-pointer ${
                weeklyProducts.some(
                  (wp) =>
                    wp.name?.toLowerCase() === product.name?.toLowerCase(),
                )
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
              title="Mark as weekly product"
              disabled={isCreatingWeekly}
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => openEdit(product)}
              className="rounded-full bg-background px-4 py-1.5 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (!confirm("Delete this product?")) return;
                try {
                  await deleteMut(Number(product.id));
                  toast.success("Deleted");
                } catch (err) {
                  toast.error(
                    err instanceof Error
                      ? err.message
                      : "Failed to delete product",
                  );
                }
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-background text-destructive disabled:opacity-50"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-background p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editing.id ? "Edit product" : "New product"}
              </h3>
              <button
                onClick={closeEditor}
                className="grid h-9 w-9 place-items-center rounded-full bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <input
                value={editing.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setEditing((current) =>
                    current
                      ? {
                          ...current,
                          name,
                          slug: current.id ? current.slug : slugify(name),
                        }
                      : current,
                  );
                }}
                placeholder="Name"
                className="rounded-2xl bg-muted px-4 py-3 text-sm"
              />
              <input
                value={editing.slug}
                onChange={(e) =>
                  setEditing({ ...editing, slug: slugify(e.target.value) })
                }
                placeholder="slug-like-this"
                className="rounded-2xl bg-muted px-4 py-3 text-sm"
              />
              <select
                value={editing.category_id ?? ""}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    category_id: e.target.value || null,
                  })
                }
                className="rounded-2xl bg-muted px-4 py-3 text-sm"
              >
                <option value="">— No category —</option>
                {cats.map((category: { id: string | number; name: string }) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <textarea
                value={editing.description ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                placeholder="Description"
                rows={3}
                className="rounded-2xl bg-muted px-4 py-3 text-sm"
              />

              <div className="rounded-2xl bg-muted p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">Product images</div>
                    <div className="text-xs text-muted-foreground">
                      Images upload to Cloudinary first. The first image is used
                      on product cards.
                    </div>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-background px-3 py-2 text-xs font-semibold">
                    <ImagePlus className="h-4 w-4" />
                    Add images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        handleImageSelect(e.target.files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {loadingImages ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Loading existing images…
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {imageItems.length > 0 ? (
                      imageItems.map((image, index) => {
                        const src =
                          image.previewUrl ?? resolveImageUrl(image.image_url);
                        return (
                          <div
                            key={`${image.id ?? image.previewUrl ?? index}-${index}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index)}
                            className="relative cursor-grab rounded-xl border border-border bg-background"
                          >
                            <img
                              src={src}
                              alt={`Product image ${index + 1}`}
                              className="h-20 w-20 rounded-xl object-cover"
                            />
                            <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                              {index === 0 ? "Primary" : "Drag"}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-input text-xs text-muted-foreground">
                        No images selected yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs">
                  Price (GHS)
                  <input
                    type="number"
                    step="0.01"
                    value={editing.price}
                    onChange={(e) =>
                      setEditing({ ...editing, price: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm"
                  />
                </label>
                <label className="text-xs">
                  Unit
                  <input
                    value={editing.unit}
                    onChange={(e) =>
                      setEditing({ ...editing, unit: e.target.value })
                    }
                    className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm"
                  />
                </label>
                <label className="text-xs">
                  Min order
                  <input
                    type="number"
                    value={editing.min_order_qty}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        min_order_qty: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm"
                  />
                </label>
                <label className="text-xs">
                  Stock
                  <input
                    type="number"
                    value={editing.stock_qty}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        stock_qty: Number(e.target.value),
                      })
                    }
                    className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) =>
                    setEditing({ ...editing, is_active: e.target.checked })
                  }
                />
                Active (visible in shop)
              </label>

              <button
                disabled={saving}
                onClick={handleSave}
                className="rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {isUploadingImages
                  ? "Uploading images…"
                  : isUpserting
                    ? "Saving…"
                    : "Save product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
