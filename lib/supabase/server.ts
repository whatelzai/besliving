import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;


/**
 * Server-side Supabase client with service role for admin operations.
 * Use for user sync, migrations, etc. Never expose to client.
 */
export function createServerSupabase() {
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseServiceKey) {
    console.warn(
      "SUPABASE_SERVICE_ROLE_KEY not set - user sync will fail. Add to .env.local"
    );
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY - required for user sync from Clerk"
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Server-side Supabase client with anon key for public routes.
 * Respects RLS - use for catalogue, unit details, etc. where only published content is visible.
 */
export function createPublicSupabase() {
  if (!supabaseUrl) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}
