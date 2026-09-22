"use server";
import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/viewings";
import { createServerSupabase } from "@/lib/supabase/server";
export async function saveAvailability(_: { message: string }, form: FormData) {
  const user = await requireStaff();
  const date = String(form.get("date") || "");
  const range = (prefix: string) => ({
    enabled: form.get(prefix + "enabled") === "on",
    start: Number(form.get(prefix + "start")),
    end: Number(form.get(prefix + "end")),
  });
  const valid = (r: { start: number; end: number }) =>
    Number.isInteger(r.start) &&
    Number.isInteger(r.end) &&
    r.start >= 0 &&
    r.end <= 1440 &&
    r.start < r.end &&
    r.start % 30 === 0 &&
    r.end % 30 === 0;
  const days = Array.from({ length: 7 }, (_, weekday) => ({
    weekday,
    ...range(`${weekday}-`),
  }));
  const override = range("override-");
  const reset = form.get("reset") === "yes";
  if (
    date
      ? !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(new Date(date).getTime()) ||
        (!reset && !valid(override))
      : !days.every(valid)
  )
    return {
      message:
        "Choose valid hours in 30-minute steps. End time must be later than start time.",
    };
  const { error } = await createServerSupabase().rpc(
    "save_viewing_availability",
    {
      p_host: user.id,
      p_days: date ? [] : days,
      p_date: date || null,
      p_override: date && !reset ? override : null,
    },
  );
  if (error)
    return { message: "Could not save availability. Please try again." };
  revalidatePath("/admin/viewings");
  revalidatePath("/viewing");
  revalidatePath("/admin");
  return {
    message: date
      ? reset
        ? "Date restored to weekly hours."
        : "Date exception saved. Existing bookings are unchanged."
      : "Weekly hours saved. Existing bookings are unchanged.",
  };
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
