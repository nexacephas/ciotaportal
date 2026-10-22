import { makeId, nextReference } from "../../utils/referenceGenerator";

// Local-only adapter. A production adapter must create intents and verify signed callbacks server-side.
export const demoPaymentAdapter = {
  createIntent(charge, payments) {
    const reference = nextReference("PAY", payments);
    return {
      id: makeId("pay"),
      reference,
      chargeId: charge.id,
      memberId: charge.memberId ?? null,
      applicationId: charge.applicationId ?? null,
      renewalId: charge.renewalId ?? null,
      type: charge.type,
      purpose: charge.purpose,
      amount: Number(charge.amount),
      currency: charge.currency || "NGN",
      status: "pending",
      method: "Simulated online payment",
      createdAt: new Date().toISOString(),
      paidAt: null,
      receiptReference: null,
    };
  },
  completeIntent(payment, outcome) {
    const statuses = { success: "paid", failure: "failed", cancel: "cancelled" };
    if (!statuses[outcome]) return { error: "Choose a supported demo payment outcome." };
    if (payment.status !== "pending") return { error: "This payment attempt has already been completed." };
    const status = statuses[outcome];
    return {
      payment: {
        ...payment,
        status,
        paidAt: status === "paid" ? new Date().toISOString() : null,
        receiptReference: status === "paid" ? `RCT-${payment.reference.replaceAll("CIOTA-PAY-", "")}` : null,
      },
    };
  },
};
