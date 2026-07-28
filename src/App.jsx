import { useState, useEffect } from "react";
import {
  Trophy, Users, Home, User, ChevronRight, ChevronLeft, X, Flame,
  Wallet, Plus, Swords, Crosshair, Skull, CheckCircle2, Coins,
  Megaphone, Share2, LogOut, Lock, Phone, Gamepad2, UserCircle2,
  MessageCircle, ArrowDownToLine, ArrowUpFromLine, Pencil,
  DoorOpen, CalendarClock,
} from "lucide-react";
import { db } from "./firebase";
import {
  doc, getDoc, setDoc, updateDoc, onSnapshot, collection, arrayUnion,
} from "firebase/firestore";

const C = {
  bg: "#0B0B14",
  surface: "#15131F",
  surfaceAlt: "#1C1A29",
  border: "#2A2738",
  text: "#F4F2FB",
  dim: "#9691AC",
  violet: "#7C5CFC",
  violetDim: "#3B3160",
  red: "#FF4D5E",
  teal: "#3DE1C6",
  amber: "#FFB84D",
  amberDim: "#3A2B10",
};

const WHATSAPP_LINK = "https://wa.me/923422178917";
const MIN_DEPOSIT = 100;

const VALID_CODES = { "FF100XK92": 100, "FF250QW14": 250, "FF500ZP77": 500 };
const LEADERBOARD = [
  { name: "Shadow_Blaze", kills: 214, earned: 3200 },
  { name: "RiverX", kills: 188, earned: 2750 },
  { name: "NoScope_Dev", kills: 176, earned: 2600 },
  { name: "Falcon.gg", kills: 150, earned: 2100 },
  { name: "You", kills: 42, earned: 480 },
];
const DEFAULT_ADS = [
  "🔥 Weekend Squad Cup — 500 coin prize pool",
  "Invite your squad — bonus coins for every friend who joins",
  "New: BR Duo tournaments added every evening",
];
const DEFAULT_RULES = [
  "Entry fees are deducted the moment you join a match and are not refundable.",
  "No emulators, hacks, or teaming outside your registered squad.",
  "Submit a screenshot of your results if asked by an organizer.",
  "Prize coins are credited within 24 hours of a match ending.",
  "Repeated rule violations lead to a permanent account ban.",
];

function statusOf(m, now) {
  if (now >= m.startsAt) return "live";
  if (m.startsAt - now < 30 * 60000) return "soon";
  return "open";
}
function countdown(ms) {
  if (ms <= 0) return "LIVE";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${sec}s`;
}

function readSession() {
  try {
    const raw = localStorage.getItem("clutch_session");
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function writeSession(v) { localStorage.setItem("clutch_session", JSON.stringify(v)); }
function clearSession() { localStorage.removeItem("clutch_session"); }

async function fetchAccount(phone) {
  const snap = await getDoc(doc(db, "accounts", phone));
  return snap.exists() ? snap.data() : null;
}
async function createAccount(phone, data) {
  await setDoc(doc(db, "accounts", phone), data);
}
async function patchAccount(phone, fields) {
  await updateDoc(doc(db, "accounts", phone), fields);
}

function StatusPill({ st }) {
  const map = {
    live: { bg: "#3A1620", fg: C.red, label: "LIVE", pulse: true },
    soon: { bg: C.amberDim, fg: C.amber, label: "STARTING SOON", pulse: false },
    open: { bg: "#12332E", fg: C.teal, label: "OPEN", pulse: false },
  };
  const s = map[st];
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide" style={{ background: s.bg, color: s.fg }}>
      {s.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: s.fg }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: s.fg }} />
        </span>
      )}
      {s.label}
    </span>
  );
}
function CoinBadge({ coins, onAdd }) {
  return (
    <button onClick={onAdd} className="flex items-center gap-1.5 rounded-full pl-1 pr-2.5 py-1" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: C.amberDim }}><Coins size={11} style={{ color: C.amber }} /></span>
      <span className="text-xs font-bold" style={{ color: C.text }}>{coins}</span>
      <Plus size={12} style={{ color: C.dim }} />
    </button>
  );
}
function BigCard({ icon: Icon, title, sub, color, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 rounded-2xl p-4 mb-3 active:scale-[0.98] transition-transform" style={{ background: C.surface, borderLeft: `3px solid ${color}` }}>
      <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}><Icon size={20} style={{ color }} /></span>
      <span className="flex-1 text-left">
        <div className="text-[15px] font-bold" style={{ color: C.text }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: C.dim }}>{sub}</div>
      </span>
      <ChevronRight size={18} style={{ color: C.dim }} />
    </button>
  );
}
function ModeCard({ icon: Icon, title, sub, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 rounded-2xl p-4 mb-3 active:scale-[0.98] transition-transform" style={{ background: C.surface }}>
      <span className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: C.violetDim }}><Icon size={20} style={{ color: C.violet }} /></span>
      <span className="flex-1 text-left">
        <div className="text-[15px] font-bold" style={{ color: C.text }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: C.dim }}>{sub}</div>
      </span>
      <ChevronRight size={18} style={{ color: C.dim }} />
    </button>
  );
}
function MatchCard({ m, now, onOpen, joined, joinedCount }) {
  const st = statusOf(m, now);
  const pct = Math.round(((joinedCount || 0) / m.slots) * 100);
  return (
    <button onClick={() => onOpen(m)} className="w-full text-left rounded-2xl p-3.5 mb-3 flex flex-col gap-2.5" style={{ background: C.surface }}>
      <div className="flex items-start justify-between">
        <div className="text-[15px] font-bold leading-tight" style={{ color: C.text }}>{m.title}</div>
        <ChevronRight size={18} style={{ color: C.dim, flexShrink: 0, marginTop: 2 }} />
      </div>
      <div className="flex items-center justify-between">
        <StatusPill st={st} />
        <span className="text-xs font-mono" style={{ color: C.dim }}>{st === "live" ? "in progress" : countdown(m.startsAt - now)}</span>
      </div>
      <div className="flex items-center gap-3 text-xs" style={{ color: C.dim }}>
        <span className="flex items-center gap-1"><Coins size={12} style={{ color: C.amber }} /> {m.entryFee} entry</span>
        <span className="flex items-center gap-1"><Trophy size={12} style={{ color: C.amber }} /> {m.prize} prize</span>
        <span className="flex items-center gap-1"><Users size={12} /> {joinedCount || 0}/{m.slots}</span>
        {joined && <span className="ml-auto font-bold" style={{ color: C.violet }}>JOINED</span>}
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: C.border }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.violet }} />
      </div>
    </button>
  );
}
function Header({ title, onBack, coins, onAdd }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        {onBack && <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full" style={{ background: C.surface }}><ChevronLeft size={16} style={{ color: C.dim }} /></button>}
        <span className="text-lg font-black tracking-tight" style={{ color: C.text }}>{title}</span>
      </div>
      <CoinBadge coins={coins} onAdd={onAdd} />
    </div>
  );
}
function Field({ icon: Icon, ...props }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-3" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
      {Icon && <Icon size={16} style={{ color: C.dim }} />}
      <input {...props} className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.text }} />
    </div>
  );
}
function AccountRow({ icon: Icon, label, color, onClick, danger }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3.5 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
      <Icon size={16} style={{ color: danger ? C.red : (color || C.dim) }} />
      <span className="flex-1 text-left text-sm font-semibold" style={{ color: danger ? C.red : C.text }}>{label}</span>
      <ChevronRight size={16} style={{ color: C.dim }} />
    </button>
  );
}

function Splash() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center" style={{ background: C.bg }}>
      <style>{`
        @keyframes flamePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.85; } }
        @keyframes riseIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes dotBlink { 0%,100% { opacity: 0.25; } 50% { opacity: 1; } }
        .flame-anim { animation: flamePulse 1.1s ease-in-out infinite; }
        .rise-anim { animation: riseIn 0.6s ease-out 0.15s both; }
        .dot1 { animation: dotBlink 1.2s infinite 0s; }
        .dot2 { animation: dotBlink 1.2s infinite 0.2s; }
        .dot3 { animation: dotBlink 1.2s infinite 0.4s; }
      `}</style>
      <div className="flame-anim w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: C.violetDim }}>
        <Flame size={40} style={{ color: C.red }} />
      </div>
      <div className="rise-anim text-2xl font-black tracking-tight" style={{ color: C.text }}>CLUTCH</div>
      <div className="rise-anim text-xs mt-1 tracking-widest uppercase" style={{ color: C.dim }}>Free Fire Tournaments</div>
      <div className="flex items-center gap-1 mt-6">
        <span className="dot1 w-1.5 h-1.5 rounded-full" style={{ background: C.dim }} />
        <span className="dot2 w-1.5 h-1.5 rounded-full" style={{ background: C.dim }} />
        <span className="dot3 w-1.5 h-1.5 rounded-full" style={{ background: C.dim }} />
      </div>
    </div>
  );
}

function AuthChoice({ onPick }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end p-6" style={{ background: C.bg }}>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: C.violetDim }}><Flame size={30} style={{ color: C.red }} /></div>
        <div className="text-xl font-black" style={{ color: C.text }}>Welcome to Clutch</div>
        <div className="text-sm mt-1 text-center" style={{ color: C.dim }}>Join Free Fire tournaments and earn by your skills.</div>
      </div>
      <button onClick={() => onPick("signup")} className="w-full rounded-xl py-3.5 font-bold text-sm mb-3" style={{ background: C.violet, color: "#fff" }}>Create account</button>
      <button onClick={() => onPick("login")} className="w-full rounded-xl py-3.5 font-bold text-sm" style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}` }}>Log in</button>
    </div>
  );
}

