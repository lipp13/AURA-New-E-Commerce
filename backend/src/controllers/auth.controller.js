import {
  registerService,
  loginService,
  logoutService,
  getProfileService,
  updateProfileService,
} from '../services/auth.service.js';
import { successResponse, errorResponse, validationResponse } from '../utils/response.js';
import { isValidEmail } from '../utils/validation.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, phone } = req.body;
    const errors = {};

    if (!name || !name.trim()) errors.name = 'Nama lengkap wajib diisi.';
    if (!email || !isValidEmail(email)) errors.email = 'Alamat email tidak valid.';
    if (!password || password.length < 6) errors.password = 'Password minimal harus 6 karakter.';

    if (Object.keys(errors).length > 0) {
      return validationResponse(res, errors, 'Data pendaftaran tidak valid.');
    }

    const result = await registerService(name, email, password, role, phone);
    return successResponse(res, 'Pendaftaran akun berhasil!', result, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const errors = {};

    if (!email || !isValidEmail(email)) errors.email = 'Email tidak valid.';
    if (!password) errors.password = 'Password wajib diisi.';

    if (Object.keys(errors).length > 0) {
      return validationResponse(res, errors, 'Kredensial login tidak lengkap.');
    }

    const result = await loginService(email, password);
    return successResponse(res, 'Login berhasil!', result, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 401);
  }
}

export async function logout(req, res, next) {
  try {
    await logoutService(req.token);
    return successResponse(res, 'Logout berhasil.', null, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
}

export async function getProfile(req, res, next) {
  try {
    const profile = await getProfileService(req.user.id);
    return successResponse(res, 'Profil berhasil diambil.', profile, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 404);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await updateProfileService(req.user.id, req.body);
    return successResponse(res, 'Profil berhasil diperbarui.', updated, 200);
  } catch (err) {
    return errorResponse(res, err.message, err, 400);
  }
}
