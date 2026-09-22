import { requireStaff, viewingTime, pastWeek } from "@/lib/viewings";
import { createServerSupabase } from "@/lib/supabase/server";
import { SlotForm } from "./SlotForm";
import { closeSlot, completeViewing } from "./actions";
export default async function Viewings() {
  const user = await requireStaff();
  const { data, error } = await createServerSupabase()
    .from("viewing_slots")
    .select(
      "id,host_id,starts_at,is_open,users(full_name),viewing_bookings(id,status,leads(name,email,phone,room_name))",
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
        Publish your availability. Visitors book immediately without an account.
        All times are Malaysia time.
      </p>
      <div className="schedule-layout">
        <section className="workspace-panel">
          <div className="panel-heading">
            <h2>Your availability</h2>
            <span className="status-pill">30-minute visits</span>
          </div>
          <SlotForm />
        </section>
      </div>
      <h2 className="text-xl font-semibold my-6">Team schedule</h2>
      <div className="space-y-4">
        {!data?.length && (
          <div className="workspace-panel workspace-empty">
            <h3>A little availability goes a long way.</h3>
            <p>
              Publish your first slot above. It will appear on the public
              booking page immediately.
            </p>
          </div>
        )}
        {data?.map((s) => (
          <section key={s.id} className="workspace-panel schedule-card">
            <h3 className="font-semibold">
              {viewingTime(s.starts_at)} · {s.users?.full_name}
            </h3>
            <p>{s.is_open ? "Published" : "Closed to new bookings"}</p>
            {s.viewing_bookings
              .filter((b) => b.status !== "cancelled")
              .map((b) => (
                <div key={b.id} className="mt-3">
                  <p>
                    {b.leads?.name} · Room {b.leads?.room_name} · {b.status}
                  </p>
                  <p>
                    {b.leads?.email} {b.leads?.phone}
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
            {s.host_id === user.id && s.is_open && (
              <form action={closeSlot}>
                <input type="hidden" name="id" value={s.id} />
                <button className="underline mt-3">
                  Close to new bookings
                </button>
              </form>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
