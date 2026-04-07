import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const heroImage = "/hero-softball.jpg";
const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";
const TOTAL_SPOTS = 8;
const FREE_AGENT_PRICE = 60;
const FREE_AGENT_TEAM_NAME = "Free Agent Team";

const EARLY_BIRD_END = "2026-04-15T23:59:59";
const REGULAR_END = "2026-05-05T23:59:59";
const PAYMENT_DEADLINE = "2026-05-07T23:59:59";

const initialTeamForm = {
teamName: "",
captainName: "",
captainEmail: "",
captainPhone: "",
signature: "",
agreeWaiver: false,
agreeCaptainDuty: false,
agreeElectronic: false,
};

const initialFreeAgentForm = {
playerName: "",
playerEmail: "",
playerPhone: "",
gender: "",
skill: "",
preferredPosition: "",
signature: "",
agreeWaiver: false,
agreeElectronic: false,
};

const initialRosterForm = {
playerName: "",
playerEmail: "",
playerPhone: "",
};

const fullWaiverText = `
DESERT REC SPORTS LEAGUE
WAIVER AND RELEASE OF LIABILITY

PLEASE READ CAREFULLY. THIS DOCUMENT AFFECTS YOUR LEGAL RIGHTS.

1. ASSUMPTION OF RISK
I understand that participation in Desert Rec Sports League activities, including but not limited to softball games, practices, warm-ups, tournaments, league events, and related activities, involves inherent and significant risks. These risks include, but are not limited to, falls, collisions, thrown or batted balls, use of equipment, weather conditions, field conditions, negligent acts of other participants, and serious bodily injury, permanent disability, paralysis, or death. I knowingly and voluntarily assume all risks associated with participation.

2. RELEASE AND WAIVER
In consideration of being allowed to participate in Desert Rec Sports League activities, I, on behalf of myself and my heirs, assigns, personal representatives, and next of kin, hereby release, waive, discharge, and covenant not to sue Desert Rec Sports League, its owners, organizers, officers, staff, contractors, officials, umpires, volunteers, sponsors, partners, advertisers, and any park, field, facility, municipality, or property owner connected with league activities from and against any and all claims, demands, losses, damages, liabilities, costs, or causes of action arising out of or related to any injury, disability, death, or property damage that may occur as a result of participation, to the fullest extent permitted by law.

3. MEDICAL FITNESS
I certify that I am physically and medically able to participate in softball and related activities. I understand that Desert Rec Sports League does not provide medical insurance for participants. I understand it is my responsibility to obtain my own medical clearance, insurance, and treatment if needed.

4. RULES AND CONDUCT
I agree to follow all league rules, facility rules, safety instructions, and directions from league staff and officials. I understand that failure to follow league rules or engaging in unsafe, abusive, or disruptive conduct may result in suspension or removal from league activities without refund.

5. EMERGENCY CARE
I authorize Desert Rec Sports League and its representatives to seek emergency medical treatment for me if necessary, and I accept financial responsibility for any medical care provided.

6. PHOTO AND MEDIA RELEASE
I grant Desert Rec Sports League permission to photograph, record, and use my name, image, likeness, and voice in league-related promotional content, social media, website content, and marketing materials without compensation, unless prohibited by law.

7. CAPTAIN / COACH RESPONSIBILITY ADDENDUM
If I am registering as a team captain or coach, I understand and agree that I have an additional responsibility to ensure that every player who participates for my team has completed, signed, or otherwise validly acknowledged the required player waiver before participating in any game, practice, or league activity. I understand that allowing a player to participate without a completed waiver may result in player ineligibility, team penalties, forfeits, suspension, or removal from the league. I further acknowledge that the captain/coach serves as the team’s primary point of contact and is responsible for communicating league rules, safety expectations, and waiver requirements to all rostered and substitute players.

8. SUBSTITUTE AND ADDITIONAL PLAYER RESPONSIBILITY
I understand that this captain/coach responsibility applies not only to original rostered players but also to substitute, replacement, guest, or late-added players who participate for the team at any point during the season. I understand that any substitute player must also complete and acknowledge the required waiver before taking the field.

9. ACKNOWLEDGMENT OF UNDERSTANDING
I have carefully read this Waiver and Release of Liability, fully understand its contents, and understand that by checking the agreement box and typing my name as an electronic signature, I am giving up substantial legal rights. I acknowledge that my electronic acknowledgment is intended to have the same force and effect as a handwritten signature.

By participating in Desert Rec Sports League activities, I acknowledge and agree to the terms above.
`.trim();

const rulesSections = [
{
title: "1. League Format",
body: [
"Desert Rec Sports League operates as an adult recreational coed slowpitch softball league.",
"Standard format is 10 defensive players on the field.",
"Standard roster target is 7 men and 3 women whenever possible.",
"If one team does not have enough women available, both teams may agree before the game to allow an 8 men / 2 women ratio for that game.",
],
},
{
title: "2. Batting Order",
body: [
"Teams must maintain a 3:1 men-to-women batting ratio throughout the lineup.",
"Batting order should follow a pattern of three male batters and one female batter as consistently as possible.",
"Captains are responsible for maintaining a legal lineup and notifying the umpire of any changes.",
],
},
{
title: "3. Game Length and Run Limits",
body: [
"There is an 8-run limit per inning for all innings unless a final inning is specifically announced by league staff or the umpire before the inning begins.",
"Scores must be reported accurately at the end of each game.",
"Game times, mercy rules, and time-limit enforcement will be controlled by league staff or the umpire on site.",
],
},
{
title: "4. Home Run Rule",
body: [
"Each team is allowed a maximum of 3 out-of-the-park home runs per game.",
"Any additional out-of-the-park home run after a team reaches its cap is an automatic out.",
],
},
{
title: "5. Safety Rules",
body: [
"Safety bases at first base and home plate must be used whenever provided.",
"Any line drive hit up the middle is an automatic out.",
"Umpire judgment controls all safety rulings.",
"All players must use equipment and facilities in a safe manner.",
],
},
{
title: "6. Sportsmanship and Conduct",
body: [
"Unsportsmanlike conduct may result in warnings, outs, ejections, suspensions, or removal.",
"Captains are expected to control their team and communicate professionally.",
"Abusive language, threatening conduct, fighting, or repeated disruption may result in league discipline without refund.",
],
},
{
title: "7. Waivers and Eligibility",
body: [
"Every player must complete the required waiver before participating.",
"Captains are responsible for ensuring all rostered players and substitute players have completed the waiver before taking the field.",
"Use of unwaived or ineligible players may result in forfeits, suspensions, or removal from the league.",
],
},
];

function withTimeout(promise, ms = 15000, message = "Request timed out.") {
return Promise.race([
promise,
new Promise((_, reject) => {
setTimeout(() => reject(new Error(message)), ms);
}),
]);
}

