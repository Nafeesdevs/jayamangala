// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import { BrandAPI, CategoryAPI, ProductAPI } from "../../api/services";
// import { errMsg } from "../../api/client";
// import { Confirm, Field, Modal, StatusBadge } from "../../components/common/ui";
// import { DataTable, ExportImport, ImagePicker, PageHeader, Select, Thumb, Toolbar, pick, runImport } from "../../components/admin/AdminKit";
// import { fmtDate, inRange, money } from "../../utils/format";

// const blank = { name: "", price: "", oldprice: "", category: "", brand: "", stock: 100, status: "Active", description: "", image: null };

// export default function Products() {
//   const [rows, setRows] = useState([]);
//   const [cats, setCats] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fl, setFl] = useState({ q: "", category: "", brand: "", status: "", stock: "", min: "", max: "", from: "", to: "" });
//   const [edit, setEdit] = useState(null);
//   const [form, setForm] = useState(blank);
//   const [del, setDel] = useState(null);
//   const [busy, setBusy] = useState(false);

//   const load = async () => {
//     const [p, c, b] = await Promise.all([ProductAPI.list(), CategoryAPI.list(), BrandAPI.list()]);
//     setRows(p.data || []); setCats(c.data || []); setBrands(b.data || []); setLoading(false);
//   };
//   useEffect(() => { load().catch(() => setLoading(false)); }, []);

//   const set = (k) => (v) => setFl((s) => ({ ...s, [k]: v }));

//   const filtered = useMemo(() => rows.filter((p) => {
//     if (fl.q && !p.name.toLowerCase().includes(fl.q.toLowerCase())) return false;
//     if (fl.category && p.category?._id !== fl.category) return false;
//     if (fl.brand && p.brand?._id !== fl.brand) return false;
//     if (fl.status && p.status !== fl.status) return false;
//     if (fl.stock === "out" && p.stock > 0) return false;
//     if (fl.stock === "low" && !(p.stock > 0 && p.stock <= 10)) return false;
//     if (fl.stock === "in" && p.stock <= 10) return false;
//     if (fl.min && p.price < Number(fl.min)) return false;
//     if (fl.max && p.price > Number(fl.max)) return false;
//     return inRange(p.createdAt, fl.from, fl.to);
//   }), [rows, fl]);

//   const open = (p) => {
//     setEdit(p || {});
//     setForm(p ? { name: p.name, price: p.price, oldprice: p.oldprice || "", category: p.category?._id || "", brand: p.brand?._id || "",
//       stock: p.stock, status: p.status, description: p.description || "", image: p.productimage || null } : blank);
//   };

//   const save = async (e) => {
//     e.preventDefault();
//     setBusy(true);
//     try {
//       const body = { name: form.name.trim(), price: form.price, oldprice: form.oldprice || 0, category: form.category, brand: form.brand,
//         stock: form.stock, status: form.status, description: form.description };
//       if (form.image instanceof File) body.productimage = form.image;
//       if (edit._id) await ProductAPI.update(edit._id, body); else await ProductAPI.create(body);
//       toast.success(`Product ${edit._id ? "updated" : "created"}`);
//       setEdit(null); load();
//     } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
//   };

//   const remove = async () => {
//     setBusy(true);
//     try { await ProductAPI.remove(del._id); toast.success("Product deleted"); setDel(null); load(); }
//     catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
//   };

//   const importRows = async (data) => {
//     const find = (list, name) => list.find((x) => x.name.toLowerCase() === String(name).trim().toLowerCase())?._id;
//     await runImport(data, (r) => {
//       const name = String(pick(r, "name")).trim();
//       const price = pick(r, "price");
//       if (!name || price === "") throw new Error("name and price are required");
//       const body = { name, price, oldprice: pick(r, "oldprice", "old price", "mrp") || 0, stock: pick(r, "stock") === "" ? 100 : pick(r, "stock"),
//         status: pick(r, "status") || "Active", description: pick(r, "description") };
//       const cat = pick(r, "category"); const br = pick(r, "brand");
//       if (cat) { const id = find(cats, cat); if (!id) throw new Error(`category “${cat}” not found – create it first`); body.category = id; }
//       if (br) { const id = find(brands, br); if (!id) throw new Error(`brand “${br}” not found – create it first`); body.brand = id; }
//       return ProductAPI.create(body);
//     }, "products");
//     load();
//   };

