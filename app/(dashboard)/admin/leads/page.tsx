import { createServerSupabase } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/viewings";
import Link from "next/link";
import { Users, ArrowUpRight, Mail, Phone } from "lucide-react";
export default async function Leads() {
  await requireStaff();
  const { data, error } = await createServerSupabase()
    .from("leads")
    .select("id,name,email,phone,room_name,status,source,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error("Could not load leads");
  return (
    <main className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">FROM INTEREST TO A FIRST HELLO</span>
          <h1>People, not just enquiries.</h1>
          <p>
            Keep every contact close, from their first viewing to finding a
            home.
          </p>
        </div>
        <Link href="/admin/viewings" className="living-button">
          Manage viewings <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="pipeline-summary">
        {[
          { key: "new", label: "New enquiries" },
          { key: "viewing_booked", label: "Viewing booked" },
          { key: "viewed", label: "Visited" },
        ].map((s) => (
          <div key={s.key}>
            <strong>
              {data?.filter((l) => l.status === s.key).length || 0}
            </strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
      <section className="workspace-panel">
        <div className="panel-heading">
          <h2>All leads</h2>
          <span>{data?.length || 0} people</span>
        </div>
        {!data?.length ? (
          <div className="workspace-empty">
            <Users />
            <h3>Your next resident starts here.</h3>
            <p>Publish available viewing times to start receiving bookings.</p>
          </div>
        ) : (
          <div className="lead-list">
            {data.map((l) => (
              <article className="lead-row" key={l.id}>
                <span className="person-avatar">{l.name.charAt(0)}</span>
                <div className="lead-identity">
                  <h3>{l.name}</h3>
                  <small>
                    {l.room_name
                      ? `Desa Aman · Room ${l.room_name}`
                      : "Room preference not set"}
                  </small>
                </div>
                <div className="lead-contact">
                  {l.email && (
                    <a href={`mailto:${l.email}`}>
                      <Mail size={14} />
                      {l.email}
                    </a>
                  )}
                  {l.phone && (
                    <a href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}>
                      <Phone size={14} />
                      {l.phone}
                    </a>
                  )}
                  {!l.phone && <small>Phone not recorded</small>}
                </div>
                <span className="status-pill">
                  {l.status.replaceAll("_", " ")}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