function formatDisplayDate(dateString) {
return new Date(dateString).toLocaleDateString();
}

function getPricingInfo() {
const now = new Date();
const earlyEnd = new Date(EARLY_BIRD_END);
const regularEnd = new Date(REGULAR_END);

if (now <= earlyEnd) {
return {
tier: "early",
label: "Early Bird",
price: 550,
amountCents: 55000,
message: `Early Bird pricing is active through ${formatDisplayDate(EARLY_BIRD_END)}.`,
};
}

if (now <= regularEnd) {
return {
tier: "regular",
label: "Regular",
price: 600,
amountCents: 60000,
message: `Regular pricing is active through ${formatDisplayDate(REGULAR_END)}.`,
};
}

return {
tier: "late",
label: "Late",
price: 650,
amountCents: 65000,
message: "Late pricing is active.",
};
}

function getPaymentDeadlinePassed() {
return new Date() > new Date(PAYMENT_DEADLINE);
}

function getTeamStatus(team) {
if (team.paidStatus === "Paid") return "Paid";
if (getPaymentDeadlinePassed()) return "Locked";
return "Pending";
}

function getFreeAgentStatus(player) {
if (player.paidStatus === "Paid") return "Paid";
if (getPaymentDeadlinePassed()) return "Cut";
return "Pending";
}

