export function makeId(prefix) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
}

export function nextReference(prefix, records, field = "reference", year = new Date().getFullYear()) {
  const highest = records.reduce((max, item) => {
    const match = String(item[field] ?? "").match(/(\d{4})$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 1000);
  return `CIOTA-${prefix}-${year}-${String(highest + 1).padStart(4, "0")}`;
}

export function nextMemberNumber(records, year = new Date().getFullYear()) {
  const highest = records.reduce((max, item) => {
    const match = String(item.memberNumber ?? "").match(/(\d{4})$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 2000);
  return `CIOTA/${year}/${String(highest + 1).padStart(4, "0")}`;
}
