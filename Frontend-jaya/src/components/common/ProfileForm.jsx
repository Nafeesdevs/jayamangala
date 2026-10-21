// import { useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import { Plus, Trash2 } from "lucide-react";
// import { AuthAPI } from "../../api/services";
// import { errMsg } from "../../api/client";
// import { useAuth } from "../../context/AuthContext";
// import { useLang } from "../../context/LangContext";
// import { Field, PageLoader } from "./ui";
// import { money } from "../../utils/format";

// export default function ProfileForm({ showAddresses = true }) {
//   const { updateUser } = useAuth();
//   const { t } = useLang();
//   const [me, setMe] = useState(null);
//   const [summary, setSummary] = useState(null);
//   const [f, setF] = useState({ name: "", email: "" });
//   const [addr, setAddr] = useState([]);
//   const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
//   const [busy, setBusy] = useState(false);

//   useEffect(() => {
//     AuthAPI.profile().then((r) => {
//       setMe(r.data); setSummary(r.orderSummary);
//       setF({ name: r.data.name || "", email: r.data.email || "" });
//       setAddr((r.data.addresses || []).map(({ street, city, state, zipCode, isDefault }) => ({ street, city, state, zipCode, isDefault })));
//     });
//   }, []);

//   if (!me) return <PageLoader />;

//   const save = async (e) => {
//     e.preventDefault();
//     setBusy(true);
//     try {
//       const body = { name: f.name, email: f.email };
//       if (showAddresses) body.addresses = addr;
//       if (pw.newPassword) {
//         if (pw.newPassword.length < 6) { setBusy(false); return toast.error(t("auth.pwShort")); }
//         Object.assign(body, pw);
//       }
//       const r = await AuthAPI.updateProfile(body);
//       updateUser(r.data); setMe(r.data); setPw({ oldPassword: "", newPassword: "" });
//       toast.success(t("pf.updated"));
//     } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
//   };

//   const setA = (i, k, v) => setAddr(addr.map((a, idx) => (idx === i ? { ...a, [k]: v } : k === "isDefault" && v ? { ...a, isDefault: false } : a)));

//   return (
//     <form onSubmit={save} className="space-y-6">
//       {summary && showAddresses && (
//         <div className="grid grid-cols-3 gap-3">
//           {[[t("pf.orders"), summary.totalOrders], [t("pf.cancelled"), summary.cancelledOrders], [t("pf.spent"), money(summary.totalAmount)]].map(([l, v]) => (
//             <div key={l} className="card p-4"><p className="text-xs text-ink-soft">{l}</p><p className="mt-1 text-xl font-bold text-primary-600">{v}</p></div>
//           ))}
//         </div>
//       )}

//       <section className="card p-6">
//         <h2 className="mb-4 font-semibold">{t("pf.details")}</h2>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <Field label={t("auth.name")}><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></Field>
//           <Field label={t("auth.phone")}><input className="input bg-ink-wash" value={me.phoneno} disabled /></Field>
//           <Field label={t("auth.email")}><input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
//           <Field label="Role"><input className="input bg-ink-wash capitalize" value={me.role} disabled /></Field>
//         </div>
//       </section>

//       {showAddresses && (
//         <section className="card p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="font-semibold">{t("pf.address")}</h2>
//             <button type="button" className="btn-outline btn-sm" onClick={() => setAddr([...addr, { street: "", city: "", state: "Tamil Nadu", zipCode: "", isDefault: addr.length === 0 }])}>
//               <Plus className="h-4 w-4" />{t("pf.addAddress")}
//             </button>
//           </div>
//           <div className="space-y-4">
//             {addr.map((a, i) => (
//               <div key={i} className="rounded-xl border border-ink-line p-4">
//                 <div className="grid gap-3 sm:grid-cols-2">
//                   <div className="sm:col-span-2"><input className="input" placeholder={t("pf.street")} value={a.street || ""} onChange={(e) => setA(i, "street", e.target.value)} /></div>
//                   <input className="input" placeholder={t("pf.city")} value={a.city || ""} onChange={(e) => setA(i, "city", e.target.value)} />
//                   <input className="input" placeholder={t("pf.state")} value={a.state || ""} onChange={(e) => setA(i, "state", e.target.value)} />
//                   <input className="input" placeholder={t("pf.zip")} value={a.zipCode || ""} onChange={(e) => setA(i, "zipCode", e.target.value)} />
//                 </div>
//                 <div className="mt-3 flex items-center justify-between">
//                   <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-secondary-600" checked={!!a.isDefault} onChange={(e) => setA(i, "isDefault", e.target.checked)} />{t("pf.default")}</label>
//                   <button type="button" className="text-ink-faint hover:text-primary-600" onClick={() => setAddr(addr.filter((_, x) => x !== i))}><Trash2 className="h-4 w-4" /></button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}

