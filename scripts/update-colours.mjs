// Kemas kini colours.json: warna luaran + harga tambahan warna dari laman model Toyota Malaysia.
// Dijalankan oleh GitHub Actions pada 1hb & 15hb, atau manual: node scripts/update-colours.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";

const BASE = "https://www.toyota.com.my/en/models/";
const OUT = new URL("../colours.json", import.meta.url);
const IMG_DIR = new URL("../assets/cars/col/", import.meta.url);
const SITE = "https://www.toyota.com.my";

const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(readFileSync(new URL("../data.js", import.meta.url), "utf8"), ctx);
const CARS = ctx.window.CARS;

// Halaman rujukan ikut varian: dicuba berurutan, guna yang pertama ada data_colors
const pagesFor = (carId, name) => {
  const gr = /GR Sport/i.test(name), hev = /HEV/i.test(name);
  switch (carId) {
    case "vios": return gr ? ["vios/vios-hev-gr-sport.html", "vios/vios-hybrid-electric.html"] : hev ? ["vios/vios-hybrid-electric.html"] : ["vios.html"];
    case "yaris": return ["yaris.html"];
    case "yaris-cross": return ["yaris-cross-hybrid-electric.html"];
    case "corolla": return gr ? ["corolla/corolla-gr-sport.html", "corolla.html"] : ["corolla.html"];
    case "corolla-cross": return gr ? ["corolla-cross-hybrid-electric/corolla-cross-hev-gr-sport.html", "corolla-cross-hybrid-electric.html"] : ["corolla-cross-hybrid-electric.html"];
    case "camry": return ["camry-hybrid-electric.html"];
    case "veloz": return ["veloz.html"];
    case "zenix": return ["zenix.html"];
    case "fortuner": return ["fortuner.html"];
    case "hilux": return /GR Sport/i.test(name) ? ["hilux/hilux-gr-sport.html", "hilux.html"] : ["hilux.html"];
    case "hiace": return ["hiace.html"];
    case "harrier": return ["harrier-hybrid-electric.html"];
    case "alphard": return ["alphard.html"];
    case "vellfire": return ["vellfire.html"];
    default: return [];
  }
};

const cache = new Map();
async function colourData(page) {
  if (cache.has(page)) return cache.get(page);
  let out = null;
  try {
    const res = await fetch(BASE + page, { headers: { "User-Agent": "Mozilla/5.0 (toyota-loan-calculator colour updater)" } });
    if (res.ok) {
      const m = (await res.text()).match(/window\.data_colors\s*=\s*(\{[\s\S]*?\});\s*(?:\n|<\/script>)/);
      if (m) out = JSON.parse(m[1]);
    }
  } catch { /* abaikan, cuba halaman lain */ }
  cache.set(page, out); return out;
}

// Bersihkan nama: buang kod dalam kurungan dan kod hujung (089, 1G3, 219, MC)
const clean = s => String(s || "").replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+(\d[A-Z0-9]{2}|MC)$/i, "").replace(/\s+/g, " ").trim();
const num = s => { const m = String(s || "").match(/[\d,]+(?:\.\d+)?/); return m ? Math.round(+m[0].replace(/,/g, "")) : 0; };
const HEX_FALLBACK = [[/white/i, "#f2f2ee"], [/silver/i, "#9da2a4"], [/grey|gray|cement|metal stream|celestite/i, "#6a7376"], [/black/i, "#0b0d10"],
  [/red|scarlet|crimson|ruby/i, "#a4120f"], [/blue/i, "#203079"], [/brown|bronze|phantom/i, "#4a302e"], [/turquoise|green/i, "#0f6b73"], [/gold|blond/i, "#b9965a"]];
const hexFor = (name, known) => { for (const [re, h] of HEX_FALLBACK) if (re.test(name)) return known[name] || h; return known[name] || "#cccccc"; };

const byGrade = {}; const missing = [];
for (const car of CARS) for (const [gname] of car.grades) {
  let list = null, src = "";
  for (const page of pagesFor(car.id, gname)) {
    const d = await colourData(page); if (!d || !d.options) continue;
    const ext = d.options.find(o => o.id === "exterior") || d.options[0]; if (!ext || !(ext.colors || []).length) continue;
    const known = {};
    list = [];
    for (const c of ext.colors) {
      const name = clean(c.colorName), hex = (c.colorCode && c.colorCode.backgroundColor) || null;
      if (hex) known[name] = hex;
      const imgSrc = c.folderUrl ? c.folderUrl + "/01.png" : c.imgUrl || "";
      list.push({ name, hex: hex || hexFor(name.replace(/\s+with\s+.*$/i, "").replace(/^2-tone\s+/i, ""), known), price: num(c.additionalPrice), two: /2-tone|black roof/i.test(c.colorName), imgSrc });
    }
    for (const v of ext.variantColors || []) {
      if ((v.exclusiveTo || []).length && !v.exclusiveTo.includes(gname)) continue;
      const base = clean(v.colorName).replace(/\s+with\s+.*$/i, "");
      const name = clean(v.colorName), hex = (v.colorCode && v.colorCode.backgroundColor) || known[base] || hexFor(base, known);
      if (!list.some(x => x.name === name)) list.push({ name, hex, price: num(v.additionalPrice), two: /2-tone|black roof/i.test(v.colorName), imgSrc: v.imgUrl || "" });
    }
    src = BASE + page; break;
  }
  if (list && list.length) byGrade[gname] = { src, colours: list }; else missing.push(gname);
}
if (Object.keys(byGrade).length < 10) throw new Error("Terlalu sedikit data warna (" + Object.keys(byGrade).length + "); colours.json tidak diubah.");

// ---- gambar kereta ikut warna: simpan salinan asal (dipotong tepi oleh app semasa melukis poster)
mkdirSync(IMG_DIR, { recursive: true });
const keep = new Set(); let got = 0, failed = 0;
for (const { colours } of Object.values(byGrade)) for (const c of colours) {
  if (!c.imgSrc) { delete c.imgSrc; continue; }
  const url = c.imgSrc.startsWith("http") ? c.imgSrc : SITE + c.imgSrc;
  const file = createHash("sha1").update(url).digest("hex").slice(0, 10) + ".png", path = new URL(file, IMG_DIR);
  if (!existsSync(path)) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (toyota-loan-calculator colour updater)" } });
      const buf = Buffer.from(await r.arrayBuffer());
      if (!r.ok || buf.length < 2000 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error("bukan PNG sah");
      writeFileSync(path, buf); got++;
    } catch { failed++; delete c.imgSrc; continue; }
  }
  c.img = "assets/cars/col/" + file; keep.add(file); delete c.imgSrc;
}
for (const f of readdirSync(IMG_DIR)) if (f.endsWith(".png") && !keep.has(f)) unlinkSync(new URL(f, IMG_DIR)); // buang gambar tidak digunakan
console.log("Gambar warna: " + keep.size + " dipakai, " + got + " baharu, " + failed + " gagal");

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const same = JSON.stringify(prev.byGrade) === JSON.stringify(byGrade);
writeFileSync(OUT, JSON.stringify({ updatedAt: same ? prev.updatedAt : new Date().toISOString().slice(0, 10), byGrade, missing }, null, 1) + "\n");
const paid = Object.entries(byGrade).flatMap(([g, v]) => v.colours.filter(c => c.price).map(c => `${g}: ${c.name} +RM${c.price}`));
console.log(`${same ? "Tiada perubahan" : "DIKEMAS KINI"} · ${Object.keys(byGrade).length} varian · tiada data: ${missing.join(", ") || "-"} · berbayar: ${paid.join("; ") || "-"}`);
