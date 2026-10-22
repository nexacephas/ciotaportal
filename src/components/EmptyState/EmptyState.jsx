import { Inbox } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState({ title = "Nothing to show yet", description = "New records will appear here.", action }) {
  return <div className="empty-state"><span className="empty-state-icon"><Inbox size={22} /></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
