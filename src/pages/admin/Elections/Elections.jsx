import { useState } from "react";
import { CalendarClock, Plus, Save, Users } from "lucide-react";
import { useDemo } from "../../../hooks/useDemo";
import { checkVoterEligibility, getElectionAdminSummary, getElectionResults, getElectionStatus } from "../../../services/electionService";
import { formatDate } from "../../../utils/formatters";
import Badge from "../../../components/Badge/Badge";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import EmptyState from "../../../components/EmptyState/EmptyState";
import FormField from "../../../components/FormField/FormField";
import PageHeader from "../../../components/PageHeader/PageHeader";
import "./Elections.css";

const futureDate = (days) => { const date = new Date(Date.now() + days * 86400000); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); };
const blankForm = () => ({ title: "", description: "", opensAt: futureDate(1), closesAt: futureDate(8), rules: "One ballot per eligible member. Ballots are secret.", eligibility: { membershipRequired: true, activeOnly: true, paidDuesRequired: true }, secretBallot: true, resultsPublicationAllowed: true, candidatesText: "Candidate One | Candidate biography | Candidate platform\nCandidate Two | Candidate biography | Candidate platform" });
const toLocalDate = (value) => { const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 16); };

export default function AdminElections() {
  const demo = useDemo();
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const reset = () => { setEditingId(null); setForm(blankForm()); setError(""); };
  const edit = (election) => {
    setEditingId(election.id); setError(""); setNotice("");
    setForm({ ...election, opensAt: toLocalDate(election.opensAt), closesAt: toLocalDate(election.closesAt), candidatesText: election.candidates.map((candidate) => `${candidate.name} | ${candidate.biography} | ${candidate.platform}`).join("\n") });
    document.getElementById("election-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const save = (event) => {
    event.preventDefault(); setError(""); setNotice(""); setBusy(true);
    const candidates = form.candidatesText.split("\n").map((line, index) => {
      const [name = "", biography = "", platform = ""] = line.split("|").map((part) => part.trim());
      const existing = editingId ? demo.elections.find((item) => item.id === editingId)?.candidates[index] : null;
      return { id: existing?.id, name, biography, platform };
    }).filter((candidate) => candidate.name);
    const values = { ...form };
    delete values.candidatesText;
    const result = demo.saveElection({ ...values, opensAt: new Date(form.opensAt).toISOString(), closesAt: new Date(form.closesAt).toISOString(), candidates }, editingId);
    if (result.error) setError(result.error); else { setNotice(editingId ? "Election settings updated." : "Election scheduled."); reset(); }
    setBusy(false);
  };
  const act = (election, action) => {
    setError(""); setNotice("");
    const result = demo.administerElection(election.id, action);
    if (result.error) setError(result.error); else setNotice(`${election.title}: ${action} completed.`);
  };
  return <main className="admin-election-page">
    <PageHeader eyebrow="Governance operations" title="Election management" description="Schedule elections, manage candidate options and eligibility, and monitor aggregate participation. Ballot choices are never shown here." actions={<Button variant="outline" onClick={() => { reset(); document.getElementById("election-editor")?.scrollIntoView({ behavior: "smooth" }); }}><Plus size={16} /> Create election</Button>} />
    {error && <p className="election-admin-error" role="alert">{error}</p>}{notice && <p className="election-admin-success" role="status">{notice}</p>}
    <div className="admin-election-list">{demo.elections.length ? demo.elections.map((election) => {
      const status = getElectionStatus(election); const summary = getElectionAdminSummary(demo.data, election); const results = getElectionResults(demo.data, election.id); const hasVotes = summary.ballotsCast > 0;
      const eligibilityElection = { ...election, status: "open", opensAt: new Date(0).toISOString(), closesAt: new Date(8640000000000000).toISOString() };
      const eligibilityData = { ...demo.data, voterParticipation: [] };
      return <Card key={election.id} className="admin-election-card"><div className="admin-election-top"><Badge status={status}>{status}</Badge><span><CalendarClock size={15} /> {formatDate(election.opensAt)} – {formatDate(election.closesAt)}</span></div><h2>{election.title}</h2><p>{election.description}</p><div className="turnout-summary"><span><Users size={16} /> Eligible members <strong>{summary.eligibleVoterCount}</strong></span><span>Ballots cast <strong>{summary.ballotsCast}</strong></span><span>Turnout <strong>{summary.turnoutPercent}%</strong></span></div><details className="eligibility-review"><summary>Review member eligibility</summary><ul>{demo.members.map((member) => { const result = checkVoterEligibility(eligibilityData, eligibilityElection, { role: "member", memberId: member.id }); return <li key={member.id}><span>{member.fullName} · {member.memberNumber}</span><strong className={result.eligible ? "eligibility-yes" : "eligibility-no"}>{result.eligible ? "Eligible" : result.reasons[0]}</strong></li>; })}</ul></details>{results.candidates && <div className="election-admin-results"><h3>Published results</h3>{results.candidates.map((candidate) => <div key={candidate.id}><span>{candidate.name}</span><strong>{candidate.votes} votes</strong></div>)}</div>}<div className="admin-election-actions">{!hasVotes && status !== "archived" && <Button size="sm" variant="outline" onClick={() => edit(election)}>Edit settings</Button>}{status === "open" && <Button size="sm" variant="outline" onClick={() => act(election, "close")}>Close voting</Button>}{status === "open" && <Button size="sm" variant="outline" onClick={() => act(election, "archive")}>Archive</Button>}{status === "upcoming" && <Button size="sm" onClick={() => act(election, "open")}>Open voting</Button>}{status === "upcoming" && <Button size="sm" variant="outline" onClick={() => act(election, "archive")}>Archive</Button>}{status === "closed" && election.resultsPublicationAllowed && !election.resultsPublished && <Button size="sm" onClick={() => act(election, "publish")}>Publish results</Button>}{status === "closed" && <Button size="sm" variant="outline" onClick={() => act(election, "archive")}>Archive</Button>}{election.resultsPublished && <Badge status="approved">Results published</Badge>}</div></Card>;
    }) : <EmptyState title="No elections yet" description="Create an election to add a voting window and candidate options." />}</div>
    <Card className="election-editor-card" id="election-editor"><div className="election-editor-heading"><div><span className="eyebrow">Election configuration</span><h2>{editingId ? "Edit election" : "Schedule an election"}</h2></div>{editingId && <Button variant="outline" onClick={reset}>Cancel edit</Button>}</div>
      <form className="election-editor-form" onSubmit={save}>
        <div className="form-grid"><FormField label="Election title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><FormField label="Description" as="textarea" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><FormField label="Opens" type="datetime-local" required value={form.opensAt} onChange={(e) => setForm({ ...form, opensAt: e.target.value })} /><FormField label="Closes" type="datetime-local" required value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} /><FormField label="Voting rules" as="textarea" required value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} /><FormField label="Candidates (one per line: name | biography | platform)" as="textarea" required value={form.candidatesText} onChange={(e) => setForm({ ...form, candidatesText: e.target.value })} /></div>
        <fieldset className="election-settings"><legend>Eligibility and publication</legend>{[["membershipRequired", "Require a linked membership record"], ["activeOnly", "Require active, unexpired membership"], ["paidDuesRequired", "Require paid applicable dues"]].map(([key, label]) => <label key={key}><input type="checkbox" checked={form.eligibility[key]} onChange={(e) => setForm({ ...form, eligibility: { ...form.eligibility, [key]: e.target.checked } })} /> {label}</label>)}<label><input type="checkbox" checked={form.secretBallot} onChange={(e) => setForm({ ...form, secretBallot: e.target.checked })} /> Keep ballot choices separate from participation records</label><label><input type="checkbox" checked={form.resultsPublicationAllowed} onChange={(e) => setForm({ ...form, resultsPublicationAllowed: e.target.checked })} /> Allow results to be published after closing</label></fieldset>
        {error && <p className="election-admin-error" role="alert">{error}</p>}<div className="election-save-note">Demo-only election data in browser storage is editable by the browser owner. It does not provide secure or tamper-resistant voting.</div><Button type="submit" disabled={busy}><Save size={16} /> {busy ? "Saving…" : editingId ? "Save election changes" : "Schedule election"}</Button>
      </form>
    </Card>
  </main>;
}
