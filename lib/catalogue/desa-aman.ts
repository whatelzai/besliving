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
