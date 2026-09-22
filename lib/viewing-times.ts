export const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
export function minuteLabel(minute: number) {
  if (minute === 1440) return "12:00 am (next day)";
  const hour = Math.floor(minute / 60);
  return `${hour % 12 || 12}:${String(minute % 60).padStart(2, "0")} ${hour < 12 ? "am" : "pm"}`;
}
export function malaysiaDate(value: string) {
  return new Date(new Date(value).getTime() + 8 * 3600000)
    .toISOString()
    .slice(0, 10);
}
export function slotRange(start: string, end: string) {
  const format = (v: string) =>
    new Intl.DateTimeFormat("en-MY", {
      timeZone: "Asia/Kuala_Lumpur",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(v));
  return `${format(start)} – ${format(end)}`;
}
export function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en-MY", {
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
