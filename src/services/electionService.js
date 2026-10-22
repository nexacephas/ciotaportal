import { electionDefaults } from "../data/membershipConfig";
import { makeId } from "../utils/referenceGenerator";

const activeDuesStatuses = new Set(["paid"]);

export function getElectionStatus(election, now = new Date()) {
  if (!election) return "missing";
  if (election.status === "archived") return "archived";
  const opensAt = new Date(election.opensAt).getTime();
  const closesAt = new Date(election.closesAt).getTime();
  if (!Number.isFinite(opensAt) || !Number.isFinite(closesAt)) return "invalid";
  if (election.status === "closed" || now.getTime() >= closesAt) return "closed";
  if (now.getTime() < opensAt) return "upcoming";
  return "open";
}

export function checkVoterEligibility(data, election, user, now = new Date()) {
  const reasons = [];
  if (!user || !["member", "applicant"].includes(user.role)) reasons.push("Sign in to an eligible demo workspace to vote.");
  const member = user?.memberId
    ? data.members.find((item) => item.id === user.memberId)
    : data.members.find((item) => item.email === user?.email);
  const applicant = !member && user?.email ? data.applications.find((item) => item.email === user.email) : null;
  if (election?.eligibility?.membershipRequired !== false && !member) reasons.push("A linked member record is required.");
  if (!member && election?.eligibility?.activeOnly !== false) reasons.push("Active membership is required by this election.");
  if (member && election?.eligibility?.activeOnly !== false && (member.status !== "active" || new Date(member.expiresAt).getTime() < now.getTime())) {
    reasons.push("Your membership must be active and within its validity period.");
  }
  if (!member && election?.eligibility?.paidDuesRequired !== false) reasons.push("Paid applicable membership dues are required by this election.");
  if (member && election?.eligibility?.paidDuesRequired !== false) {
    const applicableTypes = new Set(["application", "membership", "renewal"]);
    const hasPaidDues = (data.charges ?? []).some((charge) => charge.memberId === member.id && applicableTypes.has(charge.type) && activeDuesStatuses.has(charge.status))
      || data.payments.some((payment) => payment.memberId === member.id && payment.status === "paid" && (applicableTypes.has(payment.type) || (!payment.type && /membership|renewal|admission/i.test(payment.purpose ?? ""))));
    if (!hasPaidDues) reasons.push("A paid applicable membership due is required.");
  }
  const status = getElectionStatus(election, now);
  if (status !== "open") reasons.push(status === "upcoming" ? "Voting has not opened yet." : status === "closed" ? "Voting has closed." : "This election is unavailable.");
  const voterId = member?.id ?? applicant?.id ?? (user?.email ? `applicant:${user.email.toLowerCase()}` : null);
  const alreadyVoted = Boolean(voterId && data.voterParticipation.some((record) => record.electionId === election?.id && record.voterId === voterId));
  if (alreadyVoted) reasons.push("A ballot has already been recorded for this member in this election.");
  return { eligible: reasons.length === 0, reasons, member, voterId, alreadyVoted, status };
}

export function castElectionBallot(data, electionId, user, candidateId, now = new Date()) {
  const election = data.elections.find((item) => item.id === electionId);
  if (!election) return { error: "Election not found." };
  const eligibility = checkVoterEligibility(data, election, user, now);
  if (!eligibility.eligible) return { error: eligibility.reasons[0], eligibility };
  if (!election.candidates.some((candidate) => candidate.id === candidateId)) return { error: "Choose a valid candidate." };

  // Secret-ballot choices are stored separately from voter participation; there is no voter-to-choice key.
  const participation = { id: makeId("participation"), electionId, voterId: eligibility.voterId, recordedAt: now.toISOString() };
  const ballot = { id: makeId("ballot"), electionId, candidateId };
  const ballots = [...data.ballots];
  ballots.splice(Math.floor(Math.random() * (ballots.length + 1)), 0, ballot);
  return { data: { ...data, voterParticipation: [...data.voterParticipation, participation], ballots }, participation, confirmation: `Your ballot for ${election.title} has been recorded.` };
}

