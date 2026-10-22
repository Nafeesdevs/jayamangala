// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import toast from "react-hot-toast";
// import { OrderAPI } from "../api/services";
// import { errMsg } from "../api/client";
// import { useLang } from "../context/LangContext";
// import { EmptyState, Modal, PageLoader, SafeImg, StatusBadge } from "../components/common/ui";
// import Receipt from "../components/common/Receipt";
// import { fmtDate, money } from "../utils/format";

// export default function MyOrders() {
//   const { t } = useLang();
//   const [orders, setOrders] = useState(null);
//   const [receipt, setReceipt] = useState(null);
//   const [cancel, setCancel] = useState(null);
//   const [reason, setReason] = useState("");

//   const load = () => OrderAPI.mine().then((r) => setOrders(r.data || [])).catch(() => setOrders([]));
//   useEffect(() => { load(); }, []);

//   const doCancel = async () => {
//     try {
//       await OrderAPI.cancel(cancel.orderId, reason || undefined);
//       toast.success(t("ord.cancelled"));
//       setCancel(null); setReason(""); load();
//     } catch (e) { toast.error(errMsg(e)); }
//   };

//   if (!orders) return <PageLoader />;

//   return (
//     <div className="container-x py-6 sm:py-12">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <h1 className="font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("ord.title")}</h1>
//         <Link to="/track" className="btn-outline btn-sm">{t("nav.track")}</Link>
//       </div>

//       {orders.length === 0 ? (
//         <div className="mt-8"><EmptyState title={t("ord.empty")} text={t("ord.emptyD")} action={<Link to="/products" className="btn-primary">{t("nav.products")}</Link>} /></div>
//       ) : (
//         <div className="mt-8 space-y-5">
//           {orders.map((o) => (
//             <div key={o._id} className="card overflow-hidden">
//               <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line bg-ink-wash px-4 py-3 text-sm sm:px-5">
//                 <div className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8">
//                   <div><p className="text-xs text-ink-soft">{t("ord.id")}</p><p className="font-mono font-semibold">{o.orderId}</p></div>
//                   <div><p className="text-xs text-ink-soft">{t("ord.placed")}</p><p className="font-medium">{fmtDate(o.createdAt)}</p></div>
//                   <div><p className="text-xs text-ink-soft">{t("common.total")}</p><p className="font-bold text-primary-600">{money(o.pricing?.total)}</p></div>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   <StatusBadge status={o.status} prefix="st" />
//                   <span className="badge bg-white text-ink-soft ring-1 ring-ink-line">{o.payment?.method === "COD" ? "COD" : "UPI"} · {t(`pay.${o.payment?.status}`)}</span>
//                 </div>
//               </div>
//               <div className="px-4 py-4 sm:px-5">
//                 <ul className="space-y-3">
//                   {o.items.map((i, idx) => (
//                     <li key={idx} className="flex items-center gap-3 text-sm">
//                       <SafeImg src={i.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14" />
//                       <Link to={`/product/${i.product}`} className="line-clamp-2 min-w-0 flex-1 font-medium hover:text-primary-600">{i.name}</Link>
//                       <span className="shrink-0 text-ink-soft">× {i.quantity}</span>
//                       <span className="shrink-0 text-right font-semibold sm:w-20">{money(i.price * i.quantity)}</span>
//                     </li>
//                   ))}
//                 </ul>
//                 <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-line pt-4">
//                   <Link to={`/track/${o.orderId}`} className="btn-green btn-sm">{t("ord.track")}</Link>
//                   <button className="btn-outline btn-sm" onClick={() => setReceipt(o)}>{t("ord.receipt")}</button>
//                   {["Ordered", "Processing"].includes(o.status) && (
//                     <button className="btn-danger btn-sm" onClick={() => setCancel(o)}>{t("ord.cancel")}</button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <Modal open={!!receipt} onClose={() => setReceipt(null)} title={t("ord.receipt")} wide>
//         <Receipt order={receipt} />
//       </Modal>

