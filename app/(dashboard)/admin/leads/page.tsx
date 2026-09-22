import { Localized, Text } from "@/components/preferences/Localized";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/viewings";
import Link from "@/components/preferences/LocalizedLink";
import { Users, ArrowUpRight, Mail, Phone } from "lucide-react";
export default async function Leads() {
    await requireStaff();
    const { data, error } = await createServerSupabase()
        .from("leads")
        .select("id,name,email,phone,room_name,status,source,created_at")
        .order("created_at", { ascending: false });
    if (error)
        throw new Error("Could not load leads");
    return (<main className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow"><Text>FROM INTEREST TO A FIRST HELLO</Text></span>
          <h1><Text>People, not just enquiries.</Text></h1>
          <p><Text>
            Keep every contact close, from their first viewing to finding a
            home.
          </Text></p>
        </div>
        <Link href="/admin/viewings" className="living-button"><Text>
          Manage viewings </Text><ArrowUpRight size={16}/>
        </Link>
      </div>
      <div className="pipeline-summary">
        <Localized>{[
            { key: "new", label: "New enquiries" },
            { key: "viewing_booked", label: "Viewing booked" },
            { key: "viewed", label: "Visited" },
        ].map((s) => (<div key={s.key}>
            <strong>
              <Localized>{data?.filter((l) => l.status === s.key).length || 0}</Localized>
            </strong>
            <span><Localized>{s.label}</Localized></span>
          </div>))}</Localized>
      </div>
      <section className="workspace-panel">
        <div className="panel-heading">
          <h2><Text>All leads</Text></h2>
          <span><Localized>{data?.length || 0}</Localized><Text> people</Text></span>
        </div>
        <Localized>{!data?.length ? (<div className="workspace-empty">
            <Users />
            <h3><Text>Your next resident starts here.</Text></h3>
            <p><Text>Publish available viewing times to start receiving bookings.</Text></p>
          </div>) : (<div className="lead-list">
            <Localized>{data.map((l) => (<article className="lead-row" key={l.id}>
                <span className="person-avatar"><Localized>{l.name.charAt(0)}</Localized></span>
                <div className="lead-identity">
                  <h3><span translate="no">{l.name}</span></h3>
                  <small>
                    <Localized>{l.room_name
                    ? `Desa Aman · Room ${l.room_name}`
                    : "Room preference not set"}</Localized>
                  </small>
                </div>
                <div className="lead-contact">
                  <Localized>{l.email && (<a href={`mailto:${l.email}`}>
                      <Mail size={14}/>
                      <Localized>{l.email}</Localized>
                    </a>)}</Localized>
                  <Localized>{l.phone && (<a href={`tel:${l.phone.replace(/[^+\d]/g, "")}`}>
                      <Phone size={14}/>
                      <Localized>{l.phone}</Localized>
                    </a>)}</Localized>
                  <Localized>{!l.phone && <small><Text>Phone not recorded</Text></small>}</Localized>
                </div>
                <span className="status-pill">
                  <Localized>{l.status.replaceAll("_", " ")}</Localized>
                </span>
              </article>))}</Localized>
          </div>)}</Localized>
      </section>
    </main>);
}
