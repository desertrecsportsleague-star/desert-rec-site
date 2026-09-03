import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAIL = "desertrecsportsleague@gmail.com";
const BUCKET = "desert-rec-media";

function cleanFileName(name = "image") {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export default function JarvisWebsiteManager() {
  const [allowed, setAllowed] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [media, setMedia] = useState([]);
  const [content, setContent] = useState({ home_headline: "", home_subheadline: "", home_announcement: "" });
  const [sport, setSport] = useState("softball");
  const [season, setSeason] = useState("");
  const [category, setCategory] = useState("League Photos");
  const [featured, setFeatured] = useState(false);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const [{ data: seasonRows }, { data: mediaRows }, { data: contentRows }] = await Promise.all([
      supabase.from("seasons").select("season_key,name,sport_key").order("start_date", { ascending: false }),
      supabase.from("media_assets").select("id,public_url,file_name,sport_key,season_key,category,featured_home,active,created_at").eq("active", true).order("created_at", { ascending: false }).limit(30),
      supabase.from("site_content").select("key,value")
    ]);
    setSeasons(seasonRows || []);
    setMedia(mediaRows || []);
    const next = { home_headline: "", home_subheadline: "", home_announcement: "" };
    (contentRows || []).forEach((r) => { if (r.key in next) next[r.key] = r.value || ""; });
    setContent(next);
  }

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      const ok = (data?.user?.email || "").toLowerCase() === ADMIN_EMAIL;
      if (!mounted) return;
      setAllowed(ok);
      if (ok) await load();
    });
    return () => { mounted = false; };
  }, []);

  if (!allowed) return null;

  async function uploadPhotos() {
    if (!files.length) return setMessage("Choose one or more photos first.");
    setBusy(true); setMessage("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let count = 0;
      for (const file of files) {
        const safe = cleanFileName(file.name);
        const path = `${sport}/${season || "general"}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
        const { error: rowError } = await supabase.from("media_assets").insert({ storage_path: path, public_url: publicData.publicUrl, file_name: file.name, mime_type: file.type || null, file_size: file.size || null, sport_key: sport, season_key: season || null, category: category || null, alt_text: `${sport} ${category || "league photo"}`, featured_home: featured, uploaded_by: user?.id || null });
        if (rowError) throw rowError;
        count += 1;
      }
      setFiles([]);
      const input = document.getElementById("jarvis-media-files"); if (input) input.value = "";
      setMessage(`${count} photo${count === 1 ? "" : "s"} uploaded successfully.`);
      await load();
    } catch (e) { setMessage(`Upload failed: ${e?.message || e}`); } finally { setBusy(false); }
  }

  async function saveContent() {
    setBusy(true); setMessage("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const rows = Object.entries(content).map(([key, value]) => ({ key, value, updated_at: new Date().toISOString(), updated_by: user?.id || null }));
      const { error } = await supabase.from("site_content").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      setMessage("Homepage content saved. Preview homepage will update automatically.");
    } catch (e) { setMessage(`Save failed: ${e?.message || e}`); } finally { setBusy(false); }
  }

  async function toggleFeatured(item) {
    const { error } = await supabase.from("media_assets").update({ featured_home: !item.featured_home, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (error) return setMessage(error.message);
    setMessage(!item.featured_home ? "Photo featured. Preview homepage will update automatically." : "Photo removed from homepage feature rotation.");
    await load();
  }

  async function archiveMedia(item) {
    if (!window.confirm(`Remove ${item.file_name} from the website media library? The stored file will be retained for recovery.`)) return;
    const { error } = await supabase.from("media_assets").update({ active: false, featured_home: false, updated_at: new Date().toISOString() }).eq("id", item.id);
    if (error) return setMessage(error.message);
    setMessage("Photo removed from website display. Original file retained in storage.");
    await load();
  }

  const eligibleSeasons = seasons.filter((s) => s.sport_key === sport);

  return <section style={{marginTop:20,padding:18,border:"2px solid #f59e0b",borderRadius:16,background:"#fff"}}>
    <div style={{fontSize:12,fontWeight:900,color:"#b45309",letterSpacing:1}}>JARVIS WEBSITE MANAGER</div>
    <h2 style={{margin:"5px 0"}}>Media + Homepage</h2>
    <p style={{color:"#6b7280"}}>Upload league photos and manage homepage content without editing code.</p>
    {message && <div style={{padding:12,borderRadius:10,background:"#f3f4f6",margin:"10px 0",fontWeight:700}}>{message}</div>}

    <h3>Upload Photos</h3>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8}}>
      <select value={sport} onChange={(e)=>{setSport(e.target.value);setSeason("");}}><option value="softball">Softball</option><option value="kickball">Kickball</option></select>
      <select value={season} onChange={e=>setSeason(e.target.value)}><option value="">General / no season</option>{eligibleSeasons.map(s=><option key={s.season_key} value={s.season_key}>{s.name}</option>)}</select>
      <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category (Week 6, Championship...)" />
      <label style={{display:"flex",alignItems:"center",gap:8}}><input type="checkbox" checked={featured} onChange={e=>setFeatured(e.target.checked)}/> Feature on homepage</label>
    </div>
    <input id="jarvis-media-files" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={e=>setFiles(Array.from(e.target.files || []))} style={{marginTop:10}}/>
    <div style={{fontSize:13,color:"#6b7280",marginTop:4}}>{files.length ? `${files.length} photo(s) selected` : "JPEG, PNG, WebP, HEIC · up to 50 MB each"}</div>
    <button disabled={busy || !files.length} onClick={uploadPhotos} style={{marginTop:10,padding:"10px 14px",background:"#f59e0b",border:0,borderRadius:10,fontWeight:900}}>{busy ? "Working…" : "Upload Photos"}</button>

    <hr style={{margin:"22px 0",border:0,borderTop:"1px solid #e5e7eb"}}/>
    <h3>Homepage Content</h3>
    <div style={{display:"grid",gap:8}}>
      <input value={content.home_headline} onChange={e=>setContent({...content,home_headline:e.target.value})} placeholder="Homepage headline" />
      <textarea rows="2" value={content.home_subheadline} onChange={e=>setContent({...content,home_subheadline:e.target.value})} placeholder="Homepage subheadline" />
      <textarea rows="2" value={content.home_announcement} onChange={e=>setContent({...content,home_announcement:e.target.value})} placeholder="Optional announcement banner" />
    </div>
    <button disabled={busy} onClick={saveContent} style={{marginTop:10,padding:"10px 14px",background:"#111827",color:"white",border:0,borderRadius:10,fontWeight:900}}>Save Homepage Content</button>

    <hr style={{margin:"22px 0",border:0,borderTop:"1px solid #e5e7eb"}}/>
    <h3>Recent Media</h3>
    {!media.length && <p style={{color:"#6b7280"}}>No Jarvis-managed photos yet.</p>}
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:12}}>{media.map(item=><article key={item.id} style={{border:"1px solid #e5e7eb",borderRadius:12,overflow:"hidden"}}><img src={item.public_url} alt={item.file_name} style={{width:"100%",height:120,objectFit:"cover",display:"block"}}/><div style={{padding:9,fontSize:12}}><strong style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.file_name}</strong><div>{item.category || "League photo"}</div><div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}><button onClick={()=>toggleFeatured(item)}>{item.featured_home ? "Unfeature" : "Feature"}</button><button onClick={()=>archiveMedia(item)}>Remove</button></div></div></article>)}</div>
  </section>;
}
