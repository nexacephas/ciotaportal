
import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useDemo } from "../../hooks/useDemo";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  RefreshCw,
  CreditCard,
  ChartNoAxesCombined,
  History,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  Globe,
  Vote,
} from "lucide-react";
import "./AdminLayout.css";

const adminNavigation = [
  {
    heading: "OVERVIEW",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
    ],
  },
  {
    heading: "MEMBERSHIP",
    items: [
      { label: "Applications", to: "/admin/applications", icon: ClipboardList },
      { label: "Members Directory", to: "/admin/members", icon: Users },
      { label: "Renewals", to: "/admin/renewals", icon: RefreshCw },
      { label: "Elections", to: "/admin/elections", icon: Vote },
    ],
  },
  {
    heading: "OPERATIONS",
    items: [
      { label: "Payments", to: "/admin/payments", icon: CreditCard },
      { label: "Reports & Analytics", to: "/admin/reports", icon: ChartNoAxesCombined },
      { label: "Audit Trail", to: "/admin/audit-trail", icon: History },
    ],
  },
  {
    heading: "SYSTEM",
    items: [
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

function AdminLayout() {
  const demo = useDemo();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");

  const submitAdminSearch = (event) => {
    event.preventDefault();
    navigate(`/admin/members?search=${encodeURIComponent(adminSearch.trim())}`);
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <button
          type="button"
          className="admin-mobile-overlay"
          aria-label="Close admin navigation"
          onClick={closeSidebar}
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <Link
          to="/admin"
          className="admin-brand"
          onClick={closeSidebar}
        >
          <span className="admin-brand-mark">C</span>
          <span className="admin-brand-copy">
            <strong>CIoTA</strong>
            <small>ADMINISTRATION</small>
          </span>
        </Link>

        <div className="admin-workspace-label">
          <span className="admin-workspace-indicator" />
          Management workspace
        </div>

        <nav className="admin-navigation" aria-label="Admin navigation">
          {adminNavigation.map((group) => (
            <div className="admin-nav-group" key={group.heading}>
              <h2 className="admin-nav-heading">{group.heading}</h2>

              {group.items.map(({ label, to, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{label}</span>
                  {label === "Applications" && (
                    <span className="admin-nav-count">{demo.applications.filter((application) => ["submitted", "under-review"].includes(application.status)).length}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-security-note">
            <ShieldCheck size={19} />
            <div>
              <strong>Demo environment</strong>
              <p>Fictional records. No live member data.</p>
            </div>
          </div>

          <Link to="/" className="admin-public-link">
            <Globe size={17} />
            <span>View public website</span>
            <ChevronRight size={15} />
          </Link>
          <button type="button" className="admin-public-link admin-signout" onClick={() => { demo.logout(); navigate("/"); }}>
            <ShieldCheck size={17} />
            <span>Sign out of demo</span>
          </button>
        </div>
      </aside>

      <div className="admin-main-area">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle admin navigation"
            >
              {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            <div className="admin-breadcrumb">
              <span>CIoTA</span>
              <ChevronRight size={15} />
              <strong>Administration</strong>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <form className="admin-search" onSubmit={submitAdminSearch}>
              <Search size={17} />
              <input
                type="search"
                placeholder="Search members..."
                aria-label="Search members"
                value={adminSearch}
                onChange={(event) => setAdminSearch(event.target.value)}
              />
              <button type="submit" aria-label="Submit member search"><kbd>Enter</kbd></button>
            </form>

            <Link
              to="/admin/applications"
              className="admin-icon-button"
              aria-label={`${demo.applications.filter((application) => ["submitted", "under-review"].includes(application.status)).length} applications need review`}
              title="Open applications needing review"
            >
              <Bell size={19} />
              <span className="admin-alert-dot" />
            </Link>

            <div className="admin-account">
              <div className="admin-account-avatar">{demo.demoUser?.name?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "AD"}</div>
              <div className="admin-account-copy">
                <strong>{demo.demoUser?.name ?? "Demo Administrator"}</strong>
                <span>System Admin · Demo</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <div className="admin-demo-banner">
            <ShieldCheck size={17} />
            <span>
              <strong>Prototype mode.</strong> All applications, members,
              and transactions are simulated.
            </span>
          </div>

          <Outlet />
        </main>

        <footer className="admin-footer">
          <span>CIoTA Membership Management · Concept prototype</span>
          <span>KEPHAS</span>
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;
