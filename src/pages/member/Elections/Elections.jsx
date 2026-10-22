import { Link } from "react-router-dom";
import { CalendarDays, Vote } from "lucide-react";
import { useDemo } from "../../../hooks/useDemo";
import { getElectionStatus } from "../../../services/electionService";
import Badge from "../../../components/Badge/Badge";
import Card from "../../../components/Card/Card";
import EmptyState from "../../../components/EmptyState/EmptyState";
import PageHeader from "../../../components/PageHeader/PageHeader";
import "./Elections.css";

export default function Elections() {
  const demo = useDemo();
  const basePath = demo.role === "applicant" ? "/applicant" : "/member";
  const elections = [...demo.elections].sort((a, b) => new Date(a.opensAt) - new Date(b.opensAt));
  return <main className="election-page">
    <PageHeader eyebrow="Member participation" title="Elections" description="Review current and upcoming CIoTA elections. Each eligible member can cast one secret demo ballot." />
    <div className="election-list">
      {elections.length ? elections.map((election) => {
        const status = getElectionStatus(election);
        return <Card key={election.id} className="election-card">
          <div className="election-card-top"><Badge status={status}>{status}</Badge><span><CalendarDays size={16} /> {new Date(election.opensAt).toLocaleDateString("en-NG")} – {new Date(election.closesAt).toLocaleDateString("en-NG")}</span></div>
          <h2>{election.title}</h2><p>{election.description}</p>
          <div className="election-card-foot"><span>{election.candidates.length} candidates <span aria-hidden="true">·</span> {election.secretBallot ? "Secret ballot" : "Recorded ballot"}</span><Link className="btn btn-outline" to={`${basePath}/elections/${election.id}`}>{status === "open" ? <><Vote size={16} /> View and vote</> : "View details"}</Link></div>
        </Card>;
      }) : <EmptyState title="No elections scheduled" description="Check back later for CIoTA member elections." />}
    </div>
    <p className="election-demo-note">Demo voting is stored in this browser. It is not an official election system.</p>
  </main>;
}
