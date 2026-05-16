import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const heroImage = "/hero-softball.jpg";
const logoImage = "/drsl-logo.png";

const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";
const FREE_AGENT_TEAM_MAX = 12;
const FREE_AGENT_TEAM_MIN = 9;
const FREE_AGENT_TEAM_MIN_FEMALES = 3;

const EARLY_BIRD_END = "2026-04-15T23:59:59";
const REGULAR_END = "2026-05-05T23:59:59";
const PAYMENT_DEADLINE = "2026-05-07T23:59:59";
const KICKBALL_REGULAR_END = "2026-06-07T23:59:59";

const LEAGUES = {
softball: {
key: "softball",
name: "Softball",
title: "Thursday Night Coed Softball",
night: "Thursday Nights",
location: "Sundance Park",
city: "Buckeye, Arizona",
teamCap: 8,
rosterTarget: "7 Men / 3 Women",
freeAgentPrice: 60,
regularFreeAgentPrice: 60,
teamPricing: true,
},
kickball: {
key: "kickball",
name: "Kickball",
title: "Sunday Evening Coed Kickball",
night: "Sunday Evenings",
location: "Sundance Park",
city: "Buckeye, Arizona",
teamCap: 8,
rosterTarget: "6 Men / 4 Women",
freeAgentPrice: 60,
regularFreeAgentPrice: 65,
teamPricing: false,
},
};

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

const initialRosterForm = { playerName: "", playerEmail: "", playerPhone: "" };
const initialStatForm = { playerName: "", teamId: "", gamesPlayed: 0, hits: 0, homeRuns: 0, rbis: 0, runs: 0 };

const fullWaiverText = `
DESERT REC SPORTS LEAGUE
WAIVER AND RELEASE OF LIABILITY

PLEASE READ CAREFULLY. THIS DOCUMENT AFFECTS YOUR LEGAL RIGHTS.

1. ASSUMPTION OF RISK
I understand that participation in Desert Rec Sports League activities, including but not limited to softball games, kickball games, practices, warm-ups, tournaments, league events, and related activities, involves inherent and significant risks. These risks include, but are not limited to, falls, collisions, thrown, kicked, or batted balls, use of equipment, weather conditions, field conditions, negligent acts of other participants, and serious bodily injury, permanent disability, paralysis, or death. I knowingly and voluntarily assume all risks associated with participation.

2. RELEASE AND WAIVER
In consideration of being allowed to participate in Desert Rec Sports League activities, I, on behalf of myself and my heirs, assigns, personal representatives, and next of kin, hereby release, waive, discharge, and covenant not to sue Desert Rec Sports League, its owners, organizers, officers, staff, contractors, officials, umpires, volunteers, sponsors, partners, advertisers, and any park, field, facility, municipality, or property owner connected with league activities from and against any and all claims, demands, losses, damages, liabilities, costs, or causes of action arising out of or related to any injury, disability, death, or property damage that may occur as a result of participation, to the fullest extent permitted by law.

3. MEDICAL FITNESS
I certify that I am physically and medically able to participate in Desert Rec Sports League activities. I understand that Desert Rec Sports League does not provide medical insurance for participants. I understand it is my responsibility to obtain my own medical clearance, insurance, and treatment if needed.

4. RULES AND CONDUCT
I agree to follow all league rules, facility rules, safety instructions, and directions from league staff and officials. I understand that failure to follow league rules or engaging in unsafe, abusive, or disruptive conduct may result in suspension or removal from league activities without refund.

5. EMERGENCY CARE
I authorize Desert Rec Sports League and its representatives to seek emergency medical treatment for me if necessary, and I accept financial responsibility for any medical care provided.

6. PHOTO AND MEDIA RELEASE
I grant Desert Rec Sports League permission to photograph, record, and use my name, image, likeness, and voice in league-related promotional content, social media, website content, and marketing materials without compensation, unless prohibited by law.

7. CAPTAIN / COACH RESPONSIBILITY ADDENDUM
If I am registering as a team captain or coach, I understand and agree that I have an additional responsibility to ensure that every player who participates for my team has completed, signed, or otherwise validly acknowledged the required player waiver before participating in any game, practice, or league activity. I understand that allowing a player to participate without a completed waiver may result in player ineligibility, team penalties, forfeits, suspension, or removal from the league. I further acknowledge that the captain/coach serves as the teamâ€™s primary point of contact and is responsible for communicating league rules, safety expectations, and waiver requirements to all rostered and substitute players.

8. SUBSTITUTE AND ADDITIONAL PLAYER RESPONSIBILITY
I understand that this captain/coach responsibility applies not only to original rostered players but also to substitute, replacement, guest, or late-added players who participate for the team at any point during the season. I understand that any substitute player must also complete and acknowledge the required waiver before taking the field.

9. ACKNOWLEDGMENT OF UNDERSTANDING
I have carefully read this Waiver and Release of Liability, fully understand its contents, and understand that by checking the agreement box and typing my name as an electronic signature, I am giving up substantial legal rights. I acknowledge that my electronic acknowledgment is intended to have the same force and effect as a handwritten signature.

By participating in Desert Rec Sports League activities, I acknowledge and agree to the terms above.
`.trim();

const softballRulesSections = [
{ title: "1. League Format", body: ["Desert Rec Sports League operates as an adult recreational coed slowpitch softball league.", "Standard format is 10 defensive players on the field.", "Standard roster target is 7 men and 3 women whenever possible.", "If one team does not have enough women available, both teams may agree before the game to allow an 8 men / 2 women ratio for that game."] },
{ title: "2. Batting Order", body: ["Teams must maintain a 3:1 men-to-women batting ratio throughout the lineup.", "Batting order should follow a pattern of three male batters and one female batter as consistently as possible.", "Captains are responsible for maintaining a legal lineup and notifying the umpire of any changes."] },
{ title: "3. Game Length and Run Limits", body: ["There is an 8-run limit per inning for all innings unless a final inning is specifically announced by league staff or the umpire before the inning begins.", "Scores must be reported accurately at the end of each game.", "Game times, mercy rules, and time-limit enforcement will be controlled by league staff or the umpire on site."] },
{ title: "4. Home Run Rule", body: ["Each team is allowed a maximum of 3 out-of-the-park home runs per game.", "Any additional out-of-the-park home run after a team reaches its cap is an automatic out."] },
{ title: "5. Safety Rules", body: ["Safety bases at first base and home plate must be used whenever provided.", "Any line drive hit up the middle is an automatic out.", "Umpire judgment controls all safety rulings.", "All players must use equipment and facilities in a safe manner."] },
{ title: "6. Sportsmanship and Conduct", body: ["Unsportsmanlike conduct may result in warnings, outs, ejections, suspensions, or removal.", "Captains are expected to control their team and communicate professionally.", "Abusive language, threatening conduct, fighting, or repeated disruption may result in league discipline without refund."] },
{ title: "7. Waivers and Eligibility", body: ["Every player must complete the required waiver before participating.", "Captains are responsible for ensuring all rostered players and substitute players have completed the waiver before taking the field.", "Use of unwaived or ineligible players may result in forfeits, suspensions, or removal from the league."] },
];

const kickballRulesSections = [
{ title: "1. League Format", body: ["Desert Rec Sports League operates as an adult recreational coed kickball league.", "The league is built to be fun, social, and competitive while keeping sportsmanship first.", "Teams play with 10 defensive players on the field whenever possible.", "Standard roster target is 6 men and 4 women whenever possible.", "Minimum to start a game is 8 players, with at least 3 women recommended."] },
{ title: "2. Field and Equipment", body: ["The league will provide the official kickball.", "Bases are generally set at approximately 60 to 70 feet depending on field setup.", "No metal cleats are allowed.", "Players must use equipment and facilities in a safe and respectful manner."] },
{ title: "3. Kicking Order", body: ["Teams must maintain a coed kicking order when possible.", "Recommended lineup format is 2 men followed by 1 woman or another balanced coed rotation approved by the umpire or league staff.", "Late players may be added to the end of the lineup.", "Captains are responsible for maintaining a fair and legal lineup."] },
{ title: "4. Pitching and Kicking", body: ["Pitches must be rolled smoothly on the ground and be reasonably kickable.", "No excessive bouncing, overly fast, or intentionally difficult pitches are allowed.", "The count starts at 1 ball and 1 strike.", "Three strikes is an out. Four balls is a walk.", "Fouls count as strikes. A foul ball with two strikes is an out."] },
{ title: "5. Base Running and Outs", body: ["No leading off or stealing. Runners may advance only after the ball is kicked.", "A runner is out if tagged with the ball, forced out at a base, hit below the shoulders by a thrown ball, or if the kicked ball is caught in the air.", "Runners must stay within the baseline.", "Sliding is allowed only if controlled and non-aggressive."] },
{ title: "6. No Headshots", body: ["Any throw that hits a runner above the shoulders results in the runner being safe.", "Intentional or reckless headshots may result in a warning, ejection, suspension, or further league discipline.", "Player safety is a priority and umpire judgment controls all safety rulings."] },
{ title: "7. Game Length and Run Limits", body: ["Games are generally 50 minutes or 6 innings, whichever comes first.", "No new inning begins after time expires.", "There is an 8-run limit per inning unless the final inning is announced as open by league staff or the umpire.", "A mercy rule may be applied at 15 runs after 4 innings or 10 runs after 5 innings."] },
{ title: "8. Sportsmanship and Conduct", body: ["This is a recreational league, but games are still competitive.", "Players must respect officials, opponents, teammates, spectators, and league staff.", "Aggressive contact, fighting, threatening language, or repeated arguing may result in ejection or suspension.", "Team uniforms are encouraged but not required. Team spirit and fun are strongly encouraged."] },
{ title: "9. Waivers and Eligibility", body: ["Every player must complete the Desert Rec Sports League waiver before participating.", "Captains are responsible for ensuring all rostered and substitute players sign the waiver before taking the field.", "Use of unwaived or ineligible players may result in forfeits, suspensions, or removal from the league."] },
{ title: "10. Standings and Playoffs", body: ["Standings are based on record, then run differential, then head-to-head, then runs scored.", "Top teams advance to playoffs based on league size and schedule format.", "Playoffs are single elimination unless otherwise announced.", "Championship game rules may be adjusted by league staff before playoffs begin."] },
];

function withTimeout(promise, ms = 15000, message = "Request timed out.") {
return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms))]);
}

function formatDisplayDate(dateString) { return new Date(dateString).toLocaleDateString(); }
function safeNumber(value) { if (value === "" || value === null || value === undefined) return null; const n = Number(value); return Number.isNaN(n) ? null : n; }
function normalizeLeague(value) { return value === "kickball" ? "kickball" : "softball"; }

function getPricingInfo() {
const now = new Date();
if (now <= new Date(EARLY_BIRD_END)) return { tier: "early", label: "Early Bird", price: 550, amountCents: 55000, message: `Early Bird pricing is active through ${formatDisplayDate(EARLY_BIRD_END)}.` };
if (now <= new Date(REGULAR_END)) return { tier: "regular", label: "Regular", price: 600, amountCents: 60000, message: `Regular pricing is active through ${formatDisplayDate(REGULAR_END)}.` };
return { tier: "late", label: "Late", price: 650, amountCents: 65000, message: "Late pricing is active." };
}

