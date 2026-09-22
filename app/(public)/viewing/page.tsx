import { availableSlots } from "@/lib/viewings";
import { BookingForm } from "./BookingForm";
import Link from "next/link";
export const dynamic = "force-dynamic";
export default async function ViewingPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>;
}) {
  const { room } = await searchParams;
  const slots = await availableSlots();
  return (
    <main className="living-page">
      <div className="living-container room-detail">
        <span className="eyebrow">COME SAY HELLO</span>
        <h1>
          Find a time.
          <br />
          <em>See your next home.</em>
        </h1>
        <p className="page-intro">
          Book a viewing at Desa Aman with Edmund or Lisa. Pick an available
          time and we’ll confirm it immediately.
        </p>
        {slots.length ? (
          <BookingForm
            slots={slots}
            initialRoom={
              ["U1", "U2", "U3", "G2", "G3", "G4"].includes(
                room?.toUpperCase() || "",
              )
                ? room!.toUpperCase()
                : "U1"
            }
          />
        ) : (
          <section className="availability-card">
            <h2>New viewing times are on their way.</h2>
            <p>
              Our hosts haven’t published any available times yet. Please check
              back soon.
            </p>
            <Link href="/units/desa-aman" className="living-button">
              Explore the house
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
