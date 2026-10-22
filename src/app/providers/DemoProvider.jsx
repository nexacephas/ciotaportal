import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DemoContext } from "./DemoContext";
import { createApplication, reviewApplication } from "../../services/applicationService";
import { loadDemoData, resetDemoData, saveDemoData } from "../../services/demoRepository";
import { updateMember } from "../../services/memberService";
import { applyDemoPayment, createDemoPayment } from "../../services/paymentService";
import { administerElection, castElectionBallot, saveElection } from "../../services/electionService";
import { completeChargePayment, createApplicationCharge, createCharge, createRenewalCharge, initiateChargePayment, reconcileChargePayment } from "../../services/billingService";
import { createRenewal, reviewRenewal } from "../../services/renewalService";
import { makeId } from "../../utils/referenceGenerator";

const ROLE_KEY = "ciota-demo-role";
const USER_KEY = "ciota-demo-user";
const validRoles = ["applicant", "member", "admin"];

function readRole() {
  try {
    const role = window.localStorage.getItem(ROLE_KEY);
    return validRoles.includes(role) ? role : null;
  } catch { return null; }
}

function readDemoUser(role) {
  if (!role) return null;
  const defaults = {
    applicant: { name: "Amina Bello", email: "amina.bello@example.test" },
    member: { name: "Fatima Yusuf", email: "fatima.yusuf@example.test" },
    admin: { name: "Demo Administrator", email: "admin@example.test" },
  };
  try {
    const stored = JSON.parse(window.localStorage.getItem(USER_KEY) ?? "null");
    if (stored?.role === role && typeof stored.name === "string" && typeof stored.email === "string") return stored;
  } catch { /* Use the role's fictional sample identity when storage is missing or invalid. */ }
  return { role, ...defaults[role] };
}

function appendAudit(data, action, detail, actor = "Demo user") {
  return { ...data, auditTrail: [{ id: makeId("audit"), action, detail, actor, createdAt: new Date().toISOString() }, ...data.auditTrail].slice(0, 100) };
}

