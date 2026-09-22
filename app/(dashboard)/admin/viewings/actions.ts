"use server";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/viewings";
import { createServerSupabase } from "@/lib/supabase/server";
export async function addSlot(_: { message: string }, form: FormData) {
  const user = await requireStaff();
  const value = String(form.get("starts") || "");
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:(00|30)$/.test(value))
    return { message: "Choose a date and time on the hour or half hour." };
  const starts = new Date(value + ":00+08:00");
  if (
    !Number.isFinite(starts.getTime()) ||
    starts.getTime() < Date.now() + 3600000 ||
    starts.getTime() > Date.now() + 90 * 86400000
  )
    return { message: "Choose a time between one hour and 90 days from now." };
  const { error } = await createServerSupabase()
    .from("viewing_slots")
    .insert({
      host_id: user.id,
      starts_at: starts.toISOString(),
      ends_at: new Date(starts.getTime() + 1800000).toISOString(),
    });
  revalidatePath("/admin/viewings");
  revalidatePath("/viewing");
  return {
    message: error
      ? error.code === "23505"
        ? "You already have a slot at that time."
        : "Could not publish this slot."
      : "Viewing time published.",
  };
}
export async function closeSlot(form: FormData) {
  const user = await requireStaff();
  const db = createServerSupabase();
  const id = String(form.get("id"));
  // Closing removes new bookings; confirmed appointments remain visible and valid.
  const { error } = await db
    .from("viewing_slots")
    .update({ is_open: false })
    .eq("id", id)
    .eq("host_id", user.id);
  if (error) throw new Error("Could not close slot");
  revalidatePath("/admin/viewings");
  revalidatePath("/viewing");
}
export async function completeViewing(form: FormData) {
  await requireStaff();
  const db = createServerSupabase();
  const { data, error } = await db
    .from("viewing_bookings")
    .update({ status: "completed" })
    .eq("id", String(form.get("id")))
    .eq("status", "confirmed")
    .select("lead_id")
    .single();
  if (error) throw new Error("Could not complete viewing");
  await db
    .from("leads")
    .update({ status: "viewed" })
    .eq("id", data.lead_id)
    .eq("status", "viewing_booked");
  revalidatePath("/admin/viewings");
  revalidatePath("/admin/leads");
}
