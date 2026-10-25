import { useEffect } from "react";
import { X, Loader2, PackageOpen } from "lucide-react";
import { statusStyle } from "../../utils/format";
import { useLang } from "../../context/LangContext";

export function Spinner({ className = "" }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <span className="h-full w-full rounded-full border-2 border-white/30 border-t-white animate-spin" />
    </div>
  );
}

export function PageLoader({ label = "Loading..." }) {
  const { lang } = useLang();
  return (
    <div className="flex min-h-[45vh] flex-col items-center justify-center gap-3.5 py-12">
      {/* Brand animated pulse ring with oil drop icon */}
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-primary-500/20 duration-1000" />
        <span className="absolute h-12 w-12 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 shadow-md">
          <svg className="h-4 w-4 text-white animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>
      </div>
      <p className="font-display text-sm font-semibold tracking-wide text-secondary-700 animate-pulse">
        {lang === "ta" ? "தயவுசெய்து காத்திருக்கவும்..." : (label || "Loading pure products...")}
      </p>
    </div>
  );
}

/* Skeleton placeholder for product cards during fast loading */
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[2rem_.8rem_2rem_.8rem] border border-cream-sand/80 bg-white p-3 shadow-card animate-pulse"
        >
          <div className="aspect-square w-full rounded-[1.4rem] bg-cream-deep/60" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-3/4 rounded-md bg-cream-deep/80" />
            <div className="h-3 w-1/2 rounded-md bg-cream-deep/60" />
            <div className="mt-3 flex items-center justify-between pt-1">
              <div className="h-5 w-16 rounded-md bg-cream-deep/80" />
              <div className="h-8 w-8 rounded-full bg-cream-deep/80" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-cream-sand bg-white/60 px-5 py-12 text-center sm:px-6 sm:py-16" style={{ borderRadius: "2.5rem .8rem 2.5rem .8rem" }}>
      <span className="shape-blob mb-4 flex h-16 w-16 animate-floaty items-center justify-center bg-sage text-primary-600">
        <PackageOpen className="h-7 w-7" />
      </span>
      <h3 className="font-display text-xl font-bold text-secondary-700">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-ink-soft">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function StatusBadge({ status, prefix }) {
  const { t } = useLang();
  const label = prefix ? t(`${prefix}.${status}`) : status;
  return <span className={`badge ${statusStyle(status)}`}>{label}</span>;
}

export function Modal({ open, onClose, title, children, wide = false, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-secondary-900/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={onClose}>
      <div
        className={`animate-pop flex max-h-[92vh] max-h-[92dvh] w-full min-w-0 flex-col rounded-t-[2rem] bg-[#fdfbf7] shadow-lift sm:rounded-[2.2rem_.8rem_2.2rem_.8rem] ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="no-print flex items-center justify-between gap-3 border-b border-cream-sand px-4 py-3.5 sm:px-6 sm:py-4">
          <h3 className="min-w-0 truncate font-display text-lg font-bold text-secondary-700 sm:text-xl">{title}</h3>
          <button onClick={onClose} className="shrink-0 rounded-full p-1.5 text-ink-soft transition hover:rotate-90 hover:bg-primary-50 hover:text-primary-600" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-w-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        {footer && <div className="no-print flex flex-wrap justify-end gap-2 border-t border-cream-sand px-4 py-3.5 sm:px-6">{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ open, title, text, confirmLabel = "Delete", onConfirm, onClose, busy }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={busy} onClick={onConfirm}>{confirmLabel}</button>
        </>
      }
    >
      <p className="text-sm text-ink-soft">{text}</p>
    </Modal>
  );
}

export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      <button className="btn-outline btn-sm" disabled={page === 1} onClick={() => onChange(page - 1)}>‹</button>
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={i} className="px-1 text-ink-faint">…</span>
        ) : (
          <button
            key={i}
            onClick={() => onChange(n)}
            className={`btn-sm btn !rounded-full ${n === page ? "bg-primary-600 text-white shadow-glow" : "border border-cream-sand bg-white hover:border-primary-600 hover:text-primary-600"}`}
          >
            {n}
          </button>
        )
      )}
      <button className="btn-outline btn-sm" disabled={page === pages} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  );
}

export function SafeImg({ src, alt = "", className = "", fallback }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-ink-wash text-ink-faint ${className}`}>
        {fallback || <PackageOpen className="h-8 w-8" />}
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" className={className} />;
}
