import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const logo = "/desert-rec-logo.png";
const heroImage = "/hero-softball.jpg";
const TOTAL_SPOTS = 8;
const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";

const TEAM_PAYMENT_LINKS = {
early: "REPLACE_550_LINK",
regular: "REPLACE_600_LINK",
late: "REPLACE_650_LINK",
};

const FREE_AGENT_PAYMENT_LINK = "REPLACE_60_LINK";

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

const captainWaiverSummary =
"As team captain/coach, you acknowledge the risks of participation, agree to the league waiver, and accept responsibility for ensuring that every player who participates for your team has completed and acknowledged the required player waiver before taking the field.";

const playerWaiverSummary =
"By participating, you acknowledge that softball involves inherent risks, confirm you are voluntarily participating, and agree to the league waiver and release of liability.";

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
"Desert Rec Sports League operates as an adult recreational coed slowpitch softball league focused on organized play, sportsmanship, and a competitive but social atmosphere.",
"The standard format is 10 defensive players on the field.",
"The standard roster format is 7 men and 3 women on defense and in the lineup whenever possible.",
"If one team does not have enough women available, both teams may agree before the game to allow an 8 men / 2 women ratio for that game. If both teams do not agree, the standard coed format remains in effect.",
"League staff reserve the right to make game-day rulings to keep games moving and protect player safety.",
],
},
{
title: "2. Batting Order",
body: [
"Teams must maintain a 3:1 men-to-women batting ratio throughout the lineup.",
"This means the batting order should follow a pattern of three male batters and one female batter, repeated as consistently as the available lineup allows.",
"If a team is using the approved 8 men / 2 women exception for a game, the lineup should still maintain the most balanced coed order possible and should be communicated to the umpire before the game begins.",
"Any batting order changes must be reported before the affected player bats.",
],
},
{
title: "3. Game Length and Run Limits",
body: [
"Games are played under the scheduled league time limit or inning format established by Desert Rec Sports League.",
"There is an 8-run limit per inning for all innings unless a final inning is specifically announced by league staff or the umpire before the inning begins.",
"No team may score more than 8 runs in a standard inning, even if the inning continues.",
"Scores must be reported accurately at the end of each game.",
],
},
{
title: "4. Home Run Rule",
body: [
"Each team is allowed a maximum of 3 out-of-the-park home runs per game.",
"Any additional out-of-the-park home run hit after a team reaches its 3-home-run cap is ruled an automatic out.",
"Inside-the-park home runs do not count toward the out-of-the-park home run cap.",
"League staff may make field-specific adjustments if a park condition creates an obvious safety issue.",
],
},
{
title: "5. Safety Base and Home Plate Safety Rule",
body: [
"Safety bases at first base and home plate must be used whenever provided on the field.",
"At first base, the runner must use the safety base on close plays unless a turn toward fair territory is necessary after safely reaching the bag.",
"At home plate, runners must use the designated safety scoring plate or line if one is in play.",
"If a required safety base or safety plate is not used on a force or close play when it should have been used, the runner is out.",
"Umpire judgment controls all safety base rulings.",
],
},
{
title: "6. Pitching and Middle Safety Rule",
body: [
"Pitchers must be given a reasonable opportunity to protect themselves after the ball is released.",
"Any line drive hit up the middle is an automatic out.",
"For league purposes, 'up the middle' means a sharply hit ball judged by the umpire to be directly at or immediately through the pitcher’s protected middle area.",
"No runner advancement is awarded on an up-the-middle automatic out unless forced by rule.",
"This rule is in place strictly for player safety.",
],
},
{
title: "7. Defensive and Offensive Play",
body: [
"Standard softball force plays, tag plays, and live-ball rules apply unless modified by these league rules.",
"Teams are expected to play under control and avoid reckless contact.",
"Malicious contact, unnecessary collisions, and unsportsmanlike conduct may result in outs, ejections, or further discipline.",
"Runners should slide or avoid contact when a defensive player is making a legitimate play on the ball.",
],
},
{
title: "8. Substitutes and Lineups",
body: [
"Substitutes are allowed during the season, subject to league eligibility requirements and waiver completion.",
"All substitute, replacement, or guest players must complete or validly acknowledge the league waiver before participating.",
"Captains are responsible for ensuring every player who appears in a game has completed the required waiver.",
"League staff may restrict clearly abusive substitute practices or ineligible player use.",
],
},
{
title: "9. Sportsmanship and Conduct",
body: [
"Desert Rec Sports League is built around competitive but respectful adult recreation.",
"Arguing, threatening conduct, abusive language, taunting, fighting, or repeated unsportsmanlike behavior may result in warnings, outs, ejections, suspensions, or team removal.",
"Umpire and league staff decisions must be respected.",
"Captains are expected to help control their team and communicate with league staff professionally.",
],
},
{
title: "10. Final Authority",
body: [
"Desert Rec Sports League reserves the right to interpret, apply, and enforce these rules in the best interest of safety, fairness, and league operations.",
"League staff may issue clarifications or updates during the season if needed.",
"By participating, players and captains agree to abide by all posted league rules and league decisions.",
],
},
];

