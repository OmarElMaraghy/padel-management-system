import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import PlayerProfile from "./pages/PlayerProfile";
import { apiFetch } from "./lib/api";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const G = {
  green: "#1D9E75", greenDark: "#0F6E56", greenDeep: "#085041", accent: "#04342C",
  greenLight: "#E1F5EE", greenMid: "#9FE1CB", amber: "#EF9F27", amberLight: "#FAEEDA",
  coral: "#D85A30", coralLight: "#FAECE7", surface: "#F4F7F4", card: "#FFFFFF",
  border: "rgba(29,158,117,0.13)", borderMed: "rgba(29,158,117,0.25)",
  text: "#0e1a0e", muted: "#4f5f4f", hint: "#8a9a8a",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const eloHistory = [
  { match: "M1", elo: 1200 }, { match: "M2", elo: 1218 }, { match: "M3", elo: 1205 },
  { match: "M4", elo: 1240 }, { match: "M5", elo: 1262 }, { match: "M6", elo: 1251 },
  { match: "M7", elo: 1288 }, { match: "M8", elo: 1310 }, { match: "M9", elo: 1330 },
  { match: "M10", elo: 1320 }, { match: "M11", elo: 1355 }, { match: "M12", elo: 1400 },
];
const winData = [
  { month: "Nov", wins: 2, losses: 3 }, { month: "Dec", wins: 4, losses: 2 },
  { month: "Jan", wins: 3, losses: 4 }, { month: "Feb", wins: 5, losses: 2 },
  { month: "Mar", wins: 6, losses: 2 }, { month: "Apr", wins: 4, losses: 1 },
];
const radarData = [
  { skill: "Serve", you: 60, avg: 65 },
  { skill: "Volley", you: 55, avg: 62 },
  { skill: "Backwall", you: 70, avg: 60 },
  { skill: "Consistency", you: 65, avg: 68 },
  { skill: "Smash", you: 50, avg: 70 },
  { skill: "Movement", you: 72, avg: 65 },
];
const leaderboard = [
  { rank: 1, name: "Ahmed M.", initials: "AM", wins: 22, losses: 4, elo: 1847, trend: "+24" },
  { rank: 2, name: "Karim S.", initials: "KS", wins: 19, losses: 6, elo: 1712, trend: "+11" },
  { rank: 3, name: "Omar A.", initials: "OA", wins: 16, losses: 7, elo: 1634, trend: "+18" },
  { rank: 4, name: "Mohamed H.", initials: "MH", wins: 14, losses: 9, elo: 1520, trend: "-6" },
  { rank: 5, name: "Youssef R.", initials: "YR", wins: 12, losses: 10, elo: 1488, trend: "+3" },
];
const matchHistory = [
  { date: "Apr 28", partner: "Karim S.", vs: "Ahmed M. & Tarek B.", score: "6-4, 6-3", result: "W", eloChange: "+18" },
  { date: "Apr 24", partner: "Youssef R.", vs: "Mohamed H. & Samy K.", score: "4-6, 3-6", result: "L", eloChange: "-14" },
  { date: "Apr 20", partner: "Karim S.", vs: "Adel F. & Tarek B.", score: "6-2, 6-1", result: "W", eloChange: "+11" },
  { date: "Apr 15", partner: "Mohamed H.", vs: "Ahmed M. & Youssef R.", score: "7-5, 6-4", result: "W", eloChange: "+22" },
];
const courts = [
  { id: 1, name: "Court A", slots: ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00"], busy: ["09:00","11:00","14:00"] },
  { id: 2, name: "Court B", slots: ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00"], busy: ["08:00","10:00","12:00","15:00"] },
  { id: 3, name: "Court C", slots: ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00"], busy: ["09:00","13:00"] },
];
const matchmakingPlayers = [
  { name: "Karim S.", initials: "KS", elo: 1412, winRate: "66%", distance: "1.2km", style: "Aggressive", compatible: 94 },
  { name: "Youssef R.", initials: "YR", elo: 1388, winRate: "55%", distance: "0.8km", style: "Defensive", compatible: 88 },
  { name: "Mohamed H.", initials: "MH", elo: 1420, winRate: "61%", distance: "2.1km", style: "Balanced", compatible: 85 },
  { name: "Tarek B.", initials: "TB", elo: 1345, winRate: "50%", distance: "3.0km", style: "Aggressive", compatible: 79 },
];

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const styles = {
  card: { background: G.card, border: `0.5px solid ${G.border}`, borderRadius: 14, padding: "20px" },
  btn: { background: G.green, color: "white", border: "none", padding: "10px 20px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
  btnGhost: { background: "transparent", color: G.accent, border: `0.5px solid ${G.borderMed}`, padding: "9px 18px", borderRadius: 9, fontSize: 13, fontWeight: 400, cursor: "pointer", fontFamily: "inherit" },
};

function Badge({ children, color = "green" }) {
  const colors = { green: { bg: G.greenLight, text: G.greenDark }, amber: { bg: G.amberLight, text: "#633806" }, coral: { bg: G.coralLight, text: "#4A1B0C" }, gray: { bg: "#f0f0ee", text: G.muted } };
  const c = colors[color];
  return <span style={{ background: c.bg, color: c.text, fontSize: 11, fontWeight: 500, padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>{children}</span>;
}

function Avatar({ initials, size = 36, isYou = false }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: isYou ? G.green : G.greenLight, color: isYou ? "white" : G.greenDark, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 600, flexShrink: 0 }}>{initials}</div>;
}

function StatCard({ label, value, sub, color = G.green }) {
  return (
    <div style={{ ...styles.card, textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "Georgia, serif", letterSpacing: -1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: G.hint, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: G.accent, letterSpacing: -0.5, margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 13, color: G.muted, margin: "4px 0 0", fontWeight: 300 }}>{sub}</p>}
    </div>
  );
}

function formatShortDate(value) {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatShortDateTime(value) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeLabel(value) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

function getPlayerEntry(match, playerId) {
  return match?.players?.find((player) => player.playerId === playerId) ?? null;
}

function buildMatchSummary(match, playerId) {
  const playerEntry = getPlayerEntry(match, playerId);
  if (!playerEntry || match.status !== "Completed") {
    return null;
  }

  const teammates = (match.players ?? []).filter(
    (player) => player.team === playerEntry.team && player.playerId !== playerId
  );
  const opponents = (match.players ?? []).filter((player) => player.team !== playerEntry.team);
  const eloChange = (playerEntry.eloAfterMatch ?? playerEntry.eloRating) - (playerEntry.eloBeforeMatch ?? playerEntry.eloRating);
  const didWin = match.winnerTeam === playerEntry.team;

  return {
    id: match.id,
    date: formatShortDate(match.startTime),
    dateTime: formatShortDateTime(match.startTime),
    partner: teammates.map((player) => player.fullName).join(" & ") || "Solo",
    opponent: opponents.map((player) => player.fullName).join(" & ") || "Unknown",
    score:
      typeof match.teamAScore === "number" && typeof match.teamBScore === "number"
        ? `${match.teamAScore}-${match.teamBScore}`
        : "Score pending",
    result: didWin ? "W" : "L",
    eloChange: `${eloChange >= 0 ? "+" : ""}${eloChange}`,
    eloAfterMatch: playerEntry.eloAfterMatch ?? playerEntry.eloRating,
  };
}

function buildMonthlyResults(matches, playerId) {
  const monthlyMap = new Map();

  matches.forEach((match) => {
    const summary = buildMatchSummary(match, playerId);
    if (!summary) {
      return;
    }

    const month = new Date(match.startTime).toLocaleDateString("en-US", { month: "short" });
    const current = monthlyMap.get(month) ?? { month, wins: 0, losses: 0 };
    if (summary.result === "W") {
      current.wins += 1;
    } else {
      current.losses += 1;
    }
    monthlyMap.set(month, current);
  });

  return Array.from(monthlyMap.values());
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
import { useNavigate as useNav } from "react-router-dom";

function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const nav = useNav();
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const features = [
    { icon: "🏟️", title: "Smart Court Booking", desc: "Real-time availability, digital reservations, and zero WhatsApp back-and-forth." },
    { icon: "🤝", title: "AI Matchmaking", desc: "Groups players into balanced 2v2 matches using skill ratings and availability." },
    { icon: "🏆", title: "ELO Rankings", desc: "Dynamic post-match recalculation. Beat stronger players, climb faster." },
    { icon: "📊", title: "Performance Analytics", desc: "Win rates, score trends, head-to-head breakdowns, and full match history." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: G.surface, overflowY: "auto", fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 32px 60px", opacity: mounted ? 1 : 0, transform: mounted ? "none" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: G.greenLight, color: G.greenDark, fontSize: 11, fontWeight: 500, padding: "5px 14px", borderRadius: 100, marginBottom: 28, border: `0.5px solid ${G.borderMed}`, letterSpacing: 0.5, textTransform: "uppercase" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: G.green, display: "inline-block", animation: "pulse 1.8s infinite" }} />
          AI-Powered Sports SaaS
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 56, fontWeight: 700, color: G.accent, letterSpacing: -2, lineHeight: 1.05, margin: "0 0 20px" }}>
          Padel, Ranked.<br />Matched. <span style={{ color: G.green }}>Mastered.</span>
        </h1>
        <p style={{ fontSize: 17, color: G.muted, lineHeight: 1.7, maxWidth: 540, margin: "0 auto 36px", fontWeight: 300 }}>
          The all-in-one platform for serious padel players — smart court booking, AI matchmaking, and real-time performance analytics.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => nav("/signin")} style={{ ...styles.btn, padding: "14px 32px", fontSize: 15, boxShadow: `0 6px 24px rgba(29,158,117,0.3)`, transition: "transform 0.15s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 10px 30px rgba(29,158,117,0.4)`; }}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = `0 6px 24px rgba(29,158,117,0.3)`; }}
          >Sign in →</button>
          <button onClick={() => nav("/signup")} style={{ ...styles.btnGhost, padding: "14px 32px", fontSize: 15 }}>Create account</button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto 60px", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, opacity: mounted ? 1 : 0, transition: "opacity 0.6s 0.15s ease" }}>
        {[
          { icon: "🎯", label: "Matchmaking found", value: "3 balanced opponents near you", stat: "ELO ±12", statColor: "green" },
          { icon: "📈", label: "Platform win rate", value: "71% — up 13% this month", stat: "+13%", statColor: "green" },
          { icon: "👥", label: "Active players", value: "1,240+ on PadelAI", stat: "Growing", statColor: "amber" },
        ].map((c, i) => (
          <div key={i} style={{ ...styles.card, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 20 }}>{c.icon}</div>
            <div style={{ fontSize: 11, color: G.hint }}>{c.label}</div>
            <div style={{ fontSize: 13, fontWeight: 500, color: G.accent }}>{c.value}</div>
            <Badge color={c.statColor}>{c.stat}</Badge>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto 80px", padding: "0 32px" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: G.accent, textAlign: "center", marginBottom: 8 }}>Everything your club needs</h2>
        <p style={{ color: G.muted, textAlign: "center", fontSize: 14, marginBottom: 28, fontWeight: 300 }}>Five core modules. One smart platform.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
          {features.map((f, i) => (
            <div key={i} style={{ ...styles.card, cursor: "default", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(29,158,117,0.12)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 600, color: G.accent, marginBottom: 6, fontSize: 14 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto 80px", padding: "0 32px" }}>
        <div style={{ background: G.accent, borderRadius: 18, padding: "40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: "white", marginBottom: 6 }}>Ready to dominate the court?</div>
            <div style={{ fontSize: 13, color: G.greenMid, fontWeight: 300 }}>Join 1,240+ players already on PadelAI</div>
          </div>
          <button onClick={() => nav("/signup")} style={{ background: G.green, color: "white", border: "none", padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Create account →</button>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.7)}}`}</style>
    </div>
  );
}

// ─── DASHBOARD PAGE ──────────────────────────────────────────────────────────
function LegacyDashboardPage({ user }) {
  const firstName = user?.fullName?.split(" ")[0] || "Player";
  const [playerData, setPlayerData] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [chartData, setChartData] = useState({ eloHistory: [], winData: [], recentMatches: [] });
  const [userRanking, setUserRanking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Fetch current player profile
        const playerResp = await apiFetch("/players/me");
        if (mounted) setPlayerData(playerResp);

        // Fetch all matches to build history and ELO progression
        const matchesResp = await apiFetch("/matches");
        if (mounted) {
          setAllMatches(matchesResp || []);
          
          // Filter current user's matches and build chart data
          const userMatches = (matchesResp || []).filter(m => 
            m.matchPlayers?.some(mp => mp.playerId === playerResp.playerId)
          ).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

          // Build ELO progression (show last 12 matches)
          const eloHist = userMatches.slice(-12).map((m, i) => ({
            match: `M${i + 1}`,
            elo: playerResp.eloRating - (userMatches.length - i - 1) * 20 + i * 15 // Simplified progression
          }));

          // Build recent matches (last 4)
          const recent = userMatches.slice(-4).reverse().map(m => {
            const isWin = Math.random() > 0.3; // Placeholder logic
            return {
              date: new Date(m.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              opponent: m.matchPlayers?.find(mp => mp.playerId !== playerResp.playerId)?.player?.user?.fullName || "Unknown",
              score: isWin ? "6-4, 6-3" : "4-6, 3-6",
              result: isWin ? "W" : "L",
              eloChange: isWin ? "+18" : "-14"
            };
          });

          // Build monthly results (aggregate by month)
          const monthlyMap = {};
          userMatches.forEach(m => {
            const month = new Date(m.startTime).toLocaleDateString("en-US", { month: "short" });
            if (!monthlyMap[month]) monthlyMap[month] = { wins: 0, losses: 0 };
            monthlyMap[month].wins += Math.random() > 0.3 ? 1 : 0;
            monthlyMap[month].losses += Math.random() > 0.3 ? 0 : 1;
          });
          const winHist = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

          if (mounted) {
            setChartData({
              eloHistory: eloHist,
              winData: winHist.length > 0 ? winHist : [{ month: "Apr", wins: 4, losses: 1 }],
              recentMatches: recent
            });
          }
        }

        // Fetch all players for leaderboard and ranking
        const playersResp = await apiFetch("/players");
        if (mounted) {
          const sorted = (playersResp || []).sort((a, b) => b.eloRating - a.eloRating);
          setLeaderboard(sorted.slice(0, 5));
          
          // Find user's ranking
          const rank = sorted.findIndex(p => p.playerId === playerResp.playerId) + 1;
          setUserRanking(rank > 0 ? rank : "—");
        }

        // Fetch next booking
        const bookingsResp = await apiFetch("/bookings/my");
        if (mounted && bookingsResp && bookingsResp.length > 0) {
          const upcoming = bookingsResp.find(b => new Date(b.startTime) > new Date());
          if (upcoming) {
            setNextBooking({
              court: `Court ${upcoming.courtId}`,
              time: new Date(upcoming.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              vs: "Matchmaking scheduled"
            });
          }
        }

        if (mounted) setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div style={{ padding: "28px 32px", color: G.muted }}>Loading dashboard...</div>;
  }

  const winRate = playerData?.totalMatches > 0 
    ? Math.round((playerData.wins / playerData.totalMatches) * 100) 
    : 0;
  const eloDisplay = playerData?.eloRating?.toLocaleString() || "—";
  const matchesDisplay = playerData?.totalMatches || "0";
  const winsDisplay = playerData?.wins || "0";
  const lossesDisplay = playerData?.losses || "0";

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <SectionTitle title={`Welcome back, ${firstName} 👋`} sub="Here's your performance snapshot" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Current ELO" value={eloDisplay} sub="Latest from matches" />
        <StatCard label="Win Rate" value={`${winRate}%`} sub={`${winsDisplay}W · ${lossesDisplay}L`} color={G.green} />
        <StatCard label="Ranking" value={`#${userRanking}`} sub={`of ${leaderboard.length + 5} players`} color={G.amber} />
        <StatCard label="Matches" value={matchesDisplay} sub="all time" color={G.greenDark} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 16 }}>ELO Progression</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData.eloHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
              <XAxis dataKey="match" tick={{ fontSize: 11, fill: G.hint }} />
              <YAxis tick={{ fontSize: 11, fill: G.hint }} />
              <Tooltip contentStyle={{ background: G.card, border: `0.5px solid ${G.border}`, borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="elo" stroke={G.green} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: G.green }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 14 }}>Recent Matches</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {chartData.recentMatches.slice(0, 4).map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.result === "W" ? G.greenLight : G.coralLight, color: m.result === "W" ? G.greenDark : G.coral, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{m.result}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: G.accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>vs {m.opponent}</div>
                  <div style={{ fontSize: 11, color: G.hint }}>{m.date} · {m.score}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: m.result === "W" ? G.green : G.coral, flexShrink: 0 }}>{m.eloChange}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 16 }}>Monthly Results</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData.winData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: G.hint }} />
              <YAxis tick={{ fontSize: 11, fill: G.hint }} />
              <Tooltip contentStyle={{ background: G.card, border: `0.5px solid ${G.border}`, borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="wins" fill={G.green} radius={[4, 4, 0, 0]} name="Wins" />
              <Bar dataKey="losses" fill={G.coralLight} radius={[4, 4, 0, 0]} name="Losses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 14 }}>Next Booking</div>
          {nextBooking ? (
            <>
              <div style={{ background: G.accent, borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: G.greenMid, marginBottom: 4 }}>UPCOMING</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "white", marginBottom: 2 }}>{nextBooking.court} · {nextBooking.time}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{nextBooking.vs}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...styles.btnGhost, flex: 1, fontSize: 12 }}>Reschedule</button>
                <button style={{ background: G.coralLight, color: G.coral, border: "none", padding: "9px 14px", borderRadius: 9, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ color: G.muted, fontSize: 13 }}>No upcoming bookings</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING PAGE ─────────────────────────────────────────────────────────────
function DashboardPage({ user }) {
  const firstName = user?.fullName?.split(" ")[0] || "Player";
  const [playerData, setPlayerData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [nextBooking, setNextBooking] = useState(null);
  const [chartData, setChartData] = useState({ eloHistory: [], winData: [], recentMatches: [] });
  const [userRanking, setUserRanking] = useState(null);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingActionLoading, setBookingActionLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [playerResp, matchesResp, playersResp, bookingsResp] = await Promise.all([
          apiFetch("/players/me"),
          apiFetch("/matches"),
          apiFetch("/players"),
          apiFetch("/bookings/my"),
        ]);

        const matches = matchesResp || [];
        const completedMatches = matches
          .filter((match) => match.status === "Completed" && getPlayerEntry(match, playerResp.playerId))
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        const eloHistoryPoints = completedMatches.slice(-12).map((match, index) => {
          const playerEntry = getPlayerEntry(match, playerResp.playerId);
          return {
            match: `M${index + 1}`,
            date: formatShortDate(match.startTime),
            elo: playerEntry?.eloAfterMatch ?? playerEntry?.eloRating ?? playerResp.eloRating,
          };
        });
        const recentMatches = completedMatches
          .slice(-4)
          .reverse()
          .map((match) => buildMatchSummary(match, playerResp.playerId))
          .filter(Boolean);
        const sortedPlayers = (playersResp || []).slice().sort((a, b) => b.eloRating - a.eloRating);
        const rank = sortedPlayers.findIndex((player) => player.playerId === playerResp.playerId) + 1;
        const upcoming = (bookingsResp || [])
          .filter((booking) => booking.status === "Confirmed" && new Date(booking.startTime) > new Date())
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
        const relatedUpcomingMatch = upcoming
          ? matches.find((match) => match.bookingId === upcoming.id && new Date(match.startTime) > new Date())
          : null;

        if (!mounted) {
          return;
        }

        setPlayerData(playerResp);
        setLeaderboard(sortedPlayers.slice(0, 5));
        setTotalPlayers(sortedPlayers.length);
        setUserRanking(rank > 0 ? rank : "—");
        setChartData({
          eloHistory:
            eloHistoryPoints.length > 0
              ? eloHistoryPoints
              : [{ match: "Start", date: "No results yet", elo: playerResp.eloRating }],
          winData: buildMonthlyResults(completedMatches, playerResp.playerId),
          recentMatches,
        });
        setNextBooking(
          upcoming
            ? {
                id: upcoming.id,
                court: upcoming.courtName || `Court ${upcoming.courtId}`,
                dateTime: formatShortDateTime(upcoming.startTime),
                time: new Date(upcoming.startTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                vs: relatedUpcomingMatch ? `Scheduled match on ${relatedUpcomingMatch.courtName || upcoming.courtName}` : "Court reservation confirmed",
              }
            : null
        );
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return <div style={{ padding: "28px 32px", color: G.muted }}>Loading dashboard...</div>;
  }

  const winRate = playerData?.totalMatches > 0
    ? Math.round((playerData.wins / playerData.totalMatches) * 100)
    : 0;
  const eloDisplay = playerData?.eloRating?.toLocaleString() || "—";
  const matchesDisplay = playerData?.totalMatches || "0";
  const winsDisplay = playerData?.wins || "0";
  const lossesDisplay = playerData?.losses || "0";

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <SectionTitle title={`Welcome back, ${firstName} 👋`} sub="Here's your performance snapshot" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Current ELO" value={eloDisplay} sub="Latest from matches" />
        <StatCard label="Win Rate" value={`${winRate}%`} sub={`${winsDisplay}W · ${lossesDisplay}L`} color={G.green} />
        <StatCard label="Ranking" value={`#${userRanking}`} sub={`of ${totalPlayers || leaderboard.length} players`} color={G.amber} />
        <StatCard label="Matches" value={matchesDisplay} sub="all time" color={G.greenDark} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 16 }}>ELO Progression</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData.eloHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
              <XAxis dataKey="match" tick={{ fontSize: 11, fill: G.hint }} />
              <YAxis tick={{ fontSize: 11, fill: G.hint }} />
              <Tooltip contentStyle={{ background: G.card, border: `0.5px solid ${G.border}`, borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="elo" stroke={G.green} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: G.green }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 14 }}>Recent Matches</div>
          {chartData.recentMatches.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {chartData.recentMatches.slice(0, 4).map((match, index) => (
                <div key={match.id ?? index} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: match.result === "W" ? G.greenLight : G.coralLight, color: match.result === "W" ? G.greenDark : G.coral, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{match.result}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: G.accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>vs {match.opponent}</div>
                    <div style={{ fontSize: 11, color: G.hint }}>{match.date} · {match.score}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: match.result === "W" ? G.green : G.coral, flexShrink: 0 }}>{match.eloChange}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: G.muted, fontSize: 13 }}>No completed matches yet</div>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 16 }}>Monthly Results</div>
          {chartData.winData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData.winData} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke={G.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: G.hint }} />
                <YAxis tick={{ fontSize: 11, fill: G.hint }} />
                <Tooltip contentStyle={{ background: G.card, border: `0.5px solid ${G.border}`, borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="wins" fill={G.green} radius={[4, 4, 0, 0]} name="Wins" />
                <Bar dataKey="losses" fill={G.coralLight} radius={[4, 4, 0, 0]} name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ color: G.muted, fontSize: 13 }}>Monthly results will appear after your first completed match.</div>
          )}
        </div>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 14 }}>Next Booking</div>
          {nextBooking ? (
            <>
              <div style={{ background: G.accent, borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: G.greenMid, marginBottom: 4 }}>UPCOMING</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "white", marginBottom: 2 }}>{nextBooking.court} · {nextBooking.time}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginBottom: 2 }}>{nextBooking.dateTime}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{nextBooking.vs}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...styles.btnGhost, flex: 1, fontSize: 12 }} onClick={() => window.dispatchEvent(new CustomEvent("padel:navigate-booking"))}>Manage Booking</button>
                <button
                  onClick={async () => {
                    try {
                      setBookingActionLoading(true);
                      await apiFetch(`/bookings/${nextBooking.id}`, { method: "DELETE" });
                      setNextBooking(null);
                    } catch (err) {
                      alert(err.message || "Failed to cancel booking");
                    } finally {
                      setBookingActionLoading(false);
                    }
                  }}
                  disabled={bookingActionLoading}
                  style={{ background: G.coralLight, color: G.coral, border: "none", padding: "9px 14px", borderRadius: 9, fontSize: 12, cursor: bookingActionLoading ? "wait" : "pointer", fontFamily: "inherit", opacity: bookingActionLoading ? 0.7 : 1 }}
                >
                  {bookingActionLoading ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: G.muted, fontSize: 13 }}>No upcoming bookings</div>
          )}
        </div>
      </div>
    </div>
  );
}

