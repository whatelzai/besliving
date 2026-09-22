"use client";
import { Translated } from "@/components/preferences/Translated";

import { Localized, Text } from "@/components/preferences/Localized";
import dynamic from "next/dynamic";
import Image from "@/components/preferences/LocalizedImage";
import { useState } from "react";
import { Box, Images, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { g2Photos } from "@/lib/catalogue/desa-aman";
const G2Model = dynamic(() => import("./G2Model"), { ssr: false, loading: () => <div className="model-loading" role="status"><Text>Preparing your room…</Text></div> });
type View = "photos" | "model" | "plan";
export function G2Experience() {
    const [view, setView] = useState<View>("photos");
    const [photo, setPhoto] = useState(0);
    return <Translated as="section" className="room-experience" aria-label="Explore room G2">
    <Translated as="div" className="experience-tabs" role="tablist" aria-label="Room views"><Localized>{[
            { id: "photos" as const, label: "Photos", Icon: Images },
            { id: "model" as const, label: "3D room", Icon: Box },
            { id: "plan" as const, label: "Floor plan", Icon: LayoutGrid },
        ].map(({ id, label, Icon }) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={view === id} aria-controls="room-view" onClick={() => setView(id)}><Icon size={17}/><Localized>{label}</Localized></button>)}</Localized></Translated>
    <div id="room-view" role="tabpanel" aria-labelledby={`tab-${view}`}>
      <Localized>{view === "photos" ? <>
        <Translated as="div" className="gallery-main" onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === "ArrowRight")
                    setPhoto(p => (p + 1) % g2Photos.length);
                if (e.key === "ArrowLeft")
                    setPhoto(p => (p - 1 + g2Photos.length) % g2Photos.length);
            }} tabIndex={0} aria-label="Room photos. Use left and right arrows to browse.">
          <Image key={photo} src={g2Photos[photo].src} alt={g2Photos[photo].alt} fill priority={photo === 0} sizes="(max-width:900px) 100vw, 75vw" className="object-cover"/>
          <Translated as="button" className="gallery-arrow prev" aria-label="Previous photo" onClick={() => setPhoto(p => (p - 1 + g2Photos.length) % g2Photos.length)}><ChevronLeft /></Translated>
          <Translated as="button" className="gallery-arrow next" aria-label="Next photo" onClick={() => setPhoto(p => (p + 1) % g2Photos.length)}><ChevronRight /></Translated>
          <span className="photo-counter" aria-live="polite"><Localized>{photo + 1}</Localized><Text> / </Text><Localized>{g2Photos.length}</Localized></span>
          <button className="tour-overlay" onClick={() => setView("model")}><Box size={18}/><Text> Step into the 3D room ↗</Text></button>
        </Translated>
        <div className="gallery-thumbs"><Localized>{g2Photos.map((p, i) => <Translated as="button" key={p.src} onClick={() => setPhoto(i)} aria-label={`View photo ${i + 1}: ${p.alt}`} aria-pressed={photo === i}><Image src={p.src} alt="" fill sizes="120px" className="object-cover"/></Translated>)}</Localized></div>
      </> : view === "model" ? <G2Model /> : <div className="floor-plan"><Image src="/images/desa-aman/g2/floor-plan.png" alt="G2 floor plan: desk in the upper-left alcove, entry at the upper right, bed against the left wall, broad window along the bottom and wardrobe in the lower-right recess. Each main grid square represents one square foot." width={1070} height={1332}/><p><Text>Owner’s floor plan · Each main grid square is 1 ft × 1 ft.</Text><br /><Text>Main sleeping area approximately 10 × 9.3 ft, with a study alcove and wardrobe recess. Confirm dimensions on site.</Text></p></div>}</Localized>
    </div>
    <p className="experience-note"><Localized>{view === "model" ? "An illustrative reconstruction from the floor plan and photos, not a scan. Floor dimensions are read from the 1 ft grid; ceiling and furniture heights are estimated. Refer to the photos for actual finishes." : view === "photos" ? "Actual photos of G2. Decorative accessories shown are for staging; confirm included furnishings before renting." : "The CCTV symbol in the supplied plan is outside the room entrance."}</Localized></p>
  </Translated>;
}
