import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee, ShoppingBag, Package, Users, Clock, AlertTriangle, Briefcase, TrendingUp, Eye, Heart, MessageCircle } from "lucide-react";
import { BrandAPI, CategoryAPI, OrderAPI, ProductAPI, UserAPI, LeadAPI, AnalyticsAPI } from "../../api/services";
import { PageLoader, StatusBadge } from "../../components/common/ui";
import { PageHeader, ExportImport } from "../../components/admin/AdminKit";
import { ORDER_STATUSES, fmtDate, money } from "../../utils/format";
import { CountUp } from "../../components/common/Motion";
import { Sprig } from "../../components/common/Doodles";

const barColor = { Ordered: "bg-sky-500", Processing: "bg-gold-400", Shipped: "bg-indigo-400", "Out for Delivery": "bg-purple-400", Delivered: "bg-secondary-500", Cancelled: "bg-primary-600" };
const radii = ["2rem .6rem 2rem .6rem", ".6rem 2rem .6rem 2rem", "2rem 2rem 2rem .6rem", ".6rem 2rem 2rem 2rem", "2rem .6rem 2rem .6rem"];

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Fetch products independently so a failure in any other endpoint doesn't empty products
    ProductAPI.list().then((p) => {
      const items = Array.isArray(p?.data) ? p.data : Array.isArray(p) ? p : [];
      setD((prev) => ({ ...(prev || { orders: [], users: [], cats: [], brands: [], leadStats: null }), products: items }));
    }).catch(() => {});

    Promise.allSettled([
      OrderAPI.all(),
      UserAPI.list(),
      CategoryAPI.list(),
      BrandAPI.list(),
      LeadAPI.stats()
    ]).then(([o, u, c, b, ls]) => {
      setD((prev) => ({
        orders: o.status === "fulfilled" && o.value?.data ? o.value.data : (prev?.orders || []),
        products: prev?.products || [],
        users: u.status === "fulfilled" && u.value?.data ? u.value.data : (prev?.users || []),
        cats: c.status === "fulfilled" && c.value?.data ? c.value.data : (prev?.cats || []),
        brands: b.status === "fulfilled" && b.value?.data ? b.value.data : (prev?.brands || []),
        leadStats: ls.status === "fulfilled" ? ls.value : null,
      }));
    });

    // Analytics summary — separate call, non-blocking
    AnalyticsAPI.summary().then(setAnalytics).catch(() => {});
  }, []);

  const s = useMemo(() => {
    if (!d) return null;
    const live = d.orders.filter((o) => o.status !== "Cancelled");
    const counts = Object.fromEntries(ORDER_STATUSES.map((x) => [x, d.orders.filter((o) => o.status === x).length]));

    const prods = Array.isArray(d.products) ? d.products : [];

    // 1. First find actual low-stock products (stock <= 10) sorted lowest first
    const lowStockOnly = prods
      .filter((p) => p && Number(p.stock ?? 100) <= 10)
      .sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0));

    // 2. If no products have <= 10, pick the lowest stock products in the store
    const lowestOverallStock = [...prods].sort(
      (a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0)
    ).slice(0, 6);

    const displayLow = lowStockOnly.length > 0 ? lowStockOnly.slice(0, 6) : lowestOverallStock;

    return {
      revenue: live.reduce((n, o) => n + (o.pricing?.total || 0), 0),
      paidRevenue: live.filter((o) => o.payment?.status === "Paid").reduce((n, o) => n + (o.pricing?.total || 0), 0),
      counts,
      pendingPay: d.orders.filter((o) => o.payment?.method !== "COD" && o.payment?.status === "Pending" && o.status !== "Cancelled").length,
      low: displayLow,
      hasLowStock: lowStockOnly.length > 0,
      customers: d.users.filter((u) => u.role === "customer").length,
    };
  }, [d]);

  if (!d) return <PageLoader />;
  const max = Math.max(1, ...Object.values(s.counts));

  const cards = [
    { l: "Revenue", n: Math.round(s.revenue), fmt: money, sub: `${money(s.paidRevenue)} paid`, i: IndianRupee, c: "bg-blush", ic: "text-primary-600", to: null },
    { l: "Orders", n: d.orders.length, sub: `${s.counts.Ordered} new`, i: ShoppingBag, c: "bg-sage", ic: "text-secondary-600", to: "/admin/orders" },
    { l: "Products", n: d.products.length, sub: `${d.cats.length} categories · ${d.brands.length} brands`, i: Package, c: "bg-butter", ic: "text-gold-600", to: "/admin/products" },
    { l: "Customers", n: s.customers, sub: "registered", i: Users, c: "bg-lilac", ic: "text-purple-600", to: "/admin/customers" },
    { l: "Payments to verify", n: s.pendingPay, sub: "UPI screenshots pending", i: Clock, c: "bg-peach", ic: "text-primary-600", to: "/admin/orders" },
    { l: "CRM Follow-ups", n: d.leadStats?.followUpsToday ?? 0, sub: `${d.leadStats?.followUpsOverdue ?? 0} overdue`, i: Briefcase, c: "bg-sage", ic: "text-secondary-600", to: "/admin/leads" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your store">
        <ExportImport name="orders-summary" getRows={() => ORDER_STATUSES.map((x) => ({ Status: x, Orders: s.counts[x] }))} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-6">
        {cards.map((c, idx) => {
          const inner = (
            <div className={`${c.c} group relative min-w-0 overflow-hidden p-4 shadow-card sm:p-5 transition-all duration-500 hover:-translate-y-1.5 hover:rotate-[-1deg] hover:shadow-lift h-full`} style={{ borderRadius: radii[idx % 5], animation: `rise .8s cubic-bezier(.22,1,.36,1) ${idx * 90}ms both` }}>
              <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/40 transition-transform duration-700 group-hover:scale-150" />
              <span className={`relative flex h-10 w-10 items-center sm:h-11 sm:w-11 justify-center rounded-full bg-white shadow-sm transition duration-500 group-hover:rotate-12 group-hover:scale-110 ${c.ic}`}><c.i className="h-5 w-5" /></span>
              <p className="relative mt-3 truncate font-display text-2xl font-bold text-secondary-700 sm:mt-4 sm:text-3xl"><CountUp to={c.n} format={c.fmt} /></p>
              <p className="relative text-sm font-bold text-secondary-700">{c.l}</p>
              <p className="relative font-script text-base font-bold leading-tight text-primary-700/80 sm:text-lg">{c.sub}</p>
            </div>
          );
          return c.to
            ? <Link key={c.l} to={c.to} className="block">{inner}</Link>
            : <div key={c.l}>{inner}</div>;
        })}
      </div>

      <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-2">
        <section className="card min-w-0 p-5 sm:p-6">
          <h2 className="mb-5 font-display text-xl font-bold text-secondary-700">Orders by status</h2>
          <div className="space-y-3">
            {ORDER_STATUSES.map((x) => (
              <div key={x} className="flex items-center gap-3 text-sm">
                <span className="w-[6.5rem] shrink-0 text-xs text-ink-soft sm:w-32 sm:text-sm">{x}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-cream-deep/70"><div className={`bar-grow h-full rounded-full ${barColor[x]}`} style={{ width: `${(s.counts[x] / max) * 100}%` }} /></div>
                <span className="w-8 text-right font-semibold">{s.counts[x]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card relative min-w-0 overflow-hidden p-5 sm:p-6">
          <Sprig className="pointer-events-none absolute -bottom-2 -right-1 h-28 w-16 rotate-12 animate-sway text-secondary-500/15" />
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-secondary-700">
              <AlertTriangle className="h-5 w-5 text-gold-500" />
              Low Stock Alert
            </h2>
            <Link to="/admin/products" className="text-xs font-semibold text-primary-600 hover:underline">
              Manage Products →
            </Link>
          </div>

          {s.low.length === 0 ? (
            <p className="text-sm text-ink-soft">All products are well stocked.</p>
          ) : (
            <ul className="divide-y divide-ink-line text-sm">
              {s.low.map((p) => {
                const stockQty = Number(p.stock ?? 0);
                const isOut = stockQty <= 0;
                const isCritical = stockQty <= 10;
                return (
                  <li key={p._id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <Link to="/admin/products" className="line-clamp-1 font-medium text-secondary-800 hover:text-primary-600">
                        {p.name}
                      </Link>
                      <p className="text-xs text-ink-soft">
                        {money(p.price)}
                      </p>
                    </div>
                    <span
                      className={`badge shrink-0 font-semibold ${
                        isOut
                          ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
                          : isCritical
                          ? "bg-amber-100 text-amber-800 ring-1 ring-amber-200"
                          : "bg-cream-deep text-secondary-700"
                      }`}
                    >
                      {isOut ? "Out of stock" : `${stockQty} left`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="card mt-5 overflow-hidden sm:mt-6">
        <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6"><h2 className="font-display text-xl font-bold text-secondary-700">Recent orders</h2><Link to="/admin/orders" className="text-sm font-medium text-primary-600 hover:underline">View all</Link></div>
        {/* phones: compact list */}
        <ul className="divide-y divide-ink-line border-t border-ink-line md:hidden">
          {d.orders.slice(0, 6).map((o) => (
            <li key={o._id} className="flex items-start justify-between gap-3 px-5 py-3.5 text-sm">
              <div className="min-w-0">
                <p className="truncate font-mono font-semibold">{o.orderId}</p>
                <p className="truncate text-ink-soft">{o.customerDetails?.name}</p>
                <p className="text-xs text-ink-faint">{fmtDate(o.createdAt)}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-semibold">{money(o.pricing?.total)}</span>
                <StatusBadge status={o.status} />
              </div>
            </li>
          ))}
          {d.orders.length === 0 && <li className="px-5 py-3.5 text-sm text-ink-soft">No orders yet.</li>}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead><tr><th className="th">Order</th><th className="th">Customer</th><th className="th">Total</th><th className="th">Status</th><th className="th">Date</th></tr></thead>
            <tbody className="divide-y divide-ink-line">
              {d.orders.slice(0, 6).map((o) => (
                <tr key={o._id}><td className="td font-mono font-semibold">{o.orderId}</td><td className="td">{o.customerDetails?.name}</td><td className="td font-semibold">{money(o.pricing?.total)}</td>
                  <td className="td"><StatusBadge status={o.status} /></td><td className="td text-ink-soft">{fmtDate(o.createdAt)}</td></tr>
              ))}
              {d.orders.length === 0 && <tr><td className="td text-ink-soft" colSpan={5}>No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conversion Funnel Analytics — last 30 days */}
      {analytics && (
        <section className="card mt-5 p-5 sm:mt-6 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary-600" />
              <h2 className="font-display text-xl font-bold text-secondary-700">Conversion Funnel & Analytics <span className="ml-1 text-xs font-normal text-ink-faint">(last 30 days)</span></h2>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-cream-deep px-3 py-1 text-xs font-semibold text-secondary-700">
                Cart → Order: <strong>{analytics.rates?.cartToOrder || 0}%</strong>
              </span>
              <span className="rounded-full bg-cream-deep px-3 py-1 text-xs font-semibold text-secondary-700">
                Checkout Completion: <strong>{analytics.rates?.checkoutCompletion || 0}%</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Product Views", key: "product_view", count: analytics.funnel?.views ?? analytics.counts?.product_view ?? 0, icon: Eye, color: "bg-butter" },
              { label: "Cart Adds", key: "add_to_cart", count: analytics.funnel?.cartAdds ?? analytics.counts?.add_to_cart ?? 0, icon: ShoppingBag, color: "bg-sage" },
              { label: "Checkout Starts", key: "checkout_start", count: analytics.funnel?.checkoutStarts ?? analytics.counts?.checkout_start ?? 0, icon: Clock, color: "bg-peach" },
              { label: "Checkout Drop-offs", key: "checkout_dropoff", count: analytics.funnel?.dropoffs ?? 0, icon: AlertTriangle, color: "bg-blush" },
              { label: "Orders Placed", key: "order_placed", count: analytics.funnel?.orders ?? analytics.counts?.order_placed ?? 0, icon: IndianRupee, color: "bg-sage" },
              { label: "WA Enquiries", key: "wa_enquiry", count: analytics.counts?.wa_enquiry ?? 0, icon: MessageCircle, color: "bg-lilac" },
            ].map(({ label, count, icon: Icon, color }) => (
              <div key={label} className={`${color} relative overflow-hidden rounded-2xl p-4 shadow-card`}>
                <Icon className="h-5 w-5 text-secondary-700 opacity-60" />
                <p className="mt-2 font-display text-2xl font-bold text-secondary-700">{count}</p>
                <p className="text-xs font-semibold text-secondary-700/80">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-wash px-4 py-3 text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary-600 shrink-0" />
              <span className="text-ink-soft">Overall Store Conversion Rate (views → orders): </span>
              <span className="font-bold text-secondary-700">{analytics.rates?.overall ?? analytics.conversionRate}%</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-soft">
              <span>Homepage Enquiries: <strong>{analytics.counts?.homepage_enquiry || 0}</strong></span>
              <span>Contact Forms: <strong>{analytics.counts?.contact_submit || 0}</strong></span>
              <span>Order Confirmations via WA: <strong>{analytics.counts?.wa_order_confirm || 0}</strong></span>
            </div>
          </div>

          {analytics.topProducts?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Top viewed products</p>
              <ul className="divide-y divide-ink-line">
                {analytics.topProducts.map((tp) => (
                  <li key={tp._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="line-clamp-1 min-w-0 font-medium text-secondary-800">{tp.name || "—"}</span>
                    <span className="badge shrink-0 bg-butter text-secondary-700"><Eye className="mr-1 inline h-3 w-3" />{tp.views}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </>
  );
}
