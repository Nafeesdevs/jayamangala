import { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Phone, Lock, ArrowRight } from "lucide-react";
import AuthShell from "./AuthShell";
import { Spinner } from "../components/common/ui";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { errMsg } from "../api/client";

const env = import.meta.env;

export default function Login() {
  const { login, user, isAdmin } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const loc = useLocation();
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={isAdmin ? "/admin" : "/"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(phone.trim(), pw);
      toast.success(t("auth.loggedIn"));
      nav(u.role === "admin" ? "/admin" : loc.state?.from || "/", { replace: true });
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <AuthShell mode="login" title={t("auth.welcome")} sub={t("auth.loginSub")}>
      <form onSubmit={submit} className="space-y-4">
        <div className="fi">
          <Phone className="ico" />
          <input id="phone" placeholder=" " inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} required autoFocus />
          <label htmlFor="phone">{t("auth.phone")}</label>
        </div>
        <div className="fi">
          <Lock className="ico" />
          <input id="pw" placeholder=" " type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} required className="pr-11" />
          <label htmlFor="pw">{t("auth.password")}</label>
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-faint transition hover:text-primary-600" aria-label="Show password">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <button className="btn-primary w-full py-3.5 text-base" disabled={busy}>
          {busy ? <Spinner className="h-4 w-4 !text-white" /> : <>{t("nav.login")} <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        {t("auth.noAccount")} <Link to="/register" className="font-semibold text-primary-600 hover:underline">{t("nav.register")}</Link>
      </p>

      {env.VITE_SHOW_DEMO === "true" && (
        <div className="mt-6 rounded-2xl border border-gold-400/50 bg-gold-300/20 p-4">
          <p className="mb-3 text-xs font-semibold">{t("auth.demo")}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-outline btn-sm" onClick={() => { setPhone(env.VITE_DEMO_ADMIN_PHONE); setPw(env.VITE_DEMO_ADMIN_PASSWORD); }}>{t("auth.demoAdmin")}</button>
            <button type="button" className="btn-outline btn-sm" onClick={() => { setPhone(env.VITE_DEMO_USER_PHONE); setPw(env.VITE_DEMO_USER_PASSWORD); }}>{t("auth.demoUser")}</button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
