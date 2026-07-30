export function formatGHS(value: number): string {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(value);
}

export function categoryEmoji(slug: string | null | undefined): string {
  switch (slug) {
    case "tubers": return "🥔";
    case "grains-cereals": return "🌾";
    case "legumes": return "🫘";
    case "vegetables": return "🥬";
    case "fruits": return "🍊";
    case "spices-peppers": return "🌶️";
    case "oils-fats": return "🫒";
    case "processed-staples": return "🥣";
    default: return "🧺";
  }
}

export function categoryImage(slug: string | null | undefined): string {
  return "https://placehold.co/600x400";
}

export function productImage(product: { image_url?: string | null; categories?: { slug: string } | null }): string {
  if (product.image_url) return product.image_url;
  return categoryImage(product.categories?.slug);
}
