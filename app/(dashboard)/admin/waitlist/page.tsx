import { Text } from "@/components/preferences/Localized";
import { createServerSupabase } from "@/lib/supabase/server";
import { WaitlistClient } from "./WaitlistClient";
export default async function AdminWaitlistPage({ searchParams, }: {
    searchParams: Promise<{
        unit_id?: string;
        room_id?: string;
    }>;
}) {
    const params = await searchParams;
    const supabase = createServerSupabase();
    const roomSelect = params?.unit_id
        ? `rooms!inner(id, name, unit_id, units(id, title, city))`
        : `rooms(id, name, unit_id, units(id, title, city))`;
    let query = supabase
        .from("waitlist_registrations")
        .select(`id, user_id, room_id, status, created_at, ${roomSelect}`)
        .order("created_at", { ascending: false });
    if (params?.room_id) {
        query = query.eq("room_id", params.room_id);
    }
    else if (params?.unit_id) {
        query = query.eq("rooms.unit_id", params.unit_id);
    }
    const { data: rawEntries } = await query;
    const entries = rawEntries ?? [];
    const userIds = [...new Set(entries.map((e) => e.user_id).filter(Boolean))];
    const { data: users } = userIds.length
        ? await supabase.from("users").select("id, full_name, email").in("id", userIds)
        : { data: [] };
    const userMap = (users ?? []).reduce<Record<string, {
        full_name: string | null;
        email: string | null;
    }>>((acc, u) => {
        acc[u.id] = { full_name: u.full_name, email: u.email };
        return acc;
    }, {});
    const enrichedEntries = entries.map((e) => ({
        ...e,
        users: e.user_id ? userMap[e.user_id] ?? null : null,
    }));
    const { data: rooms } = await supabase
        .from("rooms")
        .select("id, name, unit_id, units (id, title)")
        .order("units(title)")
        .order("name");
    const { data: units } = await supabase
        .from("units")
        .select("id, title")
        .order("title");
    return (<main className="workspace-page">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="workspace-title"><Text>Waitlist</Text></h1>
        <WaitlistClient entries={enrichedEntries} units={units ?? []} rooms={rooms ?? []} filterUnitId={params?.unit_id ?? null} filterRoomId={params?.room_id ?? null}/>
      </div>
    </main>);
}
