import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BadgeCheck, ShieldCheck, Truck, Wallet, Phone, Mail, MapPin, Send, Check, Tag, Sparkles, Leaf, Droplets, HeartHandshake, Award, Star, Quote, Package, Users } from "lucide-react";
import { BrandAPI, CategoryAPI, ProductAPI, LeadAPI } from "../api/services";
import { errMsg } from "../api/client";
import { track } from "../hooks/useAnalytics";
import { useLang } from "../context/LangContext";
import { usePageMeta } from "../hooks/usePageMeta";
import ProductCard from "../components/common/ProductCard";
import { SafeImg, Spinner } from "../components/common/ui";
import { Reveal, CountUp, Tilt } from "../components/common/Motion";
import { Sprig, Sparkle, Flower, Steam, Arrow } from "../components/common/Doodles";
import { ART, SITE } from "../config/site";
import { RANGES, WHY, QUALITY_STEPS, JOURNEY, CUSTOMER_TYPES, ENQUIRY_TYPES, TESTIMONIALS, TRUST_ITEMS } from "../config/content";
import toast from "react-hot-toast";

/* ───────────────────────── HERO (floating tilted cards + hand-written notes) ───────────────────────── */
function FloatCard({ src, plate, rot, note, noteClass = "", className = "", depth = 10, delay = 0, noteTilt = "-rotate-6", children }) {
  return (
    <div className={`absolute ${className}`} style={{ translate: `calc(var(--mx,0) * ${depth}px) calc(var(--my,0) * ${depth}px)`, transition: "translate .35s ease-out" }}>
      <div className="group animate-floaty" style={{ "--r": rot, animationDelay: `${delay}s` }}>
        <div className={`${plate} relative overflow-hidden p-2.5 shadow-lift ring-1 ring-white/70 transition duration-500 group-hover:scale-105`} style={{ borderRadius: "2rem 1.2rem 2rem 1.2rem" }}>
          <div className="img-frame aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-white/50">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
          {children}
        </div>
        {note && <p className={`absolute font-script text-[1.35rem] font-bold leading-[1.05] text-secondary-700 ${noteTilt} ${noteClass}`}>{note}</p>}
      </div>
    </div>
  );
}