function getKickballPlayerPrice() {
const now = new Date();
const regularEnd = new Date(KICKBALL_REGULAR_END);

if (now <= regularEnd) {
return {
label: "Regular",
price: 60,
amountCents: 6000,
message: `Kickball regular registration is active through ${formatDisplayDate(KICKBALL_REGULAR_END)}.`,
};
}

return {
label: "Late",
price: 65,
amountCents: 6500,
message: "Kickball late registration is active.",
};
}

function getPaymentDeadlinePassed() { return new Date() > new Date(PAYMENT_DEADLINE); }
function getTeamStatus(team) {
if (team.paidStatus === "Paid") return "Paid";

if (team.leagueType === "kickball") {
return "Pending";
}

if (getPaymentDeadlinePassed()) return "Locked";
return "Pending";
}

function getFreeAgentStatus(player) {
if (player.paidStatus === "Paid") return "Paid";

if (player.leagueType === "kickball") {
return "Pending";
}

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
Final: { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" },
Scheduled: { background: "#e0f2fe", color: "#075985", border: "1px solid #7dd3fc" },
};
return <span style={{ display: "inline-block", padding: "6px 10px", borderRadius: "999px", fontWeight: 700, fontSize: "12px", ...(styles[status] || styles.Pending) }}>{status}</span>;
}

function mapTeamRow(row) { return { id: row.id, teamName: row.team_name, captainName: row.captain_name, captainEmail: row.captain_email, captainPhone: row.captain_phone || "", paymentTier: row.payment_tier || "", paidStatus: row.paid_status || "Pending", inviteToken: row.invite_token || "", leagueType: normalizeLeague(row.league_type), createdAt: row.created_at }; }
function mapFreeAgentRow(row) { return { id: row.id, playerName: row.player_name, playerEmail: row.player_email, playerPhone: row.player_phone || "", gender: row.gender || "", skill: row.skill || "", preferredPosition: row.preferred_position || "", paidStatus: row.paid_status || "Pending", assignedTeamId: row.assigned_team_id || null, leagueType: normalizeLeague(row.league_type), createdAt: row.created_at }; }
function mapTeamPlayerRow(row) { return { id: row.id, teamId: row.team_id, playerName: row.player_name, playerEmail: row.player_email || "", playerPhone: row.player_phone || "", signedWaiver: !!row.signed_waiver, signatureName: row.signature_name || "", signedAt: row.signed_at || "", paidStatus: row.paid_status || "Pending", leagueType: normalizeLeague(row.league_type) }; }
function mapScheduleRow(row) { return { id: row.id, week: row.week, date: row.game_date || "", time: row.game_time || "", field: row.field || "Sundance Park", status: row.status || "Scheduled", homeTeamId: row.home_team_id, awayTeamId: row.away_team_id, homeScore: row.home_score ?? "", awayScore: row.away_score ?? "", leagueType: normalizeLeague(row.league_type) }; }
function mapPlayerStatRow(row) { return { id: row.id, playerName: row.player_name || "", teamId: row.team_id || null, gamesPlayed: row.games_played ?? 0, hits: row.hits ?? 0, homeRuns: row.home_runs ?? 0, rbis: row.rbis ?? 0, runs: row.runs ?? 0, leagueType: normalizeLeague(row.league_type) }; }
function mapPlayoffGameRow(row) { return { id: row.id, roundName: row.round_name || "", seedHome: row.seed_home ?? "", seedAway: row.seed_away ?? "", homeTeamId: row.home_team_id || null, awayTeamId: row.away_team_id || null, gameOrder: row.game_order ?? 1, homeScore: row.home_score ?? "", awayScore: row.away_score ?? "", winnerTeamId: row.winner_team_id || null, status: row.status || "Scheduled", leagueType: normalizeLeague(row.league_type) }; }

function rotateRoundRobin(list) { const arr = [...list]; const fixed = arr[0]; const rest = arr.slice(1); rest.unshift(rest.pop()); return [fixed, ...rest]; }
function generateRoundRobinSchedule(teamObjects) {
const teams = teamObjects.map((t) => ({ id: t.id, name: t.teamName }));
if (teams.length < 2) return [];
const working = [...teams];
if (working.length % 2 !== 0) working.push({ id: "bye", name: "BYE" });
const rounds = [];
let rotation = [...working];
for (let round = 0; round < rotation.length - 1; round += 1) {
for (let i = 0; i < rotation.length / 2; i += 1) {
const home = rotation[i]; const away = rotation[rotation.length - 1 - i];
if (home.id !== "bye" && away.id !== "bye") rounds.push({ week: round + 1, homeTeamId: round % 2 === 0 ? home.id : away.id, awayTeamId: round % 2 === 0 ? away.id : home.id, date: "", time: "", field: "Sundance Park", status: "Scheduled", homeScore: "", awayScore: "" });
}
rotation = rotateRoundRobin(rotation);
}
return rounds;
}

function computeStandings(teams, schedule) {
const map = new Map();
teams.filter((t) => t.paidStatus === "Paid").forEach((t) => map.set(t.id, { teamId: t.id, teamName: t.teamName, wins: 0, losses: 0, ties: 0, runsFor: 0, runsAgainst: 0, differential: 0, gamesPlayed: 0 }));
schedule.forEach((g) => {
const hs = safeNumber(g.homeScore); const as = safeNumber(g.awayScore);
if (!g.homeTeamId || !g.awayTeamId || hs === null || as === null) return;
const h = map.get(g.homeTeamId); const a = map.get(g.awayTeamId); if (!h || !a) return;
h.gamesPlayed++; a.gamesPlayed++; h.runsFor += hs; h.runsAgainst += as; a.runsFor += as; a.runsAgainst += hs;
if (hs > as) { h.wins++; a.losses++; } else if (as > hs) { a.wins++; h.losses++; } else { h.ties++; a.ties++; }
});
return [...map.values()].map((t) => ({ ...t, differential: t.runsFor - t.runsAgainst })).sort((a, b) => b.wins - a.wins || a.losses - b.losses || b.differential - a.differential || b.runsFor - a.runsFor || a.teamName.localeCompare(b.teamName)).map((t, i) => ({ ...t, seed: i + 1 }));
}

export default function App() {
const [page, setPage] = useState("home");
const [registrationLeague, setRegistrationLeague] = useState("softball");
const [adminLeague, setAdminLeague] = useState("softball");
const [paymentNotice, setPaymentNotice] = useState("");
const [teamForm, setTeamForm] = useState(initialTeamForm);
const [freeAgentForm, setFreeAgentForm] = useState(initialFreeAgentForm);
const [teams, setTeams] = useState([]);
const [freeAgents, setFreeAgents] = useState([]);
const [teamPlayers, setTeamPlayers] = useState([]);
const [schedule, setSchedule] = useState([]);
const [playerStats, setPlayerStats] = useState([]);
const [playoffGames, setPlayoffGames] = useState([]);
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
const [waiverSignature, setWaiverSignature] = useState("");const [waiverAgree, setWaiverAgree] = useState(false);
const [waiverSubmitting, setWaiverSubmitting] = useState(false);
const [waiverCheckoutLoading, setWaiverCheckoutLoading] = useState(false);
const [assigningFreeAgents, setAssigningFreeAgents] = useState(false);
const [creatingNewFreeAgentTeam, setCreatingNewFreeAgentTeam] = useState(false);
const [moveSelections, setMoveSelections] = useState({});
const [movingFreeAgentId, setMovingFreeAgentId] = useState("");
const [settingCaptainTeamId, setSettingCaptainTeamId] = useState("");
const [settingCaptainPlayerId, setSettingCaptainPlayerId] = useState("");
const [settingCaptainLoading, setSettingCaptainLoading] = useState(false);
const [scheduleForm, setScheduleForm] = useState({});
const [savingScheduleGameId, setSavingScheduleGameId] = useState("");
const [statForm, setStatForm] = useState(initialStatForm);
const [savingStat, setSavingStat] = useState(false);
const [savingPlayoffGameId, setSavingPlayoffGameId] = useState("");

const pricing = useMemo(() => getPricingInfo(), []);
const kickballPricing = useMemo(() => getKickballPlayerPrice(), []);
const activeRegistrationLeague = LEAGUES[registrationLeague];
const activeAdminLeague = LEAGUES[adminLeague];
const registrationLeagueTeams = teams.filter((team) => team.leagueType === registrationLeague);
const adminTeams = teams.filter((team) => team.leagueType === adminLeague);
const adminFreeAgents = freeAgents.filter((player) => player.leagueType === adminLeague);
const adminSchedule = schedule.filter((game) => game.leagueType === adminLeague);
const adminPlayerStats = playerStats.filter((stat) => stat.leagueType === adminLeague);
const adminPlayoffGames = playoffGames.filter((game) => game.leagueType === adminLeague);
const teamSpotsFull = registrationLeagueTeams.length >= activeRegistrationLeague.teamCap;
const spotsLeft = Math.max(activeRegistrationLeague.teamCap - registrationLeagueTeams.length, 0);

async function optionalQuery(queryBuilder) { try { return await withTimeout(queryBuilder, 15000); } catch { return { data: [] }; } }
async function loadData() {
try {
const [{ data: teamRows }, { data: freeAgentRows }, { data: teamPlayerRows }, { data: scheduleRows }, { data: statRows }, { data: playoffRows }] = await Promise.all([
withTimeout(supabase.from("teams").select("*").order("created_at", { ascending: false }), 15000),
withTimeout(supabase.from("free_agents").select("*").order("created_at", { ascending: false }), 15000),
withTimeout(supabase.from("team_players").select("*").order("created_at", { ascending: false }), 15000),
withTimeout(supabase.from("schedule_games").select("*").order("week", { ascending: true }), 15000),
optionalQuery(supabase.from("player_stats").select("*").order("player_name", { ascending: true })),
optionalQuery(supabase.from("playoff_games").select("*").order("game_order", { ascending: true })),
]);
const mappedSchedule = (scheduleRows || []).map(mapScheduleRow);
setTeams((teamRows || []).map(mapTeamRow)); setFreeAgents((freeAgentRows || []).map(mapFreeAgentRow)); setTeamPlayers((teamPlayerRows || []).map(mapTeamPlayerRow)); setSchedule(mappedSchedule); setPlayerStats((statRows || []).map(mapPlayerStatRow)); setPlayoffGames((playoffRows || []).map(mapPlayoffGameRow));
const next = {}; mappedSchedule.forEach((g) => { next[g.id] = { week: g.week, date: g.date, time: g.time, field: g.field, status: g.status, homeTeamId: g.homeTeamId, awayTeamId: g.awayTeamId, homeScore: g.homeScore, awayScore: g.awayScore }; }); setScheduleForm(next);
} catch (err) { console.error("LOAD DATA ERROR:", err); }
}

useEffect(() => {
let mounted = true;
async function init() { try { const { data } = await supabase.auth.getUser(); if (mounted) setUser(data?.user ?? null); } finally { if (mounted) setAuthLoading(false); } await loadData(); }
init();
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { if (mounted) setUser(session?.user ?? null); });
return () => { mounted = false; subscription.unsubscribe(); };
}, []);


