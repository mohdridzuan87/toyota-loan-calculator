// Kemas kini prices.json dari laman senarai harga Toyota Malaysia (OTR Semenanjung, Individual Private).
// Dijalankan oleh GitHub Actions pada 1hb & 15hb (.github/workflows/rebates.yml) atau manual: node scripts/update-prices.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const SRC = "https://www.toyota.com.my/en/price-and-model-tools/price-list.html";
const OUT = new URL("../prices.json", import.meta.url);

// Nama varian dalam app (data.js)
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../data.js", import.meta.url), "utf8"), ctx);
const ours = ctx.window.CARS.flatMap(c => c.grades.map(g => g[0]));

// Nama di laman Toyota -> nama dalam app (jika berbeza)
const ALIAS = {
  "corolla cross hybrid electric": "Corolla Cross HEV",
  "hilux gr sport": "Hilux GR Sport 2.8 AT 4WD",
  "vellfire 2.5 hev at executive lounge": "Vellfire 2.5 HEV Executive Lounge"
};
const key = s => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
const num = s => { const m = String(s || "").match(/RM\s?([\d,]+(?:\.\d+)?)/i); return m ? Math.round(+m[1].replace(/,/g, "")) : 0; };

const res = await fetch(SRC, { headers: { "User-Agent": "Mozilla/5.0 (sa-toolkit price updater)" } });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const html = await res.text();
const m = html.match(/window\.data_price_list\s*=\s*(\{[\s\S]*?\});\s*\n/);
if (!m) throw new Error("data_price_list tiada — struktur laman mungkin berubah; prices.json tidak diubah.");
const pen = JSON.parse(m[1]).states.find(s => s.id === "Peninsular Malaysia");
if (!pen) throw new Error("Tiada data Semenanjung");

const site = {};
for (const tab of pen.tabs) for (const it of tab.items || []) for (const c of it.categories || []) for (const g of c.gradeLists || []) {
  const ip = (g.priceTypes || []).find(t => t.type === "Individual Private");
  const price = num(ip ? ip.price : g.price && g.price.retail);
  if (price) site[key(g.header)] = price;
}
const byKey = Object.fromEntries(ours.map(n => [key(n), n]));
const byGrade = {};
for (const [k, price] of Object.entries(site)) {
  const name = ALIAS[k] || byKey[k];
  if (name) byGrade[name] = price;
}
const missing = ours.filter(n => !(n in byGrade));
if (Object.keys(byGrade).length < ours.length / 2) throw new Error(`Terlalu sedikit padanan (${Object.keys(byGrade).length}); prices.json tidak diubah.`);

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const same = JSON.stringify(prev.byGrade) === JSON.stringify(byGrade);
// checkedAt = tarikh semakan berjaya terakhir (berubah setiap larian); app beri amaran jika >30 hari (Action mungkin terhenti)
const today = new Date().toISOString().slice(0, 10);
const out = { source: SRC, updatedAt: same ? prev.updatedAt : today, checkedAt: today, byGrade, missing };
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`${same ? "Tiada perubahan" : "DIKEMAS KINI"} · ${Object.keys(byGrade).length} varian · tiada di laman: ${missing.join(", ") || "-"}`);
