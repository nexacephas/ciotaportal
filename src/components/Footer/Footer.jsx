import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "./Footer.css";

export default function Footer({ label = "CIoTA Membership Concept" }) {
  return <footer className="shared-footer"><span>{label}</span><span><ShieldCheck size={14}/> Fictional demonstration</span><Link to="/">Back to website</Link></footer>;
}
