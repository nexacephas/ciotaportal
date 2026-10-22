import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BadgeCheck, Bell, BriefcaseBusiness, CreditCard, FileCheck2, FileText, Users, WalletCards, Download, RotateCcw, Check, X, ArrowRight, CircleDollarSign } from "lucide-react";
import { useDemo } from "../../hooks/useDemo";
import { membershipCategories, findMembershipCategory } from "../../data/membershipConfig";
import { getApplicationProgress } from "../../features/applications/applicationUtils";
import { getMemberStats } from "../../features/memberships/membershipUtils";
import { getPaymentTotals } from "../../features/payments/paymentUtils";
import { formatCurrency, formatDate, formatStatus } from "../../utils/formatters";
import { validateApplication } from "../../utils/validators";
import { useApplications } from "../../hooks/useApplications";
import { getApplication } from "../../services/applicationService";
import { getMember } from "../../services/memberService";
import { getReportData } from "../../services/reportService";
import Badge from "../Badge/Badge";
import Button from "../Button/Button";
import Card from "../Card/Card";
import DataTable from "../DataTable/DataTable";
import EmptyState from "../EmptyState/EmptyState";
import FormField from "../FormField/FormField";
import Modal from "../Modal/Modal";
import PageHeader from "../PageHeader/PageHeader";
import SearchBar from "../SearchBar/SearchBar";
import StatCard from "../StatCard/StatCard";
import StatusTimeline from "../StatusTimeline/StatusTimeline";
import "./WorkspacePage.css";

const blankApplication = { fullName: "", email: "", phone: "", category: "graduate", occupation: "", organization: "", state: "", highestQualification: "" };
const titles = {
  "applicant-dashboard": ["Applicant overview", "Track your application and prepare the next step in your CIoTA membership journey."],
  "application-form": ["Membership application", "Complete your professional details. This demonstration does not send information to CIoTA."],
  "my-applications": ["Application history", "Review submissions and current committee decisions."],
  documents: ["My documents", "A demonstration checklist of records commonly required during review."],
  notifications: ["Notifications", "Updates associated with your demonstration workspace."],
  "member-dashboard": ["Member overview", "Your membership at a glance, with renewal and payment activity."],
  profile: ["My profile", "View and update the professional details in this demo record."],
  "membership-card": ["Membership card", "A sample digital membership credential for demonstration purposes."],
  "payment-history": ["Payment history", "Review simulated transactions associated with your membership."],
  renewals: ["Membership renewals", "Start a renewal and record a simulated payment."],
  settings: ["Account settings", "Manage demonstration preferences and your demo session."],
  "admin-dashboard": ["Administration overview", "A live summary of the current demonstration records."],
  applications: ["Applications", "Search, review, and decide on submitted membership applications."],
  "application-review": ["Application review", "Review applicant details and record a committee decision."],
  members: ["Members directory", "Search the demo directory and manage membership status."],
  "member-details": ["Member record", "Review membership details and update the current record."],
  "admin-renewals": ["Renewal queue", "Review renewal requests and record simulated payments."],
  payments: ["Payments", "View demo transaction records or record a simulated payment."],
  reports: ["Reports & analytics", "Figures are calculated directly from the current demo records."],
  "audit-trail": ["Audit trail", "Recent changes made in this demonstration workspace."],
  "admin-settings": ["Workspace settings", "Configure demo reminders or restore the original sample records."],
};

const nameCell = (name, sub) => <span className="record-person"><strong>{name}</strong>{sub && <small>{sub}</small>}</span>;
const dateCell = (date) => formatDate(date);

