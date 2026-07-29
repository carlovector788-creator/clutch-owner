import { useState, useEffect } from "react";
import {
  Flame, KeyRound, ChevronLeft, ChevronRight, X, Plus, Trash2,
  Swords, Crosshair, Pencil, Users2, Wallet2, Settings as SettingsIcon,
  ArrowUpFromLine, Ban, UserX, Coins, Phone, Power, User, Users,
} from "lucide-react";
import { db } from "./firebase";
import {
  doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection,
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

const DEFAULT_ADMIN_KEY = "Harry071";

function Field({ icon: Icon, label, ...props }) {
  return (
    <div className="mb-3">
      {label && <div className="text-xs mb-1" style={{ color: C.dim }}>{label}</div>}
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
        {Icon && <Icon size={16} style={{ color: C.dim }} />}
        <input {...props} className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.text }} />
      </div>
    </div>
  );
}
function TextArea({ label, ...props }) {
  return (
    <div className="mb-3">
      {label && <div className="text-xs mb-1" style={{ color: C.dim }}>{label}</div>}
      <textarea {...props} className="w-full rounded-xl px-3.5 py-3 text-sm outline-none" style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }} />
    </div>
  );
}
function Header({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        {onBack && <button type="button" onClick={onBack} className="p-1.5 -ml-1.5 rounded-full" style={{ background: C.surface }}><ChevronLeft size={16} style={{ color: C.dim }} /></button>}
        <span className="text-lg font-black tracking-tight" style={{ color: C.text }}>{title}</span>
      </div>
      {right}
    </div>
  );
}

function Splash() {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center" style={{ background: C.bg }}>
      <style>{`
        @keyframes flamePulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.12); opacity: 0.85; } }
        @keyframes riseIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        .flame-anim { animation: flamePulse 1.1s ease-in-out infinite; }
        .rise-anim { animation: riseIn 0.6s ease-out 0.15s both; }
      `}</style>
      <div className="flame-anim w-20 h-20 rounded-3xl flex items-center justify-center mb-4" style={{ background: C.violetDim }}>
        <Flame size={40} style={{ color: C.red }} />
      </div>
      <div className="rise-anim text-2xl font-black tracking-tight" style={{ color: C.text }}>CLUTCH</div>
      <div className="rise-anim text-xs mt-1 tracking-widest uppercase" style={{ color: C.dim }}>Owner Panel</div>
    </div>
  );
}

function AdminLogin({ onSubmit, error }) {
  const [key, setKey] = useState("");
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6" style={{ background: C.bg }}>
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6" style={{ background: C.violetDim }}>
        <Flame size={44} style={{ color: C.red }} />
      </div>
      <div className="w-full max-w-xs">
        <div className="text-xs mb-1" style={{ color: C.dim }}>Admin Key</div>
        <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-3" style={{ background: C.surfaceAlt, border: `1px solid ${C.border}` }}>
          <KeyRound size={16} style={{ color: C.dim }} />
          <input value={key} onChange={(e) => setKey(e.target.value)} type="password" className="flex-1 bg-transparent outline-none text-sm" style={{ color: C.text }} />
        </div>
        {error && <div className="text-xs font-semibold mb-2" style={{ color: C.red }}>{error}</div>}
        <button type="button" onClick={() => onSubmit(key)} className="w-full rounded-xl py-3 font-bold text-sm" style={{ background: C.teal, color: "#04241C" }}>Login</button>
      </div>
    </div>
  );
}

