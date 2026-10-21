// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import { Plus, Pencil, Trash2, Eye } from "lucide-react";
// import { UserAPI } from "../../api/services";
// import { errMsg } from "../../api/client";
// import { Confirm, Field, Modal, StatusBadge } from "../../components/common/ui";
// import { DataTable, ExportImport, PageHeader, Select, Toolbar, pick, runImport } from "../../components/admin/AdminKit";
// import { fmtDate, inRange, money } from "../../utils/format";
// import { useAuth } from "../../context/AuthContext";

// const blank = { name: "", phoneno: "", email: "", password: "", role: "customer", isActive: true };

// export default function Customers() {
//   const { user: me } = useAuth();
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [fl, setFl] = useState({ q: "", role: "", active: "", from: "", to: "" });
//   const [edit, setEdit] = useState(null);
//   const [form, setForm] = useState(blank);
//   const [del, setDel] = useState(null);
//   const [view, setView] = useState(null);
//   const [busy, setBusy] = useState(false);

//   const load = () => UserAPI.list().then((r) => setRows(r.data || [])).finally(() => setLoading(false));
//   useEffect(() => { load(); }, []);
//   const set = (k) => (v) => setFl((s) => ({ ...s, [k]: v }));

//   const filtered = useMemo(() => rows.filter((u) =>
//     (!fl.q || `${u.name} ${u.phoneno} ${u.email || ""}`.toLowerCase().includes(fl.q.toLowerCase())) &&
//     (!fl.role || u.role === fl.role) &&
//     (!fl.active || String(u.isActive) === fl.active) && inRange(u.createdAt, fl.from, fl.to)), [rows, fl]);

//   const open = (u) => { setEdit(u || {}); setForm(u ? { ...blank, name: u.name, phoneno: u.phoneno, email: u.email || "", role: u.role, isActive: u.isActive } : blank); };

//   const save = async (e) => {
//     e.preventDefault();
//     setBusy(true);
//     try {
//       if (edit._id) {
//         const body = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
//         if (form.password) body.password = form.password;
//         await UserAPI.update(edit._id, body);
//       } else {
//         if (!/^\d{10}$/.test(form.phoneno)) { setBusy(false); return toast.error("Enter a valid 10-digit phone number"); }
//         await UserAPI.create(form);
//       }
//       toast.success(`User ${edit._id ? "updated" : "created"}`);
//       setEdit(null); load();
//     } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
//   };

//   const remove = async () => {
//     setBusy(true);
//     try { await UserAPI.remove(del._id); toast.success("User deleted"); setDel(null); load(); }
//     catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
//   };

//   const importRows = async (data) => {
//     await runImport(data, (r) => {
//       const name = String(pick(r, "name")).trim(), phoneno = String(pick(r, "phone", "phoneno", "mobile")).trim(), password = String(pick(r, "password"));
//       if (!name || !phoneno || !password) throw new Error("name, phone and password are required");
//       return UserAPI.create({ name, phoneno, password, email: pick(r, "email"), role: String(pick(r, "role")).toLowerCase() === "admin" ? "admin" : "customer" });
//     }, "users");
//     load();
//   };

//   const columns = [
//     { key: "name", header: "Name", sortable: true, render: (u) => (
//       <div className="flex items-center gap-3">
//         <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-sm font-bold text-secondary-700">{u.name?.[0]?.toUpperCase()}</span>
//         <div><p className="font-semibold">{u.name}</p><p className="text-xs text-ink-faint">{u.email || "—"}</p></div>
//       </div>) },
//     { key: "phoneno", header: "Phone", sortable: true },
//     { key: "role", header: "Role", sortable: true, render: (u) => <span className={`badge ${u.role === "admin" ? "bg-primary-50 text-primary-700" : "bg-ink-wash text-ink-soft"}`}>{u.role}</span> },
//     { key: "totalOrders", header: "Orders", sortable: true },
//     { key: "totalAmount", header: "Spent", sortable: true, render: (u) => <b>{money(u.totalAmount)}</b> },
//     { key: "isActive", header: "Status", render: (u) => <StatusBadge status={u.isActive ? "Active" : "Inactive"} /> },
//     { key: "createdAt", header: "Joined", sortable: true, render: (u) => fmtDate(u.createdAt) },
//     { key: "actions", header: "", render: (u) => (
//       <div className="flex justify-end gap-1">
//         <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => setView(u)} aria-label="View"><Eye className="h-4 w-4" /></button>
//         <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => open(u)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
//         {u._id !== me._id && <button className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" onClick={() => setDel(u)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
//       </div>) },
//   ];