function StatusBadge({ status }) {
const styles = {
Paid: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
Pending: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
Locked: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
Cut: { background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" },
Signed: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
Missing: { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" },
};

const style = styles[status] || styles.Pending;

return (
<span
style={{
display: "inline-block",
padding: "6px 10px",
borderRadius: "999px",
fontWeight: 700,
fontSize: "12px",
...style,
}}
>
{status}
</span>
);
}

function mapTeamRow(row) {
return {
id: row.id,
teamName: row.team_name,
captainName: row.captain_name,
captainEmail: row.captain_email,
captainPhone: row.captain_phone || "",
paymentTier: row.payment_tier || "",
paidStatus: row.paid_status || "Pending",
inviteToken: row.invite_token || "",
createdAt: row.created_at,
};
}

function mapFreeAgentRow(row) {
return {
id: row.id,
playerName: row.player_name,
playerEmail: row.player_email,
playerPhone: row.player_phone || "",
gender: row.gender || "",
skill: row.skill || "",
preferredPosition: row.preferred_position || "",
paidStatus: row.paid_status || "Pending",
assignedTeamId: row.assigned_team_id || null,
createdAt: row.created_at,
};
}

function mapTeamPlayerRow(row) {
return {
id: row.id,
teamId: row.team_id,
playerName: row.player_name,
playerEmail: row.player_email || "",
playerPhone: row.player_phone || "",
signedWaiver: !!row.signed_waiver,
signatureName: row.signature_name || "",
signedAt: row.signed_at || "",
};
}

function mapScheduleRow(row) {
return {
id: row.id,
week: row.week,
date: row.game_date || "",
time: row.game_time || "",
field: row.field || "Sundance Park",
status: row.status || "Scheduled",
homeTeamId: row.home_team_id,
awayTeamId: row.away_team_id,
};
}

function rotateRoundRobin(list) {
const arr = [...list];
const fixed = arr[0];
const rest = arr.slice(1);
rest.unshift(rest.pop());
return [fixed, ...rest];
}

function generateRoundRobinSchedule(teamObjects) {
const teams = teamObjects.map((t) => ({ id: t.id, name: t.teamName }));
if (teams.length < 2) return [];

const working = [...teams];
if (working.length % 2 !== 0) working.push({ id: "bye", name: "BYE" });

const rounds = [];
let rotation = [...working];
const totalRounds = rotation.length - 1;

for (let round = 0; round < totalRounds; round += 1) {
for (let i = 0; i < rotation.length / 2; i += 1) {
const home = rotation[i];
const away = rotation[rotation.length - 1 - i];

if (home.id !== "bye" && away.id !== "bye") {
rounds.push({
week: round + 1,
homeTeamId: round % 2 === 0 ? home.id : away.id,
awayTeamId: round % 2 === 0 ? away.id : home.id,
date: "",
time: "",
field: "Sundance Park",
status: "Scheduled",
});
}
}
rotation = rotateRoundRobin(rotation);
}

return rounds;
}

export default function App() {
const [page, setPage] = useState("home");
const [teamForm, setTeamForm] = useState(initialTeamForm);
const [freeAgentForm, setFreeAgentForm] = useState(initialFreeAgentForm);

const [teams, setTeams] = useState([]);
const [freeAgents, setFreeAgents] = useState([]);
const [teamPlayers, setTeamPlayers] = useState([]);
const [schedule, setSchedule] = useState([]);

const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");

const [savingTeam, setSavingTeam] = useState(false);
const [startingCheckout, setStartingCheckout] = useState(false);
const [savingFreeAgent, setSavingFreeAgent] = useState(false);
const [startingFreeAgentCheckout, setStartingFreeAgentCheckout] = useState(false);

const [lookupEmail, setLookupEmail] = useState("");
const [lookupTeamName, setLookupTeamName] = useState("");
const [lookupLoading, setLookupLoading] = useState(false);
const [foundTeam, setFoundTeam] = useState(null);
const [resumeCheckoutLoading, setResumeCheckoutLoading] = useState(false);

const [freeAgentLookupEmail, setFreeAgentLookupEmail] = useState("");
const [freeAgentLookupName, setFreeAgentLookupName] = useState("");
const [freeAgentLookupLoading, setFreeAgentLookupLoading] = useState(false);
const [foundFreeAgent, setFoundFreeAgent] = useState(null);
const [resumeFreeAgentCheckoutLoading, setResumeFreeAgentCheckoutLoading] = useState(false);

const [rosterTeamEmail, setRosterTeamEmail] = useState("");
const [rosterTeamName, setRosterTeamName] = useState("");
const [rosterLookupLoading, setRosterLookupLoading] = useState(false);
const [rosterTeam, setRosterTeam] = useState(null);
const [rosterForm, setRosterForm] = useState(initialRosterForm);
const [addingRosterPlayer, setAddingRosterPlayer] = useState(false);

const [waiverToken, setWaiverToken] = useState("");
const [waiverLookupLoading, setWaiverLookupLoading] = useState(false);
const [waiverTeam, setWaiverTeam] = useState(null);
const [waiverPlayerId, setWaiverPlayerId] = useState("");
const [waiverSignature, setWaiverSignature] = useState("");
const [waiverAgree, setWaiverAgree] = useState(false);
const [waiverSubmitting, setWaiverSubmitting] = useState(false);

const pricing = useMemo(() => getPricingInfo(), []);
const teamSpotsFull = teams.length >= TOTAL_SPOTS;
const spotsLeft = Math.max(TOTAL_SPOTS - teams.length, 0);

async function loadData() {
try {
const [
{ data: teamRows },
{ data: freeAgentRows },
{ data: teamPlayerRows },
{ data: scheduleRows },
] = await Promise.all([
withTimeout(supabase.from("teams").select("*").order("created_at", { ascending: false }), 15000),
withTimeout(supabase.from("free_agents").select("*").order("created_at", { ascending: false }), 15000),
withTimeout(supabase.from("team_players").select("*").order("created_at", { ascending: false }), 15000),
withTimeout(supabase.from("schedule_games").select("*").order("week", { ascending: true }), 15000),
]);

setTeams((teamRows || []).map(mapTeamRow));
setFreeAgents((freeAgentRows || []).map(mapFreeAgentRow));
setTeamPlayers((teamPlayerRows || []).map(mapTeamPlayerRow));
setSchedule((scheduleRows || []).map(mapScheduleRow));
} catch (err) {
console.error("LOAD DATA ERROR:", err);
}
}

useEffect(() => {
let mounted = true;

async function init() {
try {
const { data } = await supabase.auth.getUser();
if (mounted) setUser(data?.user ?? null);
} catch (err) {
console.error("AUTH INIT ERROR:", err);
} finally {
if (mounted) setAuthLoading(false);
}
await loadData();
}

init();

const {
data: { subscription },
} = supabase.auth.onAuthStateChange((_event, session) => {
if (mounted) setUser(session?.user ?? null);
});

return () => {
mounted = false;
subscription.unsubscribe();
};
}, []);

function makeInviteToken() {
return crypto.randomUUID().replace(/-/g, "");
}

function getPlayersForTeam(teamId) {
return teamPlayers.filter((p) => p.teamId === teamId);
}

function getUnsignedCount(teamId) {
return getPlayersForTeam(teamId).filter((p) => !p.signedWaiver).length;
}

async function saveTeamRegistration() {
if (teamSpotsFull) throw new Error("Team registration is full.");
if (!teamForm.teamName.trim()) throw new Error("Enter a team name.");
if (!teamForm.captainName.trim()) throw new Error("Enter a captain name.");
if (!teamForm.captainEmail.trim()) throw new Error("Enter a captain email.");
if (!teamForm.signature.trim()) throw new Error("Type your full legal name as signature.");
if (!teamForm.agreeWaiver) throw new Error("You must agree to the waiver.");
if (!teamForm.agreeCaptainDuty) throw new Error("You must accept captain responsibility.");
if (!teamForm.agreeElectronic) throw new Error("You must accept electronic signature.");

const payload = {
team_name: teamForm.teamName.trim(),
captain_name: teamForm.captainName.trim(),
captain_email: teamForm.captainEmail.trim(),
captain_phone: teamForm.captainPhone.trim(),
payment_tier: pricing.tier,
paid_status: "Pending",
signature_name: teamForm.signature.trim(),
agree_waiver: teamForm.agreeWaiver,
agree_captain_duty: teamForm.agreeCaptainDuty,
agree_electronic: teamForm.agreeElectronic,
invite_token: makeInviteToken(),
};

const { data, error } = await withTimeout(
supabase.from("teams").insert([payload]).select().single(),
15000,
"Saving team registration took too long."
);

if (error) throw new Error(error.message || JSON.stringify(error));

await loadData();
return data;
}

async function saveFreeAgentRegistration() {
if (!freeAgentForm.playerName.trim()) throw new Error("Enter your full name.");
if (!freeAgentForm.playerEmail.trim()) throw new Error("Enter your email.");
if (!freeAgentForm.gender) throw new Error("Select a gender.");
if (!freeAgentForm.signature.trim()) throw new Error("Type your full legal name as signature.");
if (!freeAgentForm.agreeWaiver) throw new Error("You must agree to the waiver.");
if (!freeAgentForm.agreeElectronic) throw new Error("You must accept electronic signature.");

const { data, error } = await withTimeout(
supabase.from("free_agents").insert([{
player_name: freeAgentForm.playerName.trim(),
player_email: freeAgentForm.playerEmail.trim(),
player_phone: freeAgentForm.playerPhone.trim(),
gender: freeAgentForm.gender,
skill: freeAgentForm.skill,
preferred_position: freeAgentForm.preferredPosition.trim(),
paid_status: "Pending",
signature_name: freeAgentForm.signature.trim(),
agree_waiver: freeAgentForm.agreeWaiver,
agree_electronic: freeAgentForm.agreeElectronic,
assigned_team_id: null,
}]).select().single(),
15000
);

if (error) throw new Error(error.message || JSON.stringify(error));

await loadData();
return data;
}

async function handleTeamSaveOnly(e) {
e.preventDefault();
if (savingTeam || startingCheckout) return;
setSavingTeam(true);
try {
await saveTeamRegistration();
setTeamForm(initialTeamForm);
alert("Team registration saved.");
} catch (err) {
alert(err.message || String(err));
} finally {
setSavingTeam(false);
}
}

async function handleTeamCheckout(e) {
e.preventDefault();
if (savingTeam || startingCheckout) return;
setStartingCheckout(true);

try {
const savedTeam = await saveTeamRegistration();
const response = await withTimeout(
fetch("/api/create-team-checkout", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
teamId: savedTeam.id,
teamName: savedTeam.team_name,
captainName: savedTeam.captain_name,
captainEmail: savedTeam.captain_email,
}),
}),
15000
);

const result = await response.json();
if (!response.ok) throw new Error(result.error || "Unable to start Stripe checkout.");
window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setStartingCheckout(false);
}
}

async function handleFreeAgentSubmit(e) {
e.preventDefault();
if (savingFreeAgent || startingFreeAgentCheckout) return;
setSavingFreeAgent(true);

try {
await saveFreeAgentRegistration();
setFreeAgentForm(initialFreeAgentForm);
alert("Free agent registration saved.");
} catch (err) {
alert(err.message || String(err));
} finally {
setSavingFreeAgent(false);
}
}

async function handleFreeAgentCheckout(e) {
e.preventDefault();
if (savingFreeAgent || startingFreeAgentCheckout) return;
setStartingFreeAgentCheckout(true);

try {
const saved = await saveFreeAgentRegistration();
const response = await withTimeout(
fetch("/api/create-free-agent-checkout", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
freeAgentId: saved.id,
playerName: saved.player_name,
playerEmail: saved.player_email,
}),
}),
15000
);

const result = await response.json();
if (!response.ok) throw new Error(result.error || "Unable to start free agent checkout.");
window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setStartingFreeAgentCheckout(false);
}
}

