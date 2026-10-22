import { useDemo } from "./useDemo";

export const useDemoData = () => useDemo();
export const useApplicationsData = () => useDemo().applications;
export const useMembersData = () => useDemo().members;
export const usePaymentsData = () => useDemo().payments;
export const useRenewalsData = () => useDemo().renewals;
