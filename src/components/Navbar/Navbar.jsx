import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import "./Navbar.css";

const links=[{to:"/",label:"Home",end:true},{to:"/about",label:"About"},{to:"/membership",label:"Membership"},{to:"/application-guide",label:"Application guide"},{to:"/resources",label:"Resources"},{to:"/contact",label:"Contact"}];
export default function Navbar(){const [open,setOpen]=useState(false);return <header className="shared-navbar"><Link className="shared-navbar-brand" to="/">CIoTA <small>NIGERIA</small></Link><button className="shared-navbar-toggle" type="button" aria-label={open?"Close navigation":"Open navigation"} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav className={open?"is-open":""} aria-label="Site navigation">{links.map((item)=><NavLink key={item.to} to={item.to} end={item.end} onClick={()=>setOpen(false)}>{item.label}</NavLink>)}<Link className="shared-navbar-cta" to="/demo-access" onClick={()=>setOpen(false)}>Explore demo</Link></nav></header>}
