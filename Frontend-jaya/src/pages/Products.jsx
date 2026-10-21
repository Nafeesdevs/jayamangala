import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BrandAPI, CategoryAPI, ProductAPI } from "../api/services";
import { useLang } from "../context/LangContext";
import ProductCard from "../components/common/ProductCard";
import { EmptyState, PageLoader, Pagination } from "../components/common/ui";
import { discountPct } from "../utils/format";

const PER_PAGE = 12;

export default function Products() {
  const { t } = useLang();
  const [sp, setSp] = useSearchParams();
  const [all, setAll] = useState(null);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const brand = sp.get("brand") || "";
  const sort = sp.get("sort") || "new";
  const min = sp.get("min") || "";
  const max = sp.get("max") || "";
  const inStock = sp.get("stock") === "1";

  const setParam = (k, v) => {
    const n = new URLSearchParams(sp);
    if (v === "" || v === false || v == null) n.delete(k); else n.set(k, v === true ? "1" : v);
    setSp(n, { replace: true });
    setPage(1);
  };

  useEffect(() => {
    void (async () => {
      try {
        const [p, c, b] = await Promise.all([ProductAPI.list({ status: "Active" }), CategoryAPI.list(), BrandAPI.list()]);
        setAll(p.data || []);
        setCats((c.data || []).filter((x) => x.status !== "Inactive"));
        setBrands((b.data || []).filter((x) => x.status !== "Inactive"));
      } catch { setAll([]); }
    })();
  }, []);

  const list = useMemo(() => {
    if (!all) return [];
    let r = all.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (category && p.category?._id !== category) return false;
      if (brand && p.brand?._id !== brand) return false;
      if (min && p.price < Number(min)) return false;
      if (max && p.price > Number(max)) return false;
      if (inStock && p.stock <= 0) return false;
      return true;
    });
    const s = {
      new: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name),
      disc: (a, b) => discountPct(b) - discountPct(a),
    }[sort];
    return [...r].sort(s);
  }, [all, q, category, brand, min, max, inStock, sort]);

  if (!all) return <PageLoader />;

  const pages = Math.ceil(list.length / PER_PAGE);
  const view = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const hasFilters = q || category || brand || min || max || inStock;

  const chip = (active) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition ${active ? "border-primary-600 bg-primary-600 text-white" : "border-ink-line hover:border-primary-600"}`;

  const Filters = (
    <div className="space-y-7">
      <div>
        <h4 className="mb-3 text-sm font-semibold">{t("common.category")}</h4>
        <div className="flex flex-wrap gap-2">
          <button className={chip(!category)} onClick={() => setParam("category", "")}>{t("common.all")}</button>
          {cats.map((c) => (
            <button key={c._id} className={chip(category === c._id)} onClick={() => setParam("category", c._id)}>{c.name}</button>
          ))}
        </div>
      </div>
      {brands.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold">{t("common.brand")}</h4>
          <select className="input" value={brand} onChange={(e) => setParam("brand", e.target.value)}>
            <option value="">{t("common.all")}</option>
            {brands.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
      )}
      <div>
        <h4 className="mb-3 text-sm font-semibold">{t("common.price")} (₹)</h4>
        <div className="flex min-w-0 items-center gap-2 [&>input]:min-w-0 [&>input]:px-3">
          <input className="input" type="number" min="0" placeholder={t("prod.minPrice")} value={min} onChange={(e) => setParam("min", e.target.value)} />
          <span className="text-ink-faint">–</span>
          <input className="input" type="number" min="0" placeholder={t("prod.maxPrice")} value={max} onChange={(e) => setParam("max", e.target.value)} />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" className="h-4 w-4 accent-secondary-600" checked={inStock} onChange={(e) => setParam("stock", e.target.checked)} />
        {t("prod.onlyStock")}
      </label>
      {hasFilters && (
        <button className="btn-outline btn-sm w-full" onClick={() => { setSp({}); setPage(1); }}>
          <X className="h-4 w-4" />{t("common.clear")}
        </button>
      )}
    </div>
  );

  return (
    <div className="container-x py-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-secondary-700 sm:text-4xl">{t("prod.title")}</h1>
          <p className="mt-1 text-sm text-ink-soft">{list.length} {t("prod.found")}</p>
        </div>
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto sm:flex-wrap sm:gap-3 lg:flex">
          <div className="relative col-span-2 min-w-0 sm:w-64 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input className="input pl-9" placeholder={t("prod.searchPh")} value={q} onChange={(e) => setParam("q", e.target.value)} />
          </div>
          <select className="input w-full min-w-0 sm:w-auto" value={sort} onChange={(e) => setParam("sort", e.target.value)} aria-label={t("prod.sort")}>
            <option value="new">{t("prod.sortNew")}</option>
            <option value="low">{t("prod.sortLow")}</option>
            <option value="high">{t("prod.sortHigh")}</option>
            <option value="name">{t("prod.sortName")}</option>
            <option value="disc">{t("prod.sortDisc")}</option>
          </select>
          <button className="btn-outline shrink-0 lg:hidden" aria-expanded={showFilters} onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />{t("prod.filters")}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="card animate-fade p-5 lg:sticky lg:top-24 lg:animate-none">{Filters}</div>
        </aside>
        <section className="min-w-0">
          {view.length === 0 ? (
            <EmptyState title={t("common.noResults")} action={hasFilters && <button className="btn-primary" onClick={() => setSp({})}>{t("common.clear")}</button>} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5 xl:gap-6">
                {view.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              <Pagination page={page} pages={pages} onChange={(n) => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
