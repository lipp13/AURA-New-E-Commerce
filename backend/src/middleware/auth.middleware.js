import { supabase, supabaseAdmin } from '../config/supabase.js';
import { errorResponse } from '../utils/response.js';

/**
 * Authentication Middleware
 * Validates Supabase JWT Access Token and attaches authenticated profile & role to req.user
 */
export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Akses ditolak: Token autentikasi tidak ditemukan.', null, 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return errorResponse(res, 'Akses ditolak: Format token tidak valid.', null, 401);
    }

    // 1. Verifikasi token via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData.user) {
      return errorResponse(res, 'Sesi tidak valid atau telah kedaluwarsa. Silakan login kembali.', authError, 401);
    }

    const authUser = authData.user;

    // 2. Ambil profil user dari public.profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      // Fallback: Jika profil belum ada di public.profiles, inisialisasi dari authUser metadata
      const userRole = authUser.user_metadata?.role || 'user';
      const userName = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User';

      const { data: newProfile } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          name: userName,
          role: userRole,
        })
        .select()
        .single();

      req.user = newProfile || {
        id: authUser.id,
        email: authUser.email,
        name: userName,
        role: userRole,
      };
    } else {
      req.user = profile;
    }

    req.token = token;
    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    return errorResponse(res, 'Terjadi kesalahan saat memverifikasi autentikasi.', err, 500);
  }
}

/**
 * Optional Auth Middleware
 * Sets req.user if valid token provided, but doesn't block unauthenticated requests
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const { data: authData } = await supabase.auth.getUser(token);
    if (authData?.user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      req.user = profile || {
        id: authData.user.id,
        email: authData.user.email,
        role: 'user',
      };
      req.token = token;
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }

  next();
}