async function handleFindSavedTeam(e) {
e.preventDefault();
try {
if (!lookupEmail.trim()) throw new Error("Enter the captain email used when registering.");

setLookupLoading(true);
setFoundTeam(null);

let query = supabase
.from("teams")
.select("*")
.eq("captain_email", lookupEmail.trim())
.order("created_at", { ascending: false });

if (lookupTeamName.trim()) query = query.ilike("team_name", lookupTeamName.trim());

const { data, error } = await withTimeout(query, 15000);
if (error) throw new Error(error.message || JSON.stringify(error));
if (!data || data.length === 0) throw new Error("No saved team was found with that information.");

setFoundTeam(mapTeamRow(data[0]));
} catch (err) {
alert(err.message || String(err));
} finally {
setLookupLoading(false);
}
}

async function handleResumeTeamCheckout() {
try {
if (!foundTeam) throw new Error("No saved team selected.");
if (foundTeam.paidStatus === "Paid") throw new Error("This team is already marked as paid.");

setResumeCheckoutLoading(true);

const response = await withTimeout(
fetch("/api/create-team-checkout", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
teamId: foundTeam.id,
teamName: foundTeam.teamName,
captainName: foundTeam.captainName,
captainEmail: foundTeam.captainEmail,
}),
}),
15000
);

const result = await response.json();
if (!response.ok) throw new Error(result.error || "Unable to start Stripe checkout.");
window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setResumeCheckoutLoading(false);
}
}

async function handleFindSavedFreeAgent(e) {
e.preventDefault();
try {
if (!freeAgentLookupEmail.trim()) throw new Error("Enter the email used when registering as a free agent.");

setFreeAgentLookupLoading(true);
setFoundFreeAgent(null);

let query = supabase
.from("free_agents")
.select("*")
.eq("player_email", freeAgentLookupEmail.trim())
.order("created_at", { ascending: false });

if (freeAgentLookupName.trim()) query = query.ilike("player_name", freeAgentLookupName.trim());

const { data, error } = await withTimeout(query, 15000);
if (error) throw new Error(error.message || JSON.stringify(error));
if (!data || data.length === 0) throw new Error("No saved free agent registration was found.");

setFoundFreeAgent(mapFreeAgentRow(data[0]));
} catch (err) {
alert(err.message || String(err));
} finally {
setFreeAgentLookupLoading(false);
}
}

async function handleResumeFreeAgentCheckout() {
try {
if (!foundFreeAgent) throw new Error("No saved free agent selected.");
if (foundFreeAgent.paidStatus === "Paid") throw new Error("This free agent is already paid.");

setResumeFreeAgentCheckoutLoading(true);

const response = await withTimeout(
fetch("/api/create-free-agent-checkout", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
freeAgentId: foundFreeAgent.id,
playerName: foundFreeAgent.playerName,
playerEmail: foundFreeAgent.playerEmail,
}),
}),
15000
);

const result = await response.json();
if (!response.ok) throw new Error(result.error || "Unable to start free agent checkout.");
window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setResumeFreeAgentCheckoutLoading(false);
}
}

async function handleFindRosterTeam(e) {
e.preventDefault();

try {
if (!rosterTeamEmail.trim()) throw new Error("Enter captain email.");

setRosterLookupLoading(true);
setRosterTeam(null);

let query = supabase
.from("teams")
.select("*")
.eq("captain_email", rosterTeamEmail.trim())
.order("created_at", { ascending: false });

if (rosterTeamName.trim()) query = query.ilike("team_name", rosterTeamName.trim());

const { data, error } = await withTimeout(query, 15000);
if (error) throw new Error(error.message || JSON.stringify(error));
if (!data || data.length === 0) throw new Error("No team found.");

setRosterTeam(mapTeamRow(data[0]));
} catch (err) {
alert(err.message || String(err));
} finally {
setRosterLookupLoading(false);
}
}

async function handleAddRosterPlayer(e) {
e.preventDefault();

try {
if (!rosterTeam) throw new Error("Find your team first.");
if (!rosterForm.playerName.trim()) throw new Error("Enter player name.");

setAddingRosterPlayer(true);

const { error } = await withTimeout(
supabase.from("team_players").insert([{
team_id: rosterTeam.id,
player_name: rosterForm.playerName.trim(),
player_email: rosterForm.playerEmail.trim(),
player_phone: rosterForm.playerPhone.trim(),
signed_waiver: false,
}]),
15000
);

if (error) throw new Error(error.message || JSON.stringify(error));

setRosterForm(initialRosterForm);
await loadData();
alert("Player added to roster.");
} catch (err) {
alert(err.message || String(err));
} finally {
setAddingRosterPlayer(false);
}
}

async function handleLookupWaiverTeam(e) {
e.preventDefault();

try {
if (!waiverToken.trim()) throw new Error("Enter team waiver token.");
setWaiverLookupLoading(true);
setWaiverTeam(null);

const { data, error } = await withTimeout(
supabase.from("teams").select("*").eq("invite_token", waiverToken.trim()).single(),
15000
);

if (error) throw new Error(error.message || JSON.stringify(error));
setWaiverTeam(mapTeamRow(data));
} catch (err) {
alert(err.message || String(err));
} finally {
setWaiverLookupLoading(false);
}
}

async function handleSubmitPlayerWaiver(e) {
e.preventDefault();

try {
if (!waiverTeam) throw new Error("Find a team first.");
if (!waiverPlayerId) throw new Error("Select your name.");
if (!waiverSignature.trim()) throw new Error("Type your full legal name.");
if (!waiverAgree) throw new Error("You must agree to the waiver.");

setWaiverSubmitting(true);

const { error } = await withTimeout(
supabase
.from("team_players")
.update({
signed_waiver: true,
signature_name: waiverSignature.trim(),
signed_at: new Date().toISOString(),
})
.eq("id", waiverPlayerId),
15000
);

if (error) throw new Error(error.message || JSON.stringify(error));

setWaiverPlayerId("");
setWaiverSignature("");
setWaiverAgree(false);
await loadData();
alert("Waiver signed successfully.");
} catch (err) {
alert(err.message || String(err));
} finally {
setWaiverSubmitting(false);
}
}

async function handleAdminLogin(e) {
e.preventDefault();
try {
if (!loginEmail.trim()) throw new Error("Enter admin email.");
if (!loginPassword.trim()) throw new Error("Enter password.");

const { data, error } = await supabase.auth.signInWithPassword({
email: loginEmail.trim(),
password: loginPassword,
});

if (error) throw new Error(error.message || "Admin sign in failed.");
if (!data?.user) throw new Error("Unable to verify admin user.");
if (data.user.email !== ADMIN_EMAIL) {
await supabase.auth.signOut();
throw new Error("This account is not authorized for admin access.");
}

setUser(data.user);
setLoginEmail("");
setLoginPassword("");
alert("Admin login successful.");
} catch (err) {
alert(err.message || String(err));
}
}

