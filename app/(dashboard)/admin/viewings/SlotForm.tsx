"use client";
import { Translated } from "@/components/preferences/Translated";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { localeTag } from "@/lib/i18n";
import { Localized, Text } from "@/components/preferences/Localized";
import { useActionState, useState } from "react";
import { saveAvailability } from "./actions";
import { weekdays, minuteLabel, type AvailabilityDay, type DateOverride, dayLabel, } from "@/lib/viewing-times";
function Hours({ prefix, start = 540, end = 1020, }: {
    prefix: string;
    start?: number;
    end?: number;
}) {
    const { locale } = usePreferences();
    const dateLocale = localeTag[locale];
    return (<div className="hours-range">
      <Translated as="select" aria-label="Start time" name={`${prefix}start`} defaultValue={start}>
        <Localized>{Array.from({ length: 48 }, (_, i) => (<option key={i} value={i * 30}>
            <Localized>{minuteLabel(i * 30, dateLocale)}</Localized>
          </option>))}</Localized>
      </Translated>
      <span><Text>to</Text></span>
      <Translated as="select" aria-label="End time" name={`${prefix}end`} defaultValue={end}>
        <Localized>{Array.from({ length: 48 }, (_, i) => (<option key={i} value={(i + 1) * 30}>
            <Localized>{minuteLabel((i + 1) * 30, dateLocale)}</Localized>
          </option>))}</Localized>
      </Translated>
    </div>);
}
export function SlotForm({ days, overrides, }: {
    days: AvailabilityDay[];
    overrides: DateOverride[];
}) {
    const { locale } = usePreferences();
    const dateLocale = localeTag[locale];
    const [state, action, pending] = useActionState(saveAvailability, {
        message: "",
    });
    const [exception, exceptionAction, exceptionPending] = useActionState(saveAvailability, { message: "" });
    const [date, setDate] = useState("");
    const selected = overrides.find((o) => o.date === date);
    return (<div className="availability-editor">
      <form action={action}>
        <p className="availability-intro"><Text>
          Your weekly hours repeat automatically. All days start at 9am–5pm
          until you edit them. Each available half hour accepts one viewing per
          host.
        </Text></p>
        <div className="weekly-hours">
          <Localized>{[1, 2, 3, 4, 5, 6, 0].map((weekday) => {
            const day = days.find((d) => d.weekday === weekday);
            return (<div className="availability-day" key={weekday}>
                <label>
                  <input type="checkbox" name={`${weekday}-enabled`} defaultChecked={day?.enabled ?? true}/>
                  <strong><Localized>{weekdays[weekday]}</Localized></strong>
                </label>
                <Hours prefix={`${weekday}-`} start={day?.start_minute} end={day?.end_minute}/>
              </div>);
        })}</Localized>
        </div>
        <p className="availability-help"><Text>
          Uncheck a day to make it unavailable. Times are in Malaysia time
          (UTC+8).
        </Text></p>
        <button className="living-button" disabled={pending}>
          <Localized>{pending ? "Saving…" : "Save weekly hours"}</Localized>
        </button>
        <p role="status"><Localized>{state.message}</Localized></p>
      </form>
      <form action={exceptionAction} className="date-exceptions">
        <h3><Text>Different hours on a specific date?</Text></h3>
        <p><Text>
          Take a day off or override that day’s usual hours. Confirmed viewings
          stay in your schedule.
        </Text></p>
        <label className="exception-date"><Text>
          Date</Text><Localized>{" "}</Localized>
          <input type="date" required name="date" value={date} onChange={(e) => setDate(e.target.value)}/>
        </label>
        <div key={date} className="availability-day">
          <label>
            <input name="override-enabled" type="checkbox" defaultChecked={selected?.enabled ?? false}/><Text>
            Available on this date
          </Text></label>
          <Hours prefix="override-" start={selected?.start_minute} end={selected?.end_minute}/>
        </div>
        <div className="exception-actions">
          <button className="living-button" disabled={exceptionPending}>
            <Localized>{exceptionPending ? "Saving…" : "Save date exception"}</Localized>
          </button>
          <button className="text-link" name="reset" value="yes" disabled={exceptionPending}><Text>
            Use weekly hours
          </Text></button>
        </div>
        <p role="status"><Localized>{exception.message}</Localized></p>
        <Localized>{overrides.length > 0 && (<div className="exception-list">
            <Localized>{overrides.map((o) => (<button type="button" key={o.date} onClick={() => setDate(o.date)}>
                <Localized>{dayLabel(o.date, dateLocale)}</Localized><Text> ·</Text><Localized>{" "}</Localized>
                <Localized>{o.enabled
                    ? `${minuteLabel(o.start_minute, dateLocale)}–${minuteLabel(o.end_minute, dateLocale)}`
                    : "Unavailable"}</Localized>
              </button>))}</Localized>
          </div>)}</Localized>
      </form>
    </div>);
}