useEffect(() => {
const params = new URLSearchParams(window.location.search);
const payment = params.get("payment");

if (payment === "success") {
setPaymentNotice("Payment received. Thank you! Your registration may take a moment to update as paid.");
loadData();
window.history.replaceState({}, document.title, window.location.pathname);
}

if (payment === "cancelled") {
setPaymentNotice("Payment was cancelled. Your registration was saved, but payment was not completed.");
window.history.replaceState({}, document.title, window.location.pathname);
}
}, []);

function makeInviteToken() { return crypto.randomUUID().replace(/-/g, ""); }
function getPlayersForTeam(teamId) { return teamPlayers.filter((p) => p.teamId === teamId); }
function getUnsignedCount(teamId) { return getPlayersForTeam(teamId).filter((p) => !p.signedWaiver).length; }
function getAssignedFreeAgentsForTeam(teamId) { return freeAgents.filter((p) => p.assignedTeamId === teamId); }
function getFreeAgentTeams() { return teams.filter((team) => team.leagueType === adminLeague && (team.teamName || "").includes(FREE_AGENT_TEAM_PREFIX)); }

async function updateTeamPaidStatus(teamId, paidStatus) {
try {
const { error } = await supabase
.from("teams")
.update({ paid_status: paidStatus })
.eq("id", teamId);

if (error) throw new Error(error.message || JSON.stringify(error));

await loadData();
alert(`Team marked ${paidStatus}.`);
} catch (err) {
alert(err.message || String(err));
}
}

async function updateFreeAgentPaidStatus(playerId, paidStatus) {
try {
const { error } = await supabase
.from("free_agents")
.update({ paid_status: paidStatus })
.eq("id", playerId);

if (error) throw new Error(error.message || JSON.stringify(error));

await loadData();
alert(`Free agent marked ${paidStatus}.`);
} catch (err) {
alert(err.message || String(err));
}
}

function teamNameById(id) { const team = teams.find((t) => t.id === id); return team ? team.teamName : "Unassigned"; }

async function saveTeamRegistration() {
if (teamSpotsFull) throw new Error(`${activeRegistrationLeague.name} team registration is full.`);
if (!teamForm.teamName.trim()) throw new Error("Enter a team name.");
if (!teamForm.captainName.trim()) throw new Error("Enter a captain name.");
if (!teamForm.captainEmail.trim()) throw new Error("Enter a captain email.");
if (!teamForm.signature.trim()) throw new Error("Type your full legal name as signature.");
if (!teamForm.agreeWaiver || !teamForm.agreeCaptainDuty || !teamForm.agreeElectronic) throw new Error("You must accept all waiver/captain/electronic signature requirements.");
const payload = { team_name: teamForm.teamName.trim(), captain_name: teamForm.captainName.trim(), captain_email: teamForm.captainEmail.trim(), captain_phone: teamForm.captainPhone.trim(), payment_tier: registrationLeague === "softball" ? pricing.tier : "kickball", paid_status: "Pending", signature_name: teamForm.signature.trim(), agree_waiver: teamForm.agreeWaiver, agree_captain_duty: teamForm.agreeCaptainDuty, agree_electronic: teamForm.agreeElectronic, invite_token: makeInviteToken(), league_type: registrationLeague };
const { data, error } = await withTimeout(supabase.from("teams").insert([payload]).select().single(), 15000);
if (error) throw new Error(error.message || JSON.stringify(error)); await loadData(); return data;
}

async function saveFreeAgentRegistration() {
if (!freeAgentForm.playerName.trim()) throw new Error("Enter your full name.");
if (!freeAgentForm.playerEmail.trim()) throw new Error("Enter your email.");
if (!freeAgentForm.gender) throw new Error("Select a gender.");
if (!freeAgentForm.signature.trim()) throw new Error("Type your full legal name as signature.");
if (!freeAgentForm.agreeWaiver || !freeAgentForm.agreeElectronic) throw new Error("You must accept waiver and electronic signature.");
const payload = { player_name: freeAgentForm.playerName.trim(), player_email: freeAgentForm.playerEmail.trim(), player_phone: freeAgentForm.playerPhone.trim(), gender: freeAgentForm.gender, skill: freeAgentForm.skill, preferred_position: freeAgentForm.preferredPosition.trim(), paid_status: "Pending", signature_name: freeAgentForm.signature.trim(), agree_waiver: freeAgentForm.agreeWaiver, agree_electronic: freeAgentForm.agreeElectronic, assigned_team_id: null, league_type: registrationLeague };
const { data, error } = await withTimeout(supabase.from("free_agents").insert([payload]).select().single(), 15000);
if (error) throw new Error(error.message || JSON.stringify(error)); await loadData(); return data;
}

async function handleTeamSaveOnly(e) { e.preventDefault(); if (savingTeam || startingCheckout) return; setSavingTeam(true); try { await saveTeamRegistration(); setTeamForm(initialTeamForm); alert(`${activeRegistrationLeague.name} team registration saved.`); } catch (err) { alert(err.message || String(err)); } finally { setSavingTeam(false); } }
async function handleTeamCheckout(e) {
e.preventDefault(); if (savingTeam || startingCheckout) return; setStartingCheckout(true);
try {
const savedTeam = await saveTeamRegistration();
if (registrationLeague === "kickball") { alert("Kickball team registration saved. Use admin/payment collection until team checkout is enabled."); setTeamForm(initialTeamForm); return; }
const response = await withTimeout(fetch("/api/create-team-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId: savedTeam.id, teamName: savedTeam.team_name, captainName: savedTeam.captain_name, captainEmail: savedTeam.captain_email }) }), 15000);
const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to start Stripe checkout."); window.location.href = result.url;
} catch (err) { alert(err.message || String(err)); } finally { setStartingCheckout(false); }
}
async function handleFreeAgentSubmit(e) { e.preventDefault(); if (savingFreeAgent || startingFreeAgentCheckout) return; setSavingFreeAgent(true); try { await saveFreeAgentRegistration(); setFreeAgentForm(initialFreeAgentForm); alert(`${activeRegistrationLeague.name} free agent registration saved.`); } catch (err) { alert(err.message || String(err)); } finally { setSavingFreeAgent(false); } }
async function handleCaptainCheckout() {
try {
if (registrationLeague !== "kickball") {
throw new Error("Captain player payment is only for kickball.");
}

if (!teamForm.teamName.trim()) throw new Error("Enter team name.");
if (!teamForm.captainName.trim()) throw new Error("Enter captain name.");
if (!teamForm.captainEmail.trim()) throw new Error("Enter captain email.");

const savedTeam = await saveTeamRegistration();

const response = await withTimeout(
fetch("/api/create-kickball-player-checkout", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
teamId: savedTeam.id,
teamName: savedTeam.team_name,
playerName: savedTeam.captain_name,
playerEmail: savedTeam.captain_email,
leagueType: "kickball",
amountCents: kickballPricing.amountCents,
paymentType: "kickball_captain",
}),
}),
15000
);

const result = await response.json();

if (!response.ok) {
throw new Error(result.error || "Unable to start captain payment.");
}

if (!result.url) {
throw new Error("Stripe checkout did not return a payment link.");
}

window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
}
}

async function handleFreeAgentCheckout(e) {
e.preventDefault();

if (savingFreeAgent || startingFreeAgentCheckout) return;

setStartingFreeAgentCheckout(true);

try {
const saved = await saveFreeAgentRegistration();

const endpoint =
registrationLeague === "kickball"
? "/api/create-kickball-player-checkout"
: "/api/create-free-agent-checkout";

const body =
registrationLeague === "kickball"
? {
freeAgentId: saved.id,
playerName: saved.player_name,
playerEmail: saved.player_email,
leagueType: "kickball",
amountCents: kickballPricing.amountCents,
paymentType: "kickball_free_agent",
}
: {
freeAgentId: saved.id,
playerName: saved.player_name,
playerEmail: saved.player_email,
leagueType: registrationLeague,
paymentType: "softball_free_agent",
};

const response = await withTimeout(
fetch(endpoint, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
}),
15000
);

const result = await response.json();

if (!response.ok) {
throw new Error(result.error || "Unable to start free agent checkout.");
}

if (!result.url) {
throw new Error("Stripe checkout did not return a payment link.");
}

window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setStartingFreeAgentCheckout(false);
}
}

async function handleFindSavedTeam(e) { e.preventDefault(); try { if (!lookupEmail.trim()) throw new Error("Enter captain email."); setLookupLoading(true); setFoundTeam(null); let query = supabase.from("teams").select("*").eq("captain_email", lookupEmail.trim()).eq("league_type", registrationLeague).order("created_at", { ascending: false }); if (lookupTeamName.trim()) query = query.ilike("team_name", lookupTeamName.trim()); const { data, error } = await withTimeout(query, 15000); if (error) throw new Error(error.message); if (!data?.length) throw new Error("No saved team was found."); setFoundTeam(mapTeamRow(data[0])); } catch (err) { alert(err.message || String(err)); } finally { setLookupLoading(false); } }
async function handleResumeTeamCheckout() { try { if (!foundTeam) throw new Error("No saved team selected."); if (foundTeam.paidStatus === "Paid") throw new Error("This team is already paid."); if (registrationLeague === "kickball") throw new Error("Kickball team checkout is not enabled yet."); setResumeCheckoutLoading(true); const response = await withTimeout(fetch("/api/create-team-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamId: foundTeam.id, teamName: foundTeam.teamName, captainName: foundTeam.captainName, captainEmail: foundTeam.captainEmail }) }), 15000); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Unable to start Stripe checkout."); window.location.href = result.url; } catch (err) { alert(err.message || String(err)); } finally { setResumeCheckoutLoading(false); } }
async function handleFindSavedFreeAgent(e) { e.preventDefault(); try { if (!freeAgentLookupEmail.trim()) throw new Error("Enter free agent email."); setFreeAgentLookupLoading(true); setFoundFreeAgent(null); let query = supabase.from("free_agents").select("*").eq("player_email", freeAgentLookupEmail.trim()).eq("league_type", registrationLeague).order("created_at", { ascending: false }); if (freeAgentLookupName.trim()) query = query.ilike("player_name", freeAgentLookupName.trim()); const { data, error } = await withTimeout(query, 15000); if (error) throw new Error(error.message); if (!data?.length) throw new Error("No saved free agent registration was found."); setFoundFreeAgent(mapFreeAgentRow(data[0])); } catch (err) { alert(err.message || String(err)); } finally { setFreeAgentLookupLoading(false); } }
async function handleResumeFreeAgentCheckout() {
try {
if (!foundFreeAgent) throw new Error("No saved free agent selected.");
if (foundFreeAgent.paidStatus === "Paid") throw new Error("This free agent is already paid.");

setResumeFreeAgentCheckoutLoading(true);

const isKickball = foundFreeAgent.leagueType === "kickball" || registrationLeague === "kickball";

const endpoint = isKickball
? "/api/create-kickball-player-checkout"
: "/api/create-free-agent-checkout";

const body = isKickball
? {
freeAgentId: foundFreeAgent.id,
playerName: foundFreeAgent.playerName,
playerEmail: foundFreeAgent.playerEmail,
leagueType: "kickball",
amountCents: kickballPricing.amountCents,
paymentType: "kickball_free_agent",
}
: {
freeAgentId: foundFreeAgent.id,
playerName: foundFreeAgent.playerName,
playerEmail: foundFreeAgent.playerEmail,
leagueType: registrationLeague,
paymentType: "softball_free_agent"};

const response = await withTimeout(
fetch(endpoint, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
}),
15000
);

const result = await response.json();

if (!response.ok) {
throw new Error(result.error || "Unable to start free agent checkout.");
}

if (!result.url) {
throw new Error("Stripe checkout did not return a payment link.");
}

window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setResumeFreeAgentCheckoutLoading(false);
}
}

