import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const heroImage = "/hero-softball.jpg";
const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";
const TOTAL_SPOTS = 8;
const FREE_AGENT_PRICE = 60;

const EARLY_BIRD_END = "2026-04-15T23:59:59";
const REGULAR_END = "2026-05-05T23:59:59";

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
I understand that this captain/coach responsibility applies not only to original rostered players but also to substitute, replacement, guest, or late-added players who participate for the team at any point during the season.

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
"Standard roster format is 7 men and 3 women whenever possible.",
"If one team does not have enough women available, both teams may agree before the game to allow an 8 men / 2 women ratio for that game.",
],
},
{
title: "2. Batting Order",
body: [
"Teams must maintain a 3:1 men-to-women batting ratio throughout the lineup.",
"Batting order should follow a pattern of three male batters and one female batter as consistently as possible.",
],
},
{
title: "3. Game Length and Run Limits",
body: [
"There is an 8-run limit per inning for all innings unless a final inning is specifically announced by league staff or the umpire before the inning begins.",
"Scores must be reported accurately at the end of each game.",
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
],
},
{
title: "6. Sportsmanship",
body: [
"Unsportsmanlike conduct may result in warnings, outs, ejections, suspensions, or removal.",
"Captains are expected to control their team and communicate professionally.",
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
message: "Early Bird pricing is active.",
};
}

