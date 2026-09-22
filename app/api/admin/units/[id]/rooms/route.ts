import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/db/user";

async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await getAppUser();
  if (!user || (user.role !== "admin" && user.role !== "superadmin"))
    return null;
  return true;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await checkAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id: unitId } = await params;
  const body = await req.json();
  const { name, price, size_sqm, availability_status } = body;
  if (!name || (price != null && (!Number.isFinite(Number(price)) || Number(price) < 0)))
    return NextResponse.json({ error: "Valid room name and nonnegative rent required" }, { status: 400 });

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("rooms")
    .insert({
      unit_id: unitId,
      name,
      price: price == null ? null : Number(price),
      size_sqm: size_sqm != null ? Number(size_sqm) : null,
      availability_status: availability_status ?? null,
    })
    .select("id, name, price, size_sqm, availability_status")
    .single();

  if (error) {
    console.error("[admin rooms post]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ room: data });
}
