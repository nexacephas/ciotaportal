import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, LockKeyhole, Vote } from "lucide-react";
import { useDemo } from "../../../hooks/useDemo";
import { checkVoterEligibility, getElectionResults, getElectionStatus } from "../../../services/electionService";
import Badge from "../../../components/Badge/Badge";
import Button from "../../../components/Button/Button";
import Card from "../../../components/Card/Card";
import EmptyState from "../../../components/EmptyState/EmptyState";
import PageHeader from "../../../components/PageHeader/PageHeader";
import "./ElectionDetails.css";

export default function ElectionDetails() {
  const { electionId } = useParams();
  const demo = useDemo();
  const basePath = demo.role === "applicant" ? "/applicant" : "/member";
  const [candidateId, setCandidateId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const election = demo.elections.find((item) => item.id === electionId);
  if (!election) return <EmptyState title="Election not found" description="Return to the elections list to choose an available election." action={<Link className="btn btn-primary" to={`${basePath}/elections`}>Elections</Link>} />;
  const member = demo.members.find((item) => item.email === demo.demoUser?.email);
  const eligibility = checkVoterEligibility(demo.data, election, { role: demo.role, email: demo.demoUser?.email, memberId: member?.id });
  const status = getElectionStatus(election);
  const results = getElectionResults(demo.data, election.id);
  const submitVote = (event) => {
    event.preventDefault(); setError(""); setNotice("");
    if (!candidateId) { setError("Choose a candidate before submitting your ballot."); return; }
    setSubmitting(true);
    const result = demo.castVote(election.id, candidateId);
    if (result.error) setError(result.error); else { setNotice("Your ballot has been recorded. Your selection is not shown in your member record."); setCandidateId(""); }
    setSubmitting(false);
  };
  return <main className="election-page">
    <PageHeader eyebrow="Member election" title={election.title} description={election.description} actions={<Link className="btn btn-outline" to={`${basePath}/elections`}>All elections</Link>} />
    <div className="election-details-grid">
      <Card className="election-info"><div className="election-card-top"><Badge status={status}>{status}</Badge><span>{new Date(election.opensAt).toLocaleString("en-NG")} – {new Date(election.closesAt).toLocaleString("en-NG")}</span></div><h2>Voting rules</h2><p>{election.rules}</p><h2>Eligibility</h2><ul>{election.eligibility.membershipRequired && <li>Linked approved membership record</li>}{election.eligibility.activeOnly && <li>Active membership within its validity period</li>}{election.eligibility.paidDuesRequired && <li>Paid applicable membership dues</li>}</ul><div className={`eligibility-message ${eligibility.eligible ? "is-eligible" : "is-ineligible"}`} role="status">{eligibility.eligible ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}<div><strong>{eligibility.eligible ? "Eligible to vote" : eligibility.alreadyVoted ? "Ballot already recorded" : "Not eligible to vote"}</strong>{eligibility.reasons.map((reason) => <p key={reason}>{reason}</p>)}{eligibility.eligible && <p>One ballot per member. Your voter record is stored separately from the selected option.</p>}</div></div></Card>
      <Card><h2>Candidates</h2><div className="candidate-list">{election.candidates.map((candidate) => <article key={candidate.id} className="candidate-card"><span className="candidate-avatar" aria-hidden="true">{candidate.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><h3>{candidate.name}</h3><p>{candidate.biography}</p><strong>Platform</strong><p>{candidate.platform}</p></div></article>)}</div></Card>
      {eligibility.eligible && <Card><form onSubmit={submitVote} className="ballot-form"><h2><Vote size={19} /> Cast your ballot</h2><p>Select one candidate. Your selection cannot be changed after submission.</p><fieldset><legend>Choose one candidate</legend>{election.candidates.map((candidate) => <label className="ballot-option" key={candidate.id}><input type="radio" name="candidate" value={candidate.id} checked={candidateId === candidate.id} onChange={(event) => setCandidateId(event.target.value)} /><span>{candidate.name}</span></label>)}</fieldset>{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-success" role="status"><CheckCircle2 size={17} /> {notice}</p>}<Button type="submit" disabled={submitting}>{submitting ? "Recording ballot…" : "Submit secret ballot"}</Button><p className="small-note"><LockKeyhole size={14} /> Demo-only ballot. This browser-only prototype cannot provide tamper-resistant or cryptographic anonymity.</p></form></Card>}
      {!eligibility.eligible && eligibility.alreadyVoted && <Card><div className="form-success"><CheckCircle2 size={18} /> Your participation is recorded for this election.</div></Card>}
      {results.candidates && <Card className="election-results"><h2>Published results</h2><p>{results.totalVotes} ballots counted</p>{results.candidates.map((candidate) => <div className="result-row" key={candidate.id}><span>{candidate.name}</span><strong>{candidate.votes} votes</strong></div>)}</Card>}
      {!results.candidates && status === "closed" && election.resultsPublicationAllowed && <p className="small-note">Results have not yet been published.</p>}
    </div>
  </main>;
}