async function handleFindRosterTeam(e) { e.preventDefault(); try { if (!rosterTeamEmail.trim()) throw new Error("Enter captain email."); setRosterLookupLoading(true); setRosterTeam(null); let query = supabase.from("teams").select("*").eq("captain_email", rosterTeamEmail.trim()).eq("league_type", registrationLeague).order("created_at", { ascending: false }); if (rosterTeamName.trim()) query = query.ilike("team_name", rosterTeamName.trim()); const { data, error } = await withTimeout(query, 15000); if (error) throw new Error(error.message); if (!data?.length) throw new Error("No team found."); setRosterTeam(mapTeamRow(data[0])); } catch (err) { alert(err.message || String(err)); } finally { setRosterLookupLoading(false); } }
async function handleAddRosterPlayer(e) { e.preventDefault(); try { if (!rosterTeam) throw new Error("Find your team first."); if (!rosterForm.playerName.trim()) throw new Error("Enter player name."); setAddingRosterPlayer(true); const { error } = await withTimeout(supabase.from("team_players").insert([{ team_id: rosterTeam.id, player_name: rosterForm.playerName.trim(), player_email: rosterForm.playerEmail.trim(), player_phone: rosterForm.playerPhone.trim(), signed_waiver: false, league_type: rosterTeam.leagueType || registrationLeague }]), 15000); if (error) throw new Error(error.message); setRosterForm(initialRosterForm); await loadData(); alert("Player added to roster."); } catch (err) { alert(err.message || String(err)); } finally { setAddingRosterPlayer(false); } }
async function handleLookupWaiverTeam(e) { e.preventDefault(); try { if (!waiverToken.trim()) throw new Error("Enter team waiver token."); setWaiverLookupLoading(true); setWaiverTeam(null); const { data, error } = await withTimeout(supabase.from("teams").select("*").eq("invite_token", waiverToken.trim()).single(), 15000); if (error) throw new Error(error.message); setWaiverTeam(mapTeamRow(data)); } catch (err) { alert(err.message || String(err)); } finally { setWaiverLookupLoading(false); } }
async function handleSubmitPlayerWaiver(e) { e.preventDefault(); try { if (!waiverTeam) throw new Error("Find a team first."); if (!waiverPlayerId) throw new Error("Select your name."); if (!waiverSignature.trim()) throw new Error("Type your full legal name."); if (!waiverAgree) throw new Error("You must agree to the waiver."); setWaiverSubmitting(true); const { error } = await withTimeout(supabase.from("team_players").update({ signed_waiver: true, signature_name: waiverSignature.trim(), signed_at: new Date().toISOString() }).eq("id", waiverPlayerId), 15000); if (error) throw new Error(error.message); setWaiverPlayerId(""); setWaiverSignature(""); setWaiverAgree(false); await loadData(); alert("Waiver signed successfully."); } catch (err) { alert(err.message || String(err)); } finally { setWaiverSubmitting(false); } }
async function handleKickballPlayerWaiverCheckout() {
try {
if (!waiverTeam) throw new Error("Find a team first.");

if (waiverTeam.leagueType !== "kickball") {
throw new Error("This payment option is for kickball players only.");
}

if (!waiverPlayerId) throw new Error("Select your name.");
if (!waiverSignature.trim()) throw new Error("Type your full legal name.");
if (!waiverAgree) throw new Error("You must agree to the waiver before paying.");

const player = waiverPlayersForTeam.find((p) => p.id === waiverPlayerId);
if (!player) throw new Error("Selected player was not found.");

setWaiverCheckoutLoading(true);

const { error: waiverError } = await withTimeout(
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

if (waiverError) {
throw new Error(waiverError.message || JSON.stringify(waiverError));
}

const response = await withTimeout(
fetch("/api/create-kickball-player-checkout", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
teamPlayerId: player.id,
playerName: player.playerName,
playerEmail: player.playerEmail,
teamId: waiverTeam.id,
teamName: waiverTeam.teamName,
leagueType: "kickball",
amountCents: kickballPricing.amountCents,
paymentType: "kickball_roster_player",
}),
}),
15000
);

const result = await response.json();

if (!response.ok) {
throw new Error(result.error || "Unable to start kickball player checkout.");
}

if (!result.url) {
throw new Error("Stripe checkout did not return a payment link.");
}

window.location.href = result.url;
} catch (err) {
alert(err.message || String(err));
} finally {
setWaiverCheckoutLoading(false);
}
}

async function handleAdminLogin(e) { e.preventDefault(); try { if (!loginEmail.trim()) throw new Error("Enter admin email."); if (!loginPassword.trim()) throw new Error("Enter password."); const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword }); if (error) throw new Error(error.message); if (data.user.email !== ADMIN_EMAIL) { await supabase.auth.signOut(); throw new Error("This account is not authorized for admin access."); } setUser(data.user); setLoginEmail(""); setLoginPassword(""); alert("Admin login successful."); } catch (err) { alert(err.message || String(err)); } }
async function handleLogout() { await supabase.auth.signOut(); }

async function buildSchedule() { try { const eligibleTeams = adminTeams.filter((team) => team.paidStatus === "Paid"); if (eligibleTeams.length < 2) throw new Error(`You need at least 2 paid ${activeAdminLeague.name} teams to generate a schedule.`); const generated = generateRoundRobinSchedule(eligibleTeams); await withTimeout(supabase.from("schedule_games").delete().eq("league_type", adminLeague).neq("id", "00000000-0000-0000-0000-000000000000"), 15000); const rows = generated.map((g) => ({ week: g.week, home_team_id: g.homeTeamId, away_team_id: g.awayTeamId, game_date: g.date, game_time: g.time, field: activeAdminLeague.location, status: g.status, home_score: null, away_score: null, league_type: adminLeague })); if (rows.length) { const { error } = await withTimeout(supabase.from("schedule_games").insert(rows), 15000); if (error) throw new Error(error.message); } await loadData(); alert(`${activeAdminLeague.name} schedule generated using paid teams only.`); } catch (err) { alert(err.message || String(err)); } }

async function assignFreeAgentPool({ forceNewTeam = false }) {
const paidUnassigned = adminFreeAgents.filter((p) => p.paidStatus === "Paid" && !p.assignedTeamId);
if (paidUnassigned.length < FREE_AGENT_TEAM_MIN) throw new Error(`You need at least ${FREE_AGENT_TEAM_MIN} paid unassigned ${activeAdminLeague.name} free agents to form a team.`);
const females = paidUnassigned.filter((p) => (p.gender || "").toLowerCase() === "female");
if (females.length < FREE_AGENT_TEAM_MIN_FEMALES) throw new Error(`You need at least ${FREE_AGENT_TEAM_MIN_FEMALES} paid female free agents.`);
const existing = getFreeAgentTeams(); let targetTeam = null;
if (!forceNewTeam) targetTeam = existing.find((team) => freeAgents.filter((p) => p.assignedTeamId === team.id).length < FREE_AGENT_TEAM_MAX);
if (!targetTeam) {
const fallbackCaptain = females[0] || paidUnassigned[0];
const { data, error } = await supabase.from("teams").insert([{ team_name: `${activeAdminLeague.name} ${FREE_AGENT_TEAM_PREFIX} ${existing.length + 1}`, captain_name: fallbackCaptain?.playerName || "Desert Rec Sports League", captain_email: fallbackCaptain?.playerEmail || ADMIN_EMAIL, captain_phone: fallbackCaptain?.playerPhone || "", payment_tier: "admin", paid_status: "Paid", signature_name: "Desert Rec Sports League", agree_waiver: true, agree_captain_duty: true, agree_electronic: true, invite_token: makeInviteToken(), league_type: adminLeague }]).select().single();
if (error) throw new Error(error.message); targetTeam = mapTeamRow(data);
}
const roomLeft = Math.max(FREE_AGENT_TEAM_MAX - freeAgents.filter((p) => p.assignedTeamId === targetTeam.id).length, 0);
const selectedFemales = females.slice(0, Math.min(FREE_AGENT_TEAM_MIN_FEMALES, roomLeft));
const selectedIds = new Set(selectedFemales.map((p) => p.id));
const selectedPlayers = [...selectedFemales, ...paidUnassigned.filter((p) => !selectedIds.has(p.id)).slice(0, roomLeft - selectedFemales.length)].slice(0, roomLeft);
if (selectedPlayers.length < FREE_AGENT_TEAM_MIN) throw new Error(`Not enough eligible players to form ${targetTeam.teamName}.`);
const { error: assignError } = await supabase.from("free_agents").update({ assigned_team_id: targetTeam.id }).in("id", selectedPlayers.map((p) => p.id));
if (assignError) throw new Error(assignError.message);
const captain = selectedPlayers.find((p) => (p.gender || "").toLowerCase() === "female") || selectedPlayers[0];
if (captain) { const { error } = await supabase.from("teams").update({ captain_name: captain.playerName, captain_email: captain.playerEmail, captain_phone: captain.playerPhone || "" }).eq("id", targetTeam.id); if (error) throw new Error(error.message); }
await loadData(); return { teamName: targetTeam.teamName, count: selectedPlayers.length };
}
async function assignPaidFreeAgentsToTeam() { try { setAssigningFreeAgents(true); const result = await assignFreeAgentPool({ forceNewTeam: false }); alert(`${result.count} paid free agents assigned to ${result.teamName}.`); } catch (err) { alert(err.message || String(err)); } finally { setAssigningFreeAgents(false); } }
async function handleCreateNewFreeAgentTeam() { try { setCreatingNewFreeAgentTeam(true); const result = await assignFreeAgentPool({ forceNewTeam: true }); alert(`${result.teamName} created with ${result.count} players.`); } catch (err) { alert(err.message || String(err)); } finally { setCreatingNewFreeAgentTeam(false); } }
async function handleMoveFreeAgent(playerId) { try { const targetTeamId = moveSelections[playerId] ?? ""; setMovingFreeAgentId(playerId); const { error } = await supabase.from("free_agents").update({ assigned_team_id: targetTeamId === "" ? null : targetTeamId }).eq("id", playerId); if (error) throw new Error(error.message); await loadData(); alert("Free agent assignment updated."); } catch (err) { alert(err.message || String(err)); } finally { setMovingFreeAgentId(""); } }
async function handleSetCaptain() { try { if (!settingCaptainTeamId) throw new Error("Select a team."); if (!settingCaptainPlayerId) throw new Error("Select a player."); const player = freeAgents.find((p) => p.id === settingCaptainPlayerId); if (!player) throw new Error("Selected player not found."); setSettingCaptainLoading(true); const { error } = await supabase.from("teams").update({ captain_name: player.playerName, captain_email: player.playerEmail, captain_phone: player.playerPhone || "" }).eq("id", settingCaptainTeamId); if (error) throw new Error(error.message); await loadData(); alert("Captain updated."); } catch (err) { alert(err.message || String(err)); } finally { setSettingCaptainLoading(false); } }

