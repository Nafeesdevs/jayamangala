import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, PackageSearch, XCircle } from "lucide-react";
import { OrderAPI } from "../api/services";
import { useLang } from "../context/LangContext";
import { PageLoader, StatusBadge } from "../components/common/ui";
import { fmtDate } from "../utils/format";

export default function TrackOrder() {
  const { id } = useParams();
  const nav = useNavigate();
  const { t } = useLang();
  const [input, setInput] = useState(id || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setInput(id || "");
    if (!id) { setData(null); setError(""); return; }
    setLoading(true); setError("");
    void OrderAPI.track(id)
      .then((r) => setData(r.data))
      .catch(() => { setData(null); setError(t("ord.notFound")); })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const submit = (e) => { e.preventDefault(); if (input.trim()) nav(`/track/${input.trim().toUpperCase()}`); };
  const cancelled = data?.status === "Cancelled";

  return (
    <div className="container-x max-w-3xl py-6 sm:py-12">
      <h1 className="font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("ord.trackTitle")}</h1>
      <form onSubmit={submit} className="mt-6 flex gap-2">
        <input className="input min-w-0" placeholder={t("ord.trackPh")} value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn-primary shrink-0"><PackageSearch className="h-4 w-4" />{t("ord.trackBtn")}</button>
      </form>

      {loading && <PageLoader />}
      {error && <p className="mt-6 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">{error}</p>}

      {data && (
        <div className="card mt-6 p-5 sm:mt-8 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-ink-soft">{t("ord.id")}</p>
              <p className="font-mono text-lg font-bold">{data.orderId}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={data.status} prefix="st" />
              <StatusBadge status={data.paymentStatus} prefix="pay" />
            </div>
          </div>
          {data.deliveryDate && <p className="mt-3 text-sm text-ink-soft">{t("ord.expected")}: <b className="text-ink">{fmtDate(data.deliveryDate)}</b></p>}

          {cancelled ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl bg-primary-50 p-4 text-primary-700">
              <XCircle className="h-5 w-5 shrink-0" />
              <div><p className="font-semibold">{t("st.Cancelled")}</p>{data.cancelReason && <p className="text-sm">{data.cancelReason}</p>}</div>
            </div>
          ) : (
            <ol className="mt-8">
              {data.steps.map((s, i) => {
                const last = i === data.steps.length - 1;
                const nextDone = data.steps[i + 1]?.completed;
                return (
                  <li key={s.status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${s.completed ? "border-secondary-600 bg-secondary-600 text-white" : "border-ink-line bg-white text-ink-faint"}`}>
                        {s.completed ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-ink-line" />}
                      </span>
                      {!last && <span className={`my-1 w-0.5 flex-1 min-h-[28px] ${nextDone ? "bg-secondary-600" : "bg-ink-line"}`} />}
                    </div>
                    <p className={`pb-6 pt-1 text-sm ${s.completed ? "font-semibold" : "text-ink-faint"}`}>{t(`st.${s.status}`)}</p>
                  </li>
                );
              })}
            </ol>
          )}

          {data.history?.length > 0 && (
            <div className="mt-6 border-t border-ink-line pt-5">
              <h3 className="mb-3 text-sm font-semibold">{t("ord.history")}</h3>
              <ul className="space-y-3">
                {[...data.history].reverse().map((h, i) => (
                  <li key={i} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:justify-between sm:gap-4">
                    <span className="min-w-0"><b>{t(`st.${h.status}`)}</b>{h.note && <span className="text-ink-soft"> — {h.note}</span>}</span>
                    <span className="shrink-0 text-xs text-ink-faint">{fmtDate(h.updatedAt, true)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
