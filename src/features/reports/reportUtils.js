import { getPaymentTotals } from "../payments/paymentUtils";
import { getElectionAdminSummary, getElectionStatus } from "../../services/electionService";

export function buildReportData(data) {
  const { applications = [], members = [], payments = [], renewals = [], charges = [], elections = [], voterParticipation = [] } = data;
  const categories = members.reduce((counts, member) => ({ ...counts, [member.category]: (counts[member.category] ?? 0) + 1 }), {});
  const electionSummaries = elections.map((election) => ({ id: election.id, title: election.title, status: getElectionStatus(election), ...getElectionAdminSummary(data, election) }));
  const eligibleVoters = electionSummaries.reduce((sum, item) => sum + item.eligibleVoterCount, 0);
  const ballotsCast = voterParticipation.length;
  return {
    totals: { applications: applications.length, members: members.length, activeMembers: members.filter((item) => item.status === "active").length, pendingApplications: applications.filter((item) => ["submitted", "under-review"].includes(item.status)).length, renewalsDue: renewals.filter((item) => ["pending-payment", "pending-review", "paid"].includes(item.status)).length, ...getPaymentTotals(payments), failedTransactions: payments.filter((item) => item.status === "failed").length, cancelledTransactions: payments.filter((item) => item.status === "cancelled").length, outstanding: charges.filter((item) => ["due", "pending"].includes(item.status)).reduce((sum, charge) => sum + Number(charge.amount), 0), openElections: electionSummaries.filter((item) => item.status === "open").length, ballotsCast, eligibleVoters, turnoutPercent: eligibleVoters ? Math.round(ballotsCast / eligibleVoters * 100) : 0 },
    paymentStatuses: payments.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] ?? 0) + 1 }), {}),
    categories,
    applicationStatuses: applications.reduce((counts, item) => ({ ...counts, [item.status]: (counts[item.status] ?? 0) + 1 }), {}),
    recentPayments: [...payments].sort((a, b) => String(b.paidAt ?? "").localeCompare(String(a.paidAt ?? ""))).slice(0, 5),
    elections: electionSummaries,
  };
}
