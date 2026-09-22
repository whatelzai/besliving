import { Localized, Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import { redirect } from "next/navigation";
import { DesaAmanHouse } from "@/components/rooms/DesaAmanHouse";
import { createPublicSupabase } from "@/lib/supabase/server";
import Image from "@/components/preferences/LocalizedImage";
export default async function UnitDetailPage({ params, }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    if (id === "desa-aman")
        return <DesaAmanHouse />;
    const supabase = createPublicSupabase();
    const { data: unit } = await supabase
        .from("units")
        .select("*")
        .eq("id", id)
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
    if (unit.slug === "desa-aman")
        redirect("/units/desa-aman");
    const { data: rooms } = await supabase
        .from("rooms")
        .select("id, name, price, size_sqm, availability_status")
        .eq("unit_id", id)
        .order("name");
    const { data: unitMediaList } = await supabase
        .from("media")
        .select("id, file_path, media_type")
        .eq("unit_id", id)
        .order("created_at");
    const images = (unitMediaList ?? []).filter((m) => m.media_type === "image");
    const coverPath = images[0]?.file_path;
    const imgSrc = coverPath
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${coverPath}`
        : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop";
    return (<main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/catalogue" className="mb-6 inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#2ec4b6]"><Text>
          ← Back to catalogue
        </Text></Link>

        <div className="rounded-2xl border border-[#e9e3f5] overflow-hidden bg-white shadow-sm">
          <div className="relative h-64 sm:h-80 bg-gradient-to-br from-[#a7f3ec]/30 to-[#e9e3f5]/50">
            <Image src={imgSrc} alt={unit.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, 800px" priority unoptimized={!!coverPath}/>
          </div>
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-[#1f2937]"><Localized>{unit.title}</Localized></h1>
            <p className="mt-2 text-[#6b7280]">
              <Localized>{unit.city}</Localized><Text> · </Text><Localized>{unit.property_type}</Localized>
            </p>
            <p className="mt-4 text-[#1f2937]"><Localized>{unit.address}</Localized></p>
            <Localized>{unit.description && (<p className="mt-4 text-[#6b7280]"><Localized>{unit.description}</Localized></p>)}</Localized>

            <h2 className="mt-8 text-xl font-semibold text-[#1f2937]"><Text>Rooms</Text></h2>
            <Localized>{!rooms?.length ? (<p className="mt-2 text-[#6b7280]"><Text>No rooms listed yet.</Text></p>) : (<ul className="mt-4 space-y-4">
                <Localized>{(rooms ?? []).map((r) => (<li key={r.id}>
                    <Link href={`/units/${id}/rooms/${r.id}`} className="flex items-center justify-between rounded-xl border border-[#e9e3f5] p-4 transition-colors hover:border-[#b19cd9]/50 hover:bg-[#fefefe]">
                      <div>
                        <span className="font-medium text-[#1f2937] group-hover:text-[#2ec4b6]">
                          <Localized>{r.name}</Localized>
                        </span>
                        <Localized>{r.size_sqm != null && (<span className="ml-2 text-sm text-[#6b7280]">
                            <Localized>{r.size_sqm}</Localized><Text> m²
                          </Text></span>)}</Localized>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${r.availability_status === "available"
                    ? "bg-[#a7f3ec] text-[#1a9b8f]"
                    : r.availability_status === "reserved"
                        ? "bg-[#fef3c7] text-[#d4a017]"
                        : "bg-[#e9e3f5] text-[#8b6cb8]"}`}>
                          <Localized>{r.availability_status ?? "Availability to confirm"}</Localized>
                        </span>
                        <span className="font-semibold text-[#2ec4b6]">
                          <Localized>{r.price == null ? "Rent to confirm" : `RM ${Number(r.price).toLocaleString()}/mo`}</Localized>
                        </span>
                        <span className="text-[#6b7280]" aria-hidden><Text>→</Text></span>
                      </div>
                    </Link>
                  </li>))}</Localized>
              </ul>)}</Localized>
          </div>
        </div>
      </div>
    </main>);
}
