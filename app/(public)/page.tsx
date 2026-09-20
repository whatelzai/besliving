import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box, Heart, House } from "lucide-react";
import { HouseCard } from "@/components/HouseCard";
import { u1Photos } from "@/lib/catalogue/desa-aman";

export default function Home() {
  return (
    <main className="living-page">
      <section className="home-hero living-container">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> SMALL COMMUNITY. MORE HOME.</span>
          <h1>Your own space.<br /><em>A place to belong.</em></h1>
          <p>Thoughtfully furnished rooms in a family-run home. A little more comfort, a little more care. Welcome to BesLiving.</p>
          <Link className="living-button" href="/catalogue">Find your room <ArrowUpRight size={18} /></Link>
          <div className="hero-footnote"><House size={18} aria-hidden="true" /><span>One home in Desa Aman.<br /><strong>Six rooms. A personal touch.</strong></span></div>
        </div>
        <div className="hero-photo">
          <Image src={u1Photos[0].src} alt={u1Photos[0].alt} fill priority sizes="(max-width: 760px) 100vw, 55vw" className="object-cover" />
          <div className="hero-photo-caption"><span>MEET YOUR NEXT SPACE<strong>U1 · Desa Aman</strong></span><Link href="/units/desa-aman/rooms/u1" aria-label="Explore room U1 in 3D"><ArrowUpRight size={26} /></Link></div>
          <span className="hero-stamp"><Box size={17} aria-hidden="true" /> Explore U1 in 3D</span>
        </div>
      </section>
      <div className="home-values"><span><Heart size={17} /> Family owned & managed</span><span><House size={17} /> A room of your own</span><span><Box size={17} /> Get a feel for the space</span></div>
      <section className="living-container home-houses">
        <div className="section-heading"><div><span className="eyebrow">FIND YOUR PLACE</span><h2>Good living starts at home.</h2></div><Link className="text-link" href="/catalogue">Our homes <ArrowUpRight size={18} /></Link></div>
        <HouseCard />
      </section>
      <section className="living-container how-it-works"><span className="eyebrow">MAKE YOURSELF AT HOME</span><h2>A closer look before you move.</h2><div className="steps">{[
        ["01", "Choose a home", "Start with the house and get to know the place."],
        ["02", "Explore your room", "Browse the photos and rotate U1’s 3D layout at your own pace."],
        ["03", "Make it yours", "Confirm rent and availability with our family before arranging your move."],
      ].map(([n, title, description]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <footer className="living-footer"><Link href="/">BesLiving<span>Room to be you.</span></Link><p>Family-run co-living · Desa Aman</p><Link href="/about">Our story ↗</Link></footer>
    </main>
  );
}
