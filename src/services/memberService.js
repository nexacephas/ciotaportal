import { makeId, nextMemberNumber } from "../utils/referenceGenerator";

export function createMemberFromApplication(application, members) {
  const existing = members.find((item) => item.applicationId === application.id || item.email === application.email);
  if (existing) return existing;
  return { id: makeId("mem"), memberNumber: nextMemberNumber(members), applicationId: application.id, fullName: application.fullName, email: application.email, phone: application.phone, category: application.category, occupation: application.occupation, organization: application.organization, state: application.state, status: "active", joinedAt: new Date().toISOString(), expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString() };
}

export function updateMember(members, memberId, updates) {
  if (!members.some((member) => member.id === memberId)) return { error: "Member not found." };
  return { members: members.map((member) => member.id === memberId ? { ...member, ...updates, id: member.id, memberNumber: member.memberNumber } : member) };
}

export const getMember = (members, id) => members.find((member) => member.id === id) ?? null;
