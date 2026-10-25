// import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
// import toast from "react-hot-toast";
// import { CartAPI, WishlistAPI } from "../api/services";
// import { errMsg } from "../api/client";
// import { useAuth } from "./AuthContext";
// import { useLang } from "./LangContext";
// import { track } from "../hooks/useAnalytics";

// const ShopContext = createContext(null);
// const emptyCart = { items: [], totalItems: 0, totalAmount: 0 };

// export function ShopProvider({ children }) {
//   const { user } = useAuth();
//   const { t } = useLang();
//   const [cart, setCart] = useState(emptyCart);
//   const [wishlist, setWishlist] = useState([]); // [{_id, productId: {...}}]
//   const [busy, setBusy] = useState(false);

//   const customer = user && user.role !== "admin";

//   const refresh = useCallback(async () => {
//     if (!customer) { setCart(emptyCart); setWishlist([]); return; }
//     try {
//       const [c, w] = await Promise.all([CartAPI.get(), WishlistAPI.list()]);
//       setCart(c.data || emptyCart);
//       setWishlist((w.data || []).filter((x) => x.productId));
//     } catch { /* ignore – shows empty */ }
//   }, [customer]);

//   useEffect(() => {
//     void refresh();
//   }, [refresh, user?._id]);

//   const wishIds = useMemo(() => new Set(wishlist.map((w) => w.productId._id)), [wishlist]);

//   const guard = () => {
//     if (!user) { toast.error(t("common.loginFirst")); return false; }
//     if (!customer) { toast.error("Admins cannot shop. Please use a customer account."); return false; }
//     return true;
//   };

//   const addToCart = async (productId, qty = 1, silent = false, size = "") => {
//     if (!guard()) return false;
//     try {
//       setBusy(true);
//       const res = await CartAPI.add(productId, qty, size);
//       setCart(res.data);
//       if (!silent) toast.success(t("prod.addedCart"));
//       // Track add-to-cart (fire-and-forget)
//       track("add_to_cart", { productId });
//       return true;
//     } catch (e) { toast.error(errMsg(e)); return false; } finally { setBusy(false); }
//   };

//   const updateQty = async (productId, qty, options = {}) => {
//     try { const res = await CartAPI.update(productId, qty, options); setCart(res.data); }
//     catch (e) { toast.error(errMsg(e)); }
//   };

//   const removeFromCart = async (productId, options = {}) => {
//     try { const res = await CartAPI.remove(productId, options); setCart(res.data); }
//     catch (e) { toast.error(errMsg(e)); }
//   };

//   const clearCart = async () => {
//     try { await CartAPI.clear(); setCart(emptyCart); } catch (e) { toast.error(errMsg(e)); }
//   };

//   const toggleWishlist = async (productId) => {
//     if (!guard()) return;
//     try {
//       const res = await WishlistAPI.toggle(productId);
//       toast.success(res.action === "added" ? t("prod.addedWish") : t("prod.removedWish"));
//       // Track wishlist add only (not remove)
//       if (res.action === "added") track("wishlist_add", { productId });
//       const w = await WishlistAPI.list();
//       setWishlist((w.data || []).filter((x) => x.productId));
//     } catch (e) { toast.error(errMsg(e)); }
//   };

//   const removeWish = async (productId) => {
//     try { await WishlistAPI.remove(productId); setWishlist((l) => l.filter((x) => x.productId._id !== productId)); }
//     catch (e) { toast.error(errMsg(e)); }
//   };

//   const clearWishlist = async () => {
//     try { await WishlistAPI.clear(); setWishlist([]); } catch (e) { toast.error(errMsg(e)); }
//   };

//   const moveToCart = async (productId) => {
//     try {
//       await WishlistAPI.moveToCart(productId);
//       toast.success(t("prod.addedCart"));
//       await refresh();
//     } catch (e) { toast.error(errMsg(e)); }
//   };

//   return (
//     <ShopContext.Provider
//       value={{
//         cart, wishlist, wishIds, busy, refresh,
//         cartCount: cart.totalItems || 0, wishCount: wishlist.length,
//         addToCart, updateQty, removeFromCart, clearCart,
//         toggleWishlist, removeWish, clearWishlist, moveToCart,
//       }}
//     >
//       {children}
//     </ShopContext.Provider>
//   );
// }

// export const useShop = () => useContext(ShopContext);


import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import { CartAPI, WishlistAPI } from "../api/services";
import { errMsg } from "../api/client";
import { useAuth } from "./AuthContext";
import { useLang } from "./LangContext";
import { track } from "../hooks/useAnalytics";

