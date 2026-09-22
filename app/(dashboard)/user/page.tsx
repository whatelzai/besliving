import Link from "next/link";
import { redirect } from "next/navigation";
import {
  House,
  Wallet,
  PlugZap,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/db/user";
type Tenancy = {
  id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  rooms: {
    name: string;
    price: number;
    units: { title: string } | null;
  } | null;
};
export default async function MyHome() {
  const user = await getAppUser();
  if (!user) return null;
  if (user.role === "admin" || user.role === "superadmin") redirect("/admin");
  const { data, error } = await createServerSupabase()
    .from("tenancies")
    .select("id,start_date,end_date,status,rooms(name,price,units(title))")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Tenancy[]>();
  if (error) throw new Error("Could not load your home");
  const active = data?.filter((t) => t.status === "active") || [];
  return (
    <main className="resident-page">
      <div className="workspace-page">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow">YOUR BESLIVING SPACE</span>
            <h1>
              {active.length ? "Welcome home" : "Hello"},{" "}
              {user.full_name?.split(" ")[0] || "there"}.
            </h1>
            <p>
              {active.length
                ? "The little essentials of home, all in one place."
                : "Your next chapter starts with a place that feels right."}
            </p>
          </div>
          <span className="status-pill">
            {active.length ? "Tenant" : "My account"}
          </span>
        </div>
        {active.length ? (
          <>
            {active.map((t) => (
              <section className="resident-home-card" key={t.id}>
                <House size={32} />
                <span className="eyebrow">YOUR HOME</span>
                <h2>
                  {t.rooms?.units?.title || "Your property"} ·{" "}
                  {t.rooms?.name || "Your room"}
                </h2>
                <p>
                  From {t.start_date}
                  {t.end_date ? ` until ${t.end_date}` : ""}
                </p>
                <span className="status-pill">Active tenancy</span>
              </section>
            ))}
            <div className="workspace-columns">
              <section className="workspace-panel role-explainer">
                <Wallet />
                <span className="eyebrow">RENT</span>
                <h2>A simpler way to pay.</h2>
                <p>
                  Bank transfer instructions and payment verification are being
                  prepared. Continue using the payment arrangement agreed with
                  your host.
                </p>
                <span className="status-pill neutral">Coming soon</span>
              </section>
              <section className="workspace-panel role-explainer">
                <PlugZap />
                <span className="eyebrow">UTILITIES</span>
                <h2>Stay comfortable.</h2>
                <p>
                  Your room’s usage and verified top-ups will appear here once
                  your meter is connected.
                </p>
                <span className="status-pill neutral">Not connected yet</span>
              </section>
            </div>
          </>
        ) : (
          <section className="resident-home-card">
            <CalendarDays size={32} />
            <span className="eyebrow">COME TAKE A LOOK</span>
            <h2>
              A first hello.
              <br />A possible new home.
            </h2>
            <p>
              Explore Desa Aman, then choose a time to meet your host and see
              the rooms.
            </p>
            <Link href="/viewing" className="living-button">
              Book a viewing <ArrowUpRight size={16} />
            </Link>
          </section>
        )}
        <section className="workspace-panel profile-note">
          <h2>Make yourself at home.</h2>
          <p>
            Signed in as {user.email}. To change your name or profile, open your
            avatar in the header and choose Manage account.
          </p>
        </section>
        {data?.some((t) => t.status !== "active") && (
          <section className="workspace-panel">
            <h2>Past stays</h2>
            {data
              .filter((t) => t.status !== "active")
              .map((t) => (
                <div key={t.id} className="person-row">
                  <div>
                    <strong>
                      {t.rooms?.units?.title} · {t.rooms?.name}
                    </strong>
                    <p>
                      {t.start_date} — {t.end_date || t.status}
                    </p>
                  </div>
                  <span className="status-pill neutral">{t.status}</span>
                </div>
              ))}
          </section>
        )}
      </div>
    </main>
  );
}
