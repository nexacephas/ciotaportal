import { getRenewalFee } from "../features/renewals/renewalUtils";
import { makeId, nextReference } from "../utils/referenceGenerator";

export function createRenewal(member, renewals) {
  if (!member) return { error: "Member not found." };
  const open = renewals.find((item) => item.memberId === member.id && ["pending-payment", "pending-review", "paid"].includes(item.status));
  if (open) return { renewal: open };
  const renewal = { id: makeId("ren"), reference: nextReference("REN", renewals), memberId: member.id, memberName: member.fullName, category: member.category, amount: getRenewalFee(member.category), status: "pending-payment", requestedAt: new Date().toISOString(), dueAt: member.expiresAt, paymentId: null };
  return { renewal };
}

export function reviewRenewal(renewal, decision) {
  if (!renewal) return { error: "Renewal not found." };
  if (!["approved", "rejected"].includes(decision)) return { error: "Choose a valid renewal decision." };
  if (decision === "approved" && renewal.status !== "paid") return { error: "A renewal must have a recorded demo payment before approval." };
  if (decision === "rejected" && renewal.status !== "pending-payment") return { error: "Only an unpaid renewal can be rejected in this prototype." };
  return { renewal: { ...renewal, status: decision, reviewedAt: new Date().toISOString() } };
}