function getScheduleInput(gameId, field, fallback = "") { return scheduleForm[gameId]?.[field] ?? fallback; }
function handleScheduleInputChange(gameId, field, value) { setScheduleForm((prev) => ({ ...prev, [gameId]: { ...(prev[gameId] || {}), [field]: value } })); }
async function saveScheduleGame(gameId) { try { const v = scheduleForm[gameId]; if (!v) throw new Error("No schedule values found."); setSavingScheduleGameId(gameId); const { error } = await supabase.from("schedule_games").update({ week: Number(v.week) || 1, game_date: v.date || "", game_time: v.time || "", field: v.field || activeAdminLeague.location, status: v.status || "Scheduled", home_team_id: v.homeTeamId || null, away_team_id: v.awayTeamId || null, home_score: safeNumber(v.homeScore), away_score: safeNumber(v.awayScore), league_type: adminLeague }).eq("id", gameId); if (error) throw new Error(error.message); await loadData(); alert("Game updated."); } catch (err) { alert(err.message || String(err)); } finally { setSavingScheduleGameId(""); } }
async function savePlayerStat(e) { e.preventDefault(); try { if (!statForm.playerName.trim()) throw new Error("Enter player name."); if (!statForm.teamId) throw new Error("Select a team."); setSavingStat(true); const payload = { player_name: statForm.playerName.trim(), team_id: statForm.teamId, games_played: Number(statForm.gamesPlayed) || 0, hits: Number(statForm.hits) || 0, home_runs: Number(statForm.homeRuns) || 0, rbis: Number(statForm.rbis) || 0, runs: Number(statForm.runs) || 0, updated_at: new Date().toISOString(), league_type: adminLeague }; const existing = playerStats.find((p) => p.leagueType === adminLeague && p.teamId === statForm.teamId && p.playerName.toLowerCase() === statForm.playerName.trim().toLowerCase()); const { error } = existing ? await supabase.from("player_stats").update(payload).eq("id", existing.id) : await supabase.from("player_stats").insert([payload]); if (error) throw new Error(error.message); setStatForm(initialStatForm); await loadData(); alert("Player stats saved."); } catch (err) { alert(err.message || String(err)); } finally { setSavingStat(false); } }

function generateBracketFromStandings(leagueType) { const seeds = computeStandings(teams.filter((t) => t.leagueType === leagueType), schedule.filter((g) => g.leagueType === leagueType)).slice(0, 8); if (seeds.length < 2) return []; const mk = (roundName, gameOrder, a, b) => ({ roundName, gameOrder, seedHome: a.seed, seedAway: b.seed, homeTeamId: a.teamId, awayTeamId: b.teamId, status: "Scheduled", homeScore: "", awayScore: "", winnerTeamId: null, leagueType }); if (seeds.length >= 8) return [mk("Quarterfinal", 1, seeds[0], seeds[7]), mk("Quarterfinal", 2, seeds[3], seeds[4]), mk("Quarterfinal", 3, seeds[1], seeds[6]), mk("Quarterfinal", 4, seeds[2], seeds[5])]; if (seeds.length >= 4) return [mk("Semifinal", 1, seeds[0], seeds[3]), mk("Semifinal", 2, seeds[1], seeds[2])]; return [mk("Championship", 1, seeds[0], seeds[1])]; }
async function generatePlayoffBracket() { try { const generated = generateBracketFromStandings(adminLeague); if (!generated.length) throw new Error(`Not enough ${activeAdminLeague.name} teams to generate a playoff bracket.`); await optionalQuery(supabase.from("playoff_games").delete().eq("league_type", adminLeague).neq("id", "00000000-0000-0000-0000-000000000000")); const { error } = await supabase.from("playoff_games").insert(generated.map((g) => ({ round_name: g.roundName, seed_home: g.seedHome, seed_away: g.seedAway, home_team_id: g.homeTeamId, away_team_id: g.awayTeamId, game_order: g.gameOrder, home_score: null, away_score: null, winner_team_id: null, status: g.status, league_type: adminLeague }))); if (error) throw new Error(error.message); await loadData(); alert(`${activeAdminLeague.name} playoff bracket generated.`); } catch (err) { alert(err.message || String(err)); } }
async function savePlayoffGame(gameId, values) { try { setSavingPlayoffGameId(gameId); const hs = safeNumber(values.homeScore); const as = safeNumber(values.awayScore); let winnerTeamId = null; if (hs !== null && as !== null) { if (hs > as) winnerTeamId = values.homeTeamId || null; if (as > hs) winnerTeamId = values.awayTeamId || null; } const { error } = await supabase.from("playoff_games").update({ home_team_id: values.homeTeamId || null, away_team_id: values.awayTeamId || null, home_score: hs, away_score: as, winner_team_id: winnerTeamId, status: values.status || "Scheduled", updated_at: new Date().toISOString(), league_type: adminLeague }).eq("id", gameId); if (error) throw new Error(error.message); await loadData(); alert("Playoff game updated."); } catch (err) { alert(err.message || String(err)); } finally { setSavingPlayoffGameId(""); } }

function getScheduleWithNames(leagueType) { return schedule.filter((g) => g.leagueType === leagueType).map((g) => ({ ...g, homeTeamName: teamNameById(g.homeTeamId), awayTeamName: teamNameById(g.awayTeamId) })); }
function openRegistrationForLeague(leagueType) { setRegistrationLeague(leagueType); setFoundTeam(null); setFoundFreeAgent(null); setRosterTeam(null); setTeamForm(initialTeamForm); setFreeAgentForm(initialFreeAgentForm); setPage("register"); }

const softballStandings = computeStandings(teams.filter((t) => t.leagueType === "softball"), schedule.filter((g) => g.leagueType === "softball"));
const kickballStandings = computeStandings(teams.filter((t) => t.leagueType === "kickball"), schedule.filter((g) => g.leagueType === "kickball"));
const standings = computeStandings(adminTeams, adminSchedule);
const softballScheduleWithNames = getScheduleWithNames("softball");
const kickballScheduleWithNames = getScheduleWithNames("kickball");
const adminScheduleWithNames = getScheduleWithNames(adminLeague);
const softballBracket = playoffGames.filter((g) => g.leagueType === "softball").length ? playoffGames.filter((g) => g.leagueType === "softball") : generateBracketFromStandings("softball");
const kickballBracket = playoffGames.filter((g) => g.leagueType === "kickball").length ? playoffGames.filter((g) => g.leagueType === "kickball") : generateBracketFromStandings("kickball");
const adminPlayoffGamesToShow = adminPlayoffGames.length ? adminPlayoffGames : generateBracketFromStandings(adminLeague);
const leaderboard = [...adminPlayerStats].sort((a, b) => b.hits - a.hits || b.homeRuns - a.homeRuns || b.rbis - a.rbis || b.runs - a.runs || a.playerName.localeCompare(b.playerName));
const waiverPlayersForTeam = waiverTeam ? getPlayersForTeam(waiverTeam.id) : [];
const selectedCaptainCandidates = settingCaptainTeamId ? getAssignedFreeAgentsForTeam(settingCaptainTeamId) : [];

function RulesCards({ sections }) { return <div className="grid2">{sections.map((section) => <div className="card" key={section.title}><h3>{section.title}</h3><ul>{section.body.map((item, idx) => <li key={idx}>{item}</li>)}</ul></div>)}</div>; }
function ScheduleTable({ games }) { return <div className="card">{games.length === 0 ? <p>No schedule created yet.</p> : <table><thead><tr><th>Week</th><th>Matchup</th><th>Date</th><th>Time</th><th>Field</th><th>Score</th><th>Status</th></tr></thead><tbody>{games.map((game) => <tr key={game.id}><td>{game.week}</td><td>{game.awayTeamName} at {game.homeTeamName}</td><td>{game.date || "TBD"}</td><td>{game.time || "TBD"}</td><td>{game.field}</td><td>{game.homeScore !== "" && game.awayScore !== "" ? `${game.awayScore} - ${game.homeScore}` : "TBD"}</td><td>{game.status}</td></tr>)}</tbody></table>}</div>; }
function StandingsTable({ list }) { return <div className="card">{list.length === 0 ? <p>No standings available yet.</p> : <table><thead><tr><th>Seed</th><th>Team</th><th>GP</th><th>W</th><th>L</th><th>T</th><th>RF</th><th>RA</th><th>Diff</th></tr></thead><tbody>{list.map((team) => <tr key={team.teamId}><td>{team.seed}</td><td>{team.teamName}</td><td>{team.gamesPlayed}</td><td>{team.wins}</td><td>{team.losses}</td><td>{team.ties}</td><td>{team.runsFor}</td><td>{team.runsAgainst}</td><td>{team.differential}</td></tr>)}</tbody></table>}</div>; }
function PlayoffTable({ games }) { return <div className="card">{games.length === 0 ? <p>No playoff bracket available yet.</p> : <table><thead><tr><th>Round</th><th>Game</th><th>Matchup</th><th>Score</th><th>Winner</th></tr></thead><tbody>{games.map((game, idx) => <tr key={game.id || idx}><td>{game.roundName}</td><td>{game.gameOrder}</td><td>{teamNameById(game.awayTeamId)} at {teamNameById(game.homeTeamId)}</td><td>{game.homeScore !== "" && game.awayScore !== "" ? `${game.awayScore} - ${game.homeScore}` : "TBD"}</td><td>{game.winnerTeamId ? teamNameById(game.winnerTeamId) : "TBD"}</td></tr>)}</tbody></table>}</div>; }
function LeaderboardTable({ list }) { return <div className="card">{list.length === 0 ? <p>No player stats available yet.</p> : <table><thead><tr><th>Rank</th><th>Player</th><th>Team</th><th>GP</th><th>H</th><th>HR</th><th>RBI</th><th>R</th></tr></thead><tbody>{list.map((p, idx) => <tr key={p.id}><td>{idx + 1}</td><td>{p.playerName}</td><td>{teamNameById(p.teamId)}</td><td>{p.gamesPlayed}</td><td>{p.hits}</td><td>{p.homeRuns}</td><td>{p.rbis}</td><td>{p.runs}</td></tr>)}</tbody></table>}</div>; }

