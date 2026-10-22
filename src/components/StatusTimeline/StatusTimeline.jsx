import "./StatusTimeline.css";

export default function StatusTimeline({ stages = [] }) {
  return <ol className="status-timeline">{stages.map((stage, index) => <li key={`${stage.label}-${index}`} className={`${stage.complete ? "is-complete" : ""} ${stage.current ? "is-current" : ""}`}><span className="timeline-marker" aria-hidden="true">{stage.complete ? "✓" : index + 1}</span><div><strong>{stage.label}</strong>{stage.date && <small>{stage.date}</small>}{stage.note && <p>{stage.note}</p>}</div></li>)}</ol>;
}