//       <Modal open={!!cancel} onClose={() => setCancel(null)} title={t("ord.cancelAsk")}
//         footer={<><button className="btn-outline" onClick={() => setCancel(null)}>{t("common.back")}</button><button className="btn-primary" onClick={doCancel}>{t("ord.cancel")}</button></>}>
//         <label className="label">{t("ord.cancelReason")}</label>
//         <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
//       </Modal>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { OrderAPI } from "../api/services";
import { errMsg } from "../api/client";
import { useLang } from "../context/LangContext";
import { EmptyState, Modal, PageLoader, SafeImg, StatusBadge } from "../components/common/ui";
import { ReceiptScreen } from "../components/common/Receipt";
import { fmtDate, money } from "../utils/format";

export default function MyOrders() {
  const { t } = useLang();
  const [orders, setOrders] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [reason, setReason] = useState("");

  const load = () => OrderAPI.mine().then((r) => setOrders(r.data || [])).catch(() => setOrders([]));
  useEffect(() => { load(); }, []);

  const doCancel = async () => {
    try {
      await OrderAPI.cancel(cancel.orderId, reason || undefined);
      toast.success(t("ord.cancelled"));
      setCancel(null); setReason(""); load();
    } catch (e) { toast.error(errMsg(e)); }
  };

  if (!orders) return <PageLoader />;

  return (
    <div className="container-x py-6 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("ord.title")}</h1>
        <Link to="/track" className="btn-outline btn-sm">{t("nav.track")}</Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8"><EmptyState title={t("ord.empty")} text={t("ord.emptyD")} action={<Link to="/products" className="btn-primary">{t("nav.products")}</Link>} /></div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((o) => (
            <div key={o._id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line bg-ink-wash px-4 py-3 text-sm sm:px-5">
                <div className="flex flex-wrap gap-x-6 gap-y-2 sm:gap-x-8">
                  <div><p className="text-xs text-ink-soft">{t("ord.id")}</p><p className="font-mono font-semibold">{o.orderId}</p></div>
                  <div><p className="text-xs text-ink-soft">{t("ord.placed")}</p><p className="font-medium">{fmtDate(o.createdAt)}</p></div>
                  <div><p className="text-xs text-ink-soft">{t("common.total")}</p><p className="font-bold text-primary-600">{money(o.pricing?.total)}</p></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={o.status} prefix="st" />
                  <span className="badge bg-white text-ink-soft ring-1 ring-ink-line">{o.payment?.method === "COD" ? "COD" : "UPI"} · {t(`pay.${o.payment?.status}`)}</span>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-5">
                <ul className="space-y-3">
                  {o.items.map((i, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm">
                      <SafeImg src={i.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14" />
                      <div className="line-clamp-2 min-w-0 flex-1">
                        <Link to={`/product/${i.product}`} className="font-medium hover:text-primary-600">{i.name}</Link>
                        {i.size && (
                          <p className="text-xs text-ink-soft">
                            Size: <span className="font-semibold text-secondary-700">{i.size} {i.unit || ""}</span>
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-ink-soft">× {i.quantity}</span>
                      <span className="shrink-0 text-right font-semibold sm:w-20">{money(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-line pt-4">
                  <Link to={`/track/${o.orderId}`} className="btn-green btn-sm">{t("ord.track")}</Link>
                  <button className="btn-outline btn-sm" onClick={() => setReceipt(o)}>{t("ord.receipt")}</button>
                  {["Ordered", "Processing"].includes(o.status) && (
                    <button className="btn-danger btn-sm" onClick={() => setCancel(o)}>{t("ord.cancel")}</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full-screen receipt (portal on <body>, sits above header & footer) */}
      <ReceiptScreen order={receipt} onClose={() => setReceipt(null)} />

      <Modal open={!!cancel} onClose={() => setCancel(null)} title={t("ord.cancelAsk")}
        footer={<><button className="btn-outline" onClick={() => setCancel(null)}>{t("common.back")}</button><button className="btn-primary" onClick={doCancel}>{t("ord.cancel")}</button></>}>
        <label className="label">{t("ord.cancelReason")}</label>
        <textarea className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
      </Modal>
    </div>
  );
}