//   const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
//   const dirty = Object.values(fl).some(Boolean);

//   return (
//     <>
//       <PageHeader title="Customers" subtitle={`${rows.length} users`}>
//         <ExportImport
//           name="customers"
//           getRows={() => filtered.map((u) => ({ Name: u.name, Phone: u.phoneno, Email: u.email || "", Role: u.role, Status: u.isActive ? "Active" : "Inactive", Orders: u.totalOrders, "Total spent": u.totalAmount, Joined: fmtDate(u.createdAt) }))}
//           onImport={importRows}
//           template={{ name: "Sample User", phone: "9000000000", email: "user@example.com", password: "Pass@123", role: "customer" }}
//         />
//         <button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Add user</button>
//       </PageHeader>

//       <Toolbar search={fl.q} onSearch={set("q")} placeholder="Search name, phone or email" dirty={dirty} onReset={() => setFl({ q: "", role: "", active: "", from: "", to: "" })}>
//         <Select label="All roles" value={fl.role} onChange={set("role")} options={["customer", "admin"]} />
//         <Select label="Any status" value={fl.active} onChange={set("active")} options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} />
//         <input type="date" className="input w-auto" value={fl.from} onChange={(e) => set("from")(e.target.value)} aria-label="Joined from" />
//         <input type="date" className="input w-auto" value={fl.to} onChange={(e) => set("to")(e.target.value)} aria-label="Joined to" />
//       </Toolbar>

//       <DataTable columns={columns} rows={filtered} loading={loading} empty="No users found" />

//       <Modal open={!!edit} onClose={() => setEdit(null)} title={`${edit?._id ? "Edit" : "Add"} user`}>
//         <form onSubmit={save} className="space-y-4">
//           <Field label="Name"><input className="input" required value={form.name} onChange={f("name")} /></Field>
//           <Field label="Phone number"><input className="input" required maxLength={10} disabled={!!edit?._id} value={form.phoneno} onChange={f("phoneno")} /></Field>
//           <Field label="Email"><input className="input" type="email" value={form.email} onChange={f("email")} /></Field>
//           <Field label={edit?._id ? "New password (leave blank to keep)" : "Password"}><input className="input" type="password" required={!edit?._id} value={form.password} onChange={f("password")} /></Field>
//           <div className="grid grid-cols-2 gap-4">
//             <Field label="Role"><select className="input" value={form.role} onChange={f("role")}><option value="customer">Customer</option><option value="admin">Admin</option></select></Field>
//             {edit?._id && <Field label="Status"><select className="input" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}><option value="true">Active</option><option value="false">Inactive</option></select></Field>}
//           </div>
//           <div className="flex justify-end gap-2 pt-2">
//             <button type="button" className="btn-outline" onClick={() => setEdit(null)}>Cancel</button>
//             <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
//           </div>
//         </form>
//       </Modal>

//       <Modal open={!!view} onClose={() => setView(null)} title="Customer details">
//         {view && (
//           <dl className="grid grid-cols-2 gap-4 text-sm">
//             {[["Name", view.name], ["Phone", view.phoneno], ["Email", view.email || "—"], ["Role", view.role], ["Orders", view.totalOrders], ["Total spent", money(view.totalAmount)], ["Joined", fmtDate(view.createdAt)], ["Status", view.isActive ? "Active" : "Inactive"]].map(([k, v]) => (
//               <div key={k}><dt className="text-xs text-ink-soft">{k}</dt><dd className="font-semibold">{v}</dd></div>
//             ))}
//             <div className="col-span-2">
//               <dt className="text-xs text-ink-soft">Addresses</dt>
//               <dd>{view.addresses?.length ? view.addresses.map((a, i) => <p key={i} className="font-medium">{[a.street, a.city, a.state, a.zipCode].filter(Boolean).join(", ")}{a.isDefault && " (default)"}</p>) : "—"}</dd>
//             </div>
//           </dl>
//         )}
//       </Modal>

