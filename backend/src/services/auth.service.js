import { supabase, supabaseAdmin } from '../config/supabase.js';

/**
 * Register a new user with Supabase Auth and initialize profile in public.profiles
 */
export async function registerService(name, email, password, role = 'user', phone = null) {
  const allowedRoles = ['user', 'seller', 'admin'];
  const userRole = allowedRoles.includes(role) ? role : 'user';

  // 1. Create user via Supabase Auth Admin API (automatically confirms email & bypasses email rate limit)
  let authUser = null;
  let session = null;

  const { data: adminAuthData, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: {
      name: name.trim(),
      role: userRole,
      phone: phone ? phone.trim() : null,
    },
  });

  if (adminAuthError) {
    // If admin creation fails, try standard signUp
    const { data: standardData, error: standardError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          role: userRole,
          phone: phone ? phone.trim() : null,
        },
      },
    });

    if (standardError) {
      throw new Error(standardError.message);
    }
    authUser = standardData.user;
    session = standardData.session;
  } else {
    authUser = adminAuthData.user;
  }

  if (!authUser) {
    throw new Error('Gagal membuat akun pengguna.');
  }

  // 2. Ensure profile exists and is updated in public.profiles
  let { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile) {
    const { data: newProfile } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUser.id,
        email: authUser.email,
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        role: userRole,
      }, { onConflict: 'id' })
      .select()
      .single();
    profile = newProfile;
  } else {
    const { data: updatedProfile } = await supabaseAdmin
      .from('profiles')
      .update({
        name: name.trim(),
        role: userRole,
        phone: phone ? phone.trim() : profile.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', authUser.id)
      .select()
      .single();
    if (updatedProfile) profile = updatedProfile;
  }

  // 3. If role is seller, automatically create a default store
  if (userRole === 'seller') {
    await supabaseAdmin
      .from('stores')
      .upsert({
        seller_id: authUser.id,
        store_name: `Toko ${name.trim()}`,
        description: `Toko resmi dari ${name.trim()} di ShopKu.`,
      })
      .select();
  }

  // 4. Initialize cart for user
  await supabaseAdmin
    .from('carts')
    .upsert({ user_id: authUser.id });

  // 5. Generate active session token
  let token = session?.access_token || null;
  if (!token) {
    try {
      const { data: loginData } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      session = loginData?.session || null;
      token = loginData?.session?.access_token || null;
    } catch {
      // Ignore if session cannot be generated immediately
    }
  }

  return {
    user: profile || {
      id: authUser.id,
      email: authUser.email,
      name: name.trim(),
      role: userRole,
    },
    session,
    token,
  };
}

/**
 * Login user via Supabase Auth
 */
export async function loginService(email, password) {
  // 1. Sign in with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError) {
    throw new Error('Email atau kata sandi tidak valid.');
  }

  const authUser = authData.user;

  // 2. Fetch complete profile & role
  let { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!profile) {
    // If profile row doesn't exist yet, insert it
    const { data: newProfile } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email.split('@')[0],
        role: authUser.user_metadata?.role || 'user',
      })
      .select()
      .single();

    profile = newProfile;
  }

  // 3. If seller, attach store information
  let storeInfo = null;
  if (profile.role === 'seller') {
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('seller_id', profile.id)
      .single();
    storeInfo = store;
  }

  return {
    user: {
      ...profile,
      store: storeInfo,
    },
    token: authData.session?.access_token,
    refreshToken: authData.session?.refresh_token,
    expiresAt: authData.session?.expires_at,
  };
}

/**
 * Logout user
 */
export async function logoutService(token) {
  if (token) {
    try {
      await supabase.auth.admin.signOut(token);
    } catch {
      // Ignore if already signed out
    }
  }
  return true;
}

/**
 * Get profile by user ID
 */
export async function getProfileService(userId) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new Error('Profil pengguna tidak ditemukan.');
  }

  let storeInfo = null;
  if (profile.role === 'seller') {
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('*')
      .eq('seller_id', profile.id)
      .single();
    storeInfo = store;
  }

  return {
    ...profile,
    store: storeInfo,
  };
}

/**
 * Update user profile
 */
export async function updateProfileService(userId, updateData) {
  const allowedFields = ['name', 'phone', 'avatar'];
  const payload = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      payload[field] = updateData[field];
    }
  }

  payload.updated_at = new Date().toISOString();

  const { data: updated, error } = await supabaseAdmin
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Gagal memperbarui profil: ${error.message}`);
  }

  return updated;
}
