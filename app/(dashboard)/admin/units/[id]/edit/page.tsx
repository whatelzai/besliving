import { Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EditUnitForm } from "@/components/admin/EditUnitForm";
import { ManageRooms } from "@/components/admin/ManageRooms";
export default async function EditUnitPage({ params, }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const supabase = createServerSupabase();
    const { data: unit } = await supabase
        .from("units")
        .select("*")
        .eq("id", id)
        .single();
    if (!unit)
        notFound();
    const { data: rooms } = await supabase
        .from("rooms")
        .select("id, name, price, size_sqm, availability_status")
        .eq("unit_id", id)
        .order("name");
    return (<main className="workspace-page property-editor">
      <div className="property-editor-inner">
        <Link href="/admin/units" className="text-sm text-[#2ec4b6] hover:underline"><Text>
          Back to properties
        </Text></Link>
        <h1 className="mt-4 text-2xl font-bold text-[#1f2937]"><Text>Edit property</Text></h1>
        <EditUnitForm unit={unit}/>
        <ManageRooms unitId={id} rooms={rooms ?? []}/>
      </div>
    </main>);
}
