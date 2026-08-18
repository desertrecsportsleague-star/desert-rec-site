import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";

const defaultForm = {
  name:"", sport_key:"softball", event_date:"", start_time:"07:00", end_time:"18:00",
  location:"", city:"Buckeye, Arizona", field_count:"1", team_cap:"8", entry_fee:"450",
  guaranteed_games:"2", format:"Pool play + bracket", prize_text:"$400 cash prize",
  team_only:true, payment_required:true, waiver_required:true, registration_deadline:"",
  rules_text:"", contact_name:"Mario Marquez", contact_email:"desertrecsportsleague@gmail.com",
  contact_phone:"", stripe_price_id:"", stripe_payment_link:""
};

export default function JarvisTournamentManager() {
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await supabase.from("tournaments").select("tournament_key,name,sport_key,status,event_date,start_time,end_time,location,city,field_count,team_cap,entry_fee_cents,guaranteed_games,format,prize_text,registration_enabled,team_only,payment_required,waiver_required,registration_deadline,stripe_price_id,stripe_payment_link").order("event_date", { ascending:false });
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
    if (!form.event_date) return setMessage("Tournament date is required.");
    if (!form.location.trim()) return setMessage("Tournament location is required.");
    if (!form.start_time || !form.end_time) return setMessage("Start and end times are required.");
    if (Number(form.team_cap) < 2) return setMessage("Team cap must be at least 2.");
    if (Number(form.entry_fee) < 0) return setMessage("Enter a valid entry fee.");
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
        event_date: pending.event_date,
        start_time: pending.start_time || null,
        end_time: pending.end_time || null,
        location: pending.location || null,
        city: pending.city || null,
        field_count: pending.field_count ? Number(pending.field_count) : null,
        team_cap: pending.team_cap ? Number(pending.team_cap) : null,
        entry_fee_cents: pending.entry_fee ? Math.round(Number(pending.entry_fee)*100) : 0,
        guaranteed_games: pending.guaranteed_games ? Number(pending.guaranteed_games) : null,
        format: pending.format || null,
        prize_text: pending.prize_text || null,
        team_only: !!pending.team_only,
        free_agent_enabled: !pending.team_only,
        payment_required: !!pending.payment_required,
        waiver_required: !!pending.waiver_required,
        registration_deadline: pending.registration_deadline ? new Date(pending.registration_deadline).toISOString() : null,
        rules_text: pending.rules_text || null,
        contact_name: pending.contact_name || null,
        contact_email: pending.contact_email || null,
        contact_phone: pending.contact_phone || null,
        stripe_price_id: pending.stripe_price_id || null,
        stripe_payment_link: pending.stripe_payment_link || null,
        registration_enabled:false,
        settings:{
          registration_mode: pending.team_only ? "team_only" : "team_and_free_agent",
          payment_gate: !!pending.payment_required,
          waiver_gate: !!pending.waiver_required
        }
      });
      if (error) throw error;
      setMessage(`Created complete draft tournament: ${pending.name}`);
      setPending(null);
      setForm(defaultForm);
      await load();
    } catch (e) { setMessage(e?.message || String(e)); }
    finally { setBusy(false); }
  }

  async function toggleRegistration(row) {
    const opening = !row.registration_enabled;
    if (opening && row.payment_required && !row.stripe_price_id && !row.stripe_payment_link) {
      return setMessage("Payment is required, but Stripe is not configured for this tournament yet. Add a Stripe Price ID or payment link before opening registration.");
    }
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
    <p style={{color:"#6b7280"}}>Build the full event as a draft first. Registration stays closed until the event and payment setup are ready.</p>
    {message && <div style={{padding:10,background:"#f3f4f6",borderRadius:10,fontWeight:700}}>{message}</div>}

    <h3>Event Setup</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginTop:12}}>
      <input placeholder="Tournament name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
      <select value={form.sport_key} onChange={e=>setForm({...form,sport_key:e.target.value})}><option value="softball">Softball</option><option value="kickball">Kickball</option></select>
      <input type="date" value={form.event_date} onChange={e=>setForm({...form,event_date:e.target.value})}/>
      <input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})}/>
      <input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})}/>
      <input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/>
      <input placeholder="City" value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/>
      <input type="number" min="1" placeholder="Fields" value={form.field_count} onChange={e=>setForm({...form,field_count:e.target.value})}/>
      <input type="number" min="2" placeholder="Team cap" value={form.team_cap} onChange={e=>setForm({...form,team_cap:e.target.value})}/>
      <input type="number" min="0" placeholder="Entry fee $" value={form.entry_fee} onChange={e=>setForm({...form,entry_fee:e.target.value})}/>
      <input type="number" min="1" placeholder="Guaranteed games" value={form.guaranteed_games} onChange={e=>setForm({...form,guaranteed_games:e.target.value})}/>
      <input placeholder="Format" value={form.format} onChange={e=>setForm({...form,format:e.target.value})}/>
      <input placeholder="Prize" value={form.prize_text} onChange={e=>setForm({...form,prize_text:e.target.value})}/>
      <input type="datetime-local" value={form.registration_deadline} onChange={e=>setForm({...form,registration_deadline:e.target.value})}/>
    </div>

    <h3 style={{marginTop:18}}>Registration Rules</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:8}}>
      <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" checked={form.team_only} onChange={e=>setForm({...form,team_only:e.target.checked})}/> Team sign-up only / no free agents</label>
      <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" checked={form.payment_required} onChange={e=>setForm({...form,payment_required:e.target.checked})}/> Payment required before registration is complete</label>
      <label style={{display:"flex",gap:8,alignItems:"center"}}><input type="checkbox" checked={form.waiver_required} onChange={e=>setForm({...form,waiver_required:e.target.checked})}/> Waiver required</label>
    </div>
    <textarea rows="4" style={{marginTop:8}} placeholder="Tournament rules / notes" value={form.rules_text} onChange={e=>setForm({...form,rules_text:e.target.value})}/>

    <h3 style={{marginTop:18}}>Contact + Payment Setup</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:8}}>
      <input placeholder="Contact name" value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})}/>
      <input placeholder="Contact email" value={form.contact_email} onChange={e=>setForm({...form,contact_email:e.target.value})}/>
      <input placeholder="Contact phone" value={form.contact_phone} onChange={e=>setForm({...form,contact_phone:e.target.value})}/>
      <input placeholder="Stripe Price ID (optional for draft)" value={form.stripe_price_id} onChange={e=>setForm({...form,stripe_price_id:e.target.value})}/>
      <input placeholder="Stripe payment link (optional for draft)" value={form.stripe_payment_link} onChange={e=>setForm({...form,stripe_payment_link:e.target.value})}/>
    </div>
    <div style={{fontSize:13,color:"#6b7280",marginTop:6}}>You can save the draft without Stripe configured. Jarvis will block opening paid registration until a Stripe Price ID or payment link is present.</div>

    <button onClick={prepare} style={{marginTop:14,padding:"10px 14px",background:"#0ea5e9",color:"white",border:0,borderRadius:10,fontWeight:900}}>Prepare Tournament</button>

    {pending && <div style={{marginTop:14,padding:14,border:"2px solid #0ea5e9",borderRadius:12,background:"#f0f9ff"}}>
      <div style={{fontSize:12,fontWeight:900,color:"#0369a1"}}>PROPOSED TOURNAMENT — NOTHING CHANGED YET</div>
      <h3>{pending.name}</h3>
      <p>{pending.sport_key} · {pending.event_date} · {pending.start_time}-{pending.end_time} · {pending.team_cap} teams · ${pending.entry_fee} · {pending.guaranteed_games} games guaranteed · {pending.location}</p>
      <p><strong>Registration:</strong> {pending.team_only ? "Team only" : "Teams + free agents"} · Payment {pending.payment_required ? "required" : "optional"} · Waiver {pending.waiver_required ? "required" : "optional"}{pending.registration_deadline ? ` · Deadline ${new Date(pending.registration_deadline).toLocaleString()}` : ""}</p>
      <p><strong>Prize:</strong> {pending.prize_text || "None set"} · <strong>Stripe:</strong> {pending.stripe_price_id || pending.stripe_payment_link ? "configured" : "not configured yet"}</p>
      <button disabled={busy} onClick={approve} style={{padding:"9px 14px",background:"#15803d",color:"white",border:0,borderRadius:9,fontWeight:900}}>Approve Draft</button> <button disabled={busy} onClick={()=>setPending(null)}>Cancel</button>
    </div>}

    <hr style={{margin:"20px 0",border:0,borderTop:"1px solid #e5e7eb"}}/>
    <h3>Existing Tournaments</h3>
    {!rows.length && <p style={{color:"#6b7280"}}>No tournaments created yet.</p>}
    <div style={{display:"grid",gap:8}}>{rows.map(r=><div key={r.tournament_key} style={{padding:12,border:"1px solid #e5e7eb",borderRadius:10}}>
      <strong>{r.name}</strong> · {r.status} · {r.event_date || "TBD"} · {r.start_time || "?"}-{r.end_time || "?"} · {r.team_cap || "?"} teams · {r.entry_fee_cents!=null?`$${(r.entry_fee_cents/100).toFixed(0)}`:"price TBD"}
      <div style={{fontSize:13,color:"#6b7280",marginTop:4}}>{r.team_only ? "Team only" : "Teams + free agents"} · Payment {r.payment_required ? "required" : "optional"} · Waiver {r.waiver_required ? "required" : "optional"}</div>
      <div style={{marginTop:7}}><button onClick={()=>toggleRegistration(r)}>{r.registration_enabled ? "Close Registration" : "Open Registration"}</button></div>
    </div>)}</div>
  </section>;
}
