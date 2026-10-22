import { Navigate, useLocation } from "react-router-dom";
import { useDemo } from "../../hooks/useDemo";

const destinations = { applicant: "/applicant", member: "/member", admin: "/admin" };

export default function RoleGuard({ role, children }) {
  const demo = useDemo();
  const location = useLocation();
  if (!demo.role) return <Navigate to="/demo-access" replace state={{ from: location }} />;
  if (demo.role !== role) return <Navigate to={destinations[demo.role] ?? "/demo-access"} replace />;
  return children;
}
