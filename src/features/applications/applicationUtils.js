import { applicationStages } from "../../data/membershipConfig";

export const getApplicationStageIndex = (status) => ({ submitted: 0, "under-review": 1, approved: 3, rejected: 2 }[status] ?? 0);
export const getApplicationProgress = (status) => applicationStages.map((label, index) => ({ label, complete: index <= getApplicationStageIndex(status), current: index === getApplicationStageIndex(status) }));
export const filterApplications = (items, { query = "", status = "all" } = {}) => items.filter((item) => (status === "all" || item.status === status) && `${item.fullName} ${item.reference} ${item.email}`.toLowerCase().includes(query.toLowerCase()));
export const countApplicationsByStatus = (items) => items.reduce((result, item) => ({ ...result, [item.status]: (result[item.status] ?? 0) + 1 }), {});
