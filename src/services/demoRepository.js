import { cloneSeedData } from "../data/seedData";

const STORAGE_KEY = "ciota-membership-demo-v1";

export function loadDemoData() {
  if (typeof window === "undefined") return cloneSeedData();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeedData();
    const parsed = JSON.parse(raw);
    const seed = cloneSeedData();
    const data = Object.fromEntries(Object.entries(seed).map(([key, value]) => [key, Array.isArray(value) ? (Array.isArray(parsed[key]) ? parsed[key] : value) : { ...value, ...(parsed[key] && typeof parsed[key] === "object" ? parsed[key] : {}) }]));
    const charges = data.charges.map((charge) => {
      const payment = data.payments.find((item) => item.id === charge.paymentId || item.chargeId === charge.id);
      if (!payment || charge.status === "cancelled") return charge;
      const status = payment.status === "paid" ? "paid" : payment.status === "pending" ? "pending" : "due";
      return { ...charge, status, paymentId: ["paid", "pending"].includes(payment.status) ? payment.id : null };
    });
    const payments = data.payments.map((payment) => {
      const charge = charges.find((item) => item.id === payment.chargeId || item.paymentId === payment.id);
      if (!charge) return payment;
      return { ...payment, chargeId: charge.id, memberId: payment.memberId ?? charge.memberId, applicationId: payment.applicationId ?? charge.applicationId, renewalId: payment.renewalId ?? charge.renewalId, type: payment.type ?? charge.type, currency: payment.currency ?? charge.currency ?? "NGN", receiptReference: payment.receiptReference ?? (payment.status === "paid" ? `RCT-${payment.reference.replaceAll("CIOTA-PAY-", "")}` : null) };
    });
    return { ...data, charges, payments };
  } catch {
    return cloneSeedData();
  }
}

export function saveDemoData(data) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function resetDemoData() {
  const seed = cloneSeedData();
  saveDemoData(seed);
  return seed;
}

export const demoStorageKey = STORAGE_KEY;