async function handleLogout() {
await supabase.auth.signOut();
}

async function buildSchedule() {
try {
const eligibleTeams = teams.filter((team) => team.paidStatus === "Paid");
if (eligibleTeams.length < 2) throw new Error("You need at least 2 paid teams to generate a schedule.");

const generated = generateRoundRobinSchedule(eligibleTeams);

await withTimeout(
supabase.from("schedule_games").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
15000
);

const rows = generated.map((g) => ({
week: g.week,
home_team_id: g.homeTeamId,
away_team_id: g.awayTeamId,
game_date: g.date,
game_time: g.time,
field: g.field,
status: g.status,
}));

if (rows.length) {
const { error } = await withTimeout(supabase.from("schedule_games").insert(rows), 15000);
if (error) throw new Error(error.message || JSON.stringify(error));
}

await loadData();
alert("Schedule generated using paid teams only.");
} catch (err) {
alert(err.message || String(err));
}
}

async function assignPaidFreeAgentsToTeam() {
try {
const paidUnassigned = freeAgents.filter(
(player) => player.paidStatus === "Paid" && !player.assignedTeamId
);

if (paidUnassigned.length === 0) {
alert("No paid unassigned free agents found.");
return;
}

let freeAgentTeam = teams.find((team) => team.teamName === FREE_AGENT_TEAM_NAME);

if (!freeAgentTeam) {
const { data, error } = await supabase
.from("teams")
.insert([{
team_name: FREE_AGENT_TEAM_NAME,
captain_name: "Desert Rec Sports League",
captain_email: ADMIN_EMAIL,
captain_phone: "",
payment_tier: "admin",
paid_status: "Paid",
signature_name: "Desert Rec Sports League",
agree_waiver: true,
agree_captain_duty: true,
agree_electronic: true,
invite_token: makeInviteToken(),
}])
.select()
.single();

if (error) throw new Error(error.message || JSON.stringify(error));
freeAgentTeam = mapTeamRow(data);
}

const ids = paidUnassigned.map((p) => p.id);

const { error } = await supabase
.from("free_agents")
.update({ assigned_team_id: freeAgentTeam.id })
.in("id", ids);

if (error) throw new Error(error.message || JSON.stringify(error));

await loadData();
alert(`Assigned ${ids.length} paid free agents to ${FREE_AGENT_TEAM_NAME}.`);
} catch (err) {
alert(err.message || String(err));
}
}

function teamNameById(id) {
const team = teams.find((t) => t.id === id);
return team ? team.teamName : "Unassigned";
}

const scheduleWithNames = schedule.map((game) => ({
...game,
homeTeamName: teamNameById(game.homeTeamId),
awayTeamName: teamNameById(game.awayTeamId),
}));

const waiverPlayersForTeam = waiverTeam ? getPlayersForTeam(waiverTeam.id) : [];

