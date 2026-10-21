// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import { Plus, Pencil, Trash2 } from "lucide-react";
// import { errMsg } from "../../api/client";
// import { Confirm, Field, Modal, StatusBadge } from "../common/ui";
// import { DataTable, ExportImport, ImagePicker, PageHeader, Select, Thumb, Toolbar, pick, runImport } from "./AdminKit";
// import { fmtDate, inRange } from "../../utils/format";

// // Shared CRUD screen for Categories and Brands (name + image + status [+ description])
// export default function SimpleCrud({ api, singular, plural, withDescription = false }) {
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [q, setQ] = useState("");
//   const [status, setStatus] = useState("");
//   const [from, setFrom] = useState("");
//   const [to, setTo] = useState("");
//   const [edit, setEdit] = useState(null); // null | {} (new) | row
//   const [form, setForm] = useState({});
//   const [del, setDel] = useState(null);
//   const [busy, setBusy] = useState(false);

//   const load = () => api.list().then((r) => setRows(r.data || [])).finally(() => setLoading(false));
//   useEffect(() => { load(); }, []); // eslint-disable-line

//   const filtered = useMemo(() => rows.filter((r) =>
//     (!q || r.name.toLowerCase().includes(q.toLowerCase())) &&
//     (!status || r.status === status) && inRange(r.createdAt, from, to)), [rows, q, status, from, to]);

//   const open = (row) => {
//     setEdit(row || {});
//     setForm({ name: row?.name || "", description: row?.description || "", status: row?.status || "Active", image: row?.image || null });
//   };

//   const save = async (e) => {
//     e.preventDefault();
//     setBusy(true);
//     try {
//       const body = { name: form.name.trim(), status: form.status };
//       if (withDescription) body.description = form.description;
//       if (form.image instanceof File) body.image = form.image;
//       if (edit._id) await api.update(edit._id, body); else await api.create(body);
//       toast.success(`${singular} ${edit._id ? "updated" : "created"}`);
//       setEdit(null); load();
//     } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
//   };

//   const remove = async () => {
//     setBusy(true);
//     try { await api.remove(del._id); toast.success(`${singular} deleted`); setDel(null); load(); }
//     catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
//   };

//   const importRows = async (data) => {
//     await runImport(data, (r) => {
//       const name = String(pick(r, "name")).trim();
//       if (!name) throw new Error("name is required");
//       const body = { name, status: pick(r, "status") || "Active" };
//       if (withDescription) body.description = pick(r, "description");
//       return api.create(body);
//     }, plural.toLowerCase());
//     load();
//   };

//   const columns = [
//     { key: "image", header: "Image", render: (r) => <Thumb src={r.image} /> },
//     { key: "name", header: "Name", sortable: true, render: (r) => <span className="font-semibold">{r.name}</span> },
//     ...(withDescription ? [{ key: "description", header: "Description", render: (r) => <span className="line-clamp-1 max-w-xs text-ink-soft">{r.description || "—"}</span> }] : []),
//     { key: "status", header: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
//     { key: "createdAt", header: "Created", sortable: true, render: (r) => fmtDate(r.createdAt) },
//     { key: "actions", header: "", render: (r) => (
//       <div className="flex justify-end gap-1">
//         <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => open(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
//         <button className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" onClick={() => setDel(r)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
//       </div>) },
//   ];

//   const dirty = q || status || from || to;

//   return (
//     <>
//       <PageHeader title={plural} subtitle={`${rows.length} total`}>
//         <ExportImport
//           name={plural.toLowerCase()}
//           getRows={() => filtered.map((r) => ({ Name: r.name, ...(withDescription ? { Description: r.description || "" } : {}), Status: r.status, Image: r.image || "", Created: fmtDate(r.createdAt) }))}
//           onImport={importRows}
//           template={{ name: `Sample ${singular}`, ...(withDescription ? { description: "Optional text" } : {}), status: "Active" }}
//         />
//         <button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Add {singular.toLowerCase()}</button>
//       </PageHeader>

//       <Toolbar search={q} onSearch={setQ} placeholder={`Search ${plural.toLowerCase()}`} dirty={dirty} onReset={() => { setQ(""); setStatus(""); setFrom(""); setTo(""); }}>
//         <Select label="All status" value={status} onChange={setStatus} options={["Active", "Inactive"]} />
//         <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
//         <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
//       </Toolbar>

//       <DataTable columns={columns} rows={filtered} loading={loading} empty={`No ${plural.toLowerCase()} found`} />

//       <Modal open={!!edit} onClose={() => setEdit(null)} title={`${edit?._id ? "Edit" : "Add"} ${singular.toLowerCase()}`}>
//         <form onSubmit={save} className="space-y-4">
//           <Field label="Name"><input className="input" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
//           {withDescription && <Field label="Description"><textarea className="input" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>}
//           <Field label="Status">
//             <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
//               <option>Active</option><option>Inactive</option>
//             </select>
//           </Field>
//           <ImagePicker label={withDescription ? "Logo" : "Image"} value={form.image} onChange={(f) => setForm({ ...form, image: f })} />
//           <div className="flex justify-end gap-2 pt-2">
//             <button type="button" className="btn-outline" onClick={() => setEdit(null)}>Cancel</button>
//             <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
//           </div>
//         </form>
//       </Modal>

