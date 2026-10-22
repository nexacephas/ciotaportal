import "./StatCard.css";

export default function StatCard({ label, value, icon: Icon, detail, tone = "blue" }) {
  return <article className={`stat-card stat-${tone}`}><div className="stat-card-top"><span>{label}</span>{Icon && <span className="stat-card-icon"><Icon size={19} /></span>}</div><strong>{value}</strong>{detail && <small>{detail}</small>}</article>;
}
