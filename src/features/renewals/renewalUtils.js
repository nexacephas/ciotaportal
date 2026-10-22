import { renewalRules } from "../../data/membershipConfig";
import { daysUntil } from "../../utils/formatters";

export const getRenewalFee = (category) => renewalRules.feeByCategory[category] ?? renewalRules.feeByCategory.graduate;
export const isRenewalDue = (member, reminderDays = renewalRules.reminderDays) => daysUntil(member?.expiresAt) <= reminderDays;
export const filterRenewals = (items, query = "", status = "all") => items.filter((item) => (status === "all" || item.status === status) && `${item.memberName} ${item.reference}`.toLowerCase().includes(query.toLowerCase()));