//       <Confirm open={!!del} busy={busy} title={`Delete ${singular.toLowerCase()}?`} text={`“${del?.name}” will be removed permanently.`} onConfirm={remove} onClose={() => setDel(null)} />
//     </>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { errMsg } from "../../api/client";
import { Confirm, Field, Modal, StatusBadge } from "../common/ui";
import { DataTable, ExportImport, ImagePicker, PageHeader, Select, Thumb, Toolbar, pick, runImport } from "./AdminKit";
import { fmtDate, inRange } from "../../utils/format";

// Renders children straight into <body> so `position: fixed` overlays are relative
// to the viewport, not to a transformed/animated ancestor in the layout.
const Portal = ({ children }) =>
  typeof document === "undefined" ? null : createPortal(children, document.body);

// Shared CRUD screen for Categories and Brands (name + image + status [+ description])
export default function SimpleCrud({ api, singular, plural, withDescription = false }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [edit, setEdit] = useState(null); // null | {} (new) | row
  const [form, setForm] = useState({});
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.list().then((r) => setRows(r.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = useMemo(() => rows.filter((r) =>
    (!q || r.name.toLowerCase().includes(q.toLowerCase())) &&
    (!status || r.status === status) && inRange(r.createdAt, from, to)), [rows, q, status, from, to]);

  const open = (row) => {
    setEdit(row || {});
    setForm({ name: row?.name || "", description: row?.description || "", status: row?.status || "Active", image: row?.image || null });
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { name: form.name.trim(), status: form.status };
      if (withDescription) body.description = form.description;
      if (form.image instanceof File) body.image = form.image;
      if (edit._id) await api.update(edit._id, body); else await api.create(body);
      toast.success(`${singular} ${edit._id ? "updated" : "created"}`);
      setEdit(null); load();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const remove = async () => {
    setBusy(true);
    try { await api.remove(del._id); toast.success(`${singular} deleted`); setDel(null); load(); }
    catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  const importRows = async (data) => {
    await runImport(data, (r) => {
      const name = String(pick(r, "name")).trim();
      if (!name) throw new Error("name is required");
      const body = { name, status: pick(r, "status") || "Active" };
      if (withDescription) body.description = pick(r, "description");
      return api.create(body);
    }, plural.toLowerCase());
    load();
  };

  const columns = [
    { key: "image", header: "Image", render: (r) => <Thumb src={r.image} /> },
    { key: "name", header: "Name", sortable: true, render: (r) => <span className="font-semibold">{r.name}</span> },
    ...(withDescription ? [{ key: "description", header: "Description", render: (r) => <span className="line-clamp-1 max-w-xs text-ink-soft">{r.description || "—"}</span> }] : []),
    { key: "status", header: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "Created", sortable: true, render: (r) => fmtDate(r.createdAt) },
    { key: "actions", header: "", render: (r) => (
      <div className="flex justify-end gap-1">
        <button className="rounded-lg p-2 text-ink-soft hover:bg-ink-wash" onClick={() => open(r)} aria-label="Edit"><Pencil className="h-4 w-4" /></button>
        <button className="rounded-lg p-2 text-primary-600 hover:bg-primary-50" onClick={() => setDel(r)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
      </div>) },
  ];

  const dirty = q || status || from || to;

  return (
    <>
      <PageHeader title={plural} subtitle={`${rows.length} total`}>
        <ExportImport
          name={plural.toLowerCase()}
          getRows={() => filtered.map((r) => ({ Name: r.name, ...(withDescription ? { Description: r.description || "" } : {}), Status: r.status, Image: r.image || "", Created: fmtDate(r.createdAt) }))}
          onImport={importRows}
          template={{ name: `Sample ${singular}`, ...(withDescription ? { description: "Optional text" } : {}), status: "Active" }}
        />
        <button className="btn-primary" onClick={() => open()}><Plus className="h-4 w-4" />Add {singular.toLowerCase()}</button>
      </PageHeader>

      <Toolbar search={q} onSearch={setQ} placeholder={`Search ${plural.toLowerCase()}`} dirty={dirty} onReset={() => { setQ(""); setStatus(""); setFrom(""); setTo(""); }}>
        <Select label="All status" value={status} onChange={setStatus} options={["Active", "Inactive"]} />
        <input type="date" className="input w-auto" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
        <input type="date" className="input w-auto" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
      </Toolbar>

      <DataTable columns={columns} rows={filtered} loading={loading} empty={`No ${plural.toLowerCase()} found`} />

      {/* Portaled to <body> so the dark backdrop covers the entire screen */}
      <Portal>
        <Modal open={!!edit} onClose={() => setEdit(null)} title={`${edit?._id ? "Edit" : "Add"} ${singular.toLowerCase()}`}>
          <form onSubmit={save} className="space-y-4">
            <Field label="Name"><input className="input" required value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            {withDescription && <Field label="Description"><textarea className="input" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>}
            <Field label="Status">
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option>Active</option><option>Inactive</option>
              </select>
            </Field>
            <ImagePicker label={withDescription ? "Logo" : "Image"} value={form.image} onChange={(f) => setForm({ ...form, image: f })} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setEdit(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </Modal>
      </Portal>

      <Portal>
        <Confirm open={!!del} busy={busy} title={`Delete ${singular.toLowerCase()}?`} text={`“${del?.name}” will be removed permanently.`} onConfirm={remove} onClose={() => setDel(null)} />
      </Portal>
    </>
  );
}