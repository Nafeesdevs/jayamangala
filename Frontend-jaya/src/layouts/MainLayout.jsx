import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { SITE } from "../config/site";
import { useLang } from "../context/LangContext";
import { MessageCircle, X } from "lucide-react";

function WhatsAppFAB() {
  const { t } = useLang();
  const [tip, setTip] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Auto-show tooltip once after 4 s
  useEffect(() => {
    const id = setTimeout(() => { setTip(true); }, 4000);
    return () => clearTimeout(id);
  }, []);

  if (hidden) return null;

  const waLink = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(t("wa.greeting"))}`;

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2 sm:right-6">
      {/* Dismiss button — small X pill */}
      {tip && (
        <button
          onClick={() => { setTip(false); setHidden(true); }}
          aria-label="Dismiss WhatsApp button"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-card text-ink-soft hover:bg-ink-wash transition"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Tooltip bubble */}
      {tip && (
        <div
          className="max-w-[190px] rounded-2xl rounded-br-sm bg-white px-3.5 py-2.5 shadow-lift text-xs font-medium text-secondary-800 leading-snug cursor-pointer select-none animate-rise"
          onClick={() => window.open(waLink, "_blank", "noopener")}
        >
          {t("wa.fabTip")}
          <span className="block text-[10px] font-normal text-ink-soft mt-0.5">{t("wa.fabSub")}</span>
        </div>
      )}

      {/* FAB */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={() => setTip(false)}
        onMouseEnter={() => setTip(true)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        {/* Ping ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
        <MessageCircle className="relative h-7 w-7 text-white" strokeWidth={2} />
      </a>
    </div>
  );
}

export default function MainLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <div className="flex min-h-screen w-full max-w-[100vw] flex-col overflow-x-clip">
      <Navbar />
      <main key={pathname} className="page-in w-full max-w-[100vw] flex-1 overflow-x-clip"><Outlet /></main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}
