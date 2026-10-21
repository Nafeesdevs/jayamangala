import { Link } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useLang } from "../context/LangContext";
import { EmptyState, SafeImg } from "../components/common/ui";
import { money } from "../utils/format";

export default function Wishlist() {
  const { wishlist, removeWish, moveToCart, clearWishlist } = useShop();
  const { t } = useLang();

  if (!wishlist.length)
    return (
      <div className="container-x py-12">
        <EmptyState title={t("wish.empty")} text={t("wish.emptyD")} action={<Link to="/products" className="btn-primary">{t("nav.products")}</Link>} />
      </div>
    );

  return (
    <div className="container-x py-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("wish.title")} <span className="text-base font-normal text-ink-soft">({wishlist.length})</span></h1>
        <div className="flex flex-wrap gap-2">
          <button className="btn-green btn-sm" onClick={() => moveToCart()}><ShoppingBag className="h-4 w-4" />{t("wish.moveAll")}</button>
          <button className="btn-danger btn-sm" onClick={clearWishlist}><Trash2 className="h-4 w-4" />{t("wish.clear")}</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {wishlist.map(({ _id, productId: p }) => (
          <div key={_id} className="card flex min-w-0 flex-col overflow-hidden">
            <Link to={`/product/${p._id}`} className="block aspect-square bg-ink-wash">
              <SafeImg src={p.productimage} alt={p.name} className="h-full w-full object-cover" />
            </Link>
            <div className="flex flex-1 flex-col p-3 sm:p-4">
              <Link to={`/product/${p._id}`} className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold hover:text-primary-600">{p.name}</Link>
              <p className="mt-2 text-lg font-bold text-primary-600">{money(p.price)}</p>
              <div className="mt-3 flex gap-2">
                <button className="btn-primary btn-sm min-w-0 flex-1 px-2 sm:px-3.5" disabled={p.stock <= 0 || p.status !== "Active"} onClick={() => moveToCart(p._id)}>
                  {p.stock <= 0 ? t("common.outOfStock") : t("wish.move")}
                </button>
                <button className="btn-outline btn-sm shrink-0 px-2.5 sm:px-3.5" onClick={() => removeWish(p._id)} aria-label={t("common.remove")}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