return (
<div>
<style>{`
* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, Arial, sans-serif; background: #f4efe9; color: #1f1a17; }
.nav { display: flex; gap: 10px; padding: 16px 24px; background: #111; flex-wrap: wrap; }
.nav button { background: transparent; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 10px 14px; border-radius: 10px; cursor: pointer; }
.page { max-width: 1180px; margin: 0 auto; padding: 32px 20px; }
.hero { min-height: 72vh; color: white; background: linear-gradient(rgba(18,12,8,.60), rgba(18,12,8,.72)), url(${heroImage}) center/cover no-repeat; border-radius: 0 0 24px 24px; display: grid; grid-template-columns: 1.2fr .9fr; gap: 28px; align-items: center; padding: 48px 32px; }
.hero h1 { font-size: clamp(42px, 6vw, 72px); line-height: .98; margin: 0 0 16px; color: white; }
.hero p { font-size: 18px; line-height: 1.7; max-width: 720px; margin: 0 0 16px; color: rgba(255,255,255,.92); }
.hero-card, .sponsor-card { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.16); border-radius: 22px; padding: 24px; backdrop-filter: blur(6px); }
.hero-card h3, .sponsor-card h3 { margin: 0 0 16px; color: white; font-size: 28px; }
.hero-list { display: grid; gap: 10px; }
.hero-list-item { background: rgba(255,255,255,.10); border-radius: 12px; padding: 12px 14px; color: white; font-weight: 700; }
.hero-actions, .row, .league-switch { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.brand-wrap { display: flex; align-items: center; gap: 18px; margin-bottom: 18px; flex-wrap: wrap; }
.brand-logo { width: 110px; height: 110px; border-radius: 18px; object-fit: contain; background: rgba(255,255,255,.14); padding: 10px; border: 1px solid rgba(255,255,255,.16); }
.brand-kicker { font-size: 14px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.86); }
.sponsor-card { margin-top: 20px; }
.sponsor-card p, .sponsor-card li { color: rgba(255,255,255,.94); line-height: 1.7; }
.promo-section { margin-top: 28px; }
.promo-grid, .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.card, .promo-card { background: white; border-radius: 18px; padding: 20px; box-shadow: 0 10px 24px rgba(0,0,0,.08); margin-bottom: 20px; }
.form { display: grid; gap: 12px; }
input, select, textarea, button { font: inherit; }
input, select, textarea { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1px solid #d6d1c7; background: white; color: #1f1a17; }
button { padding: 12px 16px; border-radius: 12px; border: 1px solid #d6d1c7; background: white; color: #1f1a17; cursor: pointer; }
.primary { background: #f59e0b; border-color: #f59e0b; color: #111; font-weight: 700; }
.pill, .promo-tag { display: inline-block; background: rgba(255,247,234,.95); border: 1px solid #f0dbb8; border-radius: 999px; padding: 8px 12px; font-weight: 700; margin-right: 8px; margin-bottom: 8px; color: #4a3420; }
.section-title { margin: 0 0 8px; font-size: 34px; }
.section-subtitle { margin: 0 0 20px; color: #5e554d; line-height: 1.7; }
.waiverPre { white-space: pre-wrap; margin: 0; font-family: inherit; line-height: 1.7; }
table { width: 100%; border-collapse: collapse; }
th, td { text-align: left; padding: 10px; border-bottom: 1px solid #ece4d8; vertical-align: top; }
ul { margin: 0; padding-left: 20px; } li { margin-bottom: 8px; }
.stat { font-size: 28px; font-weight: 800; margin-top: 8px; }
.mini-input { min-width: 72px; }
.league-switch { margin-bottom: 20px; }
.league-switch button.active { background: #111; color: white; }
@media (max-width: 980px) { .hero, .promo-grid, .grid2, .grid3 { grid-template-columns: 1fr; } .hero { min-height: auto; } }
`}</style>

<div className="nav"><button onClick={() => setPage("home")}>Home</button><button onClick={() => setPage("kickball")}>Kickball</button><button onClick={() => openRegistrationForLeague("softball")}>Softball Register</button><button onClick={() => openRegistrationForLeague("kickball")}>Kickball Register</button><button onClick={() => setPage("rules")}>Rules</button><button onClick={() => setPage("schedule")}>Schedule</button><button onClick={() => setPage("standings")}>Standings</button><button onClick={() => setPage("playoffs")}>Playoffs</button><button onClick={() => setPage("leaderboard")}>Leaderboard</button><button onClick={() => setPage("waiver")}>Waiver</button><button onClick={() => setPage("admin")}>Admin</button></div>
{paymentNotice && (
<div className="page" style={{ paddingTop: 16, paddingBottom: 0 }}>
<div className="card" style={{ border: "2px solid #86efac", background: "#f0fdf4" }}>
<strong>{paymentNotice}</strong>
</div>
</div>
)}

{page === "home" && <div className="page"><div className="hero"><div><div className="brand-wrap"><img src={logoImage} alt="Desert Rec Sports League logo" className="brand-logo" onError={(e) => { e.currentTarget.style.display = "none"; }} /><div><div className="brand-kicker">West Valley Adult Recreation</div><div className="pill">Thursday Night Coed Softball</div></div></div><h1>Desert Rec Sports League</h1><p>Join the upcoming Thursday night league at Sundance Park in Buckeye. An 8-week season, social atmosphere, competitive games, and a fun adult rec environment built for the West Valley.</p><p>Register your team now or sign up as a free agent and we will help place you on a team.</p><div><span className="pill">{pricing.label} Softball Team Pricing: ${pricing.price}</span><span className="pill">Softball Free Agents: $60</span><span className="pill">Kickball: $60 early / $65 regular</span></div><div className="hero-actions"><button className="primary" onClick={() => openRegistrationForLeague("softball")}>Register Softball</button><button className="primary" onClick={() => openRegistrationForLeague("kickball")}>Register Kickball</button></div><div className="sponsor-card"><h3>Official League Sponsor: Tailgaters</h3><p>Join us every Thursday (Game Day) and enjoy:<br /><strong>10% OFF all full-priced food & drinks</strong></p><p>Just let your server know youâ€™re with the Desert Rec Sports League to score the deal!</p><ul><li>Valid on Thursdays only (game days)</li><li>Must mention Desert Rec Sports League</li><li>Not valid with any other offers or discounts</li></ul></div></div><div className="hero-card"><h3>Upcoming Seasons</h3><div className="hero-list"><div className="hero-list-item">Softball: Thursday Nights</div><div className="hero-list-item">Kickball: Sunday Evenings</div><div className="hero-list-item">Location: Sundance Park</div><div className="hero-list-item">City: Buckeye, Arizona</div><div className="hero-list-item">Fun + Social + Competitive</div></div></div></div><div className="promo-section"><div className="promo-grid"><div className="promo-card"><h3>Kickball League Is Launching</h3><p>Desert Rec Sports League is officially launching an upcoming coed kickball league in the West Valley. Bring a full team or register as a free agent and we will help place you.</p><span className="promo-tag">Sunday Evenings</span><span className="promo-tag">Coed</span><span className="promo-tag">Social + Competitive</span><p style={{ marginTop: 12 }}>Kickball has no team fee, but every player pays individually: captains, free agents, and roster players.</p><button className="primary" onClick={() => openRegistrationForLeague("kickball")}>Register for Kickball</button></div><div className="promo-card"><h3>Built for the West Valley</h3><p>From softball to kickball, Desert Rec Sports League is focused on creating organized, affordable, and community-driven adult leagues in Buckeye and nearby West Valley cities.</p><span className="promo-tag">Buckeye</span><span className="promo-tag">Goodyear</span><span className="promo-tag">West Valley</span></div></div></div></div>}

{page === "kickball" && <div className="page"><h2 className="section-title">Coed Kickball League</h2><p className="section-subtitle">Desert Rec Sports League kickball is built to be fun, social, and competitive. Bring a team or sign up as a free agent and we will help place you on a team.</p><div className="grid2"><div className="card"><h3>Kickball League Info</h3><ul><li>Format: Adult coed recreational kickball</li><li>Location: Sundance Park in Buckeye</li><li>League Night: Sunday evenings</li><li>Roster Target: 6 men / 4 women</li><li>Free Agent Early Registration: $60/person</li><li>Regular Registration: $65/person</li><li>Teams and free agents welcome</li></ul><div className="row" style={{ marginTop: 14 }}><button className="primary" onClick={() => openRegistrationForLeague("kickball")}>Register for Kickball</button><button onClick={() => setPage("kickballRules")}>View Kickball Rules</button></div></div><div className="card"><h3>Kickball Schedule Preview</h3><p>Schedule will be posted once enough teams and free agents are registered. Admin can generate and manage the kickball schedule separately from softball.</p><button onClick={() => setPage("kickballSchedule")}>View Kickball Schedule</button></div></div><div className="card"><h3>Kickball Waiver</h3><p>Kickball uses the same Desert Rec Sports League waiver as softball. All rostered players and substitutes must sign before playing.</p><button onClick={() => setPage("waiver")}>View Waiver</button></div></div>}

{page === "register" && <div className="page"><h2 className="section-title">{activeRegistrationLeague.name} Registration</h2><p className="section-subtitle">Secure your spot for the {activeRegistrationLeague.title} at {activeRegistrationLeague.location}.</p><div className="league-switch"><button className={registrationLeague === "softball" ? "active" : ""} onClick={() => setRegistrationLeague("softball")}>Softball Registration</button><button className={registrationLeague === "kickball" ? "active" : ""} onClick={() => setRegistrationLeague("kickball")}>Kickball Registration</button></div><div className="card">{registrationLeague === "softball" ? <><strong>{pricing.label} softball team price: ${pricing.price}</strong><div>{pricing.message}</div><div>Softball free agent registration: $60</div></> : <><strong>Kickball Registration</strong><div>Free Agent Early Registration: $60/person</div><div>Regular Registration: $65/person</div><div>Bring a team or sign up as a free agent and we will help place you on a team.</div></>}{teamSpotsFull && <div style={{ marginTop: 8, fontWeight: 700, color: "#991b1b" }}>{activeRegistrationLeague.name} team registration is closed. All {activeRegistrationLeague.teamCap} spots are filled.</div>}</div>

<div className="grid2"><div className="card"><h3>{activeRegistrationLeague.name} Team Registration</h3><form noValidate onSubmit={handleTeamSaveOnly} className="form"><input value={teamForm.teamName} onChange={(e) => setTeamForm((p) => ({ ...p, teamName: e.target.value }))} placeholder="Team Name" /><input value={teamForm.captainName} onChange={(e) => setTeamForm((p) => ({ ...p, captainName: e.target.value }))} placeholder="Captain / Coach Name" /><input value={teamForm.captainEmail} onChange={(e) => setTeamForm((p) => ({ ...p, captainEmail: e.target.value }))} placeholder="Captain Email" /><input value={teamForm.captainPhone} onChange={(e) => setTeamForm((p) => ({ ...p, captainPhone: e.target.value }))} placeholder="Captain Phone" /><textarea readOnly value={fullWaiverText} rows={10} /><input value={teamForm.signature} onChange={(e) => setTeamForm((p) => ({ ...p, signature: e.target.value }))} placeholder="Type Full Legal Name as Signature" /><label><input type="checkbox" checked={teamForm.agreeWaiver} onChange={(e) => setTeamForm((p) => ({ ...p, agreeWaiver: e.target.checked }))} /> I agree to the waiver</label><label><input type="checkbox" checked={teamForm.agreeCaptainDuty} onChange={(e) => setTeamForm((p) => ({ ...p, agreeCaptainDuty: e.target.checked }))} /> I accept captain responsibility</label><label><input type="checkbox" checked={teamForm.agreeElectronic} onChange={(e) => setTeamForm((p) => ({ ...p, agreeElectronic: e.target.checked }))} /> I accept electronic signature</label><div className="row"><button type="submit" className="primary" disabled={savingTeam || startingCheckout || teamSpotsFull}>{savingTeam ? "Saving..." : "Save Team Registration"}</button>

{registrationLeague === "kickball" && (
<button
type="button"
className="primary"
onClick={handleCaptainCheckout}
>
Pay Captain Fee
</button>
)}{registrationLeague === "softball" && <button type="button" className="primary" disabled={savingTeam || startingCheckout || teamSpotsFull} onClick={handleTeamCheckout}>{startingCheckout ? "Starting Checkout..." : `Pay $${pricing.price} with Stripe`}</button>}</div></form></div>
<div className="card"><h3>{activeRegistrationLeague.name} Free Agent Registration</h3><form noValidate onSubmit={handleFreeAgentSubmit} className="form"><input value={freeAgentForm.playerName} onChange={(e) => setFreeAgentForm((p) => ({ ...p, playerName: e.target.value }))} placeholder="Full Name" /><input value={freeAgentForm.playerEmail} onChange={(e) => setFreeAgentForm((p) => ({ ...p, playerEmail: e.target.value }))} placeholder="Email" /><input value={freeAgentForm.playerPhone} onChange={(e) => setFreeAgentForm((p) => ({ ...p, playerPhone: e.target.value }))} placeholder="Phone" /><select value={freeAgentForm.gender} onChange={(e) => setFreeAgentForm((p) => ({ ...p, gender: e.target.value }))}><option value="">Select Gender</option><option value="Male">Male</option><option value="Female">Female</option></select><select value={freeAgentForm.skill} onChange={(e) => setFreeAgentForm((p) => ({ ...p, skill: e.target.value }))}><option value="">Skill Level</option><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Competitive">Competitive</option></select><input value={freeAgentForm.preferredPosition} onChange={(e) => setFreeAgentForm((p) => ({ ...p, preferredPosition: e.target.value }))} placeholder="Preferred Position" /><textarea readOnly value={fullWaiverText} rows={10} /><input value={freeAgentForm.signature} onChange={(e) => setFreeAgentForm((p) => ({ ...p, signature: e.target.value }))} placeholder="Type Full Legal Name as Signature" /><label><input type="checkbox" checked={freeAgentForm.agreeWaiver} onChange={(e) => setFreeAgentForm((p) => ({ ...p, agreeWaiver: e.target.checked }))} /> I agree to the waiver</label><label><input type="checkbox" checked={freeAgentForm.agreeElectronic} onChange={(e) => setFreeAgentForm((p) => ({ ...p, agreeElectronic: e.target.checked }))} /> I accept electronic signature</label><div className="row"><button type="submit" className="primary" disabled={savingFreeAgent || startingFreeAgentCheckout}>{savingFreeAgent ? "Saving..." : "Save Free Agent Registration"}</button><button type="button" className="primary" disabled={savingFreeAgent || startingFreeAgentCheckout} onClick={handleFreeAgentCheckout}>{startingFreeAgentCheckout ? "Starting Checkout..." : "Pay with Stripe"}</button></div></form></div></div>

<div className="grid2"><div className="card"><h3>Find Saved Team</h3><form noValidate onSubmit={handleFindSavedTeam} className="form"><input value={lookupEmail} onChange={(e) => setLookupEmail(e.target.value)} placeholder="Captain Email" /><input value={lookupTeamName} onChange={(e) => setLookupTeamName(e.target.value)} placeholder="Team Name (optional)" /><button type="submit" className="primary" disabled={lookupLoading}>{lookupLoading ? "Finding..." : "Find My Team"}</button></form>{foundTeam && <div style={{ marginTop: 16 }}><div><strong>Team:</strong> {foundTeam.teamName}</div><div><strong>Captain:</strong> {foundTeam.captainName}</div><div><strong>Status:</strong> <StatusBadge status={getTeamStatus(foundTeam)} /></div>{registrationLeague === "softball" && <button className="primary" disabled={resumeCheckoutLoading || foundTeam.paidStatus === "Paid"} onClick={handleResumeTeamCheckout}>{resumeCheckoutLoading ? "Starting..." : `Pay $${pricing.price} Now`}</button>}</div>}</div><div className="card"><h3>Find Saved Free Agent</h3><form noValidate onSubmit={handleFindSavedFreeAgent} className="form"><input value={freeAgentLookupEmail} onChange={(e) => setFreeAgentLookupEmail(e.target.value)} placeholder="Free Agent Email" /><input value={freeAgentLookupName} onChange={(e) => setFreeAgentLookupName(e.target.value)} placeholder="Full Name (optional)" /><button type="submit" className="primary" disabled={freeAgentLookupLoading}>{freeAgentLookupLoading ? "Finding..." : "Find Registration"}</button></form>{foundFreeAgent && <div style={{ marginTop: 16 }}><div><strong>Name:</strong> {foundFreeAgent.playerName}</div><div><strong>Status:</strong> <StatusBadge status={getFreeAgentStatus(foundFreeAgent)} /></div><button className="primary" disabled={resumeFreeAgentCheckoutLoading || foundFreeAgent.paidStatus === "Paid"} onClick={handleResumeFreeAgentCheckout}>{resumeFreeAgentCheckoutLoading ? "Starting..." : "Pay Now"}</button></div>}</div></div>

<div className="grid2"><div className="card"><h3>Captain Roster & Waivers</h3><form noValidate onSubmit={handleFindRosterTeam} className="form"><input value={rosterTeamEmail} onChange={(e) => setRosterTeamEmail(e.target.value)} placeholder="Captain Email" /><input value={rosterTeamName} onChange={(e) => setRosterTeamName(e.target.value)} placeholder="Team Name (optional)" /><button type="submit" className="primary" disabled={rosterLookupLoading}>{rosterLookupLoading ? "Finding..." : "Find Team Roster"}</button></form>{rosterTeam && <div style={{ marginTop: 16 }}><div><strong>Team:</strong> {rosterTeam.teamName}</div><div><strong>Team Waiver Token:</strong> {rosterTeam.inviteToken}</div><div><strong>Unsigned Players:</strong> {getUnsignedCount(rosterTeam.id)}</div><form noValidate onSubmit={handleAddRosterPlayer} className="form" style={{ marginTop: 16 }}><input value={rosterForm.playerName} onChange={(e) => setRosterForm((p) => ({ ...p, playerName: e.target.value }))} placeholder="Player Name" /><input value={rosterForm.playerEmail} onChange={(e) => setRosterForm((p) => ({ ...p, playerEmail: e.target.value }))} placeholder="Player Email" /><input value={rosterForm.playerPhone} onChange={(e) => setRosterForm((p) => ({ ...p, playerPhone: e.target.value }))} placeholder="Player Phone" /><button type="submit" className="primary" disabled={addingRosterPlayer}>{addingRosterPlayer ? "Adding..." : "Add Player"}</button></form></div>}</div><div className="card"><h3>Player Waiver Sign-Off</h3><form noValidate onSubmit={handleLookupWaiverTeam} className="form"><input value={waiverToken} onChange={(e) => setWaiverToken(e.target.value)} placeholder="Team Waiver Token" /><button type="submit" className="primary" disabled={waiverLookupLoading}>{waiverLookupLoading ? "Finding..." : "Find My Team"}</button></form>{waiverTeam && <form noValidate onSubmit={handleSubmitPlayerWaiver} className="form" style={{ marginTop: 16 }}><div><strong>Team:</strong> {waiverTeam.teamName}</div><select value={waiverPlayerId} onChange={(e) => setWaiverPlayerId(e.target.value)}><option value="">Select Your Name</option>{waiverPlayersForTeam.map((player) => <option key={player.id} value={player.id}>{player.playerName} {player.signedWaiver ? "(Already Signed)" : ""}</option>)}</select><textarea readOnly value={fullWaiverText} rows={10} /><input value={waiverSignature} onChange={(e) => setWaiverSignature(e.target.value)} placeholder="Type Full Legal Name as Signature" /><label><input type="checkbox" checked={waiverAgree} onChange={(e) => setWaiverAgree(e.target.checked)} /> I agree to the waiver</label><button type="submit" className="primary" disabled={waiverSubmitting}>{waiverSubmitting ? "Submitting..." : "Sign Player Waiver"}</button>

{waiverTeam.leagueType === "kickball" && (
<button
type="button"
className="primary"
disabled={waiverSubmitting || waiverCheckoutLoading}
onClick={handleKickballPlayerWaiverCheckout}
>
{waiverCheckoutLoading ? "Starting Checkout..." : "Pay Player Fee"}
</button>
)}</form>}</div></div></div>}

{page === "rules" && <div className="page"><h2 className="section-title">Softball Rules</h2><div className="league-switch"><button className="active">Softball Rules</button><button onClick={() => setPage("kickballRules")}>Kickball Rules</button></div><RulesCards sections={softballRulesSections} /></div>}
{page === "kickballRules" && <div className="page"><h2 className="section-title">Kickball Rules</h2><p className="section-subtitle">Desert Rec kickball is designed to be fun, social, and competitive while keeping sportsmanship and safety first.</p><RulesCards sections={kickballRulesSections} /></div>}
{page === "schedule" && <div className="page"><h2 className="section-title">Softball Schedule</h2><div className="league-switch"><button className="active">Softball Schedule</button><button onClick={() => setPage("kickballSchedule")}>Kickball Schedule</button></div><ScheduleTable games={softballScheduleWithNames} /></div>}
{page === "kickballSchedule" && <div className="page"><h2 className="section-title">Kickball Schedule</h2><ScheduleTable games={kickballScheduleWithNames} /></div>}
{page === "standings" && <div className="page"><h2 className="section-title">Standings</h2><div className="grid2"><div><h3>Softball Standings</h3><StandingsTable list={softballStandings} /></div><div><h3>Kickball Standings</h3><StandingsTable list={kickballStandings} /></div></div></div>}
{page === "playoffs" && <div className="page"><h2 className="section-title">Playoffs</h2><div className="grid2"><div><h3>Softball Playoffs</h3><PlayoffTable games={softballBracket} /></div><div><h3>Kickball Playoffs</h3><PlayoffTable games={kickballBracket} /></div></div></div>}
{page === "leaderboard" && <div className="page"><h2 className="section-title">Player Leaderboard</h2><LeaderboardTable list={leaderboard} /></div>}
{page === "waiver" && <div className="page"><h2 className="section-title">Waiver</h2><div className="card"><pre className="waiverPre">{fullWaiverText}</pre></div></div>}

{page === "admin" && <div className="page">{authLoading ? <div className="card">Loading admin login...</div> : !user || user.email !== ADMIN_EMAIL ? <div className="card" style={{ maxWidth: 520 }}><h2>Admin Login</h2><form noValidate onSubmit={handleAdminLogin} className="form"><input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="Admin email" /><input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Password" /><button type="submit" className="primary">Sign In</button></form></div> : <><div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}><h2 className="section-title" style={{ margin: 0 }}>Admin Dashboard</h2><button onClick={handleLogout}>Sign Out</button></div><div className="card"><h3>Admin League Control</h3><div className="league-switch"><button className={adminLeague === "softball" ? "active" : ""} onClick={() => setAdminLeague("softball")}>Softball Admin</button><button className={adminLeague === "kickball" ? "active" : ""} onClick={() => setAdminLeague("kickball")}>Kickball Admin</button></div><p className="section-subtitle" style={{ marginBottom: 0 }}>Current admin view: <strong>{activeAdminLeague.name}</strong></p></div><div className="grid3"><div className="card"><div>{activeAdminLeague.name} Teams</div><div className="stat">{adminTeams.length}</div></div><div className="card"><div>{activeAdminLeague.name} Free Agents</div><div className="stat">{adminFreeAgents.length}</div></div><div className="card"><div>Open Team Spots</div><div className="stat">{Math.max(activeAdminLeague.teamCap - adminTeams.length, 0)}</div></div></div><div className="card"><div className="row"><button className="primary" onClick={buildSchedule}>Generate {activeAdminLeague.name} Round Robin</button><button className="primary" disabled={assigningFreeAgents} onClick={assignPaidFreeAgentsToTeam}>{assigningFreeAgents ? "Assigning..." : `Assign ${activeAdminLeague.name} Paid Free Agents`}</button><button className="primary" disabled={creatingNewFreeAgentTeam} onClick={handleCreateNewFreeAgentTeam}>{creatingNewFreeAgentTeam ? "Creating..." : `Create New ${activeAdminLeague.name} Free Agent Team`}</button><button className="primary" onClick={generatePlayoffBracket}>Generate {activeAdminLeague.name} Playoff Bracket</button></div></div>
<div className="card"><h3>{activeAdminLeague.name} Manual Schedule Control</h3>{adminSchedule.length === 0 ? <p>No schedule created yet.</p> : <table><thead><tr><th>Week</th><th>Home</th><th>Away</th><th>Date</th><th>Time</th><th>Field</th><th>Home Score</th><th>Away Score</th><th>Status</th><th>Save</th></tr></thead><tbody>{adminScheduleWithNames.map((game) => <tr key={game.id}><td><input className="mini-input" type="number" value={getScheduleInput(game.id, "week", game.week)} onChange={(e) => handleScheduleInputChange(game.id, "week", e.target.value)} /></td><td><select value={getScheduleInput(game.id, "homeTeamId", game.homeTeamId || "")} onChange={(e) => handleScheduleInputChange(game.id, "homeTeamId", e.target.value)}><option value="">Select</option>{adminTeams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select></td><td><select value={getScheduleInput(game.id, "awayTeamId", game.awayTeamId || "")} onChange={(e) => handleScheduleInputChange(game.id, "awayTeamId", e.target.value)}><option value="">Select</option>{adminTeams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select></td><td><input value={getScheduleInput(game.id, "date", game.date)} onChange={(e) => handleScheduleInputChange(game.id, "date", e.target.value)} /></td><td><input value={getScheduleInput(game.id, "time", game.time)} onChange={(e) => handleScheduleInputChange(game.id, "time", e.target.value)} /></td><td><input value={getScheduleInput(game.id, "field", game.field)} onChange={(e) => handleScheduleInputChange(game.id, "field", e.target.value)} /></td><td><input className="mini-input" type="number" value={getScheduleInput(game.id, "homeScore", game.homeScore)} onChange={(e) => handleScheduleInputChange(game.id, "homeScore", e.target.value)} /></td><td><input className="mini-input" type="number" value={getScheduleInput(game.id, "awayScore", game.awayScore)} onChange={(e) => handleScheduleInputChange(game.id, "awayScore", e.target.value)} /></td><td><select value={getScheduleInput(game.id, "status", game.status)} onChange={(e) => handleScheduleInputChange(game.id, "status", e.target.value)}><option value="Scheduled">Scheduled</option><option value="Final">Final</option><option value="Postponed">Postponed</option><option value="Cancelled">Cancelled</option></select></td><td><button className="primary" disabled={savingScheduleGameId === game.id} onClick={() => saveScheduleGame(game.id)}>{savingScheduleGameId === game.id ? "Saving..." : "Save"}</button></td></tr>)}</tbody></table>}</div>
<div className="card"><h3>{activeAdminLeague.name} Auto Standings Preview</h3><StandingsTable list={standings} /></div>
<div className="card"><h3>{activeAdminLeague.name} Player Stats Entry</h3><form noValidate onSubmit={savePlayerStat} className="form"><input value={statForm.playerName} onChange={(e) => setStatForm((p) => ({ ...p, playerName: e.target.value }))} placeholder="Player Name" /><select value={statForm.teamId} onChange={(e) => setStatForm((p) => ({ ...p, teamId: e.target.value }))}><option value="">Select Team</option>{adminTeams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select><div className="grid3"><input type="number" value={statForm.gamesPlayed} onChange={(e) => setStatForm((p) => ({ ...p, gamesPlayed: e.target.value }))} placeholder="Games Played" /><input type="number" value={statForm.hits} onChange={(e) => setStatForm((p) => ({ ...p, hits: e.target.value }))} placeholder="Hits" /><input type="number" value={statForm.homeRuns} onChange={(e) => setStatForm((p) => ({ ...p, homeRuns: e.target.value }))} placeholder="Home Runs" /><input type="number" value={statForm.rbis} onChange={(e) => setStatForm((p) => ({ ...p, rbis: e.target.value }))} placeholder="RBIs" /><input type="number" value={statForm.runs} onChange={(e) => setStatForm((p) => ({ ...p, runs: e.target.value }))} placeholder="Runs" /></div><button className="primary" type="submit" disabled={savingStat}>{savingStat ? "Saving..." : "Save Player Stats"}</button></form></div>
{adminPlayoffGames.length > 0 && <div className="card"><h3>{activeAdminLeague.name} Playoff Game Control</h3><table><thead><tr><th>Round</th><th>Game</th><th>Home</th><th>Away</th><th>Home Score</th><th>Away Score</th><th>Status</th><th>Save</th></tr></thead><tbody>{adminPlayoffGamesToShow.map((game) => <PlayoffGameEditorRow key={game.id || `${game.roundName}-${game.gameOrder}`} game={game} teams={adminTeams} onSave={savePlayoffGame} savingPlayoffGameId={savingPlayoffGameId} />)}</tbody></table></div>}
<div className="card"><h3>Set Captain From Assigned Free Agents</h3><div className="form"><select value={settingCaptainTeamId} onChange={(e) => { setSettingCaptainTeamId(e.target.value); setSettingCaptainPlayerId(""); }}><option value="">Select Team</option>{adminTeams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select><select value={settingCaptainPlayerId} onChange={(e) => setSettingCaptainPlayerId(e.target.value)} disabled={!settingCaptainTeamId}><option value="">Select Assigned Free Agent</option>{selectedCaptainCandidates.map((player) => <option key={player.id} value={player.id}>{player.playerName} - {player.playerEmail}</option>)}</select><button className="primary" disabled={settingCaptainLoading} onClick={handleSetCaptain}>{settingCaptainLoading ? "Setting..." : "Set Captain"}</button></div></div>
<div className="card"><h3>{activeAdminLeague.name} Teams</h3><table><thead><tr><th>Team</th><th>Captain</th><th>Email</th><th>Tier</th><th>Status</th><th>Unsigned Waivers</th></tr></thead><tbody>{adminTeams.map((team) => <tr key={team.id}><td>{team.teamName}</td><td>{team.captainName}</td><td>{team.captainEmail}</td><td>{team.paymentTier}</td><td><StatusBadge status={getTeamStatus(team)} /></td><td>{getUnsignedCount(team.id)}</td></tr>)}</tbody></table></div>
<div className="card"><h3>{activeAdminLeague.name} Free Agents</h3><table><thead><tr><th>Name</th><th>Email</th><th>Gender</th><th>Skill</th><th>Assigned Team</th><th>Status</th><th>Move To Team</th></tr></thead><tbody>{adminFreeAgents.map((player) => <tr key={player.id}><td>{player.playerName}</td><td>{player.playerEmail}</td><td>{player.gender}</td><td>{player.skill}</td><td>{player.assignedTeamId ? teamNameById(player.assignedTeamId) : "Unassigned"}</td><td><StatusBadge status={getFreeAgentStatus(player)} /></td><td><div className="row"><select value={moveSelections[player.id] ?? (player.assignedTeamId || "")} onChange={(e) => setMoveSelections((prev) => ({ ...prev, [player.id]: e.target.value }))}><option value="">Unassigned</option>{adminTeams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select><button onClick={() => handleMoveFreeAgent(player.id)} disabled={movingFreeAgentId === player.id}>{movingFreeAgentId === player.id ? "Moving..." : "Move"}</button></div></td></tr>)}</tbody></table></div>
<div className="card"><h3>Roster Players</h3><table><thead><tr><th>Team</th><th>Name</th><th>Email</th><th>Waiver</th></tr></thead><tbody>{teamPlayers.filter((p) => p.leagueType === adminLeague).map((player) => <tr key={player.id}><td>{teamNameById(player.teamId)}</td><td>{player.playerName}</td><td>{player.playerEmail || "â€”"}</td><td><StatusBadge status={player.signedWaiver ? "Signed" : "Missing"} /></td></tr>)}</tbody></table></div></>}</div>}
</div>
);
}

function PlayoffGameEditorRow({ game, teams, onSave, savingPlayoffGameId }) {
const [values, setValues] = useState({ homeTeamId: game.homeTeamId || "", awayTeamId: game.awayTeamId || "", homeScore: game.homeScore, awayScore: game.awayScore, status: game.status || "Scheduled" });
useEffect(() => { setValues({ homeTeamId: game.homeTeamId || "", awayTeamId: game.awayTeamId || "", homeScore: game.homeScore, awayScore: game.awayScore, status: game.status || "Scheduled" }); }, [game]);
return <tr><td>{game.roundName}</td><td>{game.gameOrder}</td><td><select value={values.homeTeamId} onChange={(e) => setValues((p) => ({ ...p, homeTeamId: e.target.value }))}><option value="">Select</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select></td><td><select value={values.awayTeamId} onChange={(e) => setValues((p) => ({ ...p, awayTeamId: e.target.value }))}><option value="">Select</option>{teams.map((team) => <option key={team.id} value={team.id}>{team.teamName}</option>)}</select></td><td><input type="number" value={values.homeScore} onChange={(e) => setValues((p) => ({ ...p, homeScore: e.target.value }))} /></td><td><input type="number" value={values.awayScore} onChange={(e) => setValues((p) => ({ ...p, awayScore: e.target.value }))} /></td><td><select value={values.status} onChange={(e) => setValues((p) => ({ ...p, status: e.target.value }))}><option value="Scheduled">Scheduled</option><option value="Final">Final</option><option value="Postponed">Postponed</option><option value="Cancelled">Cancelled</option></select></td><td><button className="primary" disabled={savingPlayoffGameId === game.id} onClick={() => onSave(game.id, values)}>{savingPlayoffGameId === game.id ? "Saving..." : "Save"}</button></td></tr>;
}