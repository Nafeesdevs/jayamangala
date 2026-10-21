import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Menu, X, LogOut, LayoutDashboard, User, ArrowRight, Home, Package, ClipboardList, UserCircle, Phone, Info, Clock, MapPin, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useShop } from "../context/ShopContext";
import { useLang } from "../context/LangContext";
import LangToggle from "../components/common/LangToggle";
import { SITE } from "../config/site";

/* Header modelled on the Google AI Studio design:
   logo badge + wordmark · centre links with growing underline · red pill CTA · bordered hamburger · slide-in drawer */
export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount, wishCount } = useShop();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const nav = useNavigate();
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: t("nav.home"), end: true, icon: Home },
    { to: "/products", label: t("nav.products"), icon: Package },
    { to: "/orders", label: t("nav.orders"), icon: ClipboardList },
    { to: "/profile", label: t("nav.profile"), icon: UserCircle },
    { to: "/about", label: t("nav.about"), icon: Info },
    { to: "/contact", label: t("nav.contact"), icon: Phone },
  ];
  const centre = [links[0], links[1], links[2], links[4], links[5]];

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; document.removeEventListener("keydown", esc); };
  }, [open]);

  const Badge = ({ n }) =>
    n > 0 ? (
      <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] animate-pop items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white ring-2 ring-cream">{n}</span>
    ) : null;

  const doLogout = async () => { await logout(); setOpen(false); nav("/"); };

  const Logo = ({ small }) => (
    <Link to="/" className="group flex shrink-0 items-center gap-3" aria-label={SITE.name}>
      <span className="relative block overflow-hidden rounded-lg border border-primary-700 bg-primary-600 shadow-sm transition-all duration-300 group-hover:-rotate-1 group-hover:shadow-glow">
        <img src="/logo.png" alt="Jayamangala Agro Foods" className={`w-auto max-w-[150px] object-contain transition-all duration-500 sm:max-w-none ${small ? "h-10" : scrolled ? "h-9 sm:h-11" : "h-10 sm:h-12"}`} />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-full bg-white/30 group-hover:animate-[shine_1s_ease]" />
      </span>
    </Link>
  );

  const iconBtn = "relative flex h-9 w-9 shrink-0 items-center sm:h-10 sm:w-10 justify-center rounded-full border border-cream-sand bg-white/80 text-secondary-700 transition duration-300 hover:-translate-y-0.5 hover:border-primary-600 hover:bg-primary-50 hover:text-primary-600";

  return (
    <>
      <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? "border-b border-cream-sand/90 bg-cream/95 py-2 shadow-[0_8px_30px_rgba(60,28,16,.07)] backdrop-blur-md" : "bg-cream py-3.5 sm:py-4"}`}>
        <div className="container-x flex items-center justify-between gap-2 sm:gap-4">
          {/* BRAND ZONE */}
          <div className="flex items-center gap-3">
            <Logo />
            {/* <div className="hidden xl:block">
              <span className="block font-display text-xl font-bold leading-none tracking-tight text-secondary-700">Jayamangala</span>
              <span className="mt-1 block whitespace-nowrap font-script text-[17px] font-bold leading-none text-primary-600">{t("hd.tagline")}</span>
            </div> */}
          </div>

          {/* CENTRE LINKS */}
          <nav className="hidden min-w-0 items-center gap-0 text-[13.5px] font-medium text-secondary-800 lg:flex xl:gap-1 xl:text-[14.5px]">
            {centre.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end}
                className={({ isActive }) => `nav-link whitespace-nowrap px-2 py-2 transition xl:px-3.5 duration-200 hover:-translate-y-0.5 hover:text-primary-600 ${isActive ? "active text-primary-600" : ""}`}>
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className="nav-link inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-2 hover:text-primary-600 xl:px-3.5">
                <LayoutDashboard className="h-4 w-4" />{t("nav.admin")}
              </NavLink>
            )}
          </nav>

          {/* RIGHT ACTION ZONE */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
            <LangToggle className="hidden sm:inline-flex" />
            <Link to="/wishlist" className={iconBtn} aria-label={t("nav.wishlist")}><Heart className="h-[18px] w-[18px]" /><Badge n={wishCount} /></Link>
            <Link to="/cart" className={iconBtn} aria-label={t("nav.cart")}><ShoppingBag className="h-[18px] w-[18px]" /><Badge n={cartCount} /></Link>
            {user ? (
              <button onClick={doLogout} aria-label={t("nav.logout")} className="btn-primary hidden px-5 sm:inline-flex lg:px-3 xl:px-5"><LogOut className="h-4 w-4" /><span className="lg:hidden xl:inline">{t("nav.logout")}</span></button>
            ) : (
              <Link to="/login" aria-label={t("nav.login")} className="btn-primary hidden px-5 sm:inline-flex lg:px-3 xl:px-5"><User className="h-4 w-4 text-primary-100" /><span className="lg:hidden xl:inline">{t("nav.login")}</span></Link>
            )}
            <button onClick={() => setOpen(true)} aria-label="Open navigation menu" aria-expanded={open}
              className="group shrink-0 rounded-xl border border-cream-sand p-2 text-secondary-700 sm:p-2.5 transition-colors hover:bg-primary-50 hover:text-primary-600">
              <Menu className="h-5 w-5 stroke-[2] transition-transform group-hover:scale-110 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
        {/* scroll progress */}
        <span className="bar-flow pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left opacity-90" style={{ transform: `scaleX(${progress / 100})` }} />
      </header>

      {/* ───────── Slide-in drawer (isolated overlay) ───────── */}
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-end" role="dialog" aria-modal="true">
          <div className="animate-fade absolute inset-0 bg-secondary-900/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative z-[101] flex h-full w-[88%] max-w-sm animate-slideIn flex-col justify-between overflow-y-auto overscroll-contain border-l border-cream-sand bg-[#fdfbf7] p-5 shadow-2xl sm:w-full sm:max-w-md sm:p-8">
            <span className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary-100/70 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-gold-300/30 blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between border-b border-cream-sand pb-5">
                <Logo small />
                <button onClick={() => setOpen(false)} className="rounded-full p-2 text-ink-soft transition hover:rotate-90 hover:bg-primary-50 hover:text-primary-600" aria-label="Close menu"><X className="h-5 w-5" /></button>
              </div>

              <div className="py-4">
                <span className="block text-[11px] font-semibold uppercase tracking-widest text-primary-600">{t("hd.explore")}</span>
                <p className="mt-0.5 font-script text-2xl text-secondary-700">{t("hd.note")}</p>
              </div>

              <nav className="flex flex-col gap-1.5 pt-1">
                {links.map((l, i) => (
                  <NavLink key={l.to} to={l.to} end={l.end} style={{ "--i": i }}
                    className={({ isActive }) => `drawer-item group flex items-center justify-between rounded-2xl px-4 py-3 font-display text-lg font-bold transition-all ${isActive ? "bg-primary-50 text-primary-600" : "text-secondary-700 hover:bg-primary-50 hover:text-primary-600"}`}>
                    <span className="flex items-center gap-3"><l.icon className="h-[18px] w-[18px] opacity-60" />{l.label}</span>
                    <ArrowRight className="h-4 w-4 text-primary-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                  </NavLink>
                ))}
                <NavLink to="/cart" style={{ "--i": links.length }} className="drawer-item group flex items-center justify-between rounded-2xl px-4 py-3 font-display text-lg font-bold text-secondary-700 transition-all hover:bg-primary-50 hover:text-primary-600">
                  <span className="flex items-center gap-3"><ShoppingBag className="h-[18px] w-[18px] opacity-60" />{t("nav.cart")}</span>
                  <span className="rounded-full bg-gold-400 px-2.5 text-sm font-bold text-secondary-800">{cartCount}</span>
                </NavLink>
                <NavLink to="/wishlist" style={{ "--i": links.length + 1 }} className="drawer-item group flex items-center justify-between rounded-2xl px-4 py-3 font-display text-lg font-bold text-secondary-700 transition-all hover:bg-primary-50 hover:text-primary-600">
                  <span className="flex items-center gap-3"><Heart className="h-[18px] w-[18px] opacity-60" />{t("nav.wishlist")}</span>
                  <span className="rounded-full bg-gold-400 px-2.5 text-sm font-bold text-secondary-800">{wishCount}</span>
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" style={{ "--i": links.length + 2 }} className="drawer-item group flex items-center gap-3 rounded-2xl px-4 py-3 font-display text-lg font-bold text-secondary-700 transition-all hover:bg-primary-50 hover:text-primary-600">
                    <LayoutDashboard className="h-[18px] w-[18px] opacity-60" />{t("nav.admin")}
                  </NavLink>
                )}
              </nav>
            </div>

            <div className="relative mt-8 space-y-4 border-t border-cream-sand pt-6">
              <div className="flex items-center gap-3 text-xs text-ink-soft"><Clock className="h-4 w-4 shrink-0 text-primary-600" /><span>{SITE.hours}</span></div>
              <div className="flex items-start gap-3 text-xs text-ink-soft"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" /><span>{SITE.address}</span></div>
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-xs font-semibold text-ink-soft hover:text-primary-600"><Phone className="h-4 w-4 shrink-0 text-primary-600" /><span>{SITE.phone}</span></a>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <LangToggle />
                {user ? (
                  <button onClick={doLogout} className="btn-dark btn-sm"><LogOut className="h-4 w-4" />{t("nav.logout")}</button>
                ) : (
                  <>
                    <Link to="/login" className="btn-outline btn-sm"><LogIn className="h-4 w-4" />{t("nav.login")}</Link>
                    <Link to="/register" className="btn-primary btn-sm">{t("nav.register")}</Link>
                  </>
                )}
              </div>
              {user && <p className="flex items-center gap-1.5 text-xs text-ink-soft"><User className="h-3.5 w-3.5" />{user.name}</p>}

              <Link to="/products" className="btn-primary w-full py-3.5 text-sm shadow-md"><ShoppingBag className="h-4 w-4 text-primary-100" />{t("hd.shop")}</Link>
              <p className="pt-1 text-center font-script text-xl text-secondary-700">{t("ft.note")}</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
