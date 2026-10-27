import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Target, Eye, MessageCircle, Send, Sparkles, ShieldCheck, ArrowRight, Award, BadgeCheck, Leaf } from "lucide-react";
import { useLang } from "../context/LangContext";
import { SITE } from "../config/site";
import { Field, Spinner } from "../components/common/ui";
import { usePageMeta } from "../hooks/usePageMeta";
import { LeadAPI } from "../api/services";
import { errMsg } from "../api/client";
import { track } from "../hooks/useAnalytics";

const Wrap = ({ title, children, narrow = true, noGap = false }) => (
  <div className={`container-x py-8 sm:py-14 ${narrow ? "max-w-3xl" : ""}`}>
    <h1 className="font-display text-[2rem] font-semibold leading-tight sm:text-5xl">{title}</h1>
    {children}
  </div>
);

export function About() {
  const { t, lang } = useLang();
  usePageMeta("About Us", "Learn about Jayamangala Agro Foods — quality edible oils and food products from Kumbakonam, Tamil Nadu since 1995.");

  const quickPillars = [
    {
      title: lang === "ta" ? "மரச்செக்கு எண்ணெய்கள்" : "Cold-Pressed Oils",
      sub: lang === "ta" ? "100% மரச்செக்கு சமையல் எண்ணெய்" : "Groundnut, Sesame & Coconut",
      badge: lang === "ta" ? "தூய்மை" : "100% Pure",
      icon: Leaf,
      bg: "bg-amber-50 text-amber-700 border-amber-200/80",
    },
    {
      title: lang === "ta" ? "ஆர்வீகா பால்" : "Aarvikaa Dairy",
      sub: lang === "ta" ? "பண்ணைப் புதிய பால் & தயிர்" : "Farm-fresh milk & curd",
      badge: lang === "ta" ? "புத்துணர்ச்சி" : "Fresh Daily",
      icon: Award,
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    },
    {
      title: lang === "ta" ? "தானியங்கள் & மாவு" : "Food Provisions",
      sub: lang === "ta" ? "அன்றாட உணவுப் பொருட்கள்" : "Quality pulses & flours",
      badge: lang === "ta" ? "தரம்" : "Premium",
      icon: BadgeCheck,
      bg: "bg-primary-50 text-primary-700 border-primary-200/80",
    },
    {
      title: lang === "ta" ? "30+ ஆண்டு பாரம்பரியம்" : "30+ Years Trust",
      sub: lang === "ta" ? "1995 முதல் கும்பகோணத்தில்" : "Serving since 1995",
      badge: "Kumbakonam",
      icon: ShieldCheck,
      bg: "bg-secondary-50 text-secondary-800 border-secondary-200/80",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden py-8 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-8">
        
        {/* Header Hero Section */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-primary-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === "ta" ? "எங்கள் வரலாறு & பாரம்பரியம்" : "Our Heritage & Story"}</span>
            </div>
            <h1 className="h-section mt-3 text-3xl sm:text-5xl font-semibold leading-tight text-secondary-900">
              {t("about.title")}
            </h1>
            <p className="mt-2 text-sm text-ink-soft sm:text-base">
              {lang === "ta" 
                ? "1995 முதல் கும்பகோணத்தில் வாடிக்கையாளர் நம்பிக்கையுடன் இயங்கி வரும் ஜெயமங்கலா அக்ரோ ஃபுட்ஸ்." 
                : "Built on experience and trusted by generations in Kumbakonam, Thanjavur District since 1995."}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-cream-sand bg-white px-4 py-2 text-xs font-medium text-secondary-800 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{lang === "ta" ? "1995 முதல் பாரம்பரியம்" : "Since 1995 · Kumbakonam"}</span>
          </div>
        </div>

        {/* 1. TOP SECTION: Narrative Details, Mission, Vision & Wholesale (2-Column Split on Top) */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Brand Story Details (7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="rounded-2xl border border-cream-sand bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Jayamangala Agro Foods" className="h-12 sm:h-14 w-auto rounded-xl object-contain shadow-glow" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-secondary-900">{SITE.name}</h2>
                  <p className="text-xs text-ink-faint">Kumbakonam, Thanjavur District, Tamil Nadu</p>
                </div>
              </div>
              
              <div className="mt-5 space-y-3.5 text-sm sm:text-base leading-relaxed text-secondary-800">
                <p className="font-medium text-secondary-900">{t("about.p1")}</p>
                <p className="text-ink-soft">{t("about.p2")}</p>
                {t("about.p3") && <p className="text-ink-soft">{t("about.p3")}</p>}
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5 border-t border-cream-sand/60 pt-4">
                {[
                  { en: "Cold-Pressed Groundnut Oil", ta: "கடலை எண்ணெய்" },
                  { en: "Pure Gingelly Oil", ta: "நல்லெண்ணெய்" },
                  { en: "Pure Coconut Oil", ta: "தேங்காய் எண்ணெய்" },
                  { en: "Aarvikaa Fresh Milk", ta: "ஆர்வீகா பால்" },
                  { en: "Aishwaryam Deepam Oil", ta: "தீபம் எண்ணெய்" },
                ].map((item, idx) => (
                  <span key={idx} className="rounded-full border border-cream-sand bg-cream-sand/30 px-3 py-1 text-xs font-semibold text-secondary-800">
                    ✓ {lang === "ta" ? item.ta : item.en}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Mission, Vision & Direct Contact Action (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            {/* Our Mission Card */}
            <div className="rounded-2xl border border-cream-sand bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-100">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-base text-secondary-900">{t("about.mission")}</h2>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-ink-soft leading-relaxed">{t("about.missionD")}</p>
            </div>

            {/* Our Vision Card */}
            <div className="rounded-2xl border border-cream-sand bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary-700 border border-secondary-100">
                  <Eye className="h-5 w-5" />
                </div>
                <h2 className="font-bold text-base text-secondary-900">{t("about.vision")}</h2>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-ink-soft leading-relaxed">{t("about.visionD")}</p>
            </div>

            {/* Quick Link Card to Wholesale / Contact */}
            <div className="rounded-2xl border border-cream-sand bg-cream-deep/40 p-5 text-secondary-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary-900">
                  {lang === "ta" ? "வணிக & மொத்த ஆர்டர்கள்" : "Wholesale & Business"}
                </p>
                <p className="text-xs text-ink-soft mt-0.5">
                  {lang === "ta" ? "கும்பகோணம் மற்றும் தமிழகம் முழுவதும் விநியோகம்" : "Direct supply across Tamil Nadu"}
                </p>
              </div>
              <Link to="/wholesale" className="btn-primary text-xs py-2 px-3.5 shrink-0">
                {lang === "ta" ? "விசாரிக்கவும்" : "Wholesale"}
              </Link>
            </div>
          </div>

        </div>

        {/* 2. MIDDLE SECTION: Full-Size Showcase Image */}
        <div className="mt-10">
          <div className="group relative w-full overflow-hidden rounded-3xl border border-cream-sand bg-white p-3 sm:p-4 shadow-lift transition-all duration-500 hover:-translate-y-1">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full min-h-[300px] sm:min-h-[420px] lg:min-h-[480px] overflow-hidden rounded-2xl sm:rounded-3xl bg-cream-deep/60">
              <img 
                src="/images/jayamangala-store.jpg" 
                alt="Jayamangala Agro Foods Storefront" 
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/90 via-secondary-900/35 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-8 sm:left-8 sm:right-8">
                <span className="inline-block rounded-full bg-primary-600 px-3.5 py-1 text-xs font-bold tracking-wide uppercase shadow-sm">
                  Kumbakonam Flagship Store & Online
                </span>
                <h2 className="mt-2.5 font-display text-xl sm:text-3xl lg:text-4xl font-bold leading-snug text-white">
                  Pure Oils · Fresh Milk · Daily Foods
                </h2>
                <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-white/90 leading-relaxed">
                  {lang === "ta"
                    ? "30 ஆண்டுகளுக்கும் மேலாக ஆயிரக்கணக்கான குடும்பங்கள் மற்றும் வணிக நிறுவனங்களின் நம்பிக்கையைப் பெற்ற ஜெயமங்கலா அக்ரோ ஃபுட்ஸ்."
                    : "Serving thousands of happy families, retailers, and restaurants with uncompromised quality, purity, and honest value since 1995."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM SECTION: 4 Product Value Pillar Boxes */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {quickPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-cream-sand bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-secondary-300 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${p.bg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-cream-sand/50 px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold text-secondary-700">
                    {p.badge}
                  </span>
                </div>
                <div className="mt-3">
                  <h2 className="text-xs sm:text-sm font-bold text-secondary-900 truncate">{p.title}</h2>
                  <p className="text-[11px] text-ink-soft mt-0.5 truncate">{p.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export function Contact() {
  const { t, lang } = useLang();
  usePageMeta("Contact Us", "Get in touch with Jayamangala Agro Foods. Visit us at Kumbakonam or call +91 93443 02121.");
  const [f, setF] = useState({ name: "", phone: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return toast.error(lang === "ta" ? "பெயர் தேவை" : "Name is required");
    if (!/^\d{10}$/.test(f.phone.replace(/[\s\-()]/g, ""))) {
      return toast.error(lang === "ta" ? "சரியான 10 இலக்க தொலைபேசி எண் தேவை" : "Enter a valid 10-digit phone number");
    }
    if (!f.message.trim()) return toast.error(lang === "ta" ? "செய்தி தேவை" : "Message is required");

    setBusy(true);
    try {
      await LeadAPI.contact({
        name: f.name.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        message: f.message.trim(),
      });
      track("contact_submit");
      setDone(true);
    } catch (err) {
      toast.error(errMsg(err) || (lang === "ta" ? "சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Submission failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const quickChannels = [
    {
      icon: Phone,
      title: t("contact.call"),
      val: SITE.phone,
      sub: "9:00 AM - 8:00 PM",
      href: `tel:${SITE.phone.replace(/\s/g, "")}`,
      action: lang === "ta" ? "அழைக்கவும்" : "Call",
      bg: "bg-primary-50 text-primary-700 border-primary-200/80 hover:bg-primary-600 hover:text-white",
      btnBg: "bg-primary-600 text-white",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      val: "+91 " + SITE.whatsapp.slice(-10),
      sub: lang === "ta" ? "உடனடி பதில்" : "Instant Chat",
      href: `https://wa.me/${SITE.whatsapp}`,
      action: lang === "ta" ? "அரட்டை" : "Chat",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-600 hover:text-white",
      btnBg: "bg-emerald-600 text-white",
    },
    {
      icon: Mail,
      title: t("contact.mail"),
      val: SITE.email,
      sub: lang === "ta" ? "ஆதரவு & வணிகம்" : "Inquiries",
      href: `mailto:${SITE.email}`,
      action: lang === "ta" ? "மின்னஞ்சல்" : "Email",
      bg: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-600 hover:text-white",
      btnBg: "bg-amber-600 text-white",
    },
    {
      icon: MapPin,
      title: t("contact.visit"),
      val: "Kumbakonam, Tamil Nadu",
      sub: "81, JP Koil East St",
      href: "https://maps.google.com/?q=" + encodeURIComponent(SITE.address),
      action: lang === "ta" ? "வரைபடம்" : "Map",
      bg: "bg-secondary-50 text-secondary-800 border-secondary-200/80 hover:bg-secondary-700 hover:text-white",
      btnBg: "bg-secondary-700 text-white",
    },
  ];

  return (
    <div className="w-full overflow-x-hidden py-8 sm:py-12">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-8">
        
        {/* Header Hero Section */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-primary-50/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{lang === "ta" ? "தொடர்பு கொள்ள" : "Get In Touch"}</span>
            </div>
            <h1 className="h-section mt-3 text-3xl sm:text-5xl font-semibold leading-tight text-secondary-900">
              {t("contact.title")}
            </h1>
            <p className="mt-2 text-sm text-ink-soft sm:text-base">
              {t("contact.sub")}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-cream-sand bg-white px-4 py-2 text-xs font-medium text-secondary-800 shadow-xs">
            <Clock className="h-4 w-4 text-primary-600 shrink-0" />
            <span className="font-semibold">{SITE.hours}</span>
          </div>
        </div>

        {/* Top 4 Quick-Action Clickable Channels (Everything directly visible at the top) */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {quickChannels.map((c, i) => {
            const Icon = c.icon;
            return (
              <a
                key={i}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex flex-col justify-between rounded-2xl border border-cream-sand bg-white p-4 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-secondary-300 hover:shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${c.bg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-600 group-hover:translate-x-0.5 transition-transform">
                    {c.action} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">{c.title}</p>
                  <p className="truncate text-xs sm:text-sm font-bold text-secondary-900 mt-0.5">{c.val}</p>
                  <p className="text-[11px] text-ink-soft mt-0.5 truncate">{c.sub}</p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Main 2-Column Split: Detailed Clickable Info & Form */}
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* Left Column: Direct Location & Full Details Card (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            {/* Full Store Location Card with Direct Google Map Button */}
            <div className="rounded-2xl border border-cream-sand bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                    {lang === "ta" ? "நேரடி முகவரி" : "Store Address"}
                  </span>
                  <h2 className="mt-1 text-sm sm:text-base font-bold text-secondary-900 leading-snug">
                    {SITE.name}
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm leading-relaxed text-secondary-800">
                    {SITE.address}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-cream-sand/60">
                <a
                  href={"https://maps.google.com/?q=" + encodeURIComponent(SITE.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-secondary-700 text-white text-xs py-2 px-4 hover:bg-secondary-800"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {lang === "ta" ? "கூகுள் வரைபடம்" : "Open Google Maps"}
                </a>
                <a
                  href={`https://wa.me/${SITE.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-emerald-600 text-white text-xs py-2 px-4 hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {lang === "ta" ? "வாட்ஸ்அப்" : "WhatsApp"}
                </a>
              </div>
            </div>

            {/* Operating Hours & Trust Pill */}
            <div className="rounded-2xl border border-cream-sand bg-cream-deep/40 p-5 text-secondary-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary-900">
                    {lang === "ta" ? "வேலை நேரம்" : "Store Hours"}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {lang === "ta" ? "திறந்துள்ளது" : "Open Mon–Sat"}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-secondary-900">
                {SITE.hours}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                {lang === "ta" 
                  ? "ஞாயிறு விடுமுறை. அனைத்து வேலை நாட்களிலும் நேரடி விற்பனை உண்டு." 
                  : "Sunday Holiday. Open for retail walk-ins & wholesale collections."}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft border-t border-cream-sand/60 pt-3">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === "ta" 
                    ? "30 ஆண்டுகளுக்கும் மேலான வாடிக்கையாளர் நம்பிக்கை (1995 முதல்)." 
                    : "Serving households and businesses with pure agro products since 1995."}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Compact Message Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-3xl border border-cream-sand bg-white p-6 sm:p-8 shadow-card">
              
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-primary-600 via-gold-400 to-secondary-700" />

              {done ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm">
                    <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-bold text-secondary-900">
                    {lang === "ta" ? "நன்றி! உங்கள் செய்தி பதிவு செய்யப்பட்டது." : "Thank you! Your message has been received."}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
                    {lang === "ta"
                      ? "எங்கள் குழு விரைவில் உங்களைத் தொடர்பு கொள்ளும்."
                      : "Our team will review your message and get back to you promptly."}
                  </p>
                  <button
                    type="button"
                    className="btn-outline mt-5 px-6 py-2 text-sm"
                    onClick={() => {
                      setDone(false);
                      setF({ name: "", phone: "", email: "", message: "" });
                    }}
                  >
                    {lang === "ta" ? "மற்றொரு செய்தி அனுப்பவும்" : "Send another message"}
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-secondary-900">
                      {t("contact.form")}
                    </h2>
                    <p className="mt-1 text-xs text-ink-soft">
                      {lang === "ta"
                        ? "உங்கள் கேள்விகளை இங்கே தெரிவிக்கவும், உடனுக்குடன் பதிலளிக்கிறோம்."
                        : "Send us a message and we will respond as quickly as possible."}
                    </p>
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    <Field label={lang === "ta" ? "உங்கள் பெயர் *" : "Your Name *"}>
                      <input
                        className="input"
                        required
                        value={f.name}
                        onChange={(e) => setF({ ...f, name: e.target.value })}
                        maxLength={100}
                        placeholder={lang === "ta" ? "உங்கள் பெயர்" : "Your Name"}
                      />
                    </Field>

                    <Field label={lang === "ta" ? "தொலைபேசி எண் *" : "Phone Number *"}>
                      <input
                        className="input"
                        type="tel"
                        required
                        inputMode="numeric"
                        value={f.phone}
                        onChange={(e) => setF({ ...f, phone: e.target.value })}
                        maxLength={15}
                        placeholder={lang === "ta" ? "10 இலக்க எண்" : "10-digit number"}
                      />
                    </Field>
                  </div>

                  <Field label={lang === "ta" ? "மின்னஞ்சல் (விரும்பினால்)" : "Email (optional)"}>
                    <input
                      className="input"
                      type="email"
                      value={f.email}
                      onChange={(e) => setF({ ...f, email: e.target.value })}
                      maxLength={200}
                      placeholder={lang === "ta" ? "name@example.com" : "name@example.com"}
                    />
                  </Field>

                  <Field label={lang === "ta" ? "செய்தி *" : "Message *"}>
                    <textarea
                      className="input min-h-[110px] resize-y"
                      required
                      value={f.message}
                      onChange={(e) => setF({ ...f, message: e.target.value })}
                      maxLength={2000}
                      placeholder={lang === "ta" ? "நாங்கள் உங்களுக்கு எவ்வாறு உதவலாம்..." : "How can we help you?"}
                    />
                    <div className="mt-1 flex items-center justify-between text-xs text-ink-faint">
                      <span>{lang === "ta" ? "நேரடி & மொத்த விற்பனை வினவல்கள்" : "Retail & wholesale queries welcome"}</span>
                      <span>{f.message.length}/2000</span>
                    </div>
                  </Field>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-base shadow-glow transition-all hover:scale-[1.01]"
                    disabled={busy}
                  >
                    {busy ? (
                      <>
                        <Spinner className="h-4 w-4 !text-white" />
                        {lang === "ta" ? "அனுப்புகிறது…" : "Sending…"}
                      </>
                    ) : (
                      <span className="flex items-center justify-center gap-2 font-bold">
                        <Send className="h-4 w-4" />
                        {t("contact.send")}
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

const legal = {
  terms: {
    en: [
      ["Using our store", "By placing an order you confirm that the details you give are correct and that you are at least 18 years old or ordering with a guardian’s consent."],
      ["Prices and availability", "Prices are shown in Indian rupees and may change without notice. An order is confirmed only when stock is available and, for UPI orders, your payment has been verified."],
      ["Payments", "We accept cash on delivery and UPI QR payments. For UPI orders you must upload a clear screenshot of the successful transaction. Orders with a rejected payment are cancelled."],
      ["Delivery", "Delivery times are estimates. Please make sure someone is available to receive the order at the address you provide."],
      ["Cancellations and returns", "You can cancel an order from My Orders until it is shipped. For damaged or wrong items, contact us within 48 hours of delivery."],
      ["Contact", `Questions about these terms? Write to ${SITE.email}.`],
    ],
    ta: [
      ["எங்கள் கடையைப் பயன்படுத்துதல்", "ஆர்டர் செய்வதன் மூலம் நீங்கள் வழங்கும் விவரங்கள் சரியானவை என்றும், உங்களுக்கு 18 வயது நிரம்பியுள்ளது அல்லது பாதுகாவலரின் ஒப்புதலுடன் ஆர்டர் செய்கிறீர்கள் என்றும் உறுதிப்படுத்துகிறீர்கள்."],
      ["விலை மற்றும் இருப்பு", "விலைகள் இந்திய ரூபாயில் காட்டப்படுகின்றன; முன்னறிவிப்பின்றி மாறலாம். இருப்பு இருந்தால் மட்டுமே ஆர்டர் உறுதி செய்யப்படும்; UPI ஆர்டர்களுக்கு கட்டணம் சரிபார்க்கப்பட்ட பின் உறுதியாகும்."],
      ["கட்டணங்கள்", "கேஷ் ஆன் டெலிவரி மற்றும் UPI QR கட்டணங்களை ஏற்கிறோம். UPI ஆர்டர்களுக்கு வெற்றிகரமான பரிவர்த்தனையின் தெளிவான ஸ்கிரீன்ஷாட்டை பதிவேற்ற வேண்டும். கட்டணம் நிராகரிக்கப்பட்டால் ஆர்டர் ரத்து செய்யப்படும்."],
      ["டெலிவரி", "டெலிவரி நேரங்கள் மதிப்பீடுகளே. நீங்கள் வழங்கும் முகவரியில் ஆர்டரைப் பெற ஒருவர் இருப்பதை உறுதிசெய்யுங்கள்."],
      ["ரத்து மற்றும் திரும்பப் பெறுதல்", "அனுப்பப்படும் வரை என் ஆர்டர்கள் பக்கத்தில் ஆர்டரை ரத்து செய்யலாம். சேதமடைந்த அல்லது தவறான பொருட்களுக்கு டெலிவரி ஆன 48 மணி நேரத்திற்குள் தொடர்பு கொள்ளுங்கள்."],
      ["தொடர்பு", `இந்த விதிமுறைகள் குறித்த கேள்விகளுக்கு ${SITE.email} க்கு எழுதுங்கள்.`],
    ],
  },
  privacy: {
    en: [
      ["What we collect", "Your name, phone number, email, delivery addresses, order history and, for UPI payments, the payment screenshot you upload."],
      ["How we use it", "To create your account, deliver your orders, verify payments, provide support and send order updates."],
      ["Sharing", "We do not sell your data. Delivery details are shared only with the people who pack and deliver your order. Images are stored with our cloud image provider."],
      ["Security", "Passwords are stored encrypted and sessions use secure tokens. Keep your password private and log out on shared devices."],
      ["Your choices", "You can update your details from your profile at any time, or ask us to delete your account."],
      ["Contact", `Privacy questions? Write to ${SITE.email}.`],
    ],
    ta: [
      ["நாங்கள் சேகரிப்பவை", "உங்கள் பெயர், தொலைபேசி எண், மின்னஞ்சல், டெலிவரி முகவரிகள், ஆர்டர் வரலாறு மற்றும் UPI கட்டணங்களுக்கு நீங்கள் பதிவேற்றும் ஸ்கிரீன்ஷாட்."],
      ["எவ்வாறு பயன்படுத்துகிறோம்", "கணக்கை உருவாக்க, ஆர்டர்களை டெலிவரி செய்ய, கட்டணங்களைச் சரிபார்க்க, உதவி வழங்க மற்றும் ஆர்டர் தகவல்களை அனுப்ப."],
      ["பகிர்வு", "உங்கள் தரவை நாங்கள் விற்பதில்லை. உங்கள் ஆர்டரைப் பேக் செய்து டெலிவரி செய்பவர்களுடன் மட்டுமே டெலிவரி விவரங்கள் பகிரப்படும். படங்கள் எங்கள் கிளவுட் பட சேவையில் சேமிக்கப்படுகின்றன."],
      ["பாதுகாப்பு", "கடவுச்சொற்கள் குறியாக்கம் செய்யப்பட்டு சேமிக்கப்படும்; பாதுகாப்பான டோக்கன்கள் பயன்படுத்தப்படும். கடவுச்சொல்லை ரகசியமாக வைத்து, பொதுவான சாதனங்களில் வெளியேறுங்கள்."],
      ["உங்கள் தேர்வுகள்", "சுயவிவரப் பக்கத்தில் எப்போது வேண்டுமானாலும் விவரங்களைப் புதுப்பிக்கலாம் அல்லது கணக்கை நீக்கக் கோரலாம்."],
      ["தொடர்பு", `தனியுரிமை கேள்விகளுக்கு ${SITE.email} க்கு எழுதுங்கள்.`],
    ],
  },
};

function Legal({ kind, titleKey }) {
  const { t, lang } = useLang();
  return (
    <Wrap title={t(titleKey)}>
      <p className="mt-2 text-sm text-ink-faint">{t("legal.updated")}</p>
      <div className="mt-8 space-y-7">
        {legal[kind][lang].map(([h, p]) => (
          <section key={h}><h2 className="text-lg font-semibold">{h}</h2><p className="mt-2 leading-relaxed text-ink-soft">{p}</p></section>
        ))}
      </div>
    </Wrap>
  );
}
export const Terms = () => <Legal kind="terms" titleKey="terms.title" />;
export const Privacy = () => <Legal kind="privacy" titleKey="privacy.title" />;

export function NotFound() {
  const { t } = useLang();
  return (
    <div className="container-x py-16 text-center sm:py-24">
      <p className="text-6xl font-extrabold text-primary-600">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-secondary-700">{t("err.404")}</h1>
      <p className="mt-2 text-ink-soft">{t("err.404d")}</p>
      <Link to="/" className="btn-primary mt-6">{t("err.home")}</Link>
    </div>
  );
}