function getCurrentPricingTier() {
const now = new Date();
const earlyBirdEnd = new Date(EARLY_BIRD_END);
const regularEnd = new Date(REGULAR_END);

if (now <= earlyBirdEnd) return "early";
if (now <= regularEnd) return "regular";
return "late";
}

function getCurrentTeamPriceInfo() {
const tier = getCurrentPricingTier();

if (tier === "early") {
return {
tier: "early",
label: "Early Bird",
price: 550,
link: TEAM_PAYMENT_LINKS.early,
message: "Early Bird pricing is currently active.",
};
}

if (tier === "regular") {
return {
tier: "regular",
label: "Regular",
price: 600,
link: TEAM_PAYMENT_LINKS.regular,
message: "Regular pricing is currently active.",
};
}

return {
tier: "late",
label: "Late",
price: 650,
link: TEAM_PAYMENT_LINKS.late,
message: "Late pricing is currently active.",
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
const teams = teamObjects.map((t) => ({
id: t.id,
name: t.teamName,
}));

if (teams.length < 2) return [];

const working = [...teams];
if (working.length % 2 !== 0) {
working.push({ id: "bye", name: "BYE" });
}

const rounds = [];
let rotation = [...working];
const totalRounds = rotation.length - 1;

for (let round = 0; round < totalRounds; round += 1) {
const weekGames = [];

for (let i = 0; i < rotation.length / 2; i += 1) {
const home = rotation[i];
const away = rotation[rotation.length - 1 - i];

if (home.id !== "bye" && away.id !== "bye") {
weekGames.push({
week: round + 1,
homeTeamId: round % 2 === 0 ? home.id : away.id,
homeTeamName: round % 2 === 0 ? home.name : away.name,
awayTeamId: round % 2 === 0 ? away.id : home.id,
awayTeamName: round % 2 === 0 ? away.name : home.name,
date: "",
time: "",
field: "Sundance Park",
status: "Scheduled",
homeScore: "",
awayScore: "",
});
}
}

rounds.push(...weekGames);
rotation = rotateRoundRobin(rotation);
}

return rounds;
}

function mapTeamRow(row) {
return {
id: row.id,
teamName: row.team_name,
captainName: row.captain_name,
captainEmail: row.captain_email,
captainPhone: row.captain_phone || "",
paymentTier: row.payment_tier,
signature: row.signature_name,
agreeWaiver: row.agree_waiver,
agreeCaptainDuty: row.agree_captain_duty,
agreeElectronic: row.agree_electronic,
createdAt: row.created_at,
paidStatus: row.paid_status || "Pending",
};
}

function mapFreeAgentRow(row, teamsLookup) {
return {
id: row.id,
playerName: row.player_name,
playerEmail: row.player_email,
playerPhone: row.player_phone || "",
gender: row.gender || "",
skill: row.skill || "",
preferredPosition: row.preferred_position || "",
signature: row.signature_name,
agreeWaiver: row.agree_waiver,
agreeElectronic: row.agree_electronic,
assignedTeamId: row.assigned_team_id || "",
assignedTeamName: row.assigned_team_id
? teamsLookup[row.assigned_team_id]?.teamName || ""
: "",
createdAt: row.created_at,
paidStatus: row.paid_status || "Pending",
};
}

function mapScheduleRow(row, teamsLookup) {
return {
id: row.id,
week: row.week,
homeTeamId: row.home_team_id,
awayTeamId: row.away_team_id,
homeTeamName: teamsLookup[row.home_team_id]?.teamName || "TBD",
awayTeamName: teamsLookup[row.away_team_id]?.teamName || "TBD",
date: row.game_date || "",
time: row.game_time || "",
field: row.field || "Sundance Park",
status: row.status || "Scheduled",
homeScore: row.home_score ?? "",
awayScore: row.away_score ?? "",
};
}

export default function App() {
const [page, setPage] = useState("home");
const [menuOpen, setMenuOpen] = useState(false);

const [teams, setTeams] = useState([]);
const [freeAgents, setFreeAgents] = useState([]);
const [schedule, setSchedule] = useState([]);
const [loading, setLoading] = useState(true);

const [teamForm, setTeamForm] = useState(initialTeamForm);
const [freeAgentForm, setFreeAgentForm] = useState(initialFreeAgentForm);

const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);
const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");

const activePricing = getCurrentTeamPriceInfo();

async function loadData() {
setLoading(true);

try {
const [
{ data: teamRows, error: teamsError },
{ data: freeAgentRows, error: freeAgentsError },
{ data: scheduleRows, error: scheduleError },
] = await Promise.all([
supabase.from("teams").select("*").order("created_at", { ascending: true }),
supabase.from("free_agents").select("*").order("created_at", { ascending: true }),
supabase.from("schedule_games").select("*").order("week", { ascending: true }),
]);

if (teamsError) console.error("LOAD TEAMS ERROR:", teamsError);
if (freeAgentsError) console.error("LOAD FREE AGENTS ERROR:", freeAgentsError);
if (scheduleError) console.error("LOAD SCHEDULE ERROR:", scheduleError);

const mappedTeams = (teamRows || []).map(mapTeamRow);
const teamsLookup = {};
mappedTeams.forEach((team) => {
teamsLookup[team.id] = team;
});

const mappedFreeAgents = (freeAgentRows || []).map((row) =>
mapFreeAgentRow(row, teamsLookup)
);

const mappedSchedule = (scheduleRows || []).map((row) =>
mapScheduleRow(row, teamsLookup)
);

setTeams(mappedTeams);
setFreeAgents(mappedFreeAgents);
setSchedule(mappedSchedule);
} catch (err) {
console.error("LOAD DATA FETCH FAILURE:", err);
} finally {
setLoading(false);
}
}

useEffect(() => {
let mounted = true;

async function initApp() {
try {
const { data, error } = await supabase.auth.getUser();

if (error) {
console.error("INIT AUTH ERROR:", error);
}

if (mounted) {
setUser(data?.user ?? null);
}
} catch (err) {
console.error("INIT AUTH FETCH ERROR:", err);
if (mounted) {
setUser(null);
}
} finally {
if (mounted) {
setAuthLoading(false);
}
}

try {
await loadData();
} catch (err) {
console.error("INITIAL LOAD DATA ERROR:", err);
}
}

initApp();

const {
data: { subscription },
} = supabase.auth.onAuthStateChange(async () => {
try {
const { data, error } = await supabase.auth.getUser();
if (error) {
console.error("AUTH STATE ERROR:", error);
}
if (mounted) {
setUser(data?.user ?? null);
}
} catch (err) {
console.error("AUTH STATE FETCH ERROR:", err);
if (mounted) {
setUser(null);
}
}
});

const timeout = setTimeout(() => {
if (mounted) {
console.warn("Auth loading timed out, forcing login screen.");
setAuthLoading(false);
}
}, 5000);

return () => {
mounted = false;
clearTimeout(timeout);
subscription.unsubscribe();
};
}, []);

const filledSpots = teams.length;
const spotsLeft = Math.max(TOTAL_SPOTS - filledSpots, 0);

const assignedFreeAgents = useMemo(
() => freeAgents.filter((p) => p.assignedTeamId),
[freeAgents]
);

const playersByTeam = useMemo(() => {
const grouped = {};
teams.forEach((team) => {
grouped[team.id] = [];
});
freeAgents.forEach((player) => {
if (player.assignedTeamId) {
if (!grouped[player.assignedTeamId]) grouped[player.assignedTeamId] = [];
grouped[player.assignedTeamId].push(player);
}
});
return grouped;
}, [teams, freeAgents]);

const standings = useMemo(() => {
const base = teams.map((team) => ({
teamId: team.id,
teamName: team.teamName,
wins: 0,
losses: 0,
ties: 0,
runsFor: 0,
runsAgainst: 0,
}));

const index = {};
base.forEach((row) => {
index[row.teamId] = row;
});

schedule.forEach((game) => {
const hasScores =
game.homeScore !== "" &&
game.awayScore !== "" &&
!Number.isNaN(Number(game.homeScore)) &&
!Number.isNaN(Number(game.awayScore));

if (!hasScores) return;

const home = index[game.homeTeamId];
const away = index[game.awayTeamId];
if (!home || !away) return;

const hs = Number(game.homeScore);
const as = Number(game.awayScore);

home.runsFor += hs;
home.runsAgainst += as;
away.runsFor += as;
away.runsAgainst += hs;

if (hs > as) {
home.wins += 1;
away.losses += 1;
} else if (as > hs) {
away.wins += 1;
home.losses += 1;
} else {
home.ties += 1;
away.ties += 1;
}
});

return base.sort((a, b) => {
if (b.wins !== a.wins) return b.wins - a.wins;
return (b.runsFor - b.runsAgainst) - (a.runsFor - a.runsAgainst);
});
}, [teams, schedule]);

async function handleTeamSubmit(e) {
e.preventDefault();
console.log("TEAM FORM SUBMIT FIRED", teamForm);

try {
const payload = {
team_name: teamForm.teamName,
captain_name: teamForm.captainName,
captain_email: teamForm.captainEmail,
captain_phone: teamForm.captainPhone,
payment_tier: activePricing.tier,
paid_status: "Pending",
signature_name: teamForm.signature,
agree_waiver: teamForm.agreeWaiver,
agree_captain_duty: teamForm.agreeCaptainDuty,
agree_electronic: teamForm.agreeElectronic,
};

console.log("TEAM INSERT PAYLOAD:", payload);

const { data, error } = await supabase.from("teams").insert([payload]).select();

console.log("TEAM INSERT DATA:", data);
console.log("TEAM INSERT ERROR:", error);

if (error) {
alert(error.message || JSON.stringify(error));
return;
}

setTeamForm(initialTeamForm);
await loadData();
alert("Team registration saved.");
} catch (err) {
console.error("TEAM INSERT FETCH FAILURE:", err);
alert(String(err));
}
}

async function handleFreeAgentSubmit(e) {
e.preventDefault();

try {
const payload = {
player_name: freeAgentForm.playerName,
player_email: freeAgentForm.playerEmail,
player_phone: freeAgentForm.playerPhone,
gender: freeAgentForm.gender,
skill: freeAgentForm.skill,
preferred_position: freeAgentForm.preferredPosition,
paid_status: "Pending",
signature_name: freeAgentForm.signature,
agree_waiver: freeAgentForm.agreeWaiver,
agree_electronic: freeAgentForm.agreeElectronic,
assigned_team_id: null,
};

const { error } = await supabase.from("free_agents").insert([payload]);

if (error) {
console.error("FREE AGENT INSERT ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

setFreeAgentForm(initialFreeAgentForm);
await loadData();
alert("Free agent registration saved.");
} catch (err) {
console.error("FREE AGENT INSERT FETCH FAILURE:", err);
alert(String(err));
}
}

async function handleAdminLogin(e) {
e.preventDefault();

try {
const { error } = await supabase.auth.signInWithPassword({
email: loginEmail,
password: loginPassword,
});

if (error) {
console.error("ADMIN LOGIN ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

const { data, error: userError } = await supabase.auth.getUser();

if (userError) {
console.error("ADMIN GET USER ERROR:", userError);
alert(userError.message || JSON.stringify(userError));
return;
}

if (!data?.user) {
alert("Unable to verify admin user.");
return;
}

if (data.user.email !== ADMIN_EMAIL) {
await supabase.auth.signOut();
alert("This account is not authorized for admin access.");
return;
}

setLoginEmail("");
setLoginPassword("");
alert("Admin login successful.");
} catch (err) {
console.error("ADMIN LOGIN FETCH FAILURE:", err);
alert(String(err));
}
}

async function handleAdminLogout() {
const { error } = await supabase.auth.signOut();
if (error) {
console.error("ADMIN LOGOUT ERROR:", error);
alert(error.message || JSON.stringify(error));
}
}

async function updateTeam(teamId, updates) {
const payload = {};
if (updates.paidStatus !== undefined) payload.paid_status = updates.paidStatus;

const { error } = await supabase.from("teams").update(payload).eq("id", teamId);

if (error) {
console.error("UPDATE TEAM ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

await loadData();
}

async function deleteTeam(teamId) {
if (!window.confirm("Delete this team?")) return;

const { error } = await supabase.from("teams").delete().eq("id", teamId);

if (error) {
console.error("DELETE TEAM ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

await loadData();
}

async function updateFreeAgent(playerId, updates) {
const payload = {};
if (updates.paidStatus !== undefined) payload.paid_status = updates.paidStatus;
if (updates.assignedTeamId !== undefined) payload.assigned_team_id = updates.assignedTeamId || null;

const { error } = await supabase.from("free_agents").update(payload).eq("id", playerId);

if (error) {
console.error("UPDATE FREE AGENT ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

await loadData();
}

async function deleteFreeAgent(playerId) {
if (!window.confirm("Delete this free agent?")) return;

const { error } = await supabase.from("free_agents").delete().eq("id", playerId);

if (error) {
console.error("DELETE FREE AGENT ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

await loadData();
}

async function assignFreeAgent(playerId, teamId) {
await updateFreeAgent(playerId, { assignedTeamId: teamId });
}

async function unassignFreeAgent(playerId) {
await updateFreeAgent(playerId, { assignedTeamId: "" });
}

async function buildSchedule() {
if (!window.confirm("Generate a new round-robin schedule? This will replace the current schedule.")) {
return;
}

const generated = generateRoundRobinSchedule(teams);

const { error: deleteError } = await supabase
.from("schedule_games")
.delete()
.neq("id", "00000000-0000-0000-0000-000000000000");

if (deleteError) {
console.error("CLEAR EXISTING SCHEDULE ERROR:", deleteError);
alert(deleteError.message || JSON.stringify(deleteError));
return;
}

if (generated.length > 0) {
const rows = generated.map((game) => ({
week: game.week,
home_team_id: game.homeTeamId,
away_team_id: game.awayTeamId,
game_date: game.date,
game_time: game.time,
field: game.field,
status: game.status,
home_score: null,
away_score: null,
}));

const { error: insertError } = await supabase.from("schedule_games").insert(rows);

if (insertError) {
console.error("BUILD SCHEDULE INSERT ERROR:", insertError);
alert(insertError.message || JSON.stringify(insertError));
return;
}
}

await loadData();
}

async function clearSchedule() {
if (!window.confirm("Clear the full schedule?")) return;

const { error } = await supabase
.from("schedule_games")
.delete()
.neq("id", "00000000-0000-0000-0000-000000000000");

if (error) {
console.error("CLEAR SCHEDULE ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

await loadData();
}

async function updateGame(gameId, updates) {
const payload = {};
if (updates.date !== undefined) payload.game_date = updates.date;
if (updates.time !== undefined) payload.game_time = updates.time;
if (updates.field !== undefined) payload.field = updates.field;
if (updates.status !== undefined) payload.status = updates.status;
if (updates.awayScore !== undefined) payload.away_score = updates.awayScore === "" ? null : Number(updates.awayScore);
if (updates.homeScore !== undefined) payload.home_score = updates.homeScore === "" ? null : Number(updates.homeScore);

const { error } = await supabase.from("schedule_games").update(payload).eq("id", gameId);

if (error) {
console.error("UPDATE GAME ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}

await loadData();
}

async function autoAssignFreeAgents() {
const unassigned = freeAgents.filter((p) => !p.assignedTeamId);

if (!unassigned.length || !teams.length) {
alert("No unassigned free agents or no teams available.");
return;
}

const currentRosters = {};
teams.forEach((team) => {
const roster = playersByTeam[team.id] || [];
currentRosters[team.id] = {
total: roster.length,
male: roster.filter((p) => p.gender === "Male").length,
female: roster.filter((p) => p.gender === "Female").length,
};
});

const updates = [];

for (const player of unassigned) {
const sortedTeams = [...teams].sort((a, b) => {
const aRoster = currentRosters[a.id];
const bRoster = currentRosters[b.id];

const aGenderCount = player.gender === "Female" ? aRoster.female : aRoster.male;
const bGenderCount = player.gender === "Female" ? bRoster.female : bRoster.male;

if (aGenderCount !== bGenderCount) return aGenderCount - bGenderCount;
return aRoster.total - bRoster.total;
});

const chosenTeam = sortedTeams[0];
updates.push({ id: player.id, assigned_team_id: chosenTeam.id });

currentRosters[chosenTeam.id].total += 1;
if (player.gender === "Female") currentRosters[chosenTeam.id].female += 1;
if (player.gender === "Male") currentRosters[chosenTeam.id].male += 1;
}

for (const update of updates) {
const { error } = await supabase
.from("free_agents")
.update({ assigned_team_id: update.assigned_team_id })
.eq("id", update.id);

if (error) {
console.error("AUTO ASSIGN ERROR:", error);
alert(error.message || JSON.stringify(error));
return;
}
}

await loadData();
alert("Free agents assigned to teams.");
}

function NavLinks({ mobile = false }) {
const linkClass = mobile ? "mobile-link-button" : "nav-link-button";

return (
<>
<button type="button" className={linkClass} onClick={() => { setPage("home"); setMenuOpen(false); }}>
Home
</button>
<button type="button" className={linkClass} onClick={() => { setPage("register"); setMenuOpen(false); }}>
Register
</button>
<button type="button" className={linkClass} onClick={() => { setPage("schedule"); setMenuOpen(false); }}>
Schedule
</button>
<button type="button" className={linkClass} onClick={() => { setPage("rules"); setMenuOpen(false); }}>
Rules
</button>
<button type="button" className={linkClass} onClick={() => { setPage("waiver"); setMenuOpen(false); }}>
Waiver
</button>
<button type="button" className={linkClass} onClick={() => { setPage("admin"); setMenuOpen(false); }}>
Admin
</button>
<a
href="mailto:desertrecsportsleague@gmail.com"
className={mobile ? "mobile-email-link" : "nav-cta"}
onClick={() => setMenuOpen(false)}
>
Contact
</a>
</>
);
}

function HomePage() {
return (
<section className="hero">
<div className="container">
<div className="hero-inner">
<div>
<div className="eyebrow">Buckeye Adult Softball</div>
<h1>Thursday night coed softball at Sundance Park.</h1>
<p>
Desert Rec Sports League is launching an organized 8-week coed softball season in Buckeye, Arizona with a social atmosphere, competitive games, a championship trophy, and an MVP award.
</p>

<div className="hero-actions">
<button type="button" className="btn btn-primary" onClick={() => setPage("register")}>
Register Now
</button>
<button type="button" className="btn btn-secondary" onClick={() => setPage("rules")}>
View Rules
</button>
</div>
</div>

<div className="hero-card">
<div className="hero-card-label">Current League</div>
<h3>Thursday Coed League</h3>

<div className="hero-list">
<div className="hero-list-item">Sundance Park — Buckeye, AZ</div>
<div className="hero-list-item">Starts the 2nd week of May</div>
<div className="hero-list-item">8-week season</div>
<div className="hero-list-item">Standard format: 7 men / 3 women</div>
<div className="hero-list-item">3:1 men-to-women batting ratio</div>
<div className="hero-list-item">{activePricing.label} pricing active: ${activePricing.price}</div>
<div className="hero-list-item">{spotsLeft} of {TOTAL_SPOTS} team spots still available</div>
</div>

<div className="hero-note">
League champions win the <strong>championship trophy</strong> and the top player earns the <strong>MVP award</strong>.
</div>
</div>
</div>
</div>
</section>
);
}

function RegisterPage() {
return (
<section className="section">
<div className="container">
<div className="waitlist-grid">
<div>
<div className="section-label">League Registration</div>
<h2 className="section-title">Register your team or join as a free agent</h2>
<p className="section-copy">
Thursday night coed softball at Sundance Park in Buckeye, Arizona. Team captains and free agents must acknowledge the full waiver before participating.
</p>

<div className="info-box">
<div className="info-box-title">League Details</div>
<div className="info-line">Thursday Nights</div>
<div className="info-line">Sundance Park — Buckeye, AZ</div>
<div className="info-line">Starts 2nd week of May</div>
<div className="info-line">8-week season</div>
<div className="info-line">3:1 men-to-women batting ratio</div>
<div className="info-line">3 out-of-the-park home run cap</div>
<div className="info-line">8-run limit per inning</div>
<div className="info-line">Current Team Price: {activePricing.label} (${activePricing.price})</div>
<div className="info-line">{activePricing.message}</div>
<div className="info-line">Only {spotsLeft} team spots remaining</div>
</div>

<div className="info-box">
<div className="info-box-title">Questions? Email us</div>
<a href="mailto:desertrecsportsleague@gmail.com" className="email-link">
desertrecsportsleague@gmail.com
</a>
</div>
</div>

<div>
<form
className="form-card"
onSubmit={(e) => {
console.log("TEAM FORM onSubmit triggered");
handleTeamSubmit(e);
}}
>
<div className="form-grid">
<h3 style={{ margin: 0, color: "#1f1a17" }}>Register a Team</h3>

<input
className="input"
type="text"
value={teamForm.teamName}
onChange={(e) => setTeamForm((prev) => ({ ...prev, teamName: e.target.value }))}
placeholder="Team Name"
required
/>

<input
className="input"
type="text"
value={teamForm.captainName}
onChange={(e) => setTeamForm((prev) => ({ ...prev, captainName: e.target.value }))}
placeholder="Captain / Coach Name"
required
/>

<input
className="input"
type="email"
value={teamForm.captainEmail}
onChange={(e) => setTeamForm((prev) => ({ ...prev, captainEmail: e.target.value }))}
placeholder="Email Address"
required
/>

<input
className="input"
type="tel"
value={teamForm.captainPhone}
onChange={(e) => setTeamForm((prev) => ({ ...prev, captainPhone: e.target.value }))}
placeholder="Phone Number"
/>

<div className="info-box" style={{ marginTop: 0 }}>
<div className="info-box-title">Current Team Pricing</div>
<div className="info-line">{activePricing.label}: ${activePricing.price}</div>
</div>

<textarea className="textarea" readOnly value={captainWaiverSummary} />

<div className="waiver-box">
<div className="waiver-box-title">Captain / Coach Additional Responsibility</div>
<p>
In addition to the standard waiver, the team captain or coach is responsible for making sure <strong>every player who takes the field for the team</strong>, including substitute and replacement players, has completed and acknowledged the required player waiver before participating.
</p>
<button type="button" className="waiver-link-button" onClick={() => setPage("waiver")}>
View Full Waiver and Release of Liability
</button>
</div>

<input
className="input"
type="text"
value={teamForm.signature}
onChange={(e) => setTeamForm((prev) => ({ ...prev, signature: e.target.value }))}
placeholder="Type Full Legal Name as Electronic Signature"
required
/>

<label className="checkbox-row">
<input
type="checkbox"
checked={teamForm.agreeWaiver}
onChange={(e) => setTeamForm((prev) => ({ ...prev, agreeWaiver: e.target.checked }))}
required
/>
<span>I have read and agree to the full waiver and release of liability.</span>
</label>

<label className="checkbox-row">
<input
type="checkbox"
checked={teamForm.agreeCaptainDuty}
onChange={(e) => setTeamForm((prev) => ({ ...prev, agreeCaptainDuty: e.target.checked }))}
required
/>
<span>
I understand that as captain/coach, I am responsible for making sure every player on my team signs or validly acknowledges the required player waiver before participating.
</span>
</label>

<label className="checkbox-row">
<input
type="checkbox"
checked={teamForm.agreeElectronic}
onChange={(e) => setTeamForm((prev) => ({ ...prev, agreeElectronic: e.target.checked }))}
required
/>
<span>I intend my typed name to serve as my electronic signature.</span>
</label>

<div className="button-row">
<button
type="submit"
className="btn btn-primary"
onClick={() => console.log("SAVE TEAM BUTTON CLICKED")}
>
Save Team Registration
</button>
</div>
</div>
</form>

<form className="form-card" style={{ marginTop: "20px" }} onSubmit={handleFreeAgentSubmit}>
<div className="form-grid">
<h3 style={{ margin: 0, color: "#1f1a17" }}>Join as a Free Agent</h3>

<input
className="input"
type="text"
value={freeAgentForm.playerName}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, playerName: e.target.value }))}
placeholder="Full Name"
required
/>

<input
className="input"
type="email"
value={freeAgentForm.playerEmail}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, playerEmail: e.target.value }))}
placeholder="Email Address"
required
/>

<input
className="input"
type="tel"
value={freeAgentForm.playerPhone}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, playerPhone: e.target.value }))}
placeholder="Phone Number"
/>

<select
className="select"
value={freeAgentForm.gender}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, gender: e.target.value }))}
required
>
<option value="">Select Gender</option>
<option value="Male">Male</option>
<option value="Female">Female</option>
</select>

<select
className="select"
value={freeAgentForm.skill}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, skill: e.target.value }))}
>
<option value="">Skill Level</option>
<option value="Beginner">Beginner</option>
<option value="Intermediate">Intermediate</option>
<option value="Competitive">Competitive</option>
</select>

