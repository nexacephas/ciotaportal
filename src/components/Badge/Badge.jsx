import { formatStatus } from "../../utils/formatters";
import "./Badge.css";

export default function Badge({ status = "info", children, className = "" }) {
  return <span className={`status-badge status-${String(status).toLowerCase().replaceAll(" ", "-")} ${className}`.trim()}>{children ?? formatStatus(status)}</span>;
}
