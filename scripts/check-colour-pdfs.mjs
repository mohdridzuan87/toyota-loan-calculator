// Semak sama ada PDF senarai harga Toyota (sumber colour-prices.json) sudah bertukar versi.
// Jika ya: tandakan stale=true dalam colour-prices.json supaya app memberi amaran. Dijalankan oleh Action 1hb & 15hb.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = "https://www.toyota.com.my/en/price-and-model-tools/price-list.html";
const FILE = new URL("../colour-prices.json", import.meta.url);
if (!existsSync(FILE)) { console.log("colour-prices.json tiada; langkau"); process.exit(0); }
const cp = JSON.parse(readFileSync(FILE, "utf8"));

const res = await fetch(SRC, { headers: { "User-Agent": "Mozilla/5.0 (toyota-loan-calculator pdf checker)" } });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const m = (await res.text()).match(/window\.data_price_list\s*=\s*(\{[\s\S]*?\});\s*\n/);
if (!m) throw new Error("data_price_list tiada; semakan dilangkau");
const pen = JSON.parse(m[1]).states.find(s => s.id === "Peninsular Malaysia");
const current = new Set();
for (const tab of pen.tabs) for (const it of tab.items || []) for (const c of it.categories || []) for (const g of c.gradeLists || [])
  for (const t of g.priceTypes || []) if (t.type === "Individual Private" && t.pdfLink) current.add(t.pdfLink.replace("/content/dam/malaysia/price-list-maintenance-packages/", ""));
if (current.size < 10) throw new Error("Terlalu sedikit pautan PDF (" + current.size + "); semakan dilangkau");

const changed = Object.entries(cp.sources || {}).filter(([, p]) => !current.has(p)).map(([k, p]) => k + ": " + p);
const stale = changed.length > 0;
if (stale !== !!cp.stale || JSON.stringify(changed) !== JSON.stringify(cp.changedPdfs || [])) {
  writeFileSync(FILE, JSON.stringify({ ...cp, stale, changedPdfs: changed }, null, 1) + "\n");
}
console.log(stale ? "PDF BERUBAH (" + changed.length + "): " + changed.join("; ") : "PDF warna masih terkini (" + Object.keys(cp.sources || {}).length + " sumber)");
