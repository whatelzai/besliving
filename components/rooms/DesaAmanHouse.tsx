import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight, Box, House } from "lucide-react";
import { desaAman, u1Photos, g2Photos } from "@/lib/catalogue/desa-aman";
export function DesaAmanHouse() {
  return <main className="living-page"><div className="living-container house-detail">
    <Link className="breadcrumb" href="/catalogue"><ArrowLeft size={15} /> All homes</Link>
    <div className="section-heading"><div><span className="eyebrow">LANDED HOME · FAMILY MANAGED</span><h1>Desa Aman</h1><p className="page-intro">A home shared. A room that’s yours.</p></div><span className="outline-pill"><House size={16} /> 6 rental rooms</span></div>
    <div className="house-banner"><Image src={u1Photos[0].src} alt="Room U1 inside the Desa Aman house" fill priority sizes="100vw" className="object-cover" /><span className="photo-label">A look inside · Room U1</span></div>
    <div className="house-description"><h2>Small by choice.<br />Personal by nature.</h2><div><p>Desa Aman is our family’s co-living home. Of its eight rooms, six are offered for rental across the upper and ground floors. The other two rooms are not part of the rental listing.</p><p>Explore U1 and G2: take a look through the photos, or explore the furniture arrangement in an interactive 3D model.</p></div></div>
    <section id="rooms"><div className="section-heading"><div><span className="eyebrow">FIND YOUR OWN CORNER</span><h2>Rooms at Desa Aman</h2></div><span className="subtle">Rent & vacancy to be confirmed</span></div>
    <div className="room-grid">{desaAman.rentalRooms.map(name=><Link className="room-card" key={name} href={`/units/desa-aman/rooms/${name.toLowerCase()}`}>
      <div className={`room-card-image ${["U1", "G2"].includes(name) ? "" : "room-placeholder"}`}>{["U1", "G2"].includes(name) ? <><Image src={name === "G2" ? g2Photos[0].src : u1Photos[1].src} alt={`Room ${name} with a queen bed and study desk`} fill sizes="(max-width:760px) 100vw, 33vw" className="object-cover" /><span className="photo-label"><Box size={14} /> Interactive 3D tour</span></> : <><span>{name}</span><small>Photos coming soon</small></>}</div>
      <div className="room-card-copy"><div><h3>Room {name}</h3><ArrowUpRight size={20} /></div><p>{name.startsWith("U") ? "Upper" : "Ground"} floor{["U1", "G2"].includes(name) ? " · Queen bed · Air conditioning" : " · Rental room"}</p><span className="room-status">Confirm availability</span></div>
    </Link>)}</div></section>
  </div></main>;
}
