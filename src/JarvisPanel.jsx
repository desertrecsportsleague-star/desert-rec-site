import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";

function money(cents) {
  if (cents === null || cents === undefined) return "Not set";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function prettyDate(value) {
  if (!value) return "Not set";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

function answerCommand(command, seasons) {
  const q = command.trim().toLowerCase();
  if (!q) return "Ask me about seasons, registration, locations, prices, or active leagues.";
  if (q.includes("registration") || q.includes("open")) {
    const open = seasons.filter((s) => s.registration_enabled || s.status === "registration_open");
    if (!open.length) return "No season currently has registration enabled in the Jarvis season system.";
    return open.map((s) => `${s.name}: registration open${s.registration_close_at ? ` until ${prettyDate(s.registration_close_at)}` : ""}.`).join("\n");
  }
  if (q.includes("active") || q.includes("current")) {
    const active = seasons.filter((s) => s.status === "active");
    if (!active.length) return "No seasons are currently marked active.";
    return active.map((s) => `${s.name} — ${s.day_label || "day TBD"} at ${s.location || "location TBD"}.`).join("\n");
  }
  if (q.includes("price") || q.includes("cost")) return seasons.map((s) => `${s.name}: team ${money(s.team_price_cents)}, free agent ${money(s.free_agent_price_cents)}.`).join("\n");
  if (q.includes("where") || q.includes("location")) return seasons.map((s) => `${s.name}: ${s.location || "TBD"}${s.city ? `, ${s.city}` : ""}.`).join("\n");
  if (q.includes("season") || q.includes("league") || q.includes("show")) return seasons.length ? seasons.map((s) => `${s.name} — ${s.status} — starts ${prettyDate(s.start_date)}.`).join("\n") : "I couldn't find any visible seasons in Supabase.";
  return "Try: “show active seasons”, “what registration is open?”, “show prices”, or use Controlled Actions below to prepare a change.";
}

export default function JarvisPanel() {
  const [allowed, setAllowed] = useState(false);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("Jarvis is connected. Database changes require your approval.");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [working, setWorking] = useState(false);
  const [actionType, setActionType] = useState("registration");
  const [seasonKey, setSeasonKey] = useState("");
  const [price, setPrice] = useState("");
  const [draft, setDraft] = useState({ name: "", sport_key: "softball", start_date: "", day_label: "", location: "", city: "Buckeye, Arizona", team_cap: "8", team_price: "", free_agent_price: "" });

  async function loadSeasons() {
    setLoading(true); setError("");
    try {
      const { data, error: e } = await supabase.from("seasons").select("season_key,sport_key,name,title,status,start_date,end_date,registration_open_at,registration_close_at,day_label,location,city,team_cap,team_price_cents,free_agent_price_cents,registration_enabled").order("start_date", { ascending: false });
      if (e) throw e;
      setSeasons(data || []);
      setSeasonKey((old) => old || data?.[0]?.season_key || "");
    } catch (e) { setError(e?.message || String(e)); } finally { setLoading(false); }
  }

  async function syncUser(nextUser) {
    const isAdmin = (nextUser?.email || "").toLowerCase() === ADMIN_EMAIL;
    setUser(nextUser || null); setAllowed(isAdmin);
    if (isAdmin) await loadSeasons(); else { setOpen(false); setLoading(false); setSeasons([]); }
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => { if (mounted) syncUser(data?.user ?? null); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { if (mounted) syncUser(session?.user ?? null); });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const activeCount = useMemo(() => seasons.filter((s) => s.status === "active").length, [seasons]);
  if (!allowed) return null;

  function prepareAction() {
    setError("");
    if (actionType === "registration") {
      const s = seasons.find((x) => x.season_key === seasonKey); if (!s) return setError("Choose a season.");
      const opening = !s.registration_enabled;
      setPending({ type: "registration", season: s, opening, title: `${opening ? "Open" : "Close"} registration for ${s.name}`, summary: `Registration will be ${opening ? "enabled" : "disabled"}. Season status will become ${opening ? "registration_open" : "registration_closed"}.` });
    } else if (actionType === "price") {
      const s = seasons.find((x) => x.season_key === seasonKey); const dollars = Number(price);
      if (!s) return setError("Choose a season."); if (!Number.isFinite(dollars) || dollars < 0) return setError("Enter a valid team price.");
      setPending({ type: "price", season: s, cents: Math.round(dollars * 100), title: `Change ${s.name} team price`, summary: `${money(s.team_price_cents)} → ${money(Math.round(dollars * 100))}` });
    } else {
      if (!draft.name.trim() || !draft.sport_key) return setError("Season name and sport are required.");
      const key = `${draft.sport_key}_${draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}_${Date.now().toString().slice(-5)}`;
      setPending({ type: "create", key, title: `Create draft season: ${draft.name}`, summary: `${draft.sport_key} · starts ${draft.start_date || "TBD"} · ${draft.location || "location TBD"} · team cap ${draft.team_cap || "TBD"}`, draft: { ...draft } });
    }
  }

  async function approveAction() {
    if (!pending || !user) return;
    setWorking(true); setError("");
    let actionId = null;
    try {
      const { data: log, error: logError } = await supabase.from("jarvis_actions").insert({ requested_by: user.id, command: pending.title, action_type: pending.type, status: "approved", risk_level: "medium", payload: pending }).select("id").single();
      if (logError) throw logError; actionId = log.id;
      let result;
      if (pending.type === "registration") {
        const { data, error } = await supabase.from("seasons").update({ registration_enabled: pending.opening, status: pending.opening ? "registration_open" : "registration_closed", updated_at: new Date().toISOString() }).eq("season_key", pending.season.season_key).select().single(); if (error) throw error; result = data;
      } else if (pending.type === "price") {
        const { data, error } = await supabase.from("seasons").update({ team_price_cents: pending.cents, updated_at: new Date().toISOString() }).eq("season_key", pending.season.season_key).select().single(); if (error) throw error; result = data;
      } else {
        const d = pending.draft;
        const { data, error } = await supabase.from("seasons").insert({ season_key: pending.key, sport_key: d.sport_key, name: d.name.trim(), title: d.name.trim(), status: "draft", start_date: d.start_date || null, day_label: d.day_label || null, location: d.location || null, city: d.city || null, team_cap: d.team_cap ? Number(d.team_cap) : null, team_price_cents: d.team_price ? Math.round(Number(d.team_price) * 100) : null, free_agent_price_cents: d.free_agent_price ? Math.round(Number(d.free_agent_price) * 100) : null, registration_enabled: false, waiver_required: true, payment_required: true }).select().single(); if (error) throw error; result = data;
      }
      await supabase.from("jarvis_actions").update({ status: "completed", result, completed_at: new Date().toISOString() }).eq("id", actionId);
      setResponse(`Completed: ${pending.title}`); setPending(null); await loadSeasons();
    } catch (e) {
      if (actionId) await supabase.from("jarvis_actions").update({ status: "failed", error_message: e?.message || String(e), completed_at: new Date().toISOString() }).eq("id", actionId);
      setError(e?.message || String(e));
    } finally { setWorking(false); }
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} style={{ position:"fixed",right:18,bottom:18,zIndex:9998,border:"2px solid #f59e0b",borderRadius:999,padding:"14px 20px",background:"#111827",color:"white",fontWeight:900,fontSize:15,boxShadow:"0 10px 30px rgba(0,0,0,.28)",cursor:"pointer" }}>⚡ JARVIS</button>
    {open && <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.55)",display:"grid",placeItems:"center",padding:16}}><section style={{width:"min(800px,100%)",maxHeight:"90vh",overflow:"auto",background:"#fff",borderRadius:20,padding:22,color:"#111827"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:16}}><div><div style={{fontSize:12,fontWeight:900,letterSpacing:1.2,color:"#b45309"}}>DESERT REC COMMAND CENTER</div><h2 style={{margin:"5px 0 4px"}}>Jarvis Controlled Actions</h2><p style={{margin:0,color:"#6b7280"}}>Preview branch · changes require approval · production website unchanged</p></div><button onClick={()=>setOpen(false)}>Close</button></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,margin:"18px 0"}}><div style={{padding:14,background:"#f9fafb",borderRadius:14}}>Visible Seasons<br/><strong style={{fontSize:26}}>{seasons.length}</strong></div><div style={{padding:14,background:"#f9fafb",borderRadius:14}}>Active Seasons<br/><strong style={{fontSize:26}}>{activeCount}</strong></div><div style={{padding:14,background:"#f9fafb",borderRadius:14}}>Mode<br/><strong>APPROVAL REQUIRED</strong></div></div>
      {loading && <p>Connecting…</p>}{error && <p style={{color:"#b91c1c",fontWeight:700}}>{error}</p>}
      <form onSubmit={(e)=>{e.preventDefault();setResponse(answerCommand(command,seasons));}} style={{display:"flex",gap:8}}><input value={command} onChange={e=>setCommand(e.target.value)} placeholder="Ask Jarvis about your leagues…" style={{flex:1,padding:12,borderRadius:10,border:"1px solid #d1d5db"}}/><button style={{background:"#f59e0b",border:0,borderRadius:10,padding:"0 18px",fontWeight:900}}>Ask</button></form>
      <pre style={{whiteSpace:"pre-wrap",fontFamily:"inherit",background:"#111827",color:"white",borderRadius:14,padding:14}}>{response}</pre>
      <hr style={{margin:"20px 0",border:0,borderTop:"1px solid #e5e7eb"}}/><h3>Controlled Actions</h3>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>{[["registration","Open / Close Registration"],["price","Change Team Price"],["create","Create Season Draft"]].map(([v,l])=><button key={v} onClick={()=>{setActionType(v);setPending(null);}} style={{padding:"9px 12px",borderRadius:10,border:"1px solid #d1d5db",background:actionType===v?"#111827":"white",color:actionType===v?"white":"#111827"}}>{l}</button>)}</div>
      {actionType!=="create" && <div style={{display:"grid",gap:10}}><select value={seasonKey} onChange={e=>setSeasonKey(e.target.value)} style={{padding:11,borderRadius:10}}>{seasons.map(s=><option key={s.season_key} value={s.season_key}>{s.name}</option>)}</select>{actionType==="price"&&<input type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="New team price in dollars" style={{padding:11,borderRadius:10,border:"1px solid #d1d5db"}}/>}</div>}
      {actionType==="create" && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><input placeholder="Season name" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/><select value={draft.sport_key} onChange={e=>setDraft({...draft,sport_key:e.target.value})}><option value="softball">Softball</option><option value="kickball">Kickball</option></select><input type="date" value={draft.start_date} onChange={e=>setDraft({...draft,start_date:e.target.value})}/><input placeholder="Day (ex: Sunday Evenings)" value={draft.day_label} onChange={e=>setDraft({...draft,day_label:e.target.value})}/><input placeholder="Location" value={draft.location} onChange={e=>setDraft({...draft,location:e.target.value})}/><input placeholder="City" value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})}/><input type="number" placeholder="Team cap" value={draft.team_cap} onChange={e=>setDraft({...draft,team_cap:e.target.value})}/><input type="number" placeholder="Team price $" value={draft.team_price} onChange={e=>setDraft({...draft,team_price:e.target.value})}/><input type="number" placeholder="Free agent price $" value={draft.free_agent_price} onChange={e=>setDraft({...draft,free_agent_price:e.target.value})}/></div>}
      <button onClick={prepareAction} style={{marginTop:12,padding:"11px 16px",border:0,borderRadius:10,background:"#f59e0b",fontWeight:900}}>Prepare Action</button>
      {pending && <div style={{marginTop:16,padding:16,border:"2px solid #f59e0b",borderRadius:14,background:"#fffbeb"}}><div style={{fontSize:12,fontWeight:900,color:"#b45309"}}>PROPOSED ACTION — NOTHING CHANGED YET</div><h3 style={{margin:"6px 0"}}>{pending.title}</h3><p>{pending.summary}</p><div style={{display:"flex",gap:8}}><button disabled={working} onClick={approveAction} style={{padding:"10px 16px",border:0,borderRadius:10,background:"#15803d",color:"white",fontWeight:900}}>{working?"Working…":"Approve"}</button><button disabled={working} onClick={()=>setPending(null)} style={{padding:"10px 16px",border:"1px solid #d1d5db",borderRadius:10,background:"white"}}>Cancel</button></div></div>}
    </section></div>}
  </>;
}
