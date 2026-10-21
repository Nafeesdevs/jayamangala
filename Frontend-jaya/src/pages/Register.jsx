import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Phone, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import AuthShell from "./AuthShell";
import { Spinner } from "../components/common/ui";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { errMsg } from "../api/client";

const Input = ({ id, icon: Icon, label, ...p }) => (
  <div className="fi">
    <Icon className="ico" />
    <input id={id} placeholder=" " {...p} />
    <label htmlFor={id}>{label}</label>
  </div>
);

export default function Register() {
  const { register, user } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", phoneno: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(f.phoneno.trim())) return toast.error(t("auth.phoneBad"));
    if (f.password.length < 6) return toast.error(t("auth.pwShort"));
    if (f.password !== f.confirm) return toast.error(t("auth.mismatch"));
    setBusy(true);
    try {
      await register({ name: f.name.trim(), phoneno: f.phoneno.trim(), email: f.email.trim() || undefined, password: f.password });
      toast.success(t("auth.created"));
      nav("/", { replace: true });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <AuthShell mode="register" title={t("auth.join")} sub={t("auth.registerSub")}>
      <form onSubmit={submit} className="space-y-3.5">
        <Input id="name" icon={User} label={t("auth.name")} value={f.name} onChange={set("name")} required />
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Input id="phoneno" icon={Phone} label={t("auth.phone")} inputMode="numeric" maxLength={10} value={f.phoneno} onChange={set("phoneno")} required />
          <Input id="email" icon={Mail} label={t("auth.email")} type="email" value={f.email} onChange={set("email")} />
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Input id="password" icon={Lock} label={t("auth.password")} type="password" value={f.password} onChange={set("password")} required />
          <Input id="confirm" icon={ShieldCheck} label={t("auth.confirm")} type="password" value={f.confirm} onChange={set("confirm")} required />
        </div>
        <button className="btn-primary mt-2 w-full py-3.5 text-base" disabled={busy}>
          {busy ? <Spinner className="h-4 w-4 !text-white" /> : <>{t("nav.register")} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        {t("auth.haveAccount")} <Link to="/login" className="font-semibold text-primary-600 hover:underline">{t("nav.login")}</Link>
      </p>
    </AuthShell>
  );
}
