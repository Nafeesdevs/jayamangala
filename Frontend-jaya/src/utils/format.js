export const money = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const fmtDate = (d, withTime = false) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const discountPct = (p) =>
  p?.oldprice && p.oldprice > p.price ? Math.round(((p.oldprice - p.price) / p.oldprice) * 100) : 0;

export const ORDER_STATUSES = ["Ordered", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export const statusStyle = (s) =>
  ({
    Ordered: "bg-blue-50 text-blue-700",
    Processing: "bg-amber-50 text-amber-700",
    Shipped: "bg-indigo-50 text-indigo-700",
    "Out for Delivery": "bg-purple-50 text-purple-700",
    Delivered: "bg-secondary-50 text-secondary-700",
    Cancelled: "bg-primary-50 text-primary-700",
    Pending: "bg-amber-50 text-amber-700",
    Paid: "bg-secondary-50 text-secondary-700",
    Verified: "bg-secondary-50 text-secondary-700",
    Failed: "bg-primary-50 text-primary-700",
    Rejected: "bg-primary-50 text-primary-700",
    Active: "bg-secondary-50 text-secondary-700",
    Inactive: "bg-ink-wash text-ink-soft",
  }[s] || "bg-ink-wash text-ink-soft");

// "was this date within [from, to]" – inclusive, strings from <input type=date>
export const inRange = (date, from, to) => {
  const t = new Date(date).getTime();
  if (from && t < new Date(from).getTime()) return false;
  if (to && t > new Date(to).getTime() + 86399999) return false;
  return true;
};
