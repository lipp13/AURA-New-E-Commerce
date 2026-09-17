import {
  getPublicProductsService,
  getPublicProductByIdService,
  getCategoriesService,
  addReviewService,
} from '../services/product.service.js';
import { successResponse, errorResponse, validationResponse } from '../utils/response.js';

export async function getProducts(req, res, next) {
  try {
    const { search, category, sort, featured, seller, page, limit } = req.query;
    const result = await getPublicProductsService({
      search,
      category,
      sort,
      featured,
      seller,
      page,
      limit,
    });
    return successResponse(res, 'Produk berhasil diambil.', result.products, 200, result.pagination);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const product = await getPublicProductByIdService(id);
    return successResponse(res, 'Detail produk berhasil diambil.', product, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 404);
  }
}

export async function getCategories(req, res, next) {
  try {
    const categories = await getCategoriesService();
    return successResponse(res, 'Kategori produk berhasil diambil.', categories, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function addReview(req, res, next) {
  try {
    const { id: productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating) {
      return validationResponse(res, { rating: 'Rating (1-5) wajib disertakan.' });
    }

    const review = await addReviewService(req.user.id, productId, rating, comment);
    return successResponse(res, 'Ulasan berhasil ditambahkan!', review, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}
