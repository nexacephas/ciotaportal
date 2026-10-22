import { makeId, nextReference } from "../utils/referenceGenerator";

export function createDemoPayment(data, values) {
  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Enter a valid payment amount." };
  const linkedRenewal = data.renewals.find((item) => item.id === values.renewalId);
  if (values.renewalId && !linkedRenewal) return { error: "The selected renewal could not be found." };
  if (linkedRenewal && linkedRenewal.status !== "pending-payment") return { error: "Only an unpaid renewal can receive a demo payment." };
  if (linkedRenewal && values.memberId && values.memberId !== linkedRenewal.memberId) return { error: "The payment member must match the selected renewal." };
  if (linkedRenewal && amount !== Number(linkedRenewal.amount)) return { error: "The payment amount must match the renewal fee." };
  const existing = linkedRenewal?.paymentId
    ? data.payments.find((item) => item.id === linkedRenewal.paymentId && item.status === "pending")
    : null;
  const payment = existing
    ? { ...existing, memberId: values.memberId || existing.memberId, renewalId: values.renewalId || existing.renewalId, amount, status: values.status === "pending" ? "pending" : "paid", method: values.method || existing.method, purpose: values.purpose || existing.purpose, paidAt: values.status === "pending" ? null : new Date().toISOString() }
    : { id: makeId("pay"), reference: nextReference("PAY", data.payments), memberId: values.memberId || null, renewalId: values.renewalId || null, purpose: values.purpose || "Demo payment", amount, status: values.status === "pending" ? "pending" : "paid", method: values.method || "Demo bank transfer", paidAt: values.status === "pending" ? null : new Date().toISOString() };
  return { payment };
}

export function applyDemoPayment(data, payment) {
  const renewal = payment.renewalId ? data.renewals.find((item) => item.id === payment.renewalId) : null;
  const renewals = renewal
    ? data.renewals.map((item) => item.id === renewal.id ? { ...item, status: payment.status === "paid" ? "paid" : "pending-payment", paymentId: payment.id } : item)
    : data.renewals;
  const existing = data.payments.some((item) => item.id === payment.id);
  const payments = existing
    ? data.payments.map((item) => item.id === payment.id ? payment : item)
    : [payment, ...data.payments];
  return { ...data, payments, renewals };
}
