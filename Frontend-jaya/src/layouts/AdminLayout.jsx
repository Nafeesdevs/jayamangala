import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Layers, Tags, Package, ShoppingBag, Users, UserCircle, LogOut, Menu, X, Store, CalendarDays, Briefcase } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import LangToggle from "../components/common/LangToggle";
import { Sprig, Sparkle } from "../components/common/Doodles";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Categories", icon: Layers },
  { to: "/admin/brands", label: "Brands", icon: Tags },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/leads", label: "Leads / CRM", icon: Briefcase },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const { pathname } = useLocation();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const current = items.find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)))?.label || "Admin";

  const cls = ({ isActive }) =>
    `side-link group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-300 ${isActive ? "active translate-x-1 bg-cream text-primary-700 shadow-md" : "text-white/75 hover:translate-x-1 hover:bg-white/10 hover:text-white"}`;

  const Side = (
    <div className="relative flex h-full flex-col overflow-hidden bg-secondary-700 text-white">
      <span className="pointer-events-none absolute -left-20 top-10 h-64 w-64 animate-blob rounded-full bg-secondary-500/30 blur-3xl" />
      <Sprig className="pointer-events-none absolute -bottom-3 -right-3 h-44 w-28 rotate-[18deg] animate-sway text-white/10" />
      <Sparkle className="pointer-events-none absolute right-6 top-24 h-4 w-4 animate-twinkle text-gold-400" />

      <Link to="/admin" className="relative flex flex-col items-start gap-1.5 px-5 pb-4 pt-5">
        <span className="overflow-hidden rounded-lg border border-primary-700 bg-primary-600 shadow-glow transition hover:-rotate-1">
          <img src="/logo.png" alt="Jayamangala Agro Foods" className="h-11 w-auto object-contain" />
        </span>
        <span className="font-script text-xl font-bold leading-none text-gold-300">Admin studio</span>
      </Link>

      <nav className="relative flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className={cls} onClick={() => setOpen(false)}>
            <i.icon className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" /> {i.label}
          </NavLink>
        ))}
      </nav>

      <div className="relative space-y-1.5 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-white/75 transition hover:translate-x-1 hover:bg-white/10 hover:text-white">
          <Store className="h-[18px] w-[18px]" /> View store
        </Link>
        <button
          type="button"
          onClick={async () => {
            try {
              await logout();
            } finally {
              nav("/login");
            }
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-primary-200 transition hover:translate-x-1 hover:bg-primary-600 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px]" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-bg min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 shadow-lift lg:block" style={{ borderRadius: "0 2.2rem 2.2rem 0 / 0 2.2rem 2.2rem 0", overflow: "hidden" }}>{Side}</aside>
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="animate-fade fixed inset-0 bg-secondary-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-full max-w-[18rem] animate-slideInLeft overflow-y-auto overflow-x-hidden shadow-lift" style={{ borderRadius: "0 2rem 2rem 0" }}>{Side}</aside>
        </div>
      )}
      <div className="min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between gap-3 border-b border-cream-sand/80 bg-cream/90 px-3 backdrop-blur-md sm:h-[68px] sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button className="shrink-0 rounded-xl border border-cream-sand p-2 text-secondary-700 transition hover:bg-primary-50 hover:text-primary-600 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
            <div className="hidden leading-tight lg:block">
              <p className="font-script text-xl font-bold text-primary-600">Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}</p>
              <p className="flex items-center gap-1.5 text-xs text-ink-soft"><CalendarDays className="h-3.5 w-3.5" />{today}</p>
            </div>
            <p className="truncate font-display text-lg font-bold text-secondary-700 lg:hidden">{current}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LangToggle />
            <Link to="/admin/profile" className="group flex items-center gap-2 rounded-full border border-cream-sand bg-white p-1 sm:pr-3 transition hover:border-primary-600 hover:shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 font-display text-sm font-bold text-white transition group-hover:rotate-12">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </span>
              <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-secondary-700 sm:block">{user?.name}</span>
            </Link>
          </div>
        </header>
        <main key={pathname} className="page-in min-w-0 p-3.5 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
