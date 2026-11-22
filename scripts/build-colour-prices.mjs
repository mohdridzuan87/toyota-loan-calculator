// Jana colour-prices.json: harga warna + ketersediaan ikut varian, dari jadual PDF senarai harga Toyota (colour-pdf-raw.json)
// dipadankan dengan warna laman model (colours.json). Jalankan: node scripts/build-colour-prices.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const raw = JSON.parse(readFileSync(new URL("./colour-pdf-raw.json", import.meta.url), "utf8"));
const cols = JSON.parse(readFileSync(new URL("../colours.json", import.meta.url), "utf8"));
const OUT = new URL("../colour-prices.json", import.meta.url);

// Normalisasi nama warna: tanpa kod/kurungan, "mica"/"metallic" dibuang, II=2, gray=grey, token disusun
const norm = s => String(s || "").toLowerCase().replace(/\(2-?\s?tone\)|\b2-?\s?tone\b/g, " 2tone ").replace(/\([^)]*\)/g, " ")
  .replace(/\bii\b/g, "2").replace(/\bgray\b/g, "grey").replace(/\b(mica|metallic|solid)\b/g, " ").replace(/[^a-z0-9 ]/g, " ")
  .split(/\s+/).filter(Boolean).sort().join(" ");

const byGrade = {}, unmatched = [], unused = [];
const siteHas = g => (cols.byGrade[g] && cols.byGrade[g].colours) || [];

for (const [key, tbl] of Object.entries(raw.tables)) {
  const map = raw.gradeColumns[key] || {};
  for (const [grade, colName] of Object.entries(map)) {
    const ci = tbl.cols.indexOf(colName);
    if (ci < 0) { unmatched.push(`${grade}: lajur "${colName}" tiada dalam ${key}`); continue; }
    const out = byGrade[grade] = {}; const used = new Set();
    for (const site of siteHas(grade)) {
      const row = tbl.rows.find(r => norm(r.name) === norm(site.name));
      if (!row) { unmatched.push(`${grade}: warna laman "${site.name}" tiada dalam PDF`); continue; }
      used.add(row.code);
      const sur = tbl.surcharge && tbl.surcharge.codes.includes(row.code) ? tbl.surcharge.price : 0;
      out[site.name] = { price: row.price != null ? row.price : sur, avail: !!row.avail[ci], code: row.code };
    }
    for (const r of tbl.rows) if (r.avail[ci] && !used.has(r.code)) unused.push(`${grade}: PDF "${r.name}" (${r.code}) tiada dalam warna laman`);
  }
}
// PDF tanpa jadual: hanya harga ikut nama
for (const [key, t] of Object.entries(raw.textOnly)) {
  if (key.startsWith("_")) continue;
  for (const grade of t.grades) {
    const out = byGrade[grade] = {};
    for (const site of siteHas(grade)) { const hit = t.prices.find(([n]) => norm(n) === norm(site.name)); out[site.name] = { price: hit ? hit[1] : 0, avail: true }; }
  }
}

const sources = Object.fromEntries([...Object.entries(raw.tables).map(([k, v]) => [k, v.pdf]), ...Object.entries(raw.textOnly).filter(([k]) => !k.startsWith("_")).map(([k, v]) => [k, v.pdf])]);
const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const same = JSON.stringify(prev.byGrade) === JSON.stringify(byGrade);
writeFileSync(OUT, JSON.stringify({ updatedAt: same ? prev.updatedAt : new Date().toISOString().slice(0, 10), stale: false, changedPdfs: [], sources, byGrade }, null, 1) + "\n");
const priced = Object.entries(byGrade).flatMap(([g, m]) => Object.entries(m).filter(([, v]) => v.price && v.avail).map(([n, v]) => `${g}: ${n} +RM${v.price}`));
console.log(`${Object.keys(byGrade).length} varian · berbayar ${priced.length}`);
console.log("TIADA PADANAN (" + unmatched.length + "):\n  " + (unmatched.join("\n  ") || "-"));
console.log("PDF TIADA DALAM LAMAN (" + unused.length + "):\n  " + (unused.join("\n  ") || "-"));
