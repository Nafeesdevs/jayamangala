import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Download, Upload, Search, ImagePlus, FileSpreadsheet } from "lucide-react";
import { Pagination, EmptyState, PageLoader, SafeImg } from "../common/ui";
import { exportRows, readSheet, downloadTemplate } from "../../utils/excel";

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-[1.75rem] font-bold leading-tight text-secondary-700 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-0.5 font-script text-xl font-bold leading-tight text-primary-600 sm:text-2xl sm:leading-none">{subtitle}</p>}
        <span className="mt-2 block h-1 w-14 rounded-full bg-gold-400" />
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 [&>*]:shrink-0">{children}</div>}
    </div>
  );
}

// Export (xlsx / csv) + optional Import (xlsx / csv) buttons
export function ExportImport({ name, getRows, onImport, template }) {
  const ref = useRef();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const doExport = (fmt) => {
    const rows = getRows();
    if (!rows.length) return toast.error("Nothing to export");
    exportRows(rows, name, fmt);
    setOpen(false);
  };

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const rows = await readSheet(file);
      if (!rows.length) return toast.error("The file has no rows");
      await onImport(rows);
    } catch (err) { toast.error(err.message || "Import failed"); } finally { setBusy(false); }
  };

  return (
    <>
      <div className="relative">
        <button className="btn-outline" onClick={() => setOpen(!open)}><Download className="h-4 w-4" />Export</button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 z-20 mt-1 w-40 sm:left-auto sm:right-0 overflow-hidden rounded-2xl border border-cream-sand bg-white shadow-lift animate-pop">
              <button className="block w-full px-4 py-2.5 text-left text-sm hover:bg-ink-wash" onClick={() => doExport("xlsx")}>Excel (.xlsx)</button>
              <button className="block w-full px-4 py-2.5 text-left text-sm hover:bg-ink-wash" onClick={() => doExport("csv")}>CSV (.csv)</button>
            </div>
          </>
        )}
      </div>
      {onImport && (
        <>
          <input ref={ref} type="file" accept=".xlsx,.xls,.csv" hidden onChange={pick} />
          <button className="btn-outline" disabled={busy} onClick={() => ref.current.click()}><Upload className="h-4 w-4" />{busy ? "Importing…" : "Import"}</button>
          {template && (
            <button className="btn-ghost" title="Download an empty import template" onClick={() => downloadTemplate(name, template)}>
              <FileSpreadsheet className="h-4 w-4" />Template
            </button>
          )}
        </>
      )}
    </>
  );
}

// Search box + any filter controls as children
export function Toolbar({ search, onSearch, placeholder = "Search…", children, onReset, dirty }) {
  return (
    <div className="card mb-4 grid grid-cols-2 items-center gap-2 p-3 sm:flex sm:flex-wrap sm:gap-3 max-sm:[&>*]:min-w-0 max-sm:[&>input]:w-full max-sm:[&>select]:w-full">
      <div className="relative col-span-2 min-w-0 sm:min-w-[200px] sm:flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input className="input pl-9" placeholder={placeholder} value={search} onChange={(e) => onSearch(e.target.value)} />
      </div>
      {children}
      {dirty && <button className="btn-ghost btn-sm col-span-2 sm:col-span-1" onClick={onReset}>Reset</button>}
    </div>
  );
}

