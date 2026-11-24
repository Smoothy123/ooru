import { createClient } from '@supabase/supabase-js';

// Expo inlines EXPO_PUBLIC_* variables from .env at build time.
// They must be read with exactly this dot syntax for the inlining to work.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config: copy .env.example to .env, fill in EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart Expo with `npx expo start --clear`.',
  );
}

// The app has no login, so there is no session to persist or refresh.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
