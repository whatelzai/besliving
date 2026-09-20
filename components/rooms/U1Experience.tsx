"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { Box, Images, LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";
import { u1Photos } from "@/lib/catalogue/desa-aman";

const U1Model = dynamic(() => import("./U1Model"), { ssr: false, loading: () => <div className="model-loading" role="status">Preparing your room…</div> });
type View = "photos" | "model" | "plan";
export function U1Experience() {
  const [view, setView] = useState<View>("photos");
  const [photo, setPhoto] = useState(0);
  return <section className="room-experience" aria-label="Explore room U1">
    <div className="experience-tabs" role="tablist" aria-label="Room views">{[
      { id: "photos" as const, label: "Photos", Icon: Images },
      { id: "model" as const, label: "3D room", Icon: Box },
      { id: "plan" as const, label: "Floor plan", Icon: LayoutGrid },
    ].map(({id,label,Icon}) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={view === id} aria-controls="room-view" onClick={()=>setView(id)}><Icon size={17} />{label}</button>)}</div>
    <div id="room-view" role="tabpanel" aria-labelledby={`tab-${view}`}>
      {view === "photos" ? <>
        <div className="gallery-main" onKeyDown={e=>{if(e.key === "ArrowRight")setPhoto(p=>(p+1)%u1Photos.length);if(e.key === "ArrowLeft")setPhoto(p=>(p-1+u1Photos.length)%u1Photos.length);}} tabIndex={0} aria-label="Room photos. Use left and right arrows to browse.">
          <Image key={photo} src={u1Photos[photo].src} alt={u1Photos[photo].alt} fill priority={photo===0} sizes="(max-width:900px) 100vw, 75vw" className="object-cover" />
          <button className="gallery-arrow prev" aria-label="Previous photo" onClick={()=>setPhoto(p=>(p-1+u1Photos.length)%u1Photos.length)}><ChevronLeft /></button>
          <button className="gallery-arrow next" aria-label="Next photo" onClick={()=>setPhoto(p=>(p+1)%u1Photos.length)}><ChevronRight /></button>
          <span className="photo-counter" aria-live="polite">{photo+1} / {u1Photos.length}</span>
          <button className="tour-overlay" onClick={()=>setView("model")}><Box size={18} /> Step into the 3D room ↗</button>
        </div>
        <div className="gallery-thumbs">{u1Photos.map((p,i)=><button key={p.src} onClick={()=>setPhoto(i)} aria-label={`View photo ${i+1}: ${p.alt}`} aria-pressed={photo===i}><Image src={p.src} alt="" fill sizes="120px" className="object-cover" /></button>)}</div>
      </> : view === "model" ? <U1Model /> : <div className="floor-plan"><Image src="/images/desa-aman/u1/floor-plan.png" alt="U1 floor plan: window and desk at the far left, wardrobe at the far right, queen bed along the left wall and entry at the near right. Each main grid square represents one square foot." width={1026} height={1248} /><p>Owner’s floor plan · Each main grid square is 1 ft × 1 ft.<br />Approximate room footprint: 9.5 × 10.5 ft. Confirm dimensions on site.</p></div>}
    </div>
    <p className="experience-note">{view === "model" ? "An illustrative reconstruction from the floor plan and photos, not a scan. Floor dimensions are read from the 1 ft grid; ceiling and furniture heights are estimated. Refer to the photos for actual finishes." : view === "photos" ? "Actual photos of U1. Decorative accessories shown are for staging; confirm included furnishings before renting." : "The CCTV symbol in the supplied plan is outside the room entrance."}</p>
  </section>;
}
