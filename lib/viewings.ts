import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/db/user";

export async function requireStaff() {
  const user = await getAppUser();
  if (!user || !["admin", "superadmin"].includes(user.role))
    throw new Error("Not authorized");
  return user;
}
export async function availableSlots() {
  const db = createServerSupabase();
  const { error: refreshError } = await db.rpc("refresh_viewing_slots");
  if (refreshError) throw new Error("Could not refresh viewing availability");
  const all: {
    id: string;
    starts_at: string;
    ends_at: string;
    host_id: string;
    users: { full_name: string | null; role: string };
    viewing_bookings: { status: string }[];
  }[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db
      .from("viewing_slots")
      .select(
        "id,starts_at,ends_at,host_id,users!inner(full_name,role),viewing_bookings(status)",
      )
      .eq("is_open", true)
      .gt("starts_at", new Date(Date.now() + 3600000).toISOString())
      .lt("starts_at", new Date(Date.now() + 90 * 86400000).toISOString())
      .order("starts_at")
      .range(offset, offset + 999)
      .returns<
        {
          id: string;
          starts_at: string;
          ends_at: string;
          host_id: string;
          users: { full_name: string | null; role: string };
          viewing_bookings: { status: string }[];
        }[]
      >();
    if (error)
      throw new Error("Viewing times could not be loaded. Please try again.");
    all.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  return all
    .filter(
      (s) =>
        ["admin", "superadmin"].includes(s.users.role) &&
        !s.viewing_bookings.some((b) => b.status !== "cancelled"),
    )
    .map((s) => ({
      id: s.id,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      host: s.users.full_name || "Besliving host",
    }));
}
export function viewingTime(date: string) {
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function pastWeek() {
  return new Date(Date.now() - 7 * 86400000).toISOString();
}