<input
className="input"
type="text"
value={freeAgentForm.preferredPosition}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, preferredPosition: e.target.value }))}
placeholder="Preferred Position"
/>

<textarea className="textarea" readOnly value={playerWaiverSummary} />

<div className="waiver-box">
<div className="waiver-box-title">Player Waiver</div>
<p>You must review and agree to the full waiver before joining as a free agent.</p>
<button type="button" className="waiver-link-button" onClick={() => setPage("waiver")}>
View Full Waiver and Release of Liability
</button>
</div>

<input
className="input"
type="text"
value={freeAgentForm.signature}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, signature: e.target.value }))}
placeholder="Type Full Legal Name as Electronic Signature"
required
/>

<label className="checkbox-row">
<input
type="checkbox"
checked={freeAgentForm.agreeWaiver}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, agreeWaiver: e.target.checked }))}
required
/>
<span>I have read and agree to the full waiver and release of liability.</span>
</label>

<label className="checkbox-row">
<input
type="checkbox"
checked={freeAgentForm.agreeElectronic}
onChange={(e) => setFreeAgentForm((prev) => ({ ...prev, agreeElectronic: e.target.checked }))}
required
/>
<span>I intend my typed name to serve as my electronic signature.</span>
</label>

<div className="button-row">
<button type="submit" className="btn btn-primary">Save Free Agent Registration</button>
<a href={FREE_AGENT_PAYMENT_LINK} className="btn btn-secondary dark-outline">
Go to $60 Payment
</a>
</div>
</div>
</form>
</div>
</div>
</div>
</section>
);
}

