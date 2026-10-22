import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Trash2, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { OrderAPI, PaymentAPI } from "../../api/services";
import { errMsg } from "../../api/client";
import { Confirm, Modal, StatusBadge } from "../../components/common/ui";
import { DataTable, ExportImport, PageHeader, Select, Toolbar } from "../../components/admin/AdminKit";
import Receipt from "../../components/common/Receipt";
import { ORDER_STATUSES, fmtDate, inRange, money } from "../../utils/format";

export default function Orders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fl, setFl] = useState({ q: "", status: "", pay: "", method: "", from: "", to: "" });
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState("details");
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [delivery, setDelivery] = useState("");
  const [remark, setRemark] = useState("");
  const [del, setDel] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async (keepId) => {
    const r = await OrderAPI.all();
    setRows(r.data || []);
    if (keepId) openOrder((r.data || []).find((o) => o._id === keepId), true);
    setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, []);
  const set = (k) => (v) => setFl((s) => ({ ...s, [k]: v }));

  const filtered = useMemo(() => rows.filter((o) => {
    const q = fl.q.toLowerCase();
    if (q && !`${o.orderId} ${o.customerDetails?.name} ${o.customerDetails?.phone}`.toLowerCase().includes(q)) return false;
    if (fl.status && o.status !== fl.status) return false;
    if (fl.pay && o.payment?.status !== fl.pay) return false;
    if (fl.method && o.payment?.method !== fl.method) return false;
    return inRange(o.createdAt, fl.from, fl.to);
  }), [rows, fl]);

  function openOrder(o, keepTab) {
    if (!o) return setSel(null);
    setSel(o); setNewStatus(o.status); setNote(""); setRemark("");
    setDelivery(o.deliveryDate ? o.deliveryDate.slice(0, 10) : "");
    if (!keepTab) setTab("details");
  }

  const act = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); toast.success(okMsg); await load(sel._id); }
    catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const isQR = sel?.payment?.method !== "COD";
  const payObj = sel?.payment?.paymentId; // populated { _id, status, transactionId, amount, remark }
  const finished = sel && ["Delivered", "Cancelled"].includes(sel.status);

  const columns = [
    { key: "orderId", header: "Order", sortable: true, render: (o) => <span className="font-mono font-semibold">{o.orderId}</span> },
    { key: "customer", header: "Customer", render: (o) => <div><p className="font-medium">{o.customerDetails?.name}</p><p className="text-xs text-ink-faint">{o.customerDetails?.phone}</p></div>, sortValue: (o) => o.customerDetails?.name, sortable: true },
    { key: "items", header: "Items", render: (o) => o.items?.reduce((n, i) => n + i.quantity, 0) },
    { key: "total", header: "Total", sortable: true, sortValue: (o) => o.pricing?.total, render: (o) => <b>{money(o.pricing?.total)}</b> },
    { key: "method", header: "Payment", render: (o) => <div className="flex flex-col items-start gap-1"><span className="text-xs font-semibold">{o.payment?.method === "COD" ? "COD" : "UPI QR"}</span><StatusBadge status={o.payment?.status} /></div> },
    { key: "status", header: "Status", sortable: true, render: (o) => <StatusBadge status={o.status} /> },
    { key: "createdAt", header: "Date", sortable: true, render: (o) => <span className="whitespace-nowrap">{fmtDate(o.createdAt)}</span> },
    { key: "actions", header: "", render: (o) => (
      <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => openOrder(o)} aria-label="View"><Eye className="h-4 w-4" /></button>
        <button className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" onClick={() => setDel(o)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>) },
  ];

  const dirty = Object.values(fl).some(Boolean);

  return (
    <>
      <PageHeader title="Orders" subtitle={`${rows.length} total`}>
        <ExportImport
          name="orders"
          getRows={() => filtered.map((o) => ({
            "Order ID": o.orderId, Date: fmtDate(o.createdAt, true), Customer: o.customerDetails?.name, Phone: o.customerDetails?.phone,
            Address: `${o.customerDetails?.address} - ${o.customerDetails?.pincode}`, Items: o.items.map((i) => `${i.name}${i.size ? ` (${i.size}${i.unit ? ` ${i.unit}` : ""})` : ""} x${i.quantity}`).join("; "),
            Subtotal: o.pricing?.subtotal, Delivery: o.pricing?.deliveryCharge, Total: o.pricing?.total,
            "Payment method": o.payment?.method, "Payment status": o.payment?.status, "Order status": o.status,
            "Transaction ID": o.payment?.paymentId?.transactionId || "", Screenshot: o.payment?.screenshot || "",
          }))}
        />
      </PageHeader>

      <Toolbar search={fl.q} onSearch={set("q")} placeholder="Search order ID, name or phone" dirty={dirty} onReset={() => setFl({ q: "", status: "", pay: "", method: "", from: "", to: "" })}>
        <Select label="All status" value={fl.status} onChange={set("status")} options={ORDER_STATUSES} />
        <Select label="Any payment" value={fl.pay} onChange={set("pay")} options={["Pending", "Paid", "Failed"]} />
        <Select label="Any method" value={fl.method} onChange={set("method")} options={[{ value: "COD", label: "Cash on delivery" }, { value: "QR", label: "UPI QR" }]} />
        <input type="date" className="input w-auto" value={fl.from} onChange={(e) => set("from")(e.target.value)} aria-label="From date" />
        <input type="date" className="input w-auto" value={fl.to} onChange={(e) => set("to")(e.target.value)} aria-label="To date" />
      </Toolbar>

      <DataTable columns={columns} rows={filtered} loading={loading} empty="No orders found" onRowClick={openOrder} />

      <Modal open={!!sel} onClose={() => setSel(null)} wide title={sel ? `Order ${sel.orderId}` : ""}>
        {sel && (
          <>
            <div className="no-print mb-5 flex gap-1 overflow-x-auto border-b border-ink-line no-scrollbar">
              {[["details", "Details & status"], ["receipt", "Receipt"]].map(([k, l]) => (
                <button key={k} onClick={() => setTab(k)} className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium sm:px-4 ${tab === k ? "border-primary-600 text-primary-600" : "border-transparent text-ink-soft"}`}>{l}</button>
              ))}
            </div>

            {tab === "receipt" ? <Receipt order={sel} /> : (
              <div className="space-y-5 sm:space-y-6">
                <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0 wrap-anywhere rounded-xl bg-ink-wash p-4 text-sm">
                    <p className="mb-1 text-xs font-semibold text-ink-soft">Customer</p>
                    <p className="font-semibold">{sel.customerDetails.name}</p>
                    <p>{sel.customerDetails.phone}</p>
                    <p className="text-ink-soft">{sel.customerDetails.address} – {sel.customerDetails.pincode}</p>
                  </div>
                  <div className="rounded-xl bg-ink-wash p-4 text-sm">
                    <p className="mb-1 text-xs font-semibold text-ink-soft">Summary</p>
                    <p>Placed: <b>{fmtDate(sel.createdAt, true)}</b></p>
                    <p>Total: <b className="text-primary-600">{money(sel.pricing?.total)}</b></p>
                    <div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={sel.status} /><StatusBadge status={sel.payment?.status} /></div>
                  </div>
                </div>

                <ul className="divide-y divide-ink-line rounded-xl border border-ink-line text-sm">
                  {sel.items.map((i, idx) => (
                    <li key={idx} className="flex items-center gap-3 p-3">
                      {i.image ? <img src={i.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-12 shrink-0 rounded-lg bg-ink-wash" />}
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-secondary-900">{i.name}</span>
                          {i.size && (
                            <span className="ml-2 inline-flex items-center rounded bg-cream-deep px-1.5 py-0.5 text-xs font-semibold text-secondary-800">
                              {i.size} {i.unit || ""}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-ink-soft sm:text-sm">{money(i.price)} × {i.quantity}</span>
                      </div>
                      <b className="shrink-0 text-right sm:w-20">{money(i.price * i.quantity)}</b>
                    </li>
                  ))}
                </ul>

                {/* Payment */}
                <div className="rounded-xl border border-ink-line p-4">
                  <p className="mb-3 text-sm font-semibold">Payment — {isQR ? "UPI QR code" : "Cash on delivery"}</p>
                  {isQR ? (
                    <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                      {sel.payment?.screenshot ? (
                        <button type="button" onClick={() => setZoom(true)} className="group relative overflow-hidden rounded-xl border border-ink-line">
                          <img src={sel.payment.screenshot} alt="Payment screenshot" className="h-44 w-full object-cover" />
                          <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-xs text-white">Click to enlarge</span>
                        </button>
                      ) : <p className="text-sm text-ink-soft">No screenshot</p>}
                      <div className="min-w-0 space-y-3 wrap-anywhere text-sm">
                        <p>Transaction ID: <b>{payObj?.transactionId || "—"}</b></p>
                        <p>Paid amount: <b>{payObj?.amount != null ? money(payObj.amount) : "—"}</b> · Payment record: {payObj && <StatusBadge status={payObj.status} />}</p>
                        {payObj?.remark && <p className="text-ink-soft">Remark: {payObj.remark}</p>}
                        {sel.payment?.screenshot && <a className="inline-flex items-center gap-1 text-primary-600 hover:underline" href={sel.payment.screenshot} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Open original</a>}
                        {payObj && sel.status !== "Cancelled" && (
                          <div className="space-y-2 border-t border-ink-line pt-3">
                            <input className="input" placeholder="Remark (optional, shown on rejection)" value={remark} onChange={(e) => setRemark(e.target.value)} />
                            <div className="flex flex-wrap gap-2">
                              <button className="btn-green btn-sm" disabled={busy || payObj.status === "Verified"} onClick={() => act(() => PaymentAPI.setStatus(payObj._id, "Verified", remark), "Payment verified")}><CheckCircle2 className="h-4 w-4" />Verify payment</button>
                              <button className="btn-danger btn-sm" disabled={busy} onClick={() => act(() => PaymentAPI.setStatus(payObj._id, "Rejected", remark), "Payment rejected – order cancelled")}><XCircle className="h-4 w-4" />Reject &amp; cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft">Collect {money(sel.pricing?.total)} in cash on delivery. Payment is marked as paid automatically when the order is delivered.</p>
                  )}
                </div>

                {/* Update status */}
                <div className="rounded-xl border border-ink-line p-4">
                  <p className="mb-3 text-sm font-semibold">Update order status</p>
                  {finished ? <p className="text-sm text-ink-soft">This order is {sel.status.toLowerCase()} and can no longer be changed.</p> : (
                    <>
                      {isQR && sel.payment?.status !== "Paid" && <p className="mb-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Verify the payment above before moving the order beyond “Ordered”.</p>}
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)_auto]">
                        <select className="input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                        <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                        <button className="btn-primary" disabled={busy || newStatus === sel.status} onClick={() => act(() => OrderAPI.setStatus(sel._id, newStatus, note), "Status updated")}>Update</button>
                      </div>
                    </>
                  )}
                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-ink-line pt-4">
                    <div className="min-w-0 flex-1 sm:flex-none"><label className="label">Delivery date</label><input type="date" className="input" value={delivery} onChange={(e) => setDelivery(e.target.value)} /></div>
                    <button className="btn-outline" disabled={busy} onClick={() => act(() => OrderAPI.update(sel._id, { deliveryDate: delivery || null }), "Delivery date saved")}>Save date</button>
                  </div>
                </div>

                {sel.statusHistory?.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold">History</p>
                    <ul className="space-y-1.5 text-sm">
                      {[...sel.statusHistory].reverse().map((h, i) => (
                        <li key={i} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-3"><span className="min-w-0"><b>{h.status}</b>{h.note && <span className="text-ink-soft"> — {h.note}</span>}</span><span className="shrink-0 text-xs text-ink-faint">{fmtDate(h.updatedAt, true)}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal open={zoom} onClose={() => setZoom(false)} wide title="Payment screenshot">
        <img src={sel?.payment?.screenshot} alt="Payment screenshot" className="mx-auto max-h-[70vh] rounded-lg object-contain" />
      </Modal>

      <Confirm open={!!del} busy={busy} title="Delete order?" text={`Order ${del?.orderId} will be removed permanently. Stock is returned if it was not cancelled.`}
        onClose={() => setDel(null)}
        onConfirm={async () => { setBusy(true); try { await OrderAPI.remove(del._id); toast.success("Order deleted"); setDel(null); setSel(null); load(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } }} />
    </>
  );
}
