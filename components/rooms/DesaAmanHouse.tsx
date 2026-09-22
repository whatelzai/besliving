import { Localized, Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import Image from "@/components/preferences/LocalizedImage";
import { ArrowLeft, ArrowUpRight, Box, House } from "lucide-react";
import { desaAman, u1Photos, g2Photos } from "@/lib/catalogue/desa-aman";
export function DesaAmanHouse() {
    return <main className="living-page"><div className="living-container house-detail">
    <Link className="breadcrumb" href="/catalogue"><ArrowLeft size={15}/><Text> All homes</Text></Link>
    <div className="section-heading"><div><span className="eyebrow"><Text>LANDED HOME · FAMILY MANAGED</Text></span><h1><Text>Desa Aman</Text></h1><p className="page-intro"><Text>A home shared. A room that’s yours.</Text></p></div><span className="outline-pill"><House size={16}/><Text> 6 rental rooms</Text></span></div>
    <div className="house-banner"><Image src={u1Photos[0].src} alt="Room U1 inside the Desa Aman house" fill priority sizes="100vw" className="object-cover"/><span className="photo-label"><Text>A look inside · Room U1</Text></span></div>
    <div className="house-description"><h2><Text>Small by choice.</Text><br /><Text>Personal by nature.</Text></h2><div><p><Text>Desa Aman is our family’s co-living home. Of its eight rooms, six are offered for rental across the upper and ground floors. The other two rooms are not part of the rental listing.</Text></p><p><Text>Explore U1 and G2: take a look through the photos, or explore the furniture arrangement in an interactive 3D model.</Text></p></div></div>
    <section id="rooms"><div className="section-heading"><div><span className="eyebrow"><Text>FIND YOUR OWN CORNER</Text></span><h2><Text>Rooms at Desa Aman</Text></h2></div><span className="subtle"><Text>Rent & vacancy to be confirmed</Text></span></div>
    <div className="room-grid"><Localized>{desaAman.rentalRooms.map(name => <Link className="room-card" key={name} href={`/units/desa-aman/rooms/${name.toLowerCase()}`}>
      <div className={`room-card-image ${["U1", "G2"].includes(name) ? "" : "room-placeholder"}`}><Localized>{["U1", "G2"].includes(name) ? <><Image src={name === "G2" ? g2Photos[0].src : u1Photos[1].src} alt={`Room ${name} with a queen bed and study desk`} fill sizes="(max-width:760px) 100vw, 33vw" className="object-cover"/><span className="photo-label"><Box size={14}/><Text> Interactive 3D tour</Text></span></> : <><span><Localized>{name}</Localized></span><small><Text>Photos coming soon</Text></small></>}</Localized></div>
      <div className="room-card-copy"><div><h3><Text>Room </Text><Localized>{name}</Localized></h3><ArrowUpRight size={20}/></div><p><Localized>{name.startsWith("U") ? "Upper" : "Ground"}</Localized><Text> floor</Text><Localized>{["U1", "G2"].includes(name) ? " · Queen bed · Air conditioning" : " · Rental room"}</Localized></p><span className="room-status"><Text>Confirm availability</Text></span></div>
    </Link>)}</Localized></div></section>
  </div></main>;
}
