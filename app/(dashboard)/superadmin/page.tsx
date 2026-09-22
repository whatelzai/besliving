import { createServerSupabase } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/db/user";
import { redirect } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";
export default async function Team() {
  const user = await getAppUser();
  if (user?.role !== "superadmin") redirect("/admin");
  const { data, error } = await createServerSupabase()
    .from("users")
    .select("id,full_name,email,role")
    .in("role", ["admin", "superadmin"])
    .order("created_at");
  if (error) throw new Error("Could not load team");
  return (
    <main className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">A SMALL TEAM. A SHARED HOME.</span>
          <h1>Team & access</h1>
          <p>The people looking after Besliving, and what they can manage.</p>
        </div>
        <span className="status-pill">
          <ShieldCheck size={15} />
          Superadmin only
        </span>
      </div>
      <section className="workspace-panel">
        <div className="panel-heading">
          <h2>Your team</h2>
          <span>{data?.length || 0} members</span>
        </div>
        {data?.map((a) => (
          <div className="team-row" key={a.id}>
            <span className="person-avatar">
              {(a.full_name || "?").charAt(0)}
            </span>
            <div>
              <h3>
                {a.full_name || a.email}
                {a.id === user.id && <small> · You</small>}
              </h3>
              <p>{a.email}</p>
            </div>
            <span className="status-pill">
              {a.role === "superadmin" ? "Superadmin" : "Admin"}
            </span>
          </div>
        ))}
      </section>
      <div className="workspace-columns">
        <section className="workspace-panel role-explainer">
          <ShieldCheck />
          <h2>Superadmin</h2>
          <p>
            Oversees the team, access and configuration, alongside day-to-day
            home management.
          </p>
        </section>
        <section className="workspace-panel role-explainer">
          <Users />
          <h2>Admin</h2>
          <p>
            Looks after leads, publishes viewing availability, and manages
            properties and tenancies.
          </p>
        </section>
      </div>
    </main>
  );
}
