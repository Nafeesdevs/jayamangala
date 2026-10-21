import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { ProductAPI } from "../api/services";
import { useShop } from "../context/ShopContext";
import { useLang } from "../context/LangContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../components/common/ProductCard";
import { EmptyState, PageLoader, SafeImg } from "../components/common/ui";
import { discountPct, money } from "../utils/format";

export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishIds } = useShop();
  const nav = useNavigate();
  const [p, setP] = useState(undefined);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setP(undefined); setQty(1);
    void (async () => {
      try {
        const r = await ProductAPI.get(id);
        setP(r.data);
        if (r.data?.category?._id) {
          const rel = await ProductAPI.list({ status: "Active", category: r.data.category._id, limit: 5, page: 1 });
          setRelated((rel.data || []).filter((x) => x._id !== id).slice(0, 4));
        }
      } catch { setP(null); }
    })();
  }, [id]);

  if (p === undefined) return <PageLoader />;
  if (!p) return <div className="container-x py-16"><EmptyState title={t("prod.notFound")} action={<Link to="/products" className="btn-primary">{t("nav.products")}</Link>} /></div>;

  const off = discountPct(p);
  const out = p.stock <= 0;
  const liked = wishIds.has(p._id);

  const buyNow = async () => {
    if (await addToCart(p._id, qty, true)) nav("/checkout");
  };

  return (
    <div className="container-x py-6 sm:py-12">
      <nav className="mb-5 truncate text-sm text-ink-soft sm:mb-6">
        <Link to="/" className="hover:text-primary-600">{t("nav.home")}</Link> / <Link to="/products" className="hover:text-primary-600">{t("nav.products")}</Link>
        {p.category && <> / <Link to={`/products?category=${p.category._id}`} className="hover:text-primary-600">{p.category.name}</Link></>}
      </nav>

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
          <p className={`mt-3 text-sm font-semibold ${out ? "text-primary-600" : "text-secondary-700"}`}>
            {out ? t("common.outOfStock") : p.stock <= 5 ? t("prod.only", { n: p.stock }) : t("common.inStock")}
          </p>

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

          <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button disabled={out} className="btn-primary whitespace-nowrap px-3 py-3 sm:flex-none sm:px-8" onClick={() => addToCart(p._id, qty)}>
              <ShoppingBag className="h-4 w-4" />{t("common.addToCart")}
            </button>
            <button disabled={out} className="btn-green whitespace-nowrap px-3 py-3 sm:flex-none sm:px-8" onClick={buyNow}>
              <Zap className="h-4 w-4" />{t("common.buyNow")}
            </button>
            <button className="btn-outline px-3.5 py-3 sm:px-5" onClick={() => toggleWishlist(p._id)} aria-label="Wishlist">
              <Heart className={`h-5 w-5 ${liked ? "fill-primary-600 text-primary-600" : ""}`} />
            </button>
          </div>
          {!user && <p className="mt-3 text-xs text-ink-faint">{t("common.loginFirst")}</p>}
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
    </div>
  );
}
