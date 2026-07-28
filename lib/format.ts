export function formatDate(value: string, month: "long" | "short" = "short") {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function formatNoteDates(
  note: { published: string; updated: string; checked?: string },
  month: "long" | "short" = "short",
  includePublished = false,
) {
  const dates = [
    ...(includePublished ? [`Published ${formatDate(note.published, month)}`] : []),
    `Updated ${formatDate(note.updated, month)}`,
    ...(note.checked ? [`Sources checked ${formatDate(note.checked, month)}`] : []),
  ];
  return dates.join(" · ");
}

export function formatKind(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
