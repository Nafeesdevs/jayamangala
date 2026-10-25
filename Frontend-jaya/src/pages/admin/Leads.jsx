import { useEffect, useMemo, useState } from "react";
import {
  Phone, Mail, Building2, MessageSquare, CheckCircle2, Clock,
  TrendingUp, XCircle, ChevronDown, Search, Trash2, StickyNote,
  Calendar, AlertCircle, FileText, Plus, ShieldCheck, History
} from "lucide-react";
import { LeadAPI, QuotationAPI, ProductAPI } from "../../api/services";
import { PageLoader, StatusBadge } from "../../components/common/ui";
import { PageHeader, ExportImport } from "../../components/admin/AdminKit";
import { fmtDate, money } from "../../utils/format";
import toast from "react-hot-toast";

// 6 Core Funnel Statuses + backward-compat mappings
const STATUSES = ["New", "Contacted", "Qualified", "Quote Sent", "Won", "Lost"];

const STATUS_COLOR = {
  New: "bg-sky-50 text-sky-700 border-sky-200",
  Contacted: "bg-amber-50 text-amber-700 border-amber-200",
  Qualified: "bg-purple-50 text-purple-700 border-purple-200",
  "Quote Sent": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Won: "bg-green-50 text-green-700 border-green-200",
  Lost: "bg-rose-50 text-rose-700 border-rose-200",
  // Legacy mappings
  Quoted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Converted: "bg-green-50 text-green-700 border-green-200",
  Closed: "bg-slate-50 text-slate-500 border-slate-200",
};

const STATUS_DOT = {
  New: "bg-sky-500",
  Contacted: "bg-amber-400",
  Qualified: "bg-purple-500",
  "Quote Sent": "bg-indigo-500",
  Won: "bg-green-500",
  Lost: "bg-rose-500",
  Quoted: "bg-indigo-400",
  Converted: "bg-green-500",
  Closed: "bg-slate-300",
};

