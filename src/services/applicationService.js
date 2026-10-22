import { validateApplication } from "../utils/validators";
import { createMemberFromApplication } from "./memberService";
import { makeId, nextReference } from "../utils/referenceGenerator";

export function createApplication(values, existing = []) {
  const errors = validateApplication(values);
  if (Object.keys(errors).length) return { errors };
  const normalizedEmail = values.email.trim().toLowerCase();
  if (existing.some((item) => item.email.toLowerCase() === normalizedEmail && !["rejected"].includes(item.status))) {
    return { errors: { email: "An active application already exists for this email." } };
  }
  return { application: { ...values, id: makeId("app"), reference: nextReference("APP", existing), fullName: values.fullName.trim(), email: normalizedEmail, status: "submitted", submittedAt: new Date().toISOString(), reviewNote: "", memberId: null } };
}

export function reviewApplication(data, applicationId, decision, note = "") {
  const application = data.applications.find((item) => item.id === applicationId);
  if (!application) return { error: "Application not found." };
  if (!["approved", "rejected", "under-review"].includes(decision)) return { error: "Choose a valid review decision." };
  if (["approved", "rejected"].includes(application.status)) return { error: "This application has already received a final decision." };
  let member = null;
  if (decision === "approved") {
    member = createMemberFromApplication(application, data.members);
  }
  const updated = { ...application, status: decision, reviewNote: note.trim(), reviewedAt: new Date().toISOString(), memberId: member?.id ?? application.memberId };
  return { application: updated, member };
}

export const getApplication = (items, id) => items.find((item) => item.id === id) ?? null;
