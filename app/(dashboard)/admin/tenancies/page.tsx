import { Text } from "@/components/preferences/Localized";
import { createServerSupabase } from "@/lib/supabase/server";
import { TenanciesClient } from "./TenanciesClient";
export default async function AdminTenanciesPage() {
    const supabase = createServerSupabase();
    const { data: tenancies } = await supabase
        .from("tenancies")
        .select(`
      id, start_date, end_date, status, created_at, tenant_id, room_id,
      rooms (id, name, price, unit_id, units (id, title, city))
    `)
        .order("created_at", { ascending: false });
    const tenantIds = [...new Set((tenancies ?? []).map((t) => t.tenant_id).filter(Boolean))];
    const { data: users } = tenantIds.length
        ? await supabase.from("users").select("id, full_name, email").in("id", tenantIds)
        : { data: [] };
    const userMap = (users ?? []).reduce<Record<string, {
        full_name: string | null;
        email: string | null;
    }>>((acc, u) => {
        acc[u.id] = { full_name: u.full_name, email: u.email };
        return acc;
    }, {});
    const { data: rooms } = await supabase
        .from("rooms")
        .select("id, name, unit_id, availability_status, units (id, title)")
        .eq("availability_status", "available")
        .order("name");
    const { data: allUsers } = await supabase
        .from("users")
        .select("id, full_name, email")
        .order("full_name");
    return (<main className="workspace-page">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="workspace-title"><Text>Tenancies</Text></h1>
        <TenanciesClient tenancies={(tenancies ?? []).map((t) => ({
            ...t,
            tenant: t.tenant_id ? userMap[t.tenant_id] ?? null : null,
        }))} availableRooms={(rooms ?? []).filter((r) => r.availability_status === "available")} users={allUsers ?? []}/>
      </div>
    </main>);
}
