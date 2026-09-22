"use client";
import { Translated } from "@/components/preferences/Translated";

import { Localized, Text } from "@/components/preferences/Localized";
import dynamic from "next/dynamic";
import Image from "@/components/preferences/LocalizedImage";
import { useState } from "react";
import { Box, Images, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { u1Photos } from "@/lib/catalogue/desa-aman";
const U1Model = dynamic(() => import("./U1Model"), { ssr: false, loading: () => <div className="model-loading" role="status"><Text>Preparing your room…</Text></div> });
type View = "photos" | "model" | "plan";
export function U1Experience() {
    const [view, setView] = useState<View>("photos");
    const [photo, setPhoto] = useState(0);
    return <Translated as="section" className="room-experience" aria-label="Explore room U1">
    <Translated as="div" className="experience-tabs" role="tablist" aria-label="Room views"><Localized>{[
            { id: "photos" as const, label: "Photos", Icon: Images },
            { id: "model" as const, label: "3D room", Icon: Box },
            { id: "plan" as const, label: "Floor plan", Icon: LayoutGrid },
        ].map(({ id, label, Icon }) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={view === id} aria-controls="room-view" onClick={() => setView(id)}><Icon size={17}/><Localized>{label}</Localized></button>)}</Localized></Translated>
    <div id="room-view" role="tabpanel" aria-labelledby={`tab-${view}`}>
      <Localized>{view === "photos" ? <>
        <Translated as="div" className="gallery-main" onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                if (e.key === "ArrowRight")
                    setPhoto(p => (p + 1) % u1Photos.length);
                if (e.key === "ArrowLeft")
                    setPhoto(p => (p - 1 + u1Photos.length) % u1Photos.length);
            }} tabIndex={0} aria-label="Room photos. Use left and right arrows to browse.">
          <Image key={photo} src={u1Photos[photo].src} alt={u1Photos[photo].alt} fill priority={photo === 0} sizes="(max-width:900px) 100vw, 75vw" className="object-cover"/>
          <Translated as="button" className="gallery-arrow prev" aria-label="Previous photo" onClick={() => setPhoto(p => (p - 1 + u1Photos.length) % u1Photos.length)}><ChevronLeft /></Translated>
          <Translated as="button" className="gallery-arrow next" aria-label="Next photo" onClick={() => setPhoto(p => (p + 1) % u1Photos.length)}><ChevronRight /></Translated>
          <span className="photo-counter" aria-live="polite"><Localized>{photo + 1}</Localized><Text> / </Text><Localized>{u1Photos.length}</Localized></span>
          <button className="tour-overlay" onClick={() => setView("model")}><Box size={18}/><Text> Step into the 3D room ↗</Text></button>
        </Translated>
        <div className="gallery-thumbs"><Localized>{u1Photos.map((p, i) => <Translated as="button" key={p.src} onClick={() => setPhoto(i)} aria-label={`View photo ${i + 1}: ${p.alt}`} aria-pressed={photo === i}><Image src={p.src} alt="" fill sizes="120px" className="object-cover"/></Translated>)}</Localized></div>
      </> : view === "model" ? <U1Model /> : <div className="floor-plan"><Image src="/images/desa-aman/u1/floor-plan.png" alt="U1 floor plan: window and desk at the far left, wardrobe at the far right, queen bed along the left wall and entry at the near right. Each main grid square represents one square foot." width={1026} height={1248}/><p><Text>Owner’s floor plan · Each main grid square is 1 ft × 1 ft.</Text><br /><Text>Approximate room footprint: 9.5 × 10.5 ft. Confirm dimensions on site.</Text></p></div>}</Localized>
    </div>
    <p className="experience-note"><Localized>{view === "model" ? "An illustrative reconstruction from the floor plan and photos, not a scan. Floor dimensions are read from the 1 ft grid; ceiling and furniture heights are estimated. Refer to the photos for actual finishes." : view === "photos" ? "Actual photos of U1. Decorative accessories shown are for staging; confirm included furnishings before renting." : "The CCTV symbol in the supplied plan is outside the room entrance."}</Localized></p>
  </Translated>;
}
