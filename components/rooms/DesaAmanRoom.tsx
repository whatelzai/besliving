import { Localized, Text } from "@/components/preferences/Localized";
import Link from "@/components/preferences/LocalizedLink";
import { ArrowLeft, BedDouble, Wind, Armchair, DoorOpen } from "lucide-react";
import { G2Experience } from "./G2Experience";
import { U1Experience } from "./U1Experience";
export function DesaAmanRoom({ name }: {
    name: string;
}) {
    const isU1 = name === "U1";
    const isG2 = name === "G2";
    const hasTour = isU1 || isG2;
    return <main className="living-page"><div className="living-container room-detail">
    <Link href="/units/desa-aman#rooms" className="breadcrumb"><ArrowLeft size={15}/><Text> Desa Aman </Text><span><Text>/</Text></span><Text> Room </Text><Localized>{name}</Localized></Link>
    <div className="section-heading"><div><span className="eyebrow"><Text>DESA AMAN · </Text><Localized>{name.startsWith("U") ? "UPPER" : "GROUND"}</Localized><Text> FLOOR</Text></span><h1><Text>Room </Text><Localized>{name}</Localized><Localized>{hasTour && <em><Text> — your quiet corner.</Text></em>}</Localized></h1><p className="page-intro"><Localized>{isU1 ? "Warm tones, a proper workspace, and room to unwind." : isG2 ? "A cosy ground-floor room with a tucked-away study nook." : "A rental room in our family-run Desa Aman home."}</Localized></p></div></div>
    <Localized>{isU1 ? <U1Experience /> : isG2 ? <G2Experience /> : <div className="room-pending"><DoorOpen size={40}/><h2><Text>Meet </Text><Localized>{name}</Localized><Text> soon.</Text></h2><p><Text>Photos, dimensions and furnishings for this room are being prepared.</Text></p><Link className="living-button" href="/units/desa-aman/rooms/u1"><Text>Explore U1 in the meantime ↗</Text></Link></div>}</Localized>
    <div className="room-information"><section><span className="eyebrow"><Text>THE SPACE</Text></span><h2><Localized>{hasTour ? "A little room. Thoughtfully arranged." : `About room ${name}`}</Localized></h2><p><Localized>{isU1 ? "A queen bed sits along the warm yellow feature wall, with a desk by the curtained window and a wardrobe opposite. The open walkway connects the entrance to the rest of the room." : isG2 ? "A queen bed rests against the warm feature wall, beside broad grey curtains. A separate window lights the recessed study nook, while a wooden wardrobe fits into the opposite corner." : "This is one of the six rooms offered for rental at Desa Aman. More details will be added once confirmed."}</Localized></p>
    <Localized>{hasTour && <><div className="amenities"><span><BedDouble /><Text>Queen bed</Text></span><span><Wind /><Text>Air conditioning</Text></span><span><Armchair /><Text>Desk & chair</Text></span><span><DoorOpen /><Text>Wardrobe</Text></span></div><p className="subtle"><Localized>{isG2 ? "Main sleeping area approx. 10 × 9.3 ft, plus study alcove and wardrobe recess, from the supplied grid plan." : "Approx. 9.5 × 10.5 ft from the supplied grid plan."}</Localized><Text> Bathroom arrangements and rental inclusions to be confirmed.</Text></p></>}</Localized></section>
    <aside className="availability-card"><span className="eyebrow"><Text>MAKE IT YOURS</Text></span><h3><Text>Let’s find your fit.</Text></h3><p><Text>Rent, deposit and move-in availability are being confirmed. This listing does not reserve a room.</Text></p><Link className="living-button" href={`/viewing?room=${name}`}><Text>Book a viewing</Text></Link><span className="outline-pill"><Text>Availability to be confirmed</Text></span><Link className="text-link" href="/units/desa-aman#rooms"><Text>Compare all six rooms ↗</Text></Link></aside></div>
  </div></main>;
}
