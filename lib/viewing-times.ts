export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function minuteLabel(minute: number, locale = "en-MY") {
  const date = new Date(Date.UTC(2026,0,1,Math.floor(minute/60),minute%60));
  const label = new Intl.DateTimeFormat(locale, {timeZone:"UTC",hour:"numeric",minute:"2-digit"}).format(date);
  return label + (minute === 1440 ? (locale.startsWith('zh') ? '（次日）' : locale.startsWith('ms') ? ' (hari berikutnya)' : ' (next day)') : '');
}
export function malaysiaDate(value: string) {
  return new Date(new Date(value).getTime() + 8 * 3600000)
    .toISOString()
    .slice(0, 10);
}
export function slotRange(start: string, end: string, locale = "en-MY") {
  const format = (v: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "Asia/Kuala_Lumpur",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(v));
  return `${format(start)} – ${format(end)}`;
}
export function dayLabel(date: string, locale = "en-MY") {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Kuala_Lumpur",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date + "T12:00:00+08:00"));
}
export type AvailabilityDay = {
  weekday: number;
  enabled: boolean;
  start_minute: number;
  end_minute: number;
};
export type DateOverride = {
  date: string;
  enabled: boolean;
  start_minute: number;
  end_minute: number;
};
