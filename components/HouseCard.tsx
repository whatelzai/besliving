import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { u1Photos } from "@/lib/catalogue/desa-aman";

export function HouseCard() {
  return (
    <Link href="/units/desa-aman" className="house-card group">
      <div className="house-card-image">
        <Image src={u1Photos[0].src} alt="A look inside room U1 at Desa Aman" fill sizes="(max-width: 760px) 100vw, 60vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
        <span className="photo-label">Inside Desa Aman · Room U1</span>
      </div>
      <div className="house-card-copy">
        <span className="eyebrow">OUR FIRST HOME</span>
        <h2>Desa Aman <ArrowUpRight aria-hidden="true" /></h2>
        <p className="location"><MapPin size={16} aria-hidden="true" /> Desa Aman · Landed home</p>
        <p>A family-run home, with a space to call your own. Explore the house, then find your room.</p>
        <div className="house-facts"><span>6 rental rooms</span><span>2 floors</span><span>U1 & G2 in 3D</span></div>
        <span className="text-link">Explore the house <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  );
}
