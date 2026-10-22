import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight, MessageCircle, Heart } from "lucide-react";
import { SITE } from "../config/site";
import { useLang } from "../context/LangContext";
import { Reveal } from "../components/common/Motion";
import { Sprig, Sparkle, Flower } from "../components/common/Doodles";

export default function Footer() {
  const { t, lang } = useLang();
  const a = "group inline-flex items-center gap-1 text-white/70 transition hover:translate-x-1 hover:text-gold-400";
  const h = "mb-4 font-display text-lg font-bold text-white";
  const ticker = [
    t("ft.ticker1"), t("ft.ticker2"), t("ft.ticker3"), t("ft.ticker4"), t("ft.ticker5"), t("ft.ticker6")
  ];
  return (
    <footer className="relative mt-24">
      {/* ───── red CTA banner (AI Studio "Let's create something delicious together") ───── */}
      <div className="container-x relative z-10 -mb-14 sm:-mb-16">
        <Reveal variant="zoom" className="relative isolate overflow-hidden bg-primary-600 px-5 py-9 text-center text-white shadow-lift sm:px-12 sm:py-14" style={{ borderRadius: "3rem .8rem 3rem .8rem" }}>
          <div className="stripe-bg absolute inset-0 -z-10" />
          <Sprig className="absolute -left-2 bottom-0 -z-0 h-40 w-24 -rotate-12 animate-sway text-white/40 sm:h-52" />
          <Sprig className="absolute -right-1 top-2 h-36 w-20 rotate-[24deg] animate-sway text-white/40 sm:h-48" style={{ animationDelay: "1.5s" }} />
          <Sparkle className="absolute left-[18%] top-6 h-5 w-5 animate-twinkle text-gold-300" />
          <Sparkle className="absolute bottom-8 right-[20%] h-4 w-4 animate-twinkle text-gold-300" style={{ animationDelay: "1s" }} />
          <p className="font-script text-2xl text-gold-300 sm:text-3xl">{t("ft.cta.kicker")}</p>
          <h2 className="mx-auto mt-1 max-w-3xl font-display text-[1.7rem] font-semibold leading-tight sm:text-5xl">
            {t("ft.cta.title1")} <em className="font-semibold italic text-gold-300">{t("ft.cta.title2")}</em>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/80">{t("ft.cta.text")}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn bg-white px-6 py-3 sm:px-7 text-primary-700 shadow-md hover:-translate-y-0.5 hover:bg-cream">{t("ft.contact")} <ArrowUpRight className="h-4 w-4" /></Link>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-gold px-6 py-3 sm:px-7"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          </div>
        </Reveal>
      </div>

      {/* ───── deep forest-green footer ───── */}
      <div className="relative overflow-hidden bg-secondary-700 pt-24 text-white sm:pt-28">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 animate-blob rounded-full bg-secondary-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 animate-blob rounded-full bg-gold-500/10 blur-3xl" style={{ animationDelay: "5s" }} />
        <Flower className="pointer-events-none absolute right-8 top-24 h-24 w-24 animate-spinSlow text-white/[.05]" />

        {/* ticker */}
        <div className="relative overflow-hidden border-y border-white/10 py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <div className="marquee-track flex w-max animate-marquee items-center gap-10 whitespace-nowrap font-script text-2xl text-gold-300/90">
            {[...ticker, ...ticker, ...ticker, ...ticker].map((x, i) => (
              <span key={i} className="flex items-center gap-10">{x}<Sparkle className="h-3 w-3 text-gold-400" /></span>
            ))}
          </div>
        </div>

        <div className="container-x relative">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-block overflow-hidden rounded-lg border border-primary-700 bg-primary-600 shadow-glow transition hover:-rotate-1">
                <img src="/logo.png" alt="Jayamangala Agro Foods" className="h-14 w-auto object-contain" />
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/65">{t("ft.blurb")}</p>
              <p className="mt-4 inline-block rounded-full border border-gold-400/40 px-4 py-1.5 text-xs font-semibold text-gold-400">{t("ft.newsTitle")}</p>
            </div>
            <div>
              <h4 className={h}>{t("ft.shop")}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link className={a} to="/products">{t("nav.products")}</Link></li>
                <li><Link className={a} to="/cart">{t("nav.cart")}</Link></li>
                <li><Link className={a} to="/wishlist">{t("nav.wishlist")}</Link></li>
                <li><Link className={a} to="/orders">{t("nav.orders")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={h}>{t("ft.help")}</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link className={a} to="/about">{t("ft.about")}</Link></li>
                <li><Link className={a} to="/contact">{t("ft.contact")}</Link></li>
                <li><Link className={a} to="/terms">{t("ft.terms")}</Link></li>
                <li><Link className={a} to="/privacy">{t("ft.privacy")}</Link></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className={h}>{t("ft.contact")}</h4>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />{SITE.address}</li>
                <li><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex gap-2.5 hover:text-gold-400"><Phone className="h-4 w-4 shrink-0 text-gold-400" />{SITE.phone}</a></li>
                <li><a href={`mailto:${SITE.email}`} className="wrap-anywhere flex gap-2.5 hover:text-gold-400"><Mail className="h-4 w-4 shrink-0 text-gold-400" />{SITE.email}</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 pb-20 text-center text-xs text-white/50 sm:flex-row sm:pb-6 sm:text-left">
            <p>© {new Date().getFullYear()} {SITE.name}. {t("ft.rights")}</p>
            <p className="font-script text-xl text-gold-300 -rotate-1">{t("ft.note")}</p>
            <p className="flex items-center gap-1">{t("ft.madeIn")} <Heart className="h-3 w-3 fill-primary-400 text-primary-400" /> {t("ft.inKumbakonam")}</p>
          </div>
        </div>

        {/* floating WhatsApp */}
        <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
          className="fixed bottom-4 right-4 z-30 flex h-12 w-12 items-center sm:bottom-5 sm:right-5 sm:h-14 sm:w-14 justify-center rounded-full bg-[#25d366] text-white shadow-lift transition hover:scale-110">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/40" />
          <MessageCircle className="relative h-5 w-5 sm:h-6 sm:w-6" />
        </a>
      </div>
    </footer>
  );
}