export const Select = ({ value, onChange, options, label }) => (
  <select className="input w-full min-w-0 sm:w-auto sm:min-w-[140px]" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
    <option value="">{label}</option>
    {options.map((o) => (typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
  </select>
);

// columns: [{ key, header, render?(row), className?, sortable? }]
export function DataTable({ columns, rows, loading, perPage = 10, empty = "No records found", onRowClick }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: null, dir: 1 });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const val = (r) => (col.sortValue ? col.sortValue(r) : r[sort.key]);
    return [...rows].sort((a, b) => {
      const x = val(a), y = val(b);
      if (x == null) return 1;
      if (y == null) return -1;
      return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / perPage));
  const cur = Math.min(page, pages);
  const view = sorted.slice((cur - 1) * perPage, cur * perPage);

  if (loading) return <PageLoader />;
  if (!rows.length) return <EmptyState title={empty} />;

  // Phone layout helpers: image column becomes the card thumbnail, the first text column the card title,
  // the header-less column (row actions) sits in the card footer, everything else is a label/value row.
  const isMedia = (c) => /^(image|img|logo|photo)$/i.test(String(c.header || ""));
  const media = columns.find(isMedia);
  const actionCol = columns.find((c) => !c.header);
  const titleCol = columns.find((c) => c.header && !isMedia(c));
  const restCols = columns.filter((c) => c !== media && c !== actionCol && c !== titleCol);
  const cell = (c, r) => (c.render ? c.render(r) : r[c.key]);
  const sortable = columns.filter((c) => c.sortable);

  return (
    <div className="card overflow-hidden">
      {/* ── phones, tablets & small laptops (sidebar eats 256px): stacked cards ── */}
      <div className="xl:hidden">
        {sortable.length > 0 && (
          <div className="flex items-center gap-2 border-b border-cream-sand/70 bg-cream-deep/40 px-3 py-2.5">
            <span className="shrink-0 text-xs font-bold text-secondary-700">Sort</span>
            <select className="input min-w-0 flex-1 !py-1.5" value={sort.key || ""} aria-label="Sort by"
              onChange={(e) => { setSort({ key: e.target.value || null, dir: sort.dir }); setPage(1); }}>
              <option value="">Default</option>
              {sortable.map((c) => <option key={c.key} value={c.key}>{c.header}</option>)}
            </select>
            <button type="button" className="btn-outline btn-sm shrink-0" disabled={!sort.key} aria-label="Toggle sort direction"
              onClick={() => setSort((s) => ({ ...s, dir: -s.dir }))}>{sort.dir === 1 ? "↑ Asc" : "↓ Desc"}</button>
          </div>
        )}
        <ul className="divide-y divide-cream-sand/70 md:grid md:grid-cols-2 md:gap-px md:divide-y-0 md:bg-cream-sand/60">
          {view.map((r, i) => (
            <li key={r._id || i} className={`bg-white p-4 transition-colors active:bg-primary-50/40 ${onRowClick ? "cursor-pointer" : ""}`} onClick={() => onRowClick?.(r)}>
              <div className="flex items-start gap-3">
                {media && <div className="shrink-0">{cell(media, r)}</div>}
                <div className="min-w-0 flex-1 wrap-anywhere text-sm [&_.line-clamp-1]:line-clamp-2 [&_[class*=max-w-]]:max-w-none">{titleCol && cell(titleCol, r)}</div>
                {actionCol && <div className="-mr-2 -mt-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>{cell(actionCol, r)}</div>}
              </div>
              {restCols.length > 0 && (
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 rounded-2xl bg-ink-wash/60 p-3 text-sm">
                  {restCols.map((c) => (
                    <div key={c.key} className="min-w-0">
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{c.header}</dt>
                      <dd className="mt-0.5 min-w-0 wrap-anywhere [&_[class*=max-w-]]:max-w-none">{cell(c, r)}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ── laptops & desktops: table ── */}
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`th ${c.sortable ? "cursor-pointer select-none hover:text-ink" : ""}`}
                  onClick={() => c.sortable && setSort((s) => ({ key: c.key, dir: s.key === c.key ? -s.dir : 1 }))}>
                  {c.header}{sort.key === c.key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-sand/70">
            {view.map((r, i) => (
              <tr key={r._id || i} className={`transition-colors hover:bg-primary-50/40 ${onRowClick ? "cursor-pointer" : ""}`} onClick={() => onRowClick?.(r)}>
                {columns.map((c) => <td key={c.key} className={`td ${c.className || ""}`}>{c.render ? c.render(r) : r[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-ink-line px-4 py-3 text-xs text-ink-soft sm:flex-row sm:flex-wrap">
        <span>Showing {(cur - 1) * perPage + 1}–{Math.min(cur * perPage, sorted.length)} of {sorted.length}</span>
        <Pagination page={cur} pages={pages} onChange={setPage} />
      </div>
    </div>
  );
}

export function ImagePicker({ value, onChange, label = "Image" }) {
  const ref = useRef();
  const [preview, setPreview] = useState("");
  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB");
    onChange(f);
    setPreview(URL.createObjectURL(f));
  };
  const shown = preview || (typeof value === "string" ? value : "");
  return (
    <div>
      <span className="label">{label}</span>
      <input ref={ref} type="file" accept="image/*" hidden onChange={pick} />
      <button type="button" onClick={() => ref.current.click()} className="flex w-full items-center gap-3 rounded-2xl sm:gap-4 border-2 border-dashed border-cream-sand p-3 text-left hover:border-primary-600 hover:bg-primary-50/40">
        {shown ? <img src={shown} alt="" className="h-16 w-16 rounded-lg object-cover" /> :
          <span className="flex h-16 w-16 items-center justify-center rounded-lg bg-ink-wash text-ink-faint"><ImagePlus className="h-6 w-6" /></span>}
        <span className="text-sm text-ink-soft">{shown ? "Click to replace image" : "Click to upload an image (max 5 MB)"}</span>
      </button>
    </div>
  );
}

export const Thumb = ({ src, round }) => (
  <SafeImg src={src} alt="" className={`h-11 w-11 shrink-0 object-cover ring-2 ring-white shadow-sm ${round ? "rounded-full" : "rounded-[.9rem_.3rem_.9rem_.3rem]"}`} />
);

// Run async tasks one by one with a summary toast (used by imports)
export async function runImport(rows, fn, label) {
  let ok = 0; const failed = [];
  const id = toast.loading(`Importing ${rows.length} ${label}…`);
  for (let i = 0; i < rows.length; i++) {
    try { await fn(rows[i]); ok++; } catch (e) { failed.push(`Row ${i + 2}: ${e?.response?.data?.message || e.message}`); }
  }
  toast.dismiss(id);
  if (failed.length) {
    toast.error(`${ok} imported, ${failed.length} failed. ${failed.slice(0, 2).join(" | ")}`, { duration: 8000 });
  } else toast.success(`${ok} ${label} imported`);
  return ok;
}

// case-insensitive column getter for import rows
export const pick = (row, ...keys) => {
  const map = Object.fromEntries(Object.keys(row).map((k) => [k.toLowerCase().replace(/\s+/g, ""), row[k]]));
  for (const k of keys) { const v = map[k.toLowerCase().replace(/\s+/g, "")]; if (v !== undefined && v !== "") return v; }
  return "";
};
