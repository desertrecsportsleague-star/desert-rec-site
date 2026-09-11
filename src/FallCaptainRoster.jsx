import {useEffect,useState} from 'react';
import {supabase} from './supabaseClient';

const KEY='softball_fall_softball_19578';
const card={padding:24,border:'1px solid #dbe2ea',borderRadius:18,background:'#fff',marginBottom:18,boxShadow:'0 10px 30px rgba(15,23,42,.08)',color:'#172033'};
const input={width:'100%',boxSizing:'border-box',padding:'13px 14px',border:'1px solid #cbd5e1',borderRadius:10,background:'#fff',color:'#172033',fontSize:16};
const primary={padding:'12px 16px',border:0,borderRadius:10,background:'#c76a28',color:'#fff',fontWeight:900,cursor:'pointer'};
const secondary={...primary,background:'#26354a'};

export default function FallCaptainRoster(){
  const[email,setEmail]=useState('');
  const[user,setUser]=useState(null);
  const[team,setTeam]=useState(null);
  const[players,setPlayers]=useState([]);
  const[form,setForm]=useState({player_name:'',player_email:'',player_phone:''});
  const[msg,setMsg]=useState('');
  const[busy,setBusy]=useState(false);

  useEffect(()=>{
    let mounted=true;
    supabase.auth.getUser().then(({data})=>{if(mounted)setUser(data?.user||null)});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>{if(mounted)setUser(s?.user||null)});
    return()=>{mounted=false;subscription.unsubscribe()};
  },[]);

  useEffect(()=>{if(user)loadRoster();else{setTeam(null);setPlayers([])}},[user]);

  async function sendLink(e){
    e.preventDefault();setBusy(true);setMsg('');
    try{
      const{error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:`${location.origin}/fall-softball-captain`}});
      if(error)throw error;
      setMsg('Secure sign-in link sent. Open the email on this device, then return here.');
    }catch(e){setMsg(e.message||String(e))}finally{setBusy(false)}
  }

  async function loadRoster(){
    setBusy(true);setMsg('');
    try{
      const{data,error}=await supabase.rpc('captain_get_fall_roster',{p_season_key:KEY});
      if(error)throw error;
      const rows=data||[];
      if(!rows.length){setTeam(null);setPlayers([]);setMsg('No paid Fall team is connected to this signed-in captain email.');return}
      const first=rows[0];
      setTeam({id:first.team_id,name:first.team_name,captain:first.captain_name});
      setPlayers(rows.filter(r=>r.player_id).map(r=>({id:r.player_id,name:r.player_name,email:r.player_email,phone:r.player_phone,signed:r.signed_waiver})));
    }catch(e){setMsg(e.message||String(e))}finally{setBusy(false)}
  }

  async function addPlayer(e){
    e.preventDefault();if(!form.player_name.trim())return;
    setBusy(true);setMsg('');
    try{
      const{error}=await supabase.rpc('captain_add_fall_player',{p_season_key:KEY,p_player_name:form.player_name.trim(),p_player_email:form.player_email.trim()||null,p_player_phone:form.player_phone.trim()||null});
      if(error)throw error;
      setForm({player_name:'',player_email:'',player_phone:''});
      setMsg('Player added. They can now find the team and sign their waiver.');
      await loadRoster();
    }catch(e){setMsg(e.message||String(e))}finally{setBusy(false)}
  }

  async function removePlayer(player){
    if(player.signed)return setMsg('Signed waiver records cannot be removed by a captain. Contact Desert Rec if a correction is needed.');
    if(!confirm(`Remove ${player.name} from the roster?`))return;
    setBusy(true);setMsg('');
    try{
      const{error}=await supabase.rpc('captain_remove_fall_player',{p_season_key:KEY,p_player_id:player.id});
      if(error)throw error;
      await loadRoster();
    }catch(e){setMsg(e.message||String(e))}finally{setBusy(false)}
  }

  async function signOut(){await supabase.auth.signOut();setMsg('Signed out.')}

  return <div style={{minHeight:'100vh',background:'#f3f5f8',padding:'28px 16px',fontFamily:'Arial,Helvetica,sans-serif'}}><main style={{maxWidth:900,margin:'0 auto'}}>
    <div style={{...card,textAlign:'center',background:'linear-gradient(135deg,#26354a,#172033)',color:'#fff'}}>
      <div style={{fontSize:12,fontWeight:900,letterSpacing:1.5,color:'#f0a05d'}}>FALL SOFTBALL CAPTAIN PORTAL</div>
      <h1 style={{margin:'8px 0',color:'#fff'}}>Manage Your Team Roster</h1>
      <p style={{color:'#e7edf5'}}>Paid captains only · players sign their own waivers</p>
    </div>

    {!user?<div style={card}><h2>Captain Sign In</h2><p>Use the same captain email used for your paid Fall registration.</p><form onSubmit={sendLink} style={{display:'grid',gap:10}}><input style={input} required type="email" placeholder="Captain email" value={email} onChange={e=>setEmail(e.target.value)}/><button disabled={busy} style={primary}>{busy?'Sending…':'Email Me a Secure Sign-In Link'}</button></form>{msg&&<Notice>{msg}</Notice>}</div>:<>
      <div style={card}><div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:13,color:'#6b7280'}}>Signed in as {user.email}</div><h2 style={{margin:'4px 0'}}>{team?team.name:'Loading team…'}</h2>{team&&<div>Captain: {team.captain}</div>}</div><div style={{display:'flex',gap:8}}><button style={secondary} onClick={loadRoster}>Refresh</button><button style={{...secondary,background:'#e5e7eb',color:'#111827'}} onClick={signOut}>Sign Out</button></div></div>{msg&&<Notice>{msg}</Notice>}</div>

      {team&&<><div style={card}><h2>Add Roster Player</h2><p style={{color:'#6b7280'}}>Add each player's name before sending them to the waiver page. Email and phone are optional.</p><form onSubmit={addPlayer} style={{display:'grid',gap:10}}><input style={input} required placeholder="Player full name" value={form.player_name} onChange={e=>setForm({...form,player_name:e.target.value})}/><input style={input} type="email" placeholder="Player email (optional)" value={form.player_email} onChange={e=>setForm({...form,player_email:e.target.value})}/><input style={input} placeholder="Player phone (optional)" value={form.player_phone} onChange={e=>setForm({...form,player_phone:e.target.value})}/><button disabled={busy} style={primary}>Add Player</button></form></div>

      <div style={card}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}><h2 style={{margin:0}}>Current Roster</h2><b>{players.length} player{players.length===1?'':'s'}</b></div>{!players.length?<p style={{color:'#6b7280'}}>No players added yet.</p>:players.map(p=><div key={p.id} style={{padding:'12px 0',borderBottom:'1px solid #eee',display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><b>{p.name}</b>{p.email&&<div style={{color:'#6b7280',fontSize:14}}>{p.email}</div>}<div style={{fontSize:13,fontWeight:900,color:p.signed?'#166534':'#b45309'}}>{p.signed?'WAIVER SIGNED':'WAIVER NEEDED'}</div></div><button disabled={p.signed||busy} onClick={()=>removePlayer(p)} style={{...secondary,background:p.signed?'#e5e7eb':'#fee2e2',color:p.signed?'#6b7280':'#991b1b'}}>Remove</button></div>)}</div>

      <div style={card}><h3>Player Waiver Link</h3><p>After you add players, send them here:</p><a href="/fall-softball" style={{...primary,display:'inline-block',textDecoration:'none'}}>Open Fall Softball Waiver Page</a></div></>}
    </>}
  </main></div>
}

function Notice({children}){return <div style={{marginTop:12,padding:'12px 14px',borderRadius:10,background:'#fff7ed',border:'1px solid #fed7aa',color:'#9a3412',fontWeight:700}}>{children}</div>}