export function getElectionResults(data, electionId) {
  const election = data.elections.find((item) => item.id === electionId);
  if (!election) return { error: "Election not found." };
  if (!election.resultsPublicationAllowed || !election.resultsPublished || !["closed", "archived"].includes(getElectionStatus(election))) {
    return { error: "Results have not been published for this election." };
  }
  const ballots = data.ballots.filter((item) => item.electionId === electionId);
  return { totalVotes: ballots.length, candidates: election.candidates.map((candidate) => ({ ...candidate, votes: ballots.filter((ballot) => ballot.candidateId === candidate.id).length })) };
}

export function getElectionAdminSummary(data, election) {
  const eligibilityData = { ...data, voterParticipation: [] };
  const electionForEligibility = { ...election, opensAt: new Date(0).toISOString(), closesAt: new Date(8640000000000000).toISOString(), status: "open" };
  const memberVoters = data.members.map((member) => ({ role: "member", memberId: member.id, email: member.email }));
  const extraApplicants = election.eligibility?.membershipRequired === false
    ? data.applications.filter((application) => !data.members.some((member) => member.email === application.email)).map((application) => ({ role: "applicant", email: application.email }))
    : [];
  const eligibleVoterCount = [...memberVoters, ...extraApplicants].filter((user) => checkVoterEligibility(eligibilityData, electionForEligibility, user).eligible).length;
  const ballotsCast = data.voterParticipation.filter((record) => record.electionId === election.id).length;
  return { eligibleVoterCount, ballotsCast, turnoutPercent: eligibleVoterCount ? Math.round(ballotsCast / eligibleVoterCount * 100) : 0 };
}

function validateElection(values) {
  if (!values.title?.trim() || !values.description?.trim()) return "Election title and description are required.";
  if (!Number.isFinite(new Date(values.opensAt).getTime()) || !Number.isFinite(new Date(values.closesAt).getTime()) || new Date(values.closesAt) <= new Date(values.opensAt)) return "Choose a closing time after the opening time.";
  if (!Array.isArray(values.candidates) || values.candidates.length < 2 || values.candidates.some((candidate) => !candidate.name?.trim())) return "Add at least two candidates with names.";
  return "";
}

export function saveElection(data, values, electionId = null) {
  const error = validateElection(values);
  if (error) return { error };
  const current = electionId ? data.elections.find((item) => item.id === electionId) : null;
  if (electionId && !current) return { error: "Election not found." };
  if (current && data.ballots.some((ballot) => ballot.electionId === electionId)) return { error: "Election details cannot be edited after ballots have been cast." };
  const election = {
    ...(current ?? { status: "scheduled", resultsPublished: false }),
    ...values,
    id: current?.id ?? makeId("election"),
    title: values.title.trim(),
    description: values.description.trim(),
    candidates: values.candidates.map((candidate) => ({ ...candidate, id: candidate.id || makeId("candidate"), name: candidate.name.trim() })),
    eligibility: { ...electionDefaults.eligibility, ...values.eligibility },
  };
  return { election, data: { ...data, elections: current ? data.elections.map((item) => item.id === election.id ? election : item) : [election, ...data.elections] } };
}

export function administerElection(data, electionId, action, now = new Date()) {
  const election = data.elections.find((item) => item.id === electionId);
  if (!election) return { error: "Election not found." };
  let updated;
  if (action === "open") {
    if (election.status === "archived" || election.status === "closed" || now.getTime() >= new Date(election.closesAt).getTime()) return { error: "This election cannot be opened because it is closed or past its closing time." };
    updated = { ...election, opensAt: now.getTime() < new Date(election.opensAt).getTime() ? now.toISOString() : election.opensAt, status: "open" };
  } else if (action === "close") {
    updated = { ...election, status: "closed" };
  } else if (action === "archive") {
    if (getElectionStatus(election, now) === "open") return { error: "Close voting before archiving this election." };
    updated = { ...election, status: "archived" };
  } else if (action === "publish") {
    if (!election.resultsPublicationAllowed) return { error: "Results publication is disabled for this election." };
    if (getElectionStatus(election, now) !== "closed") return { error: "Close the election before publishing results." };
    updated = { ...election, resultsPublished: true };
  } else return { error: "Choose a valid election action." };
  return { election: updated, data: { ...data, elections: data.elections.map((item) => item.id === electionId ? updated : item) } };
}
