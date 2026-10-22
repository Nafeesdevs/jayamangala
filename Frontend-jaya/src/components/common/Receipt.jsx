// import { Printer } from "lucide-react";
// import { SITE } from "../../config/site";
// import { fmtDate, money } from "../../utils/format";

// // Printable receipt (works for customer + admin). Uses .print-area CSS in index.css
// export default function Receipt({ order }) {
//   if (!order) return null;
//   const c = order.customerDetails || {};
//   return (
//     <div>
//       <div className="no-print mb-4 flex justify-end">
//         <button className="btn-outline btn-sm" onClick={() => window.print()}>
//           <Printer className="h-4 w-4" /> Print receipt
//         </button>
//       </div>
//       <div className="print-area rounded-xl border border-ink-line bg-white p-4 text-sm sm:p-6">
//         <div className="flex flex-col-reverse items-start justify-between gap-4 border-b border-ink-line pb-4 min-[480px]:flex-row">
//           <div className="min-w-0 wrap-anywhere">
//             <img src="/logo-en.png" alt={SITE.name} className="h-10 w-auto object-contain" />
//             <p className="mt-2 text-xs text-ink-soft">{SITE.address}</p>
//             <p className="text-xs text-ink-soft">{SITE.phone} · {SITE.email}</p>
//           </div>
//           <div className="min-[480px]:text-right">
//             <p className="text-lg font-bold">Receipt</p>
//             <p className="font-semibold text-primary-600">{order.orderId}</p>
//             <p className="text-xs text-ink-soft">{fmtDate(order.createdAt, true)}</p>
//           </div>
//         </div>

//         <div className="grid gap-4 py-4 sm:grid-cols-2">
//           <div className="min-w-0 wrap-anywhere">
//             <p className="text-xs font-semibold text-ink-soft">Billed to</p>
//             <p className="font-semibold">{c.name}</p>
//             <p>{c.phone}</p>
//             <p className="text-ink-soft">{c.address} – {c.pincode}</p>
//           </div>
//           <div className="sm:text-right">
//             <p className="text-xs font-semibold text-ink-soft">Payment</p>
//             <p className="font-semibold">{order.payment?.method === "COD" ? "Cash on delivery" : "UPI QR"} · {order.payment?.status}</p>
//             <p className="text-xs text-ink-soft">Order status: {order.status}</p>
//             {order.deliveryDate && <p className="text-xs text-ink-soft">Delivery: {fmtDate(order.deliveryDate)}</p>}
//           </div>
//         </div>

//         <div className="-mx-1 overflow-x-auto px-1">
//         <table className="w-full min-w-[300px] text-xs sm:text-sm">
//           <thead>
//             <tr className="border-y border-ink-line text-left text-xs text-ink-soft">
//               <th className="py-2">Item</th><th className="py-2 text-center">Qty</th>
//               <th className="py-2 text-right">Price</th><th className="py-2 text-right">Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {order.items?.map((i, idx) => (
//               <tr key={idx} className="border-b border-ink-line/60">
//                 <td className="py-2 pr-2">{i.name}</td>
//                 <td className="py-2 text-center">{i.quantity}</td>
//                 <td className="whitespace-nowrap py-2 pl-2 text-right">{money(i.price)}</td>
//                 <td className="whitespace-nowrap py-2 pl-2 text-right">{money(i.price * i.quantity)}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         </div>

//         <div className="ml-auto mt-4 w-full space-y-1 sm:max-w-xs">
//           <div className="flex justify-between"><span className="text-ink-soft">Subtotal</span><span>{money(order.pricing?.subtotal)}</span></div>
//           <div className="flex justify-between"><span className="text-ink-soft">Delivery</span><span>{money(order.pricing?.deliveryCharge)}</span></div>
//           <div className="flex justify-between border-t border-ink-line pt-2 text-base font-bold">
//             <span>Total</span><span className="text-primary-600">{money(order.pricing?.total)}</span>
//           </div>
//         </div>
//         <p className="mt-6 text-center text-xs text-ink-faint">Thank you for shopping with {SITE.name}.</p>
//       </div>
//     </div>
//   );
// }


import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Printer, X } from "lucide-react";
import { SITE } from "../../config/site";
import { fmtDate, money } from "../../utils/format";

// Scalloped (ticket) edge drawn with a gradient, no extra assets needed.
const scallop = (pos) => ({
  height: 10,
  backgroundImage:
    "radial-gradient(circle at 6px " + (pos === "top" ? "0" : "10px") + ", transparent 6px, #fff 6.5px)",
  backgroundSize: "12px 10px",
  backgroundRepeat: "repeat-x",
});