function RulesPage() {
return (
<section className="section">
<div className="container">
<div style={{ maxWidth: "860px", marginBottom: "28px" }}>
<div className="section-label">League Rules</div>
<h2 className="section-title">Desert Rec Coed Softball Rules</h2>
<p className="section-copy">
These are the official Desert Rec Sports League coed softball rules for the Thursday night league. They are written for a social but competitive adult rec format and should be reviewed by all captains and players before participating.
</p>
</div>

<div className="card rules-summary-card">
<h3 style={{ marginTop: 0, color: "#1f1a17" }}>Quick Highlights</h3>
<div className="rules-highlights">
<div className="rule-pill">Standard roster: 7 men / 3 women</div>
<div className="rule-pill">3:1 men-to-women batting ratio</div>
<div className="rule-pill">3 out-of-the-park home run cap</div>
<div className="rule-pill">8-run limit per inning</div>
<div className="rule-pill">Line drive up the middle = automatic out</div>
<div className="rule-pill">Safety base at 1st and home required</div>
<div className="rule-pill">8 men / 2 women allowed only if both teams agree</div>
</div>
</div>

<div className="rules-grid">
{rulesSections.map((section) => (
<div className="card rules-card" key={section.title}>
<h3 className="rules-card-title">{section.title}</h3>
<ul className="rules-list">
{section.body.map((item, index) => (
<li key={index}>{item}</li>
))}
</ul>
</div>
))}
</div>
</div>
</section>
);
}

