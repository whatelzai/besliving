"use client";
import { Translated } from "@/components/preferences/Translated";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { localeTag } from "@/lib/i18n";
import { Localized, Text } from "@/components/preferences/Localized";
import { useActionState, useState } from "react";
import Link from "@/components/preferences/LocalizedLink";
import { malaysiaDate, slotRange, dayLabel } from "@/lib/viewing-times";
import { bookViewing } from "./actions";
type Slot = {
    id: string;
    starts_at: string;
    ends_at: string;
};
const time = (d: string, locale: string) => new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
}).format(new Date(d));
export function BookingForm({ slots, initialRoom, }: {
    slots: Slot[];
    initialRoom: string;
}) {
    const { locale } = usePreferences();
    const dateLocale = localeTag[locale];
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
        return (<section className="availability-card" role="status">
        <span className="eyebrow"><Text>YOU’RE BOOKED</Text></span>
        <h2><Text>See you at Desa Aman.</Text></h2>
        <p>
          <Localized>{selected && time(selected.starts_at, dateLocale)}</Localized><Text> · 30 minutes · Malaysia time
        </Text></p>
        <p><Text>
          Our team will use the contact details
          you provided to arrange arrival details.
        </Text></p>
        <p><Text>
          Reference: </Text><strong><Localized>{state.bookingId}</Localized></strong>
        </p>
        <p><Text>
          Save this confirmation. No email or SMS confirmation is sent yet. To
          change your viewing, speak with your host when they contact you.
        </Text></p>
        <Link className="living-button" href="/units/desa-aman"><Text>
          Explore the rooms
        </Text></Link>
      </section>);
    return (<form action={action} className="booking-form">
      <div className="booking-step">
        <span><Text>01</Text></span>
        <div>
          <h2><Text>Your visit</Text></h2>
          <p><Text>A little time to see if it feels like home.</Text></p>
        </div>
      </div>
      <label><Text>
        Room
        </Text><select name="room" defaultValue={initialRoom}>
          <Localized>{["U1", "U2", "U3", "G2", "G3", "G4"].map((r) => (<option key={r} value={r}><Localized>{r}</Localized></option>))}</Localized>
        </select>
      </label>
      <fieldset>
        <legend><Text>Choose a day · Malaysia time (UTC+8)</Text></legend>
        <Translated as="div" className="viewing-days" role="group" aria-label="Available dates">
          <Localized>{dates.map((date) => (<button type="button" key={date} aria-pressed={day === date} onClick={() => {
                setDay(date);
                setSlotId("");
            }}>
              <Localized>{dayLabel(date, dateLocale)}</Localized>
            </button>))}</Localized>
        </Translated>
      </fieldset>
      <fieldset>
        <legend><Localized>{dayLabel(day, dateLocale)}</Localized><Text> · Choose a 30-minute time</Text></legend>
        <div className="slot-grid pooled-slot-grid">
          <Localized>{cells.map(({ start, end, slot: s }) => s ? (<label key={s.id} className={slotId === s.id ? "slot selected" : "slot"}>
              <input type="radio" name="slot" value={s.id} required checked={slotId === s.id} onChange={() => setSlotId(s.id)}/>
              <span>
                <Localized>{slotRange(s.starts_at, s.ends_at, dateLocale)}</Localized>
              </span>
            </label>) : (<div key={start} className="slot unavailable" aria-disabled="true">
              <span><Localized>{slotRange(start, end, dateLocale)}</Localized><small><Text>Unavailable</Text></small></span>
            </div>))}</Localized>
        </div>
      </fieldset>
      <div className="booking-step">
        <span><Text>02</Text></span>
        <div>
          <h2><Text>Let’s stay in touch</Text></h2>
          <p><Text>
            We’ll use these details to arrange your arrival and follow up about
            the viewing.
          </Text></p>
        </div>
      </div>
      <label><Text>
        Your name
        </Text><input name="name" autoComplete="name" required maxLength={100}/>
      </label>
      <div className="booking-columns">
        <label><Text>
          Email
          </Text><input required type="email" name="email" autoComplete="email" maxLength={254}/>
        </label>
        <label><Text>
          WhatsApp number
          </Text><Translated as="input" required type="tel" placeholder="e.g. +60123456789" name="phone" autoComplete="tel" maxLength={30}/>
        </label>
      </div>
      <p><Text>
        Both email and WhatsApp number are required so our team can reach you
        about your viewing. No account needed.
      </Text></p>
      <div hidden>
        <label><Text>
          Website
          </Text><input name="website" tabIndex={-1} autoComplete="off"/>
        </label>
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required/><Text>I agree that Besliving
        may use these details to manage and contact me about this viewing.
      </Text></label>
      <Localized>{state.error && (<p role="alert" className="text-red-700">
          <Localized>{state.error}</Localized>
        </p>)}</Localized>
      <button className="living-button" disabled={pending || !selected}>
        <Localized>{pending ? "Confirming…" : "Confirm viewing"}</Localized>
      </button>
      <p><Text>
        Booking a viewing does not reserve a room or confirm a rental price.
      </Text></p>
    </form>);
}
