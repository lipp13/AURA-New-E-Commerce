// src/services/ProductService.js
// Centralized Product Service 100% connected to Supabase backend
import { api } from "./api";

export const slugify = (text = "") => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80";

// Clear any obsolete local product caches immediately
try {
  localStorage.removeItem("aura_products_cache_v1");
  localStorage.removeItem("aura_products_cache_v2");
  localStorage.removeItem("aura_products_cache_v3");
  localStorage.removeItem("aura_products_cache_v4");
  localStorage.removeItem("aura_products_cache_v5");
} catch {}

/**
 * Normalizes backend product payload from Supabase into the schema expected by the UI
 */
export const normalizeProduct = (p) => {
  if (!p) return null;

  const rawImages =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images.filter(Boolean)
      : p.image
        ? [p.image]
        : [DEFAULT_FALLBACK_IMAGE];

  const price = typeof p.price === "number" ? p.price : (parseFloat(p.price) || 0);
  const oldPrice = p.oldPrice ? (typeof p.oldPrice === "number" ? p.oldPrice : (parseFloat(p.oldPrice) || null)) : null;

  const categoryName = typeof p.category === "object" ? (p.category?.name || "Katalog") : (p.category || "Katalog");

  return {
    id: String(p.id),
    title: p.name || p.title || "Objek Tanpa Judul",
    name: p.name || p.title || "Objek Tanpa Judul",
    price,
    oldPrice,
    category: categoryName,
    categorySlug: p.categorySlug || slugify(categoryName),
    categoryId: p.categoryId || p.category_id || p.category?.id || null,
    brand: p.seller?.name || p.brand || p.brandName || "Toko Elektronik Official",
    rating: typeof p.rating === "number" ? p.rating : (parseFloat(p.rating) || 0),
    reviewCount: typeof p.reviews === "number" ? p.reviews : (p.reviews_count || p.reviewCount || 0),
    images: rawImages,
    image: rawImages[0] || (p.image ? p.image : DEFAULT_FALLBACK_IMAGE),
    featured: Boolean(p.featured),
    isNew: Boolean(p.isNew || p.featured),
    isBestseller: Boolean(p.isBestseller || p.featured),
    isNewArrival: Boolean(p.isNewArrival),
    isSale: Boolean(p.isSale || (oldPrice && oldPrice > price)),
    inStock: p.is_active !== undefined ? Boolean(p.is_active) : (p.stock !== undefined ? p.stock > 0 : true),
    stock: typeof p.stock === "number" ? p.stock : 0,
    description: p.description || "",
    dimensions: p.dimensions || null,
    materials: Array.isArray(p.materials) ? p.materials : (p.material ? [p.material] : []),
    origin: p.origin || null,
    warranty: p.warranty || null,
    specifications: p.specifications && typeof p.specifications === "object" ? p.specifications : {},
    colors: Array.isArray(p.colors) ? p.colors : ["#171717"],
    sizes: Array.isArray(p.sizes) ? p.sizes : ["Standar"],
    seller: p.seller || null,
    createdAt: p.created_at || p.createdAt || null,
  };
};

class ProductServiceClass {
  constructor() {
    this.memoryCache = null;
  }

  /**
   * Fetch products directly from Supabase via backend API
   */
  async getProducts(params = {}) {
    // Map UI sorting parameters to backend sort options
    const backendParams = { limit: 100, ...params };
    if (backendParams.sort) {
      if (backendParams.sort === "price-low" || backendParams.sort === "price_low") {
        backendParams.sort = "price_asc";
      } else if (backendParams.sort === "price-high" || backendParams.sort === "price_high") {
        backendParams.sort = "price_desc";
      } else if (backendParams.sort === "name") {
        backendParams.sort = "name_asc";
      }
    }

    try {
      const response = await api.get("products", backendParams);
      const rawItems = Array.isArray(response)
        ? response
        : response?.data || response?.products || [];

      const normalized = rawItems.map(normalizeProduct).filter(Boolean);
      this.memoryCache = normalized;
      return normalized;
    } catch (err) {
      console.error("ProductService: Backend fetch error:", err.message);
      if (this.memoryCache && this.memoryCache.length > 0) {
        return this.memoryCache;
      }
      throw err;
    }
  }

  /**
   * Fetch all categories directly from Supabase via backend
   */
  async getCategories() {
    try {
      const response = await api.get("products/categories");
      const raw = Array.isArray(response) ? response : (response?.data || []);
      if (raw && raw.length > 0) {
        return raw.map((c) => ({
          id: c.id,
          name: c.name,
          slug: slugify(c.name),
          description: c.description || "",
        }));
      }
    } catch (err) {
      console.warn("ProductService: Failed to fetch categories:", err.message);
    }
    return null;
  }

  /**
   * Fetch single product by ID directly from Supabase
   */
  async getProductById(id) {
    try {
      const res = await api.get(`products/${id}`);
      const raw = res?.data || res;
      return normalizeProduct(raw);
    } catch (err) {
      console.warn(`ProductService: Failed to fetch product ${id} from backend:`, err.message);
      if (this.memoryCache) {
        const found = this.memoryCache.find((p) => String(p.id) === String(id));
        if (found) return found;
      }
      return null;
    }
  }

  /**
   * Add review for product
   */
  async addReview(productId, { rating, comment }) {
    const res = await api.post(`products/${productId}/reviews`, {
      rating,
      comment,
    });
    return res?.data || res;
  }

  getInitialProducts() {
    return this.memoryCache || [];
  }
}

export const ProductService = new ProductServiceClass();
export const productService = ProductService;
