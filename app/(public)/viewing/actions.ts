"use server";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { isRentalRoom } from "@/lib/catalogue/desa-aman";
export type BookingState = { error?: string; bookingId?: string };
export async function bookViewing(
  _: BookingState,
  form: FormData,
): Promise<BookingState> {
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const phone = String(form.get("phone") || "").trim();
  const slot = String(form.get("slot") || "");
  const room = String(form.get("room") || "").toUpperCase();
  if (form.get("website"))
    return { error: "Unable to book. Please try again." };
  if (
    name.length < 1 ||
    name.length > 100 ||
    (!email && !phone) ||
    email.length > 254 ||
    phone.length > 30 ||
    !form.get("consent")
  )
    return {
      error:
        "Enter your name, email or phone, and consent to being contacted about your viewing.",
    };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { error: "Enter a valid email address." };
  if (phone && !/^\+?[\d ()-]{7,30}$/.test(phone))
    return { error: "Enter a valid phone number." };
  if (!/^[0-9a-f-]{36}$/i.test(slot) || !isRentalRoom(room))
    return { error: "Choose a room and available time." };
  const h = await headers();
  const identity = (
    h.get("x-vercel-forwarded-for") ||
    h.get("x-forwarded-for") ||
    "local"
  )
    .split(",")[0]
    .trim();
  const hash = createHmac("sha256", process.env.CLERK_SECRET_KEY!)
    .update(identity)
    .digest("hex");
  const { data, error } = await createServerSupabase().rpc("book_viewing", {
    p_slot: slot,
    p_name: name,
    p_email: email || null,
    p_phone: phone || null,
    p_room: room,
    p_hash: hash,
  });
  if (error)
    return {
      error:
        error.code === "P0001"
          ? error.message
          : "We couldn’t confirm this viewing. Please refresh and try another time.",
    };
  return { bookingId: data };
}
