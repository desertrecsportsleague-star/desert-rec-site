import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";

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

export default function App() {
const [page, setPage] = useState("home");
const [teamForm, setTeamForm] = useState(initialTeamForm);

const [user, setUser] = useState(null);
const [authLoading, setAuthLoading] = useState(true);

const [loginEmail, setLoginEmail] = useState("");
const [loginPassword, setLoginPassword] = useState("");

// 🔥 FIXED AUTH (NO FREEZE)
useEffect(() => {
let mounted = true;

async function init() {
try {
const { data } = await supabase.auth.getUser();
if (mounted) setUser(data?.user ?? null);
} catch (err) {
console.error("AUTH ERROR:", err);
} finally {
if (mounted) setAuthLoading(false);
}
}

init();

const {
data: { subscription },
} = supabase.auth.onAuthStateChange(async () => {
const { data } = await supabase.auth.getUser();
if (mounted) setUser(data?.user ?? null);
});

// fallback timeout
setTimeout(() => {
if (mounted) setAuthLoading(false);
}, 4000);

return () => {
mounted = false;
subscription.unsubscribe();
};
}, []);

// 🔥 TEAM SUBMIT (FULL DEBUG + FIXED)
async function handleTeamSubmit(e) {
e.preventDefault();
console.log("SUBMIT FIRED", teamForm);

try {
const { data, error } = await supabase.from("teams").insert([
{
team_name: teamForm.teamName,
captain_name: teamForm.captainName,
captain_email: teamForm.captainEmail,
captain_phone: teamForm.captainPhone,
payment_tier: "early",
paid_status: "Pending",
signature_name: teamForm.signature,
agree_waiver: teamForm.agreeWaiver,
agree_captain_duty: teamForm.agreeCaptainDuty,
agree_electronic: teamForm.agreeElectronic,
},
]);

console.log("DATA:", data);
console.log("ERROR:", error);

if (error) {
alert(error.message);
return;
}

alert("Team registered successfully!");
setTeamForm(initialTeamForm);
} catch (err) {
console.error("FETCH ERROR:", err);
alert(String(err));
}
}

// 🔥 ADMIN LOGIN FIXED
async function handleAdminLogin(e) {
e.preventDefault();

const { error } = await supabase.auth.signInWithPassword({
email: loginEmail,
password: loginPassword,
});

if (error) {
alert(error.message);
return;
}

const { data } = await supabase.auth.getUser();

if (data.user.email !== ADMIN_EMAIL) {
alert("Not authorized");
await supabase.auth.signOut();
return;
}

alert("Admin logged in");
}

// ======================
// PAGES
// ======================

function Home() {
return (
<div style={{ padding: 40 }}>
<h1>Desert Rec Sports League</h1>
<button onClick={() => setPage("register")}>Register</button>
<button onClick={() => setPage("admin")}>Admin</button>
</div>
);
}

function Register() {
return (
<div style={{ padding: 40 }}>
<h2>Team Registration</h2>

<form
onSubmit={(e) => {
console.log("FORM TRIGGERED");
handleTeamSubmit(e);
}}
>
<input
placeholder="Team Name"
value={teamForm.teamName}
onChange={(e) =>
setTeamForm({ ...teamForm, teamName: e.target.value })
}
required
/>

<input
placeholder="Captain Name"
value={teamForm.captainName}
onChange={(e) =>
setTeamForm({ ...teamForm, captainName: e.target.value })
}
required
/>

<input
placeholder="Email"
value={teamForm.captainEmail}
onChange={(e) =>
setTeamForm({ ...teamForm, captainEmail: e.target.value })
}
required
/>

<input
placeholder="Signature"
value={teamForm.signature}
onChange={(e) =>
setTeamForm({ ...teamForm, signature: e.target.value })
}
required
/>

<label>
<input
type="checkbox"
checked={teamForm.agreeWaiver}
onChange={(e) =>
setTeamForm({ ...teamForm, agreeWaiver: e.target.checked })
}
required
/>
Agree Waiver
</label>

<label>
<input
type="checkbox"
checked={teamForm.agreeCaptainDuty}
onChange={(e) =>
setTeamForm({
...teamForm,
agreeCaptainDuty: e.target.checked,
})
}
required
/>
Captain Responsibility
</label>

<label>
<input
type="checkbox"
checked={teamForm.agreeElectronic}
onChange={(e) =>
setTeamForm({
...teamForm,
agreeElectronic: e.target.checked,
})
}
required
/>
Electronic Signature
</label>

<button
type="submit"
onClick={() => console.log("BUTTON CLICKED")}
>
Save Team Registration
</button>
</form>
</div>
);
}

function Admin() {
if (authLoading) return <div>Loading admin...</div>;

if (!user) {
return (
<div style={{ padding: 40 }}>
<h2>Admin Login</h2>
<form onSubmit={handleAdminLogin}>
<input
placeholder="Email"
value={loginEmail}
onChange={(e) => setLoginEmail(e.target.value)}
/>
<input
placeholder="Password"
type="password"
value={loginPassword}
onChange={(e) => setLoginPassword(e.target.value)}
/>
<button type="submit">Login</button>
</form>
</div>
);
}

return <div style={{ padding: 40 }}>Admin Dashboard Loaded ✅</div>;
}

// ======================
// ROUTER
// ======================

if (page === "register") return <Register />;
if (page === "admin") return <Admin />;

return <Home />;
}
