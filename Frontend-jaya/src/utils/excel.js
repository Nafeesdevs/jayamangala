import * as XLSX from "xlsx";

// rows: array of flat objects. format: "xlsx" | "csv"
export function exportRows(rows, name, format = "xlsx") {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 28));
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${name}-${stamp}.${format}`, { bookType: format });
}

// Read first sheet of an xlsx / csv file into an array of objects
export async function readSheet(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

// Download a template (header only + sample row)
export function downloadTemplate(name, sample) {
  exportRows([sample], `${name}-template`, "xlsx");
}
