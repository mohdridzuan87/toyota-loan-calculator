// Kemas kini docs.json: pautan PDF MaxCheck (servis berkala) & senarai harga rasmi Toyota Malaysia, ikut model dalam app.
// Dijalankan oleh GitHub Actions 1hb & 15hb (.github/workflows/rebates.yml) atau manual: node scripts/update-docs.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import vm from "node:vm";

const SITE = "https://www.toyota.com.my";
const PRICE_SRC = SITE + "/en/price-and-model-tools/price-list.html";
const MAXCHECK_SRC = SITE + "/en/servicing-and-support/maxcheck.html";
const OUT = new URL("../docs.json", import.meta.url);
const UA = { "User-Agent": "Mozilla/5.0 (toyota-loan-calculator docs updater)" };
const get = async url => { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return r.text(); };
const key = s => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();

// Varian & model dalam app (data.js)
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../data.js", import.meta.url), "utf8"), ctx);
const CARS = ctx.window.CARS;
const carOfGrade = {};
for (const c of CARS) for (const g of c.grades) carOfGrade[key(g[0])] = c.id;
// Nama di laman Toyota -> nama dalam app (sama seperti update-prices.mjs)
const ALIAS = {
  "corolla cross hybrid electric": "Corolla Cross HEV",
  "hilux gr sport": "Hilux GR Sport 2.8 AT 4WD",
  "vellfire 2.5 hev at executive lounge": "Vellfire 2.5 HEV Executive Lounge"
};
for (const [k, v] of Object.entries(ALIAS)) carOfGrade[k] = carOfGrade[key(v)];

const abs = u => (String(u).startsWith("http") ? u : SITE + u);
const nice = s => s.replace(/\s+/g, " ").trim();

// 1) Senarai harga (Individual Private, Semenanjung) — satu PDF boleh dikongsi beberapa varian
const ph = await get(PRICE_SRC);
const pm = ph.match(/window\.data_price_list\s*=\s*(\{[\s\S]*?\});\s*\n/);
if (!pm) throw new Error("data_price_list tiada; docs.json tidak diubah.");
const pen = JSON.parse(pm[1]).states.find(s => s.id === "Peninsular Malaysia");
if (!pen) throw new Error("Tiada data Semenanjung");
const price = {}; // carId -> Map(url -> [nama varian])
for (const tab of pen.tabs) for (const it of tab.items || []) for (const c of it.categories || []) for (const g of c.gradeLists || []) {
  const id = carOfGrade[key(g.header)];
  const ip = (g.priceTypes || []).find(t => t.type === "Individual Private" && t.pdfLink) || (g.priceTypes || []).find(t => t.pdfLink); // Hiace panel van: Company Commercial sahaja
  if (!id || !ip || !ip.pdfLink) continue;
  const url = abs(ip.pdfLink);
  ((price[id] ||= new Map()).get(url) || (price[id].set(url, []), price[id].get(url))).push(nice(g.header));
}
const priceList = {};
for (const [id, m] of Object.entries(price)) {
  const car = CARS.find(c => c.id === id);
  // label: nama varian pertama; jika beberapa PDF, bezakan guna nama varian pertama (dipendekkan dengan nama model)
  priceList[id] = [...m.entries()].map(([url, names]) => ({ label: m.size > 1 ? names[0].replace(new RegExp("^" + car.name.replace(/\s+/g, "\\s+") + "\\s*", "i"), "").trim() || car.name : car.name, url }));
}

// 2) MaxCheck — semua pautan PDF pada halaman MaxCheck; padankan nama fail dengan model
const mh = await get(MAXCHECK_SRC);
const files = [...new Set([...mh.matchAll(/["'(]((?:https?:\/\/[^"'()\s]+)?\/content\/dam\/malaysia\/price-list-maintenance-packages\/periodic-maintenance\/[^"'()\s]+?\.pdf)/g)].map(m => abs(m[1])))];
if (files.length < 10) throw new Error("Terlalu sedikit PDF MaxCheck (" + files.length + "); docs.json tidak diubah.");
const RULES = [ // [regex nama fail, id model, label]
  [/^vios-grs/, "vios", "GR Sport"], [/^vios-hev/, "vios", "HEV"], [/^vios$/, "vios", "Petrol"],
  [/^yaris-cross-hev/, "yaris-cross", "HEV"], [/^yaris-cross-bsuv/, "yaris-cross", "Petrol"], [/^yaris$/, "yaris", ""],
  [/^corolla-altis/, "corolla", "Altis"], [/^corolla-gr-sport/, "corolla", "GR Sport"],
  [/^corolla-cross-gr-s/, "corolla-cross", "GR Sport"], [/^corolla-cross-hev/, "corolla-cross", "HEV"], [/^corolla-cross$/, "corolla-cross", "Petrol"],
  [/^camry-hev/, "camry", "HEV"], [/^camry$/, "camry", "Petrol"],
  [/^veloz$/, "veloz", ""], [/^innova-zenix-hev/, "zenix", "HEV"],
  [/^fortuner$/, "fortuner", ""], [/^hilux-grs/, "hilux", "GR Sport"], [/^hilux$/, "hilux", ""],
  [/^hiace$/, "hiace", ""], [/^harrier-hev/, "harrier", "HEV"], [/^harrier$/, "harrier", ""],
  [/^alphard$/, "alphard", ""], [/^vellfire-hev/, "vellfire", "HEV"], [/^vellfire$/, "vellfire", ""]
];
const maxcheck = {};
for (const url of files) {
  const base = decodeURIComponent(url.split("/").pop()).replace(/\.pdf$/i, "").replace(/-[a-z]+-\d{4}(-v\d+)?$/i, "").toLowerCase();
  const r = RULES.find(([re]) => re.test(base));
  if (r) (maxcheck[r[1]] ||= []).push({ label: r[2], url });
}
for (const list of Object.values(maxcheck)) for (const x of list) x.label = list.length === 1 ? "" : x.label || "Standard"; // satu sahaja: tiada label varian

const order = Object.fromEntries(CARS.map((c, i) => [c.id, i]));
const sortObj = o => Object.fromEntries(Object.entries(o).sort((a, b) => order[a[0]] - order[b[0]]));
const out = { source: { priceList: PRICE_SRC, maxcheck: MAXCHECK_SRC }, priceList: sortObj(priceList), maxcheck: sortObj(maxcheck) };

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const same = JSON.stringify(prev.priceList) === JSON.stringify(out.priceList) && JSON.stringify(prev.maxcheck) === JSON.stringify(out.maxcheck);
out.updatedAt = same && prev.updatedAt ? prev.updatedAt : new Date().toISOString().slice(0, 10);
writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
const miss = CARS.filter(c => !maxcheck[c.id] || !priceList[c.id]).map(c => c.id + (maxcheck[c.id] ? "" : "(maxcheck)") + (priceList[c.id] ? "" : "(harga)"));
console.log(`${same ? "Tiada perubahan" : "DIKEMAS KINI"} · harga ${Object.keys(priceList).length}/${CARS.length} model · MaxCheck ${Object.keys(maxcheck).length}/${CARS.length} · tiada: ${miss.join(", ") || "-"}`);
