import { Localized, Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import { notFound, redirect } from "next/navigation";
import { DesaAmanRoom } from "@/components/rooms/DesaAmanRoom";
import { isRentalRoom } from "@/lib/catalogue/desa-aman";
import Image from "@/components/preferences/LocalizedImage";
import { createPublicSupabase, createServerSupabase } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import { RoomDetailClient } from "./RoomDetailClient";
export default async function RoomDetailPage({ params, }: {
    params: Promise<{
        id: string;
        roomId: string;
    }>;
}) {
    const { id: unitId, roomId } = await params;
    if (unitId === "desa-aman") {
        if (!isRentalRoom(roomId))
            notFound();
        return <DesaAmanRoom name={roomId.toUpperCase()}/>;
    }
    const supabase = createPublicSupabase();
    const { userId } = await auth();
    const { data: room } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .eq("unit_id", unitId)
        .single();
    if (!room) {
        return (<main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <Link href="/catalogue" className="text-sm text-[#2ec4b6] hover:underline"><Text>
            ← Back to catalogue
          </Text></Link>
          <p className="mt-8 text-[#6b7280]"><Text>Room not found.</Text></p>
        </div>
      </main>);
    }
    // Verify room belongs to a published unit
    const { data: unit } = await supabase
        .from("units")
        .select("id, is_published, slug")
        .eq("id", unitId)
        .eq("is_published", true)
        .single();
    if (!unit) {
        return (<main className="min-h-screen bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <Link href="/catalogue" className="text-sm text-[#2ec4b6] hover:underline"><Text>
            ← Back to catalogue
          </Text></Link>
          <p className="mt-8 text-[#6b7280]"><Text>Unit not found.</Text></p>
        </div>
      </main>);
    }
    if (unit.slug === "desa-aman" && isRentalRoom(room.name))
        redirect(`/units/desa-aman/rooms/${room.name.toLowerCase()}`);
    const { data: unitInfo } = await supabase
        .from("units")
        .select("id, title, city, address, property_type, description")
        .eq("id", unitId)
        .single();
    const { data: roomMedia } = await supabase
        .from("media")
        .select("file_path")
        .eq("room_id", roomId)
        .eq("media_type", "image")
        .order("created_at")
        .limit(5);
    const { data: unitMedia } = roomMedia?.length === 0 || !roomMedia
        ? await supabase
            .from("media")
            .select("file_path")
            .eq("unit_id", unitId)
            .eq("media_type", "image")
            .order("created_at")
            .limit(3)
        : { data: [] };
    const images = (roomMedia?.length ? roomMedia : unitMedia) ?? [];
    const coverPath = images[0]?.file_path;
    const imgSrc = coverPath
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${coverPath}`
        : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop";
    // Check if current user is already on waitlist (needs service role for users table)
    let alreadyOnWaitlist = false;
    if (userId) {
        const adminSupabase = createServerSupabase();
        const { data: user } = await adminSupabase
            .from("users")
            .select("id")
            .eq("clerk_id", userId)
            .single();
        if (user) {
            const { data: existing } = await adminSupabase
                .from("waitlist_registrations")
                .select("id")
                .eq("user_id", user.id)
                .eq("room_id", roomId)
                .single();
            alreadyOnWaitlist = !!existing;
        }
    }
    const amenities: {
        label: string;
        value: boolean | string;
    }[] = [
        { label: "Study table", value: room.has_study_table },
        { label: "Air conditioning", value: room.has_aircond },
        { label: "Private toilet", value: room.has_private_toilet },
        { label: "Bed", value: room.bed_size ?? "—" },
        { label: "Wardrobe", value: room.wardrobe_size ?? "—" },
    ];
    return (<main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[#6b7280]">
          <Link href="/catalogue" className="hover:text-[#2ec4b6]"><Text>
            Catalogue
          </Text></Link>
          <span><Text>/</Text></span>
          <Link href={`/units/${unitId}`} className="hover:text-[#2ec4b6]">
            <Localized>{unitInfo?.title ?? "Unit"}</Localized>
          </Link>
          <span><Text>/</Text></span>
          <span className="text-[#1f2937]"><Localized>{room.name}</Localized></span>
        </nav>

        <div className="rounded-2xl border border-[#e9e3f5] overflow-hidden bg-white shadow-sm">
          <div className="relative h-64 sm:h-80 bg-gradient-to-br from-[#a7f3ec]/30 to-[#e9e3f5]/50">
            <Image src={imgSrc} alt={room.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 800px" priority unoptimized={!!coverPath}/>
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${room.availability_status === "available"
            ? "bg-[#a7f3ec] text-[#1a9b8f]"
            : room.availability_status === "reserved"
                ? "bg-[#fef3c7] text-[#d4a017]"
                : "bg-[#e9e3f5] text-[#8b6cb8]"}`}>
                <Localized>{room.availability_status ?? "Availability to confirm"}</Localized>
              </span>
              <Localized>{room.size_sqm != null && (<span className="rounded-full bg-white/90 px-3 py-1 text-xs text-[#6b7280]">
                  <Localized>{room.size_sqm}</Localized><Text> m²
                </Text></span>)}</Localized>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-[#1f2937] sm:text-3xl"><Localized>{room.name}</Localized></h1>
            <p className="mt-2 text-2xl font-bold text-[#2ec4b6]">
              <Localized>{room.price == null ? "Rent to confirm" : `RM ${Number(room.price).toLocaleString()}/mo`}</Localized>
            </p>

            <Localized>{room.description && (<p className="mt-4 text-[#6b7280]"><Localized>{room.description}</Localized></p>)}</Localized>

            <h2 className="mt-8 text-lg font-semibold text-[#1f2937]"><Text>Amenities</Text></h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              <Localized>{amenities.map((a) => (<li key={a.label} className="flex items-center gap-2">
                  <span className={`inline-block size-4 rounded ${a.value === true ? "bg-[#2ec4b6]" : a.value === false ? "bg-[#e5e7eb]" : "bg-transparent"}`}/>
                  <span className="text-[#6b7280]">
                    <Localized>{a.label}</Localized><Text>: </Text><Localized>{typeof a.value === "boolean" ? (a.value ? "Yes" : "No") : a.value}</Localized>
                  </span>
                </li>))}</Localized>
            </ul>

            <div className="mt-10 pt-8 border-t border-[#e9e3f5]">
              <RoomDetailClient roomId={roomId} unitId={unitId} alreadyOnWaitlist={alreadyOnWaitlist} currentPath={`/units/${unitId}/rooms/${roomId}`}/>
            </div>
          </div>
        </div>
      </div>
    </main>);
}
