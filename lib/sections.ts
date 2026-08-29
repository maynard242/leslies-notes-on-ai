export const NOTE_SECTIONS = ["Data", "Training", "Post-Training", "Agents", "Governance", "Economics", "Misc"] as const;

export type NoteSection = (typeof NOTE_SECTIONS)[number];

export function getSectionLabel(section: NoteSection) {
  if (section === "Governance") return "Strategy & Governance";
  if (section === "Economics") return "Economics & Social";
  return section;
}