//       <section className="card p-6">
//         <h2 className="mb-4 font-semibold">{t("pf.password")}</h2>
//         <div className="grid gap-4 sm:grid-cols-2">
//           <Field label={t("pf.old")}><input className="input" type="password" autoComplete="current-password" value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} /></Field>
//           <Field label={t("pf.new")}><input className="input" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
//         </div>
//       </section>

//       <div className="flex justify-end"><button className="btn-primary px-8" disabled={busy}>{t("common.save")}</button></div>
//     </form>
//   );
// }



import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Plus, Trash2, User, MapPin, Lock, Phone, Mail, Eye, EyeOff, Pencil, Check, X,
  ShoppingBag, XCircle, Wallet, Star, Home, ShieldCheck, BadgeCheck,
} from "lucide-react";
import { AuthAPI } from "../../api/services";
import { errMsg } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useLang } from "../../context/LangContext";
import { PageLoader } from "./ui";
import { money } from "../../utils/format";

/* ───────────────────────── helpers ───────────────────────── */

const GOLD = "#c9a24a";
const blank = (isDefault = false) => ({ street: "", city: "", state: "Tamil Nadu", zipCode: "", isDefault });
const clean = (list = []) =>
  list.map(({ street, city, state, zipCode, isDefault }) => ({ street, city, state, zipCode, isDefault }));
const initials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "U";

