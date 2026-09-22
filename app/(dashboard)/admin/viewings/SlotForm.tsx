"use client";
import { useActionState } from "react";
import { addSlot } from "./actions";
export function SlotForm() {
  const [state, action, pending] = useActionState(addSlot, { message: "" });
  return (
    <form action={action} className="booking-form">
      <label>
        Publish a 30-minute slot · Malaysia time
        <input type="datetime-local" name="starts" step={1800} required />
      </label>
      <p>
        Times start on the hour or half hour. Each slot accepts one booking.
      </p>
      <button className="living-button" disabled={pending}>
        {pending ? "Publishing…" : "Publish my available time"}
      </button>
      <p role="status">{state.message}</p>
    </form>
  );
}