function SchedulePage() {
const weeks = [...new Set(schedule.map((game) => game.week))].sort((a, b) => a - b);

return (
<section className="section">
<div className="container">
<div style={{ maxWidth: "760px", marginBottom: "28px" }}>
<div className="section-label">League Schedule</div>
<h2 className="section-title">Thursday Coed League schedule and standings</h2>
<p className="section-copy">
{loading ? "Loading schedule..." : "Schedule appears here once created in the admin dashboard."}
</p>
</div>

<div className="card" style={{ marginBottom: "24px" }}>
<h3 style={{ marginTop: 0, color: "#1f1a17" }}>Standings</h3>
{standings.length === 0 ? (
<div className="league-note">No teams registered yet.</div>
) : (
<div className="table-wrap">
<table className="admin-table">
<thead>
<tr>
<th>Team</th>
<th>W</th>
<th>L</th>
<th>T</th>
<th>RF</th>
<th>RA</th>
</tr>
</thead>
<tbody>
{standings.map((row) => (
<tr key={row.teamId}>
<td>{row.teamName}</td>
<td>{row.wins}</td>
<td>{row.losses}</td>
<td>{row.ties}</td>
<td>{row.runsFor}</td>
<td>{row.runsAgainst}</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</div>

{weeks.length === 0 ? (
<div className="card">
<div className="league-note">No schedule has been generated yet.</div>
</div>
) : (
weeks.map((week) => (
<div className="card" key={week} style={{ marginBottom: "20px" }}>
<h3 style={{ marginTop: 0, color: "#1f1a17" }}>Week {week}</h3>
<div className="table-wrap">
<table className="admin-table">
<thead>
<tr>
<th>Matchup</th>
<th>Date</th>
<th>Time</th>
<th>Field</th>
<th>Status</th>
<th>Score</th>
</tr>
</thead>
<tbody>
{schedule
.filter((game) => game.week === week)
.map((game) => (
<tr key={game.id}>
<td>{game.awayTeamName} at {game.homeTeamName}</td>
<td>{game.date || "TBD"}</td>
<td>{game.time || "TBD"}</td>
<td>{game.field || "Sundance Park"}</td>
<td>{game.status}</td>
<td>
{game.homeScore !== "" && game.awayScore !== ""
? `${game.awayTeamName} ${game.awayScore} - ${game.homeTeamName} ${game.homeScore}`
: "Not entered"}
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
))
)}
</div>
</section>
);
}

function WaiverPage() {
return (
<section className="section">
<div className="container">
<div className="waiver-page-card">
  