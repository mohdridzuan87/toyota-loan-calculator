// Kemas kini rebates.json dari laman promo bulanan Toyota Malaysia.
// Dijalankan oleh GitHub Actions setiap hari (.github/workflows/rebates.yml) atau manual: node scripts/update-rebates.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const SRC = "https://www.toyota.com.my/en/promotions/monthly-promo.html";
const OUT = new URL("../rebates.json", import.meta.url);

// Tajuk promo (selepas dinormalkan) -> nama varian dalam data.js
const MAP = {
  "VIOS": ["Vios 1.5E AT", "Vios 1.5G AT"],
  "VIOS HEV": ["Vios 1.5 HEV AT"],
  "VIOS HEV GR SPORT": ["Vios 1.5 HEV GR Sport"],
  "COROLLA GR SPORT": ["Corolla GR Sport"],
  "HILUX GR SPORT": ["Hilux GR Sport 2.8 AT 4WD"],
  "YARIS": ["Yaris 1.5E AT", "Yaris 1.5G AT"],
  "YARIS CROSS": ["Yaris Cross 1.5S"],
  "YARIS CROSS HEV": ["Yaris Cross 1.5S HEV"],
  "COROLLA": ["Corolla 1.8G"],
  "COROLLA CROSS": ["Corolla Cross 1.8V AT"],
  "COROLLA CROSS HEV": ["Corolla Cross HEV"],
  "COROLLA CROSS HEV GR SPORT": ["Corolla Cross HEV GR Sport"],
  "CAMRY": ["Camry 2.5V AT"],
  "CAMRY HEV": ["Camry 2.5 HEV"],
  "VELOZ": ["Veloz 1.5 AT"],
  "INNOVA ZENIX": ["Innova Zenix 2.0V"],
  "INNOVA ZENIX HEV": ["Innova Zenix 2.0 HEV"],
  "FORTUNER": ["Fortuner 2.4 AT 4WD", "Fortuner 2.7 SRZ AT 4WD", "Fortuner 2.8 VRZ AT 4WD"],
  "HILUX": ["Hilux Double Cab 2.4E MT 4WD", "Hilux Double Cab 2.4E AT 4WD", "Hilux Double Cab 2.4V AT 4WD", "Hilux Double Cab 2.8 Rogue AT 4WD"],
  "HILUX SINGLE CAB": ["Hilux Single Cab 2.4 MT 4WD"],
  "HIACE": ["Hiace Panel Van 3.0 Turbo Diesel"],
  "HARRIER HEV": ["Harrier 2.5 HEV"],
  "ALPHARD": ["Alphard 2.4T Executive Lounge"],
  "VELLFIRE": ["Vellfire 2.5"],
  "VELLFIRE HEV": ["Vellfire 2.5 HEV Executive Lounge"]
};

const norm = s => String(s || "").toUpperCase().replace(/\bALL-NEW\b|\bNEW\b/g, " ")
  .replace(/HYBRID ELECTRIC/g, "HEV").replace(/\s+/g, " ").trim();
const num = s => { const m = String(s || "").match(/RM\s?([\d,]+)/i); return m ? +m[1].replace(/,/g, "") : 0; };

const res = await fetch(SRC, { headers: { "User-Agent": "Mozilla/5.0 (sa-toolkit rebate updater)" } });
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const html = await res.text();

const tiles = [];
for (const m of html.matchAll(/window\.component_promotion_tiles__\d+\s*=\s*(\{[\s\S]*?\});\s*<\/script>/g)) {
  try { tiles.push(...(JSON.parse(m[1]).lists || [])); } catch { /* abaikan blok rosak */ }
}
if (!tiles.length) throw new Error("Tiada data promo dijumpai — struktur laman mungkin berubah; rebates.json tidak diubah.");

const monthM = html.match(/\/promotions\/([a-z]+)-(\d{4})\//i);
const month = monthM ? monthM[1][0].toUpperCase() + monthM[1].slice(1).toLowerCase() + " " + monthM[2] : "";

const byGrade = {}, raw = [], unmapped = [];
for (const l of tiles) {
  const key = norm(l.title);
  let amount = num(l.discountAmount);
  // Jika syarat sebut rebate tunai (cth. "RM3,500 rebate"), guna nilai tunai tertinggi
  const cash = [...String(l.conditionsText || "").matchAll(/RM\s?([\d,]+)\s*(?:cash\s*)?rebate/gi)].map(x => +x[1].replace(/,/g, ""));
  if (cash.length) amount = Math.max(...cash);
  raw.push({ title: l.title, label: (l.discountLabel || "").trim(), amount: l.discountAmount, conditions: l.conditionsText || "", used: amount });
  if (MAP[key]) for (const g of MAP[key]) byGrade[g] = amount;
  else unmapped.push(l.title);
}

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const same = prev.month === month && JSON.stringify(prev.byGrade) === JSON.stringify(byGrade);
const out = { month, source: SRC, updatedAt: same ? prev.updatedAt : new Date().toISOString().slice(0, 10), byGrade, raw, unmapped };
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`${same ? "Tiada perubahan" : "DIKEMAS KINI"} · ${month} · ${Object.keys(byGrade).length} varian · tidak dipetakan: ${unmapped.join(", ") || "-"}`);