function MatchForm({ type, mode, editing, busy, onCancel, onSave, onDelete }) {
  const [title, setTitle] = useState(editing?.title || "");
  const [mapName, setMapName] = useState(editing?.map || "");
  const [slots, setSlots] = useState(editing?.slots?.toString() || "");
  const [entryFee, setEntryFee] = useState(editing?.entryFee?.toString() || "");
  const [prize, setPrize] = useState(editing?.prize?.toString() || "");
  const [rules, setRules] = useState(editing?.rules || "");
  const [dateVal, setDateVal] = useState(editing?.startsAt ? new Date(editing.startsAt).toISOString().slice(0, 10) : "");
  const [timeVal, setTimeVal] = useState(editing?.startsAt ? new Date(editing.startsAt).toTimeString().slice(0, 5) : "");
  const [roomId, setRoomId] = useState(editing?.roomId || "");
  const [roomPassword, setRoomPassword] = useState(editing?.roomPassword || "");
  const [err, setErr] = useState(null);

  function submit() {
    if (!title.trim() || !mapName.trim() || !slots || !entryFee || !prize || !dateVal || !timeVal) {
      setErr("Please fill in every required field.");
      return;
    }
    const startsAt = new Date(`${dateVal}T${timeVal}`).getTime();
    onSave({
      type, mode,
      title: title.trim(),
      map: mapName.trim(),
      slots: parseInt(slots, 10),
      entryFee: parseInt(entryFee, 10),
      prize: parseInt(prize, 10),
      rules: rules.trim(),
      startsAt,
      roomId: roomId.trim(),
      roomPassword: roomPassword.trim(),
    });
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-y-auto p-5" style={{ background: C.bg }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-black" style={{ color: C.text }}>{editing ? "Edit Match" : "Add Match"}</span>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-full" style={{ background: C.surface }}><X size={16} style={{ color: C.dim }} /></button>
      </div>
      <div className="text-xs mb-3 px-3 py-2 rounded-lg inline-block" style={{ background: C.violetDim, color: C.violet }}>{type === "cs" ? "CS" : "BR"} · {mode[0].toUpperCase() + mode.slice(1)}</div>

      <Field label="Match name" placeholder="e.g. CS Solo Grind #21" value={title} onChange={(e) => setTitle(e.target.value)} />

      <Field label="Number of slots" placeholder="e.g. 16" value={slots} onChange={(e) => setSlots(e.target.value)} inputMode="numeric" />
      <Field label="Map name" placeholder="e.g. Bermuda" value={mapName} onChange={(e) => setMapName(e.target.value)} />
      <Field label="Entry fee (coins)" placeholder="e.g. 20" value={entryFee} onChange={(e) => setEntryFee(e.target.value)} inputMode="numeric" />
      <Field label="Prize pool (coins)" placeholder="e.g. 150" value={prize} onChange={(e) => setPrize(e.target.value)} inputMode="numeric" />

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <div className="text-xs mb-1" style={{ color: C.dim }}>Date</div>
          <input type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)} className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }} />
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: C.dim }}>Time</div>
          <input type="time" value={timeVal} onChange={(e) => setTimeVal(e.target.value)} className="w-full rounded-xl px-3 py-3 text-sm outline-none" style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }} />
        </div>
      </div>

      <TextArea label="Rules" rows={4} placeholder="Match-specific rules…" value={rules} onChange={(e) => setRules(e.target.value)} />

      <Field label="Room ID (leave blank until ready)" placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} />
      <Field label="Room Password (leave blank until ready)" placeholder="Room Password" value={roomPassword} onChange={(e) => setRoomPassword(e.target.value)} />

      {err && <div className="text-xs font-semibold mb-2" style={{ color: C.red }}>{err}</div>}

      <button type="button" disabled={busy} onClick={submit} className="w-full rounded-xl py-3 font-bold text-sm mb-2 disabled:opacity-50" style={{ background: C.violet, color: "#fff" }}>{busy ? "Saving…" : editing ? "Save Changes" : "Create Match"}</button>
      {editing && (
        <button type="button" disabled={busy} onClick={() => onDelete(editing.id)} className="w-full rounded-xl py-3 font-bold text-sm mb-6 disabled:opacity-50" style={{ background: "#3A1620", color: C.red }}>Delete Match</button>
      )}
    </div>
  );
}

