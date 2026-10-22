
import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import "./AuthLayout.css";

export default function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-visual">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">C</span>
          <span>
            <strong>CIoTA Nigeria</strong>
            <small>Chartered Institute of Transport Administration</small>
          </span>
        </Link>

        <div className="auth-visual-content">
          <span className="auth-eyebrow">PROFESSIONAL EXCELLENCE</span>
          <h1>Connecting transport professionals. Advancing the industry.</h1>
          <p>
            Access your membership journey, manage your professional profile,
            and stay connected with the transport administration community.
          </p>

          <div className="auth-feature">
            <ShieldCheck size={22} />
            <div>
              <strong>Your professional journey, in one place.</strong>
              <p>
                Explore a proposed digital experience for membership
                applications and member services.
              </p>
            </div>
          </div>
        </div>

        <div className="auth-visual-footer">
          <span>KEPHAS concept prototype</span>
          <span>© 2026</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <Link to="/" className="auth-back-link">
          <ArrowLeft size={16} />
          Back to website
        </Link>

        <div className="auth-form-container">
          <Outlet />
        </div>

        <p className="auth-demo-note">
          Demonstration only · Not an official CIoTA authentication service
        </p>
      </section>
    </main>
  );
}
