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
      nav: ["Utama", "Loan", "Brochure", "Gaji", "Akaun"],
      foot: "*Harga boleh berubah bila-bila masa dari tarikh poster ini dikongsi. Harga berdasarkan untuk Semenanjung Malaysia sahaja. Anggaran ansuran, tertakluk pada terma dan syarat bank.",
      footSrc: "Harga OTR termasuk SST, tanpa insurans, individu persendirian · sumber: toyota.com.my",
      needProfile: "Isi nama & nombor di tab Akaun dulu",
      new: "BARU", models: n => `${n} MODEL TOYOTA RASMI`,
      heroH: name => `Hantar info rasmi, <em>siap nama & nombor ${name}</em>`, you: "awak",
      heroP: "Pelanggan minta brochure? Hantar terus ke WhatsApp.", openBroch: "Buka Brochure",
      tLoan: ["Poster loan", "Percuma · tanpa had"], tCmp: ["Banding varian", "1 poster, 2-4 loan"],
      tSal: ["Ikut gaji", "Gaji → senarai kereta"], tBro: ["Brochure", "Hantar ke WhatsApp"],
      tProf: ["Lengkapkan profil", "Nama & nombor akan masuk dalam poster"],
      loanH: "Poster loan", loanSub: "Kira ansuran & jana poster siap nama awak.",
      one: "Varian 1", cmp: n => `Varian ${n}`, variant: "Varian",
      deposit: "Deposit", byMonthly: "Ikut bulanan", rate: "Kadar (% setahun)", tenure: "Tempoh", yrs: n => `${n} tahun`,
      insH: "Insurans (anggaran)", insIn: "Masuk dalam loan", rebH: "Rebate / promo", rebChk: "Tolak rebate dari harga",
      dl: "Muat turun PNG", share: "Kongsi",
      phDepRM: "Deposit (RM)", phTarget: "Ansuran sasaran sebulan (RM)", phDepPct: "Deposit (%)",
      targetNote: "Masukkan bulanan yang customer mahu, app kira deposit yang perlu.",
      rebLabel: n => `Rebate ${n} (RM)`,
      rebNote: (m, d) => `Rebate automatik dari laman promo Toyota MY (${m}${d ? ", disemak " + d : ""}; dikemas kini setiap 1hb &amp; 15hb). Boleh ubah ikut rebate tunai sebenar dari cawangan; nilai diubah tamat bila promo bulan baru keluar.`,
      depNeeded: "deposit diperlukan", noDep: m => `Tanpa deposit pun ansuran cuma ${m} sebulan.`, tooLow: "Sasaran terlalu rendah untuk varian ini.",
      perMonth: "/bulan", otr: "Harga OTR", rebate: "Rebate", afterReb: "Harga selepas rebate",
      insEst: n => `Insurans anggaran (NCD ${n}%)`, inLoan: " · dalam loan", loanAmt: "Jumlah loan",
      inst: (y, r) => `Ansuran ${y} tahun @ ${r}%`, upfront: "Bayaran awal (deposit + insurans)",
      diff: t => `Beza ${t ? "deposit" : "sebulan"}`, hiLo: " (tertinggi vs terendah)", lowest: t => `${t ? "Deposit" : "Ansuran"} terendah`,
      insNote: "Insurans: anggaran premium komprehensif (tarif Semenanjung, ikut cc & harga, termasuk SST 8% + duti setem RM10). Harga sebenar ikut syarikat insurans.",
      pCmp: n => `PERBANDINGAN LOAN · ${n} VARIAN`, pPkg: "PAKEJ LOAN TOYOTA", pFrom: "Ansuran bulanan dari", pMonthly: "Ansuran sebulan",
      pAfter: "Selepas rebate", pAfterS: "Lepas rebate", pIns: " + insurans", pInsS: " + ins.", pTenure: "Tempoh", pRate: "Kadar",
      bPrice: "Harga kereta (OTR)", bAfter: "Harga selepas rebate", bIns: (n, l) => `Insurans anggaran (NCD ${n}%)${l ? " · dalam loan" : " · bayar tunai"}`,
      bInsS: "Insurans", bLoan: "Jumlah loan (anggaran)", bRate: "Kadar faedah · tempoh", bTitle: "PECAHAN HARGA",
      pPerMonth: " /bulan", pDiff: m => `beza ${m} sebulan`, pDiff2: m => `Beza ${m} sebulan`, pName: "Nama awak",
      saved: "Fail dimuat turun", noShare: "Telefon tak sokong kongsi terus — fail dimuat turun",
      tapWA: "Tekan untuk WhatsApp",
      msgHi: (n, b) => `Hai! Saya ${n}, Sales Advisor Toyota${b ? " " + b : ""}.`,
      msgLink: (c, u) => `Ini e-brochure rasmi Toyota ${c}:\n${u}`, msgNoLink: c => `Ini e-brochure rasmi Toyota ${c}.`,
      msgPrice: "Harga OTR (Semenanjung, tanpa insurans):", msgChange: "*Harga boleh berubah bila-bila masa.",
      msgCta: ph => `Nak pandu uji atau kira loan? WhatsApp saya: ${ph}`,
      broH: "Brochure rasmi", broSub: "<b>PDF</b>: e-brochure rasmi siap nama & nombor awak, kongsi terus ke WhatsApp. <b>Pautan</b>: hantar pautan + harga ke nombor pelanggan.",
      custWA: "Nombor WhatsApp pelanggan (untuk Pautan)", eg: "cth.", from: "dari",
      broNote: "E-brochure ialah salinan fail rasmi toyota.com.my; app hanya tambah jalur nama & nombor (boleh ditekan terus ke WhatsApp awak). Harga OTR Semenanjung, tanpa insurans.",
      preparing: "Menyediakan brochure…", failed: "Gagal: ",
      salH: "Ikut gaji", salSub: "Masukkan gaji kasar sebulan, dapat senarai kereta yang sesuai.", salIn: "Gaji kasar sebulan (RM)",
      depPct: "Deposit (%)", ratePct: "Kadar (%)", ofSal: "gaji", tags: ["Selesa", "Sederhana", "Maksimum"],
      salNote: y => `Panduan: <span class="tag ok">Selesa</span> ansuran ≤20% gaji, <span class="tag mid">Sederhana</span> ≤25%, <span class="tag max">Maksimum</span> ≤40%. Tempoh ${y} tahun. Kelulusan sebenar ikut bank (DSR & komitmen lain).`,
      salNone: "Tiada model dalam had 40% gaji. Cuba tambah deposit.",
      salReb: "Tolak rebate (auto dari laman promo Toyota MY)", salRebNote: (m, d) => `Harga sudah tolak rebate automatik dari laman promo Toyota MY (${m}${d ? ", disemak " + d : ""}; dikemas kini setiap 1hb &amp; 15hb). Nilai yang diubah di tab Loan turut dipakai.`,
      afterRebS: "lepas rebate",
      accH: "Akaun", accSub: "Nama & nombor ini masuk dalam poster dan mesej WhatsApp.",
      name: "Nama", phone: "Nombor telefon", branch: "Cawangan (pilihan)", save: "Simpan",
      accNote: "Data disimpan dalam pelayar telefon ini sahaja, tidak dihantar ke mana-mana pelayan.", savedProf: "Profil disimpan",
      cTitle: "ANGGARAN LOAN", cSub: "Bandingkan ansuran bulanan setiap varian", cMixed: "Anggaran Loan Toyota",
      cPrice: "Harga kenderaan (OTR)", cReb: "Rebate", cDep: "Deposit (selepas rebate)", cIns: "Insurans (anggaran)", cLoan: "Jumlah loan (anggaran)", cRate: "Kadar faedah (anggaran)",
      cLow: "Ansuran bulanan", cMonth: "/bulan", cYears: n => n + " Tahun", cLowest: "Terendah",
      fElig: "Nak tahu layak atau tidak? Hantar mesej kepada saya hari ini.", fContact: "Semakan kelayakan percuma", fWA: ["Sembang di","WhatsApp"],
      pDisc: "Angka adalah anggaran dan tertakluk pada kelulusan serta terma bank. Kadar dan harga boleh berubah tanpa notis. Semenanjung Malaysia sahaja.",
      photo: "Gambar profil (untuk poster)", photoAdd: "Pilih gambar", photoDel: "Buang gambar",
      langLbl: "Bahasa", sa: "Sales Advisor Toyota", link: "Pautan", otrS: "OTR", loanS: "Loan", pickup: "Pikap"
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
      one: "Variant 1", cmp: n => `Variant ${n}`, variant: "Variant",
      deposit: "Down payment", byMonthly: "By monthly instalment", rate: "Rate (% p.a.)", tenure: "Tenure", yrs: n => `${n} year${n > 1 ? "s" : ""}`,
      insH: "Insurance (estimate)", insIn: "Include in loan", rebH: "Rebate / promo", rebChk: "Deduct rebate from price",
      dl: "Download PNG", share: "Share",
      phDepRM: "Down payment (RM)", phTarget: "Target monthly instalment (RM)", phDepPct: "Down payment (%)",
      targetNote: "Enter the monthly amount the customer wants; the app works out the down payment needed.",
      rebLabel: n => `Rebate ${n} (RM)`,
      rebNote: (m, d) => `Rebate pulled automatically from the Toyota MY promo page (${m}${d ? ", checked " + d : ""}; updated on the 1st &amp; 15th). Adjust to your branch's actual cash rebate; edits expire when the next month's promo is published.`,
      depNeeded: "down payment needed", noDep: m => `Even with zero down payment the instalment is only ${m} a month.`, tooLow: "Target is too low for this variant.",
      perMonth: "/month", otr: "OTR price", rebate: "Rebate", afterReb: "Price after rebate",
      insEst: n => `Estimated insurance (NCD ${n}%)`, inLoan: " · in loan", loanAmt: "Loan amount",
      inst: (y, r) => `Instalment ${y} yr${y > 1 ? "s" : ""} @ ${r}%`, upfront: "Upfront (down payment + insurance)",
      diff: t => `Difference ${t ? "in down payment" : "per month"}`, hiLo: " (highest vs lowest)", lowest: t => `Lowest ${t ? "down payment" : "instalment"}`,
      insNote: "Insurance: estimated comprehensive premium (Peninsular tariff, by cc & price, incl. 8% SST + RM10 stamp duty). Actual price depends on the insurer.",
      pCmp: n => `LOAN COMPARISON · ${n} VARIANTS`, pPkg: "TOYOTA LOAN PACKAGE", pFrom: "Monthly instalment from", pMonthly: "Monthly instalment",
      pAfter: "After rebate", pAfterS: "After rebate", pIns: " + insurance", pInsS: " + ins.", pTenure: "Tenure", pRate: "Rate",
      bPrice: "Car price (OTR)", bAfter: "Price after rebate", bIns: (n, l) => `Insurance est. (NCD ${n}%)${l ? " · in loan" : " · paid upfront"}`,
      bInsS: "Insurance", bLoan: "Total loan (est.)", bRate: "Interest rate · tenure", bTitle: "PRICE BREAKDOWN",
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
      salNote: y => `Guide: <span class="tag ok">Comfortable</span> instalment ≤20% of salary, <span class="tag mid">Moderate</span> ≤25%, <span class="tag max">Maximum</span> ≤40%. Tenure ${y} years. Actual approval depends on the bank (DSR & other commitments).`,
      salNone: "No model within 40% of salary. Try a higher down payment.",
      salReb: "Deduct rebate (auto from Toyota MY promo page)", salRebNote: (m, d) => `Prices already deduct the rebate pulled automatically from the Toyota MY promo page (${m}${d ? ", checked " + d : ""}; updated on the 1st &amp; 15th). Amounts edited in the Loan tab are used too.`,
      afterRebS: "after rebate",
      accH: "Account", accSub: "This name & number appear on posters and WhatsApp messages.",
      name: "Name", phone: "Phone number", branch: "Branch (optional)", save: "Save",
      accNote: "Data is stored in this phone's browser only and never sent to any server.", savedProf: "Profile saved",
      cTitle: "LOAN ESTIMATE", cSub: "Compare the monthly instalment of each variant", cMixed: "Toyota Loan Estimate",
      cPrice: "Vehicle price (OTR)", cReb: "Rebate", cDep: "Down payment (after rebate)", cIns: "Insurance (est.)", cLoan: "Loan amount (est.)", cRate: "Interest rate (est.)",
      cLow: "Monthly instalment", cMonth: "/month", cYears: n => n + (n === 1 ? " Year" : " Years"), cLowest: "Lowest",
      fElig: "Curious if you qualify? Send me a message today.", fContact: "Free eligibility check", fWA: ["Chat on","WhatsApp"],
      pDisc: "Figures are estimates, subject to bank approval and terms. Rates and prices may change without notice. Peninsular Malaysia only.",
      photo: "Profile photo (for posters)", photoAdd: "Choose photo", photoDel: "Remove photo",
      langLbl: "Language", sa: "Toyota Sales Advisor", link: "Link", otrS: "OTR", loanS: "Loan", pickup: "Pickup"
    }
  };
  const t = (k, ...a) => { const v = I18N[lang][k] ?? I18N.ms[k]; return typeof v === "function" ? v(...a) : v; };
  const setLang = l => { lang = l; store.set("sa_lang", l); applyChrome(); route(); };
  function applyChrome() {
    document.documentElement.lang = lang === "en" ? "en" : "ms";
    document.querySelectorAll(".tabs a span").forEach((s, i) => s.textContent = t("nav")[i]);
    const b = $("#lang"); if (b) { b.textContent = lang === "en" ? "BM" : "EN"; b.title = t("langLbl"); }
  }

  // Format nombor Malaysia: 016-331 3607 · 011-1234 5678 · 03-1234 5678 · 04-123 4567
  const fmtPhone = p => {
    let d = String(p || "").replace(/\D/g, "");
    if (d.startsWith("60")) d = "0" + d.slice(2); else if (d && !d.startsWith("0")) d = "0" + d;
    const grp = r => r.length === 8 ? r.slice(0, 4) + " " + r.slice(4) : r.length === 7 ? r.slice(0, 3) + " " + r.slice(3) : r;
    if (/^01\d{8,9}$/.test(d)) return d.slice(0, 3) + "-" + grp(d.slice(3));
    if (/^03\d{8}$/.test(d)) return "03-" + grp(d.slice(2));
    if (/^08[2-9]\d{6}$/.test(d)) return d.slice(0, 3) + "-" + d.slice(3, 6) + " " + d.slice(6); // Sabah/Sarawak

    if (/^0[2-9]\d{6,8}$/.test(d)) return d.slice(0, 2) + "-" + grp(d.slice(2));
    return String(p || "").trim();
  };
  window.__fmtPhone = fmtPhone;
  const profile = () => { const p = store.get("sa_profile", { name: "", phone: "", branch: "" }); return { ...p, phone: fmtPhone(p.phone) }; };
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
  // Rebate: rebates.json (dikemas kini harian oleh GitHub Actions dari laman promo Toyota MY); data.js = sandaran
  let REB = window.REBATES || { byGrade: {} };
  // Nilai yang SA ubah hanya sah untuk bulan promo yang sama
  const rebOverrides = () => { const o = store.get("sa_reb2", {}); return o.month === REB.month ? o.values || {} : {}; };
  const setRebOverride = (name, val) => { store.set("sa_reb2", { month: REB.month, values: { ...rebOverrides(), [name]: val } }); };
  const rebateOf = g => rebOverrides()[g.name] ?? REB.byGrade[g.name] ?? 0;
  // Kira satu varian ikut tetapan v (rebate tolak dari harga; insurans ikut harga OTR penuh)
  const calc = (g, v) => {
    const r = v.rate / 100, n = v.years, ins = insurance(g, v.ncd), insFin = v.insIn ? ins.total : 0;
    const reb = Math.min(rebateOf(g), g.price), net = g.price - reb;
    let dep;
    if (v.mode === "rm") dep = Math.min(Math.max(0, v.depRM), net);
    else if (v.mode === "target") dep = Math.min(net, Math.max(0, net + insFin - (v.target * 12 * n) / (1 + r * n)));
    else dep = net * v.dep / 100;
    const fin = Math.max(0, net + insFin - dep);
    return { g, ins, insFin, reb, net, dep, depPct: net ? dep / net * 100 : 0, fin, m: fin * (1 + r * n) / (12 * n) };
  };

  // Nombor RM: papar pemisah ribu semasa menaip (20000 -> 20,000; 1500.5 -> 1,500.5)
  const parseMoney = s => +String(s ?? "").replace(/[^\d.]/g, "") || 0;
  const fmtMoney = n => { const [i, d] = String(n ?? "").replace(/[^\d.]/g, "").split("."); const ii = (i || "").replace(/^0+(?=\d)/, ""); return (ii ? (+ii).toLocaleString("en-MY") : (d !== undefined ? "0" : "")) + (d !== undefined ? "." + d.slice(0, 2) : ""); };
  document.addEventListener("input", e => {
    const el = e.target; if (!el.classList || !el.classList.contains("money")) return;
    const pos = el.selectionStart, before = el.value.slice(0, pos).replace(/[^\d.]/g, "").length;
    el.value = fmtMoney(el.value);
    let k = 0, p = 0; while (p < el.value.length && k < before) { if (/[\d.]/.test(el.value[p])) k++; p++; }
    try { el.setSelectionRange(p, p); } catch {}
  }, true);
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

  // Ikon WhatsApp (gelembung + gagang), ikut warna teks butang
  const WA_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" style="flex:none"><path d="M3.6 20.4l1.25-3.9A8.6 8.6 0 1 1 8.1 19.6z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><path fill="currentColor" d="M9.3 7.3c.3-.5.6-.5.9-.5h.4c.2 0 .4.1.5.4l.8 1.8c.1.2 0 .5-.1.7l-.6.7c-.1.2-.1.4 0 .5.6 1 1.5 1.9 2.5 2.5.2.1.4.1.5 0l.7-.7c.2-.2.5-.2.7-.1l1.8.8c.2.1.4.3.4.5 0 .5-.1 1.2-.6 1.6-.5.4-1.2.6-2 .5-1.5-.2-3-1-4.2-2.3-1.3-1.2-2.1-2.7-2.3-4.2-.1-.7.1-1.3.6-1.7z"/></svg>';

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
        <div id="rebBox"></div>
      </div>
      <div class="card result" id="res"></div>
      <div class="card">
        <canvas id="cv" width="1080" height="1350"></canvas>
        <div class="actions"><button class="btn red" id="dl">${t("dl")}</button><button class="btn wa" id="share">${WA_ICON}${t("share")}</button></div>
        <p class="note">${t("foot")}</p>
      </div>`;
    view.querySelectorAll(".seg button[data-n]").forEach(b => b.onclick = () => { location.hash = loanHash(+b.dataset.n); });
    let v = pref;
    const depInput = () => {
      const box = $("#depBox");
      if (v.mode === "rm") box.innerHTML = `<input id="depv" class="money" type="text" inputmode="decimal" value="${fmtMoney(v.depRM)}" placeholder="${t("phDepRM")}">`;
      else if (v.mode === "target") box.innerHTML = `<input id="depv" class="money" type="text" inputmode="decimal" value="${fmtMoney(v.target)}" placeholder="${t("phTarget")}"><p class="note" style="margin:6px 0 0">${t("targetNote")}</p>`;
      else box.innerHTML = `<input id="depv" type="number" inputmode="decimal" min="0" max="90" step="1" value="${v.dep}" placeholder="${t("phDepPct")}">`;
      $("#depv").oninput = update;
    };
    const rebInputs = picks => {
      const box = $("#rebBox");
      const key = picks.join(",") + "|" + REB.month;
      if (box.dataset.key !== key) {
        box.dataset.key = key;
        box.innerHTML = [...new Set(picks)].map(i => `<label>${t("rebLabel", esc(GRADES[i].name))}</label><input class="rebv money" data-g="${i}" type="text" inputmode="decimal" value="${fmtMoney(rebateOf(GRADES[i]))}">`).join("") +
          `<p class="note" style="margin:6px 0 0">${t("rebNote", REB.month || "", REB.updatedAt || "")}</p>`;
        box.querySelectorAll(".rebv").forEach(inp => inp.oninput = () => { setRebOverride(GRADES[+inp.dataset.g].name, Math.max(0, parseMoney(inp.value))); update(); });
      }
    };
    const update = () => {
      const dv = parseMoney($("#depv").value);
      v = { ...v, rate: +$("#rate").value || 0, years: +$("#yrs").value, ncd: +$("#ncd").value, insIn: $("#insIn").checked };
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
    view.querySelectorAll(".card select, #rate, #insIn").forEach(e => e.oninput = update);
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

  // Gambar kereta lutsinar (assets/cars/cut) ikut varian: GR Sport / HEV ada gambar sendiri
  const CUTS = new Set(["vios","vios-hev","vios-grs","yaris","yaris-cross","yaris-cross-hev","corolla","corolla-grs","corolla-cross","corolla-cross-hev","corolla-cross-grs","camry","camry-hev","veloz","zenix","zenix-hev","fortuner","hilux","hilux-grs","hiace","harrier","alphard","vellfire","vellfire-hev"]);
  const cutOf = g => {
    const id = g.car.id, gr = /GR Sport/i.test(g.name), hev = /HEV/i.test(g.name);
    const k = gr && CUTS.has(id + "-grs") ? id + "-grs" : hev && CUTS.has(id + "-hev") ? id + "-hev" : id;
    return CUTS.has(k) ? "assets/cars/cut/" + k + ".png" : g.car.img;
  };
  const contain = (ctx, img, x, y, w, h, bias = .5) => {
    if (!img) return;
    const s = Math.min(w / img.width, h / img.height), dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * bias, dw, dh);
  };
  const NAVY = "#0b1f4b", RED = "#e4002b", INK = "#1f2937", MUTE = "#6b7280", LINE = "#e3e7ee";
  // Saiz poster ikut bilangan varian (ikut format contoh Wan)
  const LAYOUT = {
    1: { W: 1500, H: 2000, cols: 1, rows: 1, hs: 1, fs: .85, head: 330, foot: 200, disc: 70 },
    2: { W: 2000, H: 2000, cols: 2, rows: 1, hs: 1, fs: 1, head: 320, foot: 220, disc: 70 },
    3: { W: 2000, H: 1125, cols: 3, rows: 1, hs: .72, fs: .66, head: 215, foot: 145, disc: 46 },
    4: { W: 1125, H: 2000, cols: 2, rows: 2, hs: .62, fs: .6, head: 205, foot: 140, disc: 56 }
  };
  const WA_BUBBLE = new Path2D("M3.6 20.4l1.25-3.9A8.6 8.6 0 1 1 8.1 19.6z");
  const WA_PHONE = new Path2D("M9.3 7.3c.3-.5.6-.5.9-.5h.4c.2 0 .4.1.5.4l.8 1.8c.1.2 0 .5-.1.7l-.6.7c-.1.2-.1.4 0 .5.6 1 1.5 1.9 2.5 2.5.2.1.4.1.5 0l.7-.7c.2-.2.5-.2.7-.1l1.8.8c.2.1.4.3.4.5 0 .5-.1 1.2-.6 1.6-.5.4-1.2.6-2 .5-1.5-.2-3-1-4.2-2.3-1.3-1.2-2.1-2.7-2.3-4.2-.1-.7.1-1.3.6-1.7z");

  let drawSeq = 0;
  async function drawPoster(rows, v) {
    const seq = ++drawSeq;
    await document.fonts.ready;
    const p = profile(), photoSrc = store.get("sa_photo", "");
    const [imgs, photo] = await Promise.all([Promise.all(rows.map(r => loadImg(cutOf(r.g)))), photoSrc ? loadImg(photoSrc) : null]);
    if (seq !== drawSeq) return;
    const cv = $("#cv"); if (!cv) return;
    const L = LAYOUT[rows.length] || LAYOUT[1], { W, H } = L;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const ctx = cv.getContext("2d");
    const F = (w, s, it) => ctx.font = (it ? "italic " : "") + w + " " + Math.round(s) + 'px "Plus Jakarta Sans", sans-serif';
    const fitF = (text, maxW, size, w, it) => { let z = size; F(w, z, it); while (ctx.measureText(text).width > maxW && z > 8) F(w, --z, it); return z; };
    const GOLD = "#f5c542", SOFT = "#b9c6e4", PANEL = "#f2f5fa";

    // ---- latar: asas gelap + 4 cahaya neon dari setiap bucu, bertemu di tengah
    ctx.fillStyle = "#050a18"; ctx.fillRect(0, 0, W, H);
    const NEON = [[0, 0, "0,229,255"], [W, 0, "57,255,20"], [W, H, "255,170,0"], [0, H, "255,59,31"]]; // cyan, hijau limau, amber, merah-jingga
    const reach = Math.hypot(W, H) * .56;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    NEON.forEach(([cx, cy, rgb]) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
      g.addColorStop(0, "rgba(" + rgb + ",1)"); g.addColorStop(.5, "rgba(" + rgb + ",.55)"); g.addColorStop(1, "rgba(" + rgb + ",0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    ctx.restore();
    // kegelapan lembut supaya teks kekal jelas
    ctx.fillStyle = "rgba(5,10,24,.12)"; ctx.fillRect(0, 0, W, H);

    // ---- kepala
    const hs = L.hs, pad = 60 * Math.max(hs, .7);
    // jalur merah serong di penjuru kanan atas + perkataan TOYOTA
    ctx.fillStyle = RED; ctx.beginPath(); ctx.moveTo(W - 470 * hs, 0); ctx.lineTo(W, 0); ctx.lineTo(W, 150 * hs); ctx.lineTo(W - 530 * hs, 150 * hs); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(W - 500 * hs, 0); ctx.lineTo(W - 486 * hs, 0); ctx.lineTo(W - 546 * hs, 150 * hs); ctx.lineTo(W - 560 * hs, 150 * hs); ctx.closePath(); ctx.fill();
    ctx.textAlign = "right"; ctx.fillStyle = "#fff"; F(800, 54 * hs); ctx.letterSpacing = 4 * hs + "px"; ctx.fillText("TOYOTA", W - pad, 96 * hs); ctx.letterSpacing = "0px";
    const same = rows.every(r => r.g.car.id === rows[0].g.car.id);
    const title = same ? "Toyota " + rows[0].g.car.name : t("cMixed");
    // tag pil merah
    ctx.textAlign = "left"; F(800, 30 * hs); ctx.letterSpacing = 3 * hs + "px"; const tg = t("cTitle"), tgw = ctx.measureText(tg).width + 44 * hs;
    rr(ctx, pad, 38 * hs, tgw, 56 * hs, 28 * hs); ctx.fillStyle = RED; ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText(tg, pad + 22 * hs, 77 * hs); ctx.letterSpacing = "0px";
    ctx.fillStyle = "#fff"; fitF(title, W - pad * 2 - 560 * hs, 112 * hs, 800); ctx.fillText(title, pad, 210 * hs);
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = 8 * hs; ctx.fillStyle = "#fff"; F(700, 38 * hs); ctx.fillText(t("cSub"), pad, 266 * hs); ctx.restore();

    // ---- kad varian
    const gap = (rows.length === 3 ? 30 : 44) * Math.max(hs, .7), areaTop = L.head, areaBot = H - L.foot - L.disc - 30 * L.fs;
    let cw = (W - pad * 2 - gap * (L.cols - 1)) / L.cols, ch = (areaBot - areaTop - gap * (L.rows - 1)) / L.rows;
    if (rows.length === 1) cw = Math.min(cw, 1100);
    const k = Math.min(cw / 900, ch / 1150);
    rows.forEach((r, i) => {
      const col = i % L.cols, row = Math.floor(i / L.cols);
      const x = rows.length === 1 ? (W - cw) / 2 : pad + col * (cw + gap), y = areaTop + row * (ch + gap);
      drawCard(r, i, x, y, cw, ch, k, imgs[i]);
    });

    function drawCard(r, i, x, y, cw, ch, k, img) {
      // kad putih + bayang + jalur merah di atas
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 34 * k; ctx.shadowOffsetY = 12 * k;
      rr(ctx, x, y, cw, ch, 30 * k); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore();
      ctx.save(); rr(ctx, x, y, cw, ch, 30 * k); ctx.clip(); ctx.fillStyle = RED; ctx.fillRect(x, y, cw, 12 * k); ctx.restore();
      // bulatan emas bernombor
      const br = 46 * k, bcx = x + 38 * k + br, bcy = y + 40 * k + br;
      ctx.beginPath(); ctx.arc(bcx, bcy, br, 0, Math.PI * 2); ctx.fillStyle = GOLD; ctx.fill();
      ctx.lineWidth = 5 * k; ctx.strokeStyle = NAVY; ctx.stroke();
      ctx.fillStyle = NAVY; ctx.textAlign = "center"; F(800, 56 * k); ctx.fillText(String(i + 1), bcx, bcy + 20 * k);
      // nama varian
      const nx = bcx + br + 26 * k, nmax = x + cw - nx - 28 * k;
      ctx.textAlign = "left"; ctx.fillStyle = NAVY; fitF(r.g.name, nmax, 56 * k, 800); ctx.fillText(r.g.name, nx, bcy + 18 * k);
      // gambar kereta
      const FIX = 690 * k, imgTop = y + 148 * k, imgH = Math.max(ch - FIX - 148 * k, 120 * k);
      ctx.save(); ctx.fillStyle = "rgba(10,23,51,.10)"; ctx.beginPath();
      ctx.ellipse(x + cw / 2, imgTop + imgH * .9, cw * .3, imgH * .03, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      contain(ctx, img, x + 30 * k, imgTop, cw - 60 * k, imgH * .9, .85);
      // jadual berselang warna
      const rowsT = [
        [t("cPrice"), RM(r.g.price)], [t("cReb"), RM(r.reb)], [t("cDep"), RM(r.dep)],
        [t("cIns") + (v.ncd ? " · NCD " + v.ncd + "%" : ""), RM(r.ins.total)], [t("cLoan"), RM(r.fin), "hi"], [t("cRate"), v.rate + "%"]
      ];
      const tx = x + 32 * k, tr = x + cw - 32 * k, ty = imgTop + imgH, rh = 54 * k;
      rowsT.forEach(([lab, val, hi], j) => {
        const yy = ty + j * rh;
        if (hi) { rr(ctx, tx, yy, tr - tx, rh, 12 * k); ctx.fillStyle = NAVY; ctx.fill(); }
        else if (j % 2 === 0) { rr(ctx, tx, yy, tr - tx, rh, 12 * k); ctx.fillStyle = PANEL; ctx.fill(); }
        ctx.textAlign = "left"; ctx.fillStyle = hi ? "#fff" : INK; fitF(lab, (tr - tx) * .62, 28 * k, 600); ctx.fillText(lab, tx + 18 * k, yy + rh * .67);
        ctx.textAlign = "right"; ctx.fillStyle = hi ? GOLD : NAVY; F(800, 32 * k); ctx.fillText(val, tr - 18 * k, yy + rh * .67);
      });
      // panel ansuran bulanan
      const pY = ty + rowsT.length * rh + 14 * k, pH = 150 * k;
      const pg = ctx.createLinearGradient(tx, pY, tr, pY + pH); pg.addColorStop(0, "#0a1733"); pg.addColorStop(1, "#1d4a8f");
      rr(ctx, tx, pY, tr - tx, pH, 22 * k); ctx.fillStyle = pg; ctx.fill();
      const cx = x + cw / 2;
      ctx.textAlign = "center"; ctx.fillStyle = SOFT; F(600, 28 * k); ctx.fillText(t("cLow"), cx, pY + 42 * k);
      const num = Math.round(r.m).toLocaleString("en-MY");
      F(800, 40 * k); const wRM = ctx.measureText("RM").width; F(800, 92 * k); const wN = ctx.measureText(num).width; F(500, 28 * k); const wM = ctx.measureText(" " + t("cMonth")).width;
      let bx = cx - (wRM + wN + wM) / 2; const by = pY + 122 * k;
      ctx.textAlign = "left"; ctx.fillStyle = GOLD; F(800, 40 * k); ctx.fillText("RM", bx, by); bx += wRM;
      F(800, 92 * k); ctx.fillText(num, bx, by); bx += wN;
      ctx.fillStyle = "#fff"; F(500, 28 * k); ctx.fillText(" " + t("cMonth"), bx, by);
      // chip tempoh: tempoh dipilih (merah) + 2 tempoh lebih pendek
      const ys = [v.years, v.years - 2, v.years - 4].filter(n => n >= 1);
      const cTop = pY + pH + 14 * k, cH = 112 * k, cg = 16 * k, cW = ((tr - tx) - cg * (ys.length - 1)) / ys.length;
      ys.forEach((n, j) => {
        const m = j === 0 ? r.m : calc(r.g, { ...v, mode: "rm", depRM: r.dep, years: n }).m, hi = j === 0, cxx = tx + j * (cW + cg);
        rr(ctx, cxx, cTop, cW, cH, 18 * k); ctx.fillStyle = hi ? RED : PANEL; ctx.fill();
        ctx.textAlign = "center"; ctx.fillStyle = hi ? "#fff" : MUTE; F(700, 24 * k); ctx.fillText(t("cYears", n).toUpperCase() + (hi && ys.length > 1 ? " · " + t("cLowest").toUpperCase() : ""), cxx + cW / 2, cTop + 36 * k);
        const vt = Math.round(m).toLocaleString("en-MY");
        F(800, 22 * k); const a1 = ctx.measureText("RM").width; F(800, 44 * k); const a2 = ctx.measureText(vt).width;
        const vx = cxx + (cW - a1 - a2) / 2, vy = cTop + 90 * k; ctx.textAlign = "left";
        ctx.fillStyle = hi ? GOLD : RED; F(800, 22 * k); ctx.fillText("RM", vx, vy);
        ctx.fillStyle = hi ? "#fff" : NAVY; F(800, 44 * k); ctx.fillText(vt, vx + a1, vy);
      });
    }

    // ---- kaki: bar navy bergaris emas
    const f = L.fs, fh = L.foot, fy = H - L.disc - fh, fx = pad * .8, fwid = W - fx * 2, narrow = W < 1500;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = 26 * f; ctx.shadowOffsetY = 8 * f;
    const fg = ctx.createLinearGradient(fx, fy, fx + fwid, fy); fg.addColorStop(0, "#071127"); fg.addColorStop(1, "#102a57");
    rr(ctx, fx, fy, fwid, fh, 26 * f); ctx.fillStyle = fg; ctx.fill(); ctx.restore();
    rr(ctx, fx, fy, fwid, fh, 26 * f); ctx.lineWidth = 3 * f; ctx.strokeStyle = GOLD; ctx.stroke();
    const midY = fy + fh / 2, seg = narrow ? [0, .33, .63, 1] : [0, .25, .5, .76, 1];
    const sepX = q => fx + fwid * q;
    ctx.fillStyle = "rgba(245,197,66,.35)"; for (let q = 1; q < seg.length - 1; q++) ctx.fillRect(sepX(seg[q]), fy + fh * .22, Math.max(1, 2 * f), fh * .56);
    // profil
    const pr = fh * .34, pcx = fx + 30 * f + pr;
    ctx.save(); ctx.beginPath(); ctx.arc(pcx, midY, pr, 0, Math.PI * 2); ctx.fillStyle = "#24407a"; ctx.fill(); ctx.clip();
    if (photo) { const s2 = Math.max(2 * pr / photo.width, 2 * pr / photo.height); ctx.drawImage(photo, pcx - photo.width * s2 / 2, midY - photo.height * s2 / 2, photo.width * s2, photo.height * s2); }
    else { ctx.fillStyle = "#fff"; ctx.textAlign = "center"; F(800, pr * .8); ctx.fillText((p.name || "SA").split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase(), pcx, midY + pr * .28); }
    ctx.restore();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 4 * f; ctx.beginPath(); ctx.arc(pcx, midY, pr, 0, Math.PI * 2); ctx.stroke();
    const px1 = pcx + pr + 22 * f, pw = sepX(seg[1]) - px1 - 16 * f;
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; fitF(p.name || t("pName"), pw, 44 * f, 800); ctx.fillText(p.name || t("pName"), px1, midY - 2 * f);
    ctx.fillStyle = SOFT; fitF(t("sa"), pw, 26 * f, 500); ctx.fillText(t("sa"), px1, midY + 36 * f);
    // tanda semak + ayat kelayakan
    const s1 = sepX(seg[1]), s1w = sepX(seg[2]) - s1, sr = fh * .24, scx = s1 + 26 * f + sr;
    ctx.beginPath(); ctx.arc(scx, midY, sr, 0, Math.PI * 2); ctx.fillStyle = GOLD; ctx.fill();
    ctx.beginPath(); ctx.moveTo(scx - sr * .45, midY + sr * .02); ctx.lineTo(scx - sr * .1, midY + sr * .38); ctx.lineTo(scx + sr * .5, midY - sr * .32);
    ctx.lineWidth = 7 * f; ctx.strokeStyle = NAVY; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke(); ctx.lineCap = "butt";
    const ex = scx + sr + 18 * f, ew = s1 + s1w - ex - 16 * f;
    ctx.fillStyle = "#fff"; F(700, 27 * f); ctx.textAlign = "left";
    const words = t("fElig").split(" "), lines = []; let ln = "";
    for (const wd of words) { const tt = ln ? ln + " " + wd : wd; if (ctx.measureText(tt).width > ew && ln) { lines.push(ln); ln = wd; } else ln = tt; } lines.push(ln);
    const lh = 34 * f, ly0 = midY - (lines.length - 1) * lh / 2 + 9 * f; lines.forEach((l, q) => ctx.fillText(l, ex, ly0 + q * lh));
    // nombor telefon
    const s2x = sepX(seg[2]), cr = fh * .26, ccx = s2x + 26 * f + cr;
    if (narrow) {
      ctx.beginPath(); ctx.arc(ccx, midY, cr, 0, Math.PI * 2); ctx.fillStyle = "#25d366"; ctx.fill();
      ctx.save(); const sc = cr * 1.25 / 24; ctx.translate(ccx - 12 * sc, midY - 12 * sc); ctx.scale(sc, sc);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.9; ctx.stroke(WA_BUBBLE); ctx.fillStyle = "#fff"; ctx.fill(WA_PHONE); ctx.restore();
    }
    const nx2 = narrow ? ccx + cr + 20 * f : s2x + 26 * f, nw2 = sepX(seg[3]) - nx2 - 18 * f;
    ctx.fillStyle = "#fff"; fitF(p.phone || "01x-xxx xxxx", nw2, 60 * f, 800); ctx.fillText(p.phone || "01x-xxx xxxx", nx2, midY + 8 * f);
    ctx.fillStyle = GOLD; fitF(t("fContact"), nw2, 24 * f, 600); ctx.fillText(t("fContact"), nx2, midY + 44 * f);
    // butang WhatsApp (poster lebar sahaja): pil hijau
    if (!narrow) {
      const b0 = sepX(seg[3]) + 24 * f, bw2 = sepX(seg[4]) - b0 - 24 * f, bh2 = fh * .6, by2 = midY - bh2 / 2;
      rr(ctx, b0, by2, bw2, bh2, bh2 / 2); ctx.fillStyle = "#1fa855"; ctx.fill();
      const ir = bh2 * .3, icx = b0 + 26 * f + ir;
      ctx.save(); const s3 = ir * 2.1 / 24; ctx.translate(icx - 12 * s3, midY - 12 * s3); ctx.scale(s3, s3);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.9; ctx.stroke(WA_BUBBLE); ctx.fillStyle = "#fff"; ctx.fill(WA_PHONE); ctx.restore();
      const [w1, w2] = t("fWA"); const tw2 = bw2 - (icx + ir + 18 * f - b0) - 22 * f;
      ctx.fillStyle = "#fff"; ctx.textAlign = "left"; fitF(w1.length > w2.length ? w1 : w2, tw2, 36 * f, 800);
      ctx.fillText(w1, icx + ir + 18 * f, midY - 4 * f); ctx.fillText(w2, icx + ir + 18 * f, midY + 38 * f);
    }
    // penafian
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 8 * f; ctx.textAlign = "center"; ctx.fillStyle = "#fff"; fitF(t("pDisc"), W * .86, 26 * f, 600, true);
    ctx.fillText(t("pDisc"), W / 2, H - L.disc * .4); ctx.restore();
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
        page.drawText(`${t("sa")}${branch ? " · " + branch : ""}`, { x: pad, y: bh * 0.22, size: ss, font: reg, color: white });
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
    doc.setAuthor(`${name} · ${t("sa")}`);
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
      <div class="card"><label>${t("custWA")}</label><input id="cust" inputmode="tel" placeholder="${t("eg")} 012-345 6789" onblur="this.value=this.value&&window.__fmtPhone(this.value)"></div>
      <div class="list">${CARS.map((c, i) => `
        <div class="car"><img src="${c.img}" alt="${esc(c.name)}"><div class="t"><b>${esc(c.name)}</b><small>${c.type === "Pickup" ? t("pickup") : c.type} · ${t("from")} ${RM(Math.min(...c.grades.map(g => g[2])))}</small></div>
        <div style="display:grid;gap:6px">${BROCH[c.id] ? `<button class="btn red" data-pdf="${i}" style="padding:8px 12px">PDF</button>` : ""}<button class="btn wa" data-i="${i}" style="padding:8px 12px">${t("link")}</button></div></div>`).join("")}</div>
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
        <label>${t("salIn")}</label><input id="sal" class="money" type="text" inputmode="decimal" value="${fmtMoney(last)}">
        <div class="row">
          <div><label>${t("depPct")}</label><input id="dep" type="number" value="${pref.dep}"></div>
          <div><label>${t("ratePct")}</label><input id="rate" type="number" step="0.01" value="${pref.rate}"></div>
        </div>
      </div>
      <div class="list" id="out"></div>
      <p class="note">${t("salNote", pref.years)}</p>
      <p class="note">${t("salRebNote", REB.month || "", REB.updatedAt || "")}</p>`;
    const run = () => {
      const sal = parseMoney($("#sal").value), dep = +$("#dep").value || 0, rate = +$("#rate").value || 0;
      store.set("sa_gaji", sal);
      // Rebate sentiasa ditolak: nilai laman promo Toyota MY (atau nilai yang diubah di tab Loan bulan ini)
      const list = GRADES.map((g, i) => { const reb = Math.min(rebateOf(g), g.price), net = g.price - reb; return { g, i, reb, net, m: monthly(net, dep, rate, pref.years) }; })
        .map(x => ({ ...x, r: sal ? x.m / sal : 9 })).filter(x => x.r <= 0.40).sort((a, b) => b.net - a.net);
      const tags = t("tags");
      $("#out").innerHTML = list.length ? list.map(x => {
        const tg = x.r <= .20 ? ["ok", tags[0]] : x.r <= .25 ? ["mid", tags[1]] : ["max", tags[2]];
        const price = x.reb ? `<s>${RM(x.g.price)}</s> ${RM(x.net)} ${t("afterRebS")}` : RM(x.g.price);
        return `<a class="car" href="#loan" data-g="${x.i}" style="text-decoration:none"><img src="${x.g.car.img}" alt=""><div class="t"><b>${x.g.name}</b><small>${price} · ${Math.round(x.r * 100)}% ${t("ofSal")}</small>${x.reb ? `<small style="display:block;color:var(--green);font-weight:700">Rebate -${RM(x.reb)}</small>` : ""}</div><div style="text-align:right"><div class="p">${RM(x.m)}</div><span class="tag ${tg[0]}">${tg[1]}</span></div></a>`;
      }).join("") : `<div class="card">${t("salNone")}</div>`;
      $("#out").querySelectorAll("[data-g]").forEach(a => a.onclick = () => { store.set("sa_sel", [+a.dataset.g, ...store.get("sa_sel", []).slice(1)]); store.set("sa_loan2", { ...pref, mode: "pct", dep, rate }); });
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
        <label>${t("photo")}</label>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:4px"><img id="phImg" alt="" style="width:64px;height:64px;border-radius:50%;object-fit:cover;background:var(--soft);flex:none" ${store.get("sa_photo", "") ? `src="${store.get("sa_photo", "")}"` : ""}><label class="btn ghost" style="margin:0;cursor:pointer;padding:10px 14px">${t("photoAdd")}<input id="phFile" type="file" accept="image/*" hidden></label><button class="btn ghost" id="phDel" type="button" style="padding:10px 14px">${t("photoDel")}</button></div>
        <label>${t("name")}</label><input id="n" value="${esc(p.name)}" placeholder="${t("eg")} Wan Jasni">
        <label>${t("phone")}</label><input id="ph" inputmode="tel" value="${esc(p.phone)}" placeholder="${t("eg")} 012-345 6789">
        <label>${t("branch")}</label><input id="br" value="${esc(p.branch)}" placeholder="${t("eg")} Toyota Shah Alam">
        <div style="margin-top:16px"><button class="btn red block" id="sv">${t("save")}</button></div>
      </div>
      <p class="note">${t("accNote")}</p>`;
    $("#lsel").querySelectorAll("button").forEach(b => b.onclick = () => setLang(b.dataset.l));
    $("#phFile").onchange = e => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image(), url = URL.createObjectURL(f);
      img.onload = () => {
        const S = 400, c = document.createElement("canvas"); c.width = c.height = S;
        const k = Math.max(S / img.width, S / img.height), w = img.width * k, h = img.height * k;
        c.getContext("2d").drawImage(img, (S - w) / 2, (S - h) / 2 - (h > S ? (h - S) * .15 : 0), w, h);
        const data = c.toDataURL("image/jpeg", .85); store.set("sa_photo", data); $("#phImg").src = data; URL.revokeObjectURL(url); toast(t("savedProf"));
      };
      img.src = url;
    };
    $("#phDel").onclick = () => { try { localStorage.removeItem("sa_photo"); } catch {} $("#phImg").removeAttribute("src"); toast(t("savedProf")); };
    $("#ph").onblur = () => { $("#ph").value = fmtPhone($("#ph").value); };
    $("#sv").onclick = () => { const ph = fmtPhone($("#ph").value); $("#ph").value = ph; store.set("sa_profile", { name: $("#n").value.trim(), phone: ph, branch: $("#br").value.trim() }); toast(t("savedProf")); };
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
  // Ambil harga (prices.json) & rebate (rebates.json) terkini tanpa cache — dikemas kini GitHub Actions 1hb & 15hb
  const getJSON = f => fetch(f + "?ts=" + Date.now(), { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null);
  Promise.all([getJSON("prices.json"), getJSON("rebates.json")]).then(([pr, rb]) => {
    let changed = false;
    if (pr && pr.byGrade) {
      for (const g of GRADES) { const p = pr.byGrade[g.name]; if (p && p !== g.price) { g.price = p; changed = true; } }
      for (const c of CARS) for (const row of c.grades) { const p = pr.byGrade[row[0]]; if (p) row[2] = p; }
    }
    if (rb && rb.byGrade) {
      if (JSON.stringify(rb.byGrade) !== JSON.stringify(REB.byGrade) || rb.month !== REB.month) changed = true;
      REB = rb;
    }
    if (changed && !/^akaun/.test(location.hash.slice(1))) route();
  });
})();
