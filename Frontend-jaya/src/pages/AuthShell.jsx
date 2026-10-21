import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Wallet, ArrowLeft } from "lucide-react";
import LangToggle from "../components/common/LangToggle";
import { useLang } from "../context/LangContext";
import { ART } from "../config/site";
import { Sprig, Sparkle, Flower } from "../components/common/Doodles";

// Cream canvas with floating product cards (AI-Studio style) + a leaf-shaped glass card with a sliding Login/Register switch.
export default function AuthShell({ mode = "login", title, sub, children }) {
  const { t } = useLang();
  const isLogin = mode === "login";
  return (
    <div className="relative isolate flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-cream px-3 pb-6 pt-20 sm:p-6 sm:pt-24 lg:pt-6">
      <span className="pointer-events-none absolute -left-24 top-10 -z-10 h-80 w-80 animate-blob rounded-full bg-primary-100 blur-3xl" />
      <span className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-96 w-96 animate-blob rounded-full bg-gold-300/40 blur-3xl" style={{ animationDelay: "4s" }} />
      <Sprig className="pointer-events-none absolute left-4 top-1/3 -z-10 hidden h-44 w-28 -rotate-12 animate-sway text-secondary-500/30 md:block" />
      <Sprig className="pointer-events-none absolute bottom-6 right-6 -z-10 hidden h-44 w-28 rotate-[24deg] animate-sway text-secondary-500/30 md:block" style={{ animationDelay: "1.4s" }} />
      <Flower className="pointer-events-none absolute right-[8%] top-[14%] -z-10 hidden h-14 w-14 animate-spinSlow text-primary-400/40 md:block" />
      <Sparkle className="pointer-events-none absolute left-[10%] bottom-[16%] -z-10 hidden h-5 w-5 animate-twinkle text-gold-500 md:block" />

      <Link to="/" className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-cream-sand bg-white/80 px-3.5 py-2 text-xs font-semibold text-secondary-700 backdrop-blur transition hover:-translate-x-0.5 hover:border-primary-600 hover:text-primary-600 sm:left-8 sm:top-6">
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>
      <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-6"><LangToggle /></div>

      <div className="animate-rise grid w-full max-w-md overflow-hidden bg-white shadow-lift md:max-w-xl lg:max-w-5xl lg:grid-cols-[1fr_1.05fr]" style={{ borderRadius: "2.6rem .9rem 2.6rem .9rem" }}>
        {/* brand panel */}
        <div className="relative hidden overflow-hidden bg-secondary-700 p-8 text-white lg:block">
          <span className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 animate-blob rounded-full bg-primary-600/40 blur-3xl" />
          <Sprig className="absolute -bottom-3 right-2 h-44 w-28 rotate-[16deg] animate-sway text-white/10" />
          <div className="relative flex h-full flex-col justify-between">
            <Link to="/" className="w-fit overflow-hidden rounded-lg border border-primary-700 bg-primary-600 shadow-glow transition hover:-rotate-1">
              <img src="/logo.png" alt="Jayamangala Agro Foods" className="h-14 w-auto object-contain" />
            </Link>
            <div className="relative my-8 h-56">
              <img src={ART.milk} alt="" className="absolute left-0 top-4 h-44 w-32 animate-floaty object-cover shadow-lift ring-4 ring-white/90" style={{ "--r": "-8deg", borderRadius: "999px 999px 1.4rem 1.4rem" }} />
              <img src={ART.oil} alt="" className="absolute left-24 top-0 h-52 w-36 animate-floaty rounded-[2.2rem_.6rem_2.2rem_.6rem] object-cover shadow-lift ring-4 ring-white/90" style={{ "--r": "4deg", animationDelay: "1.5s" }} />
              <img src={ART.lamp} alt="" className="absolute right-0 top-8 h-40 w-28 animate-floaty rounded-[.6rem_2.2rem_.6rem_2.2rem] object-cover shadow-lift ring-4 ring-white/90" style={{ "--r": "10deg", animationDelay: "3s" }} />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight">{t("auth.sideTitle")}</h2>
              <p className="mt-2 font-script text-2xl text-gold-300">{t("auth.sideSub")}</p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex items-center gap-3"><Wallet className="h-4 w-4 text-gold-300" />{t("home.perk1")}</li>
                <li className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-gold-300" />{t("home.perk2")}</li>
                <li className="flex items-center gap-3"><Truck className="h-4 w-4 text-gold-300" />{t("home.perk3")}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* form panel */}
        <div className="flex min-w-0 flex-col px-5 py-7 sm:px-10 sm:py-10">
          <Link to="/" className="mb-6 block w-fit overflow-hidden rounded-lg border border-primary-700 bg-primary-600 shadow-glow lg:hidden"><img src="/logo.png" alt="Jayamangala Agro Foods" className="h-11 w-auto object-contain" /></Link>

          {/* sliding switch */}
          <div className="relative grid w-full max-w-xs grid-cols-2 rounded-full bg-cream-deep p-1 text-sm font-semibold">
            <span className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-primary-600 shadow-glow transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isLogin ? "translate-x-0" : "translate-x-full"}`} />
            <Link to="/login" className={`relative z-10 py-2 text-center transition-colors ${isLogin ? "text-white" : "text-ink-soft"}`}>{t("nav.login")}</Link>
            <Link to="/register" className={`relative z-10 py-2 text-center transition-colors ${!isLogin ? "text-white" : "text-ink-soft"}`}>{t("nav.register")}</Link>
          </div>

          <div className="flex flex-1 flex-col justify-center py-6 sm:py-8">
            <h1 className="font-display text-[1.75rem] font-bold text-secondary-700 sm:text-4xl">{title}</h1>
            <p className="mt-1.5 text-sm text-ink-soft">{sub}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
