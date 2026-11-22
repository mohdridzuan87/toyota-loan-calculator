// Kemas kini promos.json + gambar poster promosi dari laman promosi Toyota Malaysia.
// Dijalankan oleh GitHub Actions setiap 3 hari (.github/workflows/promos.yml), atau manual: node scripts/update-promos.mjs
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";

const SITE = "https://www.toyota.com.my";
const LIST_URL = SITE + "/en/promotions.html";
const OUT = new URL("../promos.json", import.meta.url);
const IMG_DIR = new URL("../assets/promo/", import.meta.url);
const UA = { "User-Agent": "Mozilla/5.0 (toyota-loan-calculator promo updater)" };

const get = async url => { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return r; };
const strip = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const abs = u => (String(u).startsWith("http") ? u : SITE + u);

// 1) Senarai promosi aktif
const lh = await (await get(LIST_URL)).text();
const lm = lh.match(/window\.data_promotions_listing\s*=\s*(\{[\s\S]*?\});\s*(?:\n|<\/script>)/);
if (!lm) throw new Error("data_promotions_listing tiada — struktur laman mungkin berubah; promos.json tidak diubah.");
const now = Date.now();
const items = [];
let monthly = null; // (tidak digunakan lagi)
for (const p of JSON.parse(lm[1]).promotions || []) {
  const [a, b] = String(p.date || "").split("-").map(s => +s.trim());
  if (a && b && !(a <= now && now <= b)) continue; // bukan aktif
  const it = { id: p.id, kind: "promo", title: strip(p.title), desc: strip(p.description), imgSrc: abs(p.image), link: p.link && p.link.url ? p.link.url : LIST_URL, until: b ? new Date(b).toISOString().slice(0, 10) : "" };
  items.push(it);
  if (p.id === "monthly-promo") monthly = it;
}
if (!items.length) throw new Error("Tiada promosi aktif dijumpai; promos.json tidak diubah.");

// (Poster utama sahaja: kad model promosi bulanan tidak dimasukkan — permintaan Wan)

// 3) Muat turun gambar (sekali; dilangkau jika sudah ada), buang yang tidak dipakai
mkdirSync(IMG_DIR, { recursive: true });
const keep = new Set(); let got = 0, failed = 0;
for (const it of items) {
  const ext = (it.imgSrc.split("?")[0].split(".").pop() || "jpg").toLowerCase().replace("jpeg", "jpg");
  const file = createHash("sha1").update(it.imgSrc).digest("hex").slice(0, 10) + "." + (["jpg", "png", "webp"].includes(ext) ? ext : "jpg");
  const path = new URL(file, IMG_DIR);
  if (!existsSync(path)) {
    try {
      const buf = Buffer.from(await (await get(it.imgSrc)).arrayBuffer());
      const ok = (buf[0] === 0xff && buf[1] === 0xd8) || buf.readUInt32BE(0) === 0x89504e47 || buf.subarray(0, 4).toString() === "RIFF";
      if (buf.length < 2000 || !ok) throw new Error("bukan imej sah");
      writeFileSync(path, buf); got++;
    } catch { failed++; it.img = ""; continue; }
  }
  it.img = "assets/promo/" + file; keep.add(file);
}
for (const f of readdirSync(IMG_DIR)) if (!f.startsWith(".") && !keep.has(f)) unlinkSync(new URL(f, IMG_DIR));
const out = items.filter(i => i.img).map(({ imgSrc, ...r }) => r).sort((a, b) => String(a.until).localeCompare(String(b.until)) || a.title.localeCompare(b.title)); // tarikh tamat paling dekat dahulu (promosi bulanan)
if (!out.length) throw new Error("Tiada gambar promosi berjaya dimuat turun; promos.json tidak diubah.");

const prev = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};
const same = JSON.stringify(prev.items) === JSON.stringify(out);
writeFileSync(OUT, JSON.stringify({ updatedAt: same ? prev.updatedAt : new Date().toISOString().slice(0, 10), source: LIST_URL, items: out }, null, 1) + "\n");
console.log(`${same ? "Tiada perubahan" : "DIKEMAS KINI"} · ${out.length} poster utama · gambar baharu ${got}, gagal ${failed}`);
