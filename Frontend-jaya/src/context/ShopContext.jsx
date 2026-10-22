import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { CartAPI, WishlistAPI } from "../api/services";
import { errMsg } from "../api/client";
import { useAuth } from "./AuthContext";
import { useLang } from "./LangContext";

const ShopContext = createContext(null);
const emptyCart = { items: [], totalItems: 0, totalAmount: 0 };

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [cart, setCart] = useState(emptyCart);
  const [wishlist, setWishlist] = useState([]); // [{_id, productId: {...}}]
  const [busy, setBusy] = useState(false);

  const customer = user && user.role !== "admin";

  const refresh = useCallback(async () => {
    if (!customer) { setCart(emptyCart); setWishlist([]); return; }
    try {
      const [c, w] = await Promise.all([CartAPI.get(), WishlistAPI.list()]);
      setCart(c.data || emptyCart);
      setWishlist((w.data || []).filter((x) => x.productId));
    } catch { /* ignore – shows empty */ }
  }, [customer]);

  useEffect(() => {
    void refresh();
  }, [refresh, user?._id]);

  const wishIds = useMemo(() => new Set(wishlist.map((w) => w.productId._id)), [wishlist]);

  const guard = () => {
    if (!user) { toast.error(t("common.loginFirst")); return false; }
    if (!customer) { toast.error("Admins cannot shop. Please use a customer account."); return false; }
    return true;
  };

  const addToCart = async (productId, qty = 1, silent = false, size = "") => {
    if (!guard()) return false;
    try {
      setBusy(true);
      const res = await CartAPI.add(productId, qty, size);
      setCart(res.data);
      if (!silent) toast.success(t("prod.addedCart"));
      return true;
    } catch (e) { toast.error(errMsg(e)); return false; } finally { setBusy(false); }
  };

  const updateQty = async (productId, qty, options = {}) => {
    try { const res = await CartAPI.update(productId, qty, options); setCart(res.data); }
    catch (e) { toast.error(errMsg(e)); }
  };

  const removeFromCart = async (productId, options = {}) => {
    try { const res = await CartAPI.remove(productId, options); setCart(res.data); }
    catch (e) { toast.error(errMsg(e)); }
  };

  const clearCart = async () => {
    try { await CartAPI.clear(); setCart(emptyCart); } catch (e) { toast.error(errMsg(e)); }
  };

  const toggleWishlist = async (productId) => {
    if (!guard()) return;
    try {
      const res = await WishlistAPI.toggle(productId);
      toast.success(res.action === "added" ? t("prod.addedWish") : t("prod.removedWish"));
      const w = await WishlistAPI.list();
      setWishlist((w.data || []).filter((x) => x.productId));
    } catch (e) { toast.error(errMsg(e)); }
  };

  const removeWish = async (productId) => {
    try { await WishlistAPI.remove(productId); setWishlist((l) => l.filter((x) => x.productId._id !== productId)); }
    catch (e) { toast.error(errMsg(e)); }
  };

  const clearWishlist = async () => {
    try { await WishlistAPI.clear(); setWishlist([]); } catch (e) { toast.error(errMsg(e)); }
  };

  const moveToCart = async (productId) => {
    try {
      await WishlistAPI.moveToCart(productId);
      toast.success(t("prod.addedCart"));
      await refresh();
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <ShopContext.Provider
      value={{
        cart, wishlist, wishIds, busy, refresh,
        cartCount: cart.totalItems || 0, wishCount: wishlist.length,
        addToCart, updateQty, removeFromCart, clearCart,
        toggleWishlist, removeWish, clearWishlist, moveToCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);