export default function WorkspacePage({ kind }) {
  const demo = useDemo();
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId, memberId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("search") ?? "";
  const setQuery = (value) => setSearchParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set("search", value);
    else next.delete("search");
    return next;
  }, { replace: true });
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState({});
  const [applicationForm, setApplicationForm] = useState({ ...blankApplication, ...(location.state?.registration ?? {}), ...(demo.demoUser?.email ? { email: demo.demoUser.email, fullName: demo.demoUser.name ?? "" } : {}) });
  const [reviewNote, setReviewNote] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ memberId: demo.members[0]?.id ?? "", renewalId: "", amount: "", purpose: "Membership fee", status: "paid" });
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  const [settingsForm, setSettingsForm] = useState(demo.settings);

  const selectedApplication = getApplication(demo.applications, applicationId);
  const selectedMember = getMember(demo.members, memberId) ?? demo.members.find((item) => item.email === demo.demoUser?.email) ?? demo.members[0];
  const { applications } = useApplications({ query, status: statusFilter });
  const members = useMemo(() => demo.members.filter((item) => (statusFilter === "all" || item.status === statusFilter) && `${item.fullName} ${item.memberNumber} ${item.email} ${item.organization}`.toLowerCase().includes(query.toLowerCase())), [demo.members, statusFilter, query]);
  const renewals = useMemo(() => demo.renewals.filter((item) => (statusFilter === "all" || item.status === statusFilter) && `${item.memberName} ${item.reference}`.toLowerCase().includes(query.toLowerCase())), [demo.renewals, statusFilter, query]);
  const payments = useMemo(() => demo.payments.filter((item) => (statusFilter === "all" || item.status === statusFilter) && `${item.reference} ${item.purpose} ${item.method} ${item.memberId}`.toLowerCase().includes(query.toLowerCase())), [demo.payments, statusFilter, query]);
  const summary = getReportData(demo.data);
  const header = titles[kind] ?? ["Workspace", "CIoTA membership demonstration."];

  const flash = (message) => { setNotice(message); window.setTimeout(() => setNotice(""), 4500); };
  const submitApplication = (event) => {
    event.preventDefault();
    const validation = validateApplication(applicationForm);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    const result = demo.submitApplication(applicationForm);
    if (result.errors) { setErrors(result.errors); return; }
    flash(`Application ${result.application.reference} submitted.`);
    navigate("/applicant/applications");
  };
  const decideApplication = (decision) => {
    const result = demo.reviewApplication(applicationId, decision, reviewNote);
    if (result?.error) flash(result.error);
    else { flash(`Application ${formatStatus(decision).toLowerCase()}${decision === "approved" ? " and member record created" : ""}.`); setReviewNote(""); }
  };
  const requestRenewal = () => {
    const result = demo.requestRenewal(selectedMember?.id);
    if (result?.error) flash(result.error);
    else flash(`Renewal ${result.renewal.reference} is ready for demo payment.`);
  };
  const payRenewal = () => {
    navigate(kind === "admin-renewals" ? "/admin/payments" : "/member/billing");
  };
  const submitPayment = (event) => {
    event.preventDefault();
    const renewal = demo.renewals.find((item) => item.id === paymentForm.renewalId);
    const result = demo.recordDemoPayment({ ...paymentForm, amount: paymentForm.amount || renewal?.amount });
    if (result.error) { flash(result.error); return; }
    setPaymentOpen(false);
    setPaymentForm({ memberId: demo.members[0]?.id ?? "", renewalId: "", amount: "", purpose: "Membership fee", status: "paid" });
    flash(`Demo payment ${result.payment.reference} recorded.`);
  };
  const updateProfile = (event) => {
    event.preventDefault();
    const result = demo.updateMember(selectedMember.id, profileForm);
    if (result.error) flash(result.error); else { setProfileOpen(false); flash("Demo profile updated."); }
  };
  const exportCsv = () => {
    const rows = demo.members.map((item) => [item.memberNumber, item.fullName, item.email, formatStatus(item.category), formatStatus(item.status)].map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","));
    const blob = new Blob([["Member number,Name,Email,Category,Status", ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "ciota-demo-members.csv"; link.click(); URL.revokeObjectURL(url);
  };

  const applicationColumns = [
    { key: "applicant", label: "Applicant", render: (row) => nameCell(row.fullName, row.email) },
    { key: "reference", label: "Reference" },
    { key: "category", label: "Category", render: (row) => findMembershipCategory(row.category).name },
    { key: "submittedAt", label: "Submitted", render: (row) => dateCell(row.submittedAt) },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
    { key: "action", label: "", render: (row) => <Link className="table-link" to={`/admin/applications/${row.id}`}>Review <ArrowRight size={14} /></Link> },
  ];
  const memberColumns = [
    { key: "member", label: "Member", render: (row) => nameCell(row.fullName, row.memberNumber) },
    { key: "category", label: "Category", render: (row) => findMembershipCategory(row.category).name },
    { key: "organization", label: "Organization" },
    { key: "expiresAt", label: "Expires", render: (row) => dateCell(row.expiresAt) },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
    { key: "action", label: "", render: (row) => <Link className="table-link" to={`/admin/members/${row.id}`}>View <ArrowRight size={14} /></Link> },
  ];
  const renewalColumns = [
    { key: "memberName", label: "Member", render: (row) => nameCell(row.memberName, row.reference) },
    { key: "category", label: "Category", render: (row) => findMembershipCategory(row.category).name },
    { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "requestedAt", label: "Requested", render: (row) => dateCell(row.requestedAt) },
    { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
    { key: "action", label: "Action", render: (row) => row.status === "pending-payment" ? <span className="table-actions"><Button size="sm" onClick={() => payRenewal(row)}>{kind === "admin-renewals" ? "Review payment" : "View bill"}</Button>{kind === "admin-renewals" && <Button size="sm" variant="outline" onClick={() => { const result = demo.reviewRenewal(row.id, "rejected"); if (result.error) flash(result.error); else flash("Unpaid renewal rejected."); }}>Reject</Button>}</span> : kind === "admin-renewals" && row.status === "paid" ? <Button size="sm" onClick={() => { const result = demo.reviewRenewal(row.id, "approved"); if (result.error) flash(result.error); else flash("Renewal approved; membership term extended."); }}>Approve renewal</Button> : <span className="muted">{row.paymentId ? "Payment recorded" : "—"}</span> },
  ];
  const paymentColumns = [
    { key: "reference", label: "Reference" }, { key: "purpose", label: "Purpose" },
    { key: "amount", label: "Amount", render: (row) => formatCurrency(row.amount) },
    { key: "paidAt", label: "Date", render: (row) => dateCell(row.paidAt) },
    { key: "method", label: "Method" }, { key: "status", label: "Status", render: (row) => <Badge status={row.status} /> },
  ];

  const renderApplicationForm = () => <Card><form className="workspace-form" onSubmit={submitApplication} noValidate>
    <div className="form-grid"><FormField label="Full name" name="fullName" required value={applicationForm.fullName} error={errors.fullName} onChange={(e) => setApplicationForm({ ...applicationForm, fullName: e.target.value })} />
      <FormField label="Email address" name="email" type="email" required value={applicationForm.email} error={errors.email} onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })} />
      <FormField label="Phone number" name="phone" type="tel" required value={applicationForm.phone} error={errors.phone} onChange={(e) => setApplicationForm({ ...applicationForm, phone: e.target.value })} />
      <FormField label="Membership category" name="category" required><select id="application-category" value={applicationForm.category} onChange={(e) => setApplicationForm({ ...applicationForm, category: e.target.value })}>{membershipCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
      <FormField label="Current occupation" name="occupation" required value={applicationForm.occupation} error={errors.occupation} onChange={(e) => setApplicationForm({ ...applicationForm, occupation: e.target.value })} />
      <FormField label="Organization" name="organization" required value={applicationForm.organization} error={errors.organization} onChange={(e) => setApplicationForm({ ...applicationForm, organization: e.target.value })} />
      <FormField label="State / FCT" name="state" required value={applicationForm.state} error={errors.state} onChange={(e) => setApplicationForm({ ...applicationForm, state: e.target.value })} />
      <FormField label="Highest qualification" name="highestQualification" required value={applicationForm.highestQualification} error={errors.highestQualification} onChange={(e) => setApplicationForm({ ...applicationForm, highestQualification: e.target.value })} />
    </div><p className="form-disclaimer">Prototype only. Do not enter real sensitive or identity documents.</p><div className="form-actions"><Button type="submit">Submit for review <ArrowRight size={16} /></Button></div>
  </form></Card>;

  let body;
  switch (kind) {
    case "application-form": body = <><PageHeader eyebrow="Applicant portal" title={header[0]} description={header[1]} />{renderApplicationForm()}</>; break;
    case "applicant-dashboard": {
      const mine = demo.applications.filter((item) => item.email === demo.demoUser?.email);
      const current = mine[0];
      body = <><PageHeader eyebrow="Applicant portal" title={`Welcome${demo.demoUser?.name ? `, ${demo.demoUser.name.split(" ")[0]}` : ""}`} description={header[1]} actions={<Link className="btn btn-primary" to="/applicant/application">Start application <ArrowRight size={16} /></Link>} /><div className="stat-grid"><StatCard label="My applications" value={mine.length || "—"} icon={FileText} /><StatCard label="Current status" value={current ? formatStatus(current.status) : "Not started"} icon={FileCheck2} tone="green" /><StatCard label="Unread updates" value={demo.notifications.filter((item) => item.audience === "applicant" && (!item.recipientEmail || item.recipientEmail === demo.demoUser?.email) && !item.read).length} icon={Bell} tone="gold" /></div><div className="workspace-columns"><Card><h2>Application progress</h2>{current ? <><p><strong>{current.reference}</strong> · {findMembershipCategory(current.category).name}</p><StatusTimeline stages={getApplicationProgress(current.status).map((stage) => ({ ...stage, date: stage.complete ? formatDate(current.submittedAt) : "" }))} />{current.reviewNote && <div className="notice-box">Committee note: {current.reviewNote}</div>}</> : <EmptyState title="Begin your membership journey" description="Complete an application to see your progress here." action={<Link className="btn btn-primary" to="/applicant/application">Start application</Link>} />}</Card><Card><h2>Next steps</h2><ul className="action-list"><li><FileCheck2 size={18} /><span>Complete your professional details</span></li><li><BriefcaseBusiness size={18} /><span>Prepare qualification and reference details</span></li><li><Bell size={18} /><span>Watch for updates in your notifications</span></li></ul><Link className="table-link" to="/applicant/applications">View application history <ArrowRight size={15} /></Link></Card></div></>; break;
    }
    case "my-applications": body = <><PageHeader eyebrow="Applicant portal" title={header[0]} description={header[1]} actions={<Link className="btn btn-primary" to="/applicant/application">New application</Link>} /><Card><div className="table-toolbar"><SearchBar value={query} onChange={setQuery} /><select aria-label="Filter applications by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{["submitted", "under-review", "approved", "rejected"].map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</select></div><DataTable columns={applicationColumns.slice(0, 5)} rows={demo.applications.filter((item) => item.email === demo.demoUser?.email || demo.role === "admin").filter((item) => (statusFilter === "all" || item.status === statusFilter) && `${item.fullName} ${item.reference}`.toLowerCase().includes(query.toLowerCase()))} /></Card></>; break;
    case "documents": body = <><PageHeader eyebrow="Applicant portal" title={header[0]} description={header[1]} /><div className="document-grid">{[["Identity document", "A government-issued photo ID", "Required"], ["Qualification certificate", "Your highest relevant qualification", "Required"], ["Professional reference", "A referee familiar with your work", "Recommended"]].map(([title, text, status]) => <Card key={title}><FileText size={22} /><h3>{title}</h3><p>{text}</p><Badge status="info">{status}</Badge><p className="small-note">Uploads are not enabled in this prototype.</p></Card>)}</div></>; break;
    case "notifications": body = <><PageHeader eyebrow="Applicant portal" title={header[0]} description={header[1]} /><div className="notification-list">{demo.notifications.filter((item) => (item.audience === "applicant" && (!item.recipientEmail || item.recipientEmail === demo.demoUser?.email)) || demo.role === "admin").map((item) => <Card key={item.id} className={item.read ? "is-read" : ""}><div><Badge status={item.read ? "info" : "submitted"}>{item.read ? "Read" : "New"}</Badge><h3>{item.title}</h3><p>{item.body}</p><small>{dateCell(item.createdAt)}</small></div>{!item.read && <Button variant="outline" size="sm" onClick={() => demo.markNotificationRead(item.id)}>Mark read</Button>}</Card>)}</div>{!demo.notifications.length && <EmptyState />}</>; break;
    case "member-dashboard": body = <><PageHeader eyebrow="Member portal" title={`Good day${selectedMember ? `, ${selectedMember.fullName.split(" ")[0]}` : ""}`} description={header[1]} actions={<Link className="btn btn-primary" to="/member/membership-card">View membership card <ArrowRight size={15} /></Link>} /><div className="stat-grid"><StatCard label="Membership status" value={formatStatus(selectedMember?.status)} icon={BadgeCheck} tone="green" /><StatCard label="Member number" value={selectedMember?.memberNumber ?? "—"} icon={Users} /><StatCard label="Membership expires" value={formatDate(selectedMember?.expiresAt)} icon={CreditCard} tone="gold" /><StatCard label="Recorded payments" value={demo.payments.filter((item) => item.memberId === selectedMember?.id).length} icon={WalletCards} /></div><div className="workspace-columns"><Card><h2>Membership details</h2><dl className="detail-list"><div><dt>Category</dt><dd>{selectedMember ? findMembershipCategory(selectedMember.category).name : "—"}</dd></div><div><dt>Organization</dt><dd>{selectedMember?.organization ?? "—"}</dd></div><div><dt>State</dt><dd>{selectedMember?.state ?? "—"}</dd></div><div><dt>Renewal</dt><dd>{demo.renewals.find((item) => item.memberId === selectedMember?.id && item.status === "pending-payment") ? "Payment due" : "No open renewal"}</dd></div></dl></Card><Card><h2>Recent activity</h2><div className="compact-list">{demo.payments.filter((item) => item.memberId === selectedMember?.id).slice(0, 4).map((item) => <div key={item.id}><span><strong>{item.purpose}</strong><small>{dateCell(item.paidAt)}</small></span><span>{formatCurrency(item.amount)}</span></div>)}</div><Link className="table-link" to="/member/payments">View payment history <ArrowRight size={15} /></Link></Card></div></>; break;
    case "profile": body = <><PageHeader eyebrow="Member portal" title={header[0]} description={header[1]} actions={<Button onClick={() => { setProfileForm(selectedMember ?? {}); setProfileOpen(true); }}>Edit profile</Button>} /><Card><div className="profile-summary"><div className="profile-avatar">{selectedMember?.fullName?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "CI"}</div><div><h2>{selectedMember?.fullName ?? "Demo Member"}</h2><p>{selectedMember?.memberNumber}</p><Badge status={selectedMember?.status}>{formatStatus(selectedMember?.status)}</Badge></div></div><dl className="detail-list detail-grid"><div><dt>Email</dt><dd>{selectedMember?.email}</dd></div><div><dt>Phone</dt><dd>{selectedMember?.phone}</dd></div><div><dt>Occupation</dt><dd>{selectedMember?.occupation}</dd></div><div><dt>Organization</dt><dd>{selectedMember?.organization}</dd></div><div><dt>Category</dt><dd>{findMembershipCategory(selectedMember?.category).name}</dd></div><div><dt>State</dt><dd>{selectedMember?.state}</dd></div></dl></Card><Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Edit demo profile"><form className="workspace-form" onSubmit={updateProfile}><FormField label="Phone" value={profileForm.phone ?? ""} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /><FormField label="Organization" value={profileForm.organization ?? ""} onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })} /><FormField label="Occupation" value={profileForm.occupation ?? ""} onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })} /><Button type="submit">Save demo changes</Button></form></Modal></>; break;
    case "membership-card": body = <><PageHeader eyebrow="Member portal" title={header[0]} description={header[1]} actions={<Button variant="outline" onClick={() => window.print()}>Print card</Button>} /><div className="membership-card"><div className="membership-card-brand"><span className="brand-mark">C</span><span><strong>CIoTA NIGERIA</strong><small>PROFESSIONAL MEMBERSHIP</small></span></div><div className="membership-card-person"><span className="card-avatar">{selectedMember?.fullName?.split(" ").map((part) => part[0]).join("").slice(0, 2) ?? "CI"}</span><div><small>MEMBER</small><h2>{selectedMember?.fullName}</h2><span>{findMembershipCategory(selectedMember?.category).name}</span></div></div><div className="membership-card-foot"><span><small>MEMBER NUMBER</small><strong>{selectedMember?.memberNumber}</strong></span><span><small>VALID THROUGH</small><strong>{formatDate(selectedMember?.expiresAt)}</strong></span></div><div className="card-demo-label">DEMONSTRATION CARD · NOT AN OFFICIAL CREDENTIAL</div></div></>; break;
    case "payment-history": body = <><PageHeader eyebrow="Member portal" title={header[0]} description={header[1]} /><Card><DataTable columns={paymentColumns} rows={demo.payments.filter((item) => item.memberId === selectedMember?.id)} emptyTitle="No payment records" /></Card></>; break;
    case "renewals": body = <><PageHeader eyebrow="Member portal" title={header[0]} description={header[1]} actions={<Button onClick={requestRenewal}>Request renewal</Button>} /><Card><div className="table-toolbar"><p>Annual renewal fee for {findMembershipCategory(selectedMember?.category).name}: <strong>{formatCurrency(findMembershipCategory(selectedMember?.category).fee)}</strong></p><span className="small-note">Payment is simulated; no funds are collected.</span></div><DataTable columns={renewalColumns} rows={demo.renewals.filter((item) => item.memberId === selectedMember?.id)} /></Card></>; break;
    case "settings": body = <><PageHeader eyebrow="Portal" title={header[0]} description={header[1]} /><Card><h2>Demo preferences</h2><p>Changes to the demo records are saved in this browser.</p><div className="settings-actions"><Button variant="outline" onClick={demo.logout}>Sign out of demo</Button><Button variant="danger" onClick={() => { demo.resetDemo(); navigate("/demo-access"); }}>Reset all demo data</Button></div></Card></>; break;
    case "admin-dashboard": body = <><PageHeader eyebrow="Administration" title={header[0]} description={header[1]} actions={<Link className="btn btn-outline" to="/admin/reports">View reports <ArrowRight size={15} /></Link>} /><div className="stat-grid"><StatCard label="Total members" value={summary.totals.members} icon={Users} /><StatCard label="Active members" value={summary.totals.activeMembers} icon={BadgeCheck} tone="green" /><StatCard label="Applications to review" value={summary.totals.pendingApplications} icon={FileText} tone="gold" /><StatCard label="Paid demo revenue" value={formatCurrency(summary.totals.paid)} icon={CircleDollarSign} /></div><div className="workspace-columns"><Card><div className="card-heading"><h2>Recent applications</h2><Link className="table-link" to="/admin/applications">View all</Link></div><DataTable columns={applicationColumns.slice(0, 5)} rows={demo.applications.slice(0, 4)} /></Card><Card><h2>Membership at a glance</h2><div className="category-bars">{membershipCategories.map((item) => <div key={item.id}><span>{item.name}</span><strong>{summary.categories[item.id] ?? 0}</strong><i style={{ "--bar-width": `${Math.max(3, ((summary.categories[item.id] ?? 0) / Math.max(1, demo.members.length)) * 100)}%` }} /></div>)}</div><Link className="table-link" to="/admin/members">Open members directory <ArrowRight size={15} /></Link></Card></div></>; break;
    case "applications": body = <><PageHeader eyebrow="Membership administration" title={header[0]} description={header[1]} /><Card><div className="table-toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search name, reference, email" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by application status"><option value="all">All statuses</option>{["submitted", "under-review", "approved", "rejected"].map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</select></div><DataTable columns={applicationColumns} rows={applications} /></Card></>; break;
    case "application-review": body = <><PageHeader eyebrow="Application queue" title={header[0]} description={selectedApplication?.reference ?? "The requested application could not be found."} actions={<Link className="btn btn-outline" to="/admin/applications">Back to applications</Link>} />{selectedApplication ? <div className="workspace-columns review-layout"><Card><Badge status={selectedApplication.status} /><h2>{selectedApplication.fullName}</h2><dl className="detail-list detail-grid">{[["Email", selectedApplication.email], ["Phone", selectedApplication.phone], ["Category", findMembershipCategory(selectedApplication.category).name], ["Occupation", selectedApplication.occupation], ["Organization", selectedApplication.organization], ["State", selectedApplication.state], ["Qualification", selectedApplication.highestQualification], ["Submitted", dateCell(selectedApplication.submittedAt)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{selectedApplication.reviewNote && <div className="notice-box">Previous note: {selectedApplication.reviewNote}</div>}</Card><Card><h2>Review decision</h2><FormField label="Committee note (optional)" as="textarea" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} /><div className="review-actions"><Button variant="outline" onClick={() => decideApplication("under-review")}>Mark in review</Button><Button variant="danger" onClick={() => decideApplication("rejected")}><X size={15} /> Reject</Button><Button onClick={() => decideApplication("approved")}><Check size={15} /> Approve & create member</Button></div><p className="small-note">Approval creates or updates one linked member record.</p></Card></div> : <EmptyState title="Application not found" description="Return to the application queue and select a record." />}</>; break;
    case "members": body = <><PageHeader eyebrow="Membership administration" title={header[0]} description={header[1]} actions={<Button variant="outline" onClick={exportCsv}><Download size={16} /> Export CSV</Button>} /><div className="stat-grid stat-grid-compact">{Object.entries(getMemberStats(demo.members)).map(([key, value]) => <StatCard key={key} label={formatStatus(key)} value={value} />)}</div><Card><div className="table-toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search member, number, organization" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter member status"><option value="all">All statuses</option>{["active", "pending-renewal", "suspended"].map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</select></div><DataTable columns={memberColumns} rows={members} /></Card></>; break;
    case "member-details": body = <><PageHeader eyebrow="Member directory" title={header[0]} description={selectedMember?.memberNumber ?? "The requested member could not be found."} actions={<Link className="btn btn-outline" to="/admin/members">Back to directory</Link>} />{selectedMember ? <Card><div className="profile-summary"><div className="profile-avatar">{selectedMember.fullName.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div><div><h2>{selectedMember.fullName}</h2><p>{selectedMember.email}</p><Badge status={selectedMember.status} /></div></div><dl className="detail-list detail-grid">{[["Phone", selectedMember.phone], ["Member number", selectedMember.memberNumber], ["Category", findMembershipCategory(selectedMember.category).name], ["Organization", selectedMember.organization], ["Occupation", selectedMember.occupation], ["Expires", dateCell(selectedMember.expiresAt)]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="settings-actions"><label className="form-label">Membership status <select value={selectedMember.status} onChange={(e) => { demo.updateMember(selectedMember.id, { status: e.target.value }); flash("Member status updated."); }}><option value="active">Active</option><option value="pending-renewal">Pending renewal</option><option value="suspended">Suspended</option></select></label><Button variant="outline" onClick={() => navigate(`/admin/members`)}>Done</Button></div></Card> : <EmptyState title="Member not found" />}</>; break;
    case "admin-renewals": body = <><PageHeader eyebrow="Membership administration" title={header[0]} description={header[1]} /><Card><div className="table-toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search member or reference" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter renewal status"><option value="all">All statuses</option>{["pending-payment", "paid", "approved", "rejected"].map((item) => <option key={item} value={item}>{formatStatus(item)}</option>)}</select></div><DataTable columns={renewalColumns} rows={renewals} /></Card></>; break;
    case "payments": body = <><PageHeader eyebrow="Finance operations" title={header[0]} description={header[1]} actions={<Button onClick={() => setPaymentOpen(true)}>Record demo payment</Button>} /><div className="stat-grid"><StatCard label="Transactions" value={getPaymentTotals(demo.payments).count} icon={WalletCards} /><StatCard label="Paid total" value={formatCurrency(getPaymentTotals(demo.payments).paid)} icon={CircleDollarSign} tone="green" /><StatCard label="Pending total" value={formatCurrency(getPaymentTotals(demo.payments).pending)} icon={CreditCard} tone="gold" /></div><Card><div className="table-toolbar"><SearchBar value={query} onChange={setQuery} placeholder="Search payment reference or purpose" /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter payment status"><option value="all">All statuses</option><option value="paid">Paid</option><option value="pending">Pending</option></select></div><DataTable columns={paymentColumns} rows={payments} /></Card><Modal open={paymentOpen} onClose={() => setPaymentOpen(false)} title="Record simulated payment"><form className="workspace-form" onSubmit={submitPayment}><label className="field-group"><span>Member</span><select value={paymentForm.memberId} onChange={(e) => setPaymentForm({ ...paymentForm, memberId: e.target.value })}>{demo.members.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label><label className="field-group"><span>Related renewal (optional)</span><select value={paymentForm.renewalId} onChange={(e) => { const renewal = demo.renewals.find((item) => item.id === e.target.value); setPaymentForm({ ...paymentForm, renewalId: e.target.value, amount: renewal?.amount ?? paymentForm.amount, memberId: renewal?.memberId ?? paymentForm.memberId }); }}><option value="">No linked renewal</option>{demo.renewals.map((item) => <option key={item.id} value={item.id}>{item.reference} · {item.memberName}</option>)}</select></label><FormField label="Purpose" value={paymentForm.purpose} onChange={(e) => setPaymentForm({ ...paymentForm, purpose: e.target.value })} required /><FormField label="Amount (NGN)" type="number" min="1" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} required /><label className="field-group"><span>Demo status</span><select value={paymentForm.status} onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}><option value="paid">Paid (simulated)</option><option value="pending">Pending</option></select></label><p className="form-disclaimer">No payment gateway is connected and no money is collected.</p><Button type="submit">Save demo transaction</Button></form></Modal></>; break;
    case "reports": body = <><PageHeader eyebrow="Administration" title={header[0]} description={header[1]} actions={<Button variant="outline" onClick={exportCsv}><Download size={16} /> Export member CSV</Button>} /><div className="stat-grid"><StatCard label="Applications" value={summary.totals.applications} icon={FileText} /><StatCard label="Members" value={summary.totals.members} icon={Users} /><StatCard label="Active membership" value={`${summary.totals.members ? Math.round(summary.totals.activeMembers / summary.totals.members * 100) : 0}%`} icon={BadgeCheck} tone="green" /><StatCard label="Paid demo revenue" value={formatCurrency(summary.totals.paid)} icon={CircleDollarSign} tone="gold" /></div><div className="workspace-columns"><Card><h2>Members by category</h2><div className="category-bars">{membershipCategories.map((item) => <div key={item.id}><span>{item.name}</span><strong>{summary.categories[item.id] ?? 0}</strong><i style={{ "--bar-width": `${Math.max(3, ((summary.categories[item.id] ?? 0) / Math.max(1, demo.members.length)) * 100)}%` }} /></div>)}</div></Card><Card><h2>Application decisions</h2><div className="compact-list">{["submitted", "under-review", "approved", "rejected"].map((status) => <div key={status}><span>{formatStatus(status)}</span><strong>{summary.applicationStatuses[status] ?? 0}</strong></div>)}</div><h3 className="subsection-heading">Latest transactions</h3><div className="compact-list">{summary.recentPayments.map((item) => <div key={item.id}><span><strong>{item.purpose}</strong><small>{formatDate(item.paidAt)}</small></span><strong>{formatCurrency(item.amount)}</strong></div>)}</div></Card></div></>; break;
    case "audit-trail": body = <><PageHeader eyebrow="System" title={header[0]} description={header[1]} /><Card><div className="audit-list">{demo.auditTrail.map((item) => <div key={item.id}><span className="audit-dot" /><div><strong>{item.action}</strong><p>{item.detail}</p><small>{item.actor} · {new Date(item.createdAt).toLocaleString("en-NG")}</small></div></div>)}</div></Card></>; break;
    case "admin-settings": body = <><PageHeader eyebrow="System administration" title={header[0]} description={header[1]} /><Card><form className="workspace-form settings-form" onSubmit={(e) => { e.preventDefault(); demo.updateSettings(settingsForm); flash("Demo settings saved."); }}><FormField label="Renewal reminder (days)" type="number" min="1" max="365" value={settingsForm.renewalReminderDays} onChange={(e) => setSettingsForm({ ...settingsForm, renewalReminderDays: Number(e.target.value) })} /><FormField label="Membership year" type="number" min="2020" max="2100" value={settingsForm.membershipYear} onChange={(e) => setSettingsForm({ ...settingsForm, membershipYear: Number(e.target.value) })} /><Button type="submit">Save settings</Button></form><hr /><div className="reset-panel"><div><h2>Restore sample workspace</h2><p>Reset saved changes and return to the original fictional demo records.</p></div><Button variant="danger" onClick={() => { if (window.confirm("Reset all CIoTA demo records in this browser?")) { demo.resetDemo(); navigate("/demo-access"); } }}><RotateCcw size={16} /> Reset demo data</Button></div></Card></>; break;
    default: body = <EmptyState title="Page not found" description="This workspace route is not configured." />;
  }

  return <div className="workspace-page">{notice && <div className="toast-message" role="status">{notice}</div>}{body}{kind === "reports" && <Card className="report-election-summary"><h2>Election and billing summary</h2><div className="compact-list"><div><span>Open elections</span><strong>{summary.totals.openElections}</strong></div><div><span>Aggregate ballots cast</span><strong>{summary.totals.ballotsCast}</strong></div><div><span>Aggregate turnout</span><strong>{summary.totals.turnoutPercent}%</strong></div><div><span>Outstanding charges</span><strong>{formatCurrency(summary.totals.outstanding)}</strong></div></div><div className="compact-list">{summary.elections.map((election) => <div key={election.id}><span>{election.title}<small>{formatStatus(election.status)} · {election.eligibleVoterCount} eligible</small></span><strong>{election.turnoutPercent}% turnout</strong></div>)}</div></Card>}{kind === "admin-dashboard" && <div className="stat-grid"><StatCard label="Open elections" value={summary.totals.openElections} icon={Users} /><StatCard label="Election turnout" value={`${summary.totals.turnoutPercent}%`} icon={FileCheck2} tone="green" /><StatCard label="Outstanding charges" value={formatCurrency(summary.totals.outstanding)} icon={CreditCard} tone="gold" /></div>}</div>;
}