export function DemoProvider({ children }) {
  const [data, setData] = useState(loadDemoData);
  const [role, setRole] = useState(readRole);
  const [demoUser, setDemoUser] = useState(() => readDemoUser(readRole()));
  const paymentAttempts = useRef(new Map());

  useEffect(() => { saveDemoData(data); }, [data]);

  const enterDemo = useCallback((nextRole, profile = {}) => {
    if (!validRoles.includes(nextRole)) return false;
    setRole(nextRole);
    const user = { role: nextRole, name: profile.name || (nextRole === "admin" ? "Demo Administrator" : nextRole === "member" ? "Tunde Adeyemi" : "Amina Bello"), email: profile.email || "" };
    setDemoUser(user);
    try {
      window.localStorage.setItem(ROLE_KEY, nextRole);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch { /* Session remains usable without storage. */ }
    return true;
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setDemoUser(null);
    try {
      window.localStorage.removeItem(ROLE_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch { /* Ignore unavailable storage. */ }
  }, []);

  const submitApplication = useCallback((values) => {
    const result = createApplication(values, data.applications);
    if (result.errors) return result;
    const chargeResult = createApplicationCharge(data, result.application);
    const applicationCharge = chargeResult.charge;
    setData((current) => appendAudit({ ...current, applications: [result.application, ...current.applications], charges: [applicationCharge, ...current.charges], notifications: [{ id: makeId("note"), title: "Application submitted", body: `We received ${result.application.reference}.`, audience: "applicant", recipientEmail: result.application.email, createdAt: new Date().toISOString(), read: false }, ...current.notifications] }, "Application submitted", `${result.application.reference}; charge ${applicationCharge.reference}`, result.application.fullName));
    return { ...result, charge: applicationCharge };
  }, [data]);

  const reviewApplicationAction = useCallback((id, decision, note = "") => {
    const result = reviewApplication(data, id, decision, note);
    if (result.error) return result;
    setData((current) => {
      const latestApplication = current.applications.find((item) => item.id === id);
      if (!latestApplication || ["approved", "rejected"].includes(latestApplication.status)) return current;
      const applications = current.applications.map((item) => item.id === id ? result.application : item);
      const linkedMember = result.member && current.members.find((item) => item.applicationId === id || item.email === result.member.email);
      const members = result.member && !linkedMember ? [result.member, ...current.members] : current.members;
      const charges = result.member ? current.charges.map((charge) => charge.applicationId === id ? { ...charge, memberId: result.member.id } : charge) : current.charges;
      const rejectedCharges = decision === "rejected" ? current.charges.filter((charge) => charge.applicationId === id && ["due", "pending"].includes(charge.status)) : [];
      const applicationsCharges = rejectedCharges.length ? current.charges.map((charge) => charge.applicationId === id && ["due", "pending"].includes(charge.status) ? { ...charge, status: "cancelled", paymentId: null } : charge) : charges;
      const payments = rejectedCharges.length ? current.payments.map((payment) => rejectedCharges.some((charge) => charge.paymentId === payment.id) && payment.status === "pending" ? { ...payment, status: "cancelled" } : payment) : current.payments;
      const notifications = [{ id: makeId("note"), title: `Application ${decision}`, body: `${result.application.reference}${note.trim() ? `: ${note.trim()}` : " has been reviewed."}`, audience: "applicant", recipientEmail: result.application.email, applicationId: id, createdAt: new Date().toISOString(), read: false }, ...current.notifications];
      return appendAudit({ ...current, applications, members, charges: applicationsCharges, payments, notifications }, `Application ${decision}`, `${result.application.reference}${result.member ? ` → ${result.member.memberNumber}` : ""}`, demoUser?.name);
    });
    return result;
  }, [data, demoUser]);

  const updateMemberAction = useCallback((id, updates) => {
    const result = updateMember(data.members, id, updates);
    if (result.error) return result;
    setData((current) => {
      const members = current.members.map((member) => member.id === id ? { ...member, ...updates, id: member.id, memberNumber: member.memberNumber } : member);
      return appendAudit({ ...current, members }, "Member updated", id, demoUser?.name);
    });
    return result;
  }, [data.members, demoUser]);

  const requestRenewal = useCallback((memberId) => {
    const result = createRenewal(data.members.find((item) => item.id === memberId), data.renewals);
    if (result.error) return result;
    const isExisting = data.renewals.some((item) => item.id === result.renewal.id);
    const chargeResult = isExisting ? null : createRenewalCharge(data, result.renewal);
    if (chargeResult?.error) return chargeResult;
    setData((current) => {
      if (result.error || current.renewals.some((item) => item.memberId === memberId && ["pending-payment", "pending-review", "paid"].includes(item.status))) return current;
      return appendAudit({ ...current, renewals: [result.renewal, ...current.renewals], charges: chargeResult ? [chargeResult.charge, ...current.charges] : current.charges }, "Renewal initiated", `${result.renewal.reference}${chargeResult ? `; charge ${chargeResult.charge.reference}` : ""}`, demoUser?.name);
    });
    return result;
  }, [data, demoUser]);

  const reviewRenewalAction = useCallback((id, decision) => {
    const selected = data.renewals.find((item) => item.id === id);
    const result = reviewRenewal(selected, decision);
    if (result.error) return result;
    setData((current) => {
      let members = current.members;
      let payments = current.payments;
      let charges = current.charges;
      if (decision === "approved") {
        members = current.members.map((member) => {
          if (member.id !== selected.memberId) return member;
          const expiry = new Date(member.expiresAt);
          const next = new Date(Math.max(expiry.valueOf(), Date.now()));
          next.setFullYear(next.getFullYear() + 1);
          return { ...member, status: "active", expiresAt: next.toISOString() };
        });
      }
      if (decision === "rejected" && selected.paymentId) {
        payments = current.payments.map((payment) => payment.id === selected.paymentId && payment.status === "pending" ? { ...payment, status: "cancelled" } : payment);
      }
      if (decision === "rejected") charges = current.charges.map((charge) => charge.renewalId === id && ["due", "pending"].includes(charge.status) ? { ...charge, status: "cancelled", paymentId: null } : charge);
      return appendAudit({ ...current, members, payments, charges, renewals: current.renewals.map((item) => item.id === id ? result.renewal : item) }, `Renewal ${decision}`, selected.reference, demoUser?.name);
    });
    return result;
  }, [data.renewals, demoUser]);

  const recordDemoPayment = useCallback((values) => {
    const result = createDemoPayment(data, values);
    if (result.error) return result;
    const { payment } = result;
    setData((current) => {
      return appendAudit(applyDemoPayment(current, payment), "Demo payment recorded", `${payment.reference} - ${payment.amount}`, demoUser?.name);
    });
    return { payment };
  }, [data, demoUser]);

  const initiatePayment = useCallback((chargeId) => {
    const existingAttempt = paymentAttempts.current.get(chargeId);
    if (existingAttempt) return { payment: existingAttempt, data, reused: true };
    const actor = { ...demoUser, role, memberId: data.members.find((item) => item.email === demoUser?.email)?.id };
    const result = initiateChargePayment(data, chargeId, actor);
    if (result.error) return result;
    paymentAttempts.current.set(chargeId, result.payment);
    if (!result.reused) setData(() => appendAudit(result.data, "Demo payment initiated", `${result.payment.reference} for ${result.payment.chargeId}`, demoUser?.name));
    return result;
  }, [data, demoUser, role]);

  const completePayment = useCallback((paymentId, outcome) => {
    const actor = { ...demoUser, role, memberId: data.members.find((item) => item.email === demoUser?.email)?.id };
    const result = completeChargePayment(data, paymentId, outcome, actor);
    if (result.error) return result;
    paymentAttempts.current.delete(result.payment.chargeId);
    setData(() => appendAudit(result.data, `Demo payment ${result.payment.status}`, `${result.payment.reference}${result.payment.status === "paid" ? `; receipt ${result.payment.receiptReference}` : ""}`, demoUser?.name));
    return result;
  }, [data, demoUser, role]);

  const reconcilePayment = useCallback((paymentId, outcome) => {
    const result = reconcileChargePayment(data, paymentId, outcome);
    if (result.error) return result;
    setData(() => appendAudit(result.data, `Payment reconciled as ${result.payment.status}`, result.payment.reference, demoUser?.name));
    return result;
  }, [data, demoUser]);

  const createChargeAction = useCallback((values) => {
    const result = createCharge(data, values);
    if (result.error) return result;
    if (result.reused) return result;
    setData(() => appendAudit(result.data, "Charge created", `${result.charge.reference}; ${result.charge.purpose}`, demoUser?.name));
    return result;
  }, [data, demoUser]);

  const castVote = useCallback((electionId, candidateId) => {
    const memberId = data.members.find((item) => item.email === demoUser?.email)?.id;
    const result = castElectionBallot(data, electionId, { role, email: demoUser?.email, memberId }, candidateId);
    if (result.error) return result;
    setData((current) => {
      if (current.voterParticipation.some((item) => item.electionId === electionId && item.voterId === result.participation.voterId)) return current;
      const election = current.elections.find((item) => item.id === electionId);
      return appendAudit({ ...current, voterParticipation: result.data.voterParticipation, ballots: result.data.ballots }, "Secret ballot recorded", `${election?.title ?? electionId}; participation recorded`, demoUser?.name);
    });
    return { confirmation: result.confirmation };
  }, [data, demoUser, role]);

  const saveElectionAction = useCallback((values, electionId = null) => {
    const result = saveElection(data, values, electionId);
    if (result.error) return result;
    setData(() => appendAudit(result.data, electionId ? "Election updated" : "Election created", result.election.title, demoUser?.name));
    return result;
  }, [data, demoUser]);

  const administerElectionAction = useCallback((electionId, action) => {
    const result = administerElection(data, electionId, action);
    if (result.error) return result;
    setData(() => appendAudit(result.data, `Election ${action}`, result.election.title, demoUser?.name));
    return result;
  }, [data, demoUser]);

  const markNotificationRead = useCallback((id) => setData((current) => ({ ...current, notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })), []);
  const updateSettings = useCallback((settings) => setData((current) => appendAudit({ ...current, settings: { ...current.settings, ...settings } }, "Settings updated", "Demo configuration changed", demoUser?.name)), [demoUser]);
  const resetDemo = useCallback(() => {
    setData(resetDemoData());
    logout();
  }, [logout]);

  const value = useMemo(() => ({ ...data, data, role, demoUser, enterDemo, logout, submitApplication, reviewApplication: reviewApplicationAction, updateMember: updateMemberAction, requestRenewal, reviewRenewal: reviewRenewalAction, recordDemoPayment, createCharge: createChargeAction, initiatePayment, completePayment, reconcilePayment, castVote, saveElection: saveElectionAction, administerElection: administerElectionAction, markNotificationRead, updateSettings, resetDemo }), [data, role, demoUser, enterDemo, logout, submitApplication, reviewApplicationAction, updateMemberAction, requestRenewal, reviewRenewalAction, recordDemoPayment, createChargeAction, initiatePayment, completePayment, reconcilePayment, castVote, saveElectionAction, administerElectionAction, markNotificationRead, updateSettings, resetDemo]);
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

