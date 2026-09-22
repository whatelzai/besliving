import { createServerSupabase } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/viewings";
import Link from "next/link";
export default async function Leads() {
  await requireStaff();
  const { data, error } = await createServerSupabase()
    .from("leads")
    .select("id,name,email,phone,room_name,status,source,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load leads");
  return (
    <main className="p-6 max-w-5xl mx-auto w-full">
      <h1 className="text-3xl font-semibold">Leads</h1>
      <p className="my-3">
        People interested in finding a room. A viewing is the next step; a
        signed tenancy comes later.
      </p>
      <Link href="/admin/viewings" className="living-button">
        Manage viewing times
      </Link>
      <div className="mt-6 space-y-3">
        {!data?.length && (
          <p>No leads yet. Publish viewing slots to get started.</p>
        )}
        {data?.map((l) => (
          <section className="border rounded-xl p-5" key={l.id}>
            <h2 className="text-lg font-semibold">{l.name}</h2>
            <p>
              {l.email} {l.phone}
            </p>
            <p className="mt-2">
              {l.room_name ? `Room ${l.room_name} · ` : ""}
              {l.status.replaceAll("_", " ")}
            </p>
            {l.source === "legacy_waitlist" && (
              <small>Preserved from the previous waitlist</small>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
