import Link from "next/link";
import { ArrowUpRight, CalendarDays, Users, House, Clock3 } from "lucide-react";
import { requireStaff, viewingTime } from "@/lib/viewings";
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
      .select(
        "id,starts_at,users(full_name),viewing_bookings!inner(id,status,leads(name))",
        { count: "exact" },
      )
      .eq("viewing_bookings.status", "confirmed")
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(100)
      .returns<
        {
          id: string;
          starts_at: string;
          users: { full_name: string } | null;
          viewing_bookings: {
            id: string;
            status: string;
            leads: { name: string } | null;
          }[];
        }[]
      >(),
    db
      .from("tenancies")
      .select("id", { head: true, count: "exact" })
      .eq("status", "active"),
  ]);
  if (leads.error || slots.error || tenants.error)
    throw new Error("Unable to load your overview. Please try again.");
  const upcoming = (slots.data || []).flatMap((s) =>
    s.viewing_bookings
      .filter((b) => b.status === "confirmed")
      .map((b) => ({ ...b, starts_at: s.starts_at, host: s.users?.full_name })),
  );
  return (
    <main className="workspace-page">
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">YOUR HOME, WELL MANAGED</span>
          <h1>Hello, {user.full_name?.split(" ")[0] || "there"}.</h1>
          <p>A clear view of the people finding their next home.</p>
        </div>
        <Link className="living-button" href="/admin/viewings">
          Edit viewing hours <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="metric-grid">
        <Link href="/admin/leads" className="metric-card">
          <Users />
          <span>Total leads</span>
          <strong>{leads.data?.length || 0}</strong>
          <small>Every enquiry, in one place</small>
        </Link>
        <Link href="/admin/viewings" className="metric-card">
          <CalendarDays />
          <span>Upcoming viewings</span>
          <strong>{slots.count || 0}</strong>
          <small>Confirmed visits ahead</small>
        </Link>
        <Link href="/admin/tenancies" className="metric-card">
          <House />
          <span>Active tenancies</span>
          <strong>{tenants.count || 0}</strong>
          <small>People calling it home</small>
        </Link>
      </div>
      <div className="workspace-columns">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Next through the door</h2>
            <Link href="/admin/viewings">Full schedule ↗</Link>
          </div>
          {upcoming.length ? (
            upcoming.slice(0, 4).map((b) => (
              <div className="person-row" key={b.id}>
                <span className="row-icon">
                  <CalendarDays size={20} />
                </span>
                <div>
                  <strong>{b.leads?.name}</strong>
                  <p>
                    {viewingTime(b.starts_at)} · with {b.host}
                  </p>
                </div>
                <span className="status-pill">Confirmed</span>
              </div>
            ))
          ) : (
            <div className="workspace-empty">
              <Clock3 />
              <h3>Room for a first hello.</h3>
              <p>
                Your daily hours are available for booking. Visitors can choose
                a 30-minute viewing straight from the website.
              </p>
              <Link href="/admin/viewings" className="text-link">
                Edit your availability ↗
              </Link>
            </div>
          )}
        </section>
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Recent leads</h2>
            <Link href="/admin/leads">View all ↗</Link>
          </div>
          {leads.data?.length ? (
            leads.data.slice(0, 5).map((l) => (
              <div className="person-row" key={l.id}>
                <span className="person-avatar">{l.name.charAt(0)}</span>
                <div>
                  <strong>{l.name}</strong>
                  <p>
                    {l.room_name
                      ? `Interested in ${l.room_name}`
                      : "Finding their fit"}
                  </p>
                </div>
                <span className="status-pill">
                  {l.status.replaceAll("_", " ")}
                </span>
              </div>
            ))
          ) : (
            <div className="workspace-empty">
              <Users />
              <h3>Good conversations start here.</h3>
              <p>
                Your first booking will bring your first lead into this space.
              </p>
            </div>
          )}
        </section>
      </div>
      <div className="workspace-note">
        <span className="eyebrow">THE JOURNEY</span>
        <p>
          Discover a room <span>→</span> Book a viewing <span>→</span> Find the
          right fit <span>→</span> Move in
        </p>
      </div>
    </main>
  );
}
