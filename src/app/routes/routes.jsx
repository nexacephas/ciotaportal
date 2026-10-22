import { Link, Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "../../layouts/PublicLayout/PublicLayout";
import PortalLayout from "../../layouts/PortalLayout/PortalLayout";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import RoleGuard from "../../components/RoleGuard/RoleGuard";
import Home from "../../pages/public/Home/Home";
import About from "../../pages/public/About/About";
import Membership from "../../pages/public/Membership/Membership";
import MembershipDetails from "../../pages/public/MembershipDetails/MembershipDetails";
import ApplicationGuide from "../../pages/public/ApplicationGuide/ApplicationGuide";
import News from "../../pages/public/News/News";
import Resources from "../../pages/public/Resources/Resources";
import Contact from "../../pages/public/Contact/Contact";
import DemoAccess from "../../pages/auth/DemoAccess/DemoAccess";
import Login from "../../pages/auth/Login/Login";
import Register from "../../pages/auth/Register/Register";
import ApplicantDashboard from "../../pages/applicant/Dashboard/Dashboard";
import ApplicationForm from "../../pages/applicant/ApplicationForm/ApplicationForm";
import MyApplications from "../../pages/applicant/MyApplications/MyApplications";
import Documents from "../../pages/applicant/Documents/Documents";
import ApplicantNotifications from "../../pages/applicant/Notifications/Notifications";
import MemberDashboard from "../../pages/member/Dashboard/Dashboard";
import Profile from "../../pages/member/Profile/Profile";
import MembershipCard from "../../pages/member/MembershipCard/MembershipCard";
import MemberRenewals from "../../pages/member/Renewals/Renewals";
import PaymentHistory from "../../pages/member/PaymentHistory/PaymentHistory";
import MemberSettings from "../../pages/member/Settings/Settings";
import AdminDashboard from "../../pages/admin/Dashboard/Dashboard";
import Applications from "../../pages/admin/Applications/Applications";
import ApplicationReview from "../../pages/admin/ApplicationReview/ApplicationReview";
import Members from "../../pages/admin/Members/Members";
import MemberDetails from "../../pages/admin/MemberDetails/MemberDetails";
import AdminRenewals from "../../pages/admin/Renewals/Renewals";
import Reports from "../../pages/admin/Reports/Reports";
import AuditTrail from "../../pages/admin/AuditTrail/AuditTrail";
import AdminSettings from "../../pages/admin/Settings/Settings";
import Elections from "../../pages/member/Elections/Elections";
import ElectionDetails from "../../pages/member/ElectionDetails/ElectionDetails";
import AdminElections from "../../pages/admin/Elections/Elections";
import Billing from "../../pages/portal/Billing/Billing";
import AdminPayments from "../../pages/admin/Payments/Payments";

function NotFound() {
  return <main className="not-found"><span className="eyebrow">404 · Page not found</span><h1>This page is not part of the demo.</h1><p>Use the links below to return to a working CIoTA page.</p><div><Link className="btn btn-primary" to="/">Home</Link><Link className="btn btn-outline" to="/demo-access">Demo access</Link></div></main>;
}

export default function AppRoutes() {
  return <Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/membership" element={<Membership />} />
      <Route path="/membership/:category" element={<MembershipDetails />} />
      <Route path="/application-guide" element={<ApplicationGuide />} />
      <Route path="/news" element={<News />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/contact" element={<Contact />} />
    </Route>
    <Route element={<AuthLayout />}>
      <Route path="/demo-access" element={<DemoAccess />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Route>
    <Route path="/applicant" element={<RoleGuard role="applicant"><PortalLayout /></RoleGuard>}>
      <Route index element={<ApplicantDashboard />} />
      <Route path="application" element={<ApplicationForm />} />
      <Route path="applications" element={<MyApplications />} />
      <Route path="documents" element={<Documents />} />
      <Route path="notifications" element={<ApplicantNotifications />} />
      <Route path="billing" element={<Billing />} />
      <Route path="elections" element={<Elections />} />
      <Route path="elections/:electionId" element={<ElectionDetails />} />
    </Route>
    <Route path="/member" element={<RoleGuard role="member"><PortalLayout /></RoleGuard>}>
      <Route index element={<MemberDashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="membership-card" element={<MembershipCard />} />
      <Route path="renewals" element={<MemberRenewals />} />
      <Route path="payments" element={<PaymentHistory />} />
      <Route path="billing" element={<Billing />} />
      <Route path="elections" element={<Elections />} />
      <Route path="elections/:electionId" element={<ElectionDetails />} />
      <Route path="settings" element={<MemberSettings />} />
    </Route>
    <Route path="/admin" element={<RoleGuard role="admin"><AdminLayout /></RoleGuard>}>
      <Route index element={<AdminDashboard />} />
      <Route path="applications" element={<Applications />} />
      <Route path="applications/:applicationId" element={<ApplicationReview />} />
      <Route path="members" element={<Members />} />
      <Route path="members/:memberId" element={<MemberDetails />} />
      <Route path="renewals" element={<AdminRenewals />} />
      <Route path="payments" element={<AdminPayments />} />
      <Route path="elections" element={<AdminElections />} />
      <Route path="reports" element={<Reports />} />
      <Route path="audit-trail" element={<AuditTrail />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
    <Route path="/dashboard" element={<Navigate to="/demo-access" replace />} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}