function LegacyBookingPage() {
  const [selected, setSelected] = useState({});
  const [remoteCourts, setRemoteCourts] = useState(null);
  const [creating, setCreating] = useState(false);
  const toggle = (courtId, slot) => { const key = `${courtId}-${slot}`; setSelected(s => ({ ...s, [key]: !s[key] })); };
  const selectedCount = Object.values(selected).filter(Boolean).length;

  useEffect(() => {
    let mounted = true;
    apiFetch("/courts")
      .then(data => { if (mounted) setRemoteCourts(data); })
      .catch(() => { /* keep using mock data if request fails */ });
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle title="Court Booking" sub="Select a court and time slot to reserve" />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: G.muted }}>Today — May 18, 2026</div>
          {selectedCount > 0 && (
            <button
              onClick={async () => {
                // Create one-hour bookings for each selected slot
                const items = Object.entries(selected).filter(([, v]) => v).map(([k]) => {
                  const [courtIdStr, slot] = k.split("-");
                  return { courtId: Number(courtIdStr), slot };
                });
                setCreating(true);
                try {
                  for (const it of items) {
                    // Build start/end for today using slot like "10:00"
                    const [hours, mins] = it.slot.split(":").map(Number);
                    const now = new Date();
                    const start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins, 0));
                    const end = new Date(start.getTime() + 60 * 60 * 1000);
                    await apiFetch(`/bookings`, {
                      method: "POST",
                      body: JSON.stringify({ courtId: it.courtId, startTime: start.toISOString(), endTime: end.toISOString() }),
                    });
                  }
                  // Clear selections
                  setSelected({});
                  alert("Booking(s) created successfully");
                } catch (err) {
                  alert(err.message || "Failed to create booking");
                } finally {
                  setCreating(false);
                }
              }}
              style={{ ...styles.btn, fontSize: 13 }}
              disabled={creating}
            >
              {creating ? "Creating..." : `Confirm ${selectedCount} booking${selectedCount > 1 ? "s" : ""} →`}
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[{ label: "Available", color: G.greenLight }, { label: "Booked", color: "#f0f0ee" }, { label: "Selected", color: G.green }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: l.color, border: `0.5px solid ${G.border}` }} />
            <span style={{ fontSize: 12, color: G.muted }}>{l.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {(remoteCourts ?? courts).map(court => (
          <div key={court.id} style={styles.card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontWeight: 600, color: G.accent, fontSize: 15 }}>{court.name}</div>
              <Badge color="green">{court.slots.length - court.busy.length} slots free</Badge>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {court.slots.map(slot => {
                const isBusy = court.busy.includes(slot);
                const isSelected = selected[`${court.id}-${slot}`];
                return (
                  <button key={slot} onClick={() => !isBusy && toggle(court.id, slot)} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: isBusy ? "not-allowed" : "pointer", fontFamily: "inherit", border: `0.5px solid ${isSelected ? G.green : isBusy ? "transparent" : G.borderMed}`, background: isSelected ? G.green : isBusy ? "#f4f4f2" : G.greenLight, color: isSelected ? "white" : isBusy ? G.hint : G.greenDark, textDecoration: isBusy ? "line-through" : "none", transition: "all 0.15s" }}>{slot}</button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MATCHMAKING PAGE ─────────────────────────────────────────────────────────
function BookingPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = useState({});
  const [remoteCourts, setRemoteCourts] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggle = (courtId, slot) => {
    const key = `${courtId}-${slot}`;
    setSelected((state) => ({ ...state, [key]: !state[key] }));
  };

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const courtsResp = await apiFetch("/courts");
      const availability = await Promise.all(
        (courtsResp || []).map(async (court) => {
          const slotsResp = await apiFetch(`/courts/${court.id}/availability?date=${selectedDate}`);
          const slotLabels = (slotsResp || []).map((slot) => formatTimeLabel(slot.startTime));
          const busySlots = (slotsResp || [])
            .filter((slot) => !slot.isAvailable)
            .map((slot) => formatTimeLabel(slot.startTime));

          return {
            id: court.id,
            name: court.name,
            slots: slotLabels,
            busy: busySlots,
          };
        })
      );

      setRemoteCourts(availability);
    } catch (err) {
      console.error("Failed to load booking availability:", err);
      setRemoteCourts(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, [selectedDate]);

  const selectedItems = Object.entries(selected).filter(([, isSelected]) => isSelected);
  const selectedCount = selectedItems.length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle title="Court Booking" sub="Live court availability from the database" />
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => {
              setSelected({});
              setSelectedDate(event.target.value);
            }}
            style={{ padding: "8px 12px", borderRadius: 9, fontSize: 13, fontFamily: "inherit", border: `0.5px solid ${G.borderMed}`, background: G.card, color: G.text }}
          />
          {selectedCount > 0 && (
            <button
              onClick={async () => {
                setCreating(true);
                try {
                  for (const [key] of selectedItems) {
                    const [courtIdStr, slot] = key.split("-");
                    const [hours, mins] = slot.split(":").map(Number);
                    const start = new Date(`${selectedDate}T00:00:00.000Z`);
                    start.setUTCHours(hours, mins, 0, 0);
                    const end = new Date(start.getTime() + 60 * 60 * 1000);

                    await apiFetch("/bookings", {
                      method: "POST",
                      body: JSON.stringify({
                        courtId: Number(courtIdStr),
                        startTime: start.toISOString(),
                        endTime: end.toISOString(),
                      }),
                    });
                  }

                  setSelected({});
                  await loadAvailability();
                  alert("Booking(s) created successfully");
                } catch (err) {
                  alert(err.message || "Failed to create booking");
                } finally {
                  setCreating(false);
                }
              }}
              style={{ ...styles.btn, fontSize: 13 }}
              disabled={creating}
            >
              {creating ? "Creating..." : `Confirm ${selectedCount} booking${selectedCount > 1 ? "s" : ""} →`}
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        {[{ label: "Available", color: G.greenLight }, { label: "Booked", color: "#f0f0ee" }, { label: "Selected", color: G.green }].map((legend) => (
          <div key={legend.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: legend.color, border: `0.5px solid ${G.border}` }} />
            <span style={{ fontSize: 12, color: G.muted }}>{legend.label}</span>
          </div>
        ))}
      </div>
      {loading ? (
        <div style={{ color: G.muted, fontSize: 13 }}>Loading availability...</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {(remoteCourts ?? courts).map((court) => (
            <div key={court.id} style={styles.card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontWeight: 600, color: G.accent, fontSize: 15 }}>{court.name}</div>
                <Badge color="green">{court.slots.length - court.busy.length} slots free</Badge>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {court.slots.map((slot) => {
                  const isBusy = court.busy.includes(slot);
                  const isSelected = selected[`${court.id}-${slot}`];
                  return (
                    <button
                      key={slot}
                      onClick={() => !isBusy && toggle(court.id, slot)}
                      style={{ padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: isBusy ? "not-allowed" : "pointer", fontFamily: "inherit", border: `0.5px solid ${isSelected ? G.green : isBusy ? "transparent" : G.borderMed}`, background: isSelected ? G.green : isBusy ? "#f4f4f2" : G.greenLight, color: isSelected ? "white" : isBusy ? G.hint : G.greenDark, textDecoration: isBusy ? "line-through" : "none", transition: "all 0.15s" }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchmakingPage({ user }) {
  const [filter, setFilter] = useState("all");
  const [requested, setRequested] = useState({});
  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "ME";
  const filtered = filter === "all" ? matchmakingPlayers : matchmakingPlayers.filter(p => p.style.toLowerCase() === filter);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <SectionTitle title="Matchmaking" sub="AI-matched opponents based on your ELO and availability" />
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all","aggressive","defensive","balanced"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 100, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", background: filter === f ? G.accent : G.card, color: filter === f ? "white" : G.muted, border: `0.5px solid ${filter === f ? G.accent : G.border}`, textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>
      <div style={{ ...styles.card, background: G.accent, marginBottom: 16, display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar initials={initials} size={48} isYou />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: "white", fontSize: 15 }}>{user?.fullName} — You</div>
          <div style={{ fontSize: 12, color: G.greenMid }}>ELO 1,400 · Beginner → Intermediate</div>
        </div>
        <Badge color="green">Looking for match</Badge>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        {filtered.map((p, i) => (
          <div key={i} style={{ ...styles.card, cursor: "default", border: `0.5px solid ${p.compatible >= 90 ? G.borderMed : G.border}`, transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 6px 20px rgba(29,158,117,0.1)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar initials={p.initials} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: G.accent, fontSize: 14 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: G.hint }}>ELO {p.elo} · {p.distance} away</div>
              </div>
              <div style={{ background: p.compatible >= 90 ? G.green : p.compatible >= 85 ? G.amber : G.hint, color: "white", borderRadius: 100, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>{p.compatible}%</div>
            </div>
            <div style={{ background: G.greenLight, borderRadius: 4, height: 4, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ width: `${p.compatible}%`, height: "100%", background: p.compatible >= 90 ? G.green : G.amber, borderRadius: 4, transition: "width 0.8s ease" }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <Badge color="gray">{p.style}</Badge>
              <Badge color="green">Win {p.winRate}</Badge>
            </div>
            <button onClick={() => setRequested(r => ({ ...r, [i]: !r[i] }))} style={{ width: "100%", padding: "9px", borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", border: "none", background: requested[i] ? G.greenLight : G.green, color: requested[i] ? G.greenDark : "white", transition: "all 0.2s" }}>
              {requested[i] ? "✓ Request Sent" : "Send Match Request"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RANKINGS PAGE ────────────────────────────────────────────────────────────
function LegacyRankingsPage({ user }) {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userInitials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "ME";

  useEffect(() => {
    let mounted = true;
    const fetchPlayers = async () => {
      try {
        const data = await apiFetch("/players");
        if (mounted) {
          const enriched = (data || []).map((p, i) => ({
            rank: i + 1,
            name: p.fullName,
            initials: p.fullName?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?",
            wins: p.wins || 0,
            losses: p.losses || 0,
            elo: p.eloRating,
            trend: Math.random() > 0.5 ? "+" + Math.floor(Math.random() * 30) : "-" + Math.floor(Math.random() * 15),
            isYou: p.userId === user?.userId
          })).sort((a, b) => b.elo - a.elo);
          setPlayers(enriched);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch players:", err);
        if (mounted) setLoading(false);
      }
    };
    fetchPlayers();
    return () => { mounted = false; };
  }, [user?.userId]);

  const filtered = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle title="Rankings" sub="ELO-based live leaderboard · updated after every match" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player..." style={{ padding: "9px 16px", borderRadius: 9, fontSize: 13, fontFamily: "inherit", border: `0.5px solid ${G.borderMed}`, background: G.card, color: G.text, outline: "none", width: 200 }} />
      </div>
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 70px 80px", padding: "12px 20px", background: G.surface, borderBottom: `0.5px solid ${G.border}`, fontSize: 11, fontWeight: 500, color: G.hint, textTransform: "uppercase", letterSpacing: 0.5 }}>
          <span>#</span><span>Player</span><span>W</span><span>L</span><span>Trend</span><span style={{ textAlign: "right" }}>ELO</span>
        </div>
        {loading ? (
          <div style={{ padding: "28px", textAlign: "center", color: G.muted }}>Loading leaderboard...</div>
        ) : (
        filtered.map((p, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 70px 80px", padding: "14px 20px", alignItems: "center", borderBottom: i < filtered.length - 1 ? `0.5px solid ${G.border}` : "none", background: p.isYou ? "rgba(29,158,117,0.06)" : "transparent", transition: "background 0.15s", cursor: "default" }}
            onMouseEnter={e => !p.isYou && (e.currentTarget.style.background = G.surface)}
            onMouseLeave={e => !p.isYou && (e.currentTarget.style.background = "transparent")}>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: p.rank <= 3 ? ["#EF9F27","#888","#b07020"][p.rank-1] : G.hint }}>{p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank-1] : p.rank}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={p.initials} size={34} isYou={p.isYou} />
              <div>
                <div style={{ fontSize: 13, fontWeight: p.isYou ? 600 : 500, color: G.accent }}>{p.name} {p.isYou && <span style={{ fontSize: 11, color: G.green, marginLeft: 4 }}>· You</span>}</div>
                <div style={{ fontSize: 11, color: G.hint }}>{p.wins + p.losses} matches played</div>
              </div>
            </div>
            <span style={{ fontSize: 13, color: G.accent, fontWeight: 500 }}>{p.wins}</span>
            <span style={{ fontSize: 13, color: G.muted }}>{p.losses}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: p.trend.startsWith("+") ? G.green : G.coral }}>{p.trend}</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: G.green }}>{p.elo.toLocaleString()}</div>
              <div style={{ width: 60, height: 3, background: G.greenLight, borderRadius: 4, marginLeft: "auto", marginTop: 3, overflow: "hidden" }}>
                <div style={{ width: `${(p.elo / 1900) * 100}%`, height: "100%", background: G.green, borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
}

// ─── ANALYTICS PAGE ───────────────────────────────────────────────────────────
function RankingsPage({ user }) {
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchRankings = async () => {
      try {
        const [playersResp, matchesResp] = await Promise.all([
          apiFetch("/players"),
          apiFetch("/matches"),
        ]);

        const latestTrendByPlayer = new Map();
        (matchesResp || [])
          .filter((match) => match.status === "Completed")
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          .forEach((match) => {
            (match.players || []).forEach((player) => {
              if (!latestTrendByPlayer.has(player.playerId)) {
                const change = (player.eloAfterMatch ?? player.eloRating) - (player.eloBeforeMatch ?? player.eloRating);
                latestTrendByPlayer.set(player.playerId, change);
              }
            });
          });

        const enriched = (playersResp || [])
          .slice()
          .sort((a, b) => b.eloRating - a.eloRating)
          .map((player, index) => {
            const trendValue = latestTrendByPlayer.get(player.playerId) ?? 0;
            return {
              rank: index + 1,
              name: player.fullName,
              initials: player.fullName?.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?",
              wins: player.wins || 0,
              losses: player.losses || 0,
              elo: player.eloRating,
              trend: `${trendValue >= 0 ? "+" : ""}${trendValue}`,
              isYou: player.userId === user?.userId,
            };
          });

        if (mounted) {
          setPlayers(enriched);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch players:", err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchRankings();
    return () => { mounted = false; };
  }, [user?.userId]);

  const filtered = players.filter((player) => player.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <SectionTitle title="Rankings" sub="ELO-based live leaderboard · updated after every completed match" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search player..." style={{ padding: "9px 16px", borderRadius: 9, fontSize: 13, fontFamily: "inherit", border: `0.5px solid ${G.borderMed}`, background: G.card, color: G.text, outline: "none", width: 200 }} />
      </div>
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 70px 80px", padding: "12px 20px", background: G.surface, borderBottom: `0.5px solid ${G.border}`, fontSize: 11, fontWeight: 500, color: G.hint, textTransform: "uppercase", letterSpacing: 0.5 }}>
          <span>#</span><span>Player</span><span>W</span><span>L</span><span>Trend</span><span style={{ textAlign: "right" }}>ELO</span>
        </div>
        {loading ? (
          <div style={{ padding: "28px", textAlign: "center", color: G.muted }}>Loading leaderboard...</div>
        ) : (
          filtered.map((player, index) => (
            <div
              key={`${player.name}-${player.rank}`}
              style={{ display: "grid", gridTemplateColumns: "48px 1fr 80px 80px 70px 80px", padding: "14px 20px", alignItems: "center", borderBottom: index < filtered.length - 1 ? `0.5px solid ${G.border}` : "none", background: player.isYou ? "rgba(29,158,117,0.06)" : "transparent", transition: "background 0.15s", cursor: "default" }}
              onMouseEnter={(event) => !player.isYou && (event.currentTarget.style.background = G.surface)}
              onMouseLeave={(event) => !player.isYou && (event.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: player.rank <= 3 ? ["#EF9F27", "#888", "#b07020"][player.rank - 1] : G.hint }}>{player.rank <= 3 ? ["🥇", "🥈", "🥉"][player.rank - 1] : player.rank}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={player.initials} size={34} isYou={player.isYou} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: player.isYou ? 600 : 500, color: G.accent }}>{player.name} {player.isYou && <span style={{ fontSize: 11, color: G.green, marginLeft: 4 }}>· You</span>}</div>
                  <div style={{ fontSize: 11, color: G.hint }}>{player.wins + player.losses} matches played</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: G.accent, fontWeight: 500 }}>{player.wins}</span>
              <span style={{ fontSize: 13, color: G.muted }}>{player.losses}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: player.trend.startsWith("+") ? G.green : player.trend.startsWith("-") ? G.coral : G.hint }}>{player.trend}</span>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: G.green }}>{player.elo.toLocaleString()}</div>
                <div style={{ width: 60, height: 3, background: G.greenLight, borderRadius: 4, marginLeft: "auto", marginTop: 3, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min((player.elo / 1900) * 100, 100)}%`, height: "100%", background: G.green, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
      <SectionTitle title="Performance Analytics" sub="Deep dive into your stats, trends, and head-to-head" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Avg ELO gain/match" value="+14" sub="when you win" />
        <StatCard label="Longest win streak" value="4" sub="Feb–Mar 2026" color={G.amber} />
        <StatCard label="Best partner" value="Karim S." sub="72% win rate together" color={G.greenDark} />
        <StatCard label="Toughest rival" value="Ahmed M." sub="1W 3L head-to-head" color={G.coral} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 4 }}>Skills Radar</div>
          <div style={{ fontSize: 11, color: G.hint, marginBottom: 12 }}>You vs. average player</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={G.border} />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: G.muted }} />
              <Radar name="You" dataKey="you" stroke={G.green} fill={G.green} fillOpacity={0.2} />
              <Radar name="Avg" dataKey="avg" stroke={G.amber} fill={G.amber} fillOpacity={0.15} />
              <Tooltip contentStyle={{ background: G.card, border: `0.5px solid ${G.border}`, borderRadius: 8, fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.card}>
          <div style={{ fontWeight: 600, color: G.accent, fontSize: 14, marginBottom: 14 }}>Match History</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {matchHistory.map((m, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr auto auto", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, background: m.result === "W" ? "rgba(29,158,117,0.06)" : "rgba(216,90,48,0.05)" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: m.result === "W" ? G.greenLight : G.coralLight, color: m.result === "W" ? G.greenDark : G.coral, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{m.result}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: G.accent }}>vs {m.vs}</div>
                  <div style={{ fontSize: 11, color: G.hint }}>w/ {m.partner} · {m.date}</div>
                </div>
                <div style={{ fontSize: 12, color: G.muted }}>{m.score}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: m.result === "W" ? G.green : G.coral }}>{m.eloChange}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PLAYER LAYOUT (authenticated shell) ─────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "booking", label: "Booking", icon: "📅" },
  { id: "matchmaking", label: "Matchmaking", icon: "🤝" },
  { id: "rankings", label: "Rankings", icon: "🏆" },
  { id: "analytics", label: "Analytics", icon: "📊" },
];

function PlayerLayout() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [playerData, setPlayerData] = useState(null);
  const [sidebarBooking, setSidebarBooking] = useState(null);
  const nav = useNav();

  const initials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "ME";

  useEffect(() => {
    let mounted = true;
    const fetchSidebarData = async () => {
      try {
        const [playerResp, bookingsResp] = await Promise.all([
          apiFetch("/players/me"),
          apiFetch("/bookings/my"),
        ]);

        if (!mounted) {
          return;
        }

        setPlayerData(playerResp);
        const upcoming = (bookingsResp || [])
          .filter((booking) => booking.status === "Confirmed" && new Date(booking.startTime) > new Date())
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
        setSidebarBooking(upcoming ?? null);
      } catch (err) {
        console.error("Failed to fetch sidebar data:", err);
      }
    };
    fetchSidebarData();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleNavigateBooking = () => setPage("booking");
    window.addEventListener("padel:navigate-booking", handleNavigateBooking);
    return () => window.removeEventListener("padel:navigate-booking", handleNavigateBooking);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage user={user} />;
      case "booking": return <BookingPage />;
      case "matchmaking": return <MatchmakingPage user={user} />;
      case "rankings": return <RankingsPage user={user} />;
      case "analytics": return <AnalyticsPage />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", fontSize: 14, display: "flex", height: "100vh", overflow: "hidden", background: G.surface }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: G.accent, display: "flex", flexDirection: "column", padding: "24px 0", flexShrink: 0 }}>
        <div style={{ padding: "0 20px 28px", borderBottom: `0.5px solid rgba(255,255,255,0.08)` }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "white", letterSpacing: -0.5 }}>Padel<span style={{ color: G.greenMid }}>AI</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Management Platform</div>
        </div>
        <nav style={{ padding: "16px 12px", flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, marginBottom: 2, background: page === item.id ? "rgba(29,158,117,0.2)" : "transparent", border: page === item.id ? `0.5px solid rgba(29,158,117,0.3)` : "0.5px solid transparent", color: page === item.id ? G.greenMid : "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: page === item.id ? 500 : 400, textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => page !== item.id && (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              onMouseLeave={e => page !== item.id && (e.currentTarget.style.background = "transparent")}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: `0.5px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Avatar initials={initials} size={34} isYou />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "white" }}>{user?.fullName}</div>
              <div style={{ fontSize: 11, color: G.greenMid }}>ELO {playerData?.eloRating?.toLocaleString() || "—"}</div>
            </div>
          </div>
          <div style={{ border: "0.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Live Summary</div>
            <div style={{ fontSize: 11, color: "white", marginBottom: 3 }}>{playerData?.skillLevel || "Beginner"} · {playerData ? `${playerData.wins}W ${playerData.losses}L` : "0W 0L"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              {sidebarBooking ? `Next booking ${formatShortDateTime(sidebarBooking.startTime)}` : "No upcoming booking"}
            </div>
            <button onClick={() => setPage("booking")} style={{ width: "100%", padding: "7px", borderRadius: 7, background: "rgba(29,158,117,0.18)", border: "0.5px solid rgba(29,158,117,0.35)", color: G.greenMid, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Open Booking</button>
          </div>
          <button onClick={() => { logout(); nav("/"); }} style={{ width: "100%", padding: "7px", borderRadius: 7, background: "transparent", border: "0.5px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "16px 32px", background: G.card, borderBottom: `0.5px solid ${G.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 5 }}>
          <div style={{ fontSize: 13, color: G.muted }}>
            {NAV_ITEMS.find(n => n.id === page)?.icon} &nbsp;{NAV_ITEMS.find(n => n.id === page)?.label}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: G.green, animation: "pulse2 2s infinite" }} />
            <span style={{ fontSize: 12, color: G.muted }}>Live data</span>
          </div>
        </div>
        {renderPage()}
      </main>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
        @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:0.4} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(29,158,117,0.25); border-radius: 4px; }
      `}</style>
    </div>
  );
}

// ─── APP ROUTES ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PlayerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/player"
        element={
          <ProtectedRoute>
            <PlayerLayout />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
