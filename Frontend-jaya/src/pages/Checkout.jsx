import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, ImagePlus, MessageCircle, QrCode, Wallet, Copy } from "lucide-react";
import { OrderAPI, PaymentAPI } from "../api/services";
import { errMsg } from "../api/client";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LangContext";
import { Field, SafeImg, Spinner } from "../components/common/ui";
import { money } from "../utils/format";
import { SITE } from "../config/site";
import { track } from "../hooks/useAnalytics";

export default function Checkout() {
  const { cart, refresh } = useShop();
  const { user } = useAuth();
  const { t } = useLang();
  const items = (cart.items || []).filter((i) => i.productId);

  const defAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [f, setF] = useState({
    name: user?.name || "",
    phone: user?.phoneno || "",
    address: defAddr ? [defAddr.street, defAddr.city, defAddr.state].filter(Boolean).join(", ") : "",
    pincode: defAddr?.zipCode || "",
  });
  const [method, setMethod] = useState("COD");
  const [qr, setQr] = useState(null);
  const [txn, setTxn] = useState("");
  const [shot, setShot] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const uploaded = useRef(null); // { key, paymentId } – avoids uploading twice if the order call fails
  const fileRef = useRef();

  useEffect(() => {
    void PaymentAPI.qr().then((r) => setQr(r.data)).catch(() => {});
    // Track checkout start (fire-and-forget)
    track("checkout_start");

    return () => {
      // If user unmounts checkout without completing the order, log drop-off
      if (!uploaded.current?.completed) {
        track("checkout_dropoff");
      }
    };
  }, []);

  const delivery = Number(qr?.deliveryCharge ?? import.meta.env.VITE_DELIVERY_CHARGE ?? 0);
  const subtotal = cart.totalAmount || 0;
  const total = subtotal + delivery;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    setShot(file);
    setPreview(URL.createObjectURL(file));
  };

  if (done) {
    const waOrderMsg = encodeURIComponent(
      `Hi Jayamangala Agro Foods! I just placed Order *${done.orderId}*. Please confirm my order. Thank you!`
    );
    const waOrderLink = `https://wa.me/${SITE.whatsapp}?text=${waOrderMsg}`;
    return (
      <div className="container-x py-16">
        <div className="card mx-auto max-w-md p-6 text-center sm:p-8">
          <CheckCircle2 className="mx-auto h-16 w-16 text-secondary-600" />
          <h1 className="mt-4 font-display text-3xl font-bold text-secondary-700">{t("co.success")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{t("co.successD")}</p>
          <p className="mt-4 rounded-lg bg-ink-wash py-2 font-mono text-sm font-semibold">{done.orderId}</p>
          {done.payment?.method === "QR" && <p className="mt-3 text-xs text-ink-soft">{t("co.verifyNote")}</p>}
          {/* WhatsApp order confirmation */}
          <a
            href={waOrderLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-105 active:scale-95"
            onClick={() => track("wa_order_confirm", { orderId: done.orderId })}
          >
            <MessageCircle className="h-5 w-5" />
            {t("wa.confirmOrder")}
          </a>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/orders" className="btn-primary">{t("co.viewOrder")}</Link>
            <Link to={`/track/${done.orderId}`} className="btn-outline">{t("ord.track")}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!items.length) return <Navigate to="/cart" replace />;

  const place = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.phone.trim() || !f.address.trim() || !f.pincode.trim()) return toast.error("Please fill all delivery details");
    if (!/^\d{6}$/.test(f.pincode.trim())) return toast.error("Enter a valid 6-digit pincode");
    if (method === "UPI" && !shot) return toast.error(t("co.shotNeed"));

    setBusy(true);
    try {
      const body = { name: f.name.trim(), phone: f.phone.trim(), address: f.address.trim(), pincode: f.pincode.trim() };
      if (method === "COD") {
        body.paymentMethod = "COD";
      } else {
        const key = `${shot.name}-${shot.size}-${total}`;
        if (uploaded.current?.key !== key) {
          const up = await PaymentAPI.upload({ amount: total, transactionId: txn.trim() || undefined, screenshot: shot });
          uploaded.current = { key, paymentId: up.data._id };
        }
        body.paymentMethod = "QR";
        body.paymentId = uploaded.current.paymentId;
      }
      const res = await OrderAPI.create(body);
      if (uploaded.current) uploaded.current.completed = true;
      else uploaded.current = { completed: true };
      setDone(res.data);
      // Track successful order placement (fire-and-forget)
      track("order_placed", { orderId: res.data?.orderId });
      refresh();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const Option = ({ id, icon: Icon, title, desc }) => (
    <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${method === id ? "border-secondary-600 bg-secondary-50 ring-1 ring-secondary-600" : "border-ink-line hover:border-secondary-300"}`}>
      <input type="radio" name="pm" className="mt-1 accent-secondary-600" checked={method === id} onChange={() => setMethod(id)} />
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-secondary-700" />
      <div><p className="text-sm font-semibold">{title}</p><p className="text-xs text-ink-soft">{desc}</p></div>
    </label>
  );

  return (
    <form onSubmit={place} className="container-x py-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("co.title")}</h1>
      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5 sm:space-y-6">
          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-semibold">{t("co.delivery")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("co.name")}><input className="input" value={f.name} onChange={set("name")} required /></Field>
              <Field label={t("co.phone")}><input className="input" inputMode="numeric" value={f.phone} onChange={set("phone")} required /></Field>
              <div className="sm:col-span-2"><Field label={t("co.address")}><textarea className="input min-h-[84px]" value={f.address} onChange={set("address")} required /></Field></div>
              <Field label={t("co.pincode")}><input className="input" inputMode="numeric" maxLength={6} value={f.pincode} onChange={set("pincode")} required /></Field>
            </div>
          </section>

          <section className="card p-5 sm:p-6">
            <h2 className="mb-4 font-semibold">{t("co.payment")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Option id="COD" icon={Wallet} title={t("co.cod")} desc={t("co.codD")} />
              <Option id="UPI" icon={QrCode} title={t("co.upi")} desc={t("co.upiD")} />
            </div>

            {method === "UPI" && (
              <div className="mt-6 grid gap-6 rounded-xl border border-ink-line p-4 sm:grid-cols-2 sm:p-5">
                <div className="text-center">
                  <p className="mb-3 text-sm font-semibold">{t("co.scan")}</p>
                  <SafeImg src={qr?.qrImage} alt="UPI QR" className="mx-auto aspect-square w-full max-w-[13rem] rounded-xl border border-ink-line object-contain p-2" fallback={<QrCode className="h-16 w-16" />} />
                  <p className="mt-3 text-xs text-ink-soft">{t("co.payAmount")}</p>
                  <p className="text-xl font-extrabold text-primary-600">{money(total)}</p>
                  {qr?.upiId && (
                    <button type="button" className="mt-2 inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 wrap-anywhere text-xs text-ink-soft hover:text-primary-600"
                      onClick={() => { navigator.clipboard?.writeText(qr.upiId); toast.success("UPI ID copied"); }}>
                      {t("co.upiId")}: <b>{qr.upiId}</b> <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {qr?.payeeName && <p className="mt-1 text-xs text-ink-faint">{t("co.payee")}: {qr.payeeName}</p>}
                </div>

                <div className="space-y-4">
                  <Field label={t("co.txn")}><input className="input" value={txn} onChange={(e) => setTxn(e.target.value)} /></Field>
                  <div>
                    <span className="label">{t("co.shot")} *</span>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt="Screenshot" className="max-h-52 w-full rounded-xl border border-ink-line object-contain" />
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="inline-flex items-center gap-1 font-semibold text-secondary-700"><CheckCircle2 className="h-4 w-4" />{t("co.shotOk")}</span>
                          <button type="button" className="text-primary-600 hover:underline" onClick={() => fileRef.current.click()}>{t("co.change")}</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current.click()}
                        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-ink-line py-8 text-sm text-ink-soft hover:border-secondary-600 hover:text-secondary-700">
                        <ImagePlus className="h-7 w-7" />{t("co.chooseFile")}
                      </button>
                    )}
                    {!preview && <p className="mt-2 text-xs text-primary-600">{t("co.shotNeed")}</p>}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="card h-fit min-w-0 p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-semibold">{t("cart.summary")}</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => {
              const p = item.productId;
              const quantity = item.quantity;
              const size = item.size;
              return (
                <li key={item._id || `${p._id}-${size}`} className="flex items-center gap-3 text-sm">
                  <SafeImg src={p.productimage} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  <div className="line-clamp-2 min-w-0 flex-1">
                    <p className="font-medium text-secondary-800">{p.name} <span className="text-ink-faint">× {quantity}</span></p>
                    {size && (
                      <p className="text-xs text-ink-soft">
                        Size: <span className="font-semibold text-secondary-700">{size} {p.unit || ""}</span>
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold">{money(p.price * quantity)}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 space-y-2 border-t border-ink-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-ink-soft">{t("common.subtotal")}</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">{t("common.delivery")}</span><span>{delivery ? money(delivery) : t("common.free")}</span></div>
            <div className="flex justify-between border-t border-ink-line pt-3 text-lg font-bold"><span>{t("common.total")}</span><span className="text-primary-600">{money(total)}</span></div>
          </div>
          <button className="btn-primary mt-5 w-full py-3" disabled={busy || (method === "UPI" && !shot)}>
            {busy ? <><Spinner className="h-4 w-4 !text-white" />{t("co.placing")}</> : t("co.place")}
          </button>
        </aside>
      </div>
    </form>
  );
}
