"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X, ImagePlus } from "lucide-react";
import {
  productsApi,
  resolveImageUrl,
  type ProductImage,
} from "@/api/products";
import {
  useAdminDeleteProduct,
  useAdminListProducts,
  useAdminUpsertProduct,
} from "@/query/products";
import { useAdminListCategories } from "@/query/categories";
import { formatGHS, productImage, productPrice } from "@/lib/format";
import { uploadProductImageToCloudinary } from "@/lib/cloudinary";

type ProductForm = {
  id?: number;
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
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const saving = isUpserting || isUploadingImages;

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  function resetImages() {
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
  }

  function closeEditor() {
    resetImages();
    setEditing(null);
  }

  function openCreate() {
    resetImages();
    setEditing(emptyProduct(cats[0]?.id));
  }

  async function openEdit(product: any) {
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
      const res = await productsApi.getProductImages(product.id);
      const loaded = res.data ?? [];
      if (loaded.length > 0) {
        setExistingImages(loaded);
      } else if (product.image_url) {
        setExistingImages([
          {
            id: 0,
            product_id: product.id,
            image_url: product.image_url,
            sort_order: 0,
          },
        ]);
      } else {
        setExistingImages([]);
      }
    } catch {
      setExistingImages(
        product.image_url
          ? [
              {
                id: 0,
                product_id: product.id,
                image_url: product.image_url,
                sort_order: 0,
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

    setImageFiles((current) => [...current, ...selected]);
    setImagePreviews((current) => [
      ...current,
      ...selected.map((file) => URL.createObjectURL(file)),
    ]);
  }

  function removeNewImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((current) => current.filter((_, i) => i !== index));
    setImagePreviews((current) => current.filter((_, i) => i !== index));
  }

  function removeExistingImage(imageId: number) {
    setExistingImages((current) =>
      current.filter((image) => image.id !== imageId),
    );
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    const keptExistingUrls = existingImages.map((image) => image.image_url);
    const hasNewImages = imageFiles.length > 0;
    const hasExistingImages = keptExistingUrls.length > 0;

    if (!editing.id && !hasNewImages) {
      toast.error("Add at least one product image");
      return;
    }
    if (editing.id && !hasNewImages && !hasExistingImages && !editing.image_url) {
      toast.error("Keep or add at least one product image");
      return;
    }

    try {
      setIsUploadingImages(true);
      const uploadedUrls = hasNewImages
        ? await Promise.all(
            imageFiles.map((file) => uploadProductImageToCloudinary(file)),
          )
        : [];
      const imageUrls = [...keptExistingUrls, ...uploadedUrls];

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
        {products.map((product: any) => (
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
                {cats.map((category: any) => (
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
                    {existingImages.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={resolveImageUrl(image.image_url)}
                          alt="Existing product"
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.id)}
                          className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((preview, index) => (
                      <div key={preview} className="relative">
                        <img
                          src={preview}
                          alt={`New product ${index + 1}`}
                          className="h-20 w-20 rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {!existingImages.length && !imagePreviews.length && (
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