function Hero() {
  const { t } = useLang();
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const perks = [
    [Wallet, "home.perk1", "home.perk1d", "bg-peach"],
    [ShieldCheck, "home.perk2", "home.perk2d", "bg-sage"],
    [Truck, "home.perk3", "home.perk3d", "bg-butter"],
  ];
  return (
    <section ref={ref} onMouseMove={move} className="relative isolate overflow-hidden pb-6 pt-6 sm:pt-10">
      {/* decorative layer */}
      <Sprig className="pointer-events-none absolute -left-4 top-24 -z-10 h-44 w-28 -rotate-12 animate-sway text-secondary-500/35" />
      <Sprig className="pointer-events-none absolute right-[40%] top-4 -z-10 hidden h-28 w-16 rotate-[160deg] animate-sway text-secondary-500/25 lg:block" style={{ animationDelay: "1s" }} />
      <Flower className="pointer-events-none absolute right-6 top-[46%] -z-10 hidden h-14 w-14 animate-spinSlow text-primary-400/50 lg:block" />
      <Flower className="pointer-events-none absolute bottom-24 left-[7%] -z-10 hidden h-9 w-9 animate-spinSlow text-gold-400/70 lg:block" />
      <Sparkle className="pointer-events-none absolute left-[26%] top-16 hidden h-4 w-4 animate-twinkle text-gold-400 lg:block" />
      <Sparkle className="pointer-events-none absolute right-[27%] top-[55%] hidden h-5 w-5 animate-twinkle text-primary-400 lg:block" style={{ animationDelay: "1.2s" }} />
      <span className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 animate-blob rounded-full bg-primary-100/60 blur-3xl" />
      <span className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 rounded-t-[100%] bg-cream-deep/70" />

      <div className="container-x relative">
        {/* floating cards (desktop) */}
        <div className="pointer-events-none hidden xl:block [&>*]:pointer-events-auto">
          <FloatCard src={ART.oil} plate="bg-lilac" rot="-6deg" depth={16} className="left-0 top-2 w-[205px]" note={t("hero2.n1")} noteClass="-right-24 top-8 w-28" noteTilt="rotate-6">
            <Steam className="absolute -top-8 right-6 text-secondary-700/40" />
          </FloatCard>
          <FloatCard src={ART.coconut} plate="bg-sage" rot="5deg" depth={22} delay={1.2} className="-left-4 top-[330px] w-[180px]" note={t("hero2.n2")} noteClass="-bottom-12 left-6 w-40" />
          <FloatCard src={ART.lamp} plate="bg-butter" rot="6deg" depth={16} delay={.6} className="right-0 top-0 w-[205px]" note={t("hero2.n3")} noteClass="-left-24 top-10 w-24 text-right" noteTilt="-rotate-6" />
          <FloatCard src={ART.milk} plate="bg-blush" rot="-4deg" depth={24} delay={1.8} className="-right-3 top-[255px] w-[185px]" note={t("hero2.n4")} noteClass="-bottom-11 right-2 w-40 text-center" noteTilt="rotate-2" />
          <FloatCard src={ART.groundnut} plate="bg-peach" rot="7deg" depth={12} delay={2.4} className="right-[230px] top-[500px] hidden w-[120px] xl:block" note={t("hero2.n5")} noteClass="-bottom-11 -left-4 w-36 text-center" noteTilt="-rotate-3" />
        </div>

        {/* copy */}
        <div className="relative z-10 mx-auto flex min-h-[520px] max-w-[46rem] flex-col items-center justify-center py-8 text-center sm:min-h-[560px] lg:min-h-[600px] xl:min-h-[690px]">
          <p className="animate-rise inline-flex items-center gap-2 font-script text-xl font-bold leading-tight text-primary-600 sm:gap-3 sm:text-2xl">
            <span className="hidden h-px w-8 bg-primary-600/50 sm:block" /><Sparkles className="h-4 w-4 shrink-0 animate-twinkle text-gold-500" />{t("hero.kicker")}<Sparkles className="h-4 w-4 shrink-0 animate-twinkle text-gold-500" /><span className="hidden h-px w-8 bg-primary-600/50 sm:block" />
          </p>
          <h1 className="animate-rise mt-4 font-display text-[clamp(2.3rem,7.2vw,5.4rem)] font-bold leading-[1.02] tracking-tight text-secondary-700" style={{ animationDelay: ".12s" }}>
            {t("hero2.l1")}<br />
            <em className="font-semibold text-primary-600">{t("hero2.l2")}{" "}
              <span className="word-rotator -mb-[.22em] h-[1.25em] justify-items-start overflow-hidden align-bottom leading-[1.25]">
                <span>{t("hero.w1")}</span><span>{t("hero.w2")}</span><span>{t("hero.w3")}</span>
              </span>
            </em><br />
            <span className="squiggle">{t("hero2.l3")}</span>
          </h1>
          <p className="animate-rise mt-5 max-w-lg text-base font-medium leading-relaxed text-secondary-700 sm:text-lg" style={{ animationDelay: ".3s" }}>{t("hero.line")}</p>
          <p className="animate-rise mt-2 max-w-md text-xs text-ink-soft sm:text-sm" style={{ animationDelay: ".38s" }}>{t("hero.sub")}</p>
          <div className="animate-rise mt-9 flex w-full flex-col items-stretch justify-center gap-3 min-[420px]:w-auto min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center" style={{ animationDelay: ".48s" }}>
            <Link to="/products" className="btn relative overflow-hidden bg-primary-600 px-8 py-4 text-base font-bold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-[0_0_28px_rgba(163,28,30,.45)]">
              <span className="relative flex items-center gap-2">{t("hero.shop")} <ArrowRight className="h-4 w-4" /></span>
            </Link>
            <Link to="/wholesale" className="btn border-2 border-secondary-700/50 bg-transparent px-7 py-3.5 text-[15px] font-semibold text-secondary-700 hover:-translate-y-0.5 hover:border-secondary-700 hover:bg-secondary-50">{t("hero.enquiry")}</Link>
          </div>
          <Arrow className="pointer-events-none absolute -bottom-2 left-[6%] hidden h-14 w-16 rotate-[-20deg] text-primary-600/70 xl:block" />
        </div>

        {/* floating cards (mobile / tablet) */}
        <div className="mx-auto -mt-2 grid max-w-md grid-cols-3 gap-3 sm:max-w-lg sm:gap-4 xl:hidden">
          {[[ART.oil, "bg-lilac", "-rotate-6"], [ART.lamp, "bg-butter", "rotate-3"], [ART.milk, "bg-blush", "rotate-6"]].map(([s, p, r], i) => (
            <div key={i} className={`${p} ${r} animate-floaty p-1.5 shadow-lift`} style={{ borderRadius: "1.4rem .8rem 1.4rem .8rem", animationDelay: `${i * .6}s`, "--r": r.includes("-") ? "-5deg" : "5deg" }}>
              <img src={s} alt="" className="aspect-[4/5] w-full rounded-[1rem] object-cover" />
            </div>
          ))}
        </div>

        {/* perk strip */}
        <div className="relative z-10 mx-auto mt-10 grid max-w-4xl gap-4 rounded-[2rem] border border-cream-sand/80 bg-white/70 p-4 shadow-card backdrop-blur md:grid-cols-3 md:gap-0 md:p-5">
          {perks.map(([Icon, a, b, bg], i) => (
            <Reveal key={a} delay={i * 120} className={`flex min-w-0 items-center gap-3.5 md:px-4 lg:px-5 ${i ? "md:border-l md:border-cream-sand" : ""}`}>
              <span className={`${bg} flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-primary-600 transition duration-500 hover:rotate-12 hover:scale-110`}><Icon className="h-5 w-5" /></span>
              <div><p className="font-display text-[15px] font-bold text-secondary-700">{t(a)}</p><p className="text-xs text-ink-soft">{t(b)}</p></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── ANNOUNCEMENT BAR (Seamless Infinite Ticker) ───────────────────────── */
function AnnouncementBar() {
  const { t } = useLang();
  // 4 distinct items repeated in 2 identical halves to fill any viewport width seamlessly
  const baseItems = ["ann.4", "ann.1", "ann.2", "ann.3"];
  const halfItems = [...baseItems, ...baseItems];

  return (
    <div className="relative overflow-hidden bg-secondary-800 py-2.5 shadow-inner">
      {/* Edge gradient masks for seamless fade in and out */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-secondary-800 to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-secondary-800 to-transparent sm:w-16" />

      <div className="animate-infinite-scroll">
        {/* First Half */}
        <div className="flex shrink-0 items-center gap-8 sm:gap-14 pr-8 sm:pr-14">
          {halfItems.map((k, idx) => (
            <span key={`set1-${idx}`} className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide text-white/95">
              <span>{t(k)}</span>
              <span className="text-primary-300 opacity-60">✦</span>
            </span>
          ))}
        </div>

        {/* Second Half (Exact clone of First Half so translateX(-50%) creates a 100% gapless loop) */}
        <div className="flex shrink-0 items-center gap-8 sm:gap-14 pr-8 sm:pr-14" aria-hidden="true">
          {halfItems.map((k, idx) => (
            <span key={`set2-${idx}`} className="flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold tracking-wide text-white/95">
              <span>{t(k)}</span>
              <span className="text-primary-300 opacity-60">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── HOW TO ORDER ───────────────────────── */
function HowToOrder() {
  const { t } = useLang();
  const steps = [
    { icon: Package, num: "01", title: "how.s1", desc: "how.s1d", bg: "bg-sage",  shape: "2.6rem .6rem 2.6rem .6rem" },
    { icon: Wallet,  num: "02", title: "how.s2", desc: "how.s2d", bg: "bg-peach", shape: ".6rem 2.6rem .6rem 2.6rem" },
    { icon: Truck,   num: "03", title: "how.s3", desc: "how.s3d", bg: "bg-butter",shape: "2.6rem .6rem 2.6rem .6rem" },
  ];
  return (
    <section className="container-x pt-16 sm:pt-24">
      <Reveal className="text-center">
        <p className="eyebrow">{t("how.kicker")}</p>
        <h2 className="h-section mt-2">{t("how.title")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink-soft">{t("how.sub")}</p>
      </Reveal>

      <div className="relative mt-10 grid gap-4 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        {/* connector line between steps (desktop) */}
        <span className="pointer-events-none absolute left-[22%] right-[22%] top-10 hidden h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 sm:block" />
        {steps.map(({ icon: Icon, num, title, desc, bg, shape }, i) => (
          <Reveal key={i} delay={i * 130} variant="zoom">
            <div className="group relative flex flex-col items-center gap-4 border border-cream-sand/70 bg-white p-6 text-center shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-lift" style={{ borderRadius: shape }}>
              {/* step badge */}
              <span className={`${bg} relative flex h-16 w-16 items-center justify-center text-primary-600 shadow-soft transition duration-500 group-hover:rotate-6 group-hover:scale-110`} style={{ borderRadius: shape }}>
                <Icon className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {num}
                </span>
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-secondary-700">{t(title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{t(desc)}</p>
              </div>
              {/* hover underline accent */}
              <span className="absolute inset-x-6 bottom-0 h-1 origin-left scale-x-0 rounded-t-full bg-primary-600 transition duration-500 group-hover:scale-x-100" />
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={400} className="mt-8 flex justify-center">
        <Link to="/products" className="btn-primary px-9 py-3.5 text-[15px] shadow-glow">
          {t("hero.shop")} <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── TRUST STRIP ───────────────────────── */
const TRUST_ICONS = { BadgeCheck, ShieldCheck, Award, MapPin, Truck };

function TrustStrip() {
  const { t } = useLang();
  const items = [
    { key: "trust.gst",        icon: "BadgeCheck"  },
    { key: "trust.fssai",      icon: "ShieldCheck" },
    { key: "trust.years",      icon: "Award"       },
    { key: "trust.kumbakonam", icon: "MapPin"       },
    { key: "trust.wholesale",  icon: "Truck"        },
  ];
  return (
    <div className="border-y border-cream-sand/70 bg-cream-deep/60 py-3 sm:py-4">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-8 lg:gap-x-10">
          {items.map(({ key, icon }) => {
            const Icon = TRUST_ICONS[icon];
            return (
              <div key={key} className="flex items-center gap-2 text-xs font-semibold text-secondary-700 sm:text-sm">
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary-600 sm:h-4 sm:w-4" />
                <span>{t(key)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── TESTIMONIALS (hidden when empty) ───────────────────────── */
function Testimonials() {
  const { t, tx } = useLang();
  if (!TESTIMONIALS || TESTIMONIALS.length === 0) return null;
  const plates = ["bg-sage", "bg-peach", "bg-butter", "bg-lilac", "bg-blush"];
  return (
    <section className="container-x pt-24 sm:pt-32">
      <Reveal className="text-center">
        <p className="eyebrow">{t("testi.kicker")}</p>
        <h2 className="h-section mt-2">{t("testi.title")}</h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {TESTIMONIALS.map((item, i) => (
          <Reveal key={i} delay={i * 100} variant="zoom">
            <div className={`relative h-full overflow-hidden border border-cream-sand/60 bg-white p-5 shadow-card sm:p-6 ${i % 2 ? "rounded-[.6rem_2.4rem_.6rem_2.4rem]" : "rounded-[2.4rem_.6rem_2.4rem_.6rem]"}`}>
              <Quote className="absolute right-5 top-4 h-8 w-8 text-primary-100" />
              <p className="relative text-sm leading-relaxed text-ink-soft">{tx(item.quote)}</p>
              <div className="mt-5 flex items-center gap-3">
                <span className={`${plates[i % 5]} flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-secondary-700`}>
                  {item.initials}
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-secondary-700">{item.name}</p>
                  <p className="text-xs text-ink-soft">{tx(item.role)}</p>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />)}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── PROMISE (bento in leaf/pebble shapes) ───────────────────────── */
function Bento() {
  const { t } = useLang();
  return (
    <section className="container-x pt-14 sm:pt-20">
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr] lg:gap-5">
        <Reveal variant="zoom" className="img-frame group relative min-h-[300px] overflow-hidden sm:min-h-[400px] lg:min-h-[480px]" style={{ borderRadius: "4rem .8rem 4rem .8rem" }}>
          <img src={ART.oilWide} alt="Jayam edible oils" className="absolute inset-0 h-full w-full object-cover object-right" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/55 to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-[85%] bg-cream p-5 pr-8 sm:max-w-none sm:p-7 sm:pr-14" style={{ borderTopRightRadius: "2.5rem" }}>
            <span className="font-script text-2xl font-bold text-primary-600">{t("bento.tag")}</span>
            <h2 className="mt-1 font-display text-[2rem] font-bold leading-[1.02] text-secondary-700 sm:text-6xl">{t("bento.big1")}<br /><em className="font-semibold text-primary-600">{t("bento.big2")}</em></h2>
          </div>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:gap-5">
          <Reveal delay={120} className="relative flex flex-col justify-between overflow-hidden bg-sage p-6 sm:p-7" style={{ borderRadius: ".8rem 3rem .8rem 3rem" }}>
            <Sprig className="absolute -right-3 -top-3 h-28 w-16 rotate-[20deg] animate-sway text-secondary-600/40" />
            <span className="font-script text-2xl font-bold text-primary-600">{t("bento.tag2")}</span>
            <div className="mt-8">
              <p className="text-xs text-ink-soft">{t("bento.small")}</p>
              <h3 className="mt-1 font-display text-3xl font-bold leading-tight text-secondary-700 sm:text-4xl">{t("bento.t2a")}<br /><em className="font-semibold">{t("bento.t2b")}</em></h3>
            </div>
          </Reveal>
          <Reveal delay={240} className="img-frame group relative min-h-[240px] overflow-hidden" style={{ borderRadius: "3rem .8rem 3rem .8rem" }}>
            <img src={ART.lamp} alt="Deepam oil" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 to-transparent" />
            <span className="absolute left-5 top-4 -rotate-3 font-script text-3xl font-bold text-white drop-shadow">{t("bento.tag3")}</span>
            <p className="absolute bottom-5 left-5 max-w-[10rem] text-sm text-white/90">{t("bento.small3")}</p>
            <Link to="/products" className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-600 shadow-lift transition duration-500 group-hover:rotate-45 group-hover:bg-primary-600 group-hover:text-white"><ArrowUpRight className="h-5 w-5" /></Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── STATS (Premium Customer-Focused Modern Cards) ───────────────────────── */
function Stats() {
  const { t } = useLang();
  const years = new Date().getFullYear() - 1995;

  const data = [
    {
      num: years,
      suffix: "+",
      label: "stat.years",
      sub: "stat.yearsSub",
      icon: Award,
      badge: "Legacy",
      color: "from-amber-500/15 via-gold-400/10 to-transparent",
      accent: "text-amber-600 bg-amber-50 border-amber-200/60",
      glow: "hover:shadow-amber-500/10",
      barColor: "bg-amber-500",
    },
    {
      num: 4,
      suffix: "",
      label: "stat.ranges",
      sub: "stat.rangesSub",
      icon: Droplets,
      badge: "Curated",
      color: "from-primary-600/15 via-primary-500/10 to-transparent",
      accent: "text-primary-600 bg-primary-50 border-primary-200/60",
      glow: "hover:shadow-primary-600/10",
      barColor: "bg-primary-600",
    },
    {
      num: 25000,
      suffix: "+",
      label: "stat.products",
      sub: "stat.productsSub",
      icon: Users,
      badge: "Community",
      color: "from-secondary-600/15 via-emerald-500/10 to-transparent",
      accent: "text-secondary-600 bg-secondary-50 border-secondary-200/60",
      glow: "hover:shadow-secondary-600/10",
      barColor: "bg-secondary-600",
      format: (n) => n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n,
    },
    {
      num: 100,
      suffix: "%",
      label: "stat.checks",
      sub: "stat.checksSub",
      icon: ShieldCheck,
      badge: "Certified",
      color: "from-blue-600/15 via-indigo-500/10 to-transparent",
      accent: "text-blue-600 bg-blue-50 border-blue-200/60",
      glow: "hover:shadow-blue-600/10",
      barColor: "bg-blue-600",
    },
  ];

  return (
    <section className="container-x py-14 sm:py-20">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {data.map((item, i) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.label} delay={i * 100} variant="zoom">
              <div
                className={`group relative overflow-hidden rounded-3xl border border-cream-sand/80 bg-gradient-to-b from-white via-white to-cream-deep/30 p-6 sm:p-7 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${item.glow}`}
              >
                {/* Ambient dynamic background gradient glow */}
                <div
                  className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${item.color} blur-2xl transition-opacity duration-700 group-hover:scale-150 group-hover:opacity-100`}
                />

                {/* Top header row: Icon + Customer-centric status tag */}
                <div className="relative flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${item.accent}`}>
                    <Icon className="h-6 w-6 stroke-[2.2]" />
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-700/10 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-secondary-700/80 shadow-xs backdrop-blur-sm">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.barColor} animate-pulse`} />
                    {item.badge}
                  </span>
                </div>

                {/* Metric value with smooth count-up animation */}
                <div className="relative mt-6">
                  <div className="flex items-baseline font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-secondary-850">
                    <CountUp to={item.num} suffix={item.suffix} format={item.format} duration={1800} />
                  </div>
                  <h3 className="mt-2 text-base font-bold text-secondary-800 tracking-tight sm:text-lg">
                    {t(item.label)}
                  </h3>
                  <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                    {t(item.sub)}
                  </p>
                </div>

                {/* Subtle bottom accent highlight bar on hover */}
                <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-cream-sand/40">
                  <div className={`h-full w-full ${item.barColor} origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100`} />
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ───────────────────────── STORY ───────────────────────── */
function Story() {
  const { t } = useLang();
  return (
    <section id="about" className="container-x">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <Reveal variant="from-left" className="relative mx-auto w-full max-w-md lg:max-w-none">
          <span className="absolute -left-3 -top-3 h-full w-full rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-primary-100 animate-morph sm:-left-6 sm:-top-6" />
          <div className="img-frame relative aspect-[4/4.6] overflow-hidden shadow-lift ring-8 ring-white shape-arch">
            <img src={ART.groundnut} alt="Groundnut" className="h-full w-full object-cover" />
          </div>
          {/* rotating stamp */}
          <div className="absolute -bottom-6 right-0 flex h-28 w-28 items-center justify-center sm:-right-6 sm:h-36 sm:w-36">
            <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spinSlow">
              <defs><path id="circ" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
              <circle cx="100" cy="100" r="98" fill="#a31c1e" />
              <text fill="#fdf3dc" fontSize="14" fontWeight="700"><textPath href="#circ" textLength="480" lengthAdjust="spacing">QUALITY • VALUE • FRESHNESS • TRUST •</textPath></text>
            </svg>
            <span className="relative text-center text-white"><span className="block font-display text-2xl font-bold leading-none sm:text-3xl">1995</span><span className="font-script text-lg text-gold-300">Kumbakonam</span></span>
          </div>
        </Reveal>
        <Reveal variant="from-right">
          <p className="eyebrow">{t("story.kicker")} · {t("story.kicker2")}</p>
          <h2 className="h-section mt-3">{t("story.h1")}<br /><em className="font-semibold text-primary-600">{t("story.h2")}</em></h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft sm:text-base">
            <p>{t("story.a1")}</p><p>{t("story.a2")}</p><p>{t("story.a3")}</p>
          </div>
          <a href="#journey" className="btn-dark mt-8 px-7 py-3">{t("story.btn")} <ArrowRight className="h-4 w-4" /></a>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── PRODUCT RANGES (varied silhouettes) ───────────────────────── */
function Ranges({ onEnquire }) {
  const { t, tx } = useLang();
  const h = ["lg:row-span-2", "", "", ""];
  const radius = ["999px 999px 2rem 2rem", "2.8rem .6rem 2.8rem .6rem", ".6rem 2.8rem .6rem 2.8rem", "2.8rem 2.8rem 2.8rem .6rem"];
  return (
    <section id="products" className="container-x pt-24 sm:pt-32">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <Reveal><h2 className="h-section max-w-xl">{t("rng.h1")}<br /><em className="font-semibold text-primary-600">{t("rng.h2")}</em></h2></Reveal>
        <Reveal delay={120} className="flex max-w-md flex-col gap-4 lg:items-end lg:text-right">
          <p className="text-sm text-ink-soft">{t("rng.sub")}</p>
          <Link to="/products" className="btn-dark w-fit px-6">{t("common.viewAll")} <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
      </div>

      <div className="mt-10 grid auto-rows-[260px] gap-4 sm:auto-rows-[300px] sm:grid-cols-2 lg:auto-rows-[290px] lg:grid-cols-3 lg:gap-5">
        {RANGES.map((r, i) => (
          <Reveal key={r.id} delay={i * 100} variant="zoom" className={h[i]}>
            <div className="img-frame group relative h-full overflow-hidden shadow-card transition-all duration-700 hover:shadow-lift" style={{ borderRadius: radius[i % 4] }}>
              <img src={ART[r.art]} alt={tx(r.title)} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-secondary-900/10 to-transparent transition group-hover:from-primary-900/90" />
              <span className="absolute left-6 top-5 font-script text-2xl font-bold text-white/90">{r.no}</span>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <div className="flex items-end justify-between gap-3">
                  <h3 className="min-w-0 font-display text-xl font-bold text-white sm:text-2xl">{tx(r.title)}</h3>
                  <a href="#enquiry" onClick={() => onEnquire(r.enquiry)} aria-label={`Enquire about ${tx(r.title)}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary-600 transition duration-500 group-hover:rotate-45 group-hover:bg-gold-400 group-hover:text-secondary-800"><ArrowUpRight className="h-5 w-5" /></a>
                </div>
                <div className="grid grid-rows-[0fr] transition-all duration-500 group-hover:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="mt-2 text-xs text-white/85">{tx(r.text)}</p>
                    <ul className="mt-2 space-y-0.5 text-xs text-white/90">
                      {(tx(r.items) || []).slice(0, 4).map((x) => <li key={x} className="flex gap-1.5"><Check className="mt-0.5 h-3 w-3 shrink-0 text-gold-400" />{x}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
        {/* message tile */}
        <Reveal delay={400} className="relative flex flex-col justify-between overflow-hidden bg-primary-600 p-6 text-white sm:col-span-2 sm:p-7 lg:col-span-1" style={{ borderRadius: ".6rem 3rem .6rem 3rem" }}>
          <div className="stripe-bg absolute inset-0" />
          <Sprig className="absolute -right-2 bottom-0 h-32 w-20 rotate-12 animate-sway text-white/30" />
          <span className="relative font-script text-2xl font-bold text-gold-300">{t("rng.msgKicker")}</span>
          <div className="relative">
            <h3 className="font-display text-2xl font-semibold leading-snug">{t("rng.msgTitle")}</h3>
            <a href="#enquiry" onClick={() => onEnquire("General Enquiry")} className="btn-gold mt-4">{t("rng.msgBtn")}</a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── LIVE SHOP (API data) ───────────────────────── */
function BrandMarquee({ brands }) {
  const { t } = useLang();
  if (!brands.length) return null;
  const reps = Math.max(1, Math.ceil(10 / brands.length));
  const row = Array.from({ length: reps }).flatMap(() => brands);
  const loop = [...row, ...row];
  return (
    <section className="mt-8 sm:mt-12 bg-cream-deep/70 py-6 sm:py-8" style={{ borderRadius: "3rem 3rem 0 0 / 1.6rem 1.6rem 0 0" }}>
      <p className="mb-4 text-center font-script text-3xl font-bold text-primary-600">{t("home.brands")}</p>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="marquee-track flex w-max animate-marquee items-center gap-14">
          {loop.map((b, i) => (
            <div key={i} className="flex h-14 w-32 shrink-0 items-center justify-center" title={b.name}>
              {b.image ? <img src={b.image} alt={b.name} className="max-h-12 max-w-full object-contain opacity-95 transition-transform duration-300 hover:scale-110 active:scale-110" />
                : <span className="font-display text-lg font-bold text-secondary-700">{b.name}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Shop({ data }) {
  const { t } = useLang();
  const plates = ["bg-sage", "bg-peach", "bg-butter", "bg-lilac", "bg-blush", "bg-sage"];
  return (
    <>
      {data.categories.length > 0 && (
        <section id="categories" className="container-x pt-24">
          <Reveal className="text-center"><p className="eyebrow">{t("home.categories")}</p><span className="mx-auto mt-2 block h-1 w-16 rounded-full bg-gold-400" /></Reveal>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 px-2 sm:grid-cols-3 sm:px-0 lg:grid-cols-6 lg:gap-x-4">
            {data.categories.map((c, i) => (
              <Reveal key={c._id} delay={i * 70} variant="zoom">
                <Link to={`/products?category=${c._id}`} className="group block text-center">
                  <div className="relative mx-auto aspect-square w-full max-w-[170px]">
                    <span className="absolute -inset-2 rounded-full border-2 border-dashed border-primary-400/50 transition duration-700 group-hover:rotate-90 group-hover:border-primary-600" />
                    <div className={`img-frame relative h-full w-full overflow-hidden rounded-full ${plates[i % 6]} shadow-soft ring-4 ring-white transition duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift`}>
                      <SafeImg src={c.image} alt={c.name} className="h-full w-full object-cover" fallback={<Tag className="h-8 w-8" />} />
                    </div>
                  </div>
                  <p className="mt-4 font-display text-sm font-bold text-secondary-700 transition group-hover:text-primary-600 sm:text-[15px]">{c.name}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {data.products.length > 0 && (
        <section className="container-x pt-24">
          <div className="flex items-end justify-between gap-4">
            <Reveal>
              <p className="eyebrow">{t("hero.kicker")}</p>
              <h2 className="h-section mt-1">{t("home.featured")}</h2>
              <p className="mt-2 text-sm text-ink-soft">{t("home.featuredSub")}</p>
            </Reveal>
            <Link to="/products" className="btn-outline hidden px-6 sm:inline-flex">{t("common.viewAll")} <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {data.products.slice(0, 4).map((p, i) => <Reveal key={p._id} delay={i * 90} className={i % 2 ? "lg:translate-y-6" : ""}><ProductCard product={p} index={i} /></Reveal>)}
          </div>
          <Link to="/products" className="btn-outline mt-8 w-full sm:hidden">{t("common.viewAll")}</Link>
        </section>
      )}
    </>
  );
}

/* ───────────────────────── WHY ───────────────────────── */
function Why() {
  const { t, tx } = useLang();
  const icons = [Leaf, BadgeCheck, HeartHandshake, Droplets, ShieldCheck, Truck];
  const plates = ["bg-sage", "bg-peach", "bg-butter", "bg-lilac", "bg-blush", "bg-sage"];
  const shapes = ["2.6rem .6rem 2.6rem .6rem", ".6rem 2.6rem .6rem 2.6rem"];
  return (
    <section className="container-x pt-24 sm:pt-32">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{t("why.kicker")}</p>
        <h2 className="h-section mt-2">{t("why.h1")}<br /><em className="font-semibold text-primary-600">{t("why.h2")}</em></h2>
        <p className="mt-4 text-ink-soft">{t("why.sub")}</p>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {WHY.map((item, i) => {
          const title = tx(item.title);
          const text = tx(item.text);
          const Icon = icons[i % icons.length];
          return (
            <Reveal key={i} delay={(i % 3) * 100}>
              <Tilt className={`group relative h-full overflow-hidden border border-cream-sand/70 bg-white p-5 shadow-card sm:p-6 hover:shadow-lift ${i % 2 ? "rounded-[.6rem_2.4rem_.6rem_2.4rem]" : "rounded-[2.4rem_.6rem_2.4rem_.6rem]"}`}>
                <div className="absolute inset-0 -z-0 opacity-0 transition duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(circle at 100% 0, rgba(223,168,57,.18), transparent 55%)" }} />
                <span className={`${plates[i % 6]} relative flex h-14 w-14 items-center justify-center text-primary-600 transition duration-500 group-hover:rotate-6 group-hover:scale-110`} style={{ borderRadius: shapes[i % 2].split(" ").reverse().join(" ") }}><Icon className="h-6 w-6" /></span>
                <h3 className="relative mt-5 font-display text-xl font-bold text-secondary-700">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-ink-soft">{text}</p>
                <span className="absolute inset-x-6 bottom-0 h-1 origin-left scale-x-0 rounded-t-full bg-primary-600 transition duration-500 group-hover:scale-x-100" />
              </Tilt>
            </Reveal>
          );
        })}
      </div>
      <Reveal variant="zoom" className="relative mt-5 overflow-hidden bg-secondary-700 px-5 py-10 text-center text-white sm:px-6 sm:py-16" style={{ borderRadius: "3.5rem .8rem 3.5rem .8rem" }}>
        <div className="pointer-events-none absolute -left-20 top-0 h-60 w-60 animate-blob rounded-full bg-primary-600/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-60 w-60 animate-blob rounded-full bg-gold-500/25 blur-3xl" />
        <Sprig className="absolute left-4 top-3 h-24 w-14 -rotate-12 animate-sway text-white/20" />
        <Sprig className="absolute bottom-3 right-6 h-24 w-14 rotate-[25deg] animate-sway text-white/20" />
        <p className="relative font-script text-3xl font-bold text-gold-300">{t("why.promise")}</p>
        <h3 className="relative mt-2 font-display text-[1.65rem] font-semibold leading-tight sm:text-5xl">{t("bento.small")}</h3>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── QUALITY ───────────────────────── */
function Quality() {
  const { t, tx } = useLang();
  return (
    <section id="quality" className="mt-20 bg-sage/60 py-16 sm:mt-32 sm:py-28" style={{ borderRadius: "4rem 4rem 0 0 / 2rem 2rem 0 0" }}>
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <Reveal variant="from-left" className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{t("q.kicker")}</p>
          <h2 className="h-section mt-2">{t("q.h")}</h2>
          <p className="mt-4 text-ink-soft">{t("q.sub")}</p>
          <div className="img-frame group relative mt-8 aspect-[16/10] overflow-hidden shadow-lift" style={{ borderRadius: "3rem .7rem 3rem .7rem" }}>
            <img src={ART.coconut} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
              {QUALITY_STEPS.slice(0, 4).map((p, idx) => <span key={idx} className="pill !border-white/30 !bg-white/20 !text-white"><Check className="h-3 w-3" />{tx(p.title)}</span>)}
            </div>
          </div>
          <div className="card mt-5 flex gap-4 p-4 sm:p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-700 text-gold-300"><ShieldCheck className="h-6 w-6" /></span>
            <div>
              <p className="font-script text-xl font-bold text-primary-600">{t("q.compKicker")}</p>
              <p className="font-display text-lg font-bold leading-snug text-secondary-700">{t("q.compTitle")}</p>
              <p className="mt-1 text-sm text-ink-soft">{t("q.compText")}</p>
            </div>
          </div>
        </Reveal>

        <div className="relative space-y-4 before:absolute before:bottom-6 before:left-[23px] sm:before:left-[27px] before:top-6 before:w-0.5 before:bg-gradient-to-b before:from-primary-600 before:to-transparent">
          {QUALITY_STEPS.map((step, i) => (
            <Reveal key={i} delay={60} variant="from-right">
              <div className="card card-hover group relative flex gap-4 p-4 sm:gap-5 sm:p-5">
                <span className="relative z-10 flex h-12 w-12 shrink-0 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary-600 font-display text-lg font-bold text-white shadow-glow transition duration-500 group-hover:rotate-[360deg]">{String(i + 1).padStart(2, "0")}</span>
                <div className="pt-1"><h3 className="font-display text-lg font-bold text-secondary-700">{tx(step.title)}</h3><p className="mt-1 text-sm text-ink-soft">{tx(step.text)}</p></div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── JOURNEY ───────────────────────── */
function Journey() {
  const { t, tx } = useLang();
  return (
    <section id="journey" className="container-x pt-24 sm:pt-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{t("j.kicker")}</p>
        <h2 className="h-section mt-2">{t("j.h")}</h2>
        <p className="mt-4 text-ink-soft">{t("j.sub")}</p>
      </Reveal>
      <div className="relative mt-14 space-y-10 before:absolute before:bottom-0 before:left-5 before:top-0 before:w-0.5 before:border-l-2 before:border-dashed before:border-primary-400/50 lg:space-y-16 lg:before:left-1/2">
        {JOURNEY.map((j, i) => (
          <div key={j.year} className="relative grid items-center gap-5 pl-11 sm:gap-6 sm:pl-14 lg:grid-cols-2 lg:gap-20 lg:pl-0">
            <span className="absolute left-[11px] top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full border-4 border-cream bg-primary-600 shadow-glow lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"><span className="absolute inset-0 animate-ping rounded-full bg-primary-600/40" /></span>
            <Reveal variant={i % 2 ? "from-right" : "from-left"} className={i % 2 ? "lg:order-2" : ""}>
              <div className="img-frame group relative aspect-[16/10] overflow-hidden shadow-lift" style={{ borderRadius: i % 2 ? ".7rem 3.5rem .7rem 3.5rem" : "3.5rem .7rem 3.5rem .7rem" }}>
                <img src={ART[j.art]} alt={tx(j.title)} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/35 to-transparent" />
                <span className="absolute left-5 top-3 font-display text-5xl font-bold text-white drop-shadow-lg sm:left-6 sm:text-7xl">{j.year}</span>
              </div>
            </Reveal>
            <Reveal variant={i % 2 ? "from-left" : "from-right"} delay={100}>
              <h3 className="font-display text-2xl font-bold text-secondary-700 sm:text-3xl">{tx(j.title)}</h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft sm:text-base">{(tx(j.text) || []).map((p, idx) => <p key={idx}>{p}</p>)}</div>
            </Reveal>
          </div>
        ))}
      </div>
      <Reveal variant="zoom" className="relative mt-16 overflow-hidden bg-primary-600 px-5 py-9 text-center text-white sm:p-12" style={{ borderRadius: "3.5rem .8rem 3.5rem .8rem" }}>
        <div className="stripe-bg absolute inset-0" />
        <Sparkle className="absolute left-8 top-6 h-5 w-5 animate-twinkle text-gold-300" />
        <Sparkle className="absolute bottom-6 right-10 h-4 w-4 animate-twinkle text-gold-300" style={{ animationDelay: "1s" }} />
        <h3 className="relative font-display text-[1.65rem] font-semibold leading-tight sm:text-4xl">{t("j.bottom1")} <em className="text-gold-300">{t("j.bottom2")}</em></h3>
        <p className="relative mx-auto mt-3 max-w-xl text-sm text-white/85">{t("j.bottomText")}</p>
      </Reveal>
    </section>
  );
}

/* ───────────────────────── ENQUIRY → WhatsApp ───────────────────────── */
function Enquiry({ product, setProduct }) {
  const { t, tx, lang } = useLang();
  const [f, setF] = useState({ name: "", company: "", phone: "", email: "", ctype: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(f.phone.replace(/[\s\-()]/g, ""))) {
      toast.error(lang === "ta" ? "சரியான 10 இலக்க தொலைபேசி எண் தேவை" : "Enter a valid 10-digit phone number");
      return;
    }
    setBusy(true);
    try {
      // 1. Save to database first
      await LeadAPI.submit({
        name: f.name.trim(),
        company: f.company.trim(),
        phone: f.phone.trim(),
        email: f.email.trim(),
        productInterest: product ? [product] : [],
        message: f.message.trim(),
        source: "homepage_enquiry",
      });
      track("homepage_enquiry", { productInterest: product ? [product] : [] });
      setDone(true);
      // 2. Then open WhatsApp (optional — after persistence is confirmed)
      const msg =
        `*New Business Enquiry - Jayamangala Agro Foods*\n\n*Name:* ${f.name.trim()}\n*Company / Business:* ${f.company.trim() || "Not provided"}\n` +
        `*Phone:* ${f.phone.trim()}\n*Email:* ${f.email.trim() || "Not provided"}\n*Customer Type:* ${f.ctype}\n*Product / Enquiry:* ${product}\n*Message:*\n${f.message.trim() || "No message provided"}`;
      window.open(`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(errMsg(err) || (lang === "ta" ? "சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்." : "Submission failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const detail = (Icon, label, value, href) => (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold-400"><Icon className="h-5 w-5" /></span>
      <div className="min-w-0"><p className="font-script text-xl leading-none text-gold-300">{label}</p>
        {href ? <a href={href} className="wrap-anywhere text-sm font-medium hover:text-gold-400">{value}</a> : <p className="text-sm font-medium">{value}</p>}</div>
    </div>
  );

  return (
    <section id="enquiry" className="container-x pt-24 sm:pt-32">
      <div className="grid overflow-hidden bg-white shadow-lift lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" style={{ borderRadius: "2.5rem .8rem 2.5rem .8rem" }}>
        <Reveal variant="from-left" className="relative min-w-0 overflow-hidden bg-secondary-700 p-6 text-white sm:p-10">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 animate-blob rounded-full bg-primary-600/40 blur-3xl" />
          <Sprig className="absolute -bottom-2 right-3 h-36 w-20 rotate-[10deg] animate-sway text-white/15" />
          <div className="relative">
            <p className="font-script text-3xl font-bold text-gold-300">{t("enq.kicker")}</p>
            <h2 className="mt-1 font-display text-[2rem] font-semibold leading-[1.05] sm:text-5xl">{t("enq.h1")}<br /><em>{t("enq.h2")}</em></h2>
            <p className="mt-4 text-sm text-white/70">{t("enq.sub")}</p>
            <div className="mt-8 space-y-5">
              {detail(Phone, lang === "ta" ? "தொலைபேசி" : "Phone", SITE.phone, `tel:${SITE.phone.replace(/\s/g, "")}`)}
              {detail(Mail, lang === "ta" ? "மின்னஞ்சல்" : "Email", SITE.email, `mailto:${SITE.email}`)}
              {detail(MapPin, lang === "ta" ? "இருப்பிடம்" : "Location", SITE.address)}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { en: "Retail", ta: "சில்லறை" },
                { en: "Wholesale", ta: "மொத்த விற்பனை" },
                { en: "Distribution", ta: "விநியோகம்" },
                { en: "Institutional Supply", ta: "நிறுவன விநியோகம்" }
              ].map((x) => <span key={x.en} className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/85 transition hover:bg-white/10">{tx(x)}</span>)}
            </div>
          </div>
        </Reveal>

        <Reveal variant="from-right" className="min-w-0 p-5 sm:p-10">
          <h3 className="font-display text-2xl font-bold text-secondary-700">{t("enq.formTitle")}</h3>
          <p className="mt-1 text-sm text-ink-soft">{t("enq.formSub")}</p>
          {done ? (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-secondary-50 p-8 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-700 text-white">
                <Check className="h-7 w-7" />
              </span>
              <p className="font-display text-xl font-bold text-secondary-700">
                {lang === "ta" ? "நன்றி! உங்கள் விசாரணை பதிவு செய்யப்பட்டது." : "Thank you! Your enquiry has been received."}
              </p>
              <p className="text-sm text-ink-soft">
                {lang === "ta" ? "நாங்கள் விரைவில் தொடர்பு கொள்வோம்." : "We'll get back to you shortly."}
              </p>
              <button className="btn-outline mt-2" onClick={() => { setDone(false); setF({ name: "", company: "", phone: "", email: "", ctype: "", message: "" }); setProduct(""); }}>
                {lang === "ta" ? "மற்றொரு விசாரணை" : "Submit another enquiry"}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div><label className="label">{lang === "ta" ? "பெயர் *" : "Name *"}</label><input className="input" required maxLength={100} value={f.name} onChange={set("name")} placeholder={lang === "ta" ? "உங்கள் பெயர்" : "Your Name"} /></div>
              <div><label className="label">{lang === "ta" ? "நிறுவனம் / வணிகம்" : "Company / Business"}</label><input className="input" maxLength={150} value={f.company} onChange={set("company")} placeholder={lang === "ta" ? "நிறுவனத்தின் பெயர்" : "Company Name"} /></div>
              <div><label className="label">{lang === "ta" ? "தொலைபேசி *" : "Phone *"}</label><input className="input" type="tel" required inputMode="numeric" maxLength={15} value={f.phone} onChange={set("phone")} placeholder={lang === "ta" ? "உங்கள் தொலைபேசி எண்" : "Your Phone Number"} /></div>
              <div><label className="label">{lang === "ta" ? "மின்னஞ்சல்" : "Email"}</label><input className="input" type="email" maxLength={200} value={f.email} onChange={set("email")} placeholder={lang === "ta" ? "உங்கள் மின்னஞ்சல்" : "Your Email"} /></div>
              <div><label className="label">{lang === "ta" ? "வாடிக்கையாளர் வகை *" : "Customer Type *"}</label>
                <select className="input" required value={f.ctype} onChange={set("ctype")}><option value="">{lang === "ta" ? "வாடிக்கையாளர் வகையைத் தேர்ந்தெடுக்கவும்" : "Select Customer Type"}</option>{CUSTOMER_TYPES.map((x) => <option key={x.en} value={x.en}>{tx(x)}</option>)}</select></div>
              <div><label className="label">{lang === "ta" ? "பொருள் / விசாரணை *" : "Product / Enquiry *"}</label>
                <select className="input" required value={product} onChange={(e) => setProduct(e.target.value)}><option value="">{lang === "ta" ? "விசாரணையைத் தேர்ந்தெடுக்கவும்" : "Select Enquiry"}</option>{ENQUIRY_TYPES.map((x) => <option key={x.en} value={x.en}>{tx(x)}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="label">{lang === "ta" ? "செய்தி" : "Message"}</label><textarea className="input min-h-[110px]" maxLength={2000} value={f.message} onChange={set("message")} placeholder={lang === "ta" ? "நாங்கள் உங்களுக்கு எவ்வாறு உதவலாம் என்பதைத் தெரிவிக்கவும்..." : "Tell us how we can help..."} /></div>
              <button className="btn-primary py-3.5 sm:col-span-2" disabled={busy}>
                {busy ? <><Spinner className="h-4 w-4 !text-white" />{lang === "ta" ? "அனுப்புகிறது…" : "Sending…"}</> : <><Send className="h-4 w-4" /> {t("enq.send")}</>}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */
export default function Home() {
  const [data, setData] = useState({ brands: [], categories: [], products: [] });
  const [enquiry, setEnquiry] = useState("");
  usePageMeta(
    "Jayamangala Agro Foods | Quality Edible Oils & Food Products – Kumbakonam",
    "Buy quality edible oils, milk products and everyday food essentials online. Serving Kumbakonam and Tamil Nadu since 1995. Retail & wholesale available."
  );

  useEffect(() => {
    void (async () => {
      try {
        const [b, c, p] = await Promise.all([BrandAPI.list(), CategoryAPI.list(), ProductAPI.list({ status: "Active", limit: 4, page: 1 })]);
        setData({
          brands: (b.data || []).filter((x) => x.status !== "Inactive"),
          categories: (c.data || []).filter((x) => x.status !== "Inactive"),
          products: p.data || [],
        });
      } catch { /* backend offline: static content still renders */ }
    })();
  }, []);

  return (
    <div className="w-full max-w-[100vw] overflow-x-clip">
      <AnnouncementBar />
      <Hero />
      <TrustStrip />
      <Shop data={data} />
      <HowToOrder />
      <Bento />
      <Stats />
      <Story />
      <Ranges onEnquire={setEnquiry} />
      <BrandMarquee brands={data.brands} />
      <Why />
      <Quality />
      <Journey />
      <Testimonials />
      <Enquiry product={enquiry} setProduct={setEnquiry} />
    </div>
  );
}
