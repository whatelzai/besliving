import Link from "next/link";
import { ArrowLeft, BedDouble, Wind, Armchair, DoorOpen } from "lucide-react";
import { U1Experience } from "./U1Experience";

export function DesaAmanRoom({name}: {name: string}) {
  const isU1 = name === "U1";
  return <main className="living-page"><div className="living-container room-detail">
    <Link href="/units/desa-aman#rooms" className="breadcrumb"><ArrowLeft size={15} /> Desa Aman <span>/</span> Room {name}</Link>
    <div className="section-heading"><div><span className="eyebrow">DESA AMAN · {name.startsWith("U") ? "UPPER" : "GROUND"} FLOOR</span><h1>Room {name}{isU1 && <em> — your quiet corner.</em>}</h1><p className="page-intro">{isU1 ? "Warm tones, a proper workspace, and room to unwind." : "A rental room in our family-run Desa Aman home."}</p></div></div>
    {isU1 ? <U1Experience /> : <div className="room-pending"><DoorOpen size={40} /><h2>Meet {name} soon.</h2><p>Photos, dimensions and furnishings for this room are being prepared.</p><Link className="living-button" href="/units/desa-aman/rooms/u1">Explore U1 in the meantime ↗</Link></div>}
    <div className="room-information"><section><span className="eyebrow">THE SPACE</span><h2>{isU1 ? "A little room. Thoughtfully arranged." : `About room ${name}`}</h2><p>{isU1 ? "A queen bed sits along the warm yellow feature wall, with a desk by the curtained window and a wardrobe opposite. The open walkway connects the entrance to the rest of the room." : "This is one of the six rooms offered for rental at Desa Aman. More details will be added once confirmed."}</p>
    {isU1 && <><div className="amenities"><span><BedDouble />Queen bed</span><span><Wind />Air conditioning</span><span><Armchair />Desk & chair</span><span><DoorOpen />Wardrobe</span></div><p className="subtle">Approx. 9.5 × 10.5 ft from the supplied grid plan. Bathroom arrangements and rental inclusions to be confirmed.</p></>}</section>
    <aside className="availability-card"><span className="eyebrow">MAKE IT YOURS</span><h3>Let’s find your fit.</h3><p>Rent, deposit and move-in availability are being confirmed. This listing does not reserve a room.</p><span className="outline-pill">Availability to be confirmed</span><Link className="text-link" href="/units/desa-aman#rooms">Compare all six rooms ↗</Link></aside></div>
  </div></main>;
}