const ShopContext = createContext(null);
const emptyCart = { items: [], totalItems: 0, totalAmount: 0 };

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const { t } = useLang();
  const [cart, setCart] = useState(emptyCart);
  const [wishlist, setWishlist] = useState([]); // [{_id, productId: {...}}]
  const [wishOverride, setWishOverride] = useState({}); // { [productId]: true|false } instant UI state
  const [busy, setBusy] = useState(false);

  // keep latest `t` in a ref so callbacks stay stable
  const tRef = useRef(t);
  tRef.current = t;

  // product ids currently being toggled (prevents double-click spam)
  const pendingWish = useRef(new Set());

  const customer = !!user && user.role !== "admin";

  const refresh = useCallback(async () => {
    if (!customer) { setCart(emptyCart); setWishlist([]); setWishOverride({}); return; }
    try {
      const [c, w] = await Promise.all([CartAPI.get(), WishlistAPI.list()]);
      setCart(c.data || emptyCart);
      setWishlist((w.data || []).filter((x) => x.productId));
    } catch { /* ignore – shows empty */ }
  }, [customer]);

  useEffect(() => {
    void refresh();
  }, [refresh, user?._id]);

  // Real ids from the server, with instant (optimistic) changes applied on top
  const wishIds = useMemo(() => {
    const s = new Set(wishlist.map((w) => w.productId._id));
    for (const [id, on] of Object.entries(wishOverride)) {
      if (on) s.add(id); else s.delete(id);
    }
    return s;
  }, [wishlist, wishOverride]);

  const guard = useCallback(() => {
    if (!user) { toast.error(tRef.current("common.loginFirst")); return false; }
    if (!customer) { toast.error("Admins cannot shop. Please use a customer account."); return false; }
    return true;
  }, [user, customer]);

  /* ───────── CART ───────── */
  const addToCart = useCallback(async (productId, qty = 1, silent = false, size = "") => {
    if (!guard()) return false;
    try {
      setBusy(true);
      const res = await CartAPI.add(productId, qty, size);
      setCart(res.data);
      if (!silent) toast.success(tRef.current("prod.addedCart"));
      track("add_to_cart", { productId }); // fire-and-forget
      return true;
    } catch (e) { toast.error(errMsg(e)); return false; } finally { setBusy(false); }
  }, [guard]);

  const updateQty = useCallback(async (productId, qty, options = {}) => {
    try { const res = await CartAPI.update(productId, qty, options); setCart(res.data); }
    catch (e) { toast.error(errMsg(e)); }
  }, []);

  const removeFromCart = useCallback(async (productId, options = {}) => {
    try { const res = await CartAPI.remove(productId, options); setCart(res.data); }
    catch (e) { toast.error(errMsg(e)); }
  }, []);

  const clearCart = useCallback(async () => {
    try { await CartAPI.clear(); setCart(emptyCart); } catch (e) { toast.error(errMsg(e)); }
  }, []);

  /* ───────── WISHLIST ───────── */
  const toggleWishlist = useCallback(async (productId) => {
    if (!guard()) return;
    if (pendingWish.current.has(productId)) return; // ignore double-clicks while in flight
    pendingWish.current.add(productId);

    // 1) INSTANT UI: flip heart + count immediately
    const willBeWished = !wishIds.has(productId);
    setWishOverride((o) => ({ ...o, [productId]: willBeWished }));

    try {
      // 2) sync with server in the background
      const res = await WishlistAPI.toggle(productId);
      toast.success(res.action === "added" ? tRef.current("prod.addedWish") : tRef.current("prod.removedWish"));
      if (res.action === "added") track("wishlist_add", { productId });

      const w = await WishlistAPI.list();
      setWishlist((w.data || []).filter((x) => x.productId));
    } catch (e) {
      toast.error(errMsg(e)); // override is cleared below, so the UI rolls back
    } finally {
      // 3) server data is now the truth → drop the temporary override
      setWishOverride((o) => {
        const { [productId]: _drop, ...rest } = o;
        return rest;
      });
      pendingWish.current.delete(productId);
    }
  }, [guard, wishIds]);

  const removeWish = useCallback(async (productId) => {
    try {
      await WishlistAPI.remove(productId);
      setWishlist((l) => l.filter((x) => x.productId._id !== productId));
    } catch (e) { toast.error(errMsg(e)); }
  }, []);

  const clearWishlist = useCallback(async () => {
    try { await WishlistAPI.clear(); setWishlist([]); setWishOverride({}); }
    catch (e) { toast.error(errMsg(e)); }
  }, []);

  const moveToCart = useCallback(async (productId) => {
    try {
      await WishlistAPI.moveToCart(productId);
      toast.success(tRef.current("prod.addedCart"));
      await refresh();
    } catch (e) { toast.error(errMsg(e)); }
  }, [refresh]);

  const cartCount = cart.totalItems || 0;
  const wishCount = wishIds.size;

  const value = useMemo(
    () => ({
      cart, wishlist, wishIds, busy, refresh,
      cartCount, wishCount,
      addToCart, updateQty, removeFromCart, clearCart,
      toggleWishlist, removeWish, clearWishlist, moveToCart,
    }),
    [
      cart, wishlist, wishIds, busy, refresh, cartCount, wishCount,
      addToCart, updateQty, removeFromCart, clearCart,
      toggleWishlist, removeWish, clearWishlist, moveToCart,
    ]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);