import { findMembershipCategory } from "../../data/membershipConfig";
import { daysUntil } from "../../utils/formatters";

export const getMemberFee = (category) => findMembershipCategory(category).fee;
export const getMemberRenewalState = (member) => {
  if (!member || member.status !== "active") return member?.status ?? "unknown";
  const days = daysUntil(member.expiresAt);
  return days !== null && days <= 30 ? "pending-renewal" : "active";
};
export const filterMembers = (items, { query = "", status = "all", category = "all" } = {}) => items.filter((item) => (status === "all" || item.status === status) && (category === "all" || item.category === category) && `${item.fullName} ${item.memberNumber} ${item.email} ${item.organization}`.toLowerCase().includes(query.toLowerCase()));
export const getMemberStats = (items) => ({ total: items.length, active: items.filter((item) => item.status === "active").length, renewalDue: items.filter((item) => item.status === "pending-renewal").length, suspended: items.filter((item) => item.status === "suspended").length });
