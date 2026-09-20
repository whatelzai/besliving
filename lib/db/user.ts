import { auth } from "@clerk/nextjs/server";
import { createServerSupabase } from "@/lib/supabase/server";

export type AppUser = {
  id: string;
  clerk_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: "superadmin" | "admin" | "user";
};

/**
 * Get current app user from Supabase (synced from Clerk).
 * Returns null if not signed in or user not yet synced.
 */
export async function getAppUser(): Promise<AppUser | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = createServerSupabase();
  const { data } = await supabase
    .from("users")
    .select("id, clerk_id, email, full_name, avatar_url, role")
    .eq("clerk_id", userId)
    .single();

  return data as AppUser | null;
}