//   const columns = [
//     { key: "img", header: "Image", render: (p) => <Thumb src={p.productimage} /> },
//     { key: "name", header: "Name", sortable: true, render: (p) => <div className="max-w-[220px]"><p className="line-clamp-1 font-semibold">{p.name}</p><p className="text-xs text-ink-faint">{p.brand?.name || "—"}</p></div> },
//     { key: "cat", header: "Category", render: (p) => p.category?.name || "—", sortValue: (p) => p.category?.name || "", sortable: true },
//     { key: "price", header: "Price", sortable: true, render: (p) => <div><b>{money(p.price)}</b>{p.oldprice > p.price && <span className="ml-1 text-xs text-ink-faint line-through">{money(p.oldprice)}</span>}</div> },
//     { key: "stock", header: "Stock", sortable: true, render: (p) => <span className={p.stock <= 0 ? "font-semibold text-primary-600" : p.stock <= 10 ? "font-semibold text-amber-600" : ""}>{p.stock}</span> },
//     { key: "status", header: "Status", sortable: true, render: (p) => <StatusBadge status={p.status} /> },
//     { key: "actions", header: "", render: (p) => (
//       <div className="flex justify-end gap-1">
//         <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => open(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
//         <button className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" onClick={() => setDel(p)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
//       </div>) },
//   ];

//   const dirty = Object.values(fl).some(Boolean);
//   const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

//   return (
//     <>
//       <PageHeader title="Products" subtitle={`${rows.length} total`}>
//         <ExportImport
//           name="products"
//           getRows={() => filtered.map((p) => ({ Name: p.name, Category: p.category?.name || "", Brand: p.brand?.name || "", Price: p.price, "Old Price": p.oldprice || 0,
//             Stock: p.stock, Status: p.status, Description: p.description || "", Image: p.productimage || "", Created: fmtDate(p.createdAt) }))}
//           onImport={importRows}
//           template={{ name: "Sample product", category: "Existing category name", brand: "Existing brand name", price: 199, oldprice: 249, stock: 50, status: "Active", description: "Optional" }}
//         />
//         <button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Add product</button>
//       </PageHeader>

//       <Toolbar search={fl.q} onSearch={set("q")} placeholder="Search products" dirty={dirty} onReset={() => setFl({ q: "", category: "", brand: "", status: "", stock: "", min: "", max: "", from: "", to: "" })}>
//         <Select label="All categories" value={fl.category} onChange={set("category")} options={cats.map((c) => ({ value: c._id, label: c.name }))} />
//         <Select label="All brands" value={fl.brand} onChange={set("brand")} options={brands.map((c) => ({ value: c._id, label: c.name }))} />
//         <Select label="All status" value={fl.status} onChange={set("status")} options={["Active", "Inactive"]} />
//         <Select label="Any stock" value={fl.stock} onChange={set("stock")} options={[{ value: "in", label: "In stock (>10)" }, { value: "low", label: "Low stock (1–10)" }, { value: "out", label: "Out of stock" }]} />
//         <input className="input w-28" type="number" placeholder="Min ₹" value={fl.min} onChange={(e) => set("min")(e.target.value)} />
//         <input className="input w-28" type="number" placeholder="Max ₹" value={fl.max} onChange={(e) => set("max")(e.target.value)} />
//         <input type="date" className="input w-auto" value={fl.from} onChange={(e) => set("from")(e.target.value)} aria-label="From date" />
//         <input type="date" className="input w-auto" value={fl.to} onChange={(e) => set("to")(e.target.value)} aria-label="To date" />
//       </Toolbar>

//       <DataTable columns={columns} rows={filtered} loading={loading} empty="No products found" />

//       <Modal open={!!edit} onClose={() => setEdit(null)} wide title={`${edit?._id ? "Edit" : "Add"} product`}>
//         <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
//           <div className="sm:col-span-2"><Field label="Product name"><input className="input" required value={form.name} onChange={f("name")} /></Field></div>
//           <Field label="Selling price (₹)"><input className="input" type="number" min="0" step="0.01" required value={form.price} onChange={f("price")} /></Field>
//           <Field label="Old price (₹)" hint="Shown struck-through to display a discount"><input className="input" type="number" min="0" step="0.01" value={form.oldprice} onChange={f("oldprice")} /></Field>
//           <Field label="Category">
//             <select className="input" value={form.category} onChange={f("category")}><option value="">Select category</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
//           </Field>
//           <Field label="Brand">
//             <select className="input" value={form.brand} onChange={f("brand")}><option value="">Select brand</option>{brands.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
//           </Field>
//           <Field label="Stock"><input className="input" type="number" min="0" required value={form.stock} onChange={f("stock")} /></Field>
//           <Field label="Status"><select className="input" value={form.status} onChange={f("status")}><option>Active</option><option>Inactive</option></select></Field>
//           <div className="sm:col-span-2"><Field label="Description"><textarea className="input min-h-[96px]" value={form.description} onChange={f("description")} /></Field></div>
//           <div className="sm:col-span-2"><ImagePicker label="Product image" value={form.image} onChange={(file) => setForm({ ...form, image: file })} /></div>
//           <div className="flex justify-end gap-2 sm:col-span-2">
//             <button type="button" className="btn-outline" onClick={() => setEdit(null)}>Cancel</button>
//             <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save product"}</button>
//           </div>
//         </form>
//       </Modal>

