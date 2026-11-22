(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const view = $("#view");
  const CARS = window.CARS;
  const GRADES = CARS.flatMap(c => c.grades.map(([name, fuel, price]) => ({ car: c, name, fuel, price })));
  const RM = n => "RM" + Math.round(n).toLocaleString("en-MY");
  const FOOT = "*Harga boleh berubah bila-bila masa dari tarikh poster ini dikongsi. Harga berdasarkan untuk Semenanjung Malaysia sahaja. Anggaran ansuran, tertakluk pada terma dan syarat bank.";

  // ---------- storage (selamat jika disekat) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const profile = () => store.get("sa_profile", { name: "", phone: "", branch: "" });
  const loanPref = () => store.get("sa_loan", { dep: 10, rate: 2.8, years: 9 });

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const toast = msg => { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 2200); };
  const waNum = p => { let d = (p || "").replace(/\D/g, ""); if (d.startsWith("0")) d = "6" + d; return d; };
  const monthly = (price, depPct, rate, years) => {
    const fin = price * (1 - depPct / 100);
    return (fin + fin * (rate / 100) * years) / (years * 12);
  };
  const gradeOptions = sel => GRADES.map((g, i) => `<option value="${i}" ${i === sel ? "selected" : ""}>${g.name} · ${RM(g.price)}</option>`).join("");
  const needProfile = () => { const p = profile(); if (!p.name || !p.phone) { toast("Isi nama & nombor di tab Akaun dulu"); return false; } return true; };

  // ---------- HOME ----------
  function home() {
    const p = profile();
    view.innerHTML = `
      <section class="hero">
        <div class="strip">${CARS.slice(0, 8).map(c => `<img src="${c.img}" alt="${c.name}">`).join("")}</div>
        <span class="badge">BARU</span><small>${CARS.length} MODEL TOYOTA RASMI</small>
        <h3>Hantar info rasmi, <em>siap nama & nombor ${p.name ? esc(p.name.split(" ")[0]) : "awak"}</em></h3>
        <p>Customer minta brochure? Hantar terus ke WhatsApp.</p>
        <a class="btn white" href="#brosur">Buka Brosur</a>
      </section>
      <div class="grid">
        <a class="tile" href="#loan"><div class="ic">🧾</div><b>Loan poster</b><small>Percuma · tanpa had</small></a>
        <a class="tile" href="#loan/banding"><div class="ic">⚖️</div><b>Banding 2 varian</b><small>1 poster, 2 loan</small></a>
        <a class="tile" href="#gaji"><div class="ic">💼</div><b>Ikut gaji</b><small>Gaji → senarai kereta</small></a>
        <a class="tile" href="#brosur"><div class="ic">📄</div><b>Brosur</b><small>Hantar ke WhatsApp</small></a>
        <a class="tile wide" href="#akaun"><div class="ic">👤</div><div><b>${esc(p.name) || "Lengkapkan profil"}</b><small>${esc(p.phone) ||"Nama & nombor akan masuk dalam poster"}</small></div></a>
      </div>`;
  }

  // ---------- LOAN ----------
  let loanMode = "satu";
  function loan(sub) {
    if (sub === "banding") loanMode = "banding";
    const pref = loanPref();
    const sel = store.get("sa_sel", [1, 2]);
    view.innerHTML = `
      <h2>Loan poster</h2><p class="sub">Kira ansuran & jana poster siap nama awak.</p>
      <div class="seg"><button data-m="satu" class="${loanMode === "satu" ? "on" : ""}">1 varian</button><button data-m="banding" class="${loanMode === "banding" ? "on" : ""}">Banding 2 varian</button></div>
      <div class="card">
        <label>Varian ${loanMode === "banding" ? "A" : ""}</label><select id="g1">${gradeOptions(sel[0])}</select>
        ${loanMode === "banding" ? `<label>Varian B</label><select id="g2">${gradeOptions(sel[1])}</select>` : ""}
        <div class="row">
          <div><label>Deposit (%)</label><input id="dep" type="number" min="0" max="90" step="1" value="${pref.dep}"></div>
          <div><label>Kadar faedah (% setahun)</label><input id="rate" type="number" min="0" max="10" step="0.01" value="${pref.rate}"></div>
        </div>
        <label>Tempoh</label>
        <select id="yrs">${[9, 8, 7, 6, 5].map(y => `<option ${y == pref.years ? "selected" : ""} value="${y}">${y} tahun</option>`).join("")}</select>
      </div>
      <div class="card result" id="res"></div>
      <div class="card">
        <canvas id="cv" width="1080" height="1350"></canvas>
        <div class="actions"><button class="btn red" id="dl">Muat turun PNG</button><button class="btn wa" id="share">Kongsi</button></div>
        <p class="note">${FOOT}</p>
      </div>`;
    view.querySelectorAll(".seg button").forEach(b => b.onclick = () => { loanMode = b.dataset.m; location.hash = loanMode === "banding" ? "#loan/banding" : "#loan"; route(); });
    const update = () => {
      const v = { dep: +$("#dep").value || 0, rate: +$("#rate").value || 0, years: +$("#yrs").value };
      store.set("sa_loan", v);
      const picks = [+$("#g1").value]; if ($("#g2")) picks.push(+$("#g2").value);
      store.set("sa_sel", [picks[0], picks[1] ?? sel[1]]);
      const rows = picks.map(i => { const g = GRADES[i]; return { g, dep: g.price * v.dep / 100, m: monthly(g.price, v.dep, v.rate, v.years) }; });
      $("#res").innerHTML = rows.map(r => `
        <div class="res"><div class="k">${r.g.name}</div><div class="v">${RM(r.m)}<small style="font-size:14px;font-weight:600"> /bulan</small></div>
        <div class="kv"><span>Harga OTR</span><span>${RM(r.g.price)}</span></div>
        <div class="kv"><span>Deposit ${v.dep}%</span><span>${RM(r.dep)}</span></div>
        <div class="kv"><span>Loan</span><span>${RM(r.g.price - r.dep)}</span></div></div>`).join("") +
        (rows.length === 2 ? `<div class="kv"><span>Beza sebulan</span><b>${RM(Math.abs(rows[0].m - rows[1].m))}</b></div>` : "");
      drawPoster(rows, v);
    };
    view.querySelectorAll("select,input").forEach(e => e.oninput = update);
    $("#dl").onclick = () => { if (!needProfile()) return; $("#cv").toBlob(b => saveBlob(b, "loan-poster.png")); };
    $("#share").onclick = () => { if (!needProfile()) return; $("#cv").toBlob(b => shareBlob(b, "loan-poster.png")); };
    update();
  }

  const imgCache = {};
  const loadImg = src => imgCache[src] || (imgCache[src] = new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; }));
  const cover = (ctx, img, x, y, w, h) => {
    if (!img) return;
    const s = Math.max(w / img.width, h / img.height), sw = w / s, sh = h / s;
    ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h);
  };
  const rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); };
  const wrap = (ctx, text, x, y, maxW, lh) => {
    const words = text.split(" "); let line = "";
    for (const w of words) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = t; }
    ctx.fillText(line, x, y); return y;
  };
  const fit = (ctx, text, maxW, size, weight = 800) => { let s = size; do { ctx.font = `${weight} ${s}px "Plus Jakarta Sans", sans-serif`; s -= 2; } while (ctx.measureText(text).width > maxW && s > 20); };

  let drawSeq = 0;
  async function drawPoster(rows, v) {
    const seq = ++drawSeq;
    await document.fonts.ready;
    const imgs = await Promise.all(rows.map(r => loadImg(r.g.car.img)));
    if (seq !== drawSeq) return;
    const cv = $("#cv"); if (!cv) return;
    const ctx = cv.getContext("2d"), W = 1080, H = 1350, p = profile();
    const F = (w, s) => ctx.font = `${w} ${s}px "Plus Jakarta Sans", sans-serif`;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b1b3a"); g.addColorStop(1, "#16346e");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.fillStyle = "#f5c542"; F(800, 34); ctx.fillText(rows.length === 2 ? "PERBANDINGAN LOAN" : "PAKEJ LOAN TOYOTA", W / 2, 96);

    if (rows.length === 1) {
      const r = rows[0];
      ctx.fillStyle = "#fff"; fit(ctx, r.g.name.toUpperCase(), 960, 64); ctx.fillText(r.g.name.toUpperCase(), W / 2, 176);
      rr(ctx, 60, 214, 960, 500, 32); ctx.save(); ctx.clip(); ctx.fillStyle = "#fff"; ctx.fill(); cover(ctx, imgs[0], 60, 214, 960, 500); ctx.restore();
      ctx.fillStyle = "#fff"; F(600, 34); ctx.fillText("Ansuran bulanan dari", W / 2, 772);
      ctx.fillStyle = "#f5c542"; F(800, 124); ctx.fillText(RM(r.m), W / 2, 884);
      const items = [["Harga OTR*", RM(r.g.price)], [`Deposit ${v.dep}%`, RM(r.dep)], ["Tempoh", `${v.years} tahun`], ["Kadar", `${v.rate}%`]];
      items.forEach(([k, val], i) => {
        const x = 60 + (i % 2) * 490, y = 920 + Math.floor(i / 2) * 102;
        rr(ctx, x, y, 470, 90, 20); ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fill();
        ctx.textAlign = "left"; ctx.fillStyle = "#b9c6e4"; F(600, 24); ctx.fillText(k, x + 26, y + 36);
        ctx.fillStyle = "#fff"; F(800, 34); ctx.fillText(val, x + 26, y + 76);
      });
    } else {
      rows.forEach((r, i) => {
        const x = 60 + i * 490, w = 470;
        rr(ctx, x, 140, w, 860, 28); ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
        rr(ctx, x + 16, 156, w - 32, 300, 20); ctx.save(); ctx.clip(); ctx.fillStyle = "#fff"; ctx.fill(); cover(ctx, imgs[i], x + 16, 156, w - 32, 300); ctx.restore();
        ctx.textAlign = "center"; ctx.fillStyle = "#fff"; F(800, 34);
        wrap(ctx, r.g.name, x + w / 2, 512, w - 40, 42);
        ctx.fillStyle = "#b9c6e4"; F(600, 26); ctx.fillText("Ansuran sebulan", x + w / 2, 640);
        ctx.fillStyle = "#f5c542"; fit(ctx, RM(r.m), w - 40, 80); ctx.fillText(RM(r.m), x + w / 2, 726);
        [["Harga OTR*", RM(r.g.price)], [`Deposit ${v.dep}%`, RM(r.dep)], ["Loan", RM(r.g.price - r.dep)]].forEach(([k, val], j) => {
          const y = 800 + j * 60; ctx.textAlign = "left"; ctx.fillStyle = "#b9c6e4"; F(600, 24); ctx.fillText(k, x + 30, y);
          ctx.textAlign = "right"; ctx.fillStyle = "#fff"; F(800, 26); ctx.fillText(val, x + w - 30, y);
        });
      });
      ctx.textAlign = "center"; ctx.fillStyle = "#fff"; F(700, 34);
      ctx.fillText(`Beza ${RM(Math.abs(rows[0].m - rows[1].m))} sebulan · ${v.years} tahun · ${v.rate}%`, W / 2, 1070);
    }
    // jalur SA
    ctx.fillStyle = "#eb0a1e"; ctx.fillRect(0, 1180, W, 120);
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; F(800, 40); ctx.fillText(p.name || "Nama awak", 60, 1232);
    F(600, 26); ctx.fillText(`Sales Advisor Toyota${p.branch ? " · " + p.branch : ""}`, 60, 1272);
    ctx.textAlign = "right"; F(800, 42); ctx.fillText(p.phone || "01x-xxx xxxx", W - 60, 1250);
    ctx.textAlign = "center"; ctx.fillStyle = "#b9c6e4"; F(500, 17);
    wrap(ctx, FOOT, W / 2, rows.length === 1 ? 1140 : 1122, 960, 22);
    ctx.fillStyle = "#0b1b3a"; ctx.fillRect(0, 1300, W, 50); ctx.fillStyle = "#b9c6e4"; F(500, 18);
    ctx.fillText("Harga OTR termasuk SST, tanpa insurans, individu persendirian · sumber: toyota.com.my", W / 2, 1332);
  }

  function saveBlob(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast("Fail dimuat turun"); }
  async function shareBlob(blob, name) {
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); } catch {} }
    else { saveBlob(blob, name); toast("Telefon tak sokong kongsi terus — fail dimuat turun"); }
  }

  // ---------- BROSUR ----------
  const BROCH = window.BROCHURES || {};
  let pdfLibP;
  const loadPdfLib = () => pdfLibP || (pdfLibP = new Promise((res, rej) => {
    if (window.PDFLib) return res(window.PDFLib);
    const s = document.createElement("script"); s.src = "vendor/pdf-lib.min.js";
    s.onload = () => res(window.PDFLib); s.onerror = () => { pdfLibP = null; rej(new Error("pdf-lib gagal dimuat")); };
    document.head.appendChild(s);
  }));
  // Helvetica hanya sokong aksara Latin (WinAnsi)
  const latin = s => String(s || "").replace(/[^\x20-\x7E -ÿ]/g, "").trim();

  async function stampBrochure(car) {
    const p = profile(), [file] = BROCH[car.id];
    const [L, bytes] = await Promise.all([loadPdfLib(), fetch("brochures/" + file).then(r => { if (!r.ok) throw new Error("PDF tiada"); return r.arrayBuffer(); })]);
    const { PDFDocument, StandardFonts, rgb, PDFString, PDFName } = L;
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const bold = await doc.embedFont(StandardFonts.HelveticaBold), reg = await doc.embedFont(StandardFonts.Helvetica);
    const name = latin(p.name), phone = latin(p.phone), branch = latin(p.branch);
    const wa = "https://wa.me/" + waNum(p.phone);
    const link = (page, rect) => {
      const annot = doc.context.register(doc.context.obj({
        Type: "Annot", Subtype: "Link", Rect: rect, Border: [0, 0, 0],
        A: { Type: "Action", S: "URI", URI: PDFString.of(wa) }
      }));
      page.node.addAnnot(annot);
    };
    const red = rgb(0.92, 0.04, 0.12), white = rgb(1, 1, 1);
    doc.getPages().forEach((page, i) => {
      const { width: w, height: h } = page.getSize();
      const u = Math.min(w, h);
      if (i === 0) {
        // jalur merah di bawah kulit depan
        const bh = u * 0.11, pad = u * 0.04;
        page.drawRectangle({ x: 0, y: 0, width: w, height: bh, color: red });
        const ns = bh * 0.3, ss = bh * 0.17, ps = bh * 0.32;
        page.drawText(name, { x: pad, y: bh * 0.52, size: ns, font: bold, color: white });
        page.drawText(`Sales Advisor Toyota${branch ? " · " + branch : ""}`, { x: pad, y: bh * 0.22, size: ss, font: reg, color: white });
        const pw = bold.widthOfTextAtSize(phone, ps);
        page.drawText(phone, { x: w - pad - pw, y: bh * 0.44, size: ps, font: bold, color: white });
        const tip = "Tekan untuk WhatsApp";
        page.drawText(tip, { x: w - pad - reg.widthOfTextAtSize(tip, ss), y: bh * 0.18, size: ss, font: reg, color: white });
        link(page, [0, 0, w, bh]);
      } else {
        // label kecil di setiap muka surat
        const fs = u * 0.016, txt = `${name} · ${phone} · WhatsApp`;
        const tw = bold.widthOfTextAtSize(txt, fs), px = fs * 0.8, bw = tw + px * 2, bh = fs * 2;
        const x = w - bw - fs, y = fs;
        page.drawRectangle({ x, y, width: bw, height: bh, color: red, opacity: 0.92 });
        page.drawText(txt, { x: x + px, y: y + fs * 0.65, size: fs, font: bold, color: white });
        link(page, [x, y, x + bw, y + bh]);
      }
    });
    doc.setTitle(`Toyota ${car.name} e-brochure`);
    doc.setAuthor(`${name} · Sales Advisor Toyota`);
    const out = await doc.save();
    const fname = `Toyota-${car.name.replace(/\s+/g, "-")}-e-brochure-${(name.split(" ")[0] || "SA").replace(/[^\w-]/g, "")}.pdf`;
    return new File([out], fname, { type: "application/pdf" });
  }

  function brosurMsg(c, withLink) {
    const p = profile();
    const harga = c.grades.map(g => `• ${g[0]}: ${RM(g[2])}`).join("\n");
    return `Hi! Saya ${p.name}, Sales Advisor Toyota${p.branch ? " " + p.branch : ""}.\n\n` +
      (withLink ? `Ini e-brochure rasmi Toyota ${c.name}:\n${BROCH[c.id] ? BROCH[c.id][1] : c.url}\n\n` : `Ini e-brochure rasmi Toyota ${c.name}.\n\n`) +
      `Harga OTR (Semenanjung, tanpa insurans):\n${harga}\n\n*Harga boleh berubah bila-bila masa.\nNak test drive atau kira loan? Boleh message saya: ${p.phone}`;
  }

  function brosur() {
    view.innerHTML = `
      <h2>Brosur rasmi</h2><p class="sub"><b>PDF</b>: e-brochure rasmi siap nama & nombor awak, kongsi terus ke WhatsApp. <b>Link</b>: hantar pautan + harga ke nombor customer.</p>
      <div class="card"><label>Nombor WhatsApp customer (untuk Link)</label><input id="cust" inputmode="tel" placeholder="cth. 0123456789"></div>
      <div class="list">${CARS.map((c, i) => `
        <div class="car"><img src="${c.img}" alt="${esc(c.name)}"><div class="t"><b>${esc(c.name)}</b><small>${c.type} · dari ${RM(Math.min(...c.grades.map(g => g[2])))}</small></div>
        <div style="display:grid;gap:6px">${BROCH[c.id] ? `<button class="btn red" data-pdf="${i}" style="padding:8px 12px">PDF</button>` : ""}<button class="btn wa" data-i="${i}" style="padding:8px 12px">Link</button></div></div>`).join("")}</div>
      <p class="note">E-brochure ialah salinan fail rasmi toyota.com.my; app hanya tambah jalur nama & nombor (boleh ditekan terus ke WhatsApp awak). Harga OTR Semenanjung, tanpa insurans.</p>`;
    view.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
      if (!needProfile()) return;
      const c = CARS[+b.dataset.i];
      window.open(`https://wa.me/${waNum($("#cust").value)}?text=${encodeURIComponent(brosurMsg(c, true))}`, "_blank");
    });
    view.querySelectorAll("[data-pdf]").forEach(b => b.onclick = async () => {
      if (!needProfile() || b.disabled) return;
      const c = CARS[+b.dataset.pdf], label = b.textContent;
      b.disabled = true; b.textContent = "…"; toast("Menyediakan brochure…");
      try {
        const f = await stampBrochure(c);
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          try { await navigator.share({ files: [f], title: f.name, text: brosurMsg(c, false) }); } catch {}
        } else saveBlob(f, f.name);
      } catch (e) { toast("Gagal: " + e.message); }
      b.disabled = false; b.textContent = label;
    });
  }

  // ---------- GAJI ----------
  function gaji() {
    const pref = loanPref(), last = store.get("sa_gaji", 5000);
    view.innerHTML = `
      <h2>Ikut gaji</h2><p class="sub">Masukkan gaji kasar sebulan, dapat senarai kereta yang sesuai.</p>
      <div class="card">
        <label>Gaji kasar sebulan (RM)</label><input id="sal" type="number" inputmode="numeric" value="${last}">
        <div class="row">
          <div><label>Deposit (%)</label><input id="dep" type="number" value="${pref.dep}"></div>
          <div><label>Kadar (%)</label><input id="rate" type="number" step="0.01" value="${pref.rate}"></div>
        </div>
      </div>
      <div class="list" id="out"></div>
      <p class="note">Panduan: <span class="tag ok">Selesa</span> ansuran ≤20% gaji, <span class="tag mid">Sederhana</span> ≤25%, <span class="tag max">Maksimum</span> ≤30%. Tempoh ${pref.years} tahun. Kelulusan sebenar ikut bank (DSR & komitmen lain).</p>`;
    const run = () => {
      const sal = +$("#sal").value || 0, dep = +$("#dep").value || 0, rate = +$("#rate").value || 0;
      store.set("sa_gaji", sal);
      const list = GRADES.map((g, i) => ({ g, i, m: monthly(g.price, dep, rate, pref.years) }))
        .map(x => ({ ...x, r: sal ? x.m / sal : 9 })).filter(x => x.r <= 0.30).sort((a, b) => b.g.price - a.g.price);
      $("#out").innerHTML = list.length ? list.map(x => {
        const t = x.r <= .20 ? ["ok", "Selesa"] : x.r <= .25 ? ["mid", "Sederhana"] : ["max", "Maksimum"];
        return `<a class="car" href="#loan" data-g="${x.i}" style="text-decoration:none"><img src="${x.g.car.img}" alt=""><div class="t"><b>${x.g.name}</b><small>${RM(x.g.price)} · ${Math.round(x.r * 100)}% gaji</small></div><div style="text-align:right"><div class="p">${RM(x.m)}</div><span class="tag ${t[0]}">${t[1]}</span></div></a>`;
      }).join("") : `<div class="card">Tiada model dalam had 30% gaji. Cuba tambah deposit.</div>`;
      $("#out").querySelectorAll("[data-g]").forEach(a => a.onclick = () => { store.set("sa_sel", [+a.dataset.g, 0]); store.set("sa_loan", { ...pref, dep, rate }); loanMode = "satu"; });
    };
    view.querySelectorAll("input").forEach(e => e.oninput = run); run();
  }

  // ---------- AKAUN ----------
  function akaun() {
    const p = profile();
    view.innerHTML = `
      <h2>Akaun</h2><p class="sub">Nama & nombor ini masuk dalam poster dan mesej WhatsApp.</p>
      <div class="card">
        <label>Nama</label><input id="n" value="${esc(p.name)}" placeholder="cth. Wan">
        <label>Nombor telefon</label><input id="ph" inputmode="tel" value="${esc(p.phone)}" placeholder="cth. 012-345 6789">
        <label>Cawangan (pilihan)</label><input id="br" value="${esc(p.branch)}" placeholder="cth. Toyota Shah Alam">
        <div style="margin-top:16px"><button class="btn red block" id="sv">Simpan</button></div>
      </div>
      <p class="note">Data disimpan dalam pelayar telefon ini sahaja, tidak dihantar ke mana-mana pelayan.</p>`;
    $("#sv").onclick = () => { store.set("sa_profile", { name: $("#n").value.trim(), phone: $("#ph").value.trim(), branch: $("#br").value.trim() }); toast("Profil disimpan"); };
  }

  // ---------- router ----------
  function route() {
    const [tab, sub] = (location.hash.slice(1) || "home").split("/");
    const map = { home, loan: () => loan(sub), brosur, gaji, akaun };
    if (tab === "loan") loanMode = sub === "banding" ? "banding" : "satu";
    (map[tab] || home)();
    document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("on", a.dataset.tab === (map[tab] ? tab : "home")));
    window.scrollTo(0, 0);
  }
  addEventListener("hashchange", route);
  route();
})();
