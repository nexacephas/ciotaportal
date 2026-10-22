export const membershipCategories = [
  { id: "graduate", name: "Graduate Member", fee: 25000, description: "For graduates beginning a career in transport administration.", eligibility: "A relevant first degree or equivalent qualification." },
  { id: "associate", name: "Associate Member", fee: 30000, description: "For established practitioners contributing to transport operations.", eligibility: "Relevant qualification and professional experience." },
  { id: "corporate", name: "Corporate Member", fee: 45000, description: "For senior professionals and organizations in the transport sector.", eligibility: "Senior responsibility or an eligible corporate organization." },
  { id: "fellow", name: "Fellow", fee: 60000, description: "For distinguished professionals with sustained industry leadership.", eligibility: "Senior standing and substantial professional contribution." },
];

export const applicationStatuses = ["submitted", "under-review", "approved", "rejected"];
export const memberStatuses = ["active", "pending-renewal", "suspended"];
export const renewalStatuses = ["pending-payment", "paid", "approved", "rejected"];
export const applicationStages = ["Application submitted", "Eligibility review", "Committee decision", "Membership activated"];

export const renewalRules = {
  reminderDays: 30,
  membershipTermMonths: 12,
  feeByCategory: Object.fromEntries(membershipCategories.map(({ id, fee }) => [id, fee])),
};

export const billingConfig = {
  currency: "NGN",
  applicationFeeByCategory: Object.fromEntries(membershipCategories.map(({ id, fee }) => [id, fee])),
};

export const electionDefaults = {
  eligibility: { membershipRequired: true, activeOnly: true, paidDuesRequired: true },
  secretBallot: true,
  resultsPublicationAllowed: true,
};

export const findMembershipCategory = (categoryId) =>
  membershipCategories.find(({ id }) => id === categoryId) ?? membershipCategories[0];
