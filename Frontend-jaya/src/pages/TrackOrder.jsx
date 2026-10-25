import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Check, PackageSearch, XCircle, Clock, Truck, ShieldCheck,
  Calendar, MapPin, Phone, MessageCircle, ArrowLeft, Download,
  Copy, RefreshCw, AlertCircle
} from "lucide-react";
import { OrderAPI } from "../api/services";
import { useLang } from "../context/LangContext";
import { PageLoader, StatusBadge, SafeImg } from "../components/common/ui";
import { fmtDate, money } from "../utils/format";
import { SITE } from "../config/site";
import toast from "react-hot-toast";

const STEP_ICONS = {
  Ordered: Clock,
  Processing: RefreshCw,
  Shipped: Truck,
  "Out for Delivery": Truck,
  Delivered: Check,
};

export default function TrackOrder() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t, lang } = useLang();
  const [input, setInput] = useState(id || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTrack = async (orderId) => {
    if (!orderId) {
      setData(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 1. Try fetching full order details via getsingleorder
      // 2. Also fetch track data, and merge them so items, steps, and pricing are guaranteed
      const [trackRes, orderRes] = await Promise.allSettled([
        OrderAPI.track(orderId),
        OrderAPI.get(orderId)
      ]);

      const tData = trackRes.status === "fulfilled" ? trackRes.value.data : null;
      const oData = orderRes.status === "fulfilled" ? orderRes.value.data : null;

      if (!tData && !oData) {
        throw new Error("Order not found");
      }

      const merged = {
        orderId: tData?.orderId || oData?.orderId || orderId,
        status: tData?.status || oData?.status || "Ordered",
        paymentMethod: tData?.paymentMethod || oData?.payment?.method || "COD",
        paymentStatus: tData?.paymentStatus || oData?.payment?.status || "Pending",
        deliveryDate: tData?.deliveryDate || oData?.deliveryDate,
        cancelReason: tData?.cancelReason || oData?.cancelReason,
        items: (tData?.items?.length ? tData.items : oData?.items) || [],
        pricing: tData?.pricing || oData?.pricing,
        shippingAddress: tData?.shippingAddress || (oData?.customerDetails ? {
          street: oData.customerDetails.address,
          city: "",
          state: "",
          zipCode: oData.customerDetails.pincode
        } : null),
        customerDetails: tData?.customerDetails || oData?.customerDetails,
        createdAt: tData?.createdAt || oData?.createdAt,
        steps: tData?.steps || [
          { status: "Ordered", completed: true },
          { status: "Processing", completed: ["Processing", "Shipped", "Out for Delivery", "Delivered"].includes(oData?.status) },
          { status: "Shipped", completed: ["Shipped", "Out for Delivery", "Delivered"].includes(oData?.status) },
          { status: "Out for Delivery", completed: ["Out for Delivery", "Delivered"].includes(oData?.status) },
          { status: "Delivered", completed: oData?.status === "Delivered" }
        ],
        history: tData?.history || oData?.statusHistory || [],
      };

      setData(merged);
    } catch {
      setData(null);
      setError(t("ord.notFound") || "Order not found. Please verify your Order ID.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setInput(id || "");
    if (id) fetchTrack(id);
  }, [id]);

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      nav(`/track/${input.trim().toUpperCase()}`);
    }
  };

  const copyOrderId = () => {
    if (data?.orderId) {
      navigator.clipboard?.writeText(data.orderId);
      toast.success("Order ID copied to clipboard!");
    }
  };

  const cancelled = data?.status === "Cancelled";

  const waSupportLink = data
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
        `Hi Jayamangala Agro Foods! I need an update regarding my Order *${data.orderId}*.`
      )}`
    : `https://wa.me/${SITE.whatsapp}`;

  return (
    <div className="container-x max-w-4xl py-6 sm:py-12">
      {/* Back button & Page header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-sand bg-white text-secondary-700 transition hover:bg-cream-deep hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-secondary-700 sm:text-3xl">
            {t("ord.trackTitle") || "Track Your Order"}
          </h1>
        </div>
        <a
          href={waSupportLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-105"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp Support
        </a>
      </div>

      {/* Track search form */}
      <div className="card p-4 sm:p-5">
        <form onSubmit={submit} className="flex gap-2">
          <div className="relative flex-1">
            <PackageSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              className="input pl-9 font-mono uppercase"
              placeholder={t("ord.trackPh") || "e.g. JAYA-20261024-XXXX"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <button className="btn-primary shrink-0 px-5 text-sm">
            {t("ord.trackBtn") || "Track"}
          </button>
        </form>
      </div>

      {loading && <PageLoader label="Tracking your order..." />}
      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Order Tracking Dashboard */}
      {data && (
        <div className="mt-6 space-y-6">
          {/* Main Status Header Card */}
          <div className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-line pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Order Reference</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-xl font-bold text-secondary-800">{data.orderId}</span>
                  <button
                    onClick={copyOrderId}
                    className="text-ink-faint transition hover:text-primary-600"
                    title="Copy Order ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {data.createdAt && (
                  <p className="mt-1 text-xs text-ink-soft">
                    Placed on: <strong>{fmtDate(data.createdAt, true)}</strong>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={data.status} prefix="st" />
                  <span className="badge bg-white text-xs font-semibold text-ink-soft ring-1 ring-ink-line">
                    {data.paymentMethod === "COD" ? "Cash on Delivery" : "UPI Payment"} · {data.paymentStatus}
                  </span>
                </div>
                {data.deliveryDate && (
                  <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <Calendar className="h-3.5 w-3.5 text-primary-600" />
                    Estimated Delivery: <strong className="text-secondary-700">{fmtDate(data.deliveryDate)}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* Visual Step Tracker or Cancel Banner */}
            {cancelled ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-rose-700">
                <XCircle className="h-6 w-6 shrink-0 text-rose-600" />
                <div>
                  <p className="font-bold text-base">{t("st.Cancelled") || "Order Cancelled"}</p>
                  <p className="mt-0.5 text-sm text-rose-600">
                    {data.cancelReason ? `Reason: ${data.cancelReason}` : "This order has been cancelled."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                {/* Horizontal Step Bar on Desktop */}
                <div className="hidden sm:block">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-ink-line z-0" />
                    {data.steps.map((s, i) => {
                      const Icon = STEP_ICONS[s.status] || Check;
                      return (
                        <div key={s.status} className="relative z-10 flex flex-col items-center">
                          <span
                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all ${
                              s.completed
                                ? "border-secondary-600 bg-secondary-600 text-white shadow-md"
                                : "border-ink-line bg-white text-ink-faint"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span
                            className={`mt-2.5 text-xs text-center font-semibold ${
                              s.completed ? "text-secondary-800" : "text-ink-faint"
                            }`}
                          >
                            {t(`st.${s.status}`) || s.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Vertical Step Bar on Mobile */}
                <ol className="sm:hidden space-y-4">
                  {data.steps.map((s, i) => {
                    const last = i === data.steps.length - 1;
                    const nextDone = data.steps[i + 1]?.completed;
                    const Icon = STEP_ICONS[s.status] || Check;
                    return (
                      <li key={s.status} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span
                            className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                              s.completed
                                ? "border-secondary-600 bg-secondary-600 text-white"
                                : "border-ink-line bg-white text-ink-faint"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          {!last && (
                            <span
                              className={`my-1 w-0.5 flex-1 min-h-[24px] ${
                                nextDone ? "bg-secondary-600" : "bg-ink-line"
                              }`}
                            />
                          )}
                        </div>
                        <div className="pt-1.5">
                          <p className={`text-sm ${s.completed ? "font-bold text-secondary-800" : "text-ink-faint"}`}>
                            {t(`st.${s.status}`) || s.status}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>

          {/* Items & Shipping Details Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Ordered Items */}
            <div className="card p-5">
              <h2 className="mb-4 font-display text-base font-bold text-secondary-700">Order Items</h2>
              {data.items?.length > 0 ? (
                <ul className="divide-y divide-ink-line">
                  {data.items.map((it, idx) => (
                    <li key={idx} className="flex items-center gap-3 py-2.5 text-sm">
                      <SafeImg
                        src={it.image}
                        alt={it.name}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover bg-cream-deep/60"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-semibold text-secondary-800">{it.name}</p>
                        <p className="text-xs text-ink-soft">
                          {it.size ? `${it.size} ${it.unit || ""} · ` : ""}Qty: {it.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-secondary-700">
                        {money((it.price || 0) * (it.quantity || 1))}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-ink-soft">Item details unavailable.</p>
              )}

              {data.pricing && (
                <div className="mt-4 border-t border-ink-line pt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-ink-soft">
                    <span>Subtotal</span>
                    <span>{money(data.pricing.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-ink-soft">
                    <span>Delivery Charge</span>
                    <span>{money(data.pricing.deliveryCharge || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-ink-line pt-2 font-bold text-sm text-secondary-800">
                    <span>Total Paid / Payable</span>
                    <span className="text-primary-600">{money(data.pricing.total || 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Address & History */}
            <div className="space-y-6">
              {data.shippingAddress && (
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-primary-600" />
                    <h2 className="font-display text-base font-bold text-secondary-700">Shipping Address</h2>
                  </div>
                  <div className="rounded-xl bg-cream-deep/40 p-3.5 text-sm leading-relaxed text-secondary-800">
                    <p className="font-semibold">{data.customerDetails?.name || "Customer"}</p>
                    <p className="text-xs text-ink-soft mt-0.5">{data.customerDetails?.phone}</p>
                    <p className="mt-2 text-xs">{data.shippingAddress.street}</p>
                    <p className="text-xs">
                      {data.shippingAddress.city}, {data.shippingAddress.state} - {data.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Status Audit History */}
              {data.history?.length > 0 && (
                <div className="card p-5">
                  <h2 className="mb-3 font-display text-base font-bold text-secondary-700">Tracking Updates</h2>
                  <ol className="relative border-l border-cream-sand ml-2 space-y-3">
                    {[...data.history].reverse().map((h, i) => (
                      <li key={i} className="ml-3.5">
                        <div className="absolute -left-1.5 mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-600" />
                        <p className="text-xs font-bold text-secondary-800">{t(`st.${h.status}`) || h.status}</p>
                        {h.note && <p className="text-xs text-ink-soft">{h.note}</p>}
                        <p className="text-[10px] text-ink-faint mt-0.5">{fmtDate(h.updatedAt, true)}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
