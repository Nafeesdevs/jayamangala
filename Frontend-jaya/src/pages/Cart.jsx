import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { useLang } from "../context/LangContext";
import { EmptyState, SafeImg } from "../components/common/ui";
import { money } from "../utils/format";

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart } = useShop();
  const { t } = useLang();
  const nav = useNavigate();
  const items = (cart.items || []).filter((i) => i.productId);

  if (!items.length)
    return (
      <div className="container-x py-12">
        <EmptyState title={t("cart.empty")} text={t("cart.emptyD")} action={<Link to="/products" className="btn-primary">{t("common.continue")}</Link>} />
      </div>
    );

  return (
    <div className="container-x py-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("cart.title")}</h1>
        <button className="btn-ghost btn-sm text-primary-700" onClick={clearCart}><Trash2 className="h-4 w-4" />{t("cart.clear")}</button>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-3 sm:space-y-4">
          {items.map((item) => {
            const p = item.productId;
            const quantity = item.quantity;
            const size = item.size;
            const itemId = item._id;
            return (
              <div key={itemId || `${p._id}-${size}`} className="card flex gap-3 p-3 sm:gap-4 sm:p-4">
                <Link to={`/product/${p._id}`} className="h-20 w-20 shrink-0 sm:h-24 sm:w-24 overflow-hidden rounded-xl bg-ink-wash sm:h-28 sm:w-28">
                  <SafeImg src={p.productimage} alt={p.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <Link to={`/product/${p._id}`} className="line-clamp-2 text-sm font-semibold hover:text-primary-600 sm:text-base">{p.name}</Link>
                      {size && (
                        <p className="mt-0.5 inline-flex items-center rounded-md bg-cream-deep px-2 py-0.5 text-xs font-medium text-secondary-800">
                          Size: <span className="ml-1 font-bold">{size} {p.unit || ""}</span>
                        </p>
                      )}
                    </div>
                    <button onClick={() => removeFromCart(p._id, { itemId, size })} className="self-start rounded-lg p-1.5 text-ink-faint hover:bg-primary-50 hover:text-primary-600" aria-label={t("common.remove")}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center rounded-lg border border-ink-line">
                      <button className="p-2 hover:bg-ink-wash disabled:opacity-40" disabled={quantity <= 1} onClick={() => updateQty(p._id, quantity - 1, { itemId, size })}><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-9 text-center text-sm font-semibold">{quantity}</span>
                      <button className="p-2 hover:bg-ink-wash disabled:opacity-40" disabled={quantity >= p.stock} onClick={() => updateQty(p._id, quantity + 1, { itemId, size })}><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{money(p.price * quantity)}</p>
                      <p className="text-xs text-ink-faint">{money(p.price)} × {quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="card h-fit p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">{t("cart.summary")}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">{t("common.subtotal")} ({cart.totalItems} {t("common.items")})</span><span>{money(cart.totalAmount)}</span></div>
            <div className="flex justify-between border-t border-ink-line pt-3 text-base font-bold"><span>{t("common.total")}</span><span className="text-primary-600">{money(cart.totalAmount)}</span></div>
          </div>
          <button className="btn-primary mt-5 w-full py-3" onClick={() => nav("/checkout")}>{t("cart.checkout")}</button>
          <Link to="/products" className="btn-outline mt-3 w-full">{t("common.continue")}</Link>
        </aside>
      </div>
    </div>
  );
}