return (
<div>
<style>{`
* { box-sizing: border-box; }
body {
margin: 0;
font-family: Inter, Arial, sans-serif;
background: #f4efe9;
color: #1f1a17;
}
.nav {
display: flex;
gap: 10px;
padding: 16px 24px;
background: #111;
flex-wrap: wrap;
}
.nav button {
background: transparent;
border: 1px solid rgba(255,255,255,0.2);
color: white;
padding: 10px 14px;
border-radius: 10px;
cursor: pointer;
}
.page {
max-width: 1180px;
margin: 0 auto;
padding: 32px 20px;
}
.hero {
min-height: 72vh;
color: white;
background:
linear-gradient(rgba(18, 12, 8, 0.60), rgba(18, 12, 8, 0.72)),
url(${heroImage}) center/cover no-repeat;
border-radius: 0 0 24px 24px;
display: grid;
grid-template-columns: 1.2fr 0.9fr;
gap: 28px;
align-items: center;
padding: 48px 32px;
}
.hero h1 {
font-size: clamp(42px, 6vw, 72px);
line-height: 0.98;
margin: 0 0 16px;
color: white;
}
.hero p {
font-size: 18px;
line-height: 1.7;
max-width: 720px;
margin: 0 0 16px;
color: rgba(255,255,255,0.92);
}
.hero-card {
background: rgba(255,255,255,0.12);
border: 1px solid rgba(255,255,255,0.16);
border-radius: 22px;
padding: 24px;
backdrop-filter: blur(6px);
}
.hero-card h3 {
margin: 0 0 16px;
color: white;
font-size: 28px;
}
.hero-list {
display: grid;
gap: 10px;
}
.hero-list-item {
background: rgba(255,255,255,0.10);
border-radius: 12px;
padding: 12px 14px;
color: white;
font-weight: 700;
}
.hero-actions {
display: flex;
gap: 12px;
flex-wrap: wrap;
margin-top: 18px;
}
.card {
background: white;
border-radius: 18px;
padding: 20px;
box-shadow: 0 10px 24px rgba(0,0,0,0.08);
margin-bottom: 20px;
}
.grid2 {
display: grid;
grid-template-columns: 1fr 1fr;
gap: 20px;
}
.grid3 {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 20px;
}
.form {
display: grid;
gap: 12px;
}
input, select, textarea, button {
font: inherit;
}
input, select, textarea {
width: 100%;
padding: 12px 14px;
border-radius: 12px;
border: 1px solid #d6d1c7;
background: white;
color: #1f1a17;
}
textarea {
resize: vertical;
}
button {
padding: 12px 16px;
border-radius: 12px;
border: 1px solid #d6d1c7;
background: white;
color: #1f1a17;
cursor: pointer;
}
.primary {
background: #f59e0b;
border-color: #f59e0b;
color: #111;
font-weight: 700;
}
.row {
display: flex;
gap: 12px;
flex-wrap: wrap;
align-items: center;
}
.pill {
display: inline-block;
background: rgba(255,247,234,0.95);
border: 1px solid #f0dbb8;
border-radius: 999px;
padding: 8px 12px;
font-weight: 700;
margin-right: 8px;
margin-bottom: 8px;
color: #4a3420;
}
.section-title {
margin: 0 0 8px;
font-size: 34px;
}
.section-subtitle {
margin: 0 0 20px;
color: #5e554d;
line-height: 1.7;
}
.waiverPre {
white-space: pre-wrap;
margin: 0;
font-family: inherit;
line-height: 1.7;
}
table {
width: 100%;
border-collapse: collapse;
}
th, td {
text-align: left;
padding: 10px;
border-bottom: 1px solid #ece4d8;
vertical-align: top;
}
ul {
margin: 0;
padding-left: 20px;
}
li {
margin-bottom: 8px;
}
.stat {
font-size: 28px;
font-weight: 800;
margin-top: 8px;
}
@media (max-width: 980px) {
.hero {
grid-template-columns: 1fr;
min-height: auto;
}
.grid2, .grid3 {
grid-template-columns: 1fr;
}
}
`}</style>

<div className="nav">
<button onClick={() => setPage("home")}>Home</button>
<button onClick={() => setPage("register")}>Register</button>
<button onClick={() => setPage("rules")}>Rules</button>
<button onClick={() => setPage("schedule")}>Schedule</button>
<button onClick={() => setPage("waiver")}>Waiver</button>
<button onClick={() => setPage("admin")}>Admin</button>
</div>

{page === "home" && (
<div className="page">
<div className="hero">
<div>
<div className="pill">Thursday Night Coed Softball</div>
<h1>Desert Rec Sports League</h1>
<p>
Join the upcoming Thursday night league at Sundance Park in Buckeye.
An 8-week season, social atmosphere, competitive games, and a fun
adult rec environment built for the West Valley.
</p>
<p>Register your team now and lock in current pricing before the next tier goes into effect.</p>

{getPaymentDeadlinePassed() && (
<p style={{ color: "#fecaca", fontWeight: 700 }}>
Payment deadline has passed. Unpaid teams are locked and unpaid free agents may be cut.
</p>
)}

<div>
<span className="pill">{pricing.label} Pricing: ${pricing.price}</span>
<span className="pill">{pricing.message}</span>
<span className="pill">{spotsLeft} team spots left</span>
<span className="pill">Free Agents: ${FREE_AGENT_PRICE}</span>
<span className="pill">
Payment deadline: {new Date(PAYMENT_DEADLINE).toLocaleDateString()}
</span>
</div>

<div className="hero-actions">
<button className="primary" onClick={() => setPage("register")}>Register Now</button>
<button onClick={() => setPage("rules")}>View Rules</button>
</div>
</div>

<div className="hero-card">
<h3>Upcoming Season</h3>
<div className="hero-list">
<div className="hero-list-item">Location: Sundance Park</div>
<div className="hero-list-item">City: Buckeye, Arizona</div>
<div className="hero-list-item">League Night: Thursday</div>
<div className="hero-list-item">Season Length: 8 Weeks</div>
<div className="hero-list-item">Format: Coed Slowpitch</div>
<div className="hero-list-item">Roster Target: 7 Men / 3 Women</div>
<div className="hero-list-item">3:1 Men-to-Women Batting Ratio</div>
</div>
</div>
</div>
</div>
)}

{page === "register" && (
<div className="page">
<h2 className="section-title">Register</h2>
<p className="section-subtitle">
Secure your spot for the Thursday night coed league at Sundance Park.
</p>

<div className="card">
<strong>{pricing.label} team price: ${pricing.price}</strong>
<div>{pricing.message}</div>
<div>Free agent registration: ${FREE_AGENT_PRICE}</div>
{teamSpotsFull && (
<div style={{ marginTop: 8, fontWeight: 700, color: "#991b1b" }}>
Team registration is closed. All 8 spots are filled.
</div>
)}
</div>

<div className="card">
<h3>Already saved your team?</h3>
<p className="section-subtitle" style={{ marginBottom: 12 }}>
Enter the captain email used during registration to find your saved team and complete payment later.
</p>

<form noValidate onSubmit={handleFindSavedTeam} className="form">
<input value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} placeholder="Captain Email" />
<input value={lookupTeamName} onChange={(e) => setLookupTeamName(e.target.value)} placeholder="Team Name (optional)" />
<div className="row">
<button type="submit" className="primary" disabled={lookupLoading}>
{lookupLoading ? "Finding Team..." : "Find My Team"}
</button>
</div>
</form>

{foundTeam && (
<div style={{ marginTop: 16, padding: 16, border: "1px solid #ece4d8", borderRadius: 14, background: "#faf7f2" }}>
<div><strong>Team:</strong> {foundTeam.teamName}</div>
<div><strong>Captain:</strong> {foundTeam.captainName}</div>
<div><strong>Email:</strong> {foundTeam.captainEmail}</div>
<div style={{ marginTop: 8 }}><strong>Status:</strong> <StatusBadge status={getTeamStatus(foundTeam)} /></div>
<div style={{ marginTop: 8 }}><strong>Current Amount Due:</strong> ${pricing.price}</div>
<div className="row" style={{ marginTop: 14 }}>
<button type="button" className="primary" disabled={resumeCheckoutLoading || foundTeam.paidStatus === "Paid"} onClick={handleResumeTeamCheckout}>
{resumeCheckoutLoading ? "Starting Checkout..." : `Pay $${pricing.price} Now`}
</button>
</div>
</div>
)}
</div>

<div className="card">
<h3>Already saved as a free agent?</h3>
<p className="section-subtitle" style={{ marginBottom: 12 }}>
Enter the email used during registration to find your saved free agent registration and complete payment later.
</p>

<form noValidate onSubmit={handleFindSavedFreeAgent} className="form">
<input value={freeAgentLookupEmail} onChange={(e) => setFreeAgentLookupEmail(e.target.value)} placeholder="Free Agent Email" />
<input value={freeAgentLookupName} onChange={(e) => setFreeAgentLookupName(e.target.value)} placeholder="Full Name (optional)" />
<div className="row">
<button type="submit" className="primary" disabled={freeAgentLookupLoading}>
{freeAgentLookupLoading ? "Finding Registration..." : "Find My Free Agent Registration"}
</button>
</div>
</form>

{foundFreeAgent && (
<div style={{ marginTop: 16, padding: 16, border: "1px solid #ece4d8", borderRadius: 14, background: "#faf7f2" }}>
<div><strong>Name:</strong> {foundFreeAgent.playerName}</div>
<div><strong>Email:</strong> {foundFreeAgent.playerEmail}</div>
<div><strong>Gender:</strong> {foundFreeAgent.gender || "Not provided"}</div>
<div><strong>Skill:</strong> {foundFreeAgent.skill || "Not provided"}</div>
<div style={{ marginTop: 8 }}><strong>Status:</strong> <StatusBadge status={getFreeAgentStatus(foundFreeAgent)} /></div>
<div style={{ marginTop: 8 }}><strong>Amount Due:</strong> ${FREE_AGENT_PRICE}</div>
<div className="row" style={{ marginTop: 14 }}>
<button type="button" className="primary" disabled={resumeFreeAgentCheckoutLoading || foundFreeAgent.paidStatus === "Paid"} onClick={handleResumeFreeAgentCheckout}>
{resumeFreeAgentCheckoutLoading ? "Starting Checkout..." : `Pay $${FREE_AGENT_PRICE} Now`}
</button>
</div>
</div>
)}
</div>

<div className="card">
<h3>Captain Roster & Waivers</h3>
<p className="section-subtitle" style={{ marginBottom: 12 }}>
Captains can find their team, add players to the roster, and send players the waiver token.
</p>

<form noValidate onSubmit={handleFindRosterTeam} className="form">
<input value={rosterTeamEmail} onChange={(e) => setRosterTeamEmail(e.target.value)} placeholder="Captain Email" />
<input value={rosterTeamName} onChange={(e) => setRosterTeamName(e.target.value)} placeholder="Team Name (optional)" />
<div className="row">
<button type="submit" className="primary" disabled={rosterLookupLoading}>
{rosterLookupLoading ? "Finding Team..." : "Find Team Roster"}
</button>
</div>
</form>

{rosterTeam && (
<div style={{ marginTop: 16 }}>
<div style={{ marginBottom: 12 }}>
<strong>Team:</strong> {rosterTeam.teamName}
</div>
<div style={{ marginBottom: 12 }}>
<strong>Team Waiver Token:</strong> {rosterTeam.inviteToken}
</div>
<div style={{ marginBottom: 12 }}>
<strong>Unsigned Players:</strong> {getUnsignedCount(rosterTeam.id)}
</div>

<form noValidate onSubmit={handleAddRosterPlayer} className="form">
<input value={rosterForm.playerName} onChange={(e) => setRosterForm((p) => ({ ...p, playerName: e.target.value }))} placeholder="Player Name" />
<input value={rosterForm.playerEmail} onChange={(e) => setRosterForm((p) => ({ ...p, playerEmail: e.target.value }))} placeholder="Player Email" />
<input value={rosterForm.playerPhone} onChange={(e) => setRosterForm((p) => ({ ...p, playerPhone: e.target.value }))} placeholder="Player Phone" />
<div className="row">
<button type="submit" className="primary" disabled={addingRosterPlayer}>
{addingRosterPlayer ? "Adding..." : "Add Player To Roster"}
</button>
</div>
</form>

<div className="card" style={{ marginTop: 16 }}>
<h4>Roster</h4>
<table>
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Waiver</th>
</tr>
</thead>
<tbody>
{getPlayersForTeam(rosterTeam.id).length === 0 ? (
<tr>
<td colSpan="3">No players added yet.</td>
</tr>
) : (
getPlayersForTeam(rosterTeam.id).map((player) => (
<tr key={player.id}>
<td>{player.playerName}</td>
<td>{player.playerEmail || "—"}</td>
<td>
<StatusBadge status={player.signedWaiver ? "Signed" : "Missing"} />
</td>
</tr>
))
)}
</tbody>
</table>
</div>
</div>
)}
</div>

<div className="card">
<h3>Player Waiver Sign-Off</h3>
<p className="section-subtitle" style={{ marginBottom: 12 }}>
Players can use the team waiver token from their captain to find their team and sign.
</p>

<form noValidate onSubmit={handleLookupWaiverTeam} className="form">
<input value={waiverToken} onChange={(e) => setWaiverToken(e.target.value)} placeholder="Team Waiver Token" />
<div className="row">
<button type="submit" className="primary" disabled={waiverLookupLoading}>
{waiverLookupLoading ? "Finding Team..." : "Find My Team"}
</button>
</div>
</form>

{waiverTeam && (
<form noValidate onSubmit={handleSubmitPlayerWaiver} className="form" style={{ marginTop: 16 }}>
<div><strong>Team:</strong> {waiverTeam.teamName}</div>
<select value={waiverPlayerId} onChange={(e) => setWaiverPlayerId(e.target.value)}>
<option value="">Select Your Name</option>
{waiverPlayersForTeam.map((player) => (
<option key={player.id} value={player.id}>
{player.playerName} {player.signedWaiver ? "(Already Signed)" : ""}
</option>
))}
</select>
<textarea readOnly value={fullWaiverText} rows={10} />
<input value={waiverSignature} onChange={(e) => setWaiverSignature(e.target.value)} placeholder="Type Full Legal Name as Signature" />
<label>
<input type="checkbox" checked={waiverAgree} onChange={(e) => setWaiverAgree(e.target.checked)} /> I agree to the waiver
</label>
<div className="row">
<button type="submit" className="primary" disabled={waiverSubmitting}>
{waiverSubmitting ? "Submitting..." : "Sign Player Waiver"}
</button>
</div>
</form>
)}
</div>

<div className="grid2">
<div className="card">
<h3>Team Registration</h3>
<form noValidate onSubmit={handleTeamSaveOnly} className="form">
<input value={teamForm.teamName} onChange={(e) => setTeamForm((p) => ({ ...p, teamName: e.target.value }))} placeholder="Team Name" />
<input value={teamForm.captainName} onChange={(e) => setTeamForm((p) => ({ ...p, captainName: e.target.value }))} placeholder="Captain / Coach Name" />
<input value={teamForm.captainEmail} onChange={(e) => setTeamForm((p) => ({ ...p, captainEmail: e.target.value }))} placeholder="Captain Email" />
<input value={teamForm.captainPhone} onChange={(e) => setTeamForm((p) => ({ ...p, captainPhone: e.target.value }))} placeholder="Captain Phone" />
<textarea readOnly value={fullWaiverText} rows={10} />
<input value={teamForm.signature} onChange={(e) => setTeamForm((p) => ({ ...p, signature: e.target.value }))} placeholder="Type Full Legal Name as Signature" />
<label><input type="checkbox" checked={teamForm.agreeWaiver} onChange={(e) => setTeamForm((p) => ({ ...p, agreeWaiver: e.target.checked }))} /> I agree to the waiver</label>
<label><input type="checkbox" checked={teamForm.agreeCaptainDuty} onChange={(e) => setTeamForm((p) => ({ ...p, agreeCaptainDuty: e.target.checked }))} /> I accept captain responsibility</label>
<label><input type="checkbox" checked={teamForm.agreeElectronic} onChange={(e) => setTeamForm((p) => ({ ...p, agreeElectronic: e.target.checked }))} /> I accept electronic signature</label>

<div className="row">
<button type="submit" className="primary" disabled={savingTeam || startingCheckout || teamSpotsFull}>
{savingTeam ? "Saving..." : teamSpotsFull ? "Team Registration Full" : "Save Team Registration"}
</button>
<button type="button" className="primary" disabled={savingTeam || startingCheckout || teamSpotsFull} onClick={handleTeamCheckout}>
{startingCheckout ? "Starting Checkout..." : `Pay $${pricing.price} with Stripe`}
</button>
</div>
</form>
</div>

<div className="card">
<h3>Free Agent Registration</h3>
<form noValidate onSubmit={handleFreeAgentSubmit} className="form">
<input value={freeAgentForm.playerName} onChange={(e) => setFreeAgentForm((p) => ({ ...p, playerName: e.target.value }))} placeholder="Full Name" />
<input value={freeAgentForm.playerEmail} onChange={(e) => setFreeAgentForm((p) => ({ ...p, playerEmail: e.target.value }))} placeholder="Email" />
<input value={freeAgentForm.playerPhone} onChange={(e) => setFreeAgentForm((p) => ({ ...p, playerPhone: e.target.value }))} placeholder="Phone" />
<select value={freeAgentForm.gender} onChange={(e) => setFreeAgentForm((p) => ({ ...p, gender: e.target.value }))}>
<option value="">Select Gender</option>
<option value="Male">Male</option>
<option value="Female">Female</option>
</select>
<select value={freeAgentForm.skill} onChange={(e) => setFreeAgentForm((p) => ({ ...p, skill: e.target.value }))}>
<option value="">Skill Level</option>
<option value="Beginner">Beginner</option>
<option value="Intermediate">Intermediate</option>
<option value="Competitive">Competitive</option>
</select>
<input value={freeAgentForm.preferredPosition} onChange={(e) => setFreeAgentForm((p) => ({ ...p, preferredPosition: e.target.value }))} placeholder="Preferred Position" />
<textarea readOnly value={fullWaiverText} rows={10} />
<input value={freeAgentForm.signature} onChange={(e) => setFreeAgentForm((p) => ({ ...p, signature: e.target.value }))} placeholder="Type Full Legal Name as Signature" />
<label><input type="checkbox" checked={freeAgentForm.agreeWaiver} onChange={(e) => setFreeAgentForm((p) => ({ ...p, agreeWaiver: e.target.checked }))} /> I agree to the waiver</label>
<label><input type="checkbox" checked={freeAgentForm.agreeElectronic} onChange={(e) => setFreeAgentForm((p) => ({ ...p, agreeElectronic: e.target.checked }))} /> I accept electronic signature</label>

<div className="row">
<button type="submit" className="primary" disabled={savingFreeAgent || startingFreeAgentCheckout}>
{savingFreeAgent ? "Saving..." : "Save Free Agent Registration"}
</button>
<button type="button" className="primary" disabled={savingFreeAgent || startingFreeAgentCheckout} onClick={handleFreeAgentCheckout}>
{startingFreeAgentCheckout ? "Starting Checkout..." : `Pay $${FREE_AGENT_PRICE} with Stripe`}
</button>
</div>
</form>
</div>
</div>
</div>
)}

