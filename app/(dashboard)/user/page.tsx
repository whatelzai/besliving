import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/db/user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function UserDashboardPage() {
  const user = await getAppUser();
  if (!user) return null;

  const supabase = createServerSupabase();

  const { data: tenancies } = await supabase
    .from("tenancies")
    .select(`
      id, start_date, end_date, status,
      rooms (id, name, price, unit_id, units (id, title, city))
    `)
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false });

  const { data: waitlist } = await supabase
    .from("waitlist_registrations")
    .select(`
      id, status, created_at,
      rooms (id, name, unit_id, units (id, title, city))
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const activeTenancies = (tenancies ?? []).filter((t) => t.status === "active");
  const pastTenancies = (tenancies ?? []).filter(
    (t) => t.status === "ended" || t.status === "cancelled"
  );

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#fefefe]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-[#1f2937]">My dashboard</h1>
        <p className="mt-1 text-[#6b7280]">
          Manage your profile and tenancy
        </p>

        <div className="mt-8 space-y-8">
          <p>To change your display name, open your profile avatar and choose Manage account. Your chosen name takes precedence over your email.</p>
          {["admin", "superadmin"].includes(user.role) && <Link href="/admin" className="living-button">Manage leads and viewings</Link>}
          <Card>
            <CardHeader>
              <CardTitle>Active tenancy</CardTitle>
              <CardDescription>
                {activeTenancies.length
                  ? "Your current room"
                  : "You have no active tenancy"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!activeTenancies.length ? (
                <p className="text-[#6b7280]">
                  Book a viewing to find a room that suits you.
                </p>
              ) : (
                <ul className="space-y-3">
                  {activeTenancies.map((t) => {
                    const r = Array.isArray(t.rooms) ? t.rooms[0] : t.rooms;
                    const units = r && typeof r === "object" && "units" in r ? (Array.isArray((r as { units: unknown }).units) ? (r as { units: unknown[] }).units[0] : (r as { units: { title?: string } }).units) : null;
                    return (
                    <li
                      key={t.id}
                      className="rounded-lg border border-[#e9e3f5] p-4"
                    >
                      <p className="font-medium">
                        {(units as { title?: string })?.title ?? "—"} / {(r as { name?: string })?.name ?? "—"}
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        {t.start_date}
                        {t.end_date ? ` → ${t.end_date}` : ""}
                      </p>
                      <Link
                        href={`/units/${(r as { unit_id?: string })?.unit_id}/rooms/${(r as { id?: string })?.id}`}
                        className="mt-2 inline-block text-sm font-medium text-[#2ec4b6] hover:underline"
                      >
                        View room →
                      </Link>
                    </li>
                  );})}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Past tenancies</CardTitle>
              <CardDescription>{pastTenancies.length} ended</CardDescription>
            </CardHeader>
            <CardContent>
              {!pastTenancies.length ? (
                <p className="text-[#6b7280]">No past tenancies</p>
              ) : (
                <ul className="space-y-3">
                  {pastTenancies.map((t) => {
                    const r = Array.isArray(t.rooms) ? t.rooms[0] : t.rooms;
                    const units = r && typeof r === "object" && "units" in r ? (Array.isArray((r as { units: unknown }).units) ? (r as { units: unknown[] }).units[0] : (r as { units: { title?: string } }).units) : null;
                    return (
                    <li
                      key={t.id}
                      className="rounded-lg border border-[#e9e3f5] p-4 opacity-75"
                    >
                      <p className="font-medium">
                        {(units as { title?: string })?.title ?? "—"} / {(r as { name?: string })?.name ?? "—"}
                      </p>
                      <p className="text-sm text-[#6b7280]">
                        {t.start_date} → {t.end_date ?? "—"} · {t.status}
                      </p>
                    </li>
                  );})}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Waitlist</CardTitle>
              <CardDescription>
                {waitlist?.length ?? 0} entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!waitlist?.length ? (
                <p className="text-[#6b7280]">
                  You haven&apos;t joined any waitlists yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {(waitlist ?? []).map((w) => {
                    const r = Array.isArray(w.rooms) ? w.rooms[0] : w.rooms;
                    const units = r && typeof r === "object" && "units" in r ? (Array.isArray((r as { units: unknown }).units) ? (r as { units: unknown[] }).units[0] : (r as { units: { title?: string } }).units) : null;
                    return (
                    <li
                      key={w.id}
                      className="flex items-center justify-between rounded-lg border border-[#e9e3f5] p-4"
                    >
                      <div>
                        <p className="font-medium">
                          {(units as { title?: string })?.title ?? "—"} / {(r as { name?: string })?.name ?? "—"}
                        </p>
                        <p className="text-sm text-[#6b7280]">
                          Joined {new Date(w.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          w.status === "offered"
                            ? "default"
                            : w.status === "accepted"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {w.status}
                      </Badge>
                    </li>
                  );})}
                </ul>
              )}
              <Link
                href="/catalogue"
                className="mt-4 inline-block text-sm font-medium text-[#2ec4b6] hover:underline"
              >
                Browse more units →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
