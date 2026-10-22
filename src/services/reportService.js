import { buildReportData } from "../features/reports/reportUtils";

export function getDashboardSummary(data) {
  return buildReportData(data).totals;
}

export function getReportData(data, period = "all") {
  const summary = buildReportData(data);
  if (period === "all") return summary;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - Number(period));
  const recentPayments = (data.payments ?? []).filter((payment) => payment.paidAt && new Date(payment.paidAt) >= cutoff);
  return { ...summary, recentPayments, periodPaid: recentPayments.filter((item) => item.status === "paid").reduce((total, item) => total + Number(item.amount), 0) };
}
