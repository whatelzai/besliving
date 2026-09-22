import { requireStaff, viewingTime, pastWeek } from "@/lib/viewings";
import { createServerSupabase } from "@/lib/supabase/server";
import { SlotForm } from "./SlotForm";
import { completeViewing } from "./actions";
export default async function Viewings() {
  const user = await requireStaff();
  const db = createServerSupabase();
  const [
    { data: days, error: daysError },
    { data: overrides, error: overridesError },
  ] = await Promise.all([
    db
      .from("viewing_availability")
      .select("weekday,enabled,start_minute,end_minute")
      .eq("host_id", user.id),
    db
      .from("viewing_date_overrides")
      .select("date,enabled,start_minute,end_minute")
      .eq("host_id", user.id)
      .gte(
        "date",
        new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kuala_Lumpur",
        }),
      )
      .order("date"),
  ]);
  if (daysError || overridesError)
    throw new Error("Could not load availability");
  const { data, error } = await db
    .from("viewing_slots")
    .select(
      "id,host_id,starts_at,is_open,users(full_name),viewing_bookings!inner(id,status,leads(name,email,phone,room_name))",
    )
    .gt("starts_at", pastWeek())
    .order("starts_at")
    .returns<
      {
        id: string;
        host_id: string;
        starts_at: string;
        is_open: boolean;
        users: { full_name: string | null } | null;
        viewing_bookings: {
          id: string;
          status: string;
          leads: {
            name: string;
            email: string | null;
            phone: string | null;
            room_name: string | null;
          } | null;
        }[];
      }[]
    >();
  if (error) throw new Error("Could not load viewings");
  return (
    <main className="workspace-page">
      <span className="eyebrow">MAKE TIME FOR A FIRST HELLO</span>
      <h1 className="workspace-title">Viewings</h1>
      <p className="mt-2">
        Your weekly hours are bookable automatically. Visitors confirm
        immediately without an account. All times are Malaysia time.
      </p>
      <div className="schedule-layout">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Your availability</h2>
            <span className="status-pill">30-minute visits</span>
          </div>
          <SlotForm days={days || []} overrides={overrides || []} />
        </section>
      </div>
      <h2 className="text-xl font-semibold my-6">Team schedule</h2>
      <div className="space-y-4">
        {!data?.length && (
          <div className="workspace-panel workspace-empty">
            <h3>A little availability goes a long way.</h3>
            <p>
              Your default hours are already available. Confirmed visits will
              appear here.
            </p>
          </div>
        )}
        {data?.map((s) => (
          <section key={s.id} className="workspace-panel schedule-card">
            <h3 className="font-semibold">
              {viewingTime(s.starts_at)} · {s.users?.full_name}
            </h3>
            <p>
              {s.is_open
                ? "Within available hours"
                : "Outside current hours — contact the guest if you need to reschedule"}
            </p>
            {s.viewing_bookings
              .filter((b) => b.status !== "cancelled")
              .map((b) => (
                <div key={b.id} className="mt-3">
                  <p>
                    {b.leads?.name} · Room {b.leads?.room_name} · {b.status}
                  </p>
                  <p>
                    {b.leads?.email && (
                      <a className="text-link" href={`mailto:${b.leads.email}`}>
                        Email guest ↗
                      </a>
                    )}
                    {" · "}
                    {b.leads?.phone && (
                      <a
                        className="text-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://wa.me/${b.leads.phone.replace(/\D/g, "").replace(/^0/, "60")}`}
                      >
                        WhatsApp guest ↗
                      </a>
                    )}
                  </p>
                  <p>
                    {b.leads?.email} · {b.leads?.phone}
                  </p>
                  {b.status === "confirmed" && (
                    <form action={completeViewing}>
                      <input type="hidden" name="id" value={b.id} />
                      <button className="underline mt-2">
                        Mark viewing completed
                      </button>
                    </form>
                  )}
                </div>
              ))}
          </section>
        ))}
      </div>
    </main>
  );
}
