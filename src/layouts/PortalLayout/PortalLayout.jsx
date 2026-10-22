
import { NavLink, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Files,
  Bell,
  UserRound,
  CreditCard,
  RefreshCw,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck,
  CircleHelp,
  Vote,
} from "lucide-react";
import { useState } from "react";
import { useDemo } from "../../hooks/useDemo";
import "./PortalLayout.css";

const applicantLinks = [
  { label: "Overview", to: "/applicant", icon: LayoutDashboard, end: true },
  { label: "My Application", to: "/applicant/application", icon: FileText },
  { label: "Application History", to: "/applicant/applications", icon: Files },
  { label: "Documents", to: "/applicant/documents", icon: Files },
  { label: "Notifications", to: "/applicant/notifications", icon: Bell },
  { label: "Billing", to: "/applicant/billing", icon: CreditCard },
  { label: "Elections", to: "/applicant/elections", icon: Vote },
];

const memberLinks = [
  { label: "Overview", to: "/member", icon: LayoutDashboard, end: true },
  { label: "My Profile", to: "/member/profile", icon: UserRound },
  { label: "Membership Card", to: "/member/membership-card", icon: CreditCard },
  { label: "Renewals", to: "/member/renewals", icon: RefreshCw },
  { label: "Elections", to: "/member/elections", icon: Vote },
  { label: "Billing", to: "/member/billing", icon: CreditCard },
  { label: "Payment History", to: "/member/payments", icon: Files },
  { label: "Settings", to: "/member/settings", icon: Settings },
];

function PortalLayout() {
  const demo = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMember = location.pathname.startsWith("/member");
  const links = isMember ? memberLinks : applicantLinks;
  const roleName = isMember ? "Member Portal" : "Applicant Portal";
  const homePath = isMember ? "/member" : "/applicant";
  const currentMember = demo.members.find((member) => member.email === demo.demoUser?.email) ?? demo.members[0];
  const profileName = demo.demoUser?.name ?? (isMember ? currentMember?.fullName : "Amina Bello");

  const closeSidebar = () => setSidebarOpen(false);

  const handleRoleChange = (event) => {
    const nextPath = event.target.value;
    if (nextPath === "/member") demo.enterDemo("member", { name: currentMember?.fullName ?? "Demo Member", email: currentMember?.email ?? "" });
    else demo.enterDemo("applicant", { name: "Amina Bello", email: "amina.bello@example.test" });
    navigate(nextPath);
    closeSidebar();
  };

  return (
    <div className="portal-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="portal-mobile-overlay"
          aria-label="Close navigation"
          onClick={closeSidebar}
        />
      )}

      <aside className={`portal-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <Link to="/" className="portal-brand" onClick={closeSidebar}>
          <span className="portal-brand-mark">C</span>
          <span className="portal-brand-copy">
            <strong>CIoTA</strong>
            <small>DIGITAL MEMBERSHIP</small>
          </span>
        </Link>

        <div className="portal-role-label">
          <span className="portal-role-dot" />
          {roleName}
        </div>

        <div className="portal-profile">
          <div className="portal-avatar">
            {profileName?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? (isMember ? "MB" : "AP")}
          </div>
          <div className="portal-profile-info">
                <strong>{profileName}</strong>
                <span>{isMember ? "Demo Member" : "Demo Applicant"}</span>
          </div>
          <ChevronDown size={16} className="portal-profile-chevron" />
        </div>

        <div className="portal-nav-heading">WORKSPACE</div>

        <nav className="portal-nav" aria-label="Portal navigation">
          {links.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `portal-nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Notifications" && (
                <span className="portal-notification-count">{demo.notifications.filter((item) => item.audience === (isMember ? "member" : "applicant") && !item.read).length}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="portal-sidebar-bottom">
          <div className="portal-help-card">
            <CircleHelp size={19} />
            <strong>Need assistance?</strong>
            <p>This is a demonstration of proposed member services.</p>
            <Link to="/contact" onClick={closeSidebar}>
              Contact CIoTA <ArrowUpRight size={14} />
            </Link>
          </div>

          <button type="button" className="portal-back-link" onClick={() => { demo.logout(); navigate("/"); }}>
            <LogOut size={17} />
            <span>Sign out of demo</span>
          </button>

          <div className="portal-demo-label">
            <ShieldCheck size={15} />
            DEMO ENVIRONMENT
          </div>
        </div>
      </aside>

      <div className="portal-main-area">
        <header className="portal-topbar">
          <div className="portal-topbar-left">
            <button
              type="button"
              className="portal-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            <div>
              <span className="portal-topbar-eyebrow">CIoTA MEMBERSHIP</span>
              <h1>{isMember ? "Member workspace" : "Applicant workspace"}</h1>
            </div>
          </div>

          <div className="portal-topbar-actions">
            <label className="portal-role-switch">
              <span>Demo role</span>
              <select
                value={homePath}
                onChange={handleRoleChange}
                aria-label="Switch demo role"
              >
                <option value="/applicant">Applicant</option>
                <option value="/member">Member</option>
              </select>
            </label>

            <Link
              to={isMember ? "/member/settings" : "/applicant/notifications"}
              className="portal-icon-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="portal-notification-dot" />
            </Link>

            <div className="portal-topbar-avatar">
              {isMember ? "TA" : "AB"}
            </div>
          </div>
        </header>

        <main className="portal-content">
          <div className="portal-demo-banner">
            <ShieldCheck size={16} />
            <span>
              Concept demonstration — all profiles and records are fictional.
            </span>
          </div>

          <Outlet />
        </main>

        <footer className="portal-footer">
          <span>CIoTA Membership Concept</span>
          <span>Designed by KEPHAS</span>
        </footer>
      </div>
    </div>
  );
}

export default PortalLayout;