{page === "rules" && (
<div className="page">
<h2 className="section-title">League Rules</h2>
<div className="grid2">
{rulesSections.map((section) => (
<div className="card" key={section.title}>
<h3>{section.title}</h3>
<ul>
{section.body.map((item, idx) => <li key={idx}>{item}</li>)}
</ul>
</div>
))}
</div>
</div>
)}

{page === "schedule" && (
<div className="page">
<h2 className="section-title">Schedule</h2>
<div className="card">
{scheduleWithNames.length === 0 ? (
<p>No schedule created yet.</p>
) : (
<table>
<thead>
<tr>
<th>Week</th>
<th>Matchup</th>
<th>Date</th>
<th>Time</th>
<th>Field</th>
</tr>
</thead>
<tbody>
{scheduleWithNames.map((game) => (
<tr key={game.id}>
<td>{game.week}</td>
<td>{game.awayTeamName} at {game.homeTeamName}</td>
<td>{game.date || "TBD"}</td>
<td>{game.time || "TBD"}</td>
<td>{game.field}</td>
</tr>
))}
</tbody>
</table>
)}
</div>
</div>
)}

{page === "waiver" && (
<div className="page">
<h2 className="section-title">Waiver</h2>
<div className="card">
<pre className="waiverPre">{fullWaiverText}</pre>
</div>
</div>
)}

