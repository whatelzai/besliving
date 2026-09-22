import { Localized, Text } from "@/components/preferences/Localized";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/db/user";
import { redirect } from "next/navigation";
import { ShieldCheck, Users } from "lucide-react";
export default async function Team() {
    const user = await getAppUser();
    if (user?.role !== "superadmin")
        redirect("/admin");
    const { data, error } = await createServerSupabase()
        .from("users")
        .select("id,full_name,email,role")
        .in("role", ["admin", "superadmin"])
        .order("created_at");
    if (error)
        throw new Error("Could not load team");
    return (<main className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow"><Text>A SMALL TEAM. A SHARED HOME.</Text></span>
          <h1><Text>Team & access</Text></h1>
          <p><Text>The people looking after Besliving, and what they can manage.</Text></p>
        </div>
        <span className="status-pill">
          <ShieldCheck size={15}/><Text>
          Superadmin only
        </Text></span>
      </div>
      <section className="workspace-panel">
        <div className="panel-heading">
          <h2><Text>Your team</Text></h2>
          <span><Localized>{data?.length || 0}</Localized><Text> members</Text></span>
        </div>
        <Localized>{data?.map((a) => (<div className="team-row" key={a.id}>
            <span className="person-avatar">
              <Localized>{(a.full_name || "?").charAt(0)}</Localized>
            </span>
            <div>
              <h3>
                <Localized>{a.full_name || a.email}</Localized>
                <Localized>{a.id === user.id && <small><Text> · You</Text></small>}</Localized>
              </h3>
              <p><span translate="no">{a.email}</span></p>
            </div>
            <span className="status-pill">
              <Localized>{a.role === "superadmin" ? "Superadmin" : "Admin"}</Localized>
            </span>
          </div>))}</Localized>
      </section>
      <div className="workspace-columns">
        <section className="workspace-panel role-explainer">
          <ShieldCheck />
          <h2><Text>Superadmin</Text></h2>
          <p><Text>
            Oversees the team, access and configuration, alongside day-to-day
            home management.
          </Text></p>
        </section>
        <section className="workspace-panel role-explainer">
          <Users />
          <h2><Text>Admin</Text></h2>
          <p><Text>
            Looks after leads, publishes viewing availability, and manages
            properties and tenancies.
          </Text></p>
        </section>
      </div>
    </main>);
}
