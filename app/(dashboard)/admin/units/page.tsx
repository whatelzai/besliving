import Link from "next/link";
import { Building2, ArrowUpRight } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function AdminUnitsPage() {
  const { data: units, error } = await createServerSupabase()
    .from("units")
    .select("id,title,city,is_published,rooms(id)")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load properties");
  return (
    <main className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">PLACES TO CALL HOME</span>
          <h1>Properties</h1>
          <p>Manage property and room records for your team.</p>
        </div>
        <Link href="/admin/units/new" className="living-button">
          Create property <ArrowUpRight size={16} />
        </Link>
      </div>
      <section className="workspace-panel">
        {!units?.length ? (
          <div className="workspace-empty">
            <Building2 />
            <h3>A fresh start.</h3>
            <p>
              No property records yet. The Desa Aman public tour is available
              separately while your team sets up room records.
            </p>
            <Link href="/units/desa-aman" className="text-link">
              Preview Desa Aman ↗
            </Link>
          </div>
        ) : (
          units.map((unit) => (
            <div key={unit.id} className="person-row">
              <span className="row-icon">
                <Building2 size={22} />
              </span>
              <div>
                <strong>{unit.title}</strong>
                <p>
                  {unit.city} · {unit.rooms?.length || 0} rooms
                </p>
              </div>
              <span className="status-pill neutral">
                {unit.is_published ? "Published" : "Draft"}
              </span>
              <Link href={`/admin/units/${unit.id}/edit`} className="text-link">
                Edit ↗
              </Link>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
