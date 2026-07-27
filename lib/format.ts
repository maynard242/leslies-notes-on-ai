export function formatDate(value: string, month: "long" | "short" = "short") {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function formatKind(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
