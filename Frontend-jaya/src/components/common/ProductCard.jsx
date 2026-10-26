import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Plus } from "lucide-react";
import { useShop } from "../../context/ShopContext";
import { useLang } from "../../context/LangContext";
import { money, discountPct } from "../../utils/format";
import { SafeImg } from "./ui";
import { track } from "../../hooks/useAnalytics";

// pastel "plates" taken from the AI-Studio hero cards
const PLATES = ["bg-sage", "bg-peach", "bg-butter", "bg-lilac", "bg-blush"];
const SHAPES = [
  { card: "2.6rem .7rem 2.6rem .7rem", hover: ".7rem 2.6rem .7rem 2.6rem", rot: "-1.2deg" },
  { card: ".7rem 2.6rem .7rem 2.6rem", hover: "2.6rem .7rem 2.6rem .7rem", rot: "1.2deg" },
];
const hash = (s = "") => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

export default function ProductCard({ product: p, index }) {
  const { addToCart, toggleWishlist, wishIds } = useShop();
  const { t } = useLang();
  const liked = wishIds.has(p._id);
  const off = discountPct(p);
  const out = p.stock <= 0;
  const h = hash(p._id);
  const i = index ?? h;
  const plate = PLATES[i % PLATES.length];
  const shape = SHAPES[i % 2];

  return (
    <div
      className="product-card group relative flex h-full min-w-0 flex-col border border-cream-sand/70 bg-white p-2 shadow-card sm:p-2.5 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-2 hover:shadow-lift"
      style={{ borderRadius: shape.card, "--hover-radius": shape.hover, "--rot": shape.rot }}
    >
      {/* arch-shaped photo window on a pastel plate */}
      <div className={`relative overflow-hidden rounded-[1.4rem] ${plate} px-2 pb-0 pt-4 sm:rounded-[1.7rem] sm:px-3 sm:pt-5`}>
        <span className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40 transition-transform duration-700 group-hover:scale-150" />
        <Link to={`/product/${p._id}`} onClick={() => track("product_view", { productId: p._id, productName: p.name })} className="img-frame relative block aspect-[4/4.4] overflow-hidden bg-cream-deep shadow-soft ring-4 ring-white/90 shape-arch">
          <SafeImg src={p.productimage} alt={p.name} className="h-full w-full object-cover" />
        </Link>

        {off > 0 && (
          <span className="absolute left-2 top-2 flex h-11 w-11 -rotate-12 flex-col sm:left-3 sm:top-3 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary-600 text-center leading-none text-white shadow-glow transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
            <span className="font-display text-sm font-bold sm:text-base">{off}%</span>
            <span className="font-script text-xs sm:text-sm">{t("prod.off")}</span>
          </span>
        )}
        <button
          onClick={() => toggleWishlist(p._id)}
          aria-label="Wishlist"
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-card sm:right-3 sm:top-3 sm:h-10 sm:w-10 transition duration-300 hover:scale-110 active:scale-90"
        >
          <Heart className={`h-[18px] w-[18px] transition ${liked ? "scale-110 fill-primary-600 text-primary-600" : "text-ink-soft"}`} />
        </button>
        {out && (
          <div className="absolute inset-x-2 bottom-2 rounded-full bg-secondary-800/85 py-1 text-center text-[11px] sm:inset-x-3 sm:bottom-3 sm:py-1.5 sm:text-xs font-semibold text-white backdrop-blur">
            {t("common.outOfStock")}
          </div>
        )}
        {!out && p.stock <= 5 && (
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-center gap-1 rounded-full border border-amber-300 bg-amber-50/95 py-1 text-center text-[10px] sm:inset-x-3 sm:bottom-3 sm:py-1.5 sm:text-xs font-semibold text-amber-700 backdrop-blur">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            </span>
            {t("prod.only", { n: p.stock })}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-1.5 pb-1.5 pt-3 sm:px-3 sm:pb-2 sm:pt-4">
        <p className="truncate font-script text-lg font-bold leading-none text-primary-600 sm:text-[1.35rem]">{p.brand?.name || p.category?.name}</p>
        <Link to={`/product/${p._id}`} onClick={() => track("product_view", { productId: p._id, productName: p.name })} className="mt-1.5 line-clamp-2 min-h-[2.5rem] font-display text-[0.9rem] sm:min-h-[2.7rem] sm:text-[1.02rem] font-bold leading-snug text-secondary-700 transition hover:text-primary-600">
          {p.name}
        </Link>

        {p.availableSizes && p.availableSizes.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {p.availableSizes.slice(0, 4).map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-md border border-cream-sand bg-[#fbf6ec] px-1.5 py-0.5 text-[10px] font-semibold text-secondary-800"
              >
                {s}
              </span>
            ))}
            {p.availableSizes.length > 4 && (
              <span className="text-[10px] font-medium text-ink-faint">
                +{p.availableSizes.length - 4}
              </span>
            )}
            {p.unit && <span className="text-[10px] text-ink-faint">({p.unit})</span>}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-1.5 pt-3 sm:gap-2">
          <div className="min-w-0">
            {off > 0 && <span className="block text-xs text-ink-faint line-through">{money(p.oldprice)}</span>}
            <span className="block truncate font-display text-xl font-bold leading-none text-secondary-700 sm:text-2xl">{money(p.price)}</span>
          </div>
          {/* round add button that stretches into a pill on hover */}
          <button
            disabled={out}
            onClick={() => addToCart(p._id)}
            aria-label={t("common.addToCart")}
            className="group/btn relative flex h-10 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full bg-primary-600 px-2.5 sm:h-11 sm:gap-2 sm:px-3.5 text-sm font-semibold text-white shadow-glow transition-all duration-500 hover:bg-primary-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <ShoppingBag className="h-[18px] w-[18px] shrink-0 transition-transform duration-500 group-hover/btn:-rotate-12" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-500 group-hover/btn:max-w-[9rem] group-hover/btn:opacity-100 group-focus-visible/btn:max-w-[9rem] group-focus-visible/btn:opacity-100">{t("common.addToCart")}</span>
            <Plus className="hidden h-4 w-4 shrink-0 transition-transform duration-500 group-hover/btn:rotate-90 min-[400px]:block" />
          </button>
        </div>
      </div>
    </div>
  );
}
