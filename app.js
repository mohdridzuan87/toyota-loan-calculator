(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const view = $("#view");
  const CARS = window.CARS;
  const GRADES = CARS.flatMap(c => c.grades.map(([name, fuel, price]) => ({ car: c, name, fuel, price })));
  const RM = n => "RM" + Math.round(n).toLocaleString("en-MY");

  // ---------- storage (selamat jika disekat) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  // ---------- bahasa / language ----------
  let lang = store.get("sa_lang", "ms") === "en" ? "en" : "ms";
  const I18N = {
    ms: {
      nav: ["Home", "Loan", "Brochure", "Gaji", "Akaun"],
      foot: "*Harga boleh berubah bila-bila masa dari tarikh poster ini dikongsi. Harga berdasarkan untuk Semenanjung Malaysia sahaja. Anggaran ansuran, tertakluk pada terma dan syarat bank.",
      footSrc: "Harga OTR termasuk SST, tanpa insurans, individu persendirian · sumber: toyota.com.my",
      needProfile: "Isi nama & nombor di tab Akaun dulu",
      new: "BARU", models: n => `${n} MODEL TOYOTA RASMI`,
      heroH: name => `Hantar info rasmi, <em>siap nama & nombor ${name}</em>`, you: "awak",
      heroP: "Customer minta brochure? Hantar terus ke WhatsApp.", openBroch: "Buka Brochure",
      tLoan: ["Loan poster", "Percuma · tanpa had"], tCmp: ["Banding varian", "1 poster, 2-4 loan"],
      tSal: ["Ikut gaji", "Gaji → senarai kereta"], tBro: ["Brochure", "Hantar ke WhatsApp"],
      tProf: ["Lengkapkan profil", "Nama & nombor akan masuk dalam poster"],
      loanH: "Loan poster", loanSub: "Kira ansuran & jana poster siap nama awak.",
      one: "1 varian", cmp: n => `Banding ${n}`, variant: "Varian",
      deposit: "Deposit", byMonthly: "Ikut bulanan", rate: "Kadar (% setahun)", tenure: "Tempoh", yrs: n => `${n} tahun`,
      insH: "Insurans (anggaran)", insIn: "Masuk dalam loan", rebH: "Rebate / promo", rebChk: "Tolak rebate dari harga",
      dl: "Muat turun PNG", share: "Kongsi",
      phDepRM: "Deposit (RM)", phTarget: "Ansuran sasaran sebulan (RM)", phDepPct: "Deposit (%)",
      targetNote: "Masukkan bulanan yang customer mahu, app kira deposit yang perlu.",
      rebLabel: n => `Rebate ${n} (RM)`,
      rebNote: m => `Lalai dari laman promo Toyota MY (${m}, "promo worth up to"; mungkin termasuk baucar). Ubah ikut rebate tunai sebenar dari cawangan.`,
      depNeeded: "deposit diperlukan", noDep: m => `Tanpa deposit pun ansuran cuma ${m} sebulan.`, tooLow: "Sasaran terlalu rendah untuk varian ini.",
      perMonth: "/bulan", otr: "Harga OTR", rebate: "Rebate", afterReb: "Harga selepas rebate",
      insEst: n => `Insurans anggaran (NCD ${n}%)`, inLoan: " · dalam loan", loanAmt: "Jumlah loan",
      inst: (y, r) => `Ansuran ${y} tahun @ ${r}%`, upfront: "Bayaran awal (deposit + insurans)",
      diff: t => `Beza ${t ? "deposit" : "sebulan"}`, hiLo: " (tertinggi vs terendah)", lowest: t => `${t ? "Deposit" : "Ansuran"} terendah`,
      insNote: "Insurans: anggaran premium komprehensif (tarif Semenanjung, ikut cc & harga, termasuk SST 8% + duti setem RM10). Harga sebenar ikut syarikat insurans.",
      pCmp: n => `PERBANDINGAN LOAN · ${n} VARIAN`, pPkg: "PAKEJ LOAN TOYOTA", pFrom: "Ansuran bulanan dari", pMonthly: "Ansuran sebulan",
      pAfter: "Selepas rebate", pAfterS: "Lepas rebate", pIns: " + insurans", pInsS: " + ins.", pTenure: "Tempoh", pRate: "Kadar",
      pPerMonth: " /bulan", pDiff: m => `beza ${m} sebulan`, pDiff2: m => `Beza ${m} sebulan`, pName: "Nama awak",
      saved: "Fail dimuat turun", noShare: "Telefon tak sokong kongsi terus — fail dimuat turun",
      tapWA: "Tekan untuk WhatsApp",
      msgHi: (n, b) => `Hi! Saya ${n}, Sales Advisor Toyota${b ? " " + b : ""}.`,
      msgLink: (c, u) => `Ini e-brochure rasmi Toyota ${c}:\n${u}`, msgNoLink: c => `Ini e-brochure rasmi Toyota ${c}.`,
      msgPrice: "Harga OTR (Semenanjung, tanpa insurans):", msgChange: "*Harga boleh berubah bila-bila masa.",
      msgCta: ph => `Nak test drive atau kira loan? Boleh message saya: ${ph}`,
      broH: "Brochure rasmi", broSub: "<b>PDF</b>: e-brochure rasmi siap nama & nombor awak, kongsi terus ke WhatsApp. <b>Link</b>: hantar pautan + harga ke nombor customer.",
      custWA: "Nombor WhatsApp customer (untuk Link)", eg: "cth.", from: "dari",
      broNote: "E-brochure ialah salinan fail rasmi toyota.com.my; app hanya tambah jalur nama & nombor (boleh ditekan terus ke WhatsApp awak). Harga OTR Semenanjung, tanpa insurans.",
      preparing: "Menyediakan brochure…", failed: "Gagal: ",
      salH: "Ikut gaji", salSub: "Masukkan gaji kasar sebulan, dapat senarai kereta yang sesuai.", salIn: "Gaji kasar sebulan (RM)",
      depPct: "Deposit (%)", ratePct: "Kadar (%)", ofSal: "gaji", tags: ["Selesa", "Sederhana", "Maksimum"],
      salNote: y => `Panduan: <span class="tag ok">Selesa</span> ansuran ≤20% gaji, <span class="tag mid">Sederhana</span> ≤25%, <span class="tag max">Maksimum</span> ≤30%. Tempoh ${y} tahun. Kelulusan sebenar ikut bank (DSR & komitmen lain).`,
      salNone: "Tiada model dalam had 30% gaji. Cuba tambah deposit.",
      salReb: "Tolak rebate (auto dari laman promo Toyota MY)", salRebNote: m => `Rebate ikut laman promo Toyota MY (${m}, "promo worth up to"). Nilai yang diubah di tab Loan turut dipakai.`,
      afterRebS: "lepas rebate",
      accH: "Akaun", accSub: "Nama & nombor ini masuk dalam poster dan mesej WhatsApp.",
      name: "Nama", phone: "Nombor telefon", branch: "Cawangan (pilihan)", save: "Simpan",
      accNote: "Data disimpan dalam pelayar telefon ini sahaja, tidak dihantar ke mana-mana pelayan.", savedProf: "Profil disimpan",
      langLbl: "Bahasa"
    },
    en: {
      nav: ["Home", "Loan", "Brochure", "Salary", "Account"],
      foot: "*Prices may change at any time from the date this poster is shared. Prices are for Peninsular Malaysia only. Estimated instalment, subject to bank terms and conditions.",
      footSrc: "OTR price incl. SST, without insurance, individual private · source: toyota.com.my",
      needProfile: "Fill in your name & number in the Account tab first",
      new: "NEW", models: n => `${n} OFFICIAL TOYOTA MODELS`,
      heroH: name => `Send official info, <em>with ${name} name & number</em>`, you: "your",
      heroP: "Customer wants a brochure? Send it straight to WhatsApp.", openBroch: "Open Brochures",
      tLoan: ["Loan poster", "Free · unlimited"], tCmp: ["Compare variants", "1 poster, 2-4 loans"],
      tSal: ["By salary", "Salary → car list"], tBro: ["Brochure", "Send to WhatsApp"],
      tProf: ["Complete your profile", "Your name & number go on the poster"],
      loanH: "Loan poster", loanSub: "Calculate instalments & create a poster with your name.",
      one: "1 variant", cmp: n => `Compare ${n}`, variant: "Variant",
      deposit: "Down payment", byMonthly: "By monthly", rate: "Rate (% p.a.)", tenure: "Tenure", yrs: n => `${n} year${n > 1 ? "s" : ""}`,
      insH: "Insurance (estimate)", insIn: "Include in loan", rebH: "Rebate / promo", rebChk: "Deduct rebate from price",
      dl: "Download PNG", share: "Share",
      phDepRM: "Down payment (RM)", phTarget: "Target monthly instalment (RM)", phDepPct: "Down payment (%)",
      targetNote: "Enter the monthly amount the customer wants; the app works out the down payment needed.",
      rebLabel: n => `Rebate ${n} (RM)`,
      rebNote: m => `Default from Toyota MY promo page (${m}, "promo worth up to"; may include vouchers). Adjust to the actual cash rebate from your branch.`,
      depNeeded: "down payment needed", noDep: m => `Even with zero down payment the instalment is only ${m} a month.`, tooLow: "Target is too low for this variant.",
      perMonth: "/month", otr: "OTR price", rebate: "Rebate", afterReb: "Price after rebate",
      insEst: n => `Estimated insurance (NCD ${n}%)`, inLoan: " · in loan", loanAmt: "Loan amount",
      inst: (y, r) => `Instalment ${y} yr${y > 1 ? "s" : ""} @ ${r}%`, upfront: "Upfront (down payment + insurance)",
      diff: t => `Difference ${t ? "in down payment" : "per month"}`, hiLo: " (highest vs lowest)", lowest: t => `Lowest ${t ? "down payment" : "instalment"}`,
      insNote: "Insurance: estimated comprehensive premium (Peninsular tariff, by cc & price, incl. 8% SST + RM10 stamp duty). Actual price depends on the insurer.",
      pCmp: n => `LOAN COMPARISON · ${n} VARIANTS`, pPkg: "TOYOTA LOAN PACKAGE", pFrom: "Monthly instalment from", pMonthly: "Monthly instalment",
      pAfter: "After rebate", pAfterS: "After rebate", pIns: " + insurance", pInsS: " + ins.", pTenure: "Tenure", pRate: "Rate",
      pPerMonth: " /month", pDiff: m => `${m} difference per month`, pDiff2: m => `${m} difference per month`, pName: "Your name",
      saved: "File downloaded", noShare: "This phone can't share directly — file downloaded",
      tapWA: "Tap to WhatsApp",
      msgHi: (n, b) => `Hi! I'm ${n}, Toyota Sales Advisor${b ? " " + b : ""}.`,
      msgLink: (c, u) => `Here is the official Toyota ${c} e-brochure:\n${u}`, msgNoLink: c => `Here is the official Toyota ${c} e-brochure.`,
      msgPrice: "OTR price (Peninsular, without insurance):", msgChange: "*Prices may change at any time.",
      msgCta: ph => `Keen on a test drive or a loan calculation? Message me: ${ph}`,
      broH: "Official brochures", broSub: "<b>PDF</b>: official e-brochure with your name & number, share straight to WhatsApp. <b>Link</b>: send the link + prices to the customer's number.",
      custWA: "Customer's WhatsApp number (for Link)", eg: "e.g.", from: "from",
      broNote: "E-brochures are copies of the official toyota.com.my files; the app only adds a name & number strip (tap to WhatsApp you). OTR prices for Peninsular, without insurance.",
      preparing: "Preparing brochure…", failed: "Failed: ",
      salH: "By salary", salSub: "Enter gross monthly salary to get a list of suitable cars.", salIn: "Gross monthly salary (RM)",
      depPct: "Down payment (%)", ratePct: "Rate (%)", ofSal: "of salary", tags: ["Comfortable", "Moderate", "Maximum"],
      salNote: y => `Guide: <span class="tag ok">Comfortable</span> instalment ≤20% of salary, <span class="tag mid">Moderate</span> ≤25%, <span class="tag max">Maximum</span> ≤30%. Tenure ${y} years. Actual approval depends on the bank (DSR & other commitments).`,
      salNone: "No model within 30% of salary. Try a higher down payment.",
      salReb: "Deduct rebate (auto from Toyota MY promo page)", salRebNote: m => `Rebates from the Toyota MY promo page (${m}, "promo worth up to"). Amounts edited in the Loan tab are used too.`,
      afterRebS: "after rebate",
      accH: "Account", accSub: "This name & number appear on posters and WhatsApp messages.",
      name: "Name", phone: "Phone number", branch: "Branch (optional)", save: "Save",
      accNote: "Data is stored in this phone's browser only and never sent to any server.", savedProf: "Profile saved",
      langLbl: "Language"
    }
  };
  const t = (k, ...a) => { const v = I18N[lang][k] ?? I18N.ms[k]; return typeof v === "function" ? v(...a) : v; };
  const setLang = l => { lang = l; store.set("sa_lang", l); applyChrome(); route(); };
  function applyChrome() {
    document.documentElement.lang = lang === "en" ? "en" : "ms";
    document.querySelectorAll(".tabs a span").forEach((s, i) => s.textContent = t("nav")[i]);
    const b = $("#lang"); if (b) { b.textContent = lang === "en" ? "BM" : "EN"; b.title = t("langLbl"); }
  }

  const profile = () => store.get("sa_profile", { name: "", phone: "", branch: "" });
  // sa_loan2: kadar lalai 2.3% (Wan, 22 Nov 2026)
  const loanPref = () => ({ mode: "pct", dep: 10, depRM: 10000, target: 1000, rate: 2.3, years: 9, ncd: 0, insIn: false, reb: false, ...store.get("sa_loan2", {}) });

  // Anggaran insurans komprehensif (tarif Semenanjung, kereta persendirian):
  // premium asas ikut cc untuk RM1,000 pertama + RM26 setiap RM1,000 seterusnya, tolak NCD, + SST 8% + duti setem RM10.
  const CC = { "1.5": 1496, "1.8": 1798, "2.0": 1987, "2.4": 2393, "2.5": 2487, "2.7": 2694, "2.8": 2755, "3.0": 2982 };
  const ccOf = g => { const m = g.name.match(/(\d\.\d)/); return (m && CC[m[1]]) || g.car.cc || 1496; };
  const BASE = [[1400, 273.8], [1650, 305.5], [2200, 339.1], [3050, 372.6], [4100, 404.3], [4250, 436], [4400, 469.6], [Infinity, 501.3]];
  const NCDS = [0, 25, 30, 38.33, 45, 55];
  const insurance = (g, ncd) => {
    const cc = ccOf(g), base = BASE.find(b => cc <= b[0])[1];
    const gross = base + 26 * Math.max(0, Math.ceil(g.price / 1000) - 1);
    const net = gross * (1 - ncd / 100);
    return { cc, gross, net, total: net * 1.08 + 10 };
  };
  const pct1 = n => (Math.round(n * 10) / 10).toString();
  const REB = window.REBATES || { byGrade: {} };
  const rebateOf = g => { const o = store.get("sa_reb", {}); return o[g.name] ?? REB.byGrade[g.name] ?? 0; };
  // Kira satu varian ikut tetapan v (rebate tolak dari harga; insurans ikut harga OTR penuh)
  const calc = (g, v) => {
    const r = v.rate / 100, n = v.years, ins = insurance(g, v.ncd), insFin = v.insIn ? ins.total : 0;
    const reb = v.reb ? Math.min(rebateOf(g), g.price) : 0, net = g.price - reb;
    let dep;
    if (v.mode === "rm") dep = Math.min(Math.max(0, v.depRM), net);
    else if (v.mode === "target") dep = Math.min(net, Math.max(0, net + insFin - (v.target * 12 * n) / (1 + r * n)));
    else dep = net * v.dep / 100;
    const fin = Math.max(0, net + insFin - dep);
    return { g, ins, insFin, reb, net, dep, depPct: net ? dep / net * 100 : 0, fin, m: fin * (1 + r * n) / (12 * n) };
  };

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const toast = msg => { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 2200); };
  const waNum = p => { let d = (p || "").replace(/\D/g, ""); if (d.startsWith("0")) d = "6" + d; return d; };
  const monthly = (price, depPct, rate, years) => {
    const fin = price * (1 - depPct / 100);
    return (fin + fin * (rate / 100) * years) / (years * 12);
  };
  // Senarai varian disusun A-Z (nilai kekal indeks GRADES)
  const GRADE_AZ = GRADES.map((g, i) => i).sort((a, b) => GRADES[a].name.localeCompare(GRADES[b].name, "en", { numeric: true, sensitivity: "base" }));
  const gradeOptions = sel => GRADE_AZ.map(i => `<option value="${i}" ${i === sel ? "selected" : ""}>${GRADES[i].name} · ${RM(GRADES[i].price)}</option>`).join("");
  const needProfile = () => { const p = profile(); if (!p.name || !p.phone) { toast(t("needProfile")); return false; } return true; };

  // ---------- HOME ----------
  function home() {
    const p = profile();
    const tile = (href, ic, [b, s]) => `<a class="tile" href="${href}"><div class="ic">${ic}</div><b>${b}</b><small>${s}</small></a>`;
    view.innerHTML = `
      <section class="hero">
        <div class="strip">${CARS.slice(0, 8).map(c => `<img src="${c.img}" alt="${c.name}">`).join("")}</div>
        <span class="badge">${t("new")}</span><small>${t("models", CARS.length)}</small>
        <h3>${t("heroH", p.name ? esc(p.name.split(" ")[0]) + (lang === "en" ? "'s" : "") : t("you"))}</h3>
        <p>${t("heroP")}</p>
        <a class="btn white" href="#brosur">${t("openBroch")}</a>
      </section>
      <div class="grid">
        ${tile("#loan", "🧾", t("tLoan"))}${tile("#loan/banding", "⚖️", t("tCmp"))}${tile("#gaji", "💼", t("tSal"))}${tile("#brosur", "📄", t("tBro"))}
        <a class="tile wide" href="#akaun"><div class="ic">👤</div><div><b>${esc(p.name) || t("tProf")[0]}</b><small>${esc(p.phone) || t("tProf")[1]}</small></div></a>
      </div>`;
  }

  // ---------- LOAN ----------
  // Bilangan varian dalam poster: 1 (pakej) atau 2/3/4 (banding)
  let loanN = 1;
  const loanHash = n => n === 1 ? "#loan" : n === 2 ? "#loan/banding" : `#loan/banding${n}`;
  function loan() {
    const pref = loanPref();
    const sel = store.get("sa_sel", []).slice(0, 4);
    for (const d of [1, 2, 4, 6, 9, 12, 15, 20]) if (sel.length < 4 && !sel.includes(d)) sel.push(d);
    view.innerHTML = `
      <h2>${t("loanH")}</h2><p class="sub">${t("loanSub")}</p>
      <div class="seg">${[1, 2, 3, 4].map(n => `<button data-n="${n}" class="${loanN === n ? "on" : ""}">${n === 1 ? t("one") : t("cmp", n)}</button>`).join("")}</div>
      <div class="card">
        ${Array.from({ length: loanN }, (_, k) => `<label>${t("variant")} ${loanN > 1 ? "ABCD"[k] : ""}</label><select class="gsel" data-k="${k}">${gradeOptions(sel[k])}</select>`).join("")}
        <label>${t("deposit")}</label>
        <div class="seg" id="dm" style="margin-bottom:8px">
          <button data-d="pct" class="${pref.mode === "pct" ? "on" : ""}">%</button>
          <button data-d="rm" class="${pref.mode === "rm" ? "on" : ""}">RM</button>
          <button data-d="target" class="${pref.mode === "target" ? "on" : ""}">${t("byMonthly")}</button>
        </div>
        <div id="depBox"></div>
        <div class="row">
          <div><label>${t("rate")}</label><input id="rate" type="number" min="0" max="10" step="0.01" value="${pref.rate}"></div>
          <div><label>${t("tenure")}</label><select id="yrs">${[9, 8, 7, 6, 5, 4, 3, 2, 1].map(y => `<option ${y == pref.years ? "selected" : ""} value="${y}">${t("yrs", y)}</option>`).join("")}</select></div>
        </div>
        <label>${t("insH")}</label>
        <div class="row">
          <select id="ncd">${NCDS.map(n => `<option value="${n}" ${n == pref.ncd ? "selected" : ""}>NCD ${n}%</option>`).join("")}</select>
          <label class="chk"><input type="checkbox" id="insIn" ${pref.insIn ? "checked" : ""}> ${t("insIn")}</label>
        </div>
        <label>${t("rebH")}</label>
        <label class="chk" style="padding:12px"><input type="checkbox" id="reb" ${pref.reb ? "checked" : ""}> ${t("rebChk")}</label>
        <div id="rebBox"></div>
      </div>
      <div class="card result" id="res"></div>
      <div class="card">
        <canvas id="cv" width="1080" height="1350"></canvas>
        <div class="actions"><button class="btn red" id="dl">${t("dl")}</button><button class="btn wa" id="share">${t("share")}</button></div>
        <p class="note">${t("foot")}</p>
      </div>`;
    view.querySelectorAll(".seg button[data-n]").forEach(b => b.onclick = () => { location.hash = loanHash(+b.dataset.n); });
    let v = pref;
    const depInput = () => {
      const box = $("#depBox");
      if (v.mode === "rm") box.innerHTML = `<input id="depv" type="number" inputmode="numeric" min="0" step="500" value="${v.depRM}" placeholder="${t("phDepRM")}">`;
      else if (v.mode === "target") box.innerHTML = `<input id="depv" type="number" inputmode="numeric" min="100" step="50" value="${v.target}" placeholder="${t("phTarget")}"><p class="note" style="margin:6px 0 0">${t("targetNote")}</p>`;
      else box.innerHTML = `<input id="depv" type="number" inputmode="decimal" min="0" max="90" step="1" value="${v.dep}" placeholder="${t("phDepPct")}">`;
      $("#depv").oninput = update;
    };
    const rebInputs = picks => {
      const box = $("#rebBox");
      if (!v.reb) { box.innerHTML = ""; box.dataset.key = ""; return; }
      const key = picks.join(",");
      if (box.dataset.key !== key) {
        box.dataset.key = key;
        box.innerHTML = [...new Set(picks)].map(i => `<label>${t("rebLabel", esc(GRADES[i].name))}</label><input class="rebv" data-g="${i}" type="number" inputmode="numeric" min="0" step="500" value="${rebateOf(GRADES[i])}">`).join("") +
          `<p class="note" style="margin:6px 0 0">${t("rebNote", REB.month || "")}</p>`;
        box.querySelectorAll(".rebv").forEach(inp => inp.oninput = () => {
          const o = store.get("sa_reb", {}); o[GRADES[+inp.dataset.g].name] = Math.max(0, +inp.value || 0); store.set("sa_reb", o); update();
        });
      }
    };
    const update = () => {
      const dv = +$("#depv").value || 0;
      v = { ...v, rate: +$("#rate").value || 0, years: +$("#yrs").value, ncd: +$("#ncd").value, insIn: $("#insIn").checked, reb: $("#reb").checked };
      if (v.mode === "rm") v.depRM = dv; else if (v.mode === "target") v.target = dv; else v.dep = dv;
      store.set("sa_loan2", v);
      const picks = [...view.querySelectorAll(".gsel")].map(s => +s.value);
      store.set("sa_sel", sel.map((x, k) => picks[k] ?? x));
      rebInputs(picks);
      const rows = picks.map(i => calc(GRADES[i], v));
      const tg = v.mode === "target", sm = `<small style="font-size:14px;font-weight:600">`;
      $("#res").innerHTML = rows.map(r => {
        const head = tg
          ? `<div class="k">${esc(r.g.name)} · ${t("depNeeded")}</div><div class="v">${RM(r.dep)}${sm} (${pct1(r.depPct)}%)</small></div>
             ${r.dep === 0 && r.m < v.target ? `<p class="note" style="margin:2px 0 6px">${t("noDep", RM(r.m))}</p>` : ""}
             ${r.dep >= r.net && r.net > 0 ? `<p class="note" style="margin:2px 0 6px">${t("tooLow")}</p>` : ""}`
          : `<div class="k">${esc(r.g.name)}</div><div class="v">${RM(r.m)}${sm} ${t("perMonth")}</small></div>`;
        return `<div class="res">${head}
          <div class="kv"><span>${t("otr")}</span><span>${RM(r.g.price)}</span></div>
          ${r.reb ? `<div class="kv"><span>${t("rebate")}</span><span>-${RM(r.reb)}</span></div><div class="kv"><span>${t("afterReb")}</span><b>${RM(r.net)}</b></div>` : ""}
          <div class="kv"><span>${t("insEst", v.ncd)}${v.insIn ? t("inLoan") : ""}</span><span>${RM(r.ins.total)}</span></div>
          <div class="kv"><span>${t("deposit")} ${pct1(r.depPct)}%</span><span>${RM(r.dep)}</span></div>
          <div class="kv"><span>${t("loanAmt")}</span><span>${RM(r.fin)}</span></div>
          <div class="kv"><span>${t("inst", v.years, v.rate)}</span><b>${RM(r.m)}${t("perMonth")}</b></div>
          ${v.insIn ? "" : `<div class="kv"><span>${t("upfront")}</span><span>${RM(r.dep + r.ins.total)}</span></div>`}</div>`;
      }).join("") +
        (rows.length > 1 ? (() => {
          const vals = rows.map(r => tg ? r.dep : r.m), lo = rows[vals.indexOf(Math.min(...vals))];
          return `<div class="kv"><span>${t("diff", tg)}${rows.length > 2 ? t("hiLo") : ""}</span><b>${RM(Math.max(...vals) - Math.min(...vals))}</b></div>` +
            (rows.length > 2 ? `<div class="kv"><span>${t("lowest", tg)}</span><span>${esc(lo.g.name)}</span></div>` : "");
        })() : "") +
        `<p class="note" style="margin:0">${t("insNote")}</p>`;
      drawPoster(rows, v);
    };
    $("#dm").querySelectorAll("button").forEach(b => b.onclick = () => {
      v.mode = b.dataset.d; $("#dm").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
      depInput(); update();
    });
    depInput();
    view.querySelectorAll(".card select, #rate, #insIn, #reb").forEach(e => e.oninput = update);
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
    for (const w of words) { const tt = line ? line + " " + w : w; if (ctx.measureText(tt).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = tt; }
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
    ctx.textAlign = "center"; ctx.fillStyle = "#f5c542"; F(800, 34); ctx.fillText(rows.length > 1 ? t("pCmp", rows.length) : t("pPkg"), W / 2, rows.length > 2 ? 88 : 96);
    const priceLbl = (r, short) => (r.reb ? t(short ? "pAfterS" : "pAfter") : (short && rows.length > 2 ? "OTR" : t("otr"))) + (r.insFin ? t(short ? "pInsS" : "pIns") : "") + (rows.length > 2 ? "" : "*");

    if (rows.length === 1) {
      const r = rows[0];
      ctx.fillStyle = "#fff"; fit(ctx, r.g.name.toUpperCase(), 960, 64); ctx.fillText(r.g.name.toUpperCase(), W / 2, 176);
      rr(ctx, 60, 214, 960, 500, 32); ctx.save(); ctx.clip(); ctx.fillStyle = "#fff"; ctx.fill(); cover(ctx, imgs[0], 60, 214, 960, 500); ctx.restore();
      ctx.fillStyle = "#fff"; F(600, 34); ctx.fillText(t("pFrom"), W / 2, 772);
      ctx.fillStyle = "#f5c542"; F(800, 124); ctx.fillText(RM(r.m), W / 2, 884);
      const items = [[priceLbl(r, false), RM(r.net + r.insFin)], [`${t("deposit")} ${pct1(r.depPct)}%`, RM(r.dep)], [t("pTenure"), t("yrs", v.years)], [t("pRate"), `${v.rate}%`]];
      items.forEach(([k, val], i) => {
        const x = 60 + (i % 2) * 490, y = 920 + Math.floor(i / 2) * 102;
        rr(ctx, x, y, 470, 90, 20); ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fill();
        ctx.textAlign = "left"; ctx.fillStyle = "#b9c6e4"; fit(ctx, k, 420, 24, 600); ctx.fillText(k, x + 26, y + 36);
        ctx.fillStyle = "#fff"; F(800, 34); ctx.fillText(val, x + 26, y + 76);
      });
    } else if (rows.length > 2) {
      // 3-4 varian: kad baris (gambar kiri, angka kanan); kad ansuran terendah diserlahkan
      const top = 130, area = 900, gap = 18, n = rows.length, ch = (area - gap * (n - 1)) / n;
      const lo = Math.min(...rows.map(r => r.m));
      rows.forEach((r, i) => {
        const y = top + i * (ch + gap), x = 60, w = 960, iw = Math.min(380, ch * 1.6);
        rr(ctx, x, y, w, ch, 24); ctx.fillStyle = r.m === lo ? "rgba(245,197,66,.16)" : "rgba(255,255,255,.08)"; ctx.fill();
        rr(ctx, x + 12, y + 12, iw, ch - 24, 16); ctx.save(); ctx.clip(); ctx.fillStyle = "#fff"; ctx.fill(); cover(ctx, imgs[i], x + 12, y + 12, iw, ch - 24); ctx.restore();
        const tx = x + iw + 36, tw = w - iw - 60, s = ch / 280, sz = k => Math.round(k);
        ctx.textAlign = "left"; ctx.fillStyle = "#fff"; fit(ctx, r.g.name, tw, sz(36 * Math.min(1, s + .1))); ctx.fillText(r.g.name, tx, y + ch * 0.25);
        const mm = RM(r.m) + t("pPerMonth");
        ctx.fillStyle = "#f5c542"; fit(ctx, mm, tw, sz(68 * Math.min(1, s + .15))); ctx.fillText(mm, tx, y + ch * 0.56);
        ctx.fillStyle = "#b9c6e4";
        const l1 = `${priceLbl(r, true)} ${RM(r.net + r.insFin)}`, l2 = `${t("deposit")} ${RM(r.dep)} (${pct1(r.depPct)}%) · Loan ${RM(r.fin)}`;
        fit(ctx, l2, tw, sz(24 * Math.min(1, s + .2)), 600); ctx.fillText(l1, tx, y + ch * 0.75);
        ctx.fillText(l2, tx, y + ch * 0.75 + sz(30 * Math.min(1, s + .2)));
      });
      const ms = rows.map(r => r.m);
      ctx.textAlign = "center"; ctx.fillStyle = "#fff"; F(700, 30);
      ctx.fillText(`${t("yrs", v.years)} · ${v.rate}% · ${t("pDiff", RM(Math.max(...ms) - Math.min(...ms)))}`, W / 2, 1076);
    } else {
      rows.forEach((r, i) => {
        const x = 60 + i * 490, w = 470;
        rr(ctx, x, 140, w, 860, 28); ctx.fillStyle = "rgba(255,255,255,.08)"; ctx.fill();
        rr(ctx, x + 16, 156, w - 32, 300, 20); ctx.save(); ctx.clip(); ctx.fillStyle = "#fff"; ctx.fill(); cover(ctx, imgs[i], x + 16, 156, w - 32, 300); ctx.restore();
        ctx.textAlign = "center"; ctx.fillStyle = "#fff"; F(800, 34);
        wrap(ctx, r.g.name, x + w / 2, 512, w - 40, 42);
        ctx.fillStyle = "#b9c6e4"; F(600, 26); ctx.fillText(t("pMonthly"), x + w / 2, 640);
        ctx.fillStyle = "#f5c542"; fit(ctx, RM(r.m), w - 40, 80); ctx.fillText(RM(r.m), x + w / 2, 726);
        [[priceLbl(r, true), RM(r.net + r.insFin)], [`${t("deposit")} ${pct1(r.depPct)}%`, RM(r.dep)], ["Loan", RM(r.fin)]].forEach(([k, val], j) => {
          const y = 800 + j * 60; ctx.textAlign = "left"; ctx.fillStyle = "#b9c6e4"; fit(ctx, k, 250, 24, 600); ctx.fillText(k, x + 30, y);
          ctx.textAlign = "right"; ctx.fillStyle = "#fff"; F(800, 26); ctx.fillText(val, x + w - 30, y);
        });
      });
      ctx.textAlign = "center"; ctx.fillStyle = "#fff"; F(700, 34);
      ctx.fillText(`${t("pDiff2", RM(Math.abs(rows[0].m - rows[1].m)))} · ${t("yrs", v.years)} · ${v.rate}%`, W / 2, 1070);
    }
    // jalur SA
    ctx.fillStyle = "#eb0a1e"; ctx.fillRect(0, 1180, W, 120);
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; F(800, 40); ctx.fillText(p.name || t("pName"), 60, 1232);
    F(600, 26); ctx.fillText(`Sales Advisor Toyota${p.branch ? " · " + p.branch : ""}`, 60, 1272);
    ctx.textAlign = "right"; F(800, 42); ctx.fillText(p.phone || "01x-xxx xxxx", W - 60, 1250);
    ctx.textAlign = "center"; ctx.fillStyle = "#b9c6e4"; F(500, 17);
    wrap(ctx, t("foot"), W / 2, rows.length === 1 ? 1140 : 1122, 960, 22);
    ctx.fillStyle = "#0b1b3a"; ctx.fillRect(0, 1300, W, 50); ctx.fillStyle = "#b9c6e4"; F(500, 18);
    ctx.fillText(t("footSrc"), W / 2, 1332);
  }

  function saveBlob(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); toast(t("saved")); }
  async function shareBlob(blob, name) {
    const file = new File([blob], name, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); } catch {} }
    else { saveBlob(blob, name); toast(t("noShare")); }
  }

  // ---------- BROCHURE ----------
  const BROCH = window.BROCHURES || {};
  let pdfLibP;
  const loadPdfLib = () => pdfLibP || (pdfLibP = new Promise((res, rej) => {
    if (window.PDFLib) return res(window.PDFLib);
    const s = document.createElement("script"); s.src = "vendor/pdf-lib.min.js";
    s.onload = () => res(window.PDFLib); s.onerror = () => { pdfLibP = null; rej(new Error("pdf-lib")); };
    document.head.appendChild(s);
  }));
  // Helvetica hanya sokong aksara Latin (WinAnsi)
  const latin = s => String(s || "").replace(/[^\x20-\x7E -ÿ]/g, "").trim();

  async function stampBrochure(car) {
    const p = profile(), [file] = BROCH[car.id];
    const [L, bytes] = await Promise.all([loadPdfLib(), fetch("brochures/" + file).then(r => { if (!r.ok) throw new Error("PDF"); return r.arrayBuffer(); })]);
    const { PDFDocument, StandardFonts, rgb, PDFString } = L;
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
        const tip = t("tapWA");
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
    return `${t("msgHi", p.name, p.branch)}\n\n` +
      (withLink ? t("msgLink", c.name, BROCH[c.id] ? BROCH[c.id][1] : c.url) : t("msgNoLink", c.name)) +
      `\n\n${t("msgPrice")}\n${harga}\n\n${t("msgChange")}\n${t("msgCta", p.phone)}`;
  }

  function brosur() {
    view.innerHTML = `
      <h2>${t("broH")}</h2><p class="sub">${t("broSub")}</p>
      <div class="card"><label>${t("custWA")}</label><input id="cust" inputmode="tel" placeholder="${t("eg")} 0123456789"></div>
      <div class="list">${CARS.map((c, i) => `
        <div class="car"><img src="${c.img}" alt="${esc(c.name)}"><div class="t"><b>${esc(c.name)}</b><small>${c.type} · ${t("from")} ${RM(Math.min(...c.grades.map(g => g[2])))}</small></div>
        <div style="display:grid;gap:6px">${BROCH[c.id] ? `<button class="btn red" data-pdf="${i}" style="padding:8px 12px">PDF</button>` : ""}<button class="btn wa" data-i="${i}" style="padding:8px 12px">Link</button></div></div>`).join("")}</div>
      <p class="note">${t("broNote")}</p>`;
    view.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
      if (!needProfile()) return;
      const c = CARS[+b.dataset.i];
      window.open(`https://wa.me/${waNum($("#cust").value)}?text=${encodeURIComponent(brosurMsg(c, true))}`, "_blank");
    });
    view.querySelectorAll("[data-pdf]").forEach(b => b.onclick = async () => {
      if (!needProfile() || b.disabled) return;
      const c = CARS[+b.dataset.pdf], label = b.textContent;
      b.disabled = true; b.textContent = "…"; toast(t("preparing"));
      try {
        const f = await stampBrochure(c);
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          try { await navigator.share({ files: [f], title: f.name, text: brosurMsg(c, false) }); } catch {}
        } else saveBlob(f, f.name);
      } catch (e) { toast(t("failed") + e.message); }
      b.disabled = false; b.textContent = label;
    });
  }

  // ---------- GAJI / SALARY ----------
  function gaji() {
    const pref = loanPref(), last = store.get("sa_gaji", 5000);
    view.innerHTML = `
      <h2>${t("salH")}</h2><p class="sub">${t("salSub")}</p>
      <div class="card">
        <label>${t("salIn")}</label><input id="sal" type="number" inputmode="numeric" value="${last}">
        <div class="row">
          <div><label>${t("depPct")}</label><input id="dep" type="number" value="${pref.dep}"></div>
          <div><label>${t("ratePct")}</label><input id="rate" type="number" step="0.01" value="${pref.rate}"></div>
        </div>
        <label class="chk" style="padding:12px;margin-top:12px"><input type="checkbox" id="sreb" ${store.get("sa_gaji_reb", true) ? "checked" : ""}> ${t("salReb")}</label>
      </div>
      <div class="list" id="out"></div>
      <p class="note">${t("salNote", pref.years)}</p>
      <p class="note">${t("salRebNote", REB.month || "")}</p>`;
    const run = () => {
      const sal = +$("#sal").value || 0, dep = +$("#dep").value || 0, rate = +$("#rate").value || 0, useReb = $("#sreb").checked;
      store.set("sa_gaji", sal); store.set("sa_gaji_reb", useReb);
      // Rebate auto: nilai laman promo Toyota MY (atau nilai yang diubah di tab Loan)
      const list = GRADES.map((g, i) => { const reb = useReb ? Math.min(rebateOf(g), g.price) : 0, net = g.price - reb; return { g, i, reb, net, m: monthly(net, dep, rate, pref.years) }; })
        .map(x => ({ ...x, r: sal ? x.m / sal : 9 })).filter(x => x.r <= 0.30).sort((a, b) => b.net - a.net);
      const tags = t("tags");
      $("#out").innerHTML = list.length ? list.map(x => {
        const tg = x.r <= .20 ? ["ok", tags[0]] : x.r <= .25 ? ["mid", tags[1]] : ["max", tags[2]];
        const price = x.reb ? `<s>${RM(x.g.price)}</s> ${RM(x.net)} ${t("afterRebS")}` : RM(x.g.price);
        return `<a class="car" href="#loan" data-g="${x.i}" style="text-decoration:none"><img src="${x.g.car.img}" alt=""><div class="t"><b>${x.g.name}</b><small>${price} · ${Math.round(x.r * 100)}% ${t("ofSal")}</small>${x.reb ? `<small style="display:block;color:var(--green);font-weight:700">Rebate -${RM(x.reb)}</small>` : ""}</div><div style="text-align:right"><div class="p">${RM(x.m)}</div><span class="tag ${tg[0]}">${tg[1]}</span></div></a>`;
      }).join("") : `<div class="card">${t("salNone")}</div>`;
      $("#out").querySelectorAll("[data-g]").forEach(a => a.onclick = () => { store.set("sa_sel", [+a.dataset.g, ...store.get("sa_sel", []).slice(1)]); store.set("sa_loan2", { ...pref, mode: "pct", dep, rate, reb: useReb }); });
    };
    view.querySelectorAll("input").forEach(e => e.oninput = run); run();
  }

  // ---------- AKAUN / ACCOUNT ----------
  function akaun() {
    const p = profile();
    view.innerHTML = `
      <h2>${t("accH")}</h2><p class="sub">${t("accSub")}</p>
      <div class="card">
        <label>${t("langLbl")}</label>
        <div class="seg" id="lsel" style="margin-bottom:4px"><button data-l="ms" class="${lang === "ms" ? "on" : ""}">Bahasa Melayu</button><button data-l="en" class="${lang === "en" ? "on" : ""}">English</button></div>
        <label>${t("name")}</label><input id="n" value="${esc(p.name)}" placeholder="${t("eg")} Wan">
        <label>${t("phone")}</label><input id="ph" inputmode="tel" value="${esc(p.phone)}" placeholder="${t("eg")} 012-345 6789">
        <label>${t("branch")}</label><input id="br" value="${esc(p.branch)}" placeholder="${t("eg")} Toyota Shah Alam">
        <div style="margin-top:16px"><button class="btn red block" id="sv">${t("save")}</button></div>
      </div>
      <p class="note">${t("accNote")}</p>`;
    $("#lsel").querySelectorAll("button").forEach(b => b.onclick = () => setLang(b.dataset.l));
    $("#sv").onclick = () => { store.set("sa_profile", { name: $("#n").value.trim(), phone: $("#ph").value.trim(), branch: $("#br").value.trim() }); toast(t("savedProf")); };
  }

  // ---------- router ----------
  function route() {
    const [tab, sub] = (location.hash.slice(1) || "home").split("/");
    const map = { home, loan, brosur, gaji, akaun };
    if (tab === "loan") loanN = sub === "banding" ? 2 : sub === "banding3" ? 3 : sub === "banding4" ? 4 : 1;
    (map[tab] || home)();
    document.querySelectorAll(".tabs a").forEach(a => a.classList.toggle("on", a.dataset.tab === (map[tab] ? tab : "home")));
    window.scrollTo(0, 0);
  }
  $("#lang").onclick = () => setLang(lang === "en" ? "ms" : "en");
  addEventListener("hashchange", route);
  applyChrome();
  route();
})();
