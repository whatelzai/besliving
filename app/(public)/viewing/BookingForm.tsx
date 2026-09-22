"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { bookViewing } from "./actions";
type Slot = { id: string; starts_at: string; ends_at: string; host: string };
const time = (d: string) =>
  new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(d));
export function BookingForm({
  slots,
  initialRoom,
}: {
  slots: Slot[];
  initialRoom: string;
}) {
  const [state, action, pending] = useActionState(bookViewing, {});
  const [slotId, setSlotId] = useState("");
  const selected = slots.find((s) => s.id === slotId);
  if (state.bookingId)
    return (
      <section className="availability-card" role="status">
        <span className="eyebrow">YOU’RE BOOKED</span>
        <h2>See you at Desa Aman.</h2>
        <p>
          {selected && time(selected.starts_at)} · 30 minutes · Malaysia time
        </p>
        <p>
          Your host: {selected?.host}. Your host will use the contact details
          you provided to arrange arrival details.
        </p>
        <p>
          Reference: <strong>{state.bookingId}</strong>
        </p>
        <p>
          Save this confirmation. No email or SMS confirmation is sent yet. To
          change your viewing, speak with your host when they contact you.
        </p>
        <Link className="living-button" href="/units/desa-aman">
          Explore the rooms
        </Link>
      </section>
    );
  return (
    <form action={action} className="booking-form">
      <label>
        Room
        <select name="room" defaultValue={initialRoom}>
          {["U1", "U2", "U3", "G2", "G3", "G4"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Choose a 30-minute viewing · Malaysia time (UTC+8)</legend>
        <div className="slot-grid">
          {slots.map((s) => (
            <label
              key={s.id}
              className={slotId === s.id ? "slot selected" : "slot"}
            >
              <input
                type="radio"
                name="slot"
                value={s.id}
                required
                onChange={() => setSlotId(s.id)}
              />
              <span>
                {time(s.starts_at)}
                <small>With {s.host}</small>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Your name
        <input name="name" autoComplete="name" required maxLength={100} />
      </label>
      <div className="booking-columns">
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
          />
        </label>
        <label>
          Phone
          <input type="tel" name="phone" autoComplete="tel" maxLength={30} />
        </label>
      </div>
      <p>Provide at least one contact method. No account needed.</p>
      <div hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />I agree that Besliving
        may use these details to manage and contact me about this viewing.
      </label>
      {state.error && (
        <p role="alert" className="text-red-700">
          {state.error}
        </p>
      )}
      <button className="living-button" disabled={pending || !selected}>
        {pending ? "Confirming…" : "Confirm viewing"}
      </button>
      <p>
        Booking a viewing does not reserve a room or confirm a rental price.
      </p>
    </form>
  );
}
