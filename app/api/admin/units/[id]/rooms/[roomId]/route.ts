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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  const ok = await checkAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { roomId } = await params;
  const body = await req.json();
  const { name, price, size_sqm, availability_status } = body;

  const supabase = createServerSupabase();
  const updates: Record<string, unknown> = {};
  if (name != null) updates.name = name;
  if (price !== undefined) {
    if (price !== null && (!Number.isFinite(Number(price)) || Number(price) < 0)) return NextResponse.json({error: "Invalid rent"}, {status:400});
    updates.price = price === null ? null : Number(price);
  }
  if (size_sqm !== undefined) updates.size_sqm = size_sqm ? Number(size_sqm) : null;
  if (availability_status !== undefined) updates.availability_status = availability_status;

  const { data, error } = await supabase
    .from("rooms")
    .update(updates)
    .eq("id", roomId)
    .select("id, name, price, size_sqm, availability_status")
    .single();

  if (error) {
    console.error("[admin rooms patch]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ room: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; roomId: string }> }
) {
  const ok = await checkAdmin();
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { roomId } = await params;
  const supabase = createServerSupabase();
  const { error } = await supabase.from("rooms").delete().eq("id", roomId);
  if (error) {
    console.error("[admin rooms delete]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
