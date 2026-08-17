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
    if (!open.length) return "No season currently has registration enabled in the new Jarvis season system.";
    return open.map((s) => `${s.name}: registration open${s.registration_close_at ? ` until ${prettyDate(s.registration_close_at)}` : ""}.`).join("\n");
  }

  if (q.includes("active") || q.includes("current")) {
    const active = seasons.filter((s) => s.status === "active");
    if (!active.length) return "No seasons are currently marked active.";
    return active.map((s) => `${s.name} — ${s.day_label || "day TBD"} at ${s.location || "location TBD"}.`).join("\n");
  }

  if (q.includes("price") || q.includes("cost")) {
    return seasons.map((s) => `${s.name}: team ${money(s.team_price_cents)}, free agent ${money(s.free_agent_price_cents)}.`).join("\n");
  }

  if (q.includes("where") || q.includes("location")) {
    return seasons.map((s) => `${s.name}: ${s.location || "TBD"}${s.city ? `, ${s.city}` : ""}.`).join("\n");
  }

  if (q.includes("season") || q.includes("league") || q.includes("show")) {
    if (!seasons.length) return "I couldn't find any visible seasons in Supabase.";
    return seasons.map((s) => `${s.name} — ${s.status} — starts ${prettyDate(s.start_date)}.`).join("\n");
  }

  return "I can currently read the new Desert Rec season system. Try: “show active seasons”, “what registration is open?”, “show prices”, or “where are games played?”";
}

export default function JarvisPanel() {
  const [allowed, setAllowed] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [command, setCommand] = useState("");
  const [response, setResponse] = useState("Jarvis is connected to the new Desert Rec season database in read-only preview mode.");
  const [error, setError] = useState("");

  async function loadSeasons() {
    setLoading(true);
    setError("");
    try {
      const { data, error: seasonError } = await supabase
        .from("seasons")
        .select("season_key,sport_key,name,title,status,start_date,end_date,registration_open_at,registration_close_at,day_label,location,city,team_cap,team_price_cents,free_agent_price_cents,registration_enabled")
        .order("start_date", { ascending: false });
      if (seasonError) throw seasonError;
      setSeasons(data || []);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  async function syncUser(user) {
    const isAdmin = (user?.email || "").toLowerCase() === ADMIN_EMAIL;
    setAllowed(isAdmin);
    if (isAdmin) await loadSeasons();
    else {
      setOpen(false);
      setLoading(false);
      setSeasons([]);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getUser();
      if (mounted) await syncUser(data?.user ?? null);
    }

    boot();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) syncUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const activeCount = useMemo(() => seasons.filter((s) => s.status === "active").length, [seasons]);

  if (!allowed) return null;

  function runCommand(e) {
    e.preventDefault();
    setResponse(answerCommand(command, seasons));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Desert Rec Jarvis"
        style={{ position: "fixed", right: 18, bottom: 18, zIndex: 9998, border: "2px solid #f59e0b", borderRadius: 999, padding: "14px 20px", background: "#111827", color: "white", fontWeight: 900, fontSize: 15, boxShadow: "0 10px 30px rgba(0,0,0,.28)", cursor: "pointer" }}
      >
        ⚡ JARVIS
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: 16 }}>
          <section style={{ width: "min(760px, 100%)", maxHeight: "88vh", overflow: "auto", background: "#fff", borderRadius: 20, padding: 22, boxShadow: "0 24px 70px rgba(0,0,0,.35)", color: "#111827" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: "#b45309" }}>DESERT REC COMMAND CENTER</div>
                <h2 style={{ margin: "5px 0 4px" }}>Jarvis Preview</h2>
                <p style={{ margin: 0, color: "#6b7280" }}>Safe branch · read-only database commands · production unchanged</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{ border: "1px solid #d1d5db", background: "white", borderRadius: 10, padding: "8px 11px", cursor: "pointer" }}>Close</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, margin: "18px 0" }}>
              <div style={{ padding: 14, borderRadius: 14, background: "#f9fafb", border: "1px solid #e5e7eb" }}><div style={{ fontSize: 12, color: "#6b7280" }}>Visible Seasons</div><strong style={{ fontSize: 26 }}>{seasons.length}</strong></div>
              <div style={{ padding: 14, borderRadius: 14, background: "#f9fafb", border: "1px solid #e5e7eb" }}><div style={{ fontSize: 12, color: "#6b7280" }}>Active Seasons</div><strong style={{ fontSize: 26 }}>{activeCount}</strong></div>
              <div style={{ padding: 14, borderRadius: 14, background: "#f9fafb", border: "1px solid #e5e7eb" }}><div style={{ fontSize: 12, color: "#6b7280" }}>Mode</div><strong style={{ fontSize: 18 }}>READ ONLY</strong></div>
            </div>

            {loading && <p>Connecting to Supabase…</p>}
            {error && <p style={{ color: "#b91c1c" }}>Jarvis connection error: {error}</p>}

            <form onSubmit={runCommand} style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Ask Jarvis about your leagues…"
                style={{ flex: 1, minWidth: 0, border: "1px solid #d1d5db", borderRadius: 12, padding: "12px 14px", fontSize: 16 }}
              />
              <button type="submit" style={{ border: 0, borderRadius: 12, padding: "12px 16px", background: "#f59e0b", color: "#111827", fontWeight: 900, cursor: "pointer" }}>Ask</button>
            </form>

            <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6, background: "#111827", color: "#f9fafb", borderRadius: 14, padding: 16, marginTop: 12 }}>{response}</pre>

            <div style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6, color: "#6b7280" }}>
              Next phase: approved Jarvis actions for creating seasons, opening registration, changing pricing, and preparing website deployments.
            </div>
          </section>
        </div>
      )}
    </>
  );
}
