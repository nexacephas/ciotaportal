import { NavLink } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar({ title = "Workspace", links = [], onNavigate }) {
  return <aside className="shared-sidebar"><h2>{title}</h2><nav aria-label={`${title} navigation`}>{links.map(({ label, to, icon: Icon, end })=><NavLink key={to} to={to} end={end} onClick={onNavigate} className={({isActive})=>isActive?"active":""}>{Icon&&<Icon size={18}/>}<span>{label}</span></NavLink>)}</nav></aside>;
}
