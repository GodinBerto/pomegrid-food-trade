"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, X } from "lucide-react";
import { categoriesApi, type Category } from "@/api/categories";
import {
  useAdminCreateCategory,
  useAdminDeleteCategory,
  useAdminListCategories,
  useAdminUpdateCategory,
} from "@/query/categories";

type CategoryForm = {
  id?: number;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
};

const emptyForm = (): CategoryForm => ({
  name: "",
  slug: "",
  sort_order: 0,
  is_active: true,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isCategoryActive(value: Category["is_active"]) {
  return value === true || value === 1;
}

export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading } = useAdminListCategories();
  const { mutateAsync: createCategory, isPending: isCreating } = useAdminCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useAdminUpdateCategory();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useAdminDeleteCategory();

  const [editing, setEditing] = useState<CategoryForm | null>(null);
  const [loadingCategoryId, setLoadingCategoryId] = useState<number | null>(null);

  const saving = isCreating || isUpdating;

  async function openEdit(category: Category) {
    setLoadingCategoryId(category.id);
    try {
      const res = await categoriesApi.adminGetCategory(category.id);
      const full = res.data ?? category;
      setEditing({
        id: full.id,
        name: full.name,
        slug: full.slug,
        sort_order: Number(full.sort_order ?? 0),
        is_active: isCategoryActive(full.is_active ?? true),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load category");
    } finally {
      setLoadingCategoryId(null);
    }
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }

    const payload = {
      name: editing.name.trim(),
      slug: editing.slug.trim(),
      sort_order: Number(editing.sort_order ?? 0),
      is_active: editing.is_active ? 1 : 0,
    };

    try {
      if (editing.id) {
        await updateCategory({ id: editing.id, data: payload });
        toast.success("Category updated");
      } else {
        await createCategory(payload);
        toast.success("Category created");
      }
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete "${category.name}"?`)) return;

    try {
      await deleteCategory(category.id);
      toast.success("Category deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    }
  }

  if (isLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories ({categories.length})</h2>
        <button
          onClick={() => setEditing(emptyForm())}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> New category
        </button>
      </div>

      <div className="mt-6 space-y-2">
        {categories.length === 0 ? (
          <div className="rounded-2xl bg-muted p-8 text-center text-sm text-muted-foreground">
            No categories yet. Create one to organize your products.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="flex items-center gap-4 rounded-2xl bg-muted p-4">
              <div className="flex-1">
                <div className="font-semibold">{category.name}</div>
                <div className="text-xs text-muted-foreground">
                  {category.slug} · sort order {category.sort_order ?? 0}
                </div>
              </div>
              <button
                onClick={() => openEdit(category)}
                disabled={loadingCategoryId === category.id}
                className="rounded-full bg-background px-4 py-1.5 text-sm font-medium disabled:opacity-60"
              >
                {loadingCategoryId === category.id ? "Loading…" : "Edit"}
              </button>
              <button
                onClick={() => handleDelete(category)}
                disabled={isDeleting}
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-destructive disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-background p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{editing.id ? "Edit category" : "New category"}</h3>
              <button
                onClick={() => setEditing(null)}
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
                  setEditing((current) => ({
                    ...current!,
                    name,
                    slug: current?.id ? current.slug : slugify(name),
                  }));
                }}
                placeholder="Category name"
                className="rounded-2xl bg-muted px-4 py-3 text-sm"
              />
              <input
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                placeholder="slug-like-this"
                className="rounded-2xl bg-muted px-4 py-3 text-sm"
              />
              <label className="text-xs">
                Sort order
                <input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) =>
                    setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-2xl bg-muted px-4 py-3 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                Active
              </label>
              <button
                disabled={saving}
                onClick={handleSave}
                className="rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Saving…" : editing.id ? "Save changes" : "Create category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