function SignUp({ onBack, onSubmit, busy, error }) {
  const [phone, setPhone] = useState("");
  const [gameName, setGameName] = useState("");
  const [realName, setRealName] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="absolute inset-0 z-40 flex flex-col p-5" style={{ background: C.bg }}>
      <button onClick={onBack} className="p-1.5 -ml-1.5 mb-3 rounded-full self-start" style={{ background: C.surface }}><ChevronLeft size={16} style={{ color: C.dim }} /></button>
      <div className="text-xl font-black mb-1" style={{ color: C.text }}>Create your account</div>
      <div className="text-xs mb-5" style={{ color: C.dim }}>You'll use your phone number and password to log in later.</div>
      <Field icon={Phone} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" />
      <Field icon={Gamepad2} placeholder="In-game name" value={gameName} onChange={(e) => setGameName(e.target.value)} />
      <Field icon={UserCircle2} placeholder="Real name" value={realName} onChange={(e) => setRealName(e.target.value)} />
      <Field icon={Lock} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div className="text-xs font-semibold mb-2" style={{ color: C.red }}>{error}</div>}
      <button
        disabled={busy}
        onClick={() => onSubmit({ phone: phone.trim(), gameName: gameName.trim(), realName: realName.trim(), password })}
        className="w-full rounded-xl py-3.5 font-bold text-sm mt-2"
        style={{ background: C.violet, color: "#fff", opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "Creating account…" : "Sign up"}
      </button>
    </div>
  );
}

function LogIn({ onBack, onSubmit, busy, error }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="absolute inset-0 z-40 flex flex-col p-5" style={{ background: C.bg }}>
      <button onClick={onBack} className="p-1.5 -ml-1.5 mb-3 rounded-full self-start" style={{ background: C.surface }}><ChevronLeft size={16} style={{ color: C.dim }} /></button>
      <div className="text-xl font-black mb-1" style={{ color: C.text }}>Log in</div>
      <div className="text-xs mb-5" style={{ color: C.dim }}>Use the phone number and password from sign up.</div>
      <Field icon={Phone} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" />
      <Field icon={Lock} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div className="text-xs font-semibold mb-2" style={{ color: C.red }}>{error}</div>}
      <button
        disabled={busy}
        onClick={() => onSubmit({ phone: phone.trim(), password })}
        className="w-full rounded-xl py-3.5 font-bold text-sm mt-2"
        style={{ background: C.violet, color: "#fff", opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "Logging in…" : "Log in"}
      </button>
    </div>
  );
}