function Row({ label, children, strong }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="w-[38%] shrink-0 text-ink-soft">{label}</span>
      <span className="text-ink-soft">:</span>
      <span className={"min-w-0 flex-1 break-words " + (strong ? "font-semibold" : "")}>{children}</span>
    </div>
  );
}

// Printable receipt card (works for customer + admin). Uses .print-area CSS in index.css
export default function Receipt({ order, hidePrint = false }) {
  if (!order) return null;
  const c = order.customerDetails || {};
  const payLabel = order.payment?.method === "COD" ? "Cash on delivery" : "UPI QR";

  return (
    <div className="mx-auto w-full max-w-[380px]">
      {!hidePrint && (
        <div className="no-print mb-3 flex justify-end">
          <button className="btn-outline btn-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print receipt
          </button>
        </div>
      )}

      {/* soft, light shadow */}
      <div className="print-area drop-shadow-[0_6px_18px_rgba(0,0,0,0.10)]">
        <div style={scallop("top")} className="no-print" />

        <div className="bg-white px-5 pb-5 pt-4 text-sm text-ink">
          {/* Header */}
          <div className="flex flex-col items-center border-b border-dashed border-ink-line pb-4 text-center">
            <img src="/logo-en.png" alt={SITE.name} className="h-11 w-auto object-contain" />
            <p className="mt-2 text-xs leading-snug text-ink-soft">{SITE.address}</p>
            <p className="text-xs text-ink-soft">{SITE.phone}</p>
            <p className="text-xs text-ink-soft">{SITE.email}</p>
            <p className="mt-3 text-lg font-bold">Receipt</p>
          </div>

          {/* Order details */}
          <div className="border-b border-dashed border-ink-line py-3">
            <p className="mb-1 font-semibold">Order details</p>
            <Row label="Order ID" strong>
              <span className="text-primary-600">{order.orderId}</span>
            </Row>
            <Row label="Order time">{fmtDate(order.createdAt, true)}</Row>
            <Row label="Payment">{payLabel}</Row>
            <Row label="Payment status">{order.payment?.status}</Row>
            <Row label="Order status">{order.status}</Row>
            {order.deliveryDate && <Row label="Delivery">{fmtDate(order.deliveryDate)}</Row>}
          </div>

          {/* Billed to */}
          <div className="border-b border-dashed border-ink-line py-3">
            <p className="mb-1 font-semibold">Billed to</p>
            <Row label="Name" strong>{c.name}</Row>
            <Row label="Phone">{c.phone}</Row>
            <Row label="Address">{c.address} – {c.pincode}</Row>
          </div>

          {/* Products */}
          <div className="border-b border-dashed border-ink-line py-3">
            <p className="mb-1 font-semibold">Product details</p>
            {order.items?.map((i, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 py-1">
                <span className="min-w-0 flex-1 text-ink-soft">
                  <span className="font-medium text-secondary-800">{i.name}</span>
                  {i.size && <span className="ml-1 text-xs text-ink-soft">({i.size} {i.unit || ""})</span>}{" "}
                  <span className="text-ink">x{i.quantity}</span>
                  <span className="block text-xs text-ink-faint">{money(i.price)} each</span>
                </span>
                <span className="font-semibold">{money(i.price * i.quantity)}</span>
              </div>
            ))}
            <div className="mt-1 flex justify-between py-1">
              <span className="text-ink-soft">Subtotal</span>
              <span>{money(order.pricing?.subtotal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-soft">Delivery charges</span>
              <span>{money(order.pricing?.deliveryCharge)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-3 text-base font-bold">
            <span>Total amount</span>
            <span className="text-primary-600">{money(order.pricing?.total)}</span>
          </div>

          <p className="text-center text-xs text-ink-faint">
            Thank you for shopping with {SITE.name}.
          </p>
        </div>

        <div style={scallop("bottom")} className="no-print" />
      </div>
    </div>
  );
}

// Full-screen receipt view. Rendered in a portal on <body> so it always sits
// above the header/footer/contact section and can never overlap or misalign.
export function ReceiptScreen({ order, onClose }) {
  useEffect(() => {
    if (!order) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [order, onClose]);

  if (!order) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex flex-col bg-ink-wash" role="dialog" aria-modal="true" aria-label="Receipt">
      <div className="no-print flex shrink-0 items-center justify-between border-b border-ink-line bg-white px-4 py-3 sm:px-6">
        <h2 className="font-display text-lg font-bold text-secondary-700">Receipt</h2>
        <div className="flex items-center gap-2">
          <button className="btn-outline btn-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </button>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-line bg-white hover:bg-ink-wash"
            onClick={onClose}
            aria-label="Close receipt"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-10">
        <Receipt order={order} hidePrint />
      </div>
    </div>,
    document.body
  );
}