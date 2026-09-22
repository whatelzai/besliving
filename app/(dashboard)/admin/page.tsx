import { LocalizedDate } from "@/components/preferences/LocalizedDate";
import { Localized, Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import { ArrowUpRight, CalendarDays, Users, House, Clock3 } from "lucide-react";
import { requireStaff } from "@/lib/viewings";
import { createServerSupabase } from "@/lib/supabase/server";
export default async function AdminPage() {
    const user = await requireStaff();
    const db = createServerSupabase();
    const [leads, slots, tenants] = await Promise.all([
        db
            .from("leads")
            .select("id,name,status,room_name")
            .order("created_at", { ascending: false }),
        db
            .from("viewing_slots")
            .select("id,starts_at,users(full_name),viewing_bookings!inner(id,status,leads(name))", { count: "exact" })
            .eq("viewing_bookings.status", "confirmed")
            .gt("starts_at", new Date().toISOString())
            .order("starts_at")
            .limit(100)
            .returns<{
            id: string;
            starts_at: string;
            users: {
                full_name: string;
            } | null;
            viewing_bookings: {
                id: string;
                status: string;
                leads: {
                    name: string;
                } | null;
            }[];
        }[]>(),
        db
            .from("tenancies")
            .select("id", { head: true, count: "exact" })
            .eq("status", "active"),
    ]);
    if (leads.error || slots.error || tenants.error)
        throw new Error("Unable to load your overview. Please try again.");
    const upcoming = (slots.data || []).flatMap((s) => s.viewing_bookings
        .filter((b) => b.status === "confirmed")
        .map((b) => ({ ...b, starts_at: s.starts_at, host: s.users?.full_name })));
    return (<main className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow"><Text>YOUR HOME, WELL MANAGED</Text></span>
          <h1><Text>Hello, </Text><Localized>{user.full_name?.split(" ")[0] || "there"}</Localized><Text>.</Text></h1>
          <p><Text>A clear view of the people finding their next home.</Text></p>
        </div>
        <Link className="living-button" href="/admin/viewings"><Text>
          Edit viewing hours </Text><ArrowUpRight size={16}/>
        </Link>
      </div>
      <div className="metric-grid">
        <Link href="/admin/leads" className="metric-card">
          <Users />
          <span><Text>Total leads</Text></span>
          <strong><Localized>{leads.data?.length || 0}</Localized></strong>
          <small><Text>Every enquiry, in one place</Text></small>
        </Link>
        <Link href="/admin/viewings" className="metric-card">
          <CalendarDays />
          <span><Text>Upcoming viewings</Text></span>
          <strong><Localized>{slots.count || 0}</Localized></strong>
          <small><Text>Confirmed visits ahead</Text></small>
        </Link>
        <Link href="/admin/tenancies" className="metric-card">
          <House />
          <span><Text>Active tenancies</Text></span>
          <strong><Localized>{tenants.count || 0}</Localized></strong>
          <small><Text>People calling it home</Text></small>
        </Link>
      </div>
      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2><Text>Next through the door</Text></h2>
            <Link href="/admin/viewings"><Text>Full schedule ↗</Text></Link>
          </div>
          <Localized>{upcoming.length ? (upcoming.slice(0, 4).map((b) => (<div className="person-row" key={b.id}>
                <span className="row-icon">
                  <CalendarDays size={20}/>
                </span>
                <div>
                  <strong><span translate="no">{b.leads?.name}</span></strong>
                  <p>
                    <LocalizedDate value={b.starts_at}/><Text> · with </Text><Localized>{b.host}</Localized>
                  </p>
                </div>
                <span className="status-pill"><Text>Confirmed</Text></span>
              </div>))) : (<div className="workspace-empty">
              <Clock3 />
              <h3><Text>Room for a first hello.</Text></h3>
              <p><Text>
                Your daily hours are available for booking. Visitors can choose
                a 30-minute viewing straight from the website.
              </Text></p>
              <Link href="/admin/viewings" className="text-link"><Text>
                Edit your availability ↗
              </Text></Link>
            </div>)}</Localized>
        </section>
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2><Text>Recent leads</Text></h2>
            <Link href="/admin/leads"><Text>View all ↗</Text></Link>
          </div>
          <Localized>{leads.data?.length ? (leads.data.slice(0, 5).map((l) => (<div className="person-row" key={l.id}>
                <span className="person-avatar"><Localized>{l.name.charAt(0)}</Localized></span>
                <div>
                  <strong><span translate="no">{l.name}</span></strong>
                  <p>
                    <Localized>{l.room_name
                ? `Interested in ${l.room_name}`
                : "Finding their fit"}</Localized>
                  </p>
                </div>
                <span className="status-pill">
                  <Localized>{l.status.replaceAll("_", " ")}</Localized>
                </span>
              </div>))) : (<div className="workspace-empty">
              <Users />
              <h3><Text>Good conversations start here.</Text></h3>
              <p><Text>
                Your first booking will bring your first lead into this space.
              </Text></p>
            </div>)}</Localized>
        </section>
      </div>
      <div className="workspace-note">
        <span className="eyebrow"><Text>THE JOURNEY</Text></span>
        <p><Text>
          Discover a room </Text><span><Text>→</Text></span><Text> Book a viewing </Text><span><Text>→</Text></span><Text> Find the
          right fit </Text><span><Text>→</Text></span><Text> Move in
        </Text></p>
      </div>
    </main>);
}
