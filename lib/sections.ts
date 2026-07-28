export const NOTE_SECTIONS = ["Data", "Training", "Post-Training", "Agents", "Governance", "Misc"] as const;

export type NoteSection = (typeof NOTE_SECTIONS)[number];
