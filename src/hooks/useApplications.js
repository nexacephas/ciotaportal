import { useMemo } from "react";
import { useDemo } from "./useDemo";
import { filterApplications } from "../features/applications/applicationUtils";

export function useApplications({ query = "", status = "all" } = {}) {
  const demo = useDemo();
  const applications = useMemo(() => filterApplications(demo.applications, { query, status }), [demo.applications, query, status]);
  return { applications, allApplications: demo.applications, submitApplication: demo.submitApplication, reviewApplication: demo.reviewApplication };
}
