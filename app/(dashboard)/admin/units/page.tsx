import { Localized, Text } from "@/components/preferences/Localized";
import Image from "@/components/preferences/LocalizedImage";
import Link from "@/components/preferences/LocalizedLink";
import { Building2, ArrowUpRight } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { u1Photos } from "@/lib/catalogue/desa-aman";
export default async function AdminUnitsPage() {
    const { data: units, error } = await createServerSupabase()
        .from("units")
        .select("id,title,slug,city,is_published,rooms(id,name,price,availability_status)")
        .order("created_at", { ascending: false });
    if (error)
        throw new Error("Could not load properties");
    const desa = units?.find(unit => unit.slug === "desa-aman");
    const others = units?.filter(unit => unit.id !== desa?.id);
    return <main className="workspace-page">
    <div className="workspace-heading"><div><h1><Text>Properties</Text></h1><p><Text>Manage property and room records for your team.</Text></p></div><Link href="/admin/units/new" className="living-button"><Text>Create property </Text><ArrowUpRight size={16}/></Link></div>
    <Localized>{desa && <>
      <section className="property-overview">
        <div className="property-overview-image"><Image src={u1Photos[0].src} alt="Room U1 at Desa Aman" fill sizes="(max-width: 1150px) 100vw, 40vw" className="object-cover" priority/></div>
        <div className="property-overview-copy"><span className="status-pill neutral"><Localized>{desa.is_published ? "Published" : "Draft"}</Localized></span><h2 translate="no">Desa Aman</h2><p><Text>Our first home. Six rental rooms, managed with care.</Text></p><p><Text>Set each room’s rent and availability when confirmed. The public tour includes photos, floor plans, and interactive layouts for U1 and G2.</Text></p><div className="property-actions"><Link className="living-button" href={`/admin/units/${desa.id}/edit`}><Text>Manage property </Text><ArrowUpRight size={16}/></Link><Link className="text-link" href="/units/desa-aman"><Text>View public listing </Text><ArrowUpRight size={16}/></Link></div></div>
      </section>
      <h2 className="text-xl font-semibold"><Text>Rental rooms</Text></h2>
      <div className="property-rooms"><Localized>{[...(desa.rooms ?? [])].sort((a, b) => a.name.localeCompare(b.name)).map(room => <article className="property-room" key={room.id}><strong translate="no">{room.name}</strong><span><Localized>{room.price == null ? "Rent not set" : `RM ${Number(room.price).toLocaleString()}/mo`}</Localized></span><small><Localized>{room.availability_status ?? "Availability to confirm"}</Localized></small><Link className="text-link" href={`/admin/units/${desa.id}/edit#rooms`}><Text>Edit room </Text><ArrowUpRight size={14}/></Link></article>)}</Localized></div>
    </>}</Localized>
    <Localized>{!!others?.length && <section className="workspace-panel mt-8"><Localized>{others.map(unit => <div key={unit.id} className="person-row"><span className="row-icon"><Building2 size={22}/></span><div><strong translate="no">{unit.title}</strong><p><span translate="no">{unit.city}</span><Text> · </Text><Localized>{unit.rooms?.length ?? 0}</Localized> <span><Text>rooms</Text></span></p></div><span className="status-pill neutral"><Localized>{unit.is_published ? "Published" : "Draft"}</Localized></span><Link href={`/admin/units/${unit.id}/edit`} className="text-link"><Text>Edit ↗</Text></Link></div>)}</Localized></section>}</Localized>
    <Localized>{!units?.length && <section className="workspace-panel workspace-empty"><Building2 /><h3><Text>A fresh start.</Text></h3><p><Text>Create your first property to manage its rooms.</Text></p></section>}</Localized>
  </main>;
}