//       <Confirm open={!!del} busy={busy} title="Delete product?" text={`“${del?.name}” will be removed permanently.`} onConfirm={remove} onClose={() => setDel(null)} />
//     </>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { BrandAPI, CategoryAPI, ProductAPI } from "../../api/services";
import { errMsg } from "../../api/client";
import { Confirm, Field, Modal, StatusBadge } from "../../components/common/ui";
import { DataTable, ExportImport, ImagePicker, PageHeader, Select, Thumb, Toolbar, pick, runImport } from "../../components/admin/AdminKit";
import { fmtDate, inRange, money } from "../../utils/format";

// Render overlays straight into <body> so they sit above the header/sidebar
// and the backdrop covers the whole viewport.
const Portal = ({ children }) =>
  typeof document === "undefined" ? null : createPortal(children, document.body);

const blank = { name: "", price: "", oldprice: "", category: "", brand: "", stock: 100, status: "Active", description: "", image: null };

export default function Products() {
  const [rows, setRows] = useState([]);
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fl, setFl] = useState({ q: "", category: "", brand: "", status: "", stock: "", min: "", max: "", from: "", to: "" });
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(blank);
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [p, c, b] = await Promise.all([ProductAPI.list(), CategoryAPI.list(), BrandAPI.list()]);
    setRows(p.data || []); setCats(c.data || []); setBrands(b.data || []); setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  const set = (k) => (v) => setFl((s) => ({ ...s, [k]: v }));

  const filtered = useMemo(() => rows.filter((p) => {
    if (fl.q && !p.name.toLowerCase().includes(fl.q.toLowerCase())) return false;
    if (fl.category && p.category?._id !== fl.category) return false;
    if (fl.brand && p.brand?._id !== fl.brand) return false;
    if (fl.status && p.status !== fl.status) return false;
    if (fl.stock === "out" && p.stock > 0) return false;
    if (fl.stock === "low" && !(p.stock > 0 && p.stock <= 10)) return false;
    if (fl.stock === "in" && p.stock <= 10) return false;
    if (fl.min && p.price < Number(fl.min)) return false;
    if (fl.max && p.price > Number(fl.max)) return false;
    return inRange(p.createdAt, fl.from, fl.to);
  }), [rows, fl]);

  const open = (p) => {
    setEdit(p || {});
    setForm(p ? { name: p.name, price: p.price, oldprice: p.oldprice || "", category: p.category?._id || "", brand: p.brand?._id || "",
      stock: p.stock, status: p.status, description: p.description || "", image: p.productimage || null } : blank);
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { name: form.name.trim(), price: form.price, oldprice: form.oldprice || 0, category: form.category, brand: form.brand,
        stock: form.stock, status: form.status, description: form.description };
      if (form.image instanceof File) body.productimage = form.image;
      if (edit._id) await ProductAPI.update(edit._id, body); else await ProductAPI.create(body);
      toast.success(`Product ${edit._id ? "updated" : "created"}`);
      setEdit(null); load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await ProductAPI.remove(del._id); toast.success("Product deleted"); setDel(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const importRows = async (data) => {
    const find = (list, name) => list.find((x) => x.name.toLowerCase() === String(name).trim().toLowerCase())?._id;
    await runImport(data, (r) => {
      const name = String(pick(r, "name")).trim();
      const price = pick(r, "price");
      if (!name || price === "") throw new Error("name and price are required");
      const body = { name, price, oldprice: pick(r, "oldprice", "old price", "mrp") || 0, stock: pick(r, "stock") === "" ? 100 : pick(r, "stock"),
        status: pick(r, "status") || "Active", description: pick(r, "description") };
      const cat = pick(r, "category"); const br = pick(r, "brand");
      if (cat) { const id = find(cats, cat); if (!id) throw new Error(`category “${cat}” not found – create it first`); body.category = id; }
      if (br) { const id = find(brands, br); if (!id) throw new Error(`brand “${br}” not found – create it first`); body.brand = id; }
      return ProductAPI.create(body);
    }, "products");
    load();
  };

  const columns = [
    { key: "img", header: "Image", render: (p) => <Thumb src={p.productimage} /> },
    { key: "name", header: "Name", sortable: true, render: (p) => <div className="max-w-[220px]"><p className="line-clamp-1 font-semibold">{p.name}</p><p className="text-xs text-ink-faint">{p.brand?.name || "—"}</p></div> },
    { key: "cat", header: "Category", render: (p) => p.category?.name || "—", sortValue: (p) => p.category?.name || "", sortable: true },
    { key: "price", header: "Price", sortable: true, render: (p) => <div><b>{money(p.price)}</b>{p.oldprice > p.price && <span className="ml-1 text-xs text-ink-faint line-through">{money(p.oldprice)}</span>}</div> },
    { key: "stock", header: "Stock", sortable: true, render: (p) => <span className={p.stock <= 0 ? "font-semibold text-primary-600" : p.stock <= 10 ? "font-semibold text-amber-600" : ""}>{p.stock}</span> },
    { key: "status", header: "Status", sortable: true, render: (p) => <StatusBadge status={p.status} /> },
    { key: "actions", header: "", render: (p) => (
      <div className="flex justify-end gap-1">
        <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => open(p)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
        <button className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" onClick={() => setDel(p)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>) },
  ];

  const dirty = Object.values(fl).some(Boolean);
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageHeader title="Products" subtitle={`${rows.length} total`}>
        <ExportImport
          name="products"
          getRows={() => filtered.map((p) => ({ Name: p.name, Category: p.category?.name || "", Brand: p.brand?.name || "", Price: p.price, "Old Price": p.oldprice || 0,
            Stock: p.stock, Status: p.status, Description: p.description || "", Image: p.productimage || "", Created: fmtDate(p.createdAt) }))}
          onImport={importRows}
          template={{ name: "Sample product", category: "Existing category name", brand: "Existing brand name", price: 199, oldprice: 249, stock: 50, status: "Active", description: "Optional" }}
        />
        <button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Add product</button>
      </PageHeader>

      <Toolbar search={fl.q} onSearch={set("q")} placeholder="Search products" dirty={dirty} onReset={() => setFl({ q: "", category: "", brand: "", status: "", stock: "", min: "", max: "", from: "", to: "" })}>
        <Select label="All categories" value={fl.category} onChange={set("category")} options={cats.map((c) => ({ value: c._id, label: c.name }))} />
        <Select label="All brands" value={fl.brand} onChange={set("brand")} options={brands.map((c) => ({ value: c._id, label: c.name }))} />
        <Select label="All status" value={fl.status} onChange={set("status")} options={["Active", "Inactive"]} />
        <Select label="Any stock" value={fl.stock} onChange={set("stock")} options={[{ value: "in", label: "In stock (>10)" }, { value: "low", label: "Low stock (1–10)" }, { value: "out", label: "Out of stock" }]} />
        <input className="input w-28" type="number" placeholder="Min ₹" value={fl.min} onChange={(e) => set("min")(e.target.value)} />
        <input className="input w-28" type="number" placeholder="Max ₹" value={fl.max} onChange={(e) => set("max")(e.target.value)} />
        <input type="date" className="input w-auto" value={fl.from} onChange={(e) => set("from")(e.target.value)} aria-label="From date" />
        <input type="date" className="input w-auto" value={fl.to} onChange={(e) => set("to")(e.target.value)} aria-label="To date" />
      </Toolbar>

      <DataTable columns={columns} rows={filtered} loading={loading} empty="No products found" />

      <Portal>
        <Modal open={!!edit} onClose={() => setEdit(null)} wide title={`${edit?._id ? "Edit" : "Add"} product`}>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Field label="Product name"><input className="input" required value={form.name} onChange={f("name")} /></Field></div>
            <Field label="Selling price (₹)"><input className="input" type="number" min="0" step="0.01" required value={form.price} onChange={f("price")} /></Field>
            <Field label="Old price (₹)" hint="Shown struck-through to display a discount"><input className="input" type="number" min="0" step="0.01" value={form.oldprice} onChange={f("oldprice")} /></Field>
            <Field label="Category">
              <select className="input" value={form.category} onChange={f("category")}><option value="">Select category</option>{cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
            </Field>
            <Field label="Brand">
              <select className="input" value={form.brand} onChange={f("brand")}><option value="">Select brand</option>{brands.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
            </Field>
            <Field label="Stock"><input className="input" type="number" min="0" required value={form.stock} onChange={f("stock")} /></Field>
            <Field label="Status"><select className="input" value={form.status} onChange={f("status")}><option>Active</option><option>Inactive</option></select></Field>
            <div className="sm:col-span-2"><Field label="Description"><textarea className="input min-h-[72px]" value={form.description} onChange={f("description")} /></Field></div>
            <div className="sm:col-span-2"><ImagePicker label="Product image" value={form.image} onChange={(file) => setForm({ ...form, image: file })} /></div>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" className="btn-outline" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save product"}</button>
            </div>
          </form>
        </Modal>
      </Portal>

      <Portal>
        <Confirm open={!!del} busy={busy} title="Delete product?" text={`“${del?.name}” will be removed permanently.`} onConfirm={remove} onClose={() => setDel(null)} />
      </Portal>
    </>
  );
}