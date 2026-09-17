import { supabaseAdmin } from '../config/supabase.js';

/**
 * Get public products with search, category filter, sort, and pagination
 */
export async function getPublicProductsService({
  search = '',
  category = '',
  sort = 'default',
  featured = null,
  seller = null,
  page = 1,
  limit = 12,
}) {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      stock,
      image,
      rating,
      reviews_count,
      featured,
      is_active,
      created_at,
      category:categories(id, name),
      seller:profiles!seller_id(id, name)
    `, { count: 'exact' })
    .eq('is_active', true);

  // Filter featured
  if (featured === true || featured === 'true') {
    query = query.eq('featured', true);
  }

  // Filter seller
  if (seller) {
    query = query.eq('seller_id', seller);
  }

  // Search keyword (name or description)
  if (search && search.trim()) {
    const q = search.trim();
    query = query.ilike('name', `%${q}%`);
  }

  // Filter category by name or ID
  if (category && category !== 'all') {
    // If UUID, filter by category_id directly, else filter through relationship
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(category);
    if (isUUID) {
      query = query.eq('category_id', category);
    } else {
      // Find category ID by name
      const { data: catData } = await supabaseAdmin
        .from('categories')
        .select('id')
        .ilike('name', category.trim())
        .single();

      if (catData) {
        query = query.eq('category_id', catData.id);
      }
    }
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name_asc':
    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Fetch Products Error:', error);
    throw new Error(`Gagal mengambil data produk: ${error.message}`);
  }

  // Map result into clean structure
  const formattedProducts = (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    image: p.image,
    rating: Number(p.rating || 0),
    reviews: p.reviews_count || 0,
    featured: p.featured,
    category: p.category?.name || 'Uncategorized',
    categoryId: p.category?.id,
    seller: {
      id: p.seller?.id,
      name: p.seller?.name,
    },
    created_at: p.created_at,
  }));

  return {
    products: formattedProducts,
    pagination: {
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  };
}

/**
 * Get product detail by ID (only if active)
 */
export async function getPublicProductByIdService(productId) {
  const { data: p, error } = await supabaseAdmin
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      stock,
      image,
      rating,
      reviews_count,
      featured,
      is_active,
      created_at,
      category:categories(id, name, description),
      seller:profiles!seller_id(id, name, email, phone)
    `)
    .eq('id', productId)
    .single();

  if (error || !p || !p.is_active) {
    throw new Error('Produk tidak ditemukan atau tidak tersedia.');
  }

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    stock: p.stock,
    image: p.image,
    rating: Number(p.rating || 0),
    reviews: p.reviews_count || 0,
    featured: p.featured,
    category: p.category?.name || 'Uncategorized',
    categoryId: p.category?.id,
    seller: {
      id: p.seller?.id,
      name: p.seller?.name,
    },
    created_at: p.created_at,
  };
}

/**
 * Get all categories
 */
export async function getCategoriesService() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil data kategori: ${error.message}`);
  }

  return data || [];
}

/**
 * Add review for product
 */
export async function addReviewService(userId, productId, rating, comment = '') {
  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    throw new Error('Rating harus berupa angka antara 1 sampai 5.');
  }

  // Insert or update review
  const { data: review, error } = await supabaseAdmin
    .from('reviews')
    .upsert({
      product_id: productId,
      user_id: userId,
      rating: numRating,
      comment: comment?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal menambahkan ulasan: ${error.message}`);
  }

  // Recalculate average rating & reviews_count
  const { data: allReviews } = await supabaseAdmin
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  if (allReviews && allReviews.length > 0) {
    const avgRating = (allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length).toFixed(1);
    await supabaseAdmin
      .from('products')
      .update({
        rating: Number(avgRating),
        reviews_count: allReviews.length,
      })
      .eq('id', productId);
  }

  return review;
}
