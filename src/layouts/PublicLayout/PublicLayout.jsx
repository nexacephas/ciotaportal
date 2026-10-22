
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  Mail,
  MapPin,
} from "lucide-react";
import "./PublicLayout.css";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "About CIoTA", to: "/about" },
  { label: "Membership", to: "/membership" },
  { label: "News & Events", to: "/news" },
  { label: "Resources", to: "/resources" },
  { label: "Contact", to: "/contact" },
];

function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="public-layout">
      <div className="public-topbar">
        <div className="container public-topbar-inner">
          <span>
            <MapPin size={14} />
            <span>Advancing Transport Administration in Nigeria</span>
          </span>

          <Link to="/contact">
            <Mail size={14} />
            <span>Contact the Institute</span>
          </Link>
        </div>
      </div>

      <header className="public-header">
        <div className="container public-header-inner">
          <Link
            to="/"
            className="public-brand"
            aria-label="CIoTA home"
            onClick={closeMenu}
          >
            <span className="public-brand-mark">C</span>
            <span className="public-brand-copy">
              <strong>CIoTA</strong>
              <small>CHARTERED INSTITUTE OF TRANSPORT ADMINISTRATION</small>
            </span>
          </Link>

          <button
            type="button"
            className="public-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>

          <nav
            className={`public-navigation ${menuOpen ? "is-open" : ""}`}
            aria-label="Main navigation"
          >
            <div className="public-nav-links">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `public-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            <div className="public-nav-actions">
              <Link
                to="/login"
                className="public-login-link"
                onClick={closeMenu}
              >
                Sign in
              </Link>

              <Link
                to="/membership"
                className="btn btn-primary public-apply-btn"
                onClick={closeMenu}
              >
                Become a Member <ArrowRight size={16} />
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="public-main">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container public-footer-grid">
          <div className="public-footer-about">
            <Link to="/" className="public-brand public-footer-brand">
              <span className="public-brand-mark">C</span>
              <span className="public-brand-copy">
                <strong>CIoTA</strong>
                <small>TRANSPORT ADMINISTRATION</small>
              </span>
            </Link>

            <p>
              A proposed digital membership experience for the Chartered
              Institute of Transport Administration of Nigeria.
            </p>

            <span className="public-demo-note">
              KEPHAS concept prototype · Not an official CIoTA platform
            </span>
          </div>

          <div className="public-footer-column">
            <h3>Explore</h3>
            <Link to="/about">About CIoTA</Link>
            <Link to="/membership">Membership</Link>
            <Link to="/application-guide">Application guide</Link>
            <Link to="/news">News & events</Link>
          </div>

          <div className="public-footer-column">
            <h3>Member services</h3>
            <Link to="/demo-access">Explore the demo</Link>
            <Link to="/login">Member sign in</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/contact">Contact</Link>
          </div>

          <div className="public-footer-column">
            <h3>Quick access</h3>
            <p>Explore the proposed digital membership workflow.</p>
            <Link to="/demo-access" className="public-footer-cta">
              Open demo <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="public-footer-bottom">
          <div className="container public-footer-bottom-inner">
            <span>© {new Date().getFullYear()} CIoTA concept demonstration</span>
            <span>Designed by KEPHAS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;
