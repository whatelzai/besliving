"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { malaysiaDate, slotRange, dayLabel } from "@/lib/viewing-times";
import { bookViewing } from "./actions";
type Slot = { id: string; starts_at: string; ends_at: string };
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
  const dates = [...new Set(slots.map((s) => malaysiaDate(s.starts_at)))];
  const [day, setDay] = useState(dates[0] || "");
  const daySlots = slots.filter((s) => malaysiaDate(s.starts_at) === day);
  const hours = [...new Set(daySlots.map((s) => Math.floor(new Date(s.starts_at).getTime() / 3600000)))];
  const cells = hours.flatMap((hour) => [0, 30].map((minute) => {
    const start = new Date(hour * 3600000 + minute * 60000).toISOString();
    return { start, end: new Date(new Date(start).getTime() + 1800000).toISOString(), slot: daySlots.find((s) => new Date(s.starts_at).getTime() === new Date(start).getTime()) };
  }));
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
          Our team will use the contact details
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
      <div className="booking-step">
        <span>01</span>
        <div>
          <h2>Your visit</h2>
          <p>A little time to see if it feels like home.</p>
        </div>
      </div>
      <label>
        Room
        <select name="room" defaultValue={initialRoom}>
          {["U1", "U2", "U3", "G2", "G3", "G4"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend>Choose a day · Malaysia time (UTC+8)</legend>
        <div className="viewing-days" role="group" aria-label="Available dates">
          {dates.map((date) => (
            <button
              type="button"
              key={date}
              aria-pressed={day === date}
              onClick={() => {
                setDay(date);
                setSlotId("");
              }}
            >
              {dayLabel(date)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>{dayLabel(day)} · Choose a 30-minute time</legend>
        <div className="slot-grid pooled-slot-grid">
          {cells.map(({ start, end, slot: s }) => s ? (
            <label
              key={s.id}
              className={slotId === s.id ? "slot selected" : "slot"}
            >
              <input
                type="radio"
                name="slot"
                value={s.id}
                required
                checked={slotId === s.id}
                onChange={() => setSlotId(s.id)}
              />
              <span>
                {slotRange(s.starts_at, s.ends_at)}
              </span>
            </label>
          ) : (
            <div key={start} className="slot unavailable" aria-disabled="true">
              <span>{slotRange(start, end)}<small>Unavailable</small></span>
            </div>
          ))}
        </div>
      </fieldset>
      <div className="booking-step">
        <span>02</span>
        <div>
          <h2>Let’s stay in touch</h2>
          <p>
            We’ll use these details to arrange your arrival and follow up about
            the viewing.
          </p>
        </div>
      </div>
      <label>
        Your name
        <input name="name" autoComplete="name" required maxLength={100} />
      </label>
      <div className="booking-columns">
        <label>
          Email
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            maxLength={254}
          />
        </label>
        <label>
          WhatsApp number
          <input
            required
            type="tel"
            placeholder="e.g. +60123456789"
            name="phone"
            autoComplete="tel"
            maxLength={30}
          />
        </label>
      </div>
      <p>
        Both email and WhatsApp number are required so our team can reach you
        about your viewing. No account needed.
      </p>
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
