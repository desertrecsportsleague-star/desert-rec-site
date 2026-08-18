import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";

export default function JarvisTournamentManager() {
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ name:"", sport_key:"softball", event_date:"", location:"", city:"Buckeye, Arizona", field_count:"1", team_cap:"8", entry_fee:"400", guaranteed_games:"2", format:"Pool play + bracket", prize_text:"" });
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("tournaments").select("tournament_key,name,sport_key,status,event_date,location,city,field_count,team_cap,entry_fee_cents,guaranteed_games,format,prize_text,registration_enabled").order("event_date", { ascending:false });
    setRows(data || []);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({data}) => {
      const ok = (data?.user?.email || "").toLowerCase() === ADMIN_EMAIL;
      setAllowed(ok);
      if (ok) await load();
    });
  }, []);

  if (!allowed) return null;

  function prepare() {
    if (!form.name.trim()) return setMessage("Tournament name is required.");
    const key = `${form.sport_key}_${form.name.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"")}_${Date.now().toString().slice(-5)}`;
    setPending({ key, ...form });
    setMessage("");
  }

  async function approve() {
    if (!pending) return;
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.from("tournaments").insert({
        tournament_key: pending.key,
        sport_key: pending.sport_key,
        name: pending.name.trim(),
        status: "draft",
        event_date: pending.event_date || null,
        location: pending.location || null,
        city: pending.city || null,
        field_count: pending.field_count ? Number(pending.field_count) : null,
        team_cap: pending.team_cap ? Number(pending.team_cap) : null,
        entry_fee_cents: pending.entry_fee ? Math.round(Number(pending.entry_fee)*100) : null,
        guaranteed_games: pending.guaranteed_games ? Number(pending.guaranteed_games) : null,
        format: pending.format || null,
        prize_text: pending.prize_text || null,
        registration_enabled:false,
        payment_required:true,
        waiver_required:true
      });
      if (error) throw error;
      setMessage(`Created draft tournament: ${pending.name}`);
      setPending(null);
      setForm({ name:"", sport_key:"softball", event_date:"", location:"", city:"Buckeye, Arizona", field_count:"1", team_cap:"8", entry_fee:"400", guaranteed_games:"2", format:"Pool play + bracket", prize_text:"" });
      await load();
    } catch (e) { setMessage(e?.message || String(e)); }
    finally { setBusy(false); }
  }

  async function toggleRegistration(row) {
    const opening = !row.registration_enabled;
    const ok = window.confirm(`${opening ? "Open" : "Close"} registration for ${row.name}?`);
    if (!ok) return;
    const { error } = await supabase.from("tournaments").update({ registration_enabled: opening, status: opening ? "registration_open" : "registration_closed", updated_at:new Date().toISOString() }).eq("tournament_key", row.tournament_key);
    if (error) return setMessage(error.message);
    setMessage(`${row.name} registration ${opening ? "opened" : "closed"}.`);
    await load();
  }

  return <section style={{marginTop:20,padding:18,border:"2px solid #0ea5e9",borderRadius:16,background:"#fff"}}>
    <div style={{fontSize:12,fontWeight:900,color:"#0369a1",letterSpacing:1}}>JARVIS TOURNAMENT MANAGER</div>
    <h2 style={{margin:"5px 0"}}>One-Day Tournament Registration</h2>
    <p style={{color:"#6b7280"}}>Create a tournament as a draft first, then open registration only when you are ready.</p>
    {message && <div style={{padding:10,background:"#f3f4f6",borderRadius:10,fontWeight:700}}>{message}</div>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginTop:12}}>
      <input placeholder="Tournament name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <select value={form.sport_key} onChange={e=>setForm({...form,sport_key:e.target.value})}><option value="softball">Softball</option><option value="kickball">Kickball</option></select>
      <input type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})}/>
      <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
      <input placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
      <input type="number" min="1" placeholder="Fields" value={form.field_count} onChange={e=>setForm({...form,field_count:e.target.value})}/>
      <input type="number" min="2" placeholder="Team cap" value={form.team_cap} onChange={e=>setForm({...form,team_cap:e.target.value})}/>
      <input type="number" min="0" placeholder="Entry fee $" value={form.entry_fee} onChange={e=>setForm({...form,entry_fee:e.target.value})}/>
      <input type="number" min="1" placeholder="Guaranteed games" value={form.guaranteed_games} onChange={e=>setForm({...form,guaranteed_games:e.target.value})}/>
      <input placeholder="Format" value={form.format} onChange={e=>setForm({...form,format:e.target.value})}/>
      <input placeholder="Prize (ex: $400 cash prize)" value={form.prize_text} onChange={e=>setForm({...form,prize_text:e.target.value})}/>
    </div>
    <button onClick={prepare} style={{marginTop:10,padding:"10px 14px",background:"#0ea5e9",color:"white",border:0,borderRadius:10,fontWeight:900}}>Prepare Tournament</button>
    {pending && <div style={{marginTop:14,padding:14,border:"2px solid #0ea5e9",borderRadius:12,background:"#f0f9ff"}}><div style={{fontSize:12,fontWeight:900,color:"#0369a1"}}>PROPOSED TOURNAMENT — NOTHING CHANGED YET</div><h3>{pending.name}</h3><p>{pending.sport_key} · {pending.event_date || "date TBD"} · {pending.team_cap} teams · ${pending.entry_fee} · {pending.guaranteed_games} games guaranteed · {pending.location || "location TBD"}</p><button disabled={busy} onClick={approve} style={{padding:"9px 14px",background:"#15803d",color:"white",border:0,borderRadius:9,fontWeight:900}}>Approve Draft</button> <button disabled={busy} onClick={()=>setPending(null)}>Cancel</button></div>}
    <hr style={{margin:"20px 0",border:0,borderTop:"1px solid #e5e7eb"}}/>
    <h3>Existing Tournaments</h3>
    {!rows.length && <p style={{color:"#6b7280"}}>No tournaments created yet.</p>}
    <div style={{display:"grid",gap:8}}>{rows.map(r=><div key={r.tournament_key} style={{padding:12,border:"1px solid #e5e7eb",borderRadius:10}}><strong>{r.name}</strong> · {r.status} · {r.event_date || "TBD"} · {r.team_cap || "?"} teams · {r.entry_fee_cents!=null?`$${(r.entry_fee_cents/100).toFixed(0)}`:"price TBD"}<div style={{marginTop:7}}><button onClick={()=>toggleRegistration(r)}>{r.registration_enabled ? "Close Registration" : "Open Registration"}</button></div></div>)}</div>
  </section>;
}