export default function OwnerApp() {
  const [booted, setBooted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [adminKey, setAdminKey] = useState(DEFAULT_ADMIN_KEY);

  const [tab, setTab] = useState("home");
  const [matchType, setMatchType] = useState("cs");
  const [manageOpen, setManageOpen] = useState(false);
  const [manageMode, setManageMode] = useState(null);
  const [matchForm, setMatchForm] = useState(null);

  const [matches, setMatches] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [paymentCodes, setPaymentCodes] = useState([]);
  const [adminContent, setAdminContentState] = useState({ ads: [], rules: [] });
  const [appStatus, setAppStatus] = useState({ on: true, reason: "" });

  const [selectedAccountPhone, setSelectedAccountPhone] = useState(null);
  const [addCoinsVal, setAddCoinsVal] = useState("");

  const [payName, setPayName] = useState("");
  const [payCoins, setPayCoins] = useState("");

  const [adsText, setAdsText] = useState("");
  const [rulesText, setRulesText] = useState("");
  const [newAdminKey, setNewAdminKey] = useState("");
  const [offReason, setOffReason] = useState("");
  const [settingsMsg, setSettingsMsg] = useState(null);

  // Generic busy + toast state so every button gives visible feedback
  // and duplicate clicks are prevented.
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2600);
  }

  useEffect(() => {
    const t = setTimeout(() => setBooted(true), 1400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const unsubAuth = onSnapshot(doc(db, "settings", "adminAuth"), (d) => {
      if (d.exists()) setAdminKey(d.data().key || DEFAULT_ADMIN_KEY);
      else setAdminKey(DEFAULT_ADMIN_KEY);
    });
    const unsubStatus = onSnapshot(doc(db, "settings", "appStatus"), (d) => {
      if (d.exists()) setAppStatus({ on: d.data().on !== false, reason: d.data().reason || "" });
    });
    const unsubMatches = onSnapshot(collection(db, "matches"), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => a.startsAt - b.startsAt);
      setMatches(list);
    });
    const unsubAccounts = onSnapshot(collection(db, "accounts"), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ phone: d.id, ...d.data() }));
      setAccounts(list);
    });
    const unsubPayments = onSnapshot(collection(db, "paymentCodes"), (snap) => {
      const list = [];
      snap.forEach((d) => list.push({ code: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setPaymentCodes(list);
    });
    const unsubAdmin = onSnapshot(doc(db, "adminContent", "home"), (d) => {
      if (d.exists()) setAdminContentState({ ads: d.data().ads || [], rules: d.data().rules || [] });
    });
    return () => { unsubAuth(); unsubStatus(); unsubMatches(); unsubAccounts(); unsubPayments(); unsubAdmin(); };
  }, []);

  function handleLogin(key) {
    setAuthError(null);
    if (key === adminKey) {
      setAuthed(true);
    } else {
      setAuthError("Incorrect admin key.");
    }
  }

  // ---- FIX: selectedAccount is now derived live from the `accounts` list
  // (instead of a frozen snapshot), so coin changes reflect instantly. ----
  const selectedAccount = selectedAccountPhone
    ? accounts.find((a) => a.phone === selectedAccountPhone) || null
    : null;

  // ---- FIX: switching tabs now always closes any open account sheet /
  // match form / sub-menu, so a leftover overlay can never block buttons
  // on Settings, Payment ID, etc. ----
  function goToTab(id) {
    setTab(id);
    setManageOpen(false);
    setManageMode(null);
    setMatchForm(null);
    setSelectedAccountPhone(null);
    setAddCoinsVal("");
  }

  async function saveMatch(data) {
    setBusy(true);
    try {
      const id = matchForm.editing ? matchForm.editing.id : `${data.type}-${Date.now()}`;
      await setDoc(doc(db, "matches", id), { ...data, createdAt: matchForm.editing?.createdAt || Date.now() });
      setMatchForm(null);
      showToast("success", matchForm.editing ? "Match updated." : "Match created.");
    } catch (e) {
      console.error(e);
      showToast("error", "Could not save match: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }
  async function deleteMatch(id) {
    setBusy(true);
    try {
      await deleteDoc(doc(db, "matches", id));
      await deleteDoc(doc(db, "joinedPlayers", id)).catch(() => {});
      await deleteDoc(doc(db, "roomDetails", id)).catch(() => {});
      setMatchForm(null);
      showToast("success", "Match deleted.");
    } catch (e) {
      console.error(e);
      showToast("error", "Could not delete match: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }

  async function removeProfile(phone) {
    setBusy(true);
    try {
      await deleteDoc(doc(db, "accounts", phone));
      setSelectedAccountPhone(null);
      showToast("success", "Profile removed.");
    } catch (e) {
      console.error(e);
      showToast("error", "Could not remove profile: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }
  async function banAccount(phone) {
    setBusy(true);
    try {
      await updateDoc(doc(db, "accounts", phone), { banned: true });
      setSelectedAccountPhone(null);
      showToast("success", "Account banned.");
    } catch (e) {
      console.error(e);
      showToast("error", "Could not ban account: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }
  async function addCoinsToAccount(phone, current) {
    const amt = parseInt(addCoinsVal, 10);
    if (!phone || Number.isNaN(amt) || amt <= 0) {
      showToast("error", "Enter a valid number of coins first.");
      return;
    }
    setBusy(true);
    try {
      await updateDoc(doc(db, "accounts", phone), { coins: (current || 0) + amt });
      setAddCoinsVal("");
      showToast("success", `${amt} coins added.`);
    } catch (e) {
      console.error(e);
      showToast("error", "Could not add coins: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }

  async function createPaymentCode() {
    const amt = parseInt(payCoins, 10);
    if (!payName.trim() || Number.isNaN(amt) || amt <= 0) {
      showToast("error", "Enter a valid ID name and coin amount.");
      return;
    }
    setBusy(true);
    try {
      await setDoc(doc(db, "paymentCodes", payName.trim().toUpperCase()), { coins: amt, createdAt: Date.now() });
      setPayName(""); setPayCoins("");
      showToast("success", "Payment ID created.");
    } catch (e) {
      console.error(e);
      showToast("error", "Could not create payment ID: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }

  async function saveSettings() {
    setBusy(true);
    try {
      const ads = adsText.split("\n").map((s) => s.trim()).filter(Boolean);
      const rulesArr = rulesText.split("\n").map((s) => s.trim()).filter(Boolean);
      await setDoc(doc(db, "adminContent", "home"), { ads: ads.length ? ads : adminContent.ads, rules: rulesArr.length ? rulesArr : adminContent.rules });
      if (newAdminKey.trim()) {
        await setDoc(doc(db, "settings", "adminAuth"), { key: newAdminKey.trim() });
        setNewAdminKey("");
      }
      setSettingsMsg("Saved.");
      showToast("success", "Settings saved.");
      setTimeout(() => setSettingsMsg(null), 2000);
    } catch (e) {
      console.error(e);
      showToast("error", "Could not save settings: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleAppStatus(on) {
    setBusy(true);
    try {
      await setDoc(doc(db, "settings", "appStatus"), { on, reason: on ? "" : offReason.trim() });
      showToast("success", `App turned ${on ? "ON" : "OFF"}.`);
    } catch (e) {
      console.error(e);
      showToast("error", "Could not update app status: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }

  const withdrawRequests = [];
  accounts.forEach((acc) => {
    (acc.withdrawHistory || []).forEach((w, idx) => {
      if (w.status === "Pending") withdrawRequests.push({ phone: acc.phone, gameName: acc.gameName, idx, ...w });
    });
  });

  async function resolveWithdraw(phone, idx, approve) {
    setBusy(true);
    try {
      const acc = accounts.find((a) => a.phone === phone);
      if (!acc) return;
      const history = [...(acc.withdrawHistory || [])];
      history[idx] = { ...history[idx], status: approve ? "Approved" : "Rejected" };
      await updateDoc(doc(db, "accounts", phone), { withdrawHistory: history });
      showToast("success", approve ? "Withdrawal approved." : "Withdrawal rejected.");
    } catch (e) {
      console.error(e);
      showToast("error", "Could not update withdrawal: " + (e?.message || "unknown error"));
    } finally {
      setBusy(false);
    }
  }

  const filteredMatches = matches.filter((m) => m.type === matchType && m.mode === manageMode);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#050408" }}>
      <div className="relative w-full overflow-hidden flex flex-col" style={{ maxWidth: 390, height: 780, background: C.bg, borderRadius: 32, border: `1px solid ${C.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>

        {/* Global toast — shows success/error for every action so a click
            never silently "does nothing" again. */}
        {toast && (
          <div
            className="absolute top-3 left-3 right-3 z-50 rounded-xl px-4 py-3 text-xs font-bold text-center shadow-lg"
            style={{
              background: toast.type === "success" ? "#12332E" : "#3A1620",
              color: toast.type === "success" ? C.teal : C.red,
              border: `1px solid ${C.border}`,
            }}
          >
            {toast.text}
          </div>
        )}

        {!booted && <Splash />}
        {booted && !authed && <AdminLogin onSubmit={handleLogin} error={authError} />}

        {booted && authed && (
          <>
            <div className="flex items-center gap-1.5 px-4 pt-4">
              <Flame size={18} style={{ color: C.red }} />
              <span className="text-base font-black tracking-tight" style={{ color: C.text }}>CLUTCH</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: C.surfaceAlt, color: C.dim }}>OWNER PANEL</span>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-2 relative mt-1">

              {tab === "home" && !manageOpen && (
                <>
                  <Header title="Home" />
                  <div className="rounded-2xl p-4 mb-3 flex items-center gap-3" style={{ background: appStatus.on ? "#12332E" : "#3A1620" }}>
                    <Power size={18} style={{ color: appStatus.on ? C.teal : C.red }} />
                    <span className="text-sm font-bold" style={{ color: appStatus.on ? C.teal : C.red }}>App is currently {appStatus.on ? "ON" : "OFF"}</span>
                  </div>
                  <button type="button" onClick={() => { setMatchType("cs"); setManageOpen(true); setManageMode(null); }} className="w-full flex items-center gap-3.5 rounded-2xl p-4 mb-3" style={{ background: C.surface, borderLeft: `3px solid ${C.violet}` }}>
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${C.violet}22` }}><Swords size={20} style={{ color: C.violet }} /></span>
                    <span className="flex-1 text-left">
                      <div className="text-[15px] font-bold" style={{ color: C.text }}>CS Matches</div>
                      <div className="text-xs mt-0.5" style={{ color: C.dim }}>{matches.filter((m) => m.type === "cs").length} active</div>
                    </span>
                    <Pencil size={16} style={{ color: C.dim }} />
                  </button>
                  <button type="button" onClick={() => { setMatchType("br"); setManageOpen(true); setManageMode(null); }} className="w-full flex items-center gap-3.5 rounded-2xl p-4 mb-3" style={{ background: C.surface, borderLeft: `3px solid ${C.teal}` }}>
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${C.teal}22` }}><Crosshair size={20} style={{ color: C.teal }} /></span>
                    <span className="flex-1 text-left">
                      <div className="text-[15px] font-bold" style={{ color: C.text }}>BR Matches</div>
                      <div className="text-xs mt-0.5" style={{ color: C.dim }}>{matches.filter((m) => m.type === "br").length} active</div>
                    </span>
                    <Pencil size={16} style={{ color: C.dim }} />
                  </button>
                </>
              )}

              {tab === "home" && manageOpen && !manageMode && !matchForm && (
                <>
                  <Header title={matchType === "cs" ? "CS Matches" : "BR Matches"} onBack={() => setManageOpen(false)} />
                  {[
                    { id: "solo", label: "Solo", sub: "1 player per team", icon: User },
                    { id: "duo", label: "Duo", sub: "2 players per team", icon: Users },
                    { id: "squad", label: "Squad", sub: "4 players per team", icon: Users },
                  ].map(({ id, label, sub, icon: Icon }) => (
                    <button type="button" key={id} onClick={() => setManageMode(id)} className="w-full flex items-center gap-3.5 rounded-2xl p-4 mb-3" style={{ background: C.surface }}>
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: C.violetDim }}><Icon size={20} style={{ color: C.violet }} /></span>
                      <span className="flex-1 text-left">
                        <div className="text-[15px] font-bold" style={{ color: C.text }}>{label}</div>
                        <div className="text-xs mt-0.5" style={{ color: C.dim }}>{sub}</div>
                      </span>
                      <ChevronRight size={18} style={{ color: C.dim }} />
                    </button>
                  ))}
                </>
              )}

              {tab === "home" && manageOpen && manageMode && !matchForm && (
                <>
                  <Header title={`${matchType === "cs" ? "CS" : "BR"} · ${manageMode[0].toUpperCase() + manageMode.slice(1)}`} onBack={() => setManageMode(null)} right={
                    <button type="button" onClick={() => setMatchForm({ type: matchType, mode: manageMode, editing: null })} className="p-2 rounded-full" style={{ background: C.violetDim }}><Plus size={16} style={{ color: C.violet }} /></button>
                  } />
                  {filteredMatches.length === 0 && <div className="text-sm text-center mt-8" style={{ color: C.dim }}>No matches yet — tap + to add one.</div>}
                  {filteredMatches.map((m) => (
                    <button type="button" key={m.id} onClick={() => setMatchForm({ type: matchType, mode: manageMode, editing: m })} className="w-full text-left rounded-2xl p-3.5 mb-3 flex items-center justify-between" style={{ background: C.surface }}>
                      <div>
                        <div className="text-sm font-bold" style={{ color: C.text }}>{m.title}</div>
                        <div className="text-xs" style={{ color: C.dim }}>{m.map} · {m.slots} slots · {new Date(m.startsAt).toLocaleString()}</div>
                      </div>
                      <Pencil size={15} style={{ color: C.dim }} />
                    </button>
                  ))}
                </>
              )}

              {matchForm && (
                <MatchForm type={matchForm.type} mode={matchForm.mode} editing={matchForm.editing} busy={busy} onCancel={() => setMatchForm(null)} onSave={saveMatch} onDelete={deleteMatch} />
              )}

              {tab === "accounts" && (
                <>
                  <Header title="Accounts" />
                  {accounts.map((acc) => (
                    <button type="button" key={acc.phone} onClick={() => setSelectedAccountPhone(acc.phone)} className="w-full flex items-center justify-between rounded-2xl p-3.5 mb-3" style={{ background: C.surface }}>
                      <div className="text-left">
                        <div className="text-sm font-bold" style={{ color: C.text }}>{acc.gameName} {acc.banned && <span style={{ color: C.red }}>(Banned)</span>}</div>
                        <div className="text-xs" style={{ color: C.dim }}>{acc.phone}</div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: C.amber }}>{acc.coins ?? 0} coins</div>
                    </button>
                  ))}
                </>
              )}

              {tab === "payments" && (
                <>
                  <Header title="Payment ID" />
                  <div className="rounded-2xl p-4 mb-4" style={{ background: C.surface }}>
                    <Field label="Payment ID name" placeholder='e.g. "99989"' value={payName} onChange={(e) => setPayName(e.target.value)} />
                    <Field label="Coins for this ID" placeholder="e.g. 200" value={payCoins} onChange={(e) => setPayCoins(e.target.value)} inputMode="numeric" />
                    <button type="button" disabled={busy} onClick={createPaymentCode} className="w-full rounded-xl py-3 font-bold text-sm disabled:opacity-50" style={{ background: C.violet, color: "#fff" }}>{busy ? "Creating…" : "Create"}</button>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: C.dim }}>Recent Payment IDs</div>
                  <div className="rounded-2xl overflow-hidden" style={{ background: C.surface }}>
                    {paymentCodes.length === 0 && <div className="p-3.5 text-xs" style={{ color: C.dim }}>None created yet.</div>}
                    {paymentCodes.map((p) => (
                      <div key={p.code} className="flex items-center justify-between px-3.5 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <span className="text-sm font-mono font-bold" style={{ color: C.text }}>{p.code}</span>
                        <span className="text-sm font-bold" style={{ color: C.amber }}>{p.coins} coins</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tab === "withdrawals" && (
                <>
                  <Header title="Withdrawal Requests" />
                  {withdrawRequests.length === 0 && <div className="text-sm text-center mt-8" style={{ color: C.dim }}>No pending requests.</div>}
                  {withdrawRequests.map((w, i) => (
                    <div key={i} className="rounded-2xl p-4 mb-3" style={{ background: C.surface }}>
                      <div className="text-sm font-bold mb-1" style={{ color: C.text }}>{w.gameName} · {w.phone}</div>
                      <div className="text-xs mb-1" style={{ color: C.dim }}>Method: <span style={{ color: C.text }}>{w.method}</span></div>
                      <div className="text-xs mb-1" style={{ color: C.dim }}>Account: <span style={{ color: C.text }}>{w.accountHolder} — {w.accountId}</span></div>
                      <div className="text-sm font-bold mb-3" style={{ color: C.amber }}>{w.amount} coins</div>
                      <div className="flex gap-2">
                        <button type="button" disabled={busy} onClick={() => resolveWithdraw(w.phone, w.idx, false)} className="flex-1 rounded-xl py-2.5 font-bold text-xs disabled:opacity-50" style={{ background: "#3A1620", color: C.red }}>Reject</button>
                        <button type="button" disabled={busy} onClick={() => resolveWithdraw(w.phone, w.idx, true)} className="flex-1 rounded-xl py-2.5 font-bold text-xs disabled:opacity-50" style={{ background: "#12332E", color: C.teal }}>Approve</button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {tab === "settings" && (
                <>
                  <Header title="Settings" />
                  <div className="rounded-2xl p-4 mb-4" style={{ background: appStatus.on ? "#12332E" : "#3A1620" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold" style={{ color: appStatus.on ? C.teal : C.red }}>App is {appStatus.on ? "ON" : "OFF"}</span>
                      <button type="button" disabled={busy} onClick={() => toggleAppStatus(!appStatus.on)} className="px-4 py-2 rounded-full text-xs font-bold disabled:opacity-50" style={{ background: appStatus.on ? C.red : C.teal, color: "#000" }}>{busy ? "…" : appStatus.on ? "Turn OFF" : "Turn ON"}</button>
                    </div>
                    {!appStatus.on && (
                      <Field placeholder="Reason players will see" value={offReason} onChange={(e) => setOffReason(e.target.value)} />
                    )}
                  </div>

                  <div className="rounded-2xl p-4 mb-4" style={{ background: C.surface }}>
                    <TextArea label="Home banners (one per line)" rows={3} placeholder={adminContent.ads.join("\n")} value={adsText} onChange={(e) => setAdsText(e.target.value)} />
                    <TextArea label="Tournament rules (one per line)" rows={5} placeholder={adminContent.rules.join("\n")} value={rulesText} onChange={(e) => setRulesText(e.target.value)} />
                    <Field icon={KeyRound} label="Change Admin Key (leave blank to keep current)" placeholder="New admin key" value={newAdminKey} onChange={(e) => setNewAdminKey(e.target.value)} />
                    {settingsMsg && <div className="text-xs font-semibold mb-2" style={{ color: C.teal }}>{settingsMsg}</div>}
                    <button type="button" disabled={busy} onClick={saveSettings} className="w-full rounded-xl py-3 font-bold text-sm disabled:opacity-50" style={{ background: C.amber, color: "#1a1400" }}>{busy ? "Saving…" : "Save Settings"}</button>
                  </div>
                </>
              )}

              {selectedAccount && (
                <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(5,4,8,0.75)" }}>
                  <div className="w-full rounded-t-3xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-black" style={{ color: C.text }}>{selectedAccount.gameName}</span>
                      <button type="button" onClick={() => setSelectedAccountPhone(null)} className="p-1.5 rounded-full" style={{ background: C.surfaceAlt }}><X size={15} style={{ color: C.dim }} /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="rounded-xl p-3 text-center" style={{ background: C.surfaceAlt }}>
                        <div className="text-base font-bold" style={{ color: C.amber }}>{selectedAccount.coins ?? 0}</div>
                        <div className="text-[10px] uppercase" style={{ color: C.dim }}>Coins</div>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: C.surfaceAlt }}>
                        <div className="text-base font-bold" style={{ color: C.text }}>{selectedAccount.kills ?? 0}</div>
                        <div className="text-[10px] uppercase" style={{ color: C.dim }}>Kills</div>
                      </div>
                      <div className="rounded-xl p-3 text-center" style={{ background: C.surfaceAlt }}>
                        <div className="text-base font-bold" style={{ color: C.text }}>{(selectedAccount.joinedMatchIds || []).length}</div>
                        <div className="text-[10px] uppercase" style={{ color: C.dim }}>Matches</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs mb-4" style={{ color: C.dim }}>
                      <Phone size={13} /> {selectedAccount.phone}
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <input value={addCoinsVal} onChange={(e) => setAddCoinsVal(e.target.value)} placeholder="Coins to add" inputMode="numeric" className="flex-1 rounded-xl px-3.5 py-3 text-sm outline-none" style={{ background: C.surfaceAlt, color: C.text, border: `1px solid ${C.border}` }} />
                      <button type="button" disabled={busy} onClick={() => addCoinsToAccount(selectedAccount.phone, selectedAccount.coins)} className="px-4 py-3 rounded-xl font-bold text-xs disabled:opacity-50" style={{ background: C.teal, color: "#04241C" }}>{busy ? "…" : "Add"}</button>
                    </div>
                    <button type="button" disabled={busy} onClick={() => removeProfile(selectedAccount.phone)} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm mb-2 disabled:opacity-50" style={{ background: C.surfaceAlt, color: C.text }}>
                      <UserX size={16} /> Remove profile from app
                    </button>
                    <button type="button" disabled={busy} onClick={() => banAccount(selectedAccount.phone)} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm disabled:opacity-50" style={{ background: "#3A1620", color: C.red }}>
                      <Ban size={16} /> Ban this account
                    </button>
                  </div>
                </div>
              )}

            </div>

            <div className="flex items-center justify-around py-3" style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}>
              {[
                { id: "home", label: "Matches", icon: Swords },
                { id: "accounts", label: "Accounts", icon: Users2 },
                { id: "payments", label: "Payment ID", icon: Wallet2 },
                { id: "withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
                { id: "settings", label: "Settings", icon: SettingsIcon },
              ].map(({ id, label, icon: Icon }) => (
                <button type="button" key={id} onClick={() => goToTab(id)} className="flex flex-col items-center gap-1">
                  <Icon size={16} style={{ color: tab === id ? C.violet : C.dim }} />
                  <span className="text-[9px] font-semibold" style={{ color: tab === id ? C.violet : C.dim }}>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
