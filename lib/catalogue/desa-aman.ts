/** Editorial facts supplied by the owner. Rent and vacancy are deliberately unknown. */
export const desaAman = {
  id: "desa-aman",
  title: "Desa Aman",
  propertyType: "landed" as "landed" | "condo",
  address: "Desa Aman",
  totalRooms: 8,
  rentalRooms: ["U1", "U2", "U3", "G2", "G3", "G4"],
};

export const u1Dimensions = {
  // Read from the supplied one-square-foot grid; allow for screenshot scaling.
  widthFeet: 9.5,
  lengthFeet: 10.5,
  ceilingFeet: 9, // Estimate only; no measured ceiling height supplied.
};

export const u1Photos = [
  { file: "161205", alt: "U1 queen bed, study desk, curtained window and oak wardrobe" },
  { file: "161301", alt: "Queen bed beside the yellow feature wall and study desk" },
  { file: "161329", alt: "U1 entrance door with mirror beside the upholstered headboard" },
  { file: "161134", alt: "Study desk and wardrobe beneath the air conditioner" },
  { file: "160915", alt: "Warm evening lighting in U1" },
  { file: "161238", alt: "Queen bed and desk viewed from the window" },
  { file: "161400", alt: "View toward the bed and entrance from the study desk" },
  { file: "161354", alt: "Clear walkway beside the bed toward the entrance" },
].map((photo) => ({ ...photo, src: `/images/desa-aman/u1/${photo.file}.webp` }));

export function isRentalRoom(name: string) {
  return desaAman.rentalRooms.includes(name.toUpperCase());
}

export const g2Photos = [
  {
    "file": "114409",
    "alt": "G2 queen bed, recessed study nook and mirrored entrance door"
  },
  {
    "file": "112508",
    "alt": "G2 bed beneath the warm curved wall light"
  },
  {
    "file": "114517",
    "alt": "Bed and wooden wardrobe beside full-width grey curtains"
  },
  {
    "file": "114528",
    "alt": "Study nook with desk and chair beside its own window"
  },
  {
    "file": "114420",
    "alt": "Wardrobe and entrance viewed across the bed"
  },
  {
    "file": "114449",
    "alt": "Upholstered headboard and grey bed throw in daylight"
  },
  {
    "file": "112611",
    "alt": "Warm lighting over the bed and wardrobe"
  },
  {
    "file": "114537",
    "alt": "Window-side workspace with a wooden desk and white chair"
  },
  {
    "file": "114430",
    "alt": "Bed accessories and study nook in daylight"
  },
  {
    "file": "114628",
    "alt": "Queen bed and wardrobe viewed from above"
  }
].map(photo => ({ ...photo, src: `/images/desa-aman/g2/${photo.file}.webp` }));