{page === "admin" && (
<div className="page">
{authLoading ? (
<div className="card">Loading admin login...</div>
) : !user || user.email !== ADMIN_EMAIL ? (
<div className="card" style={{ maxWidth: 520 }}>
<h2>Admin Login</h2>
<form noValidate onSubmit={handleAdminLogin} className="form">
<input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Admin email" />
<input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" />
<button type="submit" className="primary">Sign In</button>
</form>
</div>
) : (
<>
<div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
<h2 className="section-title" style={{ margin: 0 }}>Admin Dashboard</h2>
<button onClick={handleLogout}>Sign Out</button>
</div>

<div className="grid3">
<div className="card">
<div>Registered Teams</div>
<div className="stat">{teams.length}</div>
</div>
<div className="card">
<div>Free Agents</div>
<div className="stat">{freeAgents.length}</div>
</div>
<div className="card">
<div>Open Team Spots</div>
<div className="stat">{spotsLeft}</div>
</div>
</div>

<div className="card">
<div className="row">
<button className="primary" onClick={buildSchedule}>Generate Round Robin</button>
<button className="primary" onClick={assignPaidFreeAgentsToTeam}>Assign Paid Free Agents</button>
</div>
</div>

<div className="card">
<h3>Teams</h3>
<table>
<thead>
<tr>
<th>Team</th>
<th>Captain</th>
<th>Email</th>
<th>Tier</th>
<th>Status</th>
<th>Unsigned Waivers</th>
</tr>
</thead>
<tbody>
{teams.map((team) => (
<tr key={team.id}>
<td>{team.teamName}</td>
<td>{team.captainName}</td>
<td>{team.captainEmail}</td>
<td>{team.paymentTier}</td>
<td><StatusBadge status={getTeamStatus(team)} /></td>
<td>{getUnsignedCount(team.id)}</td>
</tr>
))}
</tbody>
</table>
</div>

<div className="card">
<h3>Free Agents</h3>
<table>
<thead>
<tr>
<th>Name</th>
<th>Email</th>
<th>Gender</th>
<th>Skill</th>
<th>Assigned Team</th>
<th>Status</th>
</tr>
</thead>
<tbody>
{freeAgents.map((player) => (
<tr key={player.id}>
<td>{player.playerName}</td>
<td>{player.playerEmail}</td>
<td>{player.gender}</td>
<td>{player.skill}</td>
<td>{player.assignedTeamId ? teamNameById(player.assignedTeamId) : "Unassigned"}</td>
<td><StatusBadge status={getFreeAgentStatus(player)} /></td>
</tr>
))}
</tbody>
</table>
</div>

<div className="card">
<h3>Roster Players</h3>
<table>
<thead>
<tr>
<th>Team</th>
<th>Name</th>
<th>Email</th>
<th>Waiver</th>
</tr>
</thead>
<tbody>
{teamPlayers.map((player) => (
<tr key={player.id}>
<td>{teamNameById(player.teamId)}</td>
<td>{player.playerName}</td>
<td>{player.playerEmail || "—"}</td>
<td><StatusBadge status={player.signedWaiver ? "Signed" : "Missing"} /></td>
</tr>
))}
</tbody>
</table>
</div>
</>
)}
</div>
)}
</div>
);
} 