if (now <= regularEnd) {
return {
tier: "regular",
label: "Regular",
price: 600,
amountCents: 60000,
message: "Regular pricing is active.",
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

function mapTeamRow(row) {
return {
id: row.id,
teamName: row.team_name,
captainName: row.captain_name,
captainEmail: row.captain_email,
captainPhone: row.captain_phone || "",
paymentTier: row.payment_tier || "",
paidStatus: row.paid_status || "Pending",
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
createdAt: row.created_at,
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
homeScore: row.home_score ?? "",
awayScore: row.away_score ?? "",
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
if (working.length % 2 !== 0) {
working.push({ id: "bye", name: "BYE" });
}

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
const [schedule, setSchedule] = useState([]);

const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");

const [savingTeam, setSavingTeam] = useState(false);
const [startingCheckout, setStartingCheckout] = useState(false);
const [savingFreeAgent, setSavingFreeAgent] = useState(false);
const [startingFreeAgentCheckout, setStartingFreeAgentCheckout] = useState(false);

const pricing = useMemo(() => getPricingInfo(), []);
const spotsLeft = Math.max(TOTAL_SPOTS - teams.length, 0);

async function loadData() {
try {
const [{ data: teamRows }, { data: freeAgentRows }, { data: scheduleRows }] =
await Promise.all([
withTimeout(
supabase.from("teams").select("*").order("created_at", { ascending: false }),
15000,
"Loading teams took too long."
),
withTimeout(
supabase.from("free_agents").select("*").order("created_at", { ascending: false }),
15000,
"Loading free agents took too long."
),
withTimeout(
supabase.from("schedule_games").select("*").order("week", { ascending: true }),
15000,
"Loading schedule took too long."
),
]);

setTeams((teamRows || []).map(mapTeamRow));
setFreeAgents((freeAgentRows || []).map(mapFreeAgentRow));
setSchedule((scheduleRows || []).map(mapScheduleRow));
} catch (err) {
console.error("LOAD DATA ERROR:", err);
}
}

useEffect(() => {
let mounted = true;

async function init() {
try {
const { data } = await withTimeout(
supabase.auth.getUser(),
15000,
"Checking admin session took too long."
);
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
} = supabase.auth.onAuthStateChange(async () => {
try {
const { data } = await supabase.auth.getUser();
if (mounted) setUser(data?.user ?? null);
} catch (err) {
console.error("AUTH STATE ERROR:", err);
}
});

const timeout = setTimeout(() => {
if (mounted) setAuthLoading(false);
}, 5000);

return () => {
mounted = false;
clearTimeout(timeout);
subscription.unsubscribe();
};
}, []);

async function saveTeamRegistration() {
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

const payload = {
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
};

const { data, error } = await withTimeout(
supabase.from("free_agents").insert([payload]).select().single(),
15000,
"Saving free agent registration took too long."
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
15000,
"Stripe checkout request took too long."
);

const text = await response.text();
let result = {};

try {
result = JSON.parse(text);
} catch {
throw new Error(`Checkout API returned non-JSON response: ${text.slice(0, 120)}`);
}

if (!response.ok) {
throw new Error(result.error || "Unable to start Stripe checkout.");
}

if (!result.url) {
throw new Error("Stripe checkout URL was not returned.");
}

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
const savedFreeAgent = await saveFreeAgentRegistration();

const response = await withTimeout(
fetch("/api/create-free-agent-checkout", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
freeAgentId: savedFreeAgent.id,
playerName: savedFreeAgent.player_name,
playerEmail: savedFreeAgent.player_email,
}),
}),
15000,
"Free agent Stripe checkout request took too long."
);

const text = await response.text();
let result = {};

try {
result = JSON.parse(text);
} catch {
throw new Error(`Free agent checkout API returned non-JSON response: ${text.slice(0, 120)}`);
}

if (!response.ok) {
throw new Error(result.error || "Unable to start free agent Stripe checkout.");
}

if (!result.url) {
throw new Error("Free agent Stripe checkout URL was not returned.");
}

window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setStartingFreeAgentCheckout(false);
}
}

async function handleAdminLogin(e) {
e.preventDefault();

try {
if (!loginEmail.trim()) throw new Error("Enter admin email.");
if (!loginPassword.trim()) throw new Error("Enter password.");

const { error } = await withTimeout(
supabase.auth.signInWithPassword({
email: loginEmail.trim(),
password: loginPassword,
}),
15000,
"Admin sign in took too long."
);

if (error) throw new Error(error.message || JSON.stringify(error));

const { data } = await withTimeout(
supabase.auth.getUser(),
15000,
"Verifying admin access took too long."
);

if (!data?.user) throw new Error("Unable to verify admin user.");

if (data.user.email !== ADMIN_EMAIL) {
await supabase.auth.signOut();
throw new Error("This account is not authorized for admin access.");
}

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
const generated = generateRoundRobinSchedule(teams);

await withTimeout(
supabase.from("schedule_games").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
15000,
"Clearing old schedule took too long."
);

if (generated.length > 0) {
const rows = generated.map((g) => ({
week: g.week,
home_team_id: g.homeTeamId,
away_team_id: g.awayTeamId,
game_date: g.date,
game_time: g.time,
field: g.field,
status: g.status,
home_score: null,
away_score: null,
}));

const { error } = await withTimeout(
supabase.from("schedule_games").insert(rows),
15000,
"Saving schedule took too long."
);

if (error) throw new Error(error.message || JSON.stringify(error));
}

await loadData();
alert("Schedule generated.");
} catch (err) {
alert(err.message || String(err));
}
}

function teamNameById(id) {
const team = teams.find((t) => t.id === id);
return team ? team.teamName : "TBD";
}

const scheduleWithNames = schedule.map((game) => ({
...game,
homeTeamName: teamNameById(game.homeTeamId),
awayTeamName: teamNameById(game.awayTeamId),
}));

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
<p>
Register your team now and lock in current pricing before the next
tier goes into effect.
</p>

<div>
<span className="pill">{pricing.label} Pricing: ${pricing.price}</span>
<span className="pill">{pricing.message}</span>
<span className="pill">{spotsLeft} team spots left</span>
<span className="pill">Free Agents: ${FREE_AGENT_PRICE}</span>
</div>

<div className="hero-actions">
<button className="primary" onClick={() => setPage("register")}>
Register Now
</button>
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
<div className="hero-list-item">3 Home Run Cap Per Team</div>
<div className="hero-list-item">8-Run Limit Per Inning</div>
<div className="hero-list-item">Championship Trophy + MVP Recognition</div>
</div>
</div>
</div>

<div style={{ marginTop: 28 }} className="grid3">
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
</div>

<div className="grid2">
<div className="card">
<h3>Team Registration</h3>
<form noValidate onSubmit={handleTeamSaveOnly} className="form">
<input value={teamForm.teamName} onChange={(e) => setTeamForm((p) => ({ ...p, teamName: e.target.value }))} placeholder="Team Name" />
<input value={teamForm.captainName} onChange={(e) => setTeamForm((p) => ({ ...p, captainName: e.target.value }))} placeholder="Captain / Coach Name" />
<input value={teamForm.captainEmail} onChange={(e) => setTeamForm((p) => ({ ...p, captainEmail: e.target.value }))} placeholder="Captain Email" />
<input value={teamForm.captainPhone} onChange={(e) => setTeamForm((p) => ({ ...p, captainPhone: e.target.value }))} placeholder="Captain Phone" />
<textarea readOnly value={fullWaiverText} rows={12} />
<input value={teamForm.signature} onChange={(e) => setTeamForm((p) => ({ ...p, signature: e.target.value }))} placeholder="Type Full Legal Name as Signature" />
<label><input type="checkbox" checked={teamForm.agreeWaiver} onChange={(e) => setTeamForm((p) => ({ ...p, agreeWaiver: e.target.checked }))} /> I agree to the waiver</label>
<label><input type="checkbox" checked={teamForm.agreeCaptainDuty} onChange={(e) => setTeamForm((p) => ({ ...p, agreeCaptainDuty: e.target.checked }))} /> I accept captain responsibility</label>
<label><input type="checkbox" checked={teamForm.agreeElectronic} onChange={(e) => setTeamForm((p) => ({ ...p, agreeElectronic: e.target.checked }))} /> I accept electronic signature</label>

<div className="row">
<button type="submit" className="primary" disabled={savingTeam || startingCheckout}>
{savingTeam ? "Saving..." : "Save Team Registration"}
</button>
<button type="button" className="primary" disabled={savingTeam || startingCheckout} onClick={handleTeamCheckout}>
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
<textarea readOnly value={fullWaiverText} rows={12} />
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
<p className="section-subtitle">Official playing rules for the Thursday night coed league.</p>
<div className="grid2">
{rulesSections.map((section) => (
<div className="card" key={section.title}>
<h3>{section.title}</h3>
<ul>
{section.body.map((item, idx) => (
<li key={idx}>{item}</li>
))}
</ul>
</div>
))}
</div>
</div>
)}

{page === "schedule" && (
<div className="page">
<h2 className="section-title">Schedule</h2>
<p className="section-subtitle">Weekly matchups will appear here after the admin generates the season schedule.</p>
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
<th>Paid</th>
</tr>
</thead>
<tbody>
{teams.map((team) => (
<tr key={team.id}>
<td>{team.teamName}</td>
<td>{team.captainName}</td>
<td>{team.captainEmail}</td>
<td>{team.paymentTier}</td>
<td>{team.paidStatus}</td>
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
<th>Paid</th>
</tr>
</thead>
<tbody>
{freeAgents.map((player) => (
<tr key={player.id}>
<td>{player.playerName}</td>
<td>{player.playerEmail}</td>
<td>{player.gender}</td>
<td>{player.skill}</td>
<td>{player.paidStatus}</td>
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