//       <Confirm open={!!del} busy={busy} title="Delete user?" text={`${del?.name} (${del?.phoneno}) will be removed permanently.`} onConfirm={remove} onClose={() => setDel(null)} />
//     </>
//   );

// }


import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { UserAPI } from "../../api/services";
import { errMsg } from "../../api/client";
import { Confirm, Field, Modal, StatusBadge } from "../../components/common/ui";
import { DataTable, ExportImport, PageHeader, Select, Toolbar, pick, runImport } from "../../components/admin/AdminKit";
import { fmtDate, inRange, money } from "../../utils/format";
import { useAuth } from "../../context/AuthContext";

// Render overlays straight into <body> so the backdrop covers the whole viewport
// and sits above the header/sidebar.
const Portal = ({ children }) =>
  typeof document === "undefined" ? null : createPortal(children, document.body);

const blank = { name: "", phoneno: "", email: "", password: "", role: "customer", isActive: true };

export default function Customers() {
  const { user: me } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fl, setFl] = useState({ q: "", role: "", active: "", from: "", to: "" });
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState(blank);
  const [del, setDel] = useState(null);
  const [view, setView] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => UserAPI.list().then((r) => setRows(r.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const set = (k) => (v) => setFl((s) => ({ ...s, [k]: v }));

  const filtered = useMemo(() => rows.filter((u) =>
    (!fl.q || `${u.name} ${u.phoneno} ${u.email || ""}`.toLowerCase().includes(fl.q.toLowerCase())) &&
    (!fl.role || u.role === fl.role) &&
    (!fl.active || String(u.isActive) === fl.active) && inRange(u.createdAt, fl.from, fl.to)), [rows, fl]);

  const open = (u) => { setEdit(u || {}); setForm(u ? { ...blank, name: u.name, phoneno: u.phoneno, email: u.email || "", role: u.role, isActive: u.isActive } : blank); };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (edit._id) {
        const body = { name: form.name, email: form.email, role: form.role, isActive: form.isActive };
        if (form.password) body.password = form.password;
        await UserAPI.update(edit._id, body);
      } else {
        if (!/^\d{10}$/.test(form.phoneno)) { setBusy(false); return toast.error("Enter a valid 10-digit phone number"); }
        await UserAPI.create(form);
      }
      toast.success(`User ${edit._id ? "updated" : "created"}`);
      setEdit(null); load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await UserAPI.remove(del._id); toast.success("User deleted"); setDel(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const importRows = async (data) => {
    await runImport(data, (r) => {
      const name = String(pick(r, "name")).trim(), phoneno = String(pick(r, "phone", "phoneno", "mobile")).trim(), password = String(pick(r, "password"));
      if (!name || !phoneno || !password) throw new Error("name, phone and password are required");
      return UserAPI.create({ name, phoneno, password, email: pick(r, "email"), role: String(pick(r, "role")).toLowerCase() === "admin" ? "admin" : "customer" });
    }, "users");
    load();
  };

  const columns = [
    { key: "name", header: "Name", sortable: true, render: (u) => (
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-50 text-sm font-bold text-secondary-700">{u.name?.[0]?.toUpperCase()}</span>
        <div className="min-w-0"><p className="font-semibold">{u.name}</p><p className="max-w-[12rem] truncate text-xs text-ink-faint" title={u.email || ""}>{u.email || "—"}</p></div>
      </div>) },
    { key: "phoneno", header: "Phone", sortable: true },
    { key: "role", header: "Role", sortable: true, render: (u) => <span className={`badge ${u.role === "admin" ? "bg-primary-50 text-primary-700" : "bg-ink-wash text-ink-soft"}`}>{u.role}</span> },
    { key: "totalOrders", header: "Orders", sortable: true },
    { key: "totalAmount", header: "Spent", sortable: true, render: (u) => <b>{money(u.totalAmount)}</b> },
    { key: "isActive", header: "Status", render: (u) => <StatusBadge status={u.isActive ? "Active" : "Inactive"} /> },
    { key: "createdAt", header: "Joined", sortable: true, render: (u) => <span className="whitespace-nowrap">{fmtDate(u.createdAt)}</span> },
    { key: "actions", header: "", render: (u) => (
      <div className="flex justify-end gap-1">
        <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => setView(u)} aria-label="View"><Eye className="h-4 w-4" /></button>
        <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => open(u)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
        {u._id !== me._id && <button className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" onClick={() => setDel(u)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
      </div>) },
  ];

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const dirty = Object.values(fl).some(Boolean);

  return (
    <>
      <PageHeader title="Customers" subtitle={`${rows.length} users`}>
        <ExportImport
          name="customers"
          getRows={() => filtered.map((u) => ({ Name: u.name, Phone: u.phoneno, Email: u.email || "", Role: u.role, Status: u.isActive ? "Active" : "Inactive", Orders: u.totalOrders, "Total spent": u.totalAmount, Joined: fmtDate(u.createdAt) }))}
          onImport={importRows}
          template={{ name: "Sample User", phone: "9000000000", email: "user@example.com", password: "Pass@123", role: "customer" }}
        />
        <button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Add user</button>
      </PageHeader>

      <Toolbar search={fl.q} onSearch={set("q")} placeholder="Search name, phone or email" dirty={dirty} onReset={() => setFl({ q: "", role: "", active: "", from: "", to: "" })}>
        <Select label="All roles" value={fl.role} onChange={set("role")} options={["customer", "admin"]} />
        <Select label="Any status" value={fl.active} onChange={set("active")} options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} />
        <input type="date" className="input w-auto" value={fl.from} onChange={(e) => set("from")(e.target.value)} aria-label="Joined from" />
        <input type="date" className="input w-auto" value={fl.to} onChange={(e) => set("to")(e.target.value)} aria-label="Joined to" />
      </Toolbar>

      <DataTable columns={columns} rows={filtered} loading={loading} empty="No users found" />

      <Portal>
        <Modal open={!!edit} onClose={() => setEdit(null)} title={`${edit?._id ? "Edit" : "Add"} user`}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Name"><input className="input" required value={form.name} onChange={f("name")} /></Field>
            <Field label="Phone number"><input className="input" required maxLength={10} disabled={!!edit?._id} value={form.phoneno} onChange={f("phoneno")} /></Field>
            <Field label="Email"><input className="input" type="email" value={form.email} onChange={f("email")} /></Field>
            <Field label={edit?._id ? "New password (leave blank to keep)" : "Password"}><input className="input" type="password" required={!edit?._id} value={form.password} onChange={f("password")} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Role"><select className="input" value={form.role} onChange={f("role")}><option value="customer">Customer</option><option value="admin">Admin</option></select></Field>
              {edit?._id && <Field label="Status"><select className="input" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}><option value="true">Active</option><option value="false">Inactive</option></select></Field>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </Modal>
      </Portal>

      <Portal>
        <Modal open={!!view} onClose={() => setView(null)} title="Customer details">
          {view && (
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[["Name", view.name], ["Phone", view.phoneno], ["Email", view.email || "—"], ["Role", view.role], ["Orders", view.totalOrders], ["Total spent", money(view.totalAmount)], ["Joined", fmtDate(view.createdAt)], ["Status", view.isActive ? "Active" : "Inactive"]].map(([k, v]) => (
                <div key={k} className="min-w-0 wrap-anywhere"><dt className="text-xs text-ink-soft">{k}</dt><dd className="font-semibold">{v}</dd></div>
              ))}
              <div className="col-span-2">
                <dt className="text-xs text-ink-soft">Addresses</dt>
                <dd>{view.addresses?.length ? view.addresses.map((a, i) => <p key={i} className="font-medium">{[a.street, a.city, a.state, a.zipCode].filter(Boolean).join(", ")}{a.isDefault && " (default)"}</p>) : "—"}</dd>
              </div>
            </dl>
          )}
        </Modal>
      </Portal>

      <Portal>
        <Confirm open={!!del} busy={busy} title="Delete user?" text={`${del?.name} (${del?.phoneno}) will be removed permanently.`} onConfirm={remove} onClose={() => setDel(null)} />
      </Portal>
    </>
  );
}
