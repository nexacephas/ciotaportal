import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useDemo } from "../../../hooks/useDemo";
import Button from "../../../components/Button/Button";
import "./Login.css";

const roles = { applicant: { name: "Amina Bello", email: "amina.bello@example.test", path: "/applicant" }, member: { name: "Fatima Yusuf", email: "fatima.yusuf@example.test", path: "/member" }, admin: { name: "Demo Administrator", email: "admin@example.test", path: "/admin" } };

export default function Login() {
  const demo=useDemo();const navigate=useNavigate();const [role,setRole]=useState("applicant");
  function submit(event){event.preventDefault();const account=roles[role];demo.enterDemo(role,account);navigate(account.path);}
  return <div className="login-page"><span className="auth-step-label"><ShieldCheck size={15}/> DEMO ACCESS</span><h2>Open a demo workspace</h2><p className="login-subtitle">Choose a role to preview the proposed membership experience.</p><form className="auth-form" onSubmit={submit}><div className="auth-field"><label htmlFor="demo-role">Demo role</label><select id="demo-role" className="form-control" value={role} onChange={(event)=>setRole(event.target.value)}><option value="applicant">Applicant</option><option value="member">Member</option><option value="admin">Administrator</option></select></div><div className="demo-login-note"><strong>Fictional demo profile</strong><span>{roles[role].name} · {roles[role].email}</span><p>No password is requested or stored. Role selection is for demonstration only and is not secure authentication.</p></div><Button type="submit" className="auth-submit">Continue as {role} <ArrowRight size={16}/></Button></form><p className="auth-switch">New to the prototype? <Link to="/register">Start an applicant application</Link></p><div className="auth-demo-callout"><strong>Need another role?</strong><p><Link to="/demo-access">Choose from all demo experiences</Link></p></div></div>;
}
