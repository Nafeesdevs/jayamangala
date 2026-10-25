import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Heart, MessageCircle, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { ProductAPI } from "../api/services";
import { useShop } from "../context/ShopContext";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/common/ProductCard";
import { EmptyState, PageLoader, SafeImg } from "../components/common/ui";
import { discountPct, money } from "../utils/format";
import { SITE } from "../config/site";
import { track } from "../hooks/useAnalytics";
import { usePageMeta } from "../hooks/usePageMeta";

export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishIds } = useShop();
  const nav = useNavigate();
  const [p, setP] = useState(undefined);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [showSticky, setShowSticky] = useState(false);
  const ctaRef = useRef(null);

  // Set page meta at component top level (guaranteed hook call order)
  usePageMeta(
    p?.name ? `${p.name}` : "Product Details",
    p?.name ? `Buy ${p.name} online from Jayamangala Agro Foods. ${p.description ? p.description.slice(0, 120) : "Quality food products from Kumbakonam."}` : undefined
  );

  useEffect(() => {
    setP(undefined); setQty(1); setSelectedSize(""); setShowSticky(false);
    void (async () => {
      try {
        const r = await ProductAPI.get(id);
        setP(r.data);
        // Track product view (fire-and-forget)
        track("product_view", { productId: r.data._id, productName: r.data.name });
        if (r.data?.availableSizes?.length > 0) {
          setSelectedSize(r.data.availableSizes[0]);
        }
        if (r.data?.category?._id) {
          const rel = await ProductAPI.list({ status: "Active", category: r.data.category._id, limit: 5, page: 1 });
          setRelated((rel.data || []).filter((x) => x._id !== id).slice(0, 4));
        }
      } catch { setP(null); }
    })();
  }, [id]);

  // Show sticky CTA bar when the main CTA buttons scroll out of view
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: "0px 0px -60px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [p]);

  if (p === undefined) return <PageLoader label="Loading product details..." />;
  if (!p) return <div className="container-x py-16"><EmptyState title={t("prod.notFound")} action={<Link to="/products" className="btn-primary">{t("nav.products")}</Link>} /></div>;

  const off = discountPct(p);
  const out = p.stock <= 0;
  const lowStock = !out && p.stock <= 5;
  const liked = wishIds.has(p._id);
  const waMsg = encodeURIComponent(
    `Hi! I'm interested in *${p.name}*${selectedSize ? ` (${selectedSize}${p.unit ? " " + p.unit : ""})` : ""}. Price: ${money(p.price)}. Can you help me?`
  );
  const waLink = `https://wa.me/${SITE.whatsapp}?text=${waMsg}`;

  const buyNow = async () => {
    if (await addToCart(p._id, qty, true, selectedSize)) nav("/checkout");
  };

  return (
    <div className="container-x py-6 sm:py-12">
      <div className="mb-5 flex items-center gap-3 sm:mb-6">
        <Link
          to="/products"
          title="Back to all products"
          aria-label="Back to all products"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-sand bg-white text-secondary-700 shadow-sm transition hover:scale-105 hover:bg-cream-deep hover:text-primary-600 active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <nav className="min-w-0 truncate text-sm text-ink-soft">
          <Link to="/" className="hover:text-primary-600">{t("nav.home")}</Link> / <Link to="/products" className="hover:text-primary-600">{t("nav.products")}</Link>
          {p.category && <> / <Link to={`/products?category=${p.category._id}`} className="hover:text-primary-600">{p.category.name}</Link></>}
        </nav>
      </div>

      <div className="grid gap-6 sm:gap-10 md:grid-cols-2 md:items-start">
        <div className="card mx-auto w-full max-w-lg overflow-hidden md:sticky md:top-24 md:max-w-none">
          <SafeImg src={p.productimage} alt={p.name} className="aspect-square w-full object-cover" />
        </div>

        <div className="min-w-0">
          {p.brand && <p className="text-sm font-medium text-secondary-700">{p.brand.name}</p>}
          <h1 className="mt-1 font-display text-[1.75rem] font-bold leading-tight text-secondary-700 sm:text-4xl">{p.name}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-extrabold text-primary-600">{money(p.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-ink-faint line-through">{money(p.oldprice)}</span>
                <span className="badge bg-primary-600 text-white">{off}% {t("prod.off")}</span>
              </>
            )}
          </div>
          {/* Stock status */}
          {out ? (
            <p className="mt-3 text-sm font-semibold text-primary-600">{t("common.outOfStock")}</p>
          ) : lowStock ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-700">{t("prod.only", { n: p.stock })} — {t("prod.orderSoon")}</span>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold text-secondary-700">{t("common.inStock")}</p>
          )}

          {p.availableSizes && p.availableSizes.length > 0 && (
            <div className="mt-6 border-t border-ink-line pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-secondary-800">
                  Available Size{p.availableSizes.length > 1 ? "s" : ""}:
                </span>
                {p.unit && <span className="text-xs text-ink-faint">Unit: {p.unit}</span>}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.availableSizes.map((sz) => {
                  const active = selectedSize === sz;
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`inline-flex items-center justify-center rounded-xl border px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "border-primary-600 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-600"
                          : "border-cream-sand bg-white text-secondary-700 hover:border-primary-300 hover:bg-cream-sand/30"
                      }`}
                    >
                      {sz} {p.unit ? <span className="ml-1 text-xs font-normal opacity-80">{p.unit}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {p.description && (
            <div className="mt-6 border-t border-ink-line pt-6">
              <h3 className="mb-2 text-sm font-semibold">{t("prod.desc")}</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.description}</p>
            </div>
          )}

          {!out && (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium">{t("common.quantity")}</span>
              <div className="flex items-center rounded-lg border border-ink-line">
                <button className="p-2.5 hover:bg-ink-wash" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus className="h-4 w-4" /></button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button className="p-2.5 hover:bg-ink-wash" onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          )}

          <div ref={ctaRef} className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button disabled={out} className="btn-primary whitespace-nowrap px-3 py-3 sm:flex-none sm:px-8" onClick={() => addToCart(p._id, qty, false, selectedSize)}>
              <ShoppingBag className="h-4 w-4" />{t("common.addToCart")}
            </button>
            <button disabled={out} className="btn-green whitespace-nowrap px-3 py-3 sm:flex-none sm:px-8" onClick={buyNow}>
              <Zap className="h-4 w-4" />{t("common.buyNow")}
            </button>
            <button className="btn-outline px-3.5 py-3 sm:px-5" onClick={() => toggleWishlist(p._id)} aria-label="Wishlist">
              <Heart className={`h-5 w-5 ${liked ? "fill-primary-600 text-primary-600" : ""}`} />
            </button>
          </div>
          {/* WhatsApp enquiry link */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[#25D366] hover:underline"
            onClick={() => track("wa_enquiry", { productId: p._id, productName: p.name })}
          >
            <MessageCircle className="h-4 w-4" />
            {t("prod.askWhatsApp")}
          </a>
          {!user && <p className="mt-2 text-xs text-ink-faint">{t("common.loginFirst")}</p>}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14 sm:mt-20">
          <h2 className="text-2xl font-bold">{t("prod.related")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {related.map((r) => <ProductCard key={r._id} product={r} />)}
          </div>
        </section>
      )}

      {/* Sticky mobile CTA bar — only on mobile/tablet, only when main CTAs are out of view */}
      {!out && (
        <div
          className={`fixed inset-x-0 bottom-0 z-50 md:hidden transition-transform duration-300 ${
            showSticky ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center gap-2 border-t border-cream-sand bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.10)] backdrop-blur-sm">
            <span className="mr-auto min-w-0 flex-1 truncate text-sm font-semibold text-secondary-700">{p.name}</span>
            <button
              className="btn-primary shrink-0 px-4 py-2.5 text-sm"
              onClick={() => addToCart(p._id, qty, false, selectedSize)}
            >
              <ShoppingBag className="h-4 w-4" />
              {t("common.addToCart")}
            </button>
            <button
              className="btn-green shrink-0 px-4 py-2.5 text-sm"
              onClick={buyNow}
            >
              <Zap className="h-4 w-4" />
              {t("common.buyNow")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
