import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, BadgeCheck, ShieldCheck, Truck, Leaf, Send, CheckCircle2, Phone, Mail, MapPin, Package, IndianRupee, Users } from "lucide-react";
import toast from "react-hot-toast";
import { LeadAPI } from "../api/services";
import { useLang } from "../context/LangContext";
import { Reveal } from "../components/common/Motion";
import { Sprig, Sparkle } from "../components/common/Doodles";
import { usePageMeta } from "../hooks/usePageMeta";
import { SITE } from "../config/site";
import { ENQUIRY_TYPES } from "../config/content";

const WHY_ITEMS = [
  { icon: IndianRupee, tKey: "ws.w1", dKey: "ws.w1d", bg: "bg-blush"  },
  { icon: Truck,       tKey: "ws.w2", dKey: "ws.w2d", bg: "bg-sage"   },
  { icon: Package,     tKey: "ws.w3", dKey: "ws.w3d", bg: "bg-butter" },
  { icon: Users,       tKey: "ws.w4", dKey: "ws.w4d", bg: "bg-lilac"  },
  { icon: ShieldCheck, tKey: "ws.w5", dKey: "ws.w5d", bg: "bg-peach"  },
  { icon: BadgeCheck,  tKey: "ws.w6", dKey: "ws.w6d", bg: "bg-sage"   },
];

const LEAD_STATUSES = ["New", "Contacted", "Quoted", "Converted", "Closed"];

