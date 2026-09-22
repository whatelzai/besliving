"use client";
import { useActionState, useState } from "react";
import { saveAvailability } from "./actions";
import {
  weekdays,
  minuteLabel,
  type AvailabilityDay,
  type DateOverride,
  dayLabel,
} from "@/lib/viewing-times";
function Hours({
  prefix,
  start = 540,
  end = 1020,
}: {
  prefix: string;
  start?: number;
  end?: number;
}) {
  return (
    <div className="hours-range">
      <select
        aria-label={`${prefix}Start time`}
        name={`${prefix}start`}
        defaultValue={start}
      >
        {Array.from({ length: 48 }, (_, i) => (
          <option key={i} value={i * 30}>
            {minuteLabel(i * 30)}
          </option>
        ))}
      </select>
      <span>to</span>
      <select
        aria-label={`${prefix}End time`}
        name={`${prefix}end`}
        defaultValue={end}
      >
        {Array.from({ length: 48 }, (_, i) => (
          <option key={i} value={(i + 1) * 30}>
            {minuteLabel((i + 1) * 30)}
          </option>
        ))}
      </select>
    </div>
  );
}
export function SlotForm({
  days,
  overrides,
}: {
  days: AvailabilityDay[];
  overrides: DateOverride[];
}) {
  const [state, action, pending] = useActionState(saveAvailability, {
    message: "",
  });
  const [exception, exceptionAction, exceptionPending] = useActionState(
    saveAvailability,
    { message: "" },
  );
  const [date, setDate] = useState("");
  const selected = overrides.find((o) => o.date === date);
  return (
    <div className="availability-editor">
      <form action={action}>
        <p className="availability-intro">
          Your weekly hours repeat automatically. All days start at 9am–5pm
          until you edit them. Each available half hour accepts one viewing per
          host.
        </p>
        <div className="weekly-hours">
          {[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
            const day = days.find((d) => d.weekday === weekday);
            return (
              <div className="availability-day" key={weekday}>
                <label>
                  <input
                    type="checkbox"
                    name={`${weekday}-enabled`}
                    defaultChecked={day?.enabled ?? true}
                  />
                  <strong>{weekdays[weekday]}</strong>
                </label>
                <Hours
                  prefix={`${weekday}-`}
                  start={day?.start_minute}
                  end={day?.end_minute}
                />
              </div>
            );
          })}
        </div>
        <p className="availability-help">
          Uncheck a day to make it unavailable. Times are in Malaysia time
          (UTC+8).
        </p>
        <button className="living-button" disabled={pending}>
          {pending ? "Saving…" : "Save weekly hours"}
        </button>
        <p role="status">{state.message}</p>
      </form>
      <form action={exceptionAction} className="date-exceptions">
        <h3>Different hours on a specific date?</h3>
        <p>
          Take a day off or override that day’s usual hours. Confirmed viewings
          stay in your schedule.
        </p>
        <label className="exception-date">
          Date{" "}
          <input
            type="date"
            required
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <div key={date} className="availability-day">
          <label>
            <input
              name="override-enabled"
              type="checkbox"
              defaultChecked={selected?.enabled ?? false}
            />
            Available on this date
          </label>
          <Hours
            prefix="override-"
            start={selected?.start_minute}
            end={selected?.end_minute}
          />
        </div>
        <div className="exception-actions">
          <button className="living-button" disabled={exceptionPending}>
            {exceptionPending ? "Saving…" : "Save date exception"}
          </button>
          <button
            className="text-link"
            name="reset"
            value="yes"
            disabled={exceptionPending}
          >
            Use weekly hours
          </button>
        </div>
        <p role="status">{exception.message}</p>
        {overrides.length > 0 && (
          <div className="exception-list">
            {overrides.map((o) => (
              <button
                type="button"
                key={o.date}
                onClick={() => setDate(o.date)}
              >
                {dayLabel(o.date)} ·{" "}
                {o.enabled
                  ? `${minuteLabel(o.start_minute)}–${minuteLabel(o.end_minute)}`
                  : "Unavailable"}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}
