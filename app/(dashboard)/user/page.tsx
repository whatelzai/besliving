import { Localized, Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import { redirect } from "next/navigation";
import { House, Wallet, PlugZap, CalendarDays, ArrowUpRight, } from "lucide-react";
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
        units: {
            title: string;
        } | null;
    } | null;
};
export default async function MyHome() {
    const user = await getAppUser();
    if (!user)
        return null;
    if (user.role === "admin" || user.role === "superadmin")
        redirect("/admin");
    const { data, error } = await createServerSupabase()
        .from("tenancies")
        .select("id,start_date,end_date,status,rooms(name,price,units(title))")
        .eq("tenant_id", user.id)
        .order("created_at", { ascending: false })
        .returns<Tenancy[]>();
    if (error)
        throw new Error("Could not load your home");
    const active = data?.filter((t) => t.status === "active") || [];
    return (<main className="resident-page">
      <div className="workspace-page">
        <div className="workspace-heading">
          <div>
            <span className="eyebrow"><Text>YOUR BESLIVING SPACE</Text></span>
            <h1>
              <Localized>{active.length ? "Welcome home" : "Hello"}</Localized><Text>,</Text><Localized>{" "}</Localized>
              <Localized>{user.full_name?.split(" ")[0] || "there"}</Localized><Text>.
            </Text></h1>
            <p>
              <Localized>{active.length
            ? "The little essentials of home, all in one place."
            : "Your next chapter starts with a place that feels right."}</Localized>
            </p>
          </div>
          <span className="status-pill">
            <Localized>{active.length ? "Tenant" : "My account"}</Localized>
          </span>
        </div>
        <Localized>{active.length ? (<>
            <Localized>{active.map((t) => (<section className="resident-home-card" key={t.id}>
                <House size={32}/>
                <span className="eyebrow"><Text>YOUR HOME</Text></span>
                <h2>
                  <Localized>{t.rooms?.units?.title || "Your property"}</Localized><Text> ·</Text><Localized>{" "}</Localized>
                  <Localized>{t.rooms?.name || "Your room"}</Localized>
                </h2>
                <p><Text>
                  From </Text><Localized>{t.start_date}</Localized>
                  <Localized>{t.end_date ? ` until ${t.end_date}` : ""}</Localized>
                </p>
                <span className="status-pill"><Text>Active tenancy</Text></span>
              </section>))}</Localized>
            <div className="workspace-columns">
              <section className="workspace-panel role-explainer">
                <Wallet />
                <span className="eyebrow"><Text>RENT</Text></span>
                <h2><Text>A simpler way to pay.</Text></h2>
                <p><Text>
                  Bank transfer instructions and payment verification are being
                  prepared. Continue using the payment arrangement agreed with
                  your host.
                </Text></p>
                <span className="status-pill neutral"><Text>Coming soon</Text></span>
              </section>
              <section className="workspace-panel role-explainer">
                <PlugZap />
                <span className="eyebrow"><Text>UTILITIES</Text></span>
                <h2><Text>Stay comfortable.</Text></h2>
                <p><Text>
                  Your room’s usage and verified top-ups will appear here once
                  your meter is connected.
                </Text></p>
                <span className="status-pill neutral"><Text>Not connected yet</Text></span>
              </section>
            </div>
          </>) : (<section className="resident-home-card">
            <CalendarDays size={32}/>
            <span className="eyebrow"><Text>COME TAKE A LOOK</Text></span>
            <h2><Text>
              A first hello.
              </Text><br /><Text>A possible new home.
            </Text></h2>
            <p><Text>
              Explore Desa Aman, then choose a time to meet your host and see
              the rooms.
            </Text></p>
            <Link href="/viewing" className="living-button"><Text>
              Book a viewing </Text><ArrowUpRight size={16}/>
            </Link>
          </section>)}</Localized>
        <section className="workspace-panel profile-note">
          <h2><Text>Make yourself at home.</Text></h2>
          <p><Text>
            Signed in as </Text><Localized>{user.email}</Localized><Text>. To change your name or profile, open your
            avatar in the header and choose Manage account.
          </Text></p>
        </section>
        <Localized>{data?.some((t) => t.status !== "active") && (<section className="workspace-panel">
            <h2><Text>Past stays</Text></h2>
            <Localized>{data
                .filter((t) => t.status !== "active")
                .map((t) => (<div key={t.id} className="person-row">
                  <div>
                    <strong>
                      <Localized>{t.rooms?.units?.title}</Localized><Text> · </Text><Localized>{t.rooms?.name}</Localized>
                    </strong>
                    <p>
                      <Localized>{t.start_date}</Localized><Text> — </Text><Localized>{t.end_date || t.status}</Localized>
                    </p>
                  </div>
                  <span className="status-pill neutral"><Localized>{t.status}</Localized></span>
                </div>))}</Localized>
          </section>)}</Localized>
      </div>
    </main>);
}