export default function App() {
  const [now, setNow] = useState(Date.now());
  const [booted, setBooted] = useState(false);
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("choice");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [view, setView] = useState("home");
  const [matchType, setMatchType] = useState("cs");
  const [mode, setMode] = useState("solo");
  const [coins, setCoins] = useState(0);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [usedCodes, setUsedCodes] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [joinedPlayers, setJoinedPlayers] = useState({});
  const [roomDetails, setRoomDetails] = useState({});
  const [adminContent, setAdminContent] = useState({ ads: DEFAULT_ADS, rules: DEFAULT_RULES });
  const [matches, setMatches] = useState([]);
  const [appStatus, setAppStatus] = useState({ on: true, reason: "" });

  const [activeMatch, setActiveMatch] = useState(null);
  const [joinFormMatch, setJoinFormMatch] = useState(null);
  const [joinGameName, setJoinGameName] = useState("");
  const [joinUid, setJoinUid] = useState("");
  const [joinTeammates, setJoinTeammates] = useState([]);
  const [joinError, setJoinError] = useState(null);
  const [joinBusy, setJoinBusy] = useState(false);
  const [viewPlayersMatch, setViewPlayersMatch] = useState(null);
  const [viewRoomMatch, setViewRoomMatch] = useState(null);

  const [tab, setTab] = useState("home");
  const [acctView, setAcctView] = useState(null);
  const [code, setCode] = useState("");
  const [depositMsg, setDepositMsg] = useState(null);
  const [depositBusy, setDepositBusy] = useState(false);
  const [showMinDepositPopup, setShowMinDepositPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(null);
  const [joinToast, setJoinToast] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [adIndex, setAdIndex] = useState(0);

  const [editName, setEditName] = useState("");
  const [editPass, setEditPass] = useState("");
  const [editPassConfirm, setEditPassConfirm] = useState("");
  const [editMsg, setEditMsg] = useState(null);
  const [editBusy, setEditBusy] = useState(false);

  const [withdrawMethod, setWithdrawMethod] = useState("easypaisa");
  const [wAccountId, setWAccountId] = useState("");
  const [wAccountHolder, setWAccountHolder] = useState("");
  const [wCoins, setWCoins] = useState("");
  const [withdrawMsg, setWithdrawMsg] = useState(null);
  const [withdrawBusy, setWithdrawBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const existingSession = readSession();
      if (existingSession) {
        try {
          const acc = await fetchAccount(existingSession.phone);
          if (acc && !acc.banned) {
            setSession({ phone: acc.phone, gameName: acc.gameName, realName: acc.realName });
            setCoins(acc.coins ?? 0);
            setDepositHistory(acc.depositHistory || []);
            setWithdrawHistory(acc.withdrawHistory || []);
            setJoinedIds(acc.joinedMatchIds || []);
          } else {
            clearSession();
          }
        } catch (e) {
          console.error("Failed to load account:", e);
        }
      }
      setTimeout(() => setBooted(true), 1600);
    })();
  }, []);

  useEffect(() => {
    const unsubRooms = onSnapshot(collection(db, "roomDetails"), (snap) => {
      const m = {};
      snap.forEach((d) => { m[d.id] = d.data(); });
      setRoomDetails(m);
    }, (e) => console.error("roomDetails listener error:", e));

    const unsubPlayers = onSnapshot(collection(db, "joinedPlayers"), (snap) => {
      const m = {};
      snap.forEach((d) => { m[d.id] = d.data().teams || []; });
      setJoinedPlayers(m);
    }, (e) => console.error("joinedPlayers listener error:", e));

    const unsubAdmin = onSnapshot(doc(db, "adminContent", "home"), (d) => {
      if (d.exists()) {
        const data = d.data();
        setAdminContent({ ads: data.ads?.length ? data.ads : DEFAULT_ADS, rules: data.rules?.length ? data.rules : DEFAULT_RULES });
      }
    }, (e) => console.error("adminContent listener error:", e));

    const unsubMatches = onSnapshot(collection(db, "matches"), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.startsAt - b.startsAt);
      setMatches(list);
    }, (e) => console.error("matches listener error:", e));

    const unsubStatus = onSnapshot(doc(db, "settings", "appStatus"), (d) => {
      if (d.exists()) setAppStatus({ on: d.data().on !== false, reason: d.data().reason || "" });
      else setAppStatus({ on: true, reason: "" });
    }, (e) => console.error("appStatus listener error:", e));

    return () => { unsubRooms(); unsubPlayers(); unsubAdmin(); unsubMatches(); unsubStatus(); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setAdIndex((i) => (i + 1) % (adminContent.ads.length || 1)), 4000);
    return () => clearInterval(id);
  }, [adminContent.ads.length]);

  const filteredMatches = matches.filter((m) => m.type === matchType && m.mode === mode);
  const upcomingJoinedMatches = matches.filter((m) => joinedIds.includes(m.id));

  async function handleSignUp({ phone, gameName, realName, password }) {
    setAuthError(null);
    if (!phone || !gameName || !realName || !password) { setAuthError("Please fill in every field."); return; }
    if (password.length < 4) { setAuthError("Password should be at least 4 characters."); return; }
    setAuthBusy(true);
    try {
      const existing = await fetchAccount(phone);
      if (existing) { setAuthError("An account with this phone number already exists — try logging in."); setAuthBusy(false); return; }
      const profile = { phone, gameName, realName };
      await createAccount(phone, { ...profile, password, coins: 0, depositHistory: [], withdrawHistory: [], joinedMatchIds: [] });
      writeSession(profile);
      setSession(profile);
      setCoins(0);
      setDepositHistory([]);
      setWithdrawHistory([]);
      setJoinedIds([]);
    } catch (e) {
      console.error("Sign up failed:", e);
      setAuthError("Couldn't create your account — check your connection and try again.");
    }
    setAuthBusy(false);
  }

  async function handleLogIn({ phone, password }) {
    setAuthError(null);
    if (!phone || !password) { setAuthError("Enter your phone number and password."); return; }
    setAuthBusy(true);
    try {
      const acc = await fetchAccount(phone);
      if (!acc || acc.password !== password) { setAuthError("Phone number or password is incorrect."); setAuthBusy(false); return; }
      if (acc.banned) { setAuthError("This account has been banned."); setAuthBusy(false); return; }
      const profile = { phone: acc.phone, gameName: acc.gameName, realName: acc.realName };
      writeSession(profile);
      setSession(profile);
      setCoins(acc.coins ?? 0);
      setDepositHistory(acc.depositHistory || []);
      setWithdrawHistory(acc.withdrawHistory || []);
      setJoinedIds(acc.joinedMatchIds || []);
    } catch (e) {
      console.error("Log in failed:", e);
      setAuthError("Couldn't log you in — check your connection and try again.");
    }
    setAuthBusy(false);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setAuthMode("choice");
    setTab("home"); setView("home"); setActiveMatch(null); setAcctView(null);
  }

  function shareApp() {
    if (navigator.share) {
      navigator.share({ title: "Clutch", text: "Join me on Clutch — Free Fire tournaments!", url: window.location.href }).catch(() => {});
    } else {
      setJoinToast("Share link copied — send it to your squad!");
    }
  }

  async function submitCode() {
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    if (usedCodes.includes(clean)) { setDepositMsg({ text: "This payment ID has already been used." }); return; }
    const amount = VALID_CODES[clean];
    if (!amount) { setDepositMsg({ text: "Invalid payment ID. Double-check and try again." }); return; }
    if (amount < MIN_DEPOSIT) { setShowMinDepositPopup(true); return; }
    setDepositBusy(true);
    try {
      const newCoins = coins + amount;
      const entry = { amount, code: clean, date: new Date().toISOString() };
      const newHistory = [entry, ...depositHistory];
      await patchAccount(session.phone, { coins: newCoins, depositHistory: newHistory });
      setCoins(newCoins);
      setDepositHistory(newHistory);
      setUsedCodes((u) => [...u, clean]);
      setCode(""); setDepositMsg(null); setSuccessPopup(amount);
    } catch (e) {
      console.error("Deposit failed:", e);
      setDepositMsg({ text: "Couldn't process the deposit — check your connection and try again." });
    }
    setDepositBusy(false);
  }

  async function submitWithdraw() {
    setWithdrawMsg(null);
    const amt = parseInt(wCoins, 10);
    if (!wAccountId.trim() || !wAccountHolder.trim() || !amt) { setWithdrawMsg("Please fill in every field."); return; }
    if (amt > coins) { setWithdrawMsg("You don't have enough coins for this withdrawal."); return; }
    setWithdrawBusy(true);
    try {
      const newCoins = coins - amt;
      const entry = { method: withdrawMethod, amount: amt, accountId: wAccountId.trim(), accountHolder: wAccountHolder.trim(), date: new Date().toISOString(), status: "Pending" };
      const newHistory = [entry, ...withdrawHistory];
      await patchAccount(session.phone, { coins: newCoins, withdrawHistory: newHistory });
      setCoins(newCoins);
      setWithdrawHistory(newHistory);
      setWAccountId(""); setWAccountHolder(""); setWCoins("");
      setJoinToast("Withdrawal request sent — the admin will process it shortly.");
      setAcctView(null);
    } catch (e) {
      console.error("Withdraw failed:", e);
      setWithdrawMsg("Couldn't send the request — check your connection and try again.");
    }
    setWithdrawBusy(false);
  }

  function openJoinForm(m) {
    setJoinFormMatch(m);
    setJoinGameName("");
    setJoinUid("");
    const teammateCount = m.mode === "duo" ? 1 : m.mode === "squad" ? 3 : 0;
    setJoinTeammates(Array.from({ length: teammateCount }, () => ({ gameName: "", uid: "" })));
    setJoinError(null);
  }

  function updateJoinTeammate(i, field, value) {
    setJoinTeammates((ts) => ts.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  }

  async function confirmJoin() {
    const m = joinFormMatch;
    if (!joinGameName.trim() || !joinUid.trim()) { setJoinError("Your game name and UID are required to join."); return; }
    if (joinTeammates.some((t) => !t.gameName.trim() || !t.uid.trim())) { setJoinError("Every teammate's game name and UID are required."); return; }
    if (joinedIds.includes(m.id)) { setJoinFormMatch(null); return; }
    if (coins < m.entryFee) { setJoinError("Not enough coins — deposit to join this match."); return; }
    setJoinBusy(true);
    try {
      const newCoins = coins - m.entryFee;
      const newJoinedIds = [...joinedIds, m.id];
      const members = [
        { gameName: joinGameName.trim(), uid: joinUid.trim() },
        ...joinTeammates.map((t) => ({ gameName: t.gameName.trim(), uid: t.uid.trim() })),
      ];
      await patchAccount(session.phone, { coins: newCoins, joinedMatchIds: newJoinedIds });
      await setDoc(doc(db, "joinedPlayers", String(m.id)), {
        teams: arrayUnion({ members }),
      }, { merge: true });
      setCoins(newCoins);
      setJoinedIds(newJoinedIds);
      setJoinFormMatch(null);
      setActiveMatch(null);
      setJoinToast(`Joined ${m.title}!`);
    } catch (e) {
      console.error("Join failed:", e);
      setJoinError("Couldn't join the match — check your connection and try again.");
    }
    setJoinBusy(false);
  }

  async function submitProfileEdit() {
    setEditMsg(null);
    if (editPass || editPassConfirm) {
      if (editPass.length < 4) { setEditMsg("New password should be at least 4 characters."); return; }
      if (editPass !== editPassConfirm) { setEditMsg("Passwords do not match."); return; }
    }
    setEditBusy(true);
    try {
      const newGameName = editName.trim() || session.gameName;
      const fields = { gameName: newGameName };
      if (editPass) fields.password = editPass;
      await patchAccount(session.phone, fields);
      const updatedSession = { ...session, gameName: newGameName };
      writeSession(updatedSession);
      setSession(updatedSession);
      setEditPass(""); setEditPassConfirm("");
      setJoinToast("Profile updated.");
      setAcctView(null);
    } catch (e) {
      console.error("Profile update failed:", e);
      setEditMsg("Couldn't save changes — check your connection and try again.");
    }
    setEditBusy(false);
  }

  useEffect(() => {
    if (!joinToast) return;
    const t = setTimeout(() => setJoinToast(null), 2400);
    return () => clearTimeout(t);
  }, [joinToast]);

  const matchesPlayed = joinedIds.length + 6, totalKills = 42, totalEarned = 480;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#050408" }}>
      <div className="relative w-full overflow-hidden flex flex-col" style={{ maxWidth: 390, height: 780, background: C.bg, borderRadius: 32, border: `1px solid ${C.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>

        {!booted && <Splash />}

        {booted && !appStatus.on && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 text-center" style={{ background: C.bg }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#3A1620" }}><Flame size={30} style={{ color: C.red }} /></div>
            <div className="text-xl font-black mb-2" style={{ color: C.text }}>Clutch is temporarily unavailable</div>
            {appStatus.reason && <div className="text-sm" style={{ color: C.dim }}>{appStatus.reason}</div>}
          </div>
        )}

        {booted && appStatus.on && !session && authMode === "choice" && <AuthChoice onPick={(m) => { setAuthError(null); setAuthMode(m); }} />}
        {booted && appStatus.on && !session && authMode === "signup" && <SignUp onBack={() => setAuthMode("choice")} onSubmit={handleSignUp} busy={authBusy} error={authError} />}
        {booted && appStatus.on && !session && authMode === "login" && <LogIn onBack={() => setAuthMode("choice")} onSubmit={handleLogIn} busy={authBusy} error={authError} />}

        {booted && appStatus.on && session && (
          <>
            <div className="flex items-center gap-1.5 px-4 pt-4">
              <Flame size={18} style={{ color: C.red }} />
              <span className="text-base font-black tracking-tight" style={{ color: C.text }}>CLUTCH</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: C.surfaceAlt, color: C.dim }}>FREE FIRE</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-2 relative mt-1">

              {tab === "home" && view === "home" && (
                <>
                  <Header title="Home" coins={coins} onAdd={() => { setTab("account"); setAcctView("deposit"); }} />
                  <BigCard icon={Swords} title="CS Matches" sub="Clash Squad · Solo, Duo, Squad" color={C.violet} onClick={() => { setMatchType("cs"); setView("modes"); }} />
                  <BigCard icon={Crosshair} title="BR Matches" sub="Battle Royale · Solo, Duo, Squad" color={C.teal} onClick={() => { setMatchType("br"); setView("modes"); }} />
                  <button onClick={() => setShowRules(true)} className="w-full text-left rounded-2xl p-3.5 mt-1 mb-3" style={{ background: `linear-gradient(135deg, ${C.violetDim}, ${C.surface})`, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Megaphone size={14} style={{ color: C.amber }} />
                      <span className="text-[10px] font-bold tracking-wide uppercase" style={{ color: C.amber }}>Announcement</span>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: C.text }}>{adminContent.ads[adIndex % adminContent.ads.length]}</div>
                    <div className="text-xs mt-1.5 underline" style={{ color: C.dim }}>View tournament rules</div>
                  </button>
                  <button onClick={() => setView("upcoming")} className="w-full rounded-2xl p-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${C.amberDim}, ${C.surface})`, border: `1px solid ${C.border}` }}>
                    <CalendarClock size={20} style={{ color: C.amber }} />
                    <span className="italic font-black text-base tracking-wide" style={{ color: C.amber, letterSpacing: "0.03em" }}>Upcoming Matches</span>
                    <ChevronRight size={18} style={{ color: C.dim, marginLeft: "auto" }} />
                  </button>
                </>
              )}

              {tab === "home" && view === "modes" && (
                <>
                  <Header title={matchType === "cs" ? "CS Matches" : "BR Matches"} onBack={() => setView("home")} coins={coins} onAdd={() => { setTab("account"); setAcctView("deposit"); }} />
                  <ModeCard icon={User} title="Solo" sub="1 player per team" onClick={() => { setMode("solo"); setView("matches"); }} />
                  <ModeCard icon={Users} title="Duo" sub="2 players per team" onClick={() => { setMode("duo"); setView("matches"); }} />
                  <ModeCard icon={Users} title="Squad" sub="4 players per team" onClick={() => { setMode("squad"); setView("matches"); }} />
                </>
              )}

              {tab === "home" && view === "matches" && (
                <>
                  <Header title={`${matchType === "cs" ? "CS" : "BR"} · ${mode[0].toUpperCase() + mode.slice(1)}`} onBack={() => setView("modes")} coins={coins} onAdd={() => { setTab("account"); setAcctView("deposit"); }} />
                  {filteredMatches.length === 0 && <div className="text-sm text-center mt-8" style={{ color: C.dim }}>No matches yet — check back soon.</div>}
                  {filteredMatches.map((m) => <MatchCard key={m.id} m={m} now={now} onOpen={setActiveMatch} joined={joinedIds.includes(m.id)} joinedCount={(joinedPlayers[m.id] || []).length} />)}
                </>
              )}

              {tab === "home" && view === "upcoming" && (
                <>
                  <Header title="Upcoming Matches" onBack={() => setView("home")} coins={coins} onAdd={() => { setTab("account"); setAcctView("deposit"); }} />
                  {upcomingJoinedMatches.length === 0 && (
                    <div className="text-sm text-center mt-8" style={{ color: C.dim }}>You haven't joined any matches yet.</div>
                  )}
                  {upcomingJoinedMatches.map((m) => (
                    <div key={m.id} className="rounded-2xl p-3.5 mb-3" style={{ background: C.surface }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-[15px] font-bold" style={{ color: C.text }}>{m.title}</div>
                        <StatusPill st={statusOf(m, now)} />
                      </div>
                      <div className="text-xs mb-3" style={{ color: C.dim }}>
                        {statusOf(m, now) === "live" ? "Match is live now" : `Starts in ${countdown(m.startsAt - now)}`}
                      </div>
                      <button onClick={() => setViewRoomMatch(m)} className="w-full rounded-xl py-2.5 font-bold text-xs flex items-center justify-center gap-2" style={{ background: C.violetDim, color: C.violet }}>
                        <DoorOpen size={14} /> Room details
                      </button>
                    </div>
                  ))}
                </>
              )}

              {tab === "leaderboard" && (
                <>
                  <Header title="Leaderboard" coins={coins} onAdd={() => { setTab("account"); setAcctView("deposit"); }} />
                  <div className="rounded-2xl overflow-hidden" style={{ background: C.surface }}>
                    {LEADERBOARD.map((p, i) => (
                      <div key={p.name} className="flex items-center gap-3 px-3.5 py-3" style={{ borderBottom: i < LEADERBOARD.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <span className="w-6 text-sm font-bold text-center" style={{ color: i < 3 ? C.amber : C.dim }}>{i + 1}</span>
                        <span className="flex-1 text-sm font-semibold" style={{ color: p.name === "You" ? C.violet : C.text }}>{p.name}</span>
                        <span className="flex items-center gap-1 text-xs" style={{ color: C.dim }}><Skull size={12} /> {p.kills}</span>
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.amber }}><Coins size={12} /> {p.earned}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === "account" && acctView === null && (
                <>
                  <Header title="Account" coins={coins} onAdd={() => setAcctView("deposit")} />
                  <div className="flex flex-col items-center text-center pt-3 pb-5">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: C.violetDim }}><User size={26} style={{ color: C.violet }} /></div>
                    <div className="font-bold" style={{ color: C.text }}>{session.gameName}</div>
                    <div className="text-xs mt-1" style={{ color: C.dim }}>{session.realName}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-xl p-3 text-center" style={{ background: C.surface }}>
                      <div className="text-lg font-bold" style={{ color: C.text }}>{matchesPlayed}</div>
                      <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: C.dim }}>Matches</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: C.surface }}>
                      <div className="text-lg font-bold" style={{ color: C.text }}>{totalKills}</div>
                      <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: C.dim }}>Kills</div>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: C.surface }}>
                      <div className="text-lg font-bold" style={{ color: C.amber }}>{totalEarned}</div>
                      <div className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: C.dim }}>Earned</div>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden mb-3" style={{ background: C.surface }}>
                    <AccountRow icon={Pencil} label="Edit Profile" onClick={() => { setEditName(session.gameName); setEditMsg(null); setAcctView("editProfile"); }} />
                    <AccountRow icon={Wallet} label="Wallet" onClick={() => setAcctView("wallet")} />
                    <AccountRow icon={ArrowDownToLine} label="Deposit" color={C.amber} onClick={() => setAcctView("deposit")} />
                    <AccountRow icon={ArrowUpFromLine} label="Withdraw" color={C.teal} onClick={() => setAcctView("withdraw")} />
                  </div>
                  <div className="rounded-2xl overflow-hidden" style={{ background: C.surface }}>
                    <button onClick={shareApp} className="w-full flex items-center gap-3 px-3.5 py-3.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                      <Share2 size={16} style={{ color: C.dim }} />
                      <span className="flex-1 text-left text-sm font-semibold" style={{ color: C.text }}>Share the app</span>
                      <ChevronRight size={16} style={{ color: C.dim }} />
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-3.5">
                      <LogOut size={16} style={{ color: C.red }} />
                      <span className="flex-1 text-left text-sm font-semibold" style={{ color: C.red }}>Log out</span>
                    </button>
                  </div>
                </>
              )}

              {tab === "account" && acctView === "editProfile" && (
                <>
                  <Header title="Edit Profile" onBack={() => setAcctView(null)} coins={coins} onAdd={() => {}} />
                  <div className="rounded-2xl p-4" style={{ background: C.surface }}>
                    <div className="text-xs mb-1" style={{ color: C.dim }}>Full Name</div>
                    <Field placeholder="In-game name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <div className="text-xs mb-1 mt-1" style={{ color: C.dim }}>New Password</div>
                    <Field icon={Lock} placeholder="New password" type="password" value={editPass} onChange={(e) => setEditPass(e.target.value)} />
                    <div className="text-xs mb-1" style={{ color: C.dim }}>Re-enter New Password</div>
                    <Field icon={Lock} placeholder="Re-enter new password" type="password" value={editPassConfirm} onChange={(e) => setEditPassConfirm(e.target.value)} />
                    {editMsg && <div className="text-xs font-semibold mb-2" style={{ color: C.red }}>{editMsg}</div>}
                    <button disabled={editBusy} onClick={submitProfileEdit} className="w-full rounded-xl py-3 font-bold text-sm" style={{ background: C.amber, color: "#1a1400", opacity: editBusy ? 0.6 : 1 }}>{editBusy ? "Saving…" : "Update Profile"}</button>
                  </div>
                </>
              )}

              {tab === "account" && acctView === "wallet" && (
                <>
                  <Header title="Wallet" onBack={() => setAcctView(null)} coins={coins} onAdd={() => {}} />
                  <div className="rounded-2xl p-4 mb-4 text-center" style={{ background: C.surface }}>
                    <div className="text-xs uppercase tracking-wide" style={{ color: C.dim }}>Current Balance</div>
                    <div className="text-3xl font-black mt-1" style={{ color: C.amber }}>{coins} coins</div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.dim }}>Deposit History</div>
                  <div className="rounded-2xl overflow-hidden mb-4" style={{ background: C.surface }}>
                    {depositHistory.length === 0 && <div className="p-3.5 text-xs" style={{ color: C.dim }}>No deposits yet.</div>}
                    {depositHistory.map((d, i) => (
                      <div key={i} className="flex items-center justify-between px-3.5 py-3" style={{ borderBottom: i < depositHistory.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <span className="text-xs" style={{ color: C.dim }}>{new Date(d.date).toLocaleDateString()}</span>
                        <span className="text-sm font-bold" style={{ color: C.teal }}>+{d.amount} coins</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.dim }}>Withdrawal History</div>
                  <div className="rounded-2xl overflow-hidden" style={{ background: C.surface }}>
                    {withdrawHistory.length === 0 && <div className="p-3.5 text-xs" style={{ color: C.dim }}>No withdrawals yet.</div>}
                    {withdrawHistory.map((w, i) => (
                      <div key={i} className="flex items-center justify-between px-3.5 py-3" style={{ borderBottom: i < withdrawHistory.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <span className="text-xs" style={{ color: C.dim }}>{new Date(w.date).toLocaleDateString()} · {w.method}</span>
                        <span className="text-sm font-bold" style={{ color: C.red }}>-{w.amount} ({w.status})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === "account" && acctView === "deposit" && (
                <>
                  <Header title="Deposit" onBack={() => setAcctView(null)} coins={coins} onAdd={() => {}} />
                  <div className="rounded-2xl p-4 mt-1" style={{ background: C.surface }}>
                    <div className="text-sm mb-3" style={{ color: C.dim }}>Send payment to get your payment ID on WhatsApp, then paste it below to receive your coins instantly. Minimum deposit is 100 coins.</div>
                    <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Paste payment ID" className="w-full rounded-xl px-3.5 py-3 text-sm font-mono outline-none mb-3" style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }} />
                    <button disabled={depositBusy} onClick={submitCode} className="w-full rounded-xl py-3 font-bold text-sm mb-3" style={{ background: C.violet, color: "#fff", opacity: depositBusy ? 0.6 : 1 }}>{depositBusy ? "Processing…" : "Redeem coins"}</button>
                    <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer" className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2" style={{ background: "#1E4B3A", color: "#5FE0A8" }}>
                      <MessageCircle size={16} /> Click here to contact admin for payment ID
                    </a>
                    {depositMsg && <div className="text-xs mt-3 font-semibold" style={{ color: C.red }}>{depositMsg.text}</div>}
                  </div>
                </>
              )}

              {tab === "account" && acctView === "withdraw" && (
                <>
                  <Header title="Withdraw" onBack={() => setAcctView(null)} coins={coins} onAdd={() => {}} />
                  <div className="rounded-2xl p-4 mt-1 text-center mb-3" style={{ background: C.surface }}>
                    <div className="text-xs uppercase tracking-wide" style={{ color: C.dim }}>Available balance</div>
                    <div className="text-2xl font-black mt-1" style={{ color: C.amber }}>{coins} coins</div>
                  </div>
                  <div className="flex rounded-xl overflow-hidden mb-3" style={{ border: `1px solid ${C.border}` }}>
                    <button onClick={() => setWithdrawMethod("easypaisa")} className="flex-1 py-3 text-sm font-bold" style={{ background: withdrawMethod === "easypaisa" ? C.teal : C.surface, color: withdrawMethod === "easypaisa" ? "#04241C" : C.dim }}>EasyPaisa</button>
                    <button onClick={() => setWithdrawMethod("jazzcash")} className="flex-1 py-3 text-sm font-bold" style={{ background: withdrawMethod === "jazzcash" ? C.red : C.surface, color: withdrawMethod === "jazzcash" ? "#2A0507" : C.dim }}>JazzCash</button>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: C.surface }}>
                    <div className="text-xs mb-1" style={{ color: C.dim }}>Account ID</div>
                    <Field placeholder="Account number" value={wAccountId} onChange={(e) => setWAccountId(e.target.value)} inputMode="numeric" />
                    <div className="text-xs mb-1" style={{ color: C.dim }}>Account Holder Name</div>
                    <Field placeholder="Account holder name" value={wAccountHolder} onChange={(e) => setWAccountHolder(e.target.value)} />
                    <div className="text-xs mb-1" style={{ color: C.dim }}>Withdrawal Coins</div>
                    <Field placeholder="Withdrawal coins" value={wCoins} onChange={(e) => setWCoins(e.target.value)} inputMode="numeric" />
                    {withdrawMsg && <div className="text-xs font-semibold mb-2" style={{ color: C.red }}>{withdrawMsg}</div>}
                    <button disabled={withdrawBusy} onClick={submitWithdraw} className="w-full rounded-xl py-3 font-bold text-sm" style={{ background: C.teal, color: "#04241C", opacity: withdrawBusy ? 0.6 : 1 }}>{withdrawBusy ? "Sending…" : "Send Payment Request"}</button>
                  </div>
                </>
              )}

              {activeMatch && (
                <div className="absolute inset-0 z-20 flex flex-col overflow-y-auto" style={{ background: C.bg }}>
                  <div className="flex items-center justify-between px-0 pt-1 pb-2">
                    <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: C.violet }}>{activeMatch.type === "cs" ? "Clash Squad" : "Battle Royale"} · {activeMatch.mode}</span>
                    <button onClick={() => setActiveMatch(null)} className="p-1.5 rounded-full" style={{ background: C.surface }}><X size={16} style={{ color: C.dim }} /></button>
                  </div>
                  <h2 className="text-2xl font-black leading-tight mb-2" style={{ color: C.text }}>{activeMatch.title}</h2>
                  <div className="mb-4"><StatusPill st={statusOf(activeMatch, now)} /></div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="rounded-xl p-3" style={{ background: C.surface }}><div className="text-[10px] uppercase tracking-wide" style={{ color: C.dim }}>Map</div><div className="text-sm font-semibold mt-0.5" style={{ color: C.text }}>{activeMatch.map}</div></div>
                    <div className="rounded-xl p-3" style={{ background: C.surface }}><div className="text-[10px] uppercase tracking-wide" style={{ color: C.dim }}>Entry fee</div><div className="text-lg font-bold" style={{ color: C.amber }}>{activeMatch.entryFee} coins</div></div>
                    <div className="rounded-xl p-3" style={{ background: C.surface }}><div className="text-[10px] uppercase tracking-wide" style={{ color: C.dim }}>Prize pool</div><div className="text-lg font-bold" style={{ color: C.amber }}>{activeMatch.prize} coins</div></div>
                    <div className="rounded-xl p-3" style={{ background: C.surface }}><div className="text-[10px] uppercase tracking-wide" style={{ color: C.dim }}>Players</div><div className="text-sm font-semibold mt-0.5" style={{ color: C.text }}>{(joinedPlayers[activeMatch.id] || []).length}/{activeMatch.slots}</div></div>
                    <div className="rounded-xl p-3" style={{ background: C.surface }}><div className="text-[10px] uppercase tracking-wide" style={{ color: C.dim }}>Starts</div><div className="text-sm font-semibold mt-0.5" style={{ color: C.text }}>{statusOf(activeMatch, now) === "live" ? "Now" : countdown(activeMatch.startsAt - now)}</div></div>
                  </div>
                  {activeMatch.rules && (
                    <div className="rounded-xl p-3 mb-4" style={{ background: C.surface }}>
                      <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: C.dim }}>Rules</div>
                      <div className="text-xs" style={{ color: C.text }}>{activeMatch.rules}</div>
                    </div>
                  )}

                  <button onClick={() => setViewPlayersMatch(activeMatch)} className="w-full rounded-xl py-2.5 mb-3 font-bold text-xs" style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }}>
                    View players who joined
                  </button>

                  {joinedIds.includes(activeMatch.id) && statusOf(activeMatch, now) === "live" && (
                    <div className="rounded-2xl p-4 mb-4" style={{ background: C.surface }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.amber }}>Room Detail</div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs" style={{ color: C.dim }}>Room ID</span>
                        <span className="text-sm font-bold" style={{ color: C.text }}>{roomDetails[activeMatch.id]?.roomId || "Not shared yet"}</span>
                      </div>
                      <div className="flex items-center justify-between py-1.5">
                        <span className="text-xs" style={{ color: C.dim }}>Room Password</span>
                        <span className="text-sm font-bold" style={{ color: C.text }}>{roomDetails[activeMatch.id]?.roomPassword || "Not shared yet"}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-xs mb-3" style={{ color: C.dim }}>Entry fee is deducted immediately once you join and cannot be refunded.</div>
                  <div className="mt-auto pb-2">
                    <button
                      onClick={() => joinedIds.includes(activeMatch.id) ? null : openJoinForm(activeMatch)}
                      disabled={joinedIds.includes(activeMatch.id)}
                      className="w-full rounded-xl py-3.5 font-bold text-sm"
                      style={joinedIds.includes(activeMatch.id) ? { background: C.surfaceAlt, color: C.dim, border: `1px solid ${C.border}` } : { background: C.violet, color: "#fff" }}
                    >
                      {joinedIds.includes(activeMatch.id) ? "Already joined" : `Join with ${activeMatch.entryFee} coins`}
                    </button>
                  </div>
                </div>
              )}

              {joinFormMatch && (
                <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(5,4,8,0.85)" }}>
                  <div className="rounded-2xl p-5 mx-4 w-full max-h-[85%] overflow-y-auto" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="text-lg font-black mb-1" style={{ color: C.text }}>Enter your details</div>
                    <div className="text-xs mb-4" style={{ color: C.dim }}>Required to join {joinFormMatch.title}</div>
                    <div className="text-xs font-bold mb-1" style={{ color: C.dim }}>Your info</div>
                    <Field icon={Gamepad2} placeholder="In-game name" value={joinGameName} onChange={(e) => setJoinGameName(e.target.value)} />
                    <Field icon={UserCircle2} placeholder="Game UID" value={joinUid} onChange={(e) => setJoinUid(e.target.value)} inputMode="numeric" />
                    {joinTeammates.map((t, i) => (
                      <div key={i}>
                        <div className="text-xs font-bold mb-1 mt-2" style={{ color: C.dim }}>
                          {joinFormMatch.mode === "duo" ? "Teammate" : `Teammate ${i + 2}`}
                        </div>
                        <Field icon={Gamepad2} placeholder="Teammate in-game name" value={t.gameName} onChange={(e) => updateJoinTeammate(i, "gameName", e.target.value)} />
                        <Field icon={UserCircle2} placeholder="Teammate UID" value={t.uid} onChange={(e) => updateJoinTeammate(i, "uid", e.target.value)} inputMode="numeric" />
                      </div>
                    ))}
                    {joinError && <div className="text-xs font-semibold mb-2" style={{ color: C.red }}>{joinError}</div>}
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setJoinFormMatch(null)} className="flex-1 rounded-xl py-3 font-bold text-sm" style={{ background: C.surfaceAlt, color: C.text }}>Cancel</button>
                      <button disabled={joinBusy} onClick={confirmJoin} className="flex-1 rounded-xl py-3 font-bold text-sm" style={{ background: C.violet, color: "#fff", opacity: joinBusy ? 0.6 : 1 }}>{joinBusy ? "Joining…" : "Confirm Join"}</button>
                    </div>
                  </div>
                </div>
              )}

              {viewPlayersMatch && (
                <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(5,4,8,0.75)" }}>
                  <div className="w-full rounded-t-3xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}`, maxHeight: "70%", overflowY: "auto" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-black" style={{ color: C.text }}>Players joined</span>
                      <button onClick={() => setViewPlayersMatch(null)} className="p-1.5 rounded-full" style={{ background: C.surfaceAlt }}><X size={15} style={{ color: C.dim }} /></button>
                    </div>
                    {(joinedPlayers[viewPlayersMatch.id] || []).length === 0 && (
                      <div className="text-sm" style={{ color: C.dim }}>No one has joined with details yet.</div>
                    )}
                    {(joinedPlayers[viewPlayersMatch.id] || []).map((team, i) => (
                      <div key={i} className="py-2.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                        {viewPlayersMatch.mode !== "solo" && <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: C.violet }}>Team {i + 1}</div>}
                        {(team.members || []).map((p, j) => (
                          <div key={j} className="flex items-center justify-between py-0.5">
                            <span className="text-sm font-semibold" style={{ color: C.text }}>{p.gameName}</span>
                            <span className="text-xs" style={{ color: C.dim }}>UID: {p.uid}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewRoomMatch && (
                <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(5,4,8,0.85)" }}>
                  <div className="rounded-2xl p-5 mx-4 w-full" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-black" style={{ color: C.text }}>Room Details</span>
                      <button onClick={() => setViewRoomMatch(null)} className="p-1.5 rounded-full" style={{ background: C.surfaceAlt }}><X size={15} style={{ color: C.dim }} /></button>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs" style={{ color: C.dim }}>Room ID</span>
                      <span className="text-sm font-bold" style={{ color: C.text }}>{roomDetails[viewRoomMatch.id]?.roomId || "Not shared yet"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs" style={{ color: C.dim }}>Room Password</span>
                      <span className="text-sm font-bold" style={{ color: C.text }}>{roomDetails[viewRoomMatch.id]?.roomPassword || "Not shared yet"}</span>
                    </div>
                  </div>
                </div>
              )}

              {showRules && (
                <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(5,4,8,0.75)" }}>
                  <div className="w-full rounded-t-3xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-black" style={{ color: C.text }}>Tournament rules</span>
                      <button onClick={() => setShowRules(false)} className="p-1.5 rounded-full" style={{ background: C.surfaceAlt }}><X size={15} style={{ color: C.dim }} /></button>
                    </div>
                    <ul className="space-y-2.5 mb-4">
                      {adminContent.rules.map((r, i) => <li key={i} className="text-sm flex gap-2" style={{ color: C.dim }}><span style={{ color: C.violet }}>•</span>{r}</li>)}
                    </ul>
                    <button onClick={() => setShowRules(false)} className="w-full rounded-xl py-3 font-bold text-sm" style={{ background: C.violet, color: "#fff" }}>Got it</button>
                  </div>
                </div>
              )}

              {showMinDepositPopup && (
                <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(5,4,8,0.75)" }}>
                  <div className="rounded-2xl p-6 flex flex-col items-center text-center mx-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="text-lg font-bold mt-1" style={{ color: C.text }}>Minimum deposit is of 100 coins</div>
                    <button onClick={() => setShowMinDepositPopup(false)} className="mt-4 px-6 py-2 rounded-full text-sm font-bold" style={{ background: C.violet, color: "#fff" }}>Got it</button>
                  </div>
                </div>
              )}

              {successPopup !== null && (
                <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "rgba(5,4,8,0.75)" }}>
                  <div className="rounded-2xl p-6 flex flex-col items-center text-center mx-4" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <CheckCircle2 size={40} style={{ color: C.teal }} />
                    <div className="text-lg font-bold mt-3" style={{ color: C.text }}>Coins are given to you!</div>
                    <div className="text-sm mt-1" style={{ color: C.dim }}>+{successPopup} coins added to your balance</div>
                    <button onClick={() => setSuccessPopup(null)} className="mt-4 px-6 py-2 rounded-full text-sm font-bold" style={{ background: C.violet, color: "#fff" }}>Nice</button>
                  </div>
                </div>
              )}

              {joinToast && (
                <div className="absolute left-0 right-0 bottom-2 z-30 flex justify-center px-4">
                  <div className="px-4 py-2.5 rounded-full text-xs font-semibold text-center" style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }}>{joinToast}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-around py-3" style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
              {[{ id: "home", label: "Home", icon: Home }, { id: "leaderboard", label: "Leaderboard", icon: Trophy }, { id: "account", label: "Account", icon: User }].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setTab(id); if (id === "home") setView("home"); if (id === "account") setAcctView(null); }} className="flex flex-col items-center gap-1">
                  <Icon size={18} style={{ color: tab === id ? C.violet : C.dim }} />
                  <span className="text-[10px] font-semibold" style={{ color: tab === id ? C.violet : C.dim }}>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
    }