function LeadStatusBadge({ status }) {
  const norm = status === "Quoted" ? "Quote Sent" : status === "Converted" ? "Won" : status === "Closed" ? "Lost" : status;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[status] || STATUS_COLOR[norm] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || STATUS_DOT[norm] || "bg-slate-400"}`} />
      {norm}
    </span>
  );
}

// ─────────────────────────────── Lead Detail Drawer ─────────────────────────
function LeadDrawer({ lead, products, onClose, onLeadUpdated, onDelete }) {
  const [currentLead, setCurrentLead] = useState(lead);
  const [activeTab, setActiveTab] = useState("overview"); // overview | followUp | quote | timeline
  const [status, setStatus] = useState(lead.status);
  const [note, setNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);

  // Follow-up state
  const [followUpDate, setFollowUpDate] = useState(
    lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toISOString().slice(0, 10) : ""
  );
  const [followUpTime, setFollowUpTime] = useState(lead.followUpTime || "11:00");
  const [followUpPriority, setFollowUpPriority] = useState(lead.followUpPriority || "Medium");
  const [followUpNotes, setFollowUpNotes] = useState(lead.followUpNotes || "");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // Quotations state
  const [quotations, setQuotations] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteItems, setQuoteItems] = useState([
    { name: lead.productInterest?.[0] || "Wood Pressed Groundnut Oil", quantity: 50, unit: "Litre", unitPrice: 220 }
  ]);
  const [taxRate, setTaxRate] = useState(5);
  const [creatingQuote, setCreatingQuote] = useState(false);

  // Load latest lead details + quotes on mount
  useEffect(() => {
    LeadAPI.get(lead._id)
      .then(res => {
        if (res.data) {
          setCurrentLead(res.data);
          setStatus(res.data.status);
          if (res.data.nextFollowUpDate) {
            setFollowUpDate(new Date(res.data.nextFollowUpDate).toISOString().slice(0, 10));
          }
          if (res.data.followUpTime) setFollowUpTime(res.data.followUpTime);
          if (res.data.followUpPriority) setFollowUpPriority(res.data.followUpPriority);
          if (res.data.followUpNotes) setFollowUpNotes(res.data.followUpNotes);
        }
      })
      .catch(() => {});

    setLoadingQuotes(true);
    QuotationAPI.forLead(lead._id)
      .then(res => setQuotations(res.data || []))
      .catch(() => setQuotations([]))
      .finally(() => setLoadingQuotes(false));
  }, [lead._id]);

  const saveStatus = async () => {
    if (status === currentLead.status) return;
    setSavingStatus(true);
    try {
      const res = await LeadAPI.setStatus(currentLead._id, status);
      setCurrentLead(res.data);
      onLeadUpdated(res.data);
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  const submitNote = async () => {
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      const res = await LeadAPI.addNote(currentLead._id, note.trim());
      setCurrentLead(res.data);
      onLeadUpdated(res.data);
      setNote("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const saveFollowUp = async (markComplete = false) => {
    setSavingFollowUp(true);
    try {
      const payload = {
        nextFollowUpDate: markComplete ? null : (followUpDate || null),
        followUpTime: markComplete ? "" : followUpTime,
        followUpPriority: markComplete ? "Medium" : followUpPriority,
        followUpNotes,
        isFollowUpCompleted: markComplete
      };
      const res = await LeadAPI.updateFollowUp(currentLead._id, payload);
      setCurrentLead(res.data);
      onLeadUpdated(res.data);
      if (markComplete) {
        setFollowUpDate("");
        toast.success("Follow-up marked as completed");
      } else {
        toast.success("Follow-up scheduled");
      }
    } catch {
      toast.error("Failed to update follow-up");
    } finally {
      setSavingFollowUp(false);
    }
  };

  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, { name: "", quantity: 10, unit: "Litre", unitPrice: 200 }]);
  };

  const removeQuoteItem = (idx) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== idx));
  };

  const updateQuoteItem = (idx, field, val) => {
    const updated = [...quoteItems];
    updated[idx][field] = val;
    setQuoteItems(updated);
  };

  const quoteSubtotal = useMemo(() => {
    return quoteItems.reduce((acc, it) => acc + (Number(it.quantity || 0) * Number(it.unitPrice || 0)), 0);
  }, [quoteItems]);

  const quoteTax = useMemo(() => {
    return Math.round((quoteSubtotal * (Number(taxRate || 0) / 100)) * 100) / 100;
  }, [quoteSubtotal, taxRate]);

  const quoteGrandTotal = quoteSubtotal + quoteTax;

  const submitQuotation = async () => {
    if (quoteItems.length === 0 || quoteSubtotal <= 0) {
      toast.error("Add at least one item with valid quantity and price");
      return;
    }
    setCreatingQuote(true);
    try {
      const res = await QuotationAPI.create({
        leadId: currentLead._id,
        items: quoteItems,
        taxRate: Number(taxRate || 0),
        validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      });
      toast.success("Quotation created!");
      setQuotations([res.data, ...quotations]);
      // Refetch lead to reflect "Quote Sent" status & timeline
      const lRes = await LeadAPI.get(currentLead._id);
      if (lRes.data) {
        setCurrentLead(lRes.data);
        setStatus(lRes.data.status);
        onLeadUpdated(lRes.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create quotation");
    } finally {
      setCreatingQuote(false);
    }
  };

  const updateQuoteStatus = async (quoteId, qStatus) => {
    try {
      await QuotationAPI.setStatus(quoteId, qStatus);
      setQuotations(prev => prev.map(q => q._id === quoteId ? { ...q, status: qStatus } : q));
      const lRes = await LeadAPI.get(currentLead._id);
      if (lRes.data) {
        setCurrentLead(lRes.data);
        setStatus(lRes.data.status);
        onLeadUpdated(lRes.data);
      }
      toast.success(`Quotation marked as ${qStatus}`);
    } catch {
      toast.error("Failed to update quotation");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      await LeadAPI.remove(currentLead._id);
      onDelete(currentLead._id);
      onClose();
      toast.success("Lead deleted");
    } catch {
      toast.error("Failed to delete lead");
    }
  };

  const waMsg = encodeURIComponent(
    `Hi ${currentLead.name}, this is Jayamangala Agro Foods regarding your enquiry for ${(currentLead.productInterest || []).join(", ") || "our cold-pressed oils"}. Could we discuss your requirements?`
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="animate-fade absolute inset-0 bg-secondary-900/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative z-[51] flex h-full w-full max-w-[560px] animate-slideIn flex-col overflow-y-auto overscroll-contain border-l border-cream-sand bg-[#fdfbf7] shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-cream-sand bg-[#fdfbf7]/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="font-display text-lg font-bold text-secondary-700">{currentLead.name}</p>
            {currentLead.company && <p className="text-sm text-ink-soft">{currentLead.company}</p>}
          </div>
          <LeadStatusBadge status={currentLead.status} />
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-cream-sand bg-cream-deep/40 px-5 text-xs font-semibold">
          {[
            { id: "overview", label: "Overview", icon: Building2 },
            { id: "followUp", label: "Follow-up", icon: Calendar },
            { id: "quote", label: `Quotes (${quotations.length})`, icon: FileText },
            { id: "timeline", label: "Timeline", icon: History },
          ].map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 border-b-2 px-3 py-3 transition ${
                  active ? "border-primary-600 text-primary-700 font-bold" : "border-transparent text-ink-soft hover:text-secondary-700"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col gap-5 p-5">

          {/* Quick Contact Bar */}
          <div className="flex flex-wrap gap-2">
            <a href={`https://wa.me/${currentLead.phone.replace(/\D/g, "")}?text=${waMsg}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-primary btn-sm gap-1.5 text-xs">
              <Phone className="h-3.5 w-3.5" />WhatsApp
            </a>
            <a href={`tel:${currentLead.phone.replace(/\s/g, "")}`} className="btn-outline btn-sm text-xs">
              <Phone className="h-3.5 w-3.5" />Call
            </a>
            {currentLead.email && (
              <a href={`mailto:${currentLead.email}`} className="btn-outline btn-sm text-xs">
                <Mail className="h-3.5 w-3.5" />Email
              </a>
            )}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Lead info */}
              <div className="card divide-y divide-ink-line text-sm">
                {[
                  ["Phone", currentLead.phone],
                  ["Email", currentLead.email || "—"],
                  ["Company", currentLead.company || "—"],
                  ["Products Interested", (currentLead.productInterest || []).join(", ") || "—"],
                  ["Estimated Quantity", currentLead.estimatedQuantity || "—"],
                  ["Source", currentLead.source || "—"],
                  ["Next Follow-up", currentLead.nextFollowUpDate ? `${fmtDate(currentLead.nextFollowUpDate)} (${currentLead.followUpPriority || "Medium"})` : "None scheduled"],
                  ["Submitted", fmtDate(currentLead.createdAt)],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3 px-4 py-2.5">
                    <span className="w-36 shrink-0 text-xs text-ink-soft">{k}</span>
                    <span className="min-w-0 break-words font-medium text-secondary-700">{v}</span>
                  </div>
                ))}
                {currentLead.message && (
                  <div className="px-4 py-3">
                    <p className="mb-1 text-xs text-ink-soft">Message</p>
                    <p className="text-sm leading-relaxed text-secondary-700">{currentLead.message}</p>
                  </div>
                )}
              </div>

              {/* Status update */}
              <div className="card p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-soft">Update Pipeline Status</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="input appearance-none pr-8 text-sm"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
                  </div>
                  <button onClick={saveStatus} disabled={savingStatus || status === currentLead.status}
                    className="btn-primary btn-sm shrink-0 disabled:opacity-50">
                    {savingStatus ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="card p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Follow-up Notes ({(currentLead.notes || []).length})
                </p>
                {(currentLead.notes || []).length > 0 && (
                  <ul className="mb-3 space-y-2">
                    {[...currentLead.notes].reverse().map((n, i) => (
                      <li key={i} className="rounded-xl bg-cream-deep/60 px-3 py-2.5 text-sm">
                        <p className="text-secondary-700">{n.text}</p>
                        <p className="mt-1 text-[10px] text-ink-faint">{fmtDate(n.addedAt)}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <input
                    className="input flex-1 text-sm"
                    placeholder="Add a follow-up note…"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitNote()}
                  />
                  <button onClick={submitNote} disabled={addingNote || !note.trim()}
                    className="btn-primary btn-sm shrink-0 disabled:opacity-50">
                    <StickyNote className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: FOLLOW-UP MANAGEMENT */}
          {activeTab === "followUp" && (
            <div className="card p-4 space-y-4">
              <div>
                <h3 className="font-display font-bold text-secondary-700">Schedule Next Follow-up</h3>
                <p className="text-xs text-ink-soft">Set reminders for calling or meeting this lead</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Date</label>
                  <input
                    type="date"
                    className="input text-sm"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label text-xs">Time</label>
                  <input
                    type="time"
                    className="input text-sm"
                    value={followUpTime}
                    onChange={(e) => setFollowUpTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="label text-xs">Priority</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFollowUpPriority(p)}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-semibold border transition ${
                        followUpPriority === p
                          ? (p === "High" ? "bg-rose-500 text-white border-rose-500" : p === "Medium" ? "bg-amber-500 text-white border-amber-500" : "bg-sky-500 text-white border-sky-500")
                          : "border-cream-sand bg-white text-secondary-700 hover:bg-cream-deep/40"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label text-xs">Follow-up Goal / Instructions</label>
                <textarea
                  className="input text-sm h-20"
                  placeholder="e.g. Call to discuss pricing for 200L groundnut oil order..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => saveFollowUp(false)}
                  disabled={savingFollowUp}
                  className="btn-primary flex-1 text-xs"
                >
                  {savingFollowUp ? "Saving..." : "Save Schedule"}
                </button>
                {currentLead.nextFollowUpDate && (
                  <button
                    onClick={() => saveFollowUp(true)}
                    disabled={savingFollowUp}
                    className="btn-outline text-xs text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: QUOTATION MANAGEMENT */}
          {activeTab === "quote" && (
            <div className="space-y-4">
              {/* Existing Quotations */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-secondary-700 text-sm">Issued Quotations</h3>
                {loadingQuotes ? (
                  <p className="text-xs text-ink-soft">Loading quotations...</p>
                ) : quotations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-cream-sand p-4 text-center text-xs text-ink-soft">
                    No quotations generated yet for this lead.
                  </div>
                ) : (
                  quotations.map(q => (
                    <div key={q._id} className="card p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-secondary-700">{q.quotationNumber}</span>
                        <span className={`rounded-full px-2 py-0.5 font-bold ${
                          q.status === "Accepted" ? "bg-green-100 text-green-700" :
                          q.status === "Rejected" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700"
                        }`}>
                          {q.status}
                        </span>
                      </div>
                      <div className="divide-y divide-ink-line/50">
                        {q.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between py-1 text-ink-soft">
                            <span>{it.name} ({it.quantity} {it.unit} @ ₹{it.unitPrice})</span>
                            <span className="font-medium text-secondary-700">₹{it.total}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between border-t border-ink-line pt-2 font-bold text-secondary-700">
                        <span>Total (inc. {q.taxRate}% tax)</span>
                        <span>₹{q.grandTotal.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex gap-2 pt-1">
                        {q.status !== "Accepted" && (
                          <button
                            onClick={() => updateQuoteStatus(q._id, "Accepted")}
                            className="btn-outline btn-sm text-[11px] text-green-700 bg-green-50 border-green-200"
                          >
                            Mark Accepted
                          </button>
                        )}
                        {q.status !== "Rejected" && (
                          <button
                            onClick={() => updateQuoteStatus(q._id, "Rejected")}
                            className="btn-outline btn-sm text-[11px] text-rose-700 bg-rose-50 border-rose-200"
                          >
                            Mark Rejected
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Create New Quotation Form */}
              <div className="card p-4 space-y-3">
                <h4 className="font-display font-bold text-secondary-700 text-sm">Generate New Quotation</h4>
                
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="rounded-xl bg-cream-deep/40 p-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-secondary-700">Item #{idx + 1}</span>
                      {quoteItems.length > 1 && (
                        <button onClick={() => removeQuoteItem(idx)} className="text-rose-600 hover:underline">
                          Remove
                        </button>
                      )}
                    </div>
                    <input
                      className="input text-xs"
                      placeholder="Product Name (e.g. Cold Pressed Sesame Oil)"
                      value={item.name}
                      onChange={(e) => updateQuoteItem(idx, "name", e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-ink-soft">Qty</label>
                        <input
                          type="number"
                          className="input text-xs"
                          value={item.quantity}
                          onChange={(e) => updateQuoteItem(idx, "quantity", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-ink-soft">Unit</label>
                        <input
                          className="input text-xs"
                          value={item.unit}
                          onChange={(e) => updateQuoteItem(idx, "unit", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-ink-soft">Unit Price (₹)</label>
                        <input
                          type="number"
                          className="input text-xs"
                          value={item.unitPrice}
                          onChange={(e) => updateQuoteItem(idx, "unitPrice", e.target.value)}
                        />
                      </div>
                    </div>
                    <p className="text-right font-semibold text-secondary-700">
                      Line Total: ₹{(Number(item.quantity || 0) * Number(item.unitPrice || 0)).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addQuoteItem}
                  className="btn-outline btn-sm w-full text-xs gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Product Item
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-ink-soft">GST Rate (%)</span>
                  <input
                    type="number"
                    className="input w-20 text-right text-xs"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>

                <div className="rounded-xl bg-peach/40 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-ink-soft">Subtotal</span>
                    <span className="font-semibold text-secondary-700">₹{quoteSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-soft">GST ({taxRate}%)</span>
                    <span className="font-semibold text-secondary-700">₹{quoteTax.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between border-t border-primary-200 pt-1 font-bold text-sm text-secondary-700">
                    <span>Grand Total</span>
                    <span>₹{quoteGrandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  onClick={submitQuotation}
                  disabled={creatingQuote}
                  className="btn-primary w-full text-xs"
                >
                  {creatingQuote ? "Creating Quotation..." : "Create & Send Quotation"}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TIMELINE */}
          {activeTab === "timeline" && (
            <div className="card p-4">
              <h3 className="font-display font-bold text-secondary-700 text-sm mb-3">Activity Audit Trail</h3>
              {(currentLead.timeline || []).length === 0 ? (
                <p className="text-xs text-ink-soft">No activity recorded yet.</p>
              ) : (
                <ol className="relative border-l border-cream-sand ml-2 space-y-4">
                  {[...(currentLead.timeline || [])].reverse().map((ev, i) => (
                    <li key={i} className="ml-4">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-primary-600" />
                      <p className="font-semibold text-xs text-secondary-700">{ev.action}</p>
                      {ev.details && <p className="text-xs text-ink-soft">{ev.details}</p>}
                      <p className="text-[10px] text-ink-faint mt-0.5">
                        {fmtDate(ev.createdAt)} · By {ev.performedByName || "Admin"}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}

          {/* Delete lead */}
          <button onClick={handleDelete}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-600 hover:text-white mt-auto">
            <Trash2 className="h-3.5 w-3.5" /> Delete this lead
          </button>
        </div>
      </aside>
    </div>
  );
}

// ─────────────────────────────── Main Page ───────────────────────────────────
export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [followUpFilter, setFollowUpFilter] = useState(""); // "" | "today" | "overdue"
  const [selected, setSelected] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        LeadAPI.list({ limit: 200, followUpFilter }),
        LeadAPI.stats()
      ]);
      setLeads(leadsRes.data || []);
      setStatsData(statsRes);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [followUpFilter]);

  const filtered = useMemo(() => {
    return leads.filter(l => {
      // Status mapping normalized
      const leadStatus = l.status === "Quoted" ? "Quote Sent" : l.status === "Converted" ? "Won" : l.status === "Closed" ? "Lost" : l.status;
      const matchStatus = !statusFilter || leadStatus === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        l.name?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        (l.productInterest || []).some(p => p.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [leads, search, statusFilter]);

  const counts = useMemo(() => {
    const res = {};
    STATUSES.forEach(s => {
      res[s] = leads.filter(l => {
        const norm = l.status === "Quoted" ? "Quote Sent" : l.status === "Converted" ? "Won" : l.status === "Closed" ? "Lost" : l.status;
        return norm === s;
      }).length;
    });
    return res;
  }, [leads]);

  const handleLeadUpdated = (updatedLead) => {
    setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l));
    setSelected(prev => prev?._id === updatedLead._id ? updatedLead : prev);
  };

  const handleDelete = (id) => {
    setLeads(prev => prev.filter(l => l._id !== id));
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader title="Leads & Sales CRM" subtitle={`${leads.length} active enquiries in pipeline`}>
        <ExportImport
          name="crm-leads"
          getRows={() => filtered.map(l => ({
            Name: l.name,
            Company: l.company,
            Phone: l.phone,
            Email: l.email,
            Products: (l.productInterest || []).join(", "),
            Quantity: l.estimatedQuantity,
            Status: l.status,
            FollowUpDue: l.nextFollowUpDate ? fmtDate(l.nextFollowUpDate) : "None",
            Date: fmtDate(l.createdAt)
          }))}
        />
      </PageHeader>

      {/* Actionable Follow-up Badges */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-4">
        <button
          onClick={() => setFollowUpFilter(followUpFilter === "today" ? "" : "today")}
          className={`card p-3 text-left transition ${followUpFilter === "today" ? "ring-2 ring-amber-500 bg-amber-50/70" : "hover:bg-cream-deep/40"}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Follow-ups Today</span>
            <Calendar className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-amber-800">{statsData?.followUpsToday || 0}</p>
        </button>

        <button
          onClick={() => setFollowUpFilter(followUpFilter === "overdue" ? "" : "overdue")}
          className={`card p-3 text-left transition ${followUpFilter === "overdue" ? "ring-2 ring-rose-500 bg-rose-50/70" : "hover:bg-cream-deep/40"}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">Overdue Follow-ups</span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-rose-800">{statsData?.followUpsOverdue || 0}</p>
        </button>

        <div className="card p-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">Pending Quotes</span>
            <FileText className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-indigo-800">{counts["Quote Sent"] || 0}</p>
        </div>

        <div className="card p-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-green-700">Converted (Won)</span>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </div>
          <p className="mt-1 font-display text-2xl font-bold text-green-800">{counts["Won"] || 0}</p>
        </div>
      </div>

      {/* 6 Sales Pipeline Funnel Status Summary Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 sm:gap-3">
        {STATUSES.map((s) => {
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(isActive ? "" : s)}
              className={`rounded-xl border p-3 text-left transition ${
                isActive ? "ring-2 ring-primary-600 bg-white shadow-lift" : "bg-white/80 hover:bg-white shadow-card"
              } ${STATUS_COLOR[s] || "border-cream-sand"}`}
            >
              <p className="text-xl font-bold">{counts[s] || 0}</p>
              <p className="mt-0.5 text-xs font-semibold text-ink-soft truncate">{s}</p>
            </button>
          );
        })}
      </div>

      {/* Search & filter bar */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            className="input pl-9 text-sm"
            placeholder="Search leads by name, phone, company, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {(statusFilter || followUpFilter) && (
          <button
            onClick={() => { setStatusFilter(""); setFollowUpFilter(""); }}
            className="flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100"
          >
            <XCircle className="h-3.5 w-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Leads table */}
      <section className="card mt-5 overflow-hidden">
        {/* Mobile list */}
        <ul className="divide-y divide-ink-line md:hidden">
          {filtered.map(l => (
            <li key={l._id} className="flex cursor-pointer items-start justify-between gap-3 px-4 py-3.5 text-sm hover:bg-cream-deep/40" onClick={() => setSelected(l)}>
              <div className="min-w-0">
                <p className="font-semibold text-secondary-700">{l.name}</p>
                {l.company && <p className="truncate text-xs text-ink-soft">{l.company}</p>}
                <p className="mt-0.5 text-xs text-ink-faint">{l.phone}</p>
                <p className="mt-1 text-xs text-ink-soft">{(l.productInterest || []).slice(0, 2).join(", ")}</p>
                {l.nextFollowUpDate && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
                    <Clock className="h-3 w-3" /> Due {fmtDate(l.nextFollowUpDate)}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <LeadStatusBadge status={l.status} />
                <p className="text-[10px] text-ink-faint">{fmtDate(l.createdAt)}</p>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-ink-soft">No leads found.</li>
          )}
        </ul>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Name / Company</th>
                <th className="th">Contact</th>
                <th className="th">Products Interested</th>
                <th className="th">Follow-up</th>
                <th className="th">Status</th>
                <th className="th">Date</th>
                <th className="th">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line">
              {filtered.map(l => (
                <tr key={l._id} className="cursor-pointer hover:bg-cream-deep/30" onClick={() => setSelected(l)}>
                  <td className="td">
                    <p className="font-semibold text-secondary-700">{l.name}</p>
                    {l.company && <p className="text-xs text-ink-soft">{l.company}</p>}
                  </td>
                  <td className="td">
                    <p className="font-medium">{l.phone}</p>
                    {l.email && <p className="text-xs text-ink-soft">{l.email}</p>}
                  </td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      {(l.productInterest || []).slice(0, 3).map(p => (
                        <span key={p} className="pill text-xs">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="td">
                    {l.nextFollowUpDate ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
                        <Clock className="h-3 w-3" /> {fmtDate(l.nextFollowUpDate)}
                      </span>
                    ) : (
                      <span className="text-xs text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="td"><LeadStatusBadge status={l.status} /></td>
                  <td className="td text-ink-soft">{fmtDate(l.createdAt)}</td>
                  <td className="td" onClick={e => e.stopPropagation()}>
                    <a
                      href={`https://wa.me/${l.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${l.name}, this is Jayamangala Agro Foods regarding your enquiry.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="btn-primary btn-sm text-xs"
                    >
                      <Phone className="h-3 w-3" /> WA
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td className="td py-8 text-center text-ink-soft" colSpan={7}>No leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lead detail drawer */}
      {selected && (
        <LeadDrawer
          lead={selected}
          onClose={() => setSelected(null)}
          onLeadUpdated={handleLeadUpdated}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
