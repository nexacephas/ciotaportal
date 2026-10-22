import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, ClipboardCheck, ShieldCheck, Users } from "lucide-react";
import { useDemo } from "../../../hooks/useDemo";
import Button from "../../../components/Button/Button";
import "./DemoAccess.css";

const roles = [
  { role: "applicant", title: "Applicant", name: "Amina Bello", email: "amina.bello@example.test", description: "Submit and track a membership application.", icon: ClipboardCheck, path: "/applicant" },
  { role: "member", title: "Member", description: "Explore member profile, card, payments, and renewals.", icon: Users, path: "/member" },
  { role: "admin", title: "Administrator", name: "Demo Administrator", email: "admin@example.test", description: "Review applications and manage demo records.", icon: BriefcaseBusiness, path: "/admin" },
];

export default function DemoAccess() {
  const demo = useDemo();
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState(demo.members[0]?.id ?? "");
  const selectedMember = demo.members.find((member) => member.id === memberId) ?? demo.members[0];

  return <div className="demo-access-page">
    <span className="auth-step-label"><ShieldCheck size={15} /> PROTOTYPE WORKSPACE</span>
    <h2>Choose a demo experience</h2>
    <p className="demo-access-intro">Select a fictional role to explore. No password, account, or backend authentication is used.</p>
    <div className="demo-role-grid">
      {roles.map(({ role, title, name, email, description, icon: Icon, path }) => {
        const account = role === "member"
          ? { name: selectedMember?.fullName ?? "Demo Member", email: selectedMember?.email ?? "" }
          : { name, email };
        return <article className="demo-role-card" key={role}>
          <span className="demo-role-icon"><Icon size={22} /></span>
          <h3>{title}</h3>
          <p>{description}</p>
          {role === "member" && <label className="demo-member-picker"><span>Choose member record</span><select value={selectedMember?.id ?? ""} onChange={(event) => setMemberId(event.target.value)}>{demo.members.map((member) => <option key={member.id} value={member.id}>{member.fullName} · {member.memberNumber}</option>)}</select></label>}
          <small>{account.name} · {account.email}</small>
          <Button className="btn-block" onClick={() => { demo.enterDemo(role, account); navigate(path); }}>Enter as {title.toLowerCase()} <ArrowRight size={15} /></Button>
        </article>;
      })}
    </div>
    <p className="auth-switch">Already know the demo flow? <Link to="/login">Continue to demo sign in</Link></p>
  </div>;
}
