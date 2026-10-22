import { billingConfig } from "../data/membershipConfig";
import { makeId, nextReference } from "../utils/referenceGenerator";
import { demoPaymentAdapter } from "./paymentAdapters/demoPaymentAdapter";

const renewalOpenStatuses = ["pending-payment", "paid"];

export function createCharge(data, values) {
  const amount = Number(values.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Charge amount must be greater than zero." };
  if (!values.purpose?.trim() || !["application", "membership", "renewal", "administrative"].includes(values.type)) return { error: "Choose a valid charge type and purpose." };
  const duplicate = data.charges.find((charge) => charge.status !== "paid" && charge.status !== "cancelled" && charge.memberId === (values.memberId ?? null) && charge.applicationId === (values.applicationId ?? null) && charge.type === values.type && String(charge.purpose ?? "").toLowerCase() === values.purpose.trim().toLowerCase() && Number(charge.amount) === amount);
  if (duplicate) return { charge: duplicate, data, reused: true };
  if (values.renewalId && data.charges.some((charge) => charge.renewalId === values.renewalId)) return { error: "A charge already exists for this renewal." };
  if (values.applicationId && data.charges.some((charge) => charge.applicationId === values.applicationId && charge.type === values.type)) return { error: "A charge already exists for this application." };
  const charge = {
    id: makeId("charge"),
    reference: nextReference("CHG", data.charges),
    memberId: values.memberId ?? null,
    applicationId: values.applicationId ?? null,
    renewalId: values.renewalId ?? null,
    type: values.type,
    purpose: values.purpose.trim(),
    amount,
    currency: values.currency || billingConfig.currency,
    status: "due",
    createdAt: new Date().toISOString(),
    dueAt: values.dueAt || new Date().toISOString(),
    paymentId: null,
  };
  return { charge, data: { ...data, charges: [charge, ...data.charges] } };
}

export function createApplicationCharge(data, application) {
  const amount = billingConfig.applicationFeeByCategory[application.category];
  return createCharge(data, { applicationId: application.id, type: "application", purpose: `${application.category} membership application and admission fee`, amount });
}

export function createRenewalCharge(data, renewal) {
  return createCharge(data, { memberId: renewal.memberId, renewalId: renewal.id, type: "renewal", purpose: `${renewal.category} annual membership renewal`, amount: renewal.amount, dueAt: renewal.dueAt });
}

function canAccessCharge(data, charge, actor) {
  if (actor?.role === "admin") return true;
  if (charge.memberId && actor?.memberId === charge.memberId) return true;
  if (charge.applicationId && actor?.email) return data.applications.find((item) => item.id === charge.applicationId)?.email === actor.email;
  return false;
}

export function initiateChargePayment(data, chargeId, actor) {
  const charge = data.charges.find((item) => item.id === chargeId);
  if (!charge) return { error: "Charge not found." };
  if (!canAccessCharge(data, charge, actor)) return { error: "This charge is not available to the current demo profile." };
  if (charge.status === "paid") return { error: "This charge has already been paid." };
  if (charge.status === "cancelled") return { error: "This charge has been cancelled." };
  if (charge.applicationId && data.applications.find((item) => item.id === charge.applicationId)?.status === "rejected") return { error: "This application charge is no longer payable." };
  if (charge.renewalId && data.renewals.find((item) => item.id === charge.renewalId)?.status === "rejected") return { error: "This renewal charge is no longer payable." };
  if (charge.status === "pending" && charge.paymentId) {
    const pending = data.payments.find((payment) => payment.id === charge.paymentId && payment.status === "pending");
    if (pending) return { payment: pending, data, reused: true };
  }
  const payment = demoPaymentAdapter.createIntent(charge, data.payments);
  const updatedCharge = { ...charge, status: "pending", paymentId: payment.id };
  const next = { ...data, charges: data.charges.map((item) => item.id === charge.id ? updatedCharge : item), payments: [payment, ...data.payments] };
  return { payment, data: next, reused: false };
}

export function completeChargePayment(data, paymentId, outcome, actor) {
  const payment = data.payments.find((item) => item.id === paymentId);
  if (!payment?.chargeId) return { error: "Charge payment attempt not found." };
  const charge = data.charges.find((item) => item.id === payment.chargeId);
  if (!charge || !canAccessCharge(data, charge, actor)) return { error: "This payment is not available to the current demo profile." };
  if (charge.paymentId !== payment.id || charge.status !== "pending") return { error: "This charge no longer has an active payment attempt." };
  if (charge.applicationId && data.applications.find((item) => item.id === charge.applicationId)?.status === "rejected") return { error: "This application charge is no longer payable." };
  if (charge.renewalId && data.renewals.find((item) => item.id === charge.renewalId)?.status === "rejected") return { error: "This renewal charge is no longer payable." };
  const result = demoPaymentAdapter.completeIntent(payment, outcome);
  if (result.error) return result;
  const updatedCharge = { ...charge, status: result.payment.status === "paid" ? "paid" : "due", paymentId: result.payment.status === "paid" ? result.payment.id : null };
  const renewals = payment.renewalId
    ? data.renewals.map((item) => item.id === payment.renewalId ? { ...item, status: result.payment.status === "paid" ? "paid" : "pending-payment", paymentId: result.payment.status === "paid" ? result.payment.id : null } : item)
    : data.renewals;
  return {
    payment: result.payment,
    charge: updatedCharge,
    data: {
      ...data,
      charges: data.charges.map((item) => item.id === charge.id ? updatedCharge : item),
      payments: data.payments.map((item) => item.id === payment.id ? result.payment : item),
      renewals,
    },
  };
}

export function reconcileChargePayment(data, paymentId, outcome) {
  const payment = data.payments.find((item) => item.id === paymentId);
  if (!payment) return { error: "Payment not found." };
  return completeChargePayment(data, paymentId, outcome, { role: "admin" });
}

export function getChargeReceipt(data, paymentId) {
  const payment = data.payments.find((item) => item.id === paymentId && item.status === "paid");
  if (!payment?.receiptReference) return { error: "A receipt is available only for a successful demo payment." };
  const charge = data.charges.find((item) => item.id === payment.chargeId);
  return { payment, charge };
}

export function getBillingSummary(data, charges = data.charges) {
  return {
    outstanding: charges.filter((item) => ["due", "pending"].includes(item.status)).reduce((total, item) => total + Number(item.amount), 0),
    paid: charges.filter((item) => item.status === "paid").reduce((total, item) => total + Number(item.amount), 0),
    count: charges.length,
    currency: billingConfig.currency,
  };
}

export function getPaymentSummary(data) {
  const payments = data.payments ?? [];
  return {
    paid: payments.filter((item) => item.status === "paid").reduce((total, item) => total + Number(item.amount || 0), 0),
    outstanding: (data.charges ?? []).filter((item) => ["due", "pending"].includes(item.status)).reduce((total, item) => total + Number(item.amount || 0), 0),
    byStatus: payments.reduce((result, payment) => ({ ...result, [payment.status]: (result[payment.status] ?? 0) + 1 }), {}),
    byType: payments.filter((item) => item.status === "paid").reduce((result, payment) => ({ ...result, [payment.type ?? "other"]: (result[payment.type ?? "other"] ?? 0) + Number(payment.amount || 0) }), {}),
  };
}

export function getVisibleCharges(data, user) {
  if (user?.role === "admin") return data.charges;
  return data.charges.filter((charge) => canAccessCharge(data, charge, user));
}

export function getChargePayments(data, chargeId) {
  return data.payments.filter((payment) => payment.chargeId === chargeId);
}

export function getOpenRenewals(data, memberId) {
  return data.renewals.filter((renewal) => renewal.memberId === memberId && renewalOpenStatuses.includes(renewal.status));
}
