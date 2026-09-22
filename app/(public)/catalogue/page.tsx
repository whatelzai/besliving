import { Text } from "@/components/preferences/Localized";
import type { Metadata } from "next";
import { HouseCard } from "@/components/HouseCard";
export const metadata: Metadata = { title: "Our homes | BesLiving", description: "Explore our family-run Desa Aman home and its six rental rooms." };
export default function CataloguePage() {
    return <main className="living-page"><div className="living-container catalogue"><span className="eyebrow"><Text>OUR HOMES</Text></span><h1><Text>Find your kind of home.</Text></h1><p className="page-intro"><Text>Start with the house. Then take a closer look at the rooms inside.</Text></p><div className="catalogue-count"><span><Text>1 home · Desa Aman</Text></span><span><Text>Landed living</Text></span></div><HouseCard /><p className="catalogue-note"><Text>Six rooms are offered for rental: U1, U2, U3, G2, G3 and G4. Current availability and rent are confirmed separately.</Text></p></div></main>;
}
