import { Text } from "@/components/preferences/Localized";
import Image from "@/components/preferences/LocalizedImage";
import Link from "@/components/preferences/LocalizedLink";
import { ArrowUpRight, MapPin } from "lucide-react";
import { u1Photos } from "@/lib/catalogue/desa-aman";
export function HouseCard() {
    return (<Link href="/units/desa-aman" className="house-card group">
      <div className="house-card-image">
        <Image src={u1Photos[0].src} alt="A look inside room U1 at Desa Aman" fill sizes="(max-width: 760px) 100vw, 60vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"/>
        <span className="photo-label"><Text>Inside Desa Aman · Room U1</Text></span>
      </div>
      <div className="house-card-copy">
        <span className="eyebrow"><Text>OUR FIRST HOME</Text></span>
        <h2><Text>Desa Aman </Text><ArrowUpRight aria-hidden="true"/></h2>
        <p className="location"><MapPin size={16} aria-hidden="true"/><Text> Desa Aman · Landed home</Text></p>
        <p><Text>A family-run home, with a space to call your own. Explore the house, then find your room.</Text></p>
        <div className="house-facts"><span><Text>6 rental rooms</Text></span><span><Text>2 floors</Text></span><span><Text>U1 & G2 in 3D</Text></span></div>
        <span className="text-link"><Text>Explore the house </Text><span aria-hidden="true"><Text>↗</Text></span></span>
      </div>
    </Link>);
}
