import "./PageHeader.css";

export default function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  return <header className={`page-heading ${className}`.trim()}><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-heading-actions">{actions}</div>}</header>;
}
