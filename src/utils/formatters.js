const asDate = (value) => value ? new Date(`${String(value).slice(0, 10)}T12:00:00`) : null;

export function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  const date = asDate(value);
  return date && !Number.isNaN(date.valueOf()) ? new Intl.DateTimeFormat("en-NG", options).format(date) : "—";
}

export function formatCurrency(value, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function formatStatus(value = "") {
  return String(value).replaceAll("-", " ").replace(/\b\w/g, (char) => char.toUpperCase()) || "Unknown";
}

export function daysUntil(value) {
  const date = asDate(value);
  if (!date) return null;
  return Math.ceil((date.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000);
}