function useCountUp(target = 0, ms = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const n = Number(target) || 0;
    let raf, start;
    const step = (ts) => {
      start ??= ts;
      const p = Math.min(1, (ts - start) / ms);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

const css = `
@keyframes pf-rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
@keyframes pf-pop{0%{opacity:0;transform:scale(.55) rotate(-10deg)}70%{transform:scale(1.07) rotate(2deg)}100%{opacity:1;transform:none}}
@keyframes pf-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes pf-sheen{0%{transform:translateX(-140%) skewX(-20deg)}100%{transform:translateX(420%) skewX(-20deg)}}
@keyframes pf-drift{from{background-position:0 0}to{background-position:28px 28px}}
@keyframes pf-orbit{to{transform:rotate(360deg)}}
@keyframes pf-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.pf-rise{animation:pf-rise .6s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--d,0ms)}
.pf-pop{animation:pf-pop .7s cubic-bezier(.3,1.4,.5,1) .15s both}
.pf-swap{animation:pf-swap .35s cubic-bezier(.2,.8,.2,1) both}
// .pf-dots{background-image:radial-gradient(circle,rgba(255,255,255,.55) 1.2px,transparent 1.6px);background-size:28px 28px;animation:pf-drift 6s linear infinite}
.pf-sheen{position:absolute;inset:0;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);animation:pf-sheen 1.8s ease-out .5s 1 both}
.pf-orbit{animation:pf-orbit 9s linear infinite}
.pf-grow{transform-origin:left;animation:pf-grow .5s cubic-bezier(.2,.8,.2,1) both}
@media (prefers-reduced-motion:reduce){.pf-root *{animation:none!important;transition:none!important}}
`;

/* ───────────────────────── small UI pieces ───────────────────────── */

function Stat({ icon: Icon, label, value, money: isMoney, delay }) {
  const n = useCountUp(value);
  return (
    <div className="pf-rise min-w-0 rounded-2xl border border-ink-line bg-white/70 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3" style={{ "--d": `${delay}ms` }}>
      <div className="flex min-w-0 items-start gap-1.5 text-[11px] text-ink-soft sm:items-center sm:gap-2 sm:text-xs"><Icon className="h-3.5 w-3.5 shrink-0 text-primary-600" /><span className="leading-tight sm:truncate">{label}</span></div>
      <p className="mt-1 truncate text-lg font-bold tabular-nums text-secondary-700 sm:text-xl">{isMoney ? money(n) : n}</p>
    </div>
  );
}

function Tile({ icon: Icon, label, editing, locked, value, children }) {
  const live = editing && !locked;
  return (
    <div
      className={`relative min-w-0 rounded-2xl border p-4 transition-all duration-300 ${
        live ? "border-primary-600 bg-white ring-4 ring-primary-600/10" : "border-ink-line bg-ink-wash/40"
      }`}
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-ink-soft">
        <Icon className="h-3.5 w-3.5 text-primary-600" />
        {label}
        {editing && locked && <Lock className="ml-auto h-3 w-3 text-ink-faint" />}
      </div>
      {live ? <div className="pf-swap">{children}</div> : <p className="wrap-anywhere text-base font-semibold sm:truncate">{value || "—"}</p>}
    </div>
  );
}

function SectionCard({ icon: Icon, title, hint, actions, onSubmit, children }) {
  const Wrap = onSubmit ? "form" : "div";
  return (
    <Wrap onSubmit={onSubmit} className="card pf-swap min-w-0 p-4 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-ink-line pb-4 sm:mb-6 sm:gap-4 sm:pb-5">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center sm:h-11 sm:w-11 rounded-xl bg-primary-600/10 text-primary-600"><Icon className="h-5 w-5" /></span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-secondary-700">{title}</h2>
            {hint && <p className="text-sm text-ink-soft">{hint}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      </div>
      {children}
    </Wrap>
  );
}

const Spinner = () => <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;

/* ───────────────────────── main component ───────────────────────── */

export default function ProfileForm({ showAddresses = true }) {
  const { updateUser } = useAuth();
  const { t } = useLang();
  // translation with a safe English fallback for keys that may not exist yet
  const tt = (k, fb) => { const v = t(k); return v === k ? fb : v; };

  const [me, setMe] = useState(null);
  const [summary, setSummary] = useState(null);
  const [f, setF] = useState({ name: "", email: "" });
  const [addr, setAddr] = useState([]);
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("details");
  const [mode, setMode] = useState(null);      // "details" | "password" | null
  const [editIdx, setEditIdx] = useState(null); // address being edited
  const [snap, setSnap] = useState(null);       // snapshot for cancel (null = brand-new address)

  const sync = (d) => {
    setMe(d);
    setF({ name: d.name || "", email: d.email || "" });
    setAddr(clean(d.addresses));
  };

  useEffect(() => {
    AuthAPI.profile().then((r) => { sync(r.data); setSummary(r.orderSummary); });
  }, []);

  if (!me) return <PageLoader />;

  /* ---------- actions ---------- */

  const cancelAll = () => {
    setMode(null); setEditIdx(null); setSnap(null);
    setF({ name: me.name || "", email: me.email || "" });
    setAddr(clean(me.addresses));
    setPw({ oldPassword: "", newPassword: "" }); setShowPw(false);
  };

  const goTab = (id) => { if (id !== tab) { cancelAll(); setTab(id); } };

  // one place that talks to the API; always sends the last *saved* values + the changed part
  const submit = async (extra = {}) => {
    setBusy(true);
    try {
      const body = { name: me.name, email: me.email, ...extra };
      if (showAddresses && !extra.addresses) body.addresses = clean(me.addresses);
      const r = await AuthAPI.updateProfile(body);
      updateUser(r.data); sync(r.data);
      toast.success(t("pf.updated"));
      return true;
    } catch (err) {
      toast.error(errMsg(err));
      return false;
    } finally { setBusy(false); }
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    if (await submit({ name: f.name, email: f.email })) setMode(null);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword.length < 6) return toast.error(t("auth.pwShort"));
    if (await submit({ oldPassword: pw.oldPassword, newPassword: pw.newPassword })) {
      setMode(null); setPw({ oldPassword: "", newPassword: "" }); setShowPw(false);
    }
  };

  const setA = (i, k, v) =>
    setAddr(addr.map((a, idx) => (idx === i ? { ...a, [k]: v } : k === "isDefault" && v ? { ...a, isDefault: false } : a)));

  const startAdd = () => { setAddr([...addr, blank(addr.length === 0)]); setEditIdx(addr.length); setSnap(null); };
  const startEdit = (i) => { setSnap({ ...addr[i] }); setEditIdx(i); };
  const cancelAddr = (i) => {
    setAddr(snap ? addr.map((a, x) => (x === i ? snap : a)) : addr.filter((_, x) => x !== i));
    setEditIdx(null); setSnap(null);
  };
  const saveAddr = async (e) => {
    e.preventDefault();
    if (await submit({ addresses: clean(addr) })) { setEditIdx(null); setSnap(null); }
  };
  const removeAddr = (i) => {
    const next = addr.filter((_, x) => x !== i);
    if (next.length && !next.some((a) => a.isDefault)) next[0] = { ...next[0], isDefault: true };
    submit({ addresses: clean(next) });
  };
  const makeDefault = (i) => submit({ addresses: clean(addr.map((a, x) => ({ ...a, isDefault: x === i }))) });

  /* ---------- derived ---------- */

  const tabs = [
    { id: "details", label: t("pf.details"), icon: User },
    ...(showAddresses ? [{ id: "address", label: t("pf.address"), icon: MapPin }] : []),
    { id: "password", label: t("pf.password"), icon: Lock },
  ];
  const tabIdx = Math.max(0, tabs.findIndex((x) => x.id === tab));

  const stats = summary && showAddresses
    ? [
        { icon: ShoppingBag, label: t("pf.orders"), value: summary.totalOrders },
        { icon: XCircle, label: t("pf.cancelled"), value: summary.cancelledOrders },
        { icon: Wallet, label: t("pf.spent"), value: summary.totalAmount, money: true },
      ]
    : [];

  const editBtn = (onClick, label) => (
    <button type="button" className="btn-outline btn-sm" onClick={onClick}>
      <Pencil className="h-4 w-4" />{label || tt("common.edit", "Edit")}
    </button>
  );
  const cancelBtn = (onClick) => (
    <button type="button" className="btn-outline btn-sm" onClick={onClick} disabled={busy}>
      <X className="h-4 w-4" />{tt("common.cancel", "Cancel")}
    </button>
  );
  const saveBtn = (disabled) => (
    <button type="submit" className="btn-primary btn-sm" disabled={busy || disabled}>
      {busy ? <Spinner /> : <Check className="h-4 w-4" />}{tt("common.saveChanges", "Save changes")}
    </button>
  );

  const strength = Math.min(4, Math.floor(pw.newPassword.length / 3));

  /* ───────────────────────── render ───────────────────────── */

  return (
    <div className="pf-root w-full space-y-6" onKeyDown={(e) => e.key === "Escape" && cancelAll()}>
      <style>{css}</style>

      {/* ============ HERO ============ */}
      <section className="card pf-rise !overflow-visible">
        {/* banner (clipped on its own so the avatar below is never cut off) */}
        <div className="relative h-28 overflow-hidden rounded-t-[inherit] bg-gradient-to-br from-primary-600 to-secondary-700 sm:h-44">
          <div className="pf-dots absolute inset-0 opacity-30" />
          <div className="pf-sheen" />
          <div className="absolute inset-x-0 bottom-0 h-1 pf-grow" style={{ background: GOLD }} />
        </div>

        <div className="relative px-4 pb-5 sm:px-8 sm:pb-6">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-10">
            <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-5">
              {/* avatar with slowly orbiting gold ring */}
              <div className="pf-pop relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                <div className="pf-orbit absolute inset-0 rounded-full" style={{ background: `conic-gradient(${GOLD}, transparent 40%, ${GOLD} 75%, transparent)` }} />
                <div className="absolute inset-[3px] grid place-items-center rounded-full border-4 border-white bg-secondary-700 font-display text-2xl font-bold sm:text-3xl text-white shadow-lg">
                  {initials(me.name)}
                </div>
              </div>
              <div className="min-w-0 sm:pb-2">
                <h2 className="pf-rise wrap-anywhere font-display text-2xl font-bold leading-tight text-secondary-700 sm:text-3xl" style={{ "--d": "200ms" }}>{me.name}</h2>
                <span
                  className="pf-rise mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize"
                  style={{ "--d": "300ms", background: `${GOLD}2e`, color: "#7a5c14" }}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />{me.role}
                </span>
              </div>
            </div>

            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map((s, i) => <Stat key={s.label} {...s} delay={350 + i * 90} />)}
              </div>
            )}
          </div>

          {/* contact chips */}
          <div className="pf-rise mt-5 flex flex-wrap gap-2 sm:gap-3" style={{ "--d": "400ms" }}>
            <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-ink-line bg-ink-wash/50 px-3.5 py-2 text-sm sm:px-4">
              <Phone className="h-4 w-4 text-primary-600" />{me.phoneno}
            </span>
            {me.email && (
              <span className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-ink-line bg-ink-wash/50 px-3.5 py-2 text-sm sm:px-4">
                <Mail className="h-4 w-4 shrink-0 text-primary-600" /><span className="truncate">{me.email}</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ============ TABS ============ */}
      <div className="pf-rise relative grid w-full gap-0 rounded-2xl border border-ink-line bg-white/80 p-1.5 sm:max-w-xl"
        style={{ "--d": "150ms", gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        <span
          className="absolute inset-y-1.5 left-1.5 rounded-xl bg-primary-600 shadow-md transition-transform duration-500"
          style={{
            width: `calc((100% - 0.75rem) / ${tabs.length})`,
            transform: `translateX(${tabIdx * 100}%)`,
            transitionTimingFunction: "cubic-bezier(.3,1.25,.5,1)",
          }}
        />
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => goTab(id)}
            className={`relative z-10 flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-xs font-medium leading-tight transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
              tab === id ? "text-white" : "text-ink-soft hover:text-primary-600"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" /><span className="max-w-full text-center sm:truncate">{label}</span>
          </button>
        ))}
      </div>

      {/* ============ DETAILS ============ */}
      {tab === "details" && (
        <SectionCard
          key="details"
          icon={User}
          title={t("pf.details")}
          hint={mode === "details" ? "Make your changes, then save." : "Your name and contact information."}
          onSubmit={mode === "details" ? saveDetails : undefined}
          actions={
            mode === "details"
              ? <>{cancelBtn(cancelAll)}{saveBtn(!f.name.trim())}</>
              : editBtn(() => setMode("details"))
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Tile icon={User} label={t("auth.name")} editing={mode === "details"} value={me.name}>
              <input className="input" autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
            </Tile>
            <Tile icon={Mail} label={t("auth.email")} editing={mode === "details"} value={me.email}>
              <input className="input" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </Tile>
            <Tile icon={Phone} label={t("auth.phone")} editing={mode === "details"} locked value={me.phoneno} />
            <Tile icon={ShieldCheck} label="Role" editing={mode === "details"} locked value={<span className="capitalize">{me.role}</span>} />
          </div>
        </SectionCard>
      )}

      {/* ============ ADDRESSES ============ */}
      {tab === "address" && showAddresses && (
        <SectionCard
          key="address"
          icon={MapPin}
          title={t("pf.address")}
          hint={addr.length ? `${addr.length} saved` : "Where should we deliver your orders?"}
          actions={
            addr.length > 0 && editIdx === null && (
              <button type="button" className="btn-primary btn-sm" onClick={startAdd}>
                <Plus className="h-4 w-4" />{t("pf.addAddress")}
              </button>
            )
          }
        >
          {addr.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border-2 border-dashed border-ink-line px-5 py-12 text-center sm:px-6 sm:py-16">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-600/10 text-primary-600"><Home className="h-7 w-7" /></span>
              <button type="button" className="btn-primary mt-5" onClick={startAdd}>
                <Plus className="h-4 w-4" />{t("pf.addAddress")}
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {addr.map((a, i) => {
                const editing = editIdx === i;
                const dim = editIdx !== null && !editing;
                return (
                  <form
                    key={i}
                    onSubmit={editing ? saveAddr : (e) => e.preventDefault()}
                    className={`pf-rise relative min-w-0 rounded-2xl border p-4 pl-5 transition-all duration-300 sm:p-5 sm:pl-6 ${
                      editing ? "border-primary-600 bg-white ring-4 ring-primary-600/10" : a.isDefault ? "border-primary-600/40 bg-primary-600/[0.03]" : "border-ink-line bg-ink-wash/40"
                    } ${dim ? "pointer-events-none opacity-40" : ""}`}
                    style={{ "--d": `${i * 70}ms` }}
                  >
                    {a.isDefault && <span className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary-600" />}

                    <div className="mb-3 flex items-center justify-between">
                      {a.isDefault ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-medium text-white">
                          <Star className="h-3 w-3" />{t("pf.default")}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-faint">#{i + 1}</span>
                      )}
                      {!editing && (
                        <div className="flex gap-1">
                          <button type="button" aria-label="Edit" onClick={() => startEdit(i)}
                            className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-white hover:text-primary-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" aria-label="Delete" onClick={() => removeAddr(i)} disabled={busy}
                            className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-white hover:text-primary-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {editing ? (
                      <div className="pf-swap space-y-3">
                        <input className="input" autoFocus placeholder={t("pf.street")} value={a.street || ""} onChange={(e) => setA(i, "street", e.target.value)} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input className="input" placeholder={t("pf.city")} value={a.city || ""} onChange={(e) => setA(i, "city", e.target.value)} />
                          <input className="input" placeholder={t("pf.state")} value={a.state || ""} onChange={(e) => setA(i, "state", e.target.value)} />
                        </div>
                        <input className="input" placeholder={t("pf.zip")} value={a.zipCode || ""} onChange={(e) => setA(i, "zipCode", e.target.value)} />
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
                          <input type="checkbox" className="accent-secondary-600" checked={!!a.isDefault} onChange={(e) => setA(i, "isDefault", e.target.checked)} />
                          {t("pf.default")}
                        </label>
                        <div className="flex flex-wrap justify-end gap-2 pt-1">
                          {cancelBtn(() => cancelAddr(i))}
                          {saveBtn(!(a.street || "").trim() || !(a.city || "").trim())}
                        </div>
                      </div>
                    ) : (
                      <div className="min-w-0 wrap-anywhere">
                        <p className="font-semibold">{a.street || "—"}</p>
                        <p className="mt-0.5 text-sm text-ink-soft">
                          {[a.city, a.state].filter(Boolean).join(", ")}{a.zipCode ? ` – ${a.zipCode}` : ""}
                        </p>
                        {!a.isDefault && (
                          <button type="button" onClick={() => makeDefault(i)} disabled={busy}
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline">
                            <Star className="h-3.5 w-3.5" />{t("pf.default")}
                          </button>
                        )}
                      </div>
                    )}
                  </form>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* ============ PASSWORD ============ */}
      {tab === "password" && (
        <SectionCard
          key="password"
          icon={Lock}
          title={t("pf.password")}
          hint={mode === "password" ? "Use at least 6 characters." : "Keep your account safe with a strong password."}
          onSubmit={mode === "password" ? savePassword : undefined}
          actions={
            mode === "password"
              ? <>{cancelBtn(cancelAll)}{saveBtn(!pw.oldPassword || !pw.newPassword)}</>
              : editBtn(() => setMode("password"), tt("pf.changePassword", "Change password"))
          }
        >
          {mode !== "password" ? (
            <div className="flex items-center gap-4 rounded-2xl border border-ink-line bg-ink-wash/40 p-4 sm:p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-primary-600 shadow-sm"><ShieldCheck className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-medium text-ink-soft">{t("pf.password")}</p>
                <p className="text-lg font-semibold tracking-[0.3em]">••••••••</p>
              </div>
            </div>
          ) : (
            <div className="pf-swap grid max-w-xl gap-4">
              <div className="rounded-2xl border border-primary-600 bg-white p-4 ring-4 ring-primary-600/10">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-ink-soft"><Lock className="h-3.5 w-3.5 text-primary-600" />{t("pf.old")}</label>
                <input className="input" autoFocus type={showPw ? "text" : "password"} autoComplete="current-password"
                  value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} />
              </div>
              <div className="rounded-2xl border border-primary-600 bg-white p-4 ring-4 ring-primary-600/10">
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-ink-soft"><Lock className="h-3.5 w-3.5 text-primary-600" />{t("pf.new")}</label>
                <div className="relative">
                  <input className="input pr-11" type={showPw ? "text" : "password"} autoComplete="new-password"
                    value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowPw((s) => !s)} aria-label="Toggle visibility"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-primary-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      i < strength ? (strength < 2 ? "bg-primary-600" : "bg-secondary-600") : "bg-ink-line"
                    }`} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}