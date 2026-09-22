import { Localized, Text } from "@/components/preferences/Localized";
import { availableSlots } from "@/lib/viewings";
import { BookingForm } from "./BookingForm";
import Link from "@/components/preferences/LocalizedLink";
export const dynamic = "force-dynamic";
export default async function ViewingPage({ searchParams, }: {
    searchParams: Promise<{
        room?: string;
    }>;
}) {
    const { room } = await searchParams;
    const slots = await availableSlots();
    return (<main className="living-page">
      <div className="living-container room-detail viewing-layout">
        <span className="eyebrow"><Text>COME SAY HELLO</Text></span>
        <h1><Text>
          Find a time.
          </Text><br />
          <em><Text>See your next home.</Text></em>
        </h1>
        <p className="page-intro"><Text>
          Book a viewing at Desa Aman. Pick an available
          time and we’ll confirm it immediately.
        </Text></p>
        <div className="viewing-body">
          <aside className="visit-summary">
            <span className="eyebrow"><Text>YOUR FIRST LOOK</Text></span>
            <h2><Text>Desa Aman</Text></h2>
            <p><Text>A relaxed, 30-minute visit with our team.</Text></p>
            <ul>
              <li><Text>See the rooms in person</Text></li>
              <li><Text>Ask about rent and move-in timing</Text></li>
              <li><Text>Get a feel for the home</Text></li>
            </ul>
            <small><Text>
              Malaysia time · UTC+8
              </Text><br /><Text>
              No account or payment needed
            </Text></small>
          </aside>
          <div>
            <Localized>{slots.length ? (<BookingForm slots={slots} initialRoom={["U1", "U2", "U3", "G2", "G3", "G4"].includes(room?.toUpperCase() || "")
                ? room!.toUpperCase()
                : "U1"}/>) : (<section className="availability-card">
                <h2><Text>New viewing times are on their way.</Text></h2>
                <p><Text>
                  Our hosts haven’t published any available times yet. Please
                  check back soon.
                </Text></p>
                <Link href="/units/desa-aman" className="living-button"><Text>
                  Explore the house
                </Text></Link>
              </section>)}</Localized>
          </div>
        </div>
      </div>
    </main>);
}