export default function Wholesale() {
  const { t, tx, lang } = useLang();
  usePageMeta("Wholesale Enquiry", "Submit a wholesale enquiry for bulk edible oils and food products. Jayamangala Agro Foods – Kumbakonam, Tamil Nadu.");
  const [f, setF] = useState({
    name: "", company: "", phone: "", email: "",
    productInterest: [], estimatedQuantity: "", message: ""
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const toggleInterest = (val) => {
    setF(prev => ({
      ...prev,
      productInterest: prev.productInterest.includes(val)
        ? prev.productInterest.filter(x => x !== val)
        : [...prev.productInterest, val]
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) { toast.error("Please enter your name"); return; }
    if (!/^\d{10}$/.test(f.phone.replace(/\s/g, ""))) { toast.error("Enter a valid 10-digit phone number"); return; }
    if (!f.productInterest.length) { toast.error("Please select at least one product of interest"); return; }

    setBusy(true);
    try {
      // 1. Save to DB
      await LeadAPI.submit({
        name: f.name.trim(),
        company: f.company.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        productInterest: f.productInterest,
        estimatedQuantity: f.estimatedQuantity.trim(),
        message: f.message.trim(),
        source: "wholesale_page"
      });

      // 2. Also open WhatsApp with a pre-filled message
      const waMsg =
        `*Wholesale Enquiry — Jayamangala Agro Foods*\n\n` +
        `*Name:* ${f.name.trim()}\n` +
        `*Company / Business:* ${f.company.trim() || "Not provided"}\n` +
        `*Phone:* ${f.phone.trim()}\n` +
        `*Email:* ${f.email.trim() || "Not provided"}\n` +
        `*Products Interested:* ${f.productInterest.join(", ")}\n` +
        `*Estimated Quantity:* ${f.estimatedQuantity.trim() || "Not specified"}\n` +
        `*Message:*\n${f.message.trim() || "No additional message"}`;

      window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(waMsg)}`, "_blank", "noopener,noreferrer");
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again or call us directly.");
    } finally {
      setBusy(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────
  if (done) {
    return (
      <div className="container-x py-20">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-secondary-600" />
          <h1 className="mt-5 font-display text-3xl font-bold text-secondary-700">{t("ws.success")}</h1>
          <p className="mt-3 text-ink-soft">{t("ws.successD")}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="btn-dark px-8 py-3">{t("ws.backHome")}</Link>
            <Link to="/products" className="btn-outline px-8 py-3">{t("hero.shop")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ───────────────────────────────────────────────
  return (
    <div className="w-full max-w-[100vw] overflow-x-clip">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-secondary-700 px-4 py-16 text-white sm:py-24">
        <span className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 animate-blob rounded-full bg-primary-600/40 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 animate-blob rounded-full bg-gold-500/20 blur-3xl" />
        <Sprig className="pointer-events-none absolute right-8 top-6 h-28 w-16 rotate-12 animate-sway text-white/15" />
        <div className="container-x relative text-center">
          <Reveal>
            <p className="eyebrow !text-gold-300">{t("ws.kicker")}</p>
            <h1 className="mt-3 font-display text-[clamp(1.9rem,5vw,3.8rem)] font-bold leading-tight">
              {t("ws.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/75 sm:text-lg">{t("ws.sub")}</p>
          </Reveal>
          <Reveal delay={200} className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#ws-form" className="btn bg-primary-600 px-8 py-3.5 text-white shadow-glow hover:bg-primary-700">
              {t("ws.formTitle")} <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/" className="btn border border-white/30 bg-transparent px-8 py-3.5 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" /> {t("ws.backHome")}
            </Link>
          </Reveal>

          {/* Quick contact strip */}
          <Reveal delay={350} className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/70">
            <a href={`tel:${SITE.phone.replace(/\s/g,"")}`} className="flex items-center gap-2 hover:text-white">
              <Phone className="h-4 w-4 text-gold-400" />{SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-white">
              <Mail className="h-4 w-4 text-gold-400" />{SITE.email}
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-400" />Kumbakonam, Tamil Nadu
            </span>
          </Reveal>
        </div>
      </section>

      {/* ── WHY PARTNER ── */}
      <section className="container-x pt-20 sm:pt-28">
        <Reveal className="text-center">
          <p className="eyebrow">{t("why.kicker")}</p>
          <h2 className="h-section mt-2">{t("ws.whyTitle")}</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {WHY_ITEMS.map(({ icon: Icon, tKey, dKey, bg }, i) => (
            <Reveal key={i} delay={i * 90} variant="zoom">
              <div className={`group relative h-full overflow-hidden border border-cream-sand/70 bg-white p-5 shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift sm:p-6 ${i % 2 ? "rounded-[.6rem_2.4rem_.6rem_2.4rem]" : "rounded-[2.4rem_.6rem_2.4rem_.6rem]"}`}>
                <span className={`${bg} flex h-12 w-12 items-center justify-center text-primary-600 transition duration-500 group-hover:rotate-6 group-hover:scale-110 ${i % 2 ? "rounded-[.6rem_1.6rem_.6rem_1.6rem]" : "rounded-[1.6rem_.6rem_1.6rem_.6rem]"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-[15px] font-bold text-secondary-700 sm:text-base">{t(tKey)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{t(dKey)}</p>
                <span className="absolute inset-x-6 bottom-0 h-1 origin-left scale-x-0 rounded-t-full bg-primary-600 transition duration-500 group-hover:scale-x-100" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── ENQUIRY FORM ── */}
      <section id="ws-form" className="container-x py-20 sm:py-28">
        <div className="grid overflow-hidden bg-white shadow-lift lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" style={{ borderRadius: "2.5rem .8rem 2.5rem .8rem" }}>

          {/* Left info panel */}
          <Reveal variant="from-left" className="relative min-w-0 overflow-hidden bg-secondary-700 p-6 text-white sm:p-10">
            <span className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 animate-blob rounded-full bg-primary-600/40 blur-3xl" />
            <Sprig className="absolute -bottom-2 right-3 h-36 w-20 rotate-[10deg] animate-sway text-white/15" />
            <div className="relative">
              <Sparkle className="absolute right-0 top-0 h-5 w-5 animate-twinkle text-gold-300" />
              <p className="font-script text-3xl font-bold text-gold-300">{t("ws.kicker")}</p>
              <h2 className="mt-1 font-display text-[1.85rem] font-semibold leading-tight sm:text-4xl">{t("ws.formTitle")}</h2>
              <p className="mt-4 text-sm text-white/70">{t("ws.formSub")}</p>

              <div className="mt-8 space-y-5">
                {[
                  [Phone, lang === "ta" ? "தொலைபேசி" : "Phone", SITE.phone, `tel:${SITE.phone.replace(/\s/g,"")}`],
                  [Mail, lang === "ta" ? "மின்னஞ்சல்" : "Email", SITE.email, `mailto:${SITE.email}`],
                  [MapPin, lang === "ta" ? "இருப்பிடம்" : "Location", SITE.address, null],
                ].map(([Icon, label, value, href]) => (
                  <div key={label} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-script text-lg font-bold leading-none text-gold-300">{label}</p>
                      {href
                        ? <a href={href} className="mt-0.5 block text-sm font-medium hover:text-gold-400">{value}</a>
                        : <p className="mt-0.5 text-sm">{value}</p>
                      }
                    </div>
                  </div>
                ))}
              </div>

              {/* Who we supply */}
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
                  {lang === "ta" ? "நாங்கள் யாருக்கு வழங்குகிறோம்" : "Who we supply"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Distributors","Retailers","Wholesalers","Supermarkets","Hotels & Restaurants","Institutions"].map(x => (
                    <span key={x} className="rounded-full border border-white/20 px-3 py-0.5 text-xs text-white/80">{x}</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right form panel */}
          <Reveal variant="from-right" className="min-w-0 p-5 sm:p-10">
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">

              {/* Name */}
              <div>
                <label className="label">{t("ws.name")}</label>
                <input className="input" required value={f.name} onChange={set("name")} placeholder={t("ws.ph.name")} />
              </div>

              {/* Company */}
              <div>
                <label className="label">{t("ws.company")}</label>
                <input className="input" value={f.company} onChange={set("company")} placeholder={t("ws.ph.company")} />
              </div>

              {/* Phone */}
              <div>
                <label className="label">{t("ws.phone")}</label>
                <input className="input" type="tel" required value={f.phone} onChange={set("phone")} placeholder={t("ws.ph.phone")} />
              </div>

              {/* Email */}
              <div>
                <label className="label">{t("ws.email")}</label>
                <input className="input" type="email" value={f.email} onChange={set("email")} placeholder={t("ws.ph.email")} />
              </div>

              {/* Product Interest (multi-select checkboxes) */}
              <div className="sm:col-span-2">
                <label className="label">{t("ws.interest")}</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ENQUIRY_TYPES.map(item => {
                    const val = item.en;
                    const label = tx(item);
                    const selected = f.productInterest.includes(val);
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => toggleInterest(val)}
                        className={`pill cursor-pointer border text-sm transition-all duration-200 ${
                          selected
                            ? "border-primary-600 bg-primary-600 text-white shadow-sm"
                            : "border-cream-sand bg-white text-ink-soft hover:border-primary-400 hover:text-primary-600"
                        }`}
                      >
                        {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Quantity */}
              <div>
                <label className="label">{t("ws.qty")}</label>
                <input className="input" value={f.estimatedQuantity} onChange={set("estimatedQuantity")} placeholder={t("ws.ph.qty")} />
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label className="label">{t("ws.msg")}</label>
                <textarea className="input min-h-[100px]" value={f.message} onChange={set("message")} placeholder={t("ws.ph.msg")} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="btn-primary py-3.5 text-[15px] sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Send className="h-4 w-4" />
                {busy ? t("ws.sending") : t("ws.send")}
              </button>

              <p className="text-center text-xs text-ink-faint sm:col-span-2">
                {lang === "ta"
                  ? "உங்கள் விவரங்கள் பாதுகாப்பாக வைக்கப்படும். மூன்றாம் தரப்பினருக்கு பகிரப்படாது."
                  : "Your details are kept private and will never be shared with third parties."}
              </p>
            </form>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

