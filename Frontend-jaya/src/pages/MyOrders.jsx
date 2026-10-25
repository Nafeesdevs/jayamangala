import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Package, Search, Clock, ArrowRight, MessageCircle, FileText,
  XCircle, Filter, Calendar, MapPin, Eye, AlertCircle
} from "lucide-react";
import { OrderAPI } from "../api/services";
import { errMsg } from "../api/client";
import { useLang } from "../context/LangContext";
import { EmptyState, Modal, PageLoader, SafeImg, StatusBadge } from "../components/common/ui";
import { ReceiptScreen } from "../components/common/Receipt";
import { fmtDate, money } from "../utils/format";
import { SITE } from "../config/site";

export default function MyOrders() {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [cancel, setCancel] = useState(null);
  const [reason, setReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const load = () => {
    OrderAPI.mine()
      .then((r) => setOrders(r.data || []))
      .catch(() => setOrders([]));
  };

  useEffect(() => {
    load();
  }, []);

  const doCancel = async () => {
    if (!cancel) return;
    setCancelling(true);
    try {
      await OrderAPI.cancel(cancel.orderId, reason || undefined);
      toast.success(t("ord.cancelled") || "Order cancelled successfully");
      setCancel(null);
      setReason("");
      load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setCancelling(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && ["Ordered", "Processing", "Shipped", "Out for Delivery"].includes(o.status)) ||
        (statusFilter === "DELIVERED" && o.status === "Delivered") ||
        (statusFilter === "CANCELLED" && o.status === "Cancelled");

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.orderId?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const counts = useMemo(() => {
    if (!orders) return { all: 0, active: 0, delivered: 0, cancelled: 0 };
    return {
      all: orders.length,
      active: orders.filter((o) => ["Ordered", "Processing", "Shipped", "Out for Delivery"].includes(o.status)).length,
      delivered: orders.filter((o) => o.status === "Delivered").length,
      cancelled: orders.filter((o) => o.status === "Cancelled").length,
    };
  }, [orders]);

  if (!orders) return <PageLoader label="Fetching your orders..." />;

  return (
    <div className="container-x py-6 sm:py-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary-700 sm:text-4xl">
            {t("ord.title") || "My Orders"}
          </h1>
          <p className="mt-1 text-xs text-ink-soft sm:text-sm">
            Track, view receipts, and manage your past and active orders
          </p>
        </div>
        <Link to="/track" className="btn-outline btn-sm gap-1.5 text-xs">
          <Search className="h-3.5 w-3.5" />
          {t("nav.track") || "Track an Order"}
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { id: "ALL", label: `All Orders (${counts.all})` },
            { id: "ACTIVE", label: `In Progress (${counts.active})` },
            { id: "DELIVERED", label: `Delivered (${counts.delivered})` },
            { id: "CANCELLED", label: `Cancelled (${counts.cancelled})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-full px-3.5 py-1.5 transition ${
                statusFilter === tab.id
                  ? "bg-secondary-700 text-white shadow-sm"
                  : "bg-white text-secondary-700 border border-cream-sand hover:bg-cream-deep/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px] sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <input
            className="input pl-8 py-1.5 text-xs"
            placeholder="Search by Order ID or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={orders.length === 0 ? (t("ord.empty") || "No orders yet") : "No matching orders"}
            text={
              orders.length === 0
                ? (t("ord.emptyD") || "Your order history will appear here once you place an order.")
                : "Try adjusting your search or status filter."
            }
            action={
              <Link to="/products" className="btn-primary">
                {t("nav.products") || "Browse Products"}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {filteredOrders.map((o) => {
            const canCancel = ["Ordered", "Processing"].includes(o.status);
            const waMsg = encodeURIComponent(
              `Hi Jayamangala Agro Foods! Regarding my Order *${o.orderId}*, could I please get an update?`
            );

            return (
              <div key={o._id} className="card overflow-hidden transition-all duration-300 hover:shadow-lift">
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-line bg-cream-deep/40 px-4 py-3 text-xs sm:px-5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <div>
                      <span className="text-ink-soft">Order ID: </span>
                      <strong className="font-mono text-secondary-800">{o.orderId}</strong>
                    </div>
                    <div>
                      <span className="text-ink-soft">Placed on: </span>
                      <span className="font-medium text-secondary-700">{fmtDate(o.createdAt)}</span>
                    </div>
                    <div>
                      <span className="text-ink-soft">Total: </span>
                      <strong className="text-primary-600">{money(o.pricing?.total)}</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={o.status} prefix="st" />
                    <span className="badge bg-white text-ink-soft ring-1 ring-ink-line">
                      {o.payment?.method === "COD" ? "Cash on Delivery" : "UPI"} · {t(`pay.${o.payment?.status}`) || o.payment?.status}
                    </span>
                  </div>
                </div>

                {/* Items Listing */}
                <div className="px-4 py-4 sm:px-5">
                  <ul className="divide-y divide-ink-line/60">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex items-center gap-3 py-2.5 text-sm">
                        <SafeImg
                          src={i.image}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-xl object-cover bg-cream-deep/60 sm:h-14 sm:w-14"
                        />
                        <div className="line-clamp-2 min-w-0 flex-1">
                          <Link
                            to={`/product/${i.product}`}
                            className="font-medium text-secondary-800 transition hover:text-primary-600"
                          >
                            {i.name}
                          </Link>
                          {i.size && (
                            <p className="text-xs text-ink-soft">
                              Pack: <span className="font-semibold text-secondary-700">{i.size} {i.unit || ""}</span>
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs text-ink-soft">× {i.quantity}</span>
                        <span className="shrink-0 text-right font-semibold text-secondary-800 sm:w-24">
                          {money((i.price || 0) * (i.quantity || 1))}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Actions Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink-line pt-4">
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/track/${o.orderId}`} className="btn-green btn-sm gap-1.5 text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        {t("ord.track") || "Live Tracking"}
                      </Link>
                      <button
                        className="btn-outline btn-sm gap-1.5 text-xs"
                        onClick={() => setReceipt(o)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {t("ord.receipt") || "View Receipt"}
                      </button>
                      <a
                        href={`https://wa.me/${SITE.whatsapp}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline btn-sm gap-1.5 text-xs text-[#25D366] hover:bg-green-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Support
                      </a>
                    </div>

                    {canCancel && (
                      <button
                        className="btn-danger btn-sm text-xs"
                        onClick={() => setCancel(o)}
                      >
                        {t("ord.cancel") || "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-screen receipt portal */}
      <ReceiptScreen order={receipt} onClose={() => setReceipt(null)} />

      {/* Cancel Order Modal */}
      <Modal
        open={!!cancel}
        onClose={() => setCancel(null)}
        title={t("ord.cancelAsk") || "Cancel Order?"}
        footer={
          <>
            <button className="btn-outline" onClick={() => setCancel(null)}>
              {t("common.back") || "Back"}
            </button>
            <button className="btn-primary" onClick={doCancel} disabled={cancelling}>
              {cancelling ? "Cancelling..." : (t("ord.cancel") || "Confirm Cancellation")}
            </button>
          </>
        }
      >
        <p className="text-xs text-ink-soft mb-3">
          Orders can only be cancelled before they are shipped. Stock will automatically be returned.
        </p>
        <label className="label">{t("ord.cancelReason") || "Reason for cancellation (optional)"}</label>
        <textarea
          className="input h-20 text-sm"
          placeholder="e.g. Changed delivery address, placed by mistake..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}
