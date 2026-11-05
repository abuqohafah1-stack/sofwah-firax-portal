/* SOFWAH FIRAX UI · dijana oleh build.sh · jangan ubah terus */
/* SOFWAH FIRAX — Financial Intelligence, Risk & Analytics eXecutive. SPA satu fail.
   Semua data melalui google.script.run → fungsi fx* (token sesi). PIN tidak pernah dipaparkan atau disimpan di pelayar. */
(function () {
  'use strict';
  var app = document.getElementById('app');
  var S = { token: null, me: null, page: 'home', home: null, pages: {}, acts: null, tab: {}, users: null, busy: {} };
  var A = {};
  var TK = 'firax.t';

  /* ======================= util ======================= */
  function esc(v) { return String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} }
  function num(v) { if (v === null || v === undefined) return null; var s = String(v).replace(/RM|,|\s|%|\(|\)|bln|×/g, ''); if (/^\(.*\)$/.test(String(v).trim())) s = '-' + s; if (s === '' || s === '—' || s === '-' || s === '–') return null; var x = Number(s); return isFinite(x) ? x : null; }
  function pct(v) { var x = num(v); if (x === null) return null; return /%/.test(String(v)) ? x : x * 100; }
  function fnum(x, d) { if (x === null || x === undefined || isNaN(x)) return '—'; return Number(x).toLocaleString('en-MY', { maximumFractionDigits: d || 0, minimumFractionDigits: d || 0 }); }
  function show(v) { return v === '' || v === null || v === undefined ? '<span class="muted">—</span>' : esc(v); }
  function toast(m, bad) { var t = document.createElement('div'); t.className = 'toast' + (bad ? ' e' : ''); t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, bad ? 5200 : 2600); }
  function ini(nm) { var p = String(nm || '?').split(/\s+/).filter(function (w) { return /^[A-Za-z]/.test(w); }); return p.length ? (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase() : '?'; }
  function ic(p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  /** Lampu daripada emoji dalam teks sheet. */
  function lamp(s) { s = String(s || ''); return /🔴/.test(s) ? 'r' : /🟡|🟠|⚠/.test(s) ? 'y' : /🟢|✅/.test(s) ? 'g' : /⚪|⏳/.test(s) ? 'w' : ''; }
  function unemo(s) { return String(s || '').replace(/[🔴🟡🟠🟢⚪✅⏳]️?\s*/g, '').trim(); }
  function dot(s) { var l = lamp(s); return l ? '<span class="dot ' + l + '" title="' + esc(s) + '"></span>' : ''; }
  /** Paparan Inggeris bagi nilai status/hari daripada sheet (nilai asal dalam sheet tidak diubah). */
  var EN = { 'Baru': 'New', 'Disemak': 'Reviewed', 'Diluluskan': 'Approved', 'Dibayar': 'Paid', 'Ditolak': 'Rejected', 'Direkod QuickBooks': 'Recorded in QuickBooks', 'Dalam tindakan': 'In progress', 'Selesai': 'Done', 'Ditutup': 'Closed', 'AHAD': 'Sunday', 'SELASA': 'Tuesday', 'RABU': 'Wednesday', 'AHAD & RABU': 'Sunday & Wednesday', 'Menunggu hantar': 'Email queued', 'DATA LEWAT': 'DATA LATE' };
  function en(s) { s = String(s == null ? '' : s); var t = s.trim(); return EN[t] || (/^✅ Dihantar/.test(t) ? t.replace('Dihantar', 'Sent') : s); }
  function chip(s, cls) { return '<span class="chip ' + (cls || lamp(s) || '') + '">' + esc(unemo(s) || s) + '</span>'; }
  function field(label, html) { return '<div class="field"><label>' + esc(label) + '</label>' + html + '</div>'; }
  function val(id) { var e = document.getElementById(id); return e ? String(e.value).trim() : ''; }
  function opts(list, v) { return list.map(function (o) { var k = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(k) + '"' + (String(k) === String(v) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); }
  function modal(html) { closeModal(); var o = document.createElement('div'); o.className = 'ov'; o.id = 'ov'; o.innerHTML = '<div class="panel" role="dialog" aria-modal="true">' + html + '</div>'; o.addEventListener('mousedown', function (e) { if (e.target === o) closeModal(); }); document.body.appendChild(o); return o; }
  function closeModal() { var o = document.getElementById('ov'); if (o) o.remove(); }
  function isNumCell(v) { return /^[\s(−-]*(RM\s?)?-?[\d,]+(\.\d+)?\)?\s*(%|bln|bulan|hari|×)?$/.test(String(v).trim()) || /^-?[\d,.]+%$/.test(String(v).trim()); }

  /* ======================= jenama ======================= */
  var MARK = '<svg viewBox="0 0 48 48"><defs><linearGradient id="fxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6dffa8"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs>' +
    '<path d="M12 8h26l-3.6 7H20v6.5h13l-3.4 6.6H20V40h-8z" fill="url(#fxg)"/><path d="M30.5 31.5l4.3 4.3 7.2-9.8" fill="none" stroke="#6dffa8" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  /** Seni latar hero: gunung/graf kewangan bercahaya hijau (SVG, tiada imej luar). */
  function heroArt(id) {
    id = id || 'h';
    return '<svg viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice"><defs>' +
      '<linearGradient id="' + id + 'a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a1b"/><stop offset="1" stop-color="#030806"/></linearGradient>' +
      '<linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fe07a" stop-opacity=".35"/><stop offset="1" stop-color="#2fe07a" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#123f27"/><stop offset="1" stop-color="#05110b"/></linearGradient>' +
      '<linearGradient id="' + id + 'd" x1="0" x2="1"><stop offset="0" stop-color="#030806" stop-opacity=".96"/><stop offset=".55" stop-color="#030806" stop-opacity=".55"/><stop offset="1" stop-color="#030806" stop-opacity=".1"/></linearGradient>' +
      '<radialGradient id="' + id + 'e" cx=".72" cy=".3" r=".5"><stop offset="0" stop-color="#2fe07a" stop-opacity=".22"/><stop offset="1" stop-color="#2fe07a" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1200" height="420" fill="url(#' + id + 'a)"/><rect width="1200" height="420" fill="url(#' + id + 'e)"/>' +
      Array.apply(null, Array(9)).map(function (_, i) { return '<line x1="0" x2="1200" y1="' + (40 + i * 44) + '" y2="' + (40 + i * 44) + '" stroke="#2fe07a" stroke-opacity=".05"/>'; }).join('') +
      '<path d="M0 300 L120 250 L210 280 L330 190 L430 230 L540 150 L640 200 L760 110 L860 160 L980 80 L1080 120 L1200 60 L1200 420 L0 420Z" fill="url(#' + id + 'c)" opacity=".9"/>' +
      '<path d="M0 340 L140 300 L260 320 L380 260 L520 290 L640 230 L760 260 L900 190 L1020 220 L1200 150 L1200 420 L0 420Z" fill="#071a10" opacity=".95"/>' +
      '<path d="M0 300 L120 250 L210 280 L330 190 L430 230 L540 150 L640 200 L760 110 L860 160 L980 80 L1080 120 L1200 60" fill="none" stroke="#2fe07a" stroke-width="2.4" stroke-opacity=".85" style="filter:drop-shadow(0 0 6px #2fe07a)"/>' +
      '<path d="M0 300 L120 250 L210 280 L330 190 L430 230 L540 150 L640 200 L760 110 L860 160 L980 80 L1080 120 L1200 60 L1200 420 L0 420Z" fill="url(#' + id + 'b)"/>' +
      [[330, 190], [540, 150], [760, 110], [980, 80]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5" fill="#6dffa8" style="filter:drop-shadow(0 0 8px #2fe07a)"/>'; }).join('') +
            '<rect width="1200" height="420" fill="url(#' + id + 'd)"/></svg>';
  }

  /* ======================= carta ======================= */
  /** Bar + garisan sasaran. data=[{l,v,t}] */
  function barChart(data, o) {
    o = o || {}; var W = o.w || 640, H = o.h || 220, P = { l: 46, r: 12, t: 14, b: 28 }, n = data.length; if (!n) return '<div class="empty">No data</div>';
    var max = Math.max.apply(null, data.map(function (d) { return Math.max(d.v || 0, d.t || 0); })) || 1; max *= 1.12;
    var bw = (W - P.l - P.r) / n, y = function (v) { return P.t + (H - P.t - P.b) * (1 - (v || 0) / max); };
    var s = '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '">';
    for (var g = 0; g <= 4; g++) { var gv = max * g / 4, gy = y(gv); s += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + gy + '" y2="' + gy + '" stroke="rgba(140,255,190,.08)"/><text x="' + (P.l - 8) + '" y="' + (gy + 4) + '" fill="#7f9888" font-size="10" text-anchor="end">' + (gv >= 1e6 ? (gv / 1e6).toFixed(1) + 'm' : gv >= 1000 ? Math.round(gv / 1000) + 'k' : Math.round(gv)) + '</text>'; }
    s += '<defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3af08a"/><stop offset="1" stop-color="#0f6b34"/></linearGradient></defs>';
    data.forEach(function (d, i) {
      var x = P.l + i * bw + bw * .2, w = bw * .6, yy = y(d.v), hit = d.t ? d.v >= d.t : true;
      s += '<rect x="' + x + '" y="' + yy + '" width="' + w + '" height="' + Math.max(0, H - P.b - yy) + '" rx="6" fill="' + (hit ? 'url(#bg1)' : 'rgba(255,181,71,.75)') + '"><title>' + esc(d.l) + ': RM' + fnum(d.v) + (d.t ? ' / target RM' + fnum(d.t) : '') + '</title></rect>';
      s += '<text x="' + (x + w / 2) + '" y="' + (H - 9) + '" fill="#7f9888" font-size="10" text-anchor="middle">' + esc(d.l) + '</text>';
    });
    var tg = data.filter(function (d) { return d.t; });
    if (tg.length) s += '<polyline fill="none" stroke="#ffda7c" stroke-width="2" stroke-dasharray="5 4" points="' + data.map(function (d, i) { return d.t ? (P.l + i * bw + bw / 2) + ',' + y(d.t) : ''; }).filter(Boolean).join(' ') + '"/>';
    s += '</svg><div class="legend"><span><i style="background:#2fe07a"></i>' + esc(o.a || 'Actual') + '</span>' + (tg.length ? '<span><i style="background:#ffda7c"></i>' + esc(o.b || 'Target') + '</span><span><i style="background:#ffb547"></i>Below target</span>' : '') + '</div></div>';
    return s;
  }
  function ring(p, label) {
    var v = Math.max(0, Math.min(100, p || 0)), C = 2 * Math.PI * 40, col = p >= 95 ? '#2fe07a' : p >= 75 ? '#ffb547' : '#ff5d5d';
    return '<div class="ring"><svg viewBox="0 0 96 96" width="96" height="96"><circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="9"/><circle cx="48" cy="48" r="40" fill="none" stroke="' + col + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + (C * v / 100) + ' ' + C + '" transform="rotate(-90 48 48)" style="filter:drop-shadow(0 0 6px ' + col + ')"/></svg><b>' + (p === null || p === undefined ? '—' : Math.round(p) + '%') + '</b></div>' + (label ? '<div class="note" style="text-align:center;margin-top:4px">' + esc(label) + '</div>' : '');
  }
  function spark(vals, col) {
    vals = vals.filter(function (v) { return v !== null && !isNaN(v); }); if (vals.length < 2) return '';
    var W = 220, H = 70, mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals), rg = mx - mn || 1;
    var pts = vals.map(function (v, i) { return (i * W / (vals.length - 1)).toFixed(1) + ',' + (H - 6 - (v - mn) / rg * (H - 14)).toFixed(1); });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" preserveAspectRatio="none"><defs><linearGradient id="sp' + vals.length + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (col || '#2fe07a') + '" stop-opacity=".35"/><stop offset="1" stop-color="' + (col || '#2fe07a') + '" stop-opacity="0"/></linearGradient></defs><polygon points="0,' + H + ' ' + pts.join(' ') + ' ' + W + ',' + H + '" fill="url(#sp' + vals.length + ')"/><polyline points="' + pts.join(' ') + '" fill="none" stroke="' + (col || '#2fe07a') + '" stroke-width="2.4" style="filter:drop-shadow(0 0 5px ' + (col || '#2fe07a') + ')"/></svg>';
  }

  /** Bar mendatar berperingkat (cth. % sasaran setiap cawangan). rows=[{l,v,sub,lamp}], v dalam %. */
  function hbars(rows, o) {
    o = o || {}; var mx = Math.max(o.max || 100, Math.max.apply(null, rows.map(function (r) { return r.v || 0; }))) * 1.05;
    return '<div class="hbars">' + rows.map(function (r, i) {
      var w = Math.max(2, (r.v || 0) / mx * 100), col = r.lamp || (r.v >= (o.good || 100) ? 'g' : r.v >= (o.warn || 80) ? 'y' : 'r');
      return '<div class="hb"><div class="hl"><span class="rk">' + (i + 1) + '</span><b>' + esc(r.l) + '</b>' + (r.sub ? '<small>' + esc(r.sub) + '</small>' : '') + '</div>' +
        '<div class="ht"><i class="' + col + '" style="width:' + w + '%"></i>' + (o.mark ? '<em style="left:' + (o.mark / mx * 100) + '%"></em>' : '') + '</div><span class="hv">' + (r.v === null || r.v === undefined ? '—' : Math.round(r.v) + '%') + '</span></div>';
    }).join('') + '</div>';
  }
  /** Tolok skor 0–100 (separuh bulatan). */
  function gauge(score, label, sub) {
    var v = score === null || score === undefined ? null : Math.max(0, Math.min(100, score)), col = v === null ? '#9fb2a7' : v >= 80 ? '#2fe07a' : v >= 60 ? '#ffb547' : v >= 40 ? '#ff8a3d' : '#ff5d5d';
    var R = 70, C = Math.PI * R, dash = v === null ? 0 : C * v / 100;
    return '<div class="gauge"><svg viewBox="0 0 180 104" width="180" height="104"><path d="M20 94 A70 70 0 0 1 160 94" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="14" stroke-linecap="round"/>' +
      '<path d="M20 94 A70 70 0 0 1 160 94" fill="none" stroke="' + col + '" stroke-width="14" stroke-linecap="round" stroke-dasharray="' + dash + ' ' + C + '" style="filter:drop-shadow(0 0 8px ' + col + ')"/></svg>' +
      '<div class="gv"><b style="color:' + col + '">' + (v === null ? '—' : Math.round(v)) + '</b><small>/100</small></div><div class="gl">' + esc(label || '') + '</div>' + (sub ? '<div class="gs">' + esc(sub) + '</div>' : '') + '</div>';
  }

  /* ======================= API ======================= */
  function rpc(fn, args) {
    return new Promise(function (res, rej) {
      if (!window.google || !google.script) return rej({ error: 'Open FIRAX via the official link (firax.sofwah.my).' });
      var r = google.script.run.withSuccessHandler(function (x) {
        if (x && x.ok) return res(x.data);
        if (x && x.code === 'AUTH' && S.token) { sset(TK, null); S.token = null; dropKept(); renderLogin(x.error); }
        if (x && x.code === 'PINCHANGE' && S.token && S.me) { S.me.mustChange = true; forcePin(); }
        rej(x || { error: 'No response from the server.' });
      }).withFailureHandler(function (e) { rej({ error: (e && e.message) || 'Connection problem. Please try again.' }); });
      r[fn].apply(r, args || []);
    });
  }

  /* ======================= Glossary & guides (for new team members) ======================= */
  /** k: key · n: name · m: regex matching a label/table header · a: meaning · f: formula · s: healthy range (industry practice) · w: owner */
  var GL = [
    { k: 'jualan', n: 'Operational sales', m: /^jualan( operasi| okt| nov| bulan| sehari| 20| minggu)?\b|jualan \(rm\)|jualan 2026/i, a: 'Net sales used for team targets: FeedMe sales less SST, with delivery sales counted at 50% (because the platforms take commission).', f: 'Net sales − SST, delivery × 50%', s: 'Reach ≥ 100% of the monthly target. 🟡 90–99%, 🔴 below 90%.', w: 'BM + Operations Manager' },
    { k: 'sasaran', n: '% of target achieved', m: /% (capai|sasaran)|sasaran 2027/i, a: 'How much of the sales target has been achieved.', f: 'Actual sales ÷ target × 100%', s: 'Sofwah 2027 target: RM10.9 million (about RM30k a day).', w: 'CEO + BM' },
    { k: 'aliran', n: 'Net cash flow', m: /aliran (tunai|bersih)/i, a: 'Money actually received into the bank less money paid out in the period. This is not profit: profit can be positive while cash falls.', f: 'Bank receipts − bank payments', s: 'Positive every month. Negative for 2 consecutive months = warning.', w: 'Finance Manager' },
    { k: 'runway', n: 'Cash runway', m: /runway/i, a: 'How many weeks the company can keep paying operating costs from existing cash if no money comes in.', f: 'Balance of all bank accounts ÷ average weekly opex', s: 'Healthy ≥ 8 weeks (2 months). 🔴 below 2 weeks.', w: 'CEO + Finance Manager' },
    { k: 'baki', n: 'Bank balance', m: /^baki (semua|bank)/i, a: 'Total money in all company bank accounts at the date of the latest statement.', f: 'Opening balance + receipts − payments', s: 'Always above 8 weeks of opex.', w: 'Finance Manager' },
    { k: 'rekon', n: 'Daily reconciliation', m: /rekon|hari 🟢|padan/i, a: 'Matching sales recorded in the POS (FeedMe) to money actually received in the bank, by payment method (QR, card, online).', f: 'Matched days ÷ days with a bank statement', s: 'Sofwah: transactions and reconciliation are updated every Sunday for the previous 7 days; target 100% matched days or a written reason.', w: 'Accounts Staff + BM' },
    { k: 'short', n: 'SHORT / OVER', m: /short|lebih \(|beza \(rm\)|jurang/i, a: 'SHORT: money received in the bank is LESS than sales. OVER: money received is MORE. Usually caused by card settlement timing or QR payments landing in another account.', f: 'Received in bank − expected from POS', s: 'Difference ≤ tolerance (RM50) or a written reason.', w: 'Accounts Staff' },
    { k: 'payout', n: 'Delivery payout', m: /payout|potongan/i, a: 'Money paid by Grab, foodpanda or Shopee to Sofwah after they deduct commission, ads and discounts.', f: 'Platform sales − platform deductions', s: 'Payout reaches the bank on the platform schedule; difference from expected ≤ 3%.', w: 'Delivery Owner + Accounts Staff' },
    { k: 'ketepatan', n: 'Delivery POS accuracy', m: /ketepatan/i, a: 'Is every delivery order keyed into FeedMe? If the POS records less than the portal, sales and SST in reports are understated.', f: 'Delivery sales in POS ÷ sales in platform portal', s: '99% to 101%. Below 97% or above 103% = 🔴.', w: 'Delivery Owner' },
    { k: 'ap', n: 'AP (accounts payable)', m: /\bap\b|belum dibayar|tertunggak|aging|tuntutan/i, a: 'Supplier invoices received but not yet paid. "Overdue" means past the credit terms.', f: 'Total open invoices; age = days since invoice date', s: '≥ 95% of invoices paid within terms; no invoice over 60 days.', w: 'Finance Manager + Accounts Staff' },
    { k: 'pnl', n: 'Profit & Loss (P&L)', m: /p&l|untung (kendalian|bersih|rugi)|untung bulanan/i, a: 'Report of whether the business is profitable: sales less all costs. The FIRAX management P&L follows the date money leaves the bank (cash basis); the official QuickBooks P&L is on an accrual basis.', f: 'Sales − food cost − labour cost − operating costs', s: 'Restaurant net profit is typically 5% to 15% of sales.', w: 'Finance Manager → CEO' },
    { k: 'margin', n: 'Net margin', m: /margin (bersih|kendalian)/i, a: 'How many sen of profit each RM1 of sales leaves after all costs.', f: 'Net profit ÷ sales × 100%', s: 'Restaurants: 5% to 15% (10% is considered good). A figure of 60%+ usually means costs are incomplete.', w: 'CEO' },
    { k: 'food', n: 'Food cost %', m: /food cost|kos bahan|modal \/ plate/i, a: 'Percentage of sales spent on raw ingredients. The largest restaurant cost after wages.', f: 'Food cost ÷ sales × 100%', s: 'Typical restaurant: 28% to 35%. Above 38% = margin under pressure.', w: 'Ops / Chef + Procurement' },
    { k: 'prime', n: 'Prime cost', m: /prime cost/i, a: 'The two largest restaurant costs combined: food + labour. The key cost-control measure in F&B.', f: '(Food cost + labour cost) ÷ sales', s: 'Industry target ≤ 60% to 65% of sales.', w: 'CEO + Ops' },
    { k: 'scor', n: 'SCOR (labour cost ÷ sales)', m: /scor|kos staf/i, a: 'Percentage of sales spent on staff wages and contributions.', f: 'Labour cost (payroll) ÷ sales × 100%', s: 'Typical restaurant: 25% to 35%.', w: 'HR + BM' },
    { k: 'splh', n: 'SPLH', m: /splh/i, a: 'Sales Per Labour Hour: sales generated per staff working hour. A measure of productivity and shift planning.', f: 'Sales ÷ total staff hours worked', s: 'Sofwah target: RM60 per hour. Too high = understaffed (service suffers).', w: 'HR + BM' },
    { k: 'breakeven', n: 'Breakeven', m: /breakeven|pulang modal/i, a: 'Minimum sales to make neither a profit nor a loss. Below breakeven, every day adds to the loss.', f: 'Fixed costs ÷ contribution margin %', s: 'Reach ≥ 120% of breakeven (a safety buffer).', w: 'BM + CEO' },
    { k: 'sumbangan', n: 'Contribution margin', m: /margin sumbangan/i, a: 'What remains of each RM1 of sales after variable costs (ingredients, packaging, card fees) to cover fixed costs.', f: '(Sales − variable costs) ÷ sales', s: 'Higher is better; typical restaurant 55% to 70%.', w: 'Finance' },
    { k: 'tetap', n: 'Fixed vs variable costs', m: /kos (tetap|berubah)/i, a: 'Fixed costs do not change as sales rise or fall (rent, fixed salaries). Variable costs rise with sales (ingredients, packaging).', f: '—', s: '—', w: 'Finance' },
    { k: 'aov', n: 'AOV (average order value)', m: /aov|purata \/ bil/i, a: 'Average ringgit spent per bill.', f: 'Sales ÷ number of bills', s: 'Increase with sets, add-ons and upselling.', w: 'BM + Marketing' },
    { k: 'sst', n: 'SST', m: /\bsst\b/i, a: 'Tax collected from customers on behalf of the government. It is NOT company income and must be paid through SST-02.', f: 'Current SST rate on taxable sales', s: 'Set aside in a savings account every week.', w: 'Finance Manager' },
    { k: 'einvois', n: 'LHDN e-Invoice', m: /e-invois/i, a: 'Electronic invoice submitted to LHDN through MyInvois. Retail (B2C) sales may be consolidated monthly.', f: '—', s: 'Submit the consolidated e-Invoice before the 7th of the following month.', w: 'Accounts Staff' },
    { k: 'kunci', n: 'Balance Sheet', m: /kunci kira|aset|liabiliti|ekuiti/i, a: 'A snapshot at one date: what the company owns (assets), what it owes (liabilities) and the balance belonging to shareholders (equity).', f: 'Assets = Liabilities + Equity', s: 'Current assets ≥ 1.2 × current liabilities.', w: 'Finance Manager' },
    { k: 'akruan', n: 'Cash vs accrual basis', m: /akruan|asas tunai/i, a: 'Cash basis: costs are recognised when money is paid. Accrual (MPERS/MFRS accounting standards): costs are recognised in the month incurred, even if unpaid. Accrual is more accurate for the monthly P&L.', f: '—', s: 'Official reports must be on an accrual basis.', w: 'Finance Manager' },
    { k: 'susut', n: 'Depreciation', m: /susut nilai/i, a: 'The cost of an asset (kitchen, renovation, equipment) spread over its useful life, not expensed at once.', f: 'Asset cost ÷ useful life (years) ÷ 12 per month', s: 'Recorded every month during month-end close.', w: 'Finance Manager' },
    { k: 'tutup', n: 'Month-end close', m: /tutup buku/i, a: 'The month-end process to ensure all transactions are complete, correct and locked before reports are issued.', f: 'Working days from month end until the books are locked', s: 'Best practice: 3 to 5 working days.', w: 'Finance Manager' },
    { k: 'payback', n: 'Payback & ROI', m: /payback|roi/i, a: 'Payback: months needed to recover the investment. ROI: annual return relative to the investment.', f: 'Payback = investment ÷ monthly profit · ROI = annual profit ÷ investment', s: 'F&B branch: payback ≤ 24 months is considered good.', w: 'CEO + Board of Advisors' },
    { k: 'void', n: 'Voids & manual discounts', m: /void|diskaun manual|tukar (kaedah )?bayaran/i, a: 'Bills cancelled or discounted manually. A key control to prevent misuse.', f: 'Void value ÷ sales', s: 'Below 0.5% of sales.', w: 'BM + Finance' },
    { k: 'kpi', n: 'Status lamp', m: /^lampu|^status$/i, a: '🟢 Healthy · 🟡 Watch · 🔴 Act now · ⚪ Awaiting data or a decision (NOT poor performance).', f: '—', s: '—', w: '—' },
    { k: 'skor', n: 'Financial Health Score', m: /skor kesihatan/i, a: 'Combines the 10 FIRAX KPIs into one number from 0 to 100. Only KPIs with complete data are counted.', f: 'KPI average: 🟢 = 100, 🟡 = 60, 🔴 = 20 (⚪ not counted)', s: '80+ healthy · 60–79 stable · 40–59 needs attention · below 40 critical.', w: 'CEO' },
    { k: 'yakin', n: 'Data confidence', m: /keyakinan data/i, a: 'Percentage of KPIs with complete data. A low score means decisions still rest on estimates.', f: 'KPIs with a 🟢🟡🔴 lamp ÷ 10 KPIs', s: 'Target ≥ 90%.', w: 'Finance Manager' }
  ];
  var GLK = {}; GL.forEach(function (g) { GLK[g.k] = g; });
  function termFor(label) { label = String(label || ''); if (!label || label.length > 70) return null; for (var i = 0; i < GL.length; i++) if (GL[i].m.test(label)) return GL[i]; return null; }
  function helpBtn(label, key) { var g = key ? GLK[key] : termFor(label); return g ? '<button class="hlp" data-act="help" data-k="' + g.k + '" aria-label="What does ' + esc(g.n) + ' mean" title="What does this mean?">?</button>' : ''; }
  function glossHtml(g) {
    return '<div class="gl-i"><div class="kicker">FIRAX Glossary</div><h3 style="margin:6px 0 12px">' + esc(g.n) + '</h3>' +
      '<div class="gl-row"><b>Meaning</b><p>' + esc(g.a) + '</p></div>' +
      (g.f !== '—' ? '<div class="gl-row"><b>Formula</b><p class="mono">' + esc(g.f) + '</p></div>' : '') +
      (g.s !== '—' ? '<div class="gl-row ok"><b>Healthy range</b><p>' + esc(g.s) + '</p></div>' : '') +
      (g.w !== '—' ? '<div class="gl-row"><b>Owner</b><p>' + esc(g.w) + '</p></div>' : '') + '</div>';
  }
  A.help = function (el) { var g = GLK[el.getAttribute('data-k')]; if (g) modal(glossHtml(g) + '<div class="row-btn"><button class="btn sm" data-act="nav" data-p="guide">Open full glossary</button><button class="btn pri sm" data-act="closeModal">Got it</button></div>'); };

  /** Short guide for each module: what the page is, the key number, what to do. */
  var MG = {
    'M1 Nadi Tunai': ['How much money the company has in the bank now and how long it will last.', 'Cash runway (weeks) and net cash flow this month.', 'If ⚪: upload the bank statement and enter the account opening balance. If 🔴: plan a fund transfer or defer non-critical payments.'],
    'M9 Bajet & Ramalan': ['Monthly sales against target, and the 2027 target by branch.', '% of target achieved and change from last month.', 'Months below 90% of target: request an action plan from that branch\'s BM.'],
    'M2 Rekon Harian': ['Whether each day\'s sales actually reached the bank.', '🔴 SHORT days without a note and ⚪ days with no statement.', 'Accounts Staff record a reason for every 🔴 day and upload any missing statements.'],
    'M3 Payout Delivery': ['Whether Grab, foodpanda and Shopee pay correctly, and whether the POS records every order.', 'POS accuracy (target 99%) and payout gap.', 'Delivery Owner ensures every order is keyed into FeedMe and audits payouts every Monday.'],
    'M5 P&L Cawangan': ['Profit or loss for each branch this month (cash basis).', 'Net margin and lamp. ⚪ means costs are incomplete; do not decide yet.', 'Complete bank payment categories and payroll before the P&L is presented.'],
    'M7 Food Cost': ['Food cost against sales, and which menu items make or lose money.', 'Food cost % (industry 28% to 35%) and menu items not yet costed.', 'Enter the cost per plate for the 20 best-selling items first.'],
    'M8 Tenaga Kerja': ['Labour cost and productivity for each branch and time slot.', 'SPLH (target RM60) and 🔴 understaffed slots.', 'HR + BM move staff from overstaffed to understaffed slots before hiring.'],
    'M4 AP & Opex': ['Unpaid supplier invoices and their age.', 'Overdue amounts and invoices over 60 days.', 'Review new invoices daily; pay in the Sunday & Wednesday (suppliers) and Tuesday (HR) runs on the Payments page.'],
    'M13 QB Kewangan': ['Official P&L and Balance Sheet from QuickBooks, with the auditor\'s assessment.', 'QB net profit against the auditor-adjusted figure.', 'FM completes adjustments before reports are used for the bank or LHDN.'],
    'M14 Audit Pendapatan': ['Comparison of FeedMe (POS) sales with QuickBooks records, and the list of audit findings.', '🔴 findings and revenue gaps.', 'Resolve 🔴 findings one by one and record the evidence.'],
    'M6 Breakeven': ['Minimum sales for each branch to avoid a loss.', '% of breakeven achieved (target ≥ 120%). ⚪ means cost inputs are incomplete.', 'Finance confirms fixed costs F01–F12 against actual bills.'],
    'M12 Expansion Lab': ['New-branch simulation: profit, payback and ROI in 3 scenarios.', 'Worst-case payback (target ≤ 24 months).', 'Replace all SAMPLE values with actual quotations before presenting.'],
    'M10 Kawalan & Audit': ['Daily data-integrity and internal-control checks.', '🔴 checks and the 5-transaction spot test.', 'Resolve 🔴 checks and run the spot test every day.'],
    'M11 Cukai': ['Monthly SST, e-Invoice and contribution deadlines.', 'Unpaid SST and the nearest deadline.', 'Set aside SST every week; pay contributions before the 15th.'],
    'KPI': ['Scorecard of the 10 key financial KPIs with targets.', '🔴 KPIs and ⚪ KPIs (data incomplete).', 'Every 🔴 KPI must have an action on the Action page.'],
    'Live': ['Data freshness, 7-day sales and anomaly detection.', 'Oldest data (days) and days flagged ⚠.', 'Data over 1 day old: notify the source owner.'],
    'Tetapan': ['Thresholds, targets and owners used by FIRAX.', 'Yellow cells = editable inputs.', 'Only the CEO / Finance Manager change values in the Sheets file.']
  };
  function guideBox(name) {
    var g = MG[name]; if (!g) return '';
    return '<details class="guide" open><summary>' + ic('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>') + 'How to read this page</summary><div class="gd">' +
      '<div><b>What this page shows</b><p>' + esc(g[0]) + '</p></div><div><b>Check these numbers first</b><p>' + esc(g[1]) + '</p></div><div class="do"><b>What to do</b><p>' + esc(g[2]) + '</p></div></div></details>';
  }

  /* ======================= log masuk ======================= */
  function loginShell(right) {
    return '<div class="login"><div class="lg-brand"><div class="hero-art">' + heroArt('lg') + '</div>' +
      '<div><div style="display:flex;align-items:center;gap:12px"><div class="mark" style="width:54px;height:54px;margin:0">' + MARK + '</div><div class="note" style="letter-spacing:.16em;font-size:10.5px;text-transform:uppercase">Sofwah Arabic Grill · Finance</div></div>' +
      '<div class="big">FIRA<i>X</i></div><div class="exp">Financial Intelligence, Risk & Analytics eXecutive</div>' +
      '<div class="tag"><span>Financial Clarity.</span><span>Intelligent Decisions.</span><span>Profitable Growth.</span></div></div>' +
      '<div class="foot">SOFWAH ARABIATA (M) SDN. BHD.</div></div>' +
      '<div class="lg-form"><div class="glass lg-card">' + right + '</div></div></div>';
  }
  function renderLogin(msg) {
    S.token = null; closeModal();
    app.innerHTML = loginShell('<div class="kicker">Sign in</div><h2 style="margin-top:6px">Welcome 👋</h2><p class="note" style="margin:4px 0 12px">Choose your name, then enter your 4-digit PIN.</p><input class="inp" id="lq" placeholder="Search name" autocomplete="off"><div class="ulist" id="ll"><div class="skel" style="height:60px"></div><div class="skel" style="height:60px"></div></div>' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '<p class="note" style="margin-top:auto;padding-top:14px">New account or forgot your PIN? Ask the CEO for an <b>activation code</b>. Your PIN is never shown or sent to anyone.</p>');
    rpc('fxLoginList', []).then(function (L) {
      S.users = L;
      var draw = function (q) {
        q = (q || '').toLowerCase();
        var list = L.filter(function (u) { return !q || (u.name + ' ' + u.jawatan + ' ' + u.roleLabel).toLowerCase().indexOf(q) >= 0; });
        $('#ll').innerHTML = list.length ? list.map(function (u) { return '<button class="uitem" data-act="pick" data-id="' + esc(u.id) + '"><span class="av">' + esc(ini(u.name)) + '</span><span class="t"><b>' + esc(u.name) + '</b><small>' + esc(u.jawatan || u.roleLabel) + '</small></span>' + (u.needsCode ? '<span class="chip y">Activate</span>' : '<span class="chip g">' + esc(u.role) + '</span>') + '</button>'; }).join('') : '<div class="empty"><b>No matching names</b></div>';
      };
      draw(''); $('#lq').oninput = function () { draw(this.value); };
    }).catch(function (e) { $('#ll').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  }
  A.pick = function (el) { var u = S.users.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (u.needsCode) activation(u); else pinPad(u); };
  function who(u) { return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button class="iconbtn" data-act="back" aria-label="Back">' + ic('<path d="m15 18-6-6 6-6"/>') + '</button><span class="av">' + esc(ini(u.name)) + '</span><div><b>' + esc(u.name) + '</b><div class="note">' + esc(u.roleLabel) + '</div></div></div>'; }
  function pinPad(u, msg) {
    S.pu = u; S.pin = '';
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'kod', 0, 'del'].map(function (k) { return '<button class="' + (typeof k === 'string' ? 'fn' : '') + '" data-act="key" data-k="' + k + '" aria-label="' + (k === 'del' ? 'Delete' : k === 'kod' ? 'Use activation code' : k) + '">' + (k === 'del' ? '⌫' : k === 'kod' ? 'Code' : k) + '</button>'; }).join('');
    app.innerHTML = loginShell(who(u) + '<p class="note" style="text-align:center;margin-top:14px">Enter your 4-digit PIN</p><div class="pinbox" id="dots"><i></i><i></i><i></i><i></i></div><div class="pinpad">' + keys + '</div><div id="pmsg">' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '</div><input type="password" inputmode="numeric" maxlength="4" class="sr" id="pinkb" aria-label="PIN" autocomplete="off">');
    var kb = $('#pinkb'); if (window.innerWidth > 900) kb.focus();
    kb.oninput = function () { S.pin = kb.value.replace(/\D/g, '').slice(0, 4); dots(); if (S.pin.length === 4) submitPin(); };
  }
  function dots() { $$('#dots i').forEach(function (d, i) { d.className = i < S.pin.length ? 'on' : ''; }); }
  A.key = function (el) {
    var k = el.getAttribute('data-k');
    if (k === 'kod') return activation(S.pu);
    if (k === 'del') S.pin = S.pin.slice(0, -1); else if (S.pin.length < 4) S.pin += k;
    dots(); if (S.pin.length === 4) submitPin();
  };
  A.back = function () { if (S.token) { rpc('fxLogout', [S.token]).catch(function () {}); sset(TK, null); } dropKept(); S.token = null; S.home = null; S.pages = {}; S.acts = null; S.rt = null; S.pay = null; S.soa = null; S.payT = null; S.recon = null; renderLogin(); };
  A.logout = A.back;
  function submitPin() {
    var pin = S.pin; S.pin = ''; $$('.pinpad button').forEach(function (b) { b.disabled = true; });
    rpc('fxLogin', [S.pu.id, pin]).then(function (r) { start(r.token, r.me); }).catch(function (e) {
      if (e.code === 'NEEDCODE') return activation(S.pu, e.error);
      $('#dots').classList.add('shake'); setTimeout(function () { pinPad(S.pu, e.error); }, 380);
    });
  }
  function activation(u, msg) {
    S.pu = u;
    app.innerHTML = loginShell(who(u) + '<h3 style="margin-top:12px">Activate account</h3><p class="note">Enter the 8-character activation code from the CEO, then choose your own 4-digit PIN. The code can only be used once.</p>' +
      '<div style="display:grid;gap:4px;margin-top:10px">' + field('Activation code', '<input class="inp" id="ac" placeholder="XXXX-XXXX" maxlength="9" autocomplete="off" style="text-transform:uppercase;letter-spacing:.2em">') +
      field('New PIN (4 digits)', '<input class="inp" id="ap1" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') + field('Confirm PIN', '<input class="inp" id="ap2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') +
      '<button class="btn pri" style="justify-content:center" data-act="doActivate">Activate & sign in</button></div><div id="amsg">' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '</div>');
  }
  A.doActivate = function (el) {
    var c = val('ac'), a = val('ap1'), b = val('ap2');
    if (a !== b) { $('#amsg').innerHTML = '<div class="err">PINs do not match.</div>'; return; }
    el.disabled = true;
    rpc('fxActivate', [S.pu.id, c, a]).then(function (r) { toast('Account activated. Welcome!'); start(r.token, r.me); }).catch(function (e) { el.disabled = false; $('#amsg').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  /** PIN ditetapkan admin wajib ditukar sebelum FIRAX dibuka. */
  function forcePin(msg) {
    var me = S.me;
    app.innerHTML = loginShell(who({ name: me.name, roleLabel: me.roleLabel }) + '<h3 style="margin-top:12px">Choose your own PIN</h3><p class="note">Your current PIN was set by an admin. Choose a new 4-digit PIN that only you know.</p>' +
      '<div style="display:grid;gap:4px;margin-top:10px">' + field('Current PIN (from admin)', '<input class="inp" id="fp0" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password">') +
      field('New PIN (4 digits)', '<input class="inp" id="fp1" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') + field('Confirm new PIN', '<input class="inp" id="fp2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') +
      '<button class="btn pri" style="justify-content:center" data-act="doForcePin">Save PIN & continue</button></div><div id="fmsg">' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '</div>');
  }
  A.doForcePin = function (el) {
    var a = val('fp0'), b = val('fp1'), c = val('fp2');
    if (b !== c) { $('#fmsg').innerHTML = '<div class="err">New PINs do not match.</div>'; return; }
    el.disabled = true;
    rpc('fxChangePin', [S.token, a, b]).then(function (r) { toast('PIN saved. Welcome!'); delete S.me.mustChange; start(r.token, S.me); })
      .catch(function (e) { el.disabled = false; $('#fmsg').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  function start(token, me, boot) {
    S.token = token; S.me = me; sset(TK, token);
    if (me && me.mustChange) return forcePin();
    hydrate();
    var fresh = !!(boot && boot.home); if (fresh) { S.home = boot.home; keep('home', boot.home); }
    var p = window.FX_PAGE || sget('firax.p') || homePage(); if (!PG[p] || !canSee(p)) p = homePage();
    go(p);
    setTimeout(function () { if (!(fresh && p === 'home')) revalidate(); setTimeout(prefetch, 1200); }, 400);
  }

  /* ======================= rangka app ======================= */
  var I = {
    home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    cash: '<rect x="2.5" y="6" width="19" height="13" rx="3"/><path d="M2.5 10h19"/><circle cx="16.5" cy="14.5" r="1.6"/>',
    sales: '<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/>',
    profit: '<path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/>',
    books: '<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M8 8h7M8 12h7"/>',
    actions: '<path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    planning: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    control: '<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    live: '<path d="M2 12h4l3-7 4 14 3-7h6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', out: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17-5-5 5-5"/><path d="M5 12h12"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>', bank: '<path d="M3 10 12 4l9 6"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    tax: '<path d="M7 17 17 7"/><circle cx="8" cy="8" r="2"/><circle cx="16" cy="16" r="2"/>', bill: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'
  };
  I.routine = '<path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/>';
  I.guide = '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>';
  I.print = '<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>';
  I.recon = '<path d="M4 8h14l-3-3"/><path d="M20 16H6l3 3"/>';
  I.search = '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>';
  I.more = '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>';
  /* Struktur v2.1: ikut KERJA pengguna, bukan ikut modul sheet. Bahasa mudah; kod M1–M14 hanya dalam tab. */
  var PG = {
    home: { t: 'Overview', i: 'home', sub: "Sofwah's finances in 30 seconds", q: 'Are our finances healthy today?' },
    routine: { t: 'My Tasks', i: 'routine', sub: 'Daily, weekly & monthly checklists · step by step', q: 'What do I need to do today?' , task: 1 },
    actions: { t: 'Alerts', i: 'actions', sub: '🔴 issues to resolve · who, when, how', q: "What's wrong and who's handling it?" },
    pay: { t: 'Payments', i: 'bank', sub: 'Pay dates set automatically from supplier terms · Sun & Wed suppliers · Tue staff', q: 'Who needs to be paid today?' , task: 1 },
    soa: { t: 'Suppliers', i: 'bill', sub: 'Statement of account per supplier · balance owed, AP aging, purchases & pricing', q: 'How much do we owe and buy from this supplier?' , task: 1 },
    cash: { t: 'Cash', i: 'cash', sub: 'Bank balances, cash flow and cash runway', q: 'Do we have enough cash?' },
    recon: { t: 'Reconciliation', i: 'recon', sub: 'Weekly: bank statement → match POS sales → explain differences', task: 1 },
    sales: { t: 'Sales & Payouts', i: 'sales', sub: 'Sales by branch, reconciliation report, delivery payouts', q: 'Did all sales reach the bank?' },
    profit: { t: 'Profit & Costs', i: 'profit', sub: 'Profit by branch, food cost, labour cost, AP & opex', q: 'Which branches make a profit, which costs are high?' },
    books: { t: 'Books & Audit', i: 'books', sub: 'QuickBooks P&L and balance sheet · audit findings', q: 'Are our books clean for audit?' },
    planning: { t: 'Planning', i: 'planning', sub: 'Breakeven, budget, forecast and new branches', q: 'How much do we need to sell to make a profit?' },
    control: { t: 'Controls & Tax', i: 'control', sub: 'Internal controls, SST, e-Invoice and 10 KPIs', q: 'Are we compliant and in control?' },
    live: { t: 'Data Status', i: 'live', sub: 'When each data source was last updated · sales anomalies', q: 'Is this data up to date?' },
    guide: { t: 'Guide', i: 'guide', sub: 'Glossary, healthy industry ranges and how to use FIRAX', q: 'What does this term mean?' },
    settings: { t: 'Settings', i: 'settings', sub: 'Users, PINs, thresholds and data sources', ceo: true }
  };
  /** Kumpulan menu ikut peranan: staf akaun nampak kerja dahulu; CEO/FM nampak ringkasan & laporan dahulu. */
  function navGroups() {
    var work = ["Today's work", ['routine', 'recon', 'pay', 'soa', 'actions']], rep = ['Financial reports', ['cash', 'sales', 'profit', 'books', 'planning', 'control']], sys = ['Help', ['live', 'guide', 'settings']];
    var r = S.me && S.me.role;
    if (r === 'ACC') return [work, ['Overview', ['home']], rep, sys];
    if (r === 'BM' || r === 'VIEW') return [['', ['home', 'actions']], rep, ['Suppliers', ['soa']], sys];
    return [['', ['home']], work, rep, sys];
  }
  function homePage() { return S.me && S.me.role === 'ACC' ? 'routine' : 'home'; }
  function badgeFor(k) {
    var red = S.home && S.home.actions && S.home.actions.counts ? num(S.home.actions.counts.r) : 0, rt = S.rt && S.rt.prog ? S.rt.prog.H : null, py = S.payT;
    if (k === 'actions' && red) return '<span class="cnt">' + red + '</span>';
    if (k === 'routine' && rt && rt.done < rt.all) return '<span class="cnt y">' + (rt.all - rt.done) + '</span>';
    if (k === 'pay' && py && py.left) return '<span class="cnt g">' + py.left + '</span>';
    return '';
  }
  function canSee(k) { return PG[k] && (!PG[k].ceo || S.me.role === 'CEO' || S.me.role === 'FM') && !((k === 'pay' || k === 'recon') && !S.me.canEdit && S.me.role !== 'CEO'); }
  function navHtml() {
    return navGroups().map(function (g) {
      var items = g[1].filter(canSee).map(function (k) {
        return '<button class="' + (S.page === k ? 'on' : '') + '" data-act="nav" data-p="' + k + '">' + ic(I[PG[k].i]) + '<span>' + PG[k].t + '</span>' + badgeFor(k) + '</button>';
      }).join('');
      return items ? (g[0] ? '<div class="navh">' + g[0] + '</div>' : '') + items : '';
    }).join('');
  }
  /** Bar bawah (telefon): 4 halaman paling kerap + Menu. */
  function tabbarHtml() {
    var r = S.me && S.me.role, list = r === 'ACC' ? ['routine', 'recon', 'pay', 'soa'] : r === 'BM' || r === 'VIEW' ? ['home', 'actions', 'sales', 'profit'] : ['home', 'routine', 'pay', 'soa'];
    return '<nav class="tabbar">' + list.filter(canSee).map(function (k) { return '<button class="' + (S.page === k ? 'on' : '') + '" data-act="nav" data-p="' + k + '">' + ic(I[PG[k].i]) + '<span>' + PG[k].t + '</span>' + badgeFor(k) + '</button>'; }).join('') +
      '<button data-act="openSide">' + ic(I.menu) + '<span>Menu</span></button></nav>';
  }
  function refreshNav() { var s = $('#side'); if (s) $('.nav', s).innerHTML = navHtml(); var t = $('.tabbar'); if (t) t.outerHTML = tabbarHtml(); }
  function sideCard() {
    var h = S.home; if (!h || !h.live) return '';
    var l = h.live;
    return '<div class="side-card"><b>' + dot(l.status) + ' &nbsp;' + esc(en(unemo(l.status)) || 'Status') + '</b><small>Data sources · ' + esc(l.sources || '—') + ' connected</small>' +
      '<div class="row"><span class="muted">Oldest data</span><b>' + esc(String(l.oldest || '—').replace(/hari/, 'days')) + '</b></div><div class="row"><span class="muted">Action 🔴</span><b style="color:#ff8b8b">' + esc(l.red || '0') + '</b></div></div>';
  }
  function layout(inner) {
    var p = PG[S.page], live = S.home && S.home.live;
    app.innerHTML = '<div class="app"><aside class="side glass" id="side"><div class="brand"><div class="mark">' + MARK + '</div><div><b>FIRAX</b><small>Financial Intelligence, Risk &amp; Analytics eXecutive</small></div></div>' +
      '<nav class="nav">' + navHtml() + '</nav>' + sideCard() + '</aside><div class="scrim" id="scrim" data-act="closeSide"></div>' +
      '<main class="main"><header class="top glass"><button class="iconbtn burger" data-act="openSide" aria-label="Menu">' + ic(I.menu) + '</button>' +
      '<div class="grow"><h1>' + esc(p.t) + '</h1><div class="sub">' + esc(p.sub) + '</div></div>' +
      '<button class="pill srch" data-act="search" title="Search pages or suppliers ( / )">' + ic(I.search).replace('<svg', '<svg width="15" height="15"') + '<span class="hide-m">Search…</span><kbd class="hide-m">/</kbd></button>' +
      (live ? '<span class="pill live hide-m">' + dot(live.status) + esc(en(unemo(live.status)) || 'Live') + '</span>' : '') +
      '<button class="pill hide-m" data-act="refresh" title="Refresh data from the sheet">' + ic(I.refresh).replace('<svg', '<svg width="15" height="15"') + 'Refresh</button>' +
      '<button class="pill hide-m" data-act="print" title="Print / save this page as PDF">' + ic(I.print).replace('<svg', '<svg width="15" height="15"') + 'Print</button>' +
      '<button class="user" data-act="userMenu"><span class="av">' + esc(ini(S.me.name)) + '</span><b>' + esc(S.me.name) + '</b>' + ic(I.arrow).replace('<svg', '<svg width="14" height="14" style="transform:rotate(90deg)"') + '</button></header>' +
      '<div class="printh"><b>SOFWAH FIRAX</b> · ' + esc(p.t) + ' · printed ' + esc(new Date().toLocaleDateString('en-MY')) + ' by ' + esc(S.me.name) + '</div>' +
      (p.q && !p.task ? '<div class="pageq">' + ic(I.guide).replace('<svg', '<svg width="14" height="14"') + 'This page answers: <b>' + esc(p.q) + '</b></div>' : '') +
      '<div id="view" class="stack">' + (inner || '<div class="skel" style="height:300px"></div><div class="skel" style="height:220px"></div>') + '</div></main>' + tabbarHtml() + '</div>';
  }
  function go(p, quiet) {
    if (!PG[p] || !canSee(p)) p = homePage(); S.page = p; sset('firax.p', p); closeModal();
    var R = { home: renderHome, actions: renderActions, settings: renderSettings, routine: renderRoutine, guide: renderGuide, pay: renderPay, soa: renderSoa, recon: renderRecon }[p] || renderModule;
    if (quiet && $('#view')) { var y = window.scrollY; R(); setTimeout(function () { window.scrollTo(0, y); }, 30); return; }
    layout(); window.scrollTo(0, 0);
    R();
  }
  A.nav = function (el) { go(el.getAttribute('data-p')); };
  A.openSide = function () { $('#side').classList.add('open'); $('#scrim').classList.add('open'); };
  A.closeSide = function () { var s = $('#side'); if (s) s.classList.remove('open'); var c = $('#scrim'); if (c) c.classList.remove('open'); };
  A.refresh = function (el) {
    if (el) el.disabled = true; toast('Refreshing from the FIRAX sheet…');
    rpc('fxRefresh', [S.token]).then(function () { dropKept(); S.home = null; S.pages = {}; S.acts = null; S.rt = null; S.pay = null; S.soa = null; S.recon = null; return rpc('fxHome', [S.token]); })
      .then(function (h) { S.home = h; keep('home', h); go(S.page); toast('Data updated'); prefetch(); }).catch(function (e) { toast(e.error, true); if (el) el.disabled = false; });
  };
  A.userMenu = function () {
    modal('<div style="display:flex;gap:12px;align-items:center"><span class="av">' + esc(ini(S.me.name)) + '</span><div><b>' + esc(S.me.name) + '</b><div class="note">' + esc(S.me.roleLabel) + '</div></div></div>' +
      '<div class="note" style="margin:14px 0">FIRAX v' + esc(S.version || '') + ' · data read directly from the <b>Sofwah FIRAX 2027</b> spreadsheet. The Guide & Glossary explain every term.</div>' +
      '<div class="row-btn"><button class="btn" data-act="changePin">Change PIN</button><button class="btn" data-act="logout">' + ic(I.out) + 'Sign out</button></div>');
  };
  A.changePin = function () {
    modal('<h3>Change PIN</h3><div style="margin-top:12px">' + field('Current PIN', '<input id="c0" type="password" inputmode="numeric" maxlength="4">') + field('New PIN', '<input id="c1" type="password" inputmode="numeric" maxlength="4">') + field('Confirm new PIN', '<input id="c2" type="password" inputmode="numeric" maxlength="4">') +
      '</div><div id="cm"></div><div class="row-btn"><button class="btn" data-act="closeModal">Cancel</button><button class="btn pri" data-act="doChangePin">Save</button></div>');
  };
  A.closeModal = closeModal;
  A.doChangePin = function (el) {
    if (val('c1') !== val('c2')) { $('#cm').innerHTML = '<div class="err">New PINs do not match.</div>'; return; }
    el.disabled = true;
    rpc('fxChangePin', [S.token, val('c0'), val('c1')]).then(function (r) { S.token = r.token; sset(TK, r.token); closeModal(); toast('PIN changed'); }).catch(function (e) { el.disabled = false; $('#cm').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  function view(html) { var v = $('#view'); if (v) v.innerHTML = html; }
  function fail(e) { view('<div class="glass pad"><div class="err">' + esc((e && e.error) || 'Failed to load.') + '</div><div class="row-btn" style="justify-content:flex-start"><button class="btn" data-act="refresh">' + ic(I.refresh) + 'Try again</button></div></div>'); }
  function needHome() { return S.home ? Promise.resolve(S.home) : rpc('fxHome', [S.token]).then(function (h) { S.home = h; keep('home', h); return h; }); }
  function needRt() { return S.rt ? Promise.resolve(S.rt) : rpc('fxRoutine', [S.token]).then(function (r) { S.rt = r; keep('rt', r); return r; }); }

  /* ======================= LAJU: simpan sesi + pra-muat ======================= *
   * 1) Setiap data yang dimuat disimpan dalam sessionStorage tab ini (hilang bila tab ditutup / log keluar),
   *    jadi muat semula halaman terus papar tanpa menunggu pelayan.
   * 2) Selepas log masuk, halaman lain dipra-muat satu demi satu semasa pengguna membaca — klik seterusnya serta-merta.
   * 3) Data lama disegarkan di latar; halaman dilukis semula hanya jika data berubah. */
  var CK = 'fxc:';
  function keep(k, v) { try { sessionStorage.setItem(CK + k, JSON.stringify(v)); } catch (e) {} }
  function kept(k) { try { var v = sessionStorage.getItem(CK + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function dropKept() { try { Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf(CK) === 0) sessionStorage.removeItem(k); }); } catch (e) {} }
  function hydrate() {
    if (!S.home) S.home = kept('home'); if (!S.rt) S.rt = kept('rt'); if (!S.acts) S.acts = kept('acts');
    Object.keys(FXPAGES).forEach(function (k) { if (!S.pages[k]) { var d = kept('pg:' + k); if (d) S.pages[k] = d; } });
    S.payT = kept('payT');
  }
  var FXPAGES = { cash: 1, sales: 1, profit: 1, books: 1, planning: 1, control: 1, live: 1 };
  /** Segar semula halaman semasa di latar (stale-while-revalidate). */
  function revalidate() {
    var p = S.page, done = function () { if (S.page === p) go(p, true); refreshNav(); };
    var cur = p === 'home' || p === 'guide' ? rpc('fxHome', [S.token]).then(function (h) { var ch = JSON.stringify(h) !== JSON.stringify(S.home); S.home = h; keep('home', h); return ch; })
      : FXPAGES[p] ? rpc('fxPage', [S.token, p]).then(function (d) { var ch = JSON.stringify(d) !== JSON.stringify(S.pages[p]); S.pages[p] = d; keep('pg:' + p, d); return ch; })
      : p === 'routine' ? rpc('fxRoutine', [S.token]).then(function (r) { var ch = JSON.stringify(r) !== JSON.stringify(S.rt); S.rt = r; keep('rt', r); return ch; })
      : p === 'actions' ? rpc('fxActions', [S.token]).then(function (a) { var ch = JSON.stringify(a) !== JSON.stringify(S.acts); S.acts = a; keep('acts', a); return ch; }) : null;
    if (cur) cur.then(function (ch) { if (ch) done(); }).catch(function () {});
  }
  /** Pra-muat halaman yang belum dimuat, satu demi satu (tidak membebankan pelayan). */
  function prefetch() {
    var q = [];
    if (!S.rt) q.push(function () { return rpc('fxRoutine', [S.token]).then(function (r) { S.rt = r; keep('rt', r); refreshNav(); }); });
    if (S.me.canEdit || S.me.role === 'CEO') q.push(function () { return rpc('fxPay', [S.token, '']).then(function (r) { S.pay = r; S.payD = r.ymd; S.payT = { left: r.sum.n - r.sum.nPaid, due: r.sum.due - r.sum.paid, day: r.day, ymd: r.ymd, wait: r.wait.n, waitAmt: r.wait.amt }; keep('payT', S.payT); refreshNav(); var td = $('.tdays'); if (td && S.home) td.outerHTML = todayStrip(S.home); }); });
    if (canSee('recon') && !S.recon) q.push(function () { return rpc('fxRecon', [S.token]).then(function (r) { S.recon = r; keep('recon', r); }); });
    if (!S.acts) q.push(function () { return rpc('fxActions', [S.token]).then(function (a) { S.acts = a; keep('acts', a); }); });
    Object.keys(FXPAGES).forEach(function (k) { if (!S.pages[k] && canSee(k)) q.push(function () { return rpc('fxPage', [S.token, k]).then(function (d) { S.pages[k] = d; keep('pg:' + k, d); }); }); });
    (function next() { var f = q.shift(); if (!f || !S.token) return; setTimeout(function () { f().catch(function () {}).then(next); }, 250); })();
  }

  /* ======================= Cari (halaman + supplier) ======================= */
  A.search = function () {
    modal('<div class="srchbox">' + ic(I.search) + '<input id="sq" placeholder="Search pages, suppliers or terms… (e.g. cash, KTF, food cost)" autocomplete="off"></div><div id="sr" class="srres"></div><div class="note" style="margin-top:8px">↑ ↓ select · Enter open · Esc close</div>');
    var inp = $('#sq'); inp.focus(); S.si = 0;
    var vend = S.soa && S.soa.vendors ? S.soa.vendors : kept('vendors');
    if (!vend && canSee('soa')) rpc('fxSoa', [S.token, '', '', '']).then(function (r) { S.soa = r; keep('vendors', r.vendors); vend = r.vendors; draw(); }).catch(function () {});
    function items() {
      var q = inp.value.trim().toLowerCase(), out = [];
      Object.keys(PG).filter(canSee).forEach(function (k) { var p = PG[k], hay = (p.t + ' ' + p.sub + ' ' + (p.q || '')).toLowerCase(); if (!q || hay.indexOf(q) >= 0) out.push({ t: 'p', k: k, l: p.t, s: p.q || p.sub }); });
      if (q && vend) vend.filter(function (v) { return (v.key + ' ' + v.short + ' ' + v.kod).toLowerCase().indexOf(q) >= 0; }).slice(0, 8).forEach(function (v) { out.push({ t: 'v', k: v.key, l: v.short, s: 'Supplier · ' + (v.out ? 'owed RM' + fnum(v.out, 2) : 'nothing owed') }); });
      if (q && typeof GL !== 'undefined') GL.filter(function (g) { return (g.n + ' ' + g.a).toLowerCase().indexOf(q) >= 0; }).slice(0, 4).forEach(function (g) { out.push({ t: 'g', k: g.k, l: g.n, s: 'Term · ' + g.a.slice(0, 80) }); });
      return out.slice(0, 14);
    }
    function draw() {
      var it = items(); S.sItems = it; if (S.si >= it.length) S.si = 0;
      $('#sr').innerHTML = it.length ? it.map(function (x, i) { return '<button class="sri' + (i === S.si ? ' on' : '') + '" data-act="searchGo" data-i="' + i + '"><span class="tag ' + x.t + '">' + (x.t === 'p' ? 'Page' : x.t === 'v' ? 'Supplier' : 'Term') + '</span><b>' + esc(x.l) + '</b><small>' + esc(x.s) + '</small></button>'; }).join('') : '<div class="empty">No matches</div>';
    }
    inp.oninput = function () { S.si = 0; draw(); };
    inp.onkeydown = function (e) { if (e.key === 'ArrowDown') { S.si = Math.min(S.si + 1, S.sItems.length - 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { S.si = Math.max(S.si - 1, 0); draw(); e.preventDefault(); } else if (e.key === 'Enter') { A.searchGo(null, S.si); } };
    draw();
  };
  A.searchGo = function (el, idx) {
    var x = S.sItems[el ? +el.getAttribute('data-i') : idx]; if (!x) return; closeModal();
    if (x.t === 'p') go(x.k);
    else if (x.t === 'v') { S.soaQ = { sup: x.k, from: '', to: '', p: 'ytd' }; go('soa'); }
    else { S.gq = x.l; go('guide'); }
  };
  document.addEventListener('keydown', function (e) { if (e.key === '/' && S.token && !e.target.closest('input,textarea,select') && !$('#ov')) { e.preventDefault(); A.search(); } });
  A.print = function () { document.body.setAttribute('data-print', new Date().toLocaleString('en-MY')); window.print(); };

  /* ======================= Utama (Home) ======================= */
  function renderHome() {
    needHome().then(function (h) { var s = $('#side'); if (s) { $('.nav', s).innerHTML = navHtml(); } homeView(h); needRt().then(function () { var b = $('#rt-today'); if (b) b.outerHTML = rtToday(); var td = $('.tdays'); if (td && S.home) td.outerHTML = todayStrip(S.home); var s2 = $('#side'); if (s2) $('.nav', s2).innerHTML = navHtml(); }).catch(function () {}); }).catch(fail);
  }
  function cardBy(h, re) { return (h.cards || []).filter(function (c) { return re.test(c.l); })[0] || { l: '', v: '—', n: '' }; }
  function kpiBy(h, re) { return (h.kpi || []).filter(function (k) { return re.test(k.k); })[0] || { k: '', v: '', t: '', lamp: '⚪' }; }
  var LW = { g: 'Healthy', y: 'Watch', r: 'Act now', w: 'Awaiting data' }, LS = { g: 100, y: 60, r: 20 };
  /** Lampu paling teruk antara yang dinilai; ⚪ jika tiada yang dinilai. */
  function worst(ls) { var o = ['r', 'y', 'g']; for (var i = 0; i < o.length; i++) if (ls.indexOf(o[i]) >= 0) return o[i]; return 'w'; }
  function healthOf(h) {
    var ks = h.kpi || [], rated = ks.filter(function (k) { return LS[lamp(k.lamp)] !== undefined; });
    var score = rated.length ? rated.reduce(function (a, k) { return a + LS[lamp(k.lamp)]; }, 0) / rated.length : null;
    return { score: score, rated: rated.length, all: ks.length || 10, grade: score === null ? 'Not enough data' : score >= 80 ? 'Healthy' : score >= 60 ? 'Stable, keep watching' : score >= 40 ? 'Needs attention' : 'Critical' };
  }
  function homeView(h) {
    var AE = h.actions || { rules: [], counts: {} }, rules = AE.rules || [], lv = h.live || {};
    var sales = cardBy(h, /^JUALAN/), cash = cardBy(h, /ALIRAN TUNAI/), rek = cardBy(h, /REKON/), ap = cardBy(h, /AP TERTUNGGAK/),
      prof = cardBy(h, /UNTUNG/), fc = cardBy(h, /FOOD COST/), splh = cardBy(h, /SPLH/);
    var k = { run: kpiBy(h, /Runway/), del: kpiBy(h, /Ketepatan/), mar: kpiBy(h, /Margin bersih/), be: kpiBy(h, /breakeven/i), fc: kpiBy(h, /Food cost/), scor: kpiBy(h, /SCOR/), rek: kpiBy(h, /rekon tertutup/), gap: kpiBy(h, /Jurang rekon/), ap: kpiBy(h, /AP dibayar/), close: kpiBy(h, /tutup buku/) };
    var hs = healthOf(h), bank = (lv.pulse || []).filter(function (p) { return /bank/i.test(p.what); })[0] || {};
    var fcN = pct(fc.v), salesPct = pct((String(sales.n).match(/(\d+)%/) || [])[0]);

    /* ---- 5 tiang kewangan ---- */
    var P = [
      { p: 'cash', n: 'Cash', icon: I.cash, l: worst([lamp(k.run.lamp), lamp(cash.n)].filter(function (x) { return x && x !== 'w'; })), big: k.run.v && lamp(k.run.lamp) !== 'w' ? k.run.v + ' weeks' : 'Not confirmed', sub: 'Cash runway · Overdue AP ' + ap.v, key: 'runway',
        say: { w: 'Bank opening balances are incomplete, so FIRAX cannot yet calculate how long cash will last.', g: 'Cash covers more than 8 weeks of operations.', y: 'Cash covers less than 8 weeks. Hold non-critical payments.', r: 'Cash is nearly exhausted. Act immediately.' } },
      { p: 'sales', n: 'Sales', icon: I.sales, l: lamp(sales.n) || 'w', big: sales.v, sub: unemo(sales.n), key: 'jualan',
        say: { g: 'Sales are on target.', y: 'Sales are close to target. Push promotions at lagging branches.', r: 'Sales are well below target. Ask every BM for an action plan.', w: 'Sales data is incomplete.' } },
      { p: 'profit', n: 'Profit', icon: I.profit, l: worst([lamp(k.mar.lamp), lamp(k.be.lamp)].filter(function (x) { return x && x !== 'w'; })), big: prof.v, sub: 'Operating profit (upper bound)', key: 'margin',
        say: { w: unemo(prof.n) + '. Do not make decisions based on this profit figure yet.', g: 'Margin is above target.', y: 'Profit is positive but below target.', r: 'A branch or the company is making a loss.' } },
      { p: 'profit', n: 'Costs', icon: I.bill, l: worst([lamp(k.fc.lamp), lamp(k.scor.lamp), lamp(splh.n)].filter(function (x) { return x && x !== 'w'; })), big: fc.v, sub: 'Food cost · SCOR ' + (k.scor.v || '—') + ' · SPLH ' + splh.v, key: 'food',
        say: { g: 'Costs are within the industry range.', y: (fcN && fcN > 35 ? 'Food cost ' + Math.round(fcN) + '% is above the 28–35% industry range. ' : '') + 'Staff productivity is below the RM60 per hour target.', r: 'Costs are over the limit. Review ingredients and shifts.', w: 'Food cost and SCOR targets not yet set by the CEO.' } },
      { p: 'control', n: 'Controls', icon: I.control, l: worst([k.rek, k.gap, k.ap, k.close].map(function (x) { return lamp(x.lamp); }).filter(function (x) { return x && x !== 'w'; })), big: k.rek.v || rek.v, sub: 'Reconciled days · On-time AP ' + (k.ap.v || '—'), key: 'rekon',
        say: { g: 'Reconciliation and payments are under control.', y: 'Minor delays. Keep watching.', r: 'Many days are unreconciled and bank statements are late. Leakage may go undetected.', w: 'Controls data is incomplete.' } }
    ];
    if (fcN && fcN > 35 && P[3].l === 'w') P[3].l = 'y';

    /* ---- Ringkasan 30 saat ---- */
    var s7 = (lv.sales || []).map(function (r) { return { d: r.d.slice(0, 5), v: num(r.total), t: num(r.target) }; }).filter(function (r) { return r.v !== null; });
    var avg = s7.length ? s7.reduce(function (a, r) { return a + r.v; }, 0) / s7.length : null, avgT = s7.length ? s7.reduce(function (a, r) { return a + (r.t || 0); }, 0) / s7.length : null;
    var best = s7.slice().sort(function (a, b) { return b.v - a.v; })[0], low = s7.slice().sort(function (a, b) { return a.v - b.v; })[0];
    var br = branchRows(h), brS = br.filter(function (b) { return b.pct !== null; }).sort(function (a, b) { return b.pct - a.pct; });
    var reds = rules.filter(function (r) { return lamp(r.lamp) === 'r'; });
    var bullets = [
      [lamp(sales.n) || 'w', '<b>' + esc(sales.l.toLowerCase().replace(/(^|\s)\S/g, function (c) { return c.toUpperCase(); })) + ': ' + esc(sales.v) + '</b> · ' + esc(unemo(sales.n))],
      avg ? [avgT && avg >= avgT ? 'g' : avgT && avg >= avgT * .9 ? 'y' : 'r', 'Last 7 days: average <b>RM' + fnum(avg) + '</b> per day' + (avgT ? ' (' + Math.round(avg / avgT * 100) + '% of daily target)' : '') + '. Best ' + esc(best.d) + ' RM' + fnum(best.v) + ', weakest ' + esc(low.d) + ' RM' + fnum(low.v) + '.'] : null,
      brS.length ? ['w', 'Closest to target: <b>' + esc(brS[0].n) + ' ' + Math.round(brS[0].pct) + '%</b>. Furthest: <b>' + esc(brS[brS.length - 1].n) + ' ' + Math.round(brS[brS.length - 1].pct) + '%</b>.'] : null,
      [reds.length ? 'r' : 'g', reds.length ? '<b>' + reds.length + ' 🔴 issues</b> need action today: ' + esc(reds[0].trigger) + (reds[1] ? ', ' + esc(reds[1].trigger) : '') + '.' : 'No 🔴 issues today.'],
      [num(bank.age) > 1 ? 'y' : 'g', 'Data: bank statement up to <b>' + esc(bank.date || '—') + '</b>' + (bank.age ? ' (' + esc(bank.age) + ' days)' : '') + ' · ' + hs.rated + ' of ' + hs.all + ' KPIs have complete data.']
    ].filter(Boolean);

    var hero = '<section class="glass hero2"><div class="art">' + heroArt('hm') + '</div><div class="l"><div class="kicker">Assalamualaikum, ' + esc(S.me.name) + ' · ' + esc(lv.clock ? String(lv.clock).split('·')[0] : '') + '</div>' +
      '<h2><span>Financial Clarity.</span> <span>Intelligent Decisions.</span> <span>Profitable Growth.</span></h2>' +
      '<div class="brief"><div class="bh">30-second summary</div>' + bullets.map(function (b) { return '<div class="bl"><span class="dot ' + b[0] + '"></span><span>' + b[1] + '</span></div>'; }).join('') + '</div>' +
      '<div class="cta"><button class="btn pri" data-act="nav" data-p="actions">' + ic(I.bolt) + 'Today\'s actions' + (reds.length ? ' · ' + reds.length + ' 🔴' : '') + '</button><button class="btn" data-act="nav" data-p="routine">' + ic(I.routine) + 'Today\'s routine</button></div></div>' +
      '<div class="r"><div class="health"><div class="hh"><span>Financial Health Score</span>' + helpBtn('', 'skor') + '</div>' + gauge(hs.score, hs.grade, hs.score === null ? '' : 'Based on ' + hs.rated + ' KPIs with complete data') +
      '<div class="conf"><div class="ch"><span>Data confidence ' + helpBtn('', 'yakin') + '</span><b>' + Math.round(hs.rated / hs.all * 100) + '%</b></div><div class="prog"><i style="width:' + (hs.rated / hs.all * 100) + '%;' + (hs.rated / hs.all < .7 ? 'background:linear-gradient(90deg,#ff8a3d,#ffb547)' : '') + '"></i></div><small>' + hs.rated + ' / ' + hs.all + ' KPIs have complete data · the rest are ⚪ awaiting data or a decision</small></div>' +
      '<div class="pmini">' + P.map(function (p) { return '<button data-act="nav" data-p="' + p.p + '"><span class="dot ' + p.l + '"></span>' + p.n + '<em>' + LW[p.l] + '</em></button>'; }).join('') + '</div></div></div></section>';

    var pillars = '<section class="pillars">' + P.map(function (p) {
      return '<article class="glass pillar ' + p.l + '" data-act="nav" data-p="' + p.p + '"><div class="ph1"><span class="pi">' + ic(p.icon) + '</span><b>' + p.n + '</b>' + chip((p.l === 'g' ? '🟢 ' : p.l === 'y' ? '🟡 ' : p.l === 'r' ? '🔴 ' : '⚪ ') + LW[p.l]) + '</div>' +
        '<div class="pv">' + esc(p.big) + helpBtn('', p.key) + '</div><div class="ps">' + esc(p.sub) + '</div><p class="pm">' + esc(p.say[p.l] || '') + '</p><div class="pf">View details ' + ic(I.arrow) + '</div></article>';
    }).join('') + '</section>';

    var fresh = '<section class="glass fresh">' + (lv.pulse || []).slice(0, 6).map(function (p) { return '<div class="fr"><span class="dot ' + lamp(p.lamp) + '"></span><div><small>' + esc(p.what) + '</small><b>' + esc(p.date || '—') + (p.age !== '' && p.age !== undefined ? ' · ' + esc(p.age) + ' days' : '') + '</b></div></div>'; }).join('') + '</section>';

    var open = rules.filter(function (r) { var l = lamp(r.lamp); return l === 'r' || l === 'y'; }).slice(0, 5);
    var todo = '<section class="grid2"><div class="glass pad"><div class="sec-h"><h3>Today\'s actions</h3><button class="btn sm" data-act="nav" data-p="actions">All actions ' + ic(I.arrow) + '</button></div>' +
      (open.length ? open.map(function (r) { var l = lamp(r.lamp); return '<div class="todo-i ' + l + '"><span class="code">' + esc(r.code) + '</span><div><b>' + esc(r.trigger) + '</b><small>' + esc(r.action) + '</small></div><div class="tm"><span class="chip">' + esc(r.pic) + '</span><span class="chip ' + (l === 'r' ? 'r' : 'y') + '">' + esc(r.sla) + '</span></div></div>'; }).join('') : '<div class="empty">No open actions 🎉</div>') + '</div>' +
      rtToday() + '</section>';

    var chartSales = s7.map(function (r) { return { l: r.d, v: r.v, t: r.t }; });
    var facts = [['Daily average (7 days)', avg ? 'RM' + fnum(avg) : '—'], ['Average daily target', avgT ? 'RM' + fnum(avgT) : '—'], ['Best day', best ? best.d + ' · RM' + fnum(best.v) : '—'], ['Weakest day', low ? low.d + ' · RM' + fnum(low.v) : '—'], ['30-day trend', lv.trend ? lv.trend.pct + ' of target' : '—']];
    var row7 = '<section class="grid2"><div class="glass pad"><div class="sec-h"><h3>Sales, last 7 days ' + helpBtn('', 'jualan') + '</h3><span class="note">Yellow bar = below daily target</span></div>' + barChart(chartSales, { a: 'Operating sales', b: 'Daily target' }) + '</div>' +
      '<div class="glass pad"><div class="sec-h"><h3>Quick facts</h3></div><div class="facts">' + facts.map(function (f) { return '<div><small>' + esc(f[0]) + '</small><b>' + esc(f[1]) + '</b></div>'; }).join('') + '</div></div></section>';

    var league = br.length ? '<section class="glass pad"><div class="sec-h"><h3>Branch ranking · % of this month\'s target ' + helpBtn('', 'sasaran') + '</h3><button class="btn sm" data-act="nav" data-p="profit">Branch P&L ' + ic(I.arrow) + '</button></div>' +
      hbars(brS.map(function (b) { return { l: b.n, v: b.pct, sub: 'RM' + fnum(b.sales) + (b.splh ? ' · SPLH ' + b.splh : '') + (b.fc ? ' · food cost ' + b.fc : '') }; }), { good: 100, warn: 80, mark: 100 }) +
      '<details class="more"><summary>View full table for all branches</summary>' + tbl({ head: (h.branches || {}).head || [], rows: (h.branches || {}).rows || [], totals: ((h.branches || {}).rows || []).map(function (r, i) { return /Semua/.test(r[0]) ? i : -1; }).filter(function (i) { return i >= 0; }) }) + '</details></section>' : '';

    var kp = '<div class="kpis">' + (h.kpi || []).map(function (x) { return '<div class="kpi"><span>' + dot(x.lamp) + '</span><span class="k">' + esc(x.k) + ' ' + helpBtn(x.k) + '</span><span class="v">' + esc(x.v || '—') + '</span><span class="t">target ' + esc(x.t || '—') + '</span></div>'; }).join('') + '</div>';
    var row5 = '<section class="grid2"><div class="glass pad"><div class="sec-h"><h3>10-KPI scorecard</h3><span class="note">' + esc(h.kpiScore || '') + '</span></div>' + kp + '</div>' +
      '<div class="glass pad"><div class="sec-h"><h3>Decisions needed from the CEO</h3></div>' + (h.decisions || []).map(function (d) { return '<div class="dec"><span class="n">' + esc(d.n) + '</span><div><b style="font-size:13px">' + esc(d.t) + '</b><small>' + esc(d.why) + '</small></div>' + chip(d.st) + '</div>'; }).join('') + '</div></section>';

    var ins = (h.insights || []).filter(function (x) { return x.fakta; }).length ? '<section class="glass pad"><div class="sec-h"><h3>Insights · Fact → Meaning → Action</h3></div><div class="ins">' + h.insights.filter(function (x) { return x.fakta; }).map(insightHtml).join('') + '</div></section>' : '';
    var months = (h.months || []).filter(function (m) { return num(m.v); }).map(function (m) { return { l: m.m.replace(/ 20\d\d/, ''), v: num(m.v), t: num(m.t) }; });
    var mon = months.length ? '<section class="glass pad"><div class="sec-h"><h3>Monthly sales 2026</h3><span class="note">Operating sales (excl. SST, delivery at 50%)</span></div>' + barChart(months, { a: 'Sales', b: 'Target', w: 1200, h: 230 }) + '</section>' : '';

    view(todayStrip(h) + hero + pillars + fresh + todo + row7 + league + row5 + ins + mon + '<div class="note" style="text-align:center">Data as of ' + esc(h.asOf || '') + ' · read directly from the FIRAX sheet · ⚪ = awaiting data or a decision, not poor performance</div>');
  }
  /** Baris cawangan daripada jadual Dashboard (kepala dikesan ikut nama). */
  function branchRows(h) {
    var b = h.branches || {}, hd = b.head || [], ix = function (re) { for (var i = 0; i < hd.length; i++) if (re.test(hd[i])) return i; return -1; };
    var iS = ix(/^Jualan/), iP = ix(/% sasaran/), iF = ix(/Food cost/), iL = ix(/SPLH/);
    return (b.rows || []).filter(function (r) { return r[0] && !/Semua/.test(r[0]); }).map(function (r) { return { n: r[0], sales: num(r[iS]), pct: iP >= 0 ? pct(r[iP]) : null, fc: iF >= 0 ? r[iF] : '', splh: iL >= 0 ? r[iL] : '' }; });
  }
  /** Jalur "Untuk anda hari ini": 4 jubin boleh klik — jawapan segera "apa saya perlu buat". */
  function todayStrip(h) {
    var red = h.actions && h.actions.counts ? num(h.actions.counts.r) || 0 : 0, rt = S.rt && S.rt.prog ? S.rt.prog.H : null;
    var t1 = '<button class="glass tday" data-act="nav" data-p="routine"><small>Today\'s tasks</small><b>' + (rt ? (rt.all - rt.done ? (rt.all - rt.done) + ' to do' : '✓ Done') : '…') + '</b><span>' + (rt ? rt.done + ' / ' + rt.all + ' done' : 'loading…') + '</span></button>';
    var t3 = '<button class="glass tday ' + (red ? 'r' : 'g') + '" data-act="nav" data-p="actions"><small>Red alerts</small><b>' + (red ? red + ' 🔴 issues' : 'No 🔴') + '</b><span>' + (red ? 'See who is handling them' : 'All under control') + '</span></button>';
    return '<section class="tdays">' + t1 + (canSee('pay') ? todayPay() : '') + t3 + (canSee('pay') ? todayWait() : '') + '</section>';
  }
  function todayPay() {
    var p = S.payT;
    return '<button class="glass tday" id="today-pay" data-act="nav" data-p="pay"><small>Payments · ' + esc(p ? p.day + ' ' + p.ymd.slice(8, 10) + '/' + p.ymd.slice(5, 7) : 'next run') + '</small><b>' + (p ? (p.left ? 'RM' + fnum(p.due, 0) : '✓ Done') : '…') + '</b><span>' + (p ? (p.left ? p.left + ' payees to pay' : 'All paid') : 'loading…') + '</span></button>';
  }
  function todayWait() {
    var p = S.payT;
    return '<button class="glass tday' + (p && p.wait ? ' y' : '') + '" data-act="nav" data-p="pay"><small>Pending approval</small><b>' + (p ? (p.wait ? p.wait + ' invoices' : 'None') : '…') + '</b><span>' + (p ? (p.wait ? 'RM' + fnum(p.waitAmt, 0) + ' · cannot be paid yet' : 'All reviewed') : 'loading…') + '</span></button>';
  }
  function rtToday() {
    var r = S.rt; if (!r) return '<div class="glass pad" id="rt-today"><div class="sec-h"><h3>Today\'s routine</h3></div><div class="skel" style="height:150px"></div></div>';
    var t = r.tasks.filter(function (x) { return x.c === 'H'; }), p = r.prog.H;
    return '<div class="glass pad" id="rt-today"><div class="sec-h"><h3>Today\'s routine · ' + p.done + '/' + p.all + '</h3><button class="btn sm" data-act="nav" data-p="routine">Open routine ' + ic(I.arrow) + '</button></div><div class="prog" style="margin-bottom:12px"><i style="width:' + (p.done / p.all * 100) + '%"></i></div>' +
      t.map(function (x) { return '<div class="rt-i' + (x.ok ? ' ok' : '') + '"><span class="ck">' + (x.ok ? '✓' : '') + '</span><div><b>' + esc(x.t) + '</b><small>' + esc(x.who) + ' · ' + esc(x.when) + (x.auto ? ' · ' + esc(x.auto.text) : '') + '</small></div></div>'; }).join('') + '</div>';
  }
  function insightHtml(x) {
    return '<div class="insight"><div class="f"><b>Fact</b>' + esc(x.fakta) + '</div>' + (x.maksud ? '<div class="m"><b>Meaning</b>' + esc(x.maksud) + '</div>' : '') + (x.tindakan ? '<div class="a"><b>Action</b>' + esc(x.tindakan) + '</div>' : '') + '</div>';
  }

  /* ======================= halaman modul (generik, ikut tab sheet) ======================= */
  function tbl(b, opt) {
    opt = opt || {}; var head = b.head || [], rows = b.rows || [], tot = b.totals || [];
    if (!rows.length) return '<div class="empty">No rows</div>';
    var numc = head.map(function (_, c) { var vs = rows.map(function (r) { return String(r[c] || '').trim(); }).filter(Boolean); return vs.length && vs.filter(isNumCell).length / vs.length >= .6; });
    var lampc = head.map(function (_, c) { var vs = rows.map(function (r) { return String(r[c] || '').trim(); }).filter(Boolean); return vs.length && vs.every(function (v) { return /^[🔴🟡🟠🟢⚪✅⏳]️?$/.test(v); }); });
    var lim = opt.all ? rows.length : Math.min(rows.length, opt.lim || 15);
    var h = '<div class="tw"><table class="t"><thead><tr>' + head.map(function (x, c) { return '<th class="' + (numc[c] ? 'n' : lampc[c] ? 'c' : '') + '">' + esc(x) + (opt.nohelp ? '' : helpBtn(x)) + '</th>'; }).join('') + '</tr></thead><tbody>';
    for (var i = 0; i < lim; i++) {
      var r = rows[i];
      h += '<tr' + (tot.indexOf(i) >= 0 ? ' class="tot"' : '') + '>' + head.map(function (_, c) {
        var v = r[c] === undefined ? '' : String(r[c]);
        if (lampc[c]) return '<td class="c">' + dot(v) + '</td>';
        if (numc[c]) return '<td class="n' + (/^\s*(\(|-|−)\d/.test(v) || /^RM\s?-/.test(v) ? ' neg' : '') + '">' + show(v) + '</td>';
        if (/^https:\/\//.test(v)) return '<td><a href="' + esc(v) + '" target="_blank" rel="noopener">Open ↗</a></td>';
        if (/^[A-Z]\d{2}[a-z]?$/.test(v)) return '<td class="n"><span class="chip w" title="Awaiting decision ' + esc(v) + '">Not decided yet</span></td>';
        if (c === 0 && !numc[c]) { var hb = helpBtn(v); if (hb) return '<td class="' + (v.length > 46 ? 'wrap' : 'first') + '">' + esc(v) + hb + '</td>'; }
        var l = lamp(v);
        if (l && v.length < 40) return '<td>' + chip(v) + '</td>';
        return '<td' + (v.length > 46 ? ' class="wrap"' : '') + '>' + show(v) + '</td>';
      }).join('') + '</tr>';
    }
    h += '</tbody></table></div>';
    if (rows.length > lim) h += '<div style="margin-top:10px"><button class="btn sm" data-act="showAll" data-b="' + esc(opt.id || '') + '">Show all ' + rows.length + ' rows</button></div>';
    return h;
  }
  /** Carta automatik untuk jadual masa (Bulan/Minggu/Tarikh) dengan lajur nombor. */
  function autoChart(b) {
    var h0 = String((b.head || [])[0] || '');
    if (!/^(Bulan|Minggu|Tarikh)/i.test(h0) || (b.rows || []).length < 3) return '';
    var head = b.head, pick = -1, tgt = -1;
    head.forEach(function (x, c) {
      if (c === 0) return; var xs = String(x);
      if (tgt < 0 && /Sasaran|Target/i.test(xs)) tgt = c;
      if (pick < 0 && /(Jualan|Pendapatan|Jumlah|Baki|Terimaan|Untung)/i.test(xs) && !/%/.test(xs)) pick = c;
    });
    if (pick < 0) return '';
    var data = b.rows.filter(function (r) { return !/^(Jumlah|JUMLAH|Trend)/.test(r[0]); }).map(function (r) { return { l: String(r[0]).replace(/ 20\d\d/, '').slice(0, 7), v: num(r[pick]), t: tgt >= 0 ? num(r[tgt]) : null }; }).filter(function (d) { return d.v !== null; });
    if (data.length < 3 || data.length > 40) return '';
    return '<div style="margin-bottom:14px">' + barChart(data, { a: head[pick], b: tgt >= 0 ? head[tgt] : '' }) + '</div>';
  }
  function moduleTab(t, bi) {
    if (t.missing) return '<div class="glass pad"><div class="err">Tab "' + esc(t.name) + '" not found in the FIRAX sheet.</div></div>';
    var cards = (t.cards || []).length ? '<section class="cards">' + t.cards.map(function (c) { var l = lamp(c.n) || lamp(c.v); return '<div class="glass card ' + l + '"><div class="l">' + esc(c.l) + helpBtn(c.l) + '</div><div class="v">' + esc(unemo(c.v) || c.v) + '</div><div class="nn">' + dot(c.n) + ' ' + esc(unemo(c.n)) + '</div></div>'; }).join('') + '</section>' : '';
    var bl = (t.blocks || []).map(function (b, i) { b._i = i; return b; });
    var insights = bl.filter(function (b) { return b.type === 'insight'; });
    var top = insights.length ? '<section class="ins top">' + insights.map(function (b) { return insightHtml(b); }).join('') + '</section>' : '';
    var blocks = bl.filter(function (b) { return b.type !== 'insight'; }).map(function (b) { var i = b._i;
      var id = bi + '-' + i;
      if (b.type === 'note') return '<div class="notebox">' + esc(b.text) + '</div>';
      return '<section class="glass block"><h3>' + esc(b.title || t.title) + '</h3>' + autoChart(b) + tbl(b, { id: id, all: S.all && S.all[id] }) + (b.note ? '<div class="bnote">' + esc(b.note) + '</div>' : '') + '</section>';
    }).join('');
    return cards + top + blocks + (t.errs ? '<div class="notebox">⚠ ' + t.errs + ' cells in this tab have formula errors and are shown as "—". Tell the Finance Manager so the formulas can be fixed.</div>' : '');
  }
  function renderModule() {
    var key = S.page;
    var got = S.pages[key] ? Promise.resolve(S.pages[key]) : rpc('fxPage', [S.token, key]).then(function (d) { S.pages[key] = d; keep('pg:' + key, d); return d; });
    got.then(function (d) { moduleView(d); }).catch(fail);
  }
  function moduleView(d) {
    var key = d.key, ti = Math.min(S.tab[key] || 0, d.tabs.length - 1), t = d.tabs[ti];
    var tabs = d.tabs.length > 1 ? '<div class="tabs">' + d.tabs.map(function (x, i) { return '<button class="' + (i === ti ? 'on' : '') + '" data-act="tab" data-i="' + i + '">' + esc(x.name) + '</button>'; }).join('') + '</div>' : '';
    var head = '<section class="glass ph"><div class="hero-art" style="position:absolute;inset:0;opacity:.35;pointer-events:none">' + heroArt('ph' + key) + '</div><div style="position:relative;display:flex;flex-direction:column;gap:10px">' +
      '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><div><div class="kicker">' + esc(t.name) + '</div><h2 style="margin-top:4px">' + esc(t.title || t.name) + '</h2></div>' + (t.status ? chip(t.status) : '') + '</div>' +
      (t.sub ? '<p>' + esc(t.sub) + '</p>' : '') + guideBox(t.name) + (t.alert ? '<div class="err" style="color:#ffcf8a;background:rgba(255,181,71,.08);border-color:rgba(255,181,71,.3)">' + esc(t.alert) + '</div>' : '') + tabs + '</div></section>';
    view(head + moduleTab(t, key + ti) + '<div class="note" style="text-align:center">Data as of ' + esc(d.asOf || '') + ' · tab "' + esc(t.name) + '"</div>');
  }
  A.tab = function (el) { S.tab[S.page] = +el.getAttribute('data-i'); moduleView(S.pages[S.page]); };
  A.showAll = function (el) { S.all = S.all || {}; S.all[el.getAttribute('data-b')] = true; if (S.page === 'settings') renderSettings(); else moduleView(S.pages[S.page]); };

  /* ======================= Action Engine ======================= */
  function renderActions() {
    var got = S.acts ? Promise.resolve(S.acts) : rpc('fxActions', [S.token]).then(function (a) { S.acts = a; keep('acts', a); return a; });
    got.then(actionsView).catch(fail);
  }
  function actionsView(a) {
    var c = a.counts || {}, f = S.actF || 'open';
    var list = (a.rules || []).filter(function (r) { var l = lamp(r.lamp); return f === 'all' ? true : f === 'open' ? (l === 'r' || l === 'y') : l === f; });
    var sum = '<section class="sumtiles">' + [['r', '🔴', 'Act now', c.r], ['y', '🟡', 'Watch', c.y], ['w', '⚪', 'Awaiting data / decision', c.w], ['g', '🟢', 'OK', c.g]].map(function (x) {
      return '<button class="glass sumtile" style="text-align:left;color:inherit;' + (f === x[0] ? 'border-color:rgba(47,224,122,.5)' : '') + '" data-act="actF" data-f="' + x[0] + '"><span class="dot ' + x[0] + '" style="width:14px;height:14px"></span><div><b>' + esc(x[3] || 0) + '</b><small>' + esc(x[2]) + '</small></div></button>';
    }).join('') + '</section>';
    var tabs = '<div class="tabs">' + [['open', 'Open (🔴 + 🟡)'], ['all', 'All 12 rules'], ['r', 'Red'], ['y', 'Amber'], ['w', 'Awaiting'], ['g', 'OK']].map(function (x) { return '<button class="' + (f === x[0] ? 'on' : '') + '" data-act="actF" data-f="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var items = list.length ? list.map(function (r) {
      var l = lamp(r.lamp) || 'w';
      var upd = a.canEdit ? '<div class="upd"><label class="note">Status</label><select id="st-' + esc(r.code) + '">' + opts([''].concat(a.statuses || []), r.status) + '</select>' +
        '<textarea id="nt-' + esc(r.code) + '" placeholder="Evidence / notes (required for Done)"></textarea><button class="btn pri sm" style="justify-content:center" data-act="actSave" data-c="' + esc(r.code) + '">Update</button>' +
        (r.note ? '<div class="note">Last: ' + esc(r.note) + '</div>' : '') + '</div>' : '<div class="upd"><div class="note">Status: <b>' + esc(r.status || 'Baru') + '</b></div>' + (r.note ? '<div class="note">' + esc(r.note) + '</div>' : '') + '</div>';
      return '<article class="act ' + l + '"><div class="edge"></div><div class="body"><div><div class="code">' + esc(r.code) + ' · ' + dot(r.lamp) + '</div><h4>' + esc(r.trigger) + '</h4>' +
        '<div class="todo">' + esc(r.action && r.action !== '—' ? r.action : 'No action needed right now.') + '</div><div class="vt">Now <b style="color:#ecf7f0">' + esc(r.value || '—') + '</b> · limit ' + esc(r.threshold || '—') + '</div>' + (r.how ? '<details class="how"><summary>How to resolve (' + r.how.steps.length + ' steps)</summary><p class="note">' + esc(r.how.why) + '</p><ol>' + r.how.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>' : '') +
        '<div class="meta"><span class="chip">' + esc(r.pic) + '</span><span class="chip y">SLA ' + esc(r.sla) + '</span>' + (r.status ? '<span class="chip g">' + esc(r.status) + '</span>' : '') + (r.url ? '<a class="chip g" href="' + esc(r.url) + '" target="_blank" rel="noopener">Resolve now ↗</a>' : '') + '</div></div>' + upd + '</div></article>';
    }).join('') : '<div class="glass pad"><div class="empty"><b>Nothing here 🎉</b></div></div>';
    view(sum + '<section class="glass pad">' + tabs + '<p class="note" style="margin:10px 0 0">Thresholds and owners are set in the FIRAX sheet (Settings). Unresolved 🔴 items are carried to the WAR outstanding issues. Updates here write the Status and evidence to the Action Engine tab.</p></section><section class="acts">' + items + '</section><div class="note" style="text-align:center">Data as of ' + esc(a.asOf || '') + '</div>');
  }
  A.actF = function (el) { S.actF = el.getAttribute('data-f'); actionsView(S.acts); };
  A.actSave = function (el) {
    var c = el.getAttribute('data-c'), st = val('st-' + c), nt = val('nt-' + c);
    if (!st) return toast('Choose a status first.', true);
    el.disabled = true;
    rpc('fxActionSave', [S.token, c, st, nt]).then(function () { toast(c + ' updated'); S.acts = null; S.home = null; renderActions(); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };

  /* ======================= Settings ======================= */
  var ROLES = [['CEO', 'CEO & Founder'], ['FM', 'Finance Manager'], ['ACC', 'Accounts Staff'], ['BM', 'Branch Manager'], ['VIEW', 'View only']];
  function renderSettings() {
    var pU = S.me.role === 'CEO' ? rpc('fxUsers', [S.token]) : Promise.resolve(null);
    var pT = S.pages.settings ? Promise.resolve(S.pages.settings) : rpc('fxPage', [S.token, 'settings']).then(function (d) { S.pages.settings = d; return d; });
    Promise.all([pU, pT]).then(function (x) { S.users = x[0]; settingsView(x[0], x[1]); }).catch(fail);
  }
  function settingsView(users, d) {
    var ti = S.tab.settings || 0, t = d.tabs[Math.min(ti, d.tabs.length - 1)];
    var u = users ? '<section class="glass block"><h3>Users & access</h3><p class="note" style="margin:-4px 0 12px">Name + 4-digit PIN. An admin PIN is only written to column N of the <b>APP PENGGUNA</b> tab and must be changed by the user at first sign-in. PINs are never shown in FIRAX.</p>' +
      '<div class="tw"><table class="t"><thead><tr><th>Name</th><th>Role</th><th>Status</th><th>PIN</th><th>Last sign-in</th><th></th></tr></thead><tbody>' +
      users.map(function (x) { return '<tr><td><b>' + esc(x.name) + '</b><div class="note">' + esc(x.jawatan) + '</div></td><td>' + esc(x.roleLabel) + '</td><td>' + (x.active ? chip('🟢 Active') : chip('⚪ Inactive')) + '</td><td>' + (x.mustChange ? chip('🟡 Must change') : x.pinSet ? chip('🟢 Set') : x.codePending ? chip('🟡 Code sent') : chip('⚪ Not set')) + '</td><td>' + show(x.last) + '</td><td style="white-space:nowrap"><button class="btn sm" data-act="userEdit" data-id="' + esc(x.id) + '">Edit</button> <button class="btn sm" data-act="userReset" data-id="' + esc(x.id) + '">Reset PIN</button></td></tr>'; }).join('') +
      '</tbody></table></div><div class="row-btn" style="justify-content:flex-start"><button class="btn pri" data-act="userEdit">+ Add user</button></div></section>' : '';
    var tabs = '<section class="glass pad"><div class="tabs">' + d.tabs.map(function (x, i) { return '<button class="' + (x === t ? 'on' : '') + '" data-act="setTab" data-i="' + i + '">' + esc(x.name) + '</button>'; }).join('') + '</div><p class="note" style="margin:10px 0 0">Thresholds, owners and links are changed in the FIRAX sheet (yellow cells). FIRAX shows them here read-only.</p></section>';
    view(u + tabs + moduleTab(t, 'set' + ti));
  }
  A.setTab = function (el) { S.tab.settings = +el.getAttribute('data-i'); settingsView(S.users, S.pages.settings); };
  A.userEdit = function (el) {
    var id = el.getAttribute('data-id'), x = id ? (S.users || []).filter(function (u) { return u.id === id; })[0] : { role: 'ACC', active: true };
    modal('<h3>' + (id ? 'Edit user' : 'Add user') + '</h3><div style="margin-top:12px">' + field('Name', '<input id="un" value="' + esc(x.name || '') + '">') + field('Role', '<select id="ur">' + opts(ROLES, x.role) + '</select>') + field('Position', '<input id="uj" value="' + esc(x.jawatan || '') + '">') +
      (id ? field('Status', '<select id="ua">' + opts([['1', 'Active'], ['0', 'Inactive']], x.active ? '1' : '0') + '</select>') : field('Access method', '<select id="um">' + opts([['pin', 'Admin PIN (written to APP PENGGUNA column N)'], ['code', 'One-time activation code (72 hours)']], 'pin') + '</select>')) +
      '</div><div id="um2"></div><div class="row-btn"><button class="btn" data-act="closeModal">Cancel</button><button class="btn pri" data-act="userSave" data-id="' + esc(id || '') + '">Save</button></div>');
  };
  A.userSave = function (el) {
    var id = el.getAttribute('data-id');
    el.disabled = true;
    rpc('fxUserSave', [S.token, { id: id || '', name: val('un'), role: val('ur'), jawatan: val('uj'), caw: 'SEMUA', active: id ? val('ua') === '1' : true, method: val('um') }]).then(function (r) {
      if (r.code) modal('<h3>Activation code</h3><p class="note">Give this code to <b>' + esc(r.name) + '</b>. It can be used once only and expires ' + esc(r.tamat) + '.</p><div style="font-size:28px;letter-spacing:.2em;font-weight:700;text-align:center;margin:16px 0;color:#2fe07a">' + esc(r.code) + '</div><div class="row-btn"><button class="btn pri" data-act="closeModal">Done</button></div>');
      else { closeModal(); toast(r.pinRecorded ? 'User added — PIN written to APP PENGGUNA column N' : 'Saved'); }
      renderSettings();
    }).catch(function (e) { el.disabled = false; $('#um2').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  A.userReset = function (el) {
    var id = el.getAttribute('data-id');
    modal('<h3>Reset PIN</h3><p class="note">The old PIN stops working immediately.</p><div class="row-btn"><button class="btn" data-act="doReset" data-id="' + esc(id) + '" data-m="code">Activation code</button><button class="btn pri" data-act="doReset" data-id="' + esc(id) + '" data-m="pin">New admin PIN</button></div>');
  };
  A.doReset = function (el) {
    el.disabled = true;
    rpc('fxUserCode', [S.token, el.getAttribute('data-id'), el.getAttribute('data-m')]).then(function (r) {
      if (r.code) modal('<h3>Activation code</h3><div style="font-size:28px;letter-spacing:.2em;font-weight:700;text-align:center;margin:16px 0;color:#2fe07a">' + esc(r.code) + '</div><p class="note">Expires ' + esc(r.tamat) + '.</p><div class="row-btn"><button class="btn pri" data-act="closeModal">Done</button></div>');
      else { closeModal(); toast('New PIN written to APP PENGGUNA column N'); }
      renderSettings();
    }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };

  /* ======================= Finance Routine (SOP) ======================= */
  var CADS = [['H', 'Daily', 'Every working day'], ['M', 'Weekly', 'Sunday transactions · payments Sunday/Tuesday/Wednesday'], ['B', 'Monthly', 'This month · month-end close'], ['T', 'Annual', 'This year']];
  function renderRoutine() { needRt().then(routineView).catch(fail); }
  function routineView(r) {
    var f = S.rtF || 'H', list = r.tasks.filter(function (t) { return t.c === f; });
    var tiles = '<section class="sumtiles">' + CADS.map(function (c) {
      var p = r.prog[c[0]], pc = p.all ? Math.round(p.done / p.all * 100) : 0;
      return '<button class="glass sumtile rt-t' + (f === c[0] ? ' on' : '') + '" data-act="rtF" data-f="' + c[0] + '"><div class="mring">' + ring(pc) + '</div><div><b>' + p.done + '/' + p.all + '</b><small>' + c[1] + ' · ' + c[2] + '</small></div></button>';
    }).join('') + '</section>';
    var intro = '<section class="glass pad rt-intro"><div><div class="kicker">' + esc(r.today) + '</div><h3 style="margin:6px 0">Sofwah standard finance routine</h3>' +
      '<p class="note" style="margin:0">Follow this list every day and the books stay clean, the month can be closed within 3 working days (international best practice), and the CEO gets accurate figures. ' +
      'Tasks marked <span class="chip g">System: done</span> are verified automatically by FIRAX from the data. Mark other tasks yourself once completed.</p></div></section>';
    var items = list.map(function (t) {
      var st = t.ok ? 'ok' : t.auto && t.auto.s === 'todo' ? 'todo' : '';
      return '<article class="glass rt ' + st + '"><button class="rck' + (t.ok ? ' on' : '') + '" ' + (r.canEdit && !(t.auto && t.auto.s === 'ok') ? 'data-act="rtTick" data-id="' + t.id + '" data-d="' + (t.done ? 0 : 1) + '"' : 'disabled') + ' aria-label="Mark as done">' + (t.ok ? '✓' : '') + '</button>' +
        '<div class="rb"><div class="rh"><span class="code">' + esc(t.id) + '</span><h4>' + esc(t.t) + '</h4></div>' +
        '<div class="meta"><span class="chip">' + esc(t.who) + '</span><span class="chip y">' + ic(I.clock).replace('<svg', '<svg width="12" height="12"') + esc(t.when) + '</span>' +
        (t.auto ? '<span class="chip ' + (t.auto.s === 'ok' ? 'g' : t.auto.s === 'todo' ? 'r' : 'w') + '">' + esc(t.auto.text) + '</span>' : '') +
        (t.done ? '<span class="chip g">✓ ' + esc(t.done.by) + ' · ' + esc(t.done.at) + '</span>' : '') + '</div>' +
        '<p class="why">' + esc(t.why) + '</p>' +
        '<details class="how"' + (t.ok ? '' : ' open') + '><summary>Steps (' + t.steps.length + ')</summary><ol>' + t.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>' +
        (t.done && t.done.note ? '<div class="note">Note: ' + esc(t.done.note) + '</div>' : '') +
        '<div class="ra"><button class="btn sm" data-act="nav" data-p="' + esc(t.page) + '">Open related page ' + ic(I.arrow) + '</button>' +
        (r.canEdit && !(t.auto && t.auto.s === 'ok') ? (t.done ? '<button class="btn sm" data-act="rtTick" data-id="' + t.id + '" data-d="0">Undo</button>' : '<input class="inp sm" id="rn-' + t.id + '" placeholder="Short note (optional)"><button class="btn pri sm" data-act="rtTick" data-id="' + t.id + '" data-d="1">Mark as done</button>') : '') + '</div></div></article>';
    }).join('');
    view(tiles + intro + '<section class="rts">' + items + '</section><div class="note" style="text-align:center">Ticks are saved in the APP RUTIN tab by period (' + esc(r.prog[f].key) + '). Who ticked and when is recorded for the audit trail.</div>');
  }
  A.rtF = function (el) { S.rtF = el.getAttribute('data-f'); routineView(S.rt); };
  A.rtTick = function (el) {
    var id = el.getAttribute('data-id'), d = el.getAttribute('data-d') === '1', note = val('rn-' + id);
    el.disabled = true;
    rpc('fxRoutineSave', [S.token, id, d, note]).then(function () { toast(d ? id + ' marked as done' : id + ' undone'); S.rt = null; renderRoutine(); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };

  /* ======================= Guide & Glossary ======================= */
  var BENCH = [
    ['Food cost %', 'Food cost ÷ sales', '28% – 35%', 'food'],
    ['SCOR (labour cost %)', 'Labour cost ÷ sales', '25% – 35%', 'scor'],
    ['Prime cost', '(Food + labour) ÷ sales', '≤ 60% – 65%', 'prime'],
    ['Rent', 'Rent ÷ sales', '≤ 6% – 10%', ''],
    ['Net margin', 'Net profit ÷ sales', '5% – 15%', 'margin'],
    ['Cash runway', 'Cash balance ÷ weekly opex', '≥ 8 weeks', 'runway'],
    ['Breakeven', 'Sales ÷ breakeven', '≥ 120%', 'breakeven'],
    ['Bank reconciliation', 'Matched days ÷ days with a statement', '100% every working day', 'rekon'],
    ['On-time payment rate', 'Invoices paid within terms ÷ all', '≥ 95%', 'ap'],
    ['Month-end close', 'Working days after month end', '3 – 5 days', 'tutup'],
    ['Delivery POS accuracy', 'POS ÷ portal', '99% – 101%', 'ketepatan'],
    ['Voids + manual discounts', '÷ sales', '< 0.5%', 'void']
  ];
  function renderGuide() {
    if (!S.home) { needHome().then(renderGuide).catch(function () { S.home = { kpi: [] }; renderGuide(); }); return; }
    var KM = { food: /Food cost/, scor: /SCOR/, margin: /Margin bersih/, runway: /Runway/, breakeven: /breakeven/i, rekon: /rekon tertutup/, ap: /AP dibayar/, tutup: /tutup buku/, ketepatan: /Ketepatan/ };
    var now = function (k) { var re = KM[k]; if (!re) return '<span class="muted">—</span>'; var x = (S.home.kpi || []).filter(function (y) { return re.test(y.k); })[0]; return x && x.v ? dot(x.lamp) + ' <b>' + esc(x.v) + '</b>' + (k === 'tutup' ? ' days' : k === 'runway' ? ' weeks' : '') : '<span class="muted">⚪ No data yet</span>'; };
    var q = (S.gq || '').toLowerCase(), list = GL.filter(function (g) { return !q || (g.n + ' ' + g.a).toLowerCase().indexOf(q) >= 0; });
    var steps = [['1', 'Start at Overview', 'Check the Financial Health Score, the 5 pillars and the 30-second summary. ⚪ means data is incomplete, not poor performance.'],
      ['2', 'Do today\'s routine', 'The Finance Routine page lists daily, weekly and monthly tasks with step-by-step instructions.'],
      ['3', 'Clear 🔴 actions', 'Every alert has an owner, an SLA and a "How to resolve" button. Mark it Done with evidence.'],
      ['4', 'Understand every number', 'Tap the ? button next to any term for its meaning, formula and healthy range.'],
      ['5', 'Report with confidence', 'Tap Print at the top for a PDF of the WAR or board report.']];
    view('<section class="glass pad"><div class="kicker">How to use FIRAX in 5 steps</div><div class="steps5">' + steps.map(function (s) { return '<div><span>' + s[0] + '</span><b>' + esc(s[1]) + '</b><p>' + esc(s[2]) + '</p></div>'; }).join('') + '</div></section>' +
      '<section class="glass pad"><div class="sec-h"><h3>Restaurant industry benchmarks</h3><span class="note">General guide to international F&B practice; Sofwah\'s official targets are set by the CEO in Settings</span></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>Measure</th><th>Formula</th><th>Healthy range (industry)</th><th>Sofwah now</th><th></th></tr></thead><tbody>' + BENCH.map(function (b) { return '<tr><td><b>' + esc(b[0]) + '</b></td><td>' + esc(b[1]) + '</td><td><span class="chip g">' + esc(b[2]) + '</span></td><td>' + now(b[3]) + '</td><td>' + (b[3] ? helpBtn('', b[3]) : '') + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
      '<section class="glass pad"><div class="sec-h"><h3>FIRAX finance glossary · ' + GL.length + ' terms</h3><input class="inp" id="gq" placeholder="Search terms, e.g. runway" value="' + esc(S.gq || '') + '" style="max-width:280px"></div>' +
      '<div class="gloss">' + (list.length ? list.map(function (g) { return '<article class="gcard">' + glossHtml(g) + '</article>'; }).join('') : '<div class="empty">No matching terms</div>') + '</div></section>');
    var inp = $('#gq'); if (inp) { inp.oninput = function () { S.gq = this.value; var pos = this.selectionStart; renderGuide(); var n = $('#gq'); n.focus(); n.setSelectionRange(pos, pos); }; }
  }

  /* ======================= Bayaran (run Ahad · Selasa · Rabu) ======================= */
  var CAWN = { GN: 'Gurun', KN: 'Kuala Nerang', SP: 'Sungai Petani', AS: 'Alor Setar', JT: 'Jitra', AC: 'Aman Central', HQ: 'HQ' };
  function rmf(n) { return 'RM' + fnum(n, 2); }
  function renderPay(ymd) {
    var want = ymd || S.payD || '';
    rpc('fxPay', [S.token, want]).then(function (r) { S.pay = r; S.payD = r.ymd; if (!want || r.ymd === r.runs[0].ymd) { S.payT = { left: r.sum.n - r.sum.nPaid, due: r.sum.due - r.sum.paid, day: r.day, ymd: r.ymd, wait: r.wait.n, waitAmt: r.wait.amt }; keep('payT', S.payT); refreshNav(); } payView(r); }).catch(function (e) { if (want) { S.payD = ''; renderPay(); } else fail(e); });
  }
  function link(u, t) { return /^https?:\/\//.test(u || '') ? '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(t) + '</a>' : '<span class="muted">' + esc(u ? 'WhatsApp' : '—') + '</span>'; }
  function payView(r) {
    var tabs = '<section class="paytabs">' + r.runs.map(function (d) {
      return '<button class="glass ptab' + (d.ymd === r.ymd ? ' on' : '') + '" data-act="payD" data-d="' + d.ymd + '"><small>' + (d.today ? 'TODAY · ' : '') + esc(d.dmy) + '</small><b>' + esc(d.day) + '</b><span>' + (d.n ? 'RM' + fnum(d.tot, 0) + ' · ' + d.n + (d.hr ? ' to pay' : ' supplier' + (d.n > 1 ? 's' : '')) : 'Nothing to pay') + '</span></button>';
    }).join('') + '</section>';
    var s = r.sum, left = s.n - s.nPaid, toPay = s.due - s.paid;
    var hrRows = r.hr ? (r.sambilan || []).filter(function (p) { return !p.hold; }).length + (r.bday && r.bday.length ? 1 : 0) : 0;
    var head = '<section class="glass pad paybar"><div><div class="kicker">' + esc(r.day) + ' ' + esc(ymdS(r.ymd)) + ' · ' + (r.hr ? 'staff & HR payments' : 'supplier payments') + '</div>' +
      '<div class="paybig">' + (left || hrRows ? rmf(toPay) + ' <small>to pay · ' + left + ' ' + (r.hr ? 'claim' : 'supplier') + (left === 1 ? '' : 's') + '</small>' : s.n ? '✅ All paid' : 'Nothing to pay') + '</div>' +
      (s.n ? '<div class="paylegend"><span class="lg g">Ready ' + rmf(s.ready) + '</span>' + (s.unappr ? '<span class="lg y">Needs approval ' + rmf(s.unappr) + '</span>' : '') + (s.paid ? '<span class="lg p">Paid ' + rmf(s.paid) + '</span>' : '') + '</div>' : '') + '</div>' +
      '<div class="row-btn" style="margin:0;flex-wrap:wrap">' + (r.m2u ? '<a class="btn pri" href="' + esc(r.m2u) + '" target="_blank" rel="noopener">' + ic(I.bank) + 'Maybank2u Biz ↗</a>' : '') + (s.n ? '<button class="btn" data-act="payXls">⬇ Excel</button>' : '') + '</div></section>';
    var rows = r.groups.map(function (g, i) { return supRow(r, g, i); }).join('');
    if (r.hr) rows += hrRowsHtml(r);
    var table = rows ? '<section class="glass pad"><div class="tw"><table class="t paysum"><thead><tr><th>' + (r.hr ? 'Payee' : 'Supplier') + '</th><th class="n">Inv.</th><th class="n">Amount</th><th>Status</th><th class="n"></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="note" style="margin-top:10px">Pay date is set automatically from each supplier\'s credit terms and pay day (latest pay day before the due date; overdue invoices go to the next pay day). Tap a row to see its invoices.</div></section>'
      : '<section class="glass pad"><div class="empty">✅ Nothing is scheduled for ' + esc(r.day) + ' ' + esc(ymdS(r.ymd)) + '.</div></section>';
    view(tabs + head + table + '<div class="note" style="text-align:center">FIRAX never makes payments or stores bank account numbers — pay in Maybank2u Biz using saved favourites.</div>');
  }
  function stBadge(g) {
    if (g.paid >= g.total - 0.004) return chip('✅ Paid', 'g');
    var nU = g.items.filter(function (x) { return x.st === 'Baru' || x.st === 'Disemak'; }).length;
    if (nU === g.items.length) return chip('Needs approval', 'y');
    if (nU) return chip(nU + ' need approval', 'y');
    return chip('Ready to pay', 'g');
  }
  function supRow(r, g, i) {
    var done = g.paid >= g.total - 0.004, unap = g.items.filter(function (x) { return x.st === 'Baru' || x.st === 'Disemak'; }), ready = g.items.filter(function (x) { return x.st === 'Diluluskan'; });
    var late = g.items.some(function (x) { return x.late && x.st !== 'Dibayar'; });
    var act = done ? (g.items[0].slip ? link(g.items[0].slip, 'Slip') : '') :
      (unap.length && r.canApprove ? '<button class="btn sm" data-act="payApproveG" data-g="' + i + '">Approve</button>' : '') +
      (ready.length && r.canEdit ? '<button class="btn sm" data-act="payCopy" data-t="' + g.ready.toFixed(2) + '" title="Copy amount">Copy RM</button><button class="btn sm pri" data-act="payMark" data-k="sup" data-g="' + i + '">Mark paid</button>' : '');
    var det = '<tr class="pdet" id="pd-' + i + '" hidden><td colspan="5"><div class="pdl">' + g.items.map(function (x) {
      return '<div class="pdi' + (x.st === 'Dibayar' ? ' paid' : '') + '"><span>' + esc(CAWN[x.caw] || x.caw) + '</span><b>' + show(x.inv) + '</b><span>due ' + show(x.due) + (x.late && x.st !== 'Dibayar' ? ' <em class="r">overdue</em>' : '') + '</span><span class="n">' + rmf(x.amt) + '</span><span>' + chip(en(x.st), x.st === 'Diluluskan' || x.st === 'Dibayar' ? 'g' : 'y') + '</span><span>' + link(x.file, 'Invoice') + '</span></div>';
    }).join('') + (r.canEdit ? '<div class="pdm">Reference to type in M2U: <b>' + esc(payRef(g)) + '</b> <button class="btn sm" data-act="payCopy" data-t="' + esc(payRef(g)) + '">Copy</button></div>' : '') + '</div></td></tr>';
    return '<tr class="prow' + (done ? ' done' : '') + '" data-act="payTog" data-g="' + i + '"><td><b>' + esc(g.label) + '</b>' + (late ? ' <span class="chip r">Overdue</span>' : '') + '<div class="muted" style="font-size:11px">' + esc(g.tujuan || '') + (g.email ? ' · ✉ email reply' : '') + '</div></td><td class="n">' + g.items.length + '</td><td class="n"><b>' + rmf(done ? g.total : g.total - g.paid) + '</b></td><td>' + stBadge(g) + '</td><td class="n pact">' + act + '</td></tr>' + det;
  }
  function hrRowsHtml(r) {
    var out = (r.sambilan || []).map(function (p, i) {
      var st = p.hold ? chip('On hold (HR)', 'r') : !p.final ? chip('Final from the 4th', 'w') : chip('Ready to pay', 'g');
      return '<tr class="prow"><td><b>' + esc(p.name) + '</b><div class="muted" style="font-size:11px">Part-time · ' + esc(CAWN[p.caw] || p.caw) + ' · ' + p.rows.map(function (x) { return esc(x.mon); }).join(', ') + '</div></td><td class="n">' + p.rows.length + '</td><td class="n"><b>' + rmf(p.amt) + '</b></td><td>' + st + '</td><td class="n pact">' + (!p.hold && p.final && r.canEdit ? '<button class="btn sm" data-act="payCopy" data-t="' + p.amt.toFixed(2) + '">Copy RM</button><button class="btn sm pri" data-act="payMark" data-k="sambilan" data-g="' + i + '">Mark paid</button>' : '') + '</td></tr>';
    }).join('');
    if (r.bday && r.bday.length) out += '<tr class="prow" data-act="payTog" data-g="bd"><td><b>🎁 Birthday gifts</b><div class="muted" style="font-size:11px">' + r.bday.map(function (b) { return esc(b.name.split(' ')[0]); }).join(', ') + '</div></td><td class="n">' + r.bday.length + '</td><td class="n"><b>' + rmf(r.bday.length * 100) + '</b></td><td>' + chip('Ready to pay', 'g') + '</td><td class="n pact">' + (r.canEdit ? '<button class="btn sm pri" data-act="payMark" data-k="hadiah">Mark paid</button>' : '') + '</td></tr>' +
      '<tr class="pdet" id="pd-bd" hidden><td colspan="5"><div class="pdl">' + r.bday.map(function (b) { return '<div class="pdi"><span>' + esc(CAWN[b.caw] || b.caw) + '</span><b>' + esc(b.name) + '</b><span>🎂 ' + esc(b.bd) + (b.late ? ' <em class="r">late</em>' : '') + '</span><span class="n">RM100.00</span></div>'; }).join('') + '</div></td></tr>';
    return out;
  }
  A.payTog = function (el, e) { if (e && e.target.closest('button,a')) return; var d = $('#pd-' + el.getAttribute('data-g')); if (d) { d.hidden = !d.hidden; el.classList.toggle('open', !d.hidden); } };
  A.payApproveG = function (el) {
    var g = S.pay.groups[+el.getAttribute('data-g')], rows = g.items.filter(function (x) { return x.st === 'Baru' || x.st === 'Disemak'; }).map(function (x) { return x.row; });
    el.disabled = true; el.textContent = 'Approving…';
    rpc('fxPayApprove', [S.token, rows]).then(function (x) { toast('✅ ' + g.label + ': ' + x.approved + ' invoice' + (x.approved > 1 ? 's' : '') + ' approved'); renderPay(S.pay.ymd); }).catch(function (e) { el.disabled = false; el.textContent = 'Approve'; toast(e.error, true); });
  };
  function ymdS(y) { var p = String(y).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  /** Rujukan pendek untuk M2U (had 20 aksara): SOFWAH + 4 digit akhir invois. */
  function payRef(g) { var r = 'SOFWAH ' + g.items.filter(function (x) { return x.st !== 'Dibayar'; }).map(function (x) { return String(x.inv || '').replace(/\D/g, '').slice(-4); }).filter(String).join(' '); return r.slice(0, 20).trim(); }
  function copyTxt(t) {
    var ok = function () { toast('Copied: ' + t); };
    try { if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t).then(ok).catch(function () { fb(); }); } catch (e) {}
    fb();
    function fb() { var a = document.createElement('textarea'); a.value = t; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); ok(); } catch (e) { toast('Copy not allowed here — select the text manually', true); } a.remove(); }
  }
  A.payCopy = function (el) { copyTxt(el.getAttribute('data-t')); };
  A.payD = function (el) { S.payD = el.getAttribute('data-d'); view('<div class="skel" style="height:300px"></div>'); renderPay(S.payD); };
  A.payFolder = function (el) {
    el.disabled = true; toast('Preparing payment folder…');
    rpc('fxPayFolder', [S.token, S.pay.ymd]).then(function (x) { el.disabled = false; window.open(x.url, '_blank'); toast('Folder ' + x.name + (x.added ? ' · ' + x.added + ' invoices added' : '')); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };
  A.payFile = function (el) {
    el.disabled = true; toast('Renaming & filing invoices…');
    rpc('fxPayFileNow', [S.token]).then(function (x) { toast(x.filed + ' invoices filed' + (x.errors ? ' · ' + x.errors + ' failed' : '')); renderPay(S.pay.ymd); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };
  A.payApprove = function (el) {
    var rows = Array.prototype.map.call(document.querySelectorAll('.pka:checked'), function (c) { return +c.value; });
    if (!rows.length) { toast('Select invoices to approve', true); return; }
    el.disabled = true;
    rpc('fxPayApprove', [S.token, rows]).then(function (x) { toast(x.approved + ' invoices approved · added to payment schedule'); renderPay(S.pay.ymd); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };
  A.payMark = function (el) {
    var k = el.getAttribute('data-k'), gi = +el.getAttribute('data-g'), r = S.pay, rows, title, total, needSlip = k === 'sup', key = '';
    if (k === 'sup') { var g = r.groups[gi]; key = g.key; rows = g.items.filter(function (x) { return x.st === 'Diluluskan'; }).map(function (x) { return x.row; }); total = g.items.filter(function (x) { return rows.indexOf(x.row) >= 0; }).reduce(function (a, x) { return a + x.amt; }, 0); title = g.label; }
    else if (k === 'sambilan') { var p = r.sambilan[gi]; key = p.name; rows = p.rows.map(function (x) { return x.row; }); total = p.amt; title = 'Part-time · ' + p.name; }
    else { rows = (r.bday || []).map(function (b) { return b.row; }); total = rows.length * 100; title = 'Birthday gift · ' + rows.length + ' staff'; }
    if (!rows.length) { toast('Select at least one row', true); return; }
    S.payM = { kind: k, key: key, rows: rows };
    modal('<h3>Mark as paid</h3><p class="note" style="margin:6px 0 14px">' + esc(title) + ' · ' + rows.length + ' rows · <b style="color:#2fe07a">' + rmf(total) + '</b><br>Make sure the M2U amount matches this total.</p>' +
      field('M2U payment slip (PDF / image)' + (needSlip ? '' : ' · optional'), '<input type="file" id="pslip" accept="application/pdf,image/*">') +
      field('M2U transaction reference', '<input id="pref" placeholder="e.g. M2U 1234567890">') +
      field('Payment date', '<input type="date" id="pdate" value="' + esc(r.today) + '" max="' + esc(r.today) + '">') +
      (k === 'sup' && r.autoMail ? '<p class="note">Once saved, an email reply with the slip is sent to the supplier within ±30 minutes (only for invoices received by email).</p>' : '') +
      '<div class="row-btn"><button class="btn" data-act="closeModal">Cancel</button><button class="btn pri" id="psave" data-act="paySave">Save</button></div>');
  };
  A.paySave = function (el) {
    var m = S.payM, f = $('#pslip').files[0], ref = val('pref'), d = val('pdate');
    if (!ref) { toast('Enter the M2U reference', true); return; }
    if (m.kind === 'sup' && !f) { toast('Upload the payment slip', true); return; }
    if (f && f.size > 10 * 1048576) { toast('File too large (10MB limit)', true); return; }
    el.disabled = true; el.textContent = 'Saving…';
    var send = function (b64) {
      rpc('fxPaySlip', [S.token, { ymd: S.pay.ymd, kind: m.kind, key: m.key, rows: m.rows, ref: ref, paid: d, b64: b64 || '', mime: f ? f.type : '', name: f ? f.name : '' }])
        .then(function (x) { closeModal(); toast('✅ ' + x.n + ' rows marked Paid' + (x.name ? ' · slip: ' + x.name : '')); renderPay(S.pay.ymd); })
        .catch(function (e) { el.disabled = false; el.textContent = 'Save'; toast(e.error, true); });
    };
    if (!f) return send('');
    var rd = new FileReader(); rd.onload = function () { send(String(rd.result).split(',')[1]); }; rd.onerror = function () { el.disabled = false; toast('Could not read the file', true); }; rd.readAsDataURL(f);
  };

  /* ======================= Muat turun Excel (SheetJS, dimuat bila perlu) ======================= */
  function needXlsx() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    return new Promise(function (ok, bad) { var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = function () { ok(window.XLSX); }; s.onerror = function () { bad({ error: 'Could not load the Excel module. Check your internet connection and try again.' }); }; document.head.appendChild(s); });
  }
  /** sheets = [{ n: 'Nama tab', rows: [[...], ...], w: [lebar lajur] }] */
  function dlXlsx(file, sheets) {
    toast('Preparing Excel file…');
    return needXlsx().then(function (X) {
      var wb = X.utils.book_new();
      sheets.forEach(function (s) { var ws = X.utils.aoa_to_sheet(s.rows); if (s.w) ws['!cols'] = s.w.map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, ws, s.n.slice(0, 31)); });
      X.writeFile(wb, file.replace(/[\\\/:*?"<>|]+/g, ' ') + '.xlsx');
      toast('File downloaded: ' + file + '.xlsx');
    }).catch(function (e) { toast((e && e.error) || 'Download failed', true); });
  }
  function r2(n) { return Math.round((n || 0) * 100) / 100; }

  /* ======================= Penyata Akaun Supplier (SOA) ======================= */
  var SOAP = [['m1', 'This month'], ['m3', '3 months'], ['m6', '6 months'], ['ytd', 'Year to date'], ['y12', '12 months']];
  function soaRange(p, t) {
    var d = new Date(t + 'T00:00:00'), f = function (x) { return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); };
    if (p === 'm1') return [t.slice(0, 8) + '01', t];
    if (p === 'ytd') return [t.slice(0, 4) + '-01-01', t];
    var n = { m3: 3, m6: 6, y12: 12 }[p] || 3, s = new Date(d.getFullYear(), d.getMonth() - n + 1, 1); return [f(s), t];
  }
  function renderSoa() {
    var o = S.soaQ || {};
    rpc('fxSoa', [S.token, o.sup || '', o.from || '', o.to || '']).then(function (r) { S.soa = r; S.soaQ = { sup: o.sup || '', from: r.from, to: r.to, p: o.p || (o.from ? '' : 'ytd') }; soaView(r); }).catch(fail);
  }
  function dmy(y) { return y ? y.slice(8, 10) + '/' + y.slice(5, 7) + '/' + y.slice(0, 4) : '—'; }
  function soaView(r) {
    var q = S.soaQ, f = (S.soaF || '').toLowerCase();
    var list = r.vendors.filter(function (v) { return !f || (v.key + ' ' + v.short + ' ' + v.kod).toLowerCase().indexOf(f) >= 0; });
    var totOut = r.vendors.reduce(function (a, v) { return a + v.out; }, 0), totLate = r.vendors.reduce(function (a, v) { return a + v.late; }, 0);
    var side = '<aside class="glass pad soa-list"><div class="kicker">Vendor list · ' + r.vendors.length + '</div>' +
      '<div class="soa-sum"><div><small>Total outstanding</small><b>' + rmf(totOut) + '</b></div><div><small>Overdue</small><b style="color:#ff8b8b">' + rmf(totLate) + '</b></div></div>' +
      '<input class="inp" id="soaq" placeholder="Search vendors…" value="' + esc(S.soaF || '') + '">' +
      '<select class="inp soa-sel" data-act="none" id="soasel"><option value="">— Select vendor —</option>' + r.vendors.map(function (v) { return '<option value="' + esc(v.key) + '"' + (v.key === q.sup ? ' selected' : '') + '>' + esc(v.short) + (v.out ? ' · ' + rmf(v.out) : '') + '</option>'; }).join('') + '</select>' +
      '<div class="soa-vs">' + list.map(function (v) {
        return '<button class="soa-v' + (v.key === q.sup ? ' on' : '') + '" data-act="soaPick" data-k="' + esc(v.key) + '"><span><b>' + esc(v.short) + '</b><small>' + esc(v.kod || 'No code') + ' · ' + v.n + ' invoices</small></span><em class="' + (v.late ? 'r' : v.out ? 'y' : '') + '">' + (v.out ? rmf(v.out) : '✓') + '</em></button>';
      }).join('') + (list.length ? '' : '<div class="empty">No matches</div>') + '</div></aside>';
    var main = r.soa ? soaBody(r) : '<section class="glass pad"><div class="empty" style="padding:60px 20px"><div style="font-size:42px">📒</div><h3>Select a vendor on the left</h3><p class="note">Full statement of account: opening balance, invoices, payments, running balance, AP aging, payment performance, purchases by branch & item, and 2027 negotiation insights.</p></div></section>';
    view('<div class="soa">' + side + '<div class="stack">' + periodBar(q) + main + '</div></div>');
    var inp = $('#soaq'); if (inp) inp.oninput = function () { S.soaF = this.value; var pos = this.selectionStart; soaView(S.soa); var n = $('#soaq'); n.focus(); n.setSelectionRange(pos, pos); };
    var sel = $('#soasel'); if (sel) sel.onchange = function () { if (this.value) { S.soaQ.sup = this.value; view('<div class="skel" style="height:300px"></div>'); renderSoa(); } };
  }
  function periodBar(q) {
    return '<section class="glass pad soa-per"><div class="chips">' + SOAP.map(function (p) { return '<button class="pill' + (q.p === p[0] ? ' on' : '') + '" data-act="soaP" data-p="' + p[0] + '">' + p[1] + '</button>'; }).join('') + '</div>' +
      '<div class="soa-dates"><label>From <input type="date" class="inp" id="sf" value="' + esc(q.from) + '"></label><label>To <input type="date" class="inp" id="st" value="' + esc(q.to) + '"></label><button class="btn sm" data-act="soaGo">Show</button></div>' +
      (S.soa && S.soa.soa ? '<div class="soa-dl"><button class="btn sm pri" data-act="soaXls">⬇ Excel</button><button class="btn sm" data-act="print">⬇ PDF / Print</button></div>' : '') + '</section>';
  }
  function soaBody(r) {
    var s = r.soa, v = s.sup, agTot = s.aging.reduce(function (a, x) { return a + x.v; }, 0), lateAmt = agTot - s.aging[0].v;
    var head = '<section class="glass pad soa-head"><div><div class="kicker">Supplier Statement of Account</div><h2>' + esc(v.key) + '</h2>' +
      '<div class="meta">' + (v.kod ? chip(v.kod) : '') + chip('Terms ' + (v.terma || '—') + ' days') + chip('Pay day: ' + (en(v.hari) || '—')) + (v.email ? '<span class="chip">✉ ' + esc(v.email) + '</span>' : '<span class="chip w">' + esc(v.chan || 'No email') + '</span>') + (v.folder ? '<a class="chip" href="' + esc(v.folder) + '" target="_blank" rel="noopener">📁 Invoice & slip folder</a>' : '') + '</div>' +
      '<div class="note">Period ' + dmy(s.from) + ' – ' + dmy(s.to) + ' · prepared ' + dmy(r.today) + ' by ' + esc(S.me.name) + ' · Sofwah Arabiata (M) Sdn Bhd</div></div>' +
      '<div class="soa-bal"><small>Closing balance (outstanding)</small><b>' + rmf(s.close) + '</b><span>' + (lateAmt ? '<i class="r">' + rmf(lateAmt) + ' overdue</i>' : '<i class="g">Nothing overdue</i>') + '</span></div></section>';
    var tiles = '<section class="cards soa-k">' + [
      ['Purchases (period)', rmf(s.spend), s.invN + ' invoices · average ' + rmf(s.avgInv)],
      ['Share of AP spend', s.share === null ? '—' : s.share.toFixed(1) + '%', s.rank ? 'Rank #' + s.rank + ' / ' + s.ranks + ' suppliers' : ''],
      ['Annualised run-rate', rmf(s.annual), 'Basis for 2027 negotiation'],
      ['Days payable outstanding (DPO)', s.dpo === null ? '—' : Math.round(s.dpo) + ' days', s.paidN + ' invoices paid'],
      ['On-time payment rate', s.ontime === null ? '—' : Math.round(s.ontime) + '%', 'Target ≥ 95%']
    ].map(function (k) { return '<div class="glass card"><small>' + esc(k[0]) + '</small><div class="v">' + esc(k[1]) + '</div><span class="note">' + esc(k[2]) + '</span></div>'; }).join('') + '</section>';
    var recon = '<div class="soa-rec"><div><small>Opening balance ' + dmy(s.from) + '</small><b>' + rmf(s.open) + '</b></div><span>+</span><div><small>Invoices (debit)</small><b>' + rmf(s.dr) + '</b></div><span>−</span><div><small>Payments (credit)</small><b>' + rmf(s.cr) + '</b></div><span>=</span><div class="tot"><small>Closing balance ' + dmy(s.to) + '</small><b>' + rmf(s.close) + '</b></div></div>';
    var txRows = '<tr class="ob"><td>' + dmy(s.from) + '</td><td></td><td></td><td>Balance brought forward</td><td></td><td></td><td class="n"><b>' + rmf(s.open) + '</b></td></tr>' + s.tx.map(function (t) {
      return '<tr><td>' + dmy(t.d) + '</td><td>' + (t.t === 'INV' ? '<span class="chip">INV</span>' : '<span class="chip g">PMT</span>') + '</td><td>' + (/^https?:/.test(t.file || '') ? '<a href="' + esc(t.file) + '" target="_blank" rel="noopener">' + esc(t.ref) + '</a>' : esc(t.ref)) + '</td><td>' + esc(t.desc) + '</td><td class="n">' + (t.dr ? rmf(t.dr) : '') + '</td><td class="n">' + (t.cr ? rmf(t.cr) : '') + '</td><td class="n">' + rmf(t.bal) + '</td></tr>';
    }).join('') + '<tr class="ob"><td>' + dmy(s.to) + '</td><td></td><td></td><td><b>Closing balance</b></td><td class="n"><b>' + rmf(s.dr) + '</b></td><td class="n"><b>' + rmf(s.cr) + '</b></td><td class="n"><b>' + rmf(s.close) + '</b></td></tr>';
    var stmt = '<section class="glass pad"><div class="sec-h"><h3>Statement of account</h3><span class="note">' + s.tx.length + ' transactions · click a reference to open the invoice / slip</span></div>' + recon +
      '<div class="tw"><table class="t soa-t"><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Description</th><th class="n">Debit (invoices)</th><th class="n">Credit (payments)</th><th class="n">Running balance</th></tr></thead><tbody>' + txRows + '</tbody></table></div></section>';
    var agCols = ['g', 'y', 'o', 'r', 'r'];
    var aging = '<section class="glass pad"><div class="sec-h"><h3>AP aging as at ' + dmy(s.to) + '</h3><span class="note">By days past the due date</span></div>' +
      '<div class="agebar">' + s.aging.map(function (a, i) { return a.v ? '<i class="' + agCols[i] + '" style="flex:' + a.v + '" title="' + esc(a.l) + '"></i>' : ''; }).join('') + (agTot ? '' : '<i class="g" style="flex:1"></i>') + '</div>' +
      '<div class="agegrid">' + s.aging.map(function (a, i) { return '<div><span class="dot ' + (agCols[i] === 'o' ? 'y' : agCols[i]) + '"></span><small>' + esc(a.l) + '</small><b>' + rmf(a.v) + '</b><em>' + a.n + ' invoices · ' + (agTot ? Math.round(a.v / agTot * 100) : 0) + '%</em></div>'; }).join('') + '</div>' +
      (s.openInv.length ? '<details' + (lateAmt ? ' open' : '') + '><summary class="note" style="cursor:pointer;margin-top:10px">Unpaid invoices (' + s.openInv.length + ')</summary><div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th>Invoice no.</th><th>Branch</th><th>Date</th><th>Due date</th><th class="n">Days overdue</th><th class="n">Amount</th><th>Status</th></tr></thead><tbody>' +
        s.openInv.map(function (x) { return '<tr><td>' + (/^https?:/.test(x.file || '') ? '<a href="' + esc(x.file) + '" target="_blank" rel="noopener">' + esc(x.inv || x.id) + '</a>' : esc(x.inv || x.id)) + '</td><td>' + esc(CAWN[x.caw] || x.caw) + '</td><td>' + dmy(x.d) + '</td><td>' + dmy(x.due) + '</td><td class="n">' + (x.late > 0 ? '<b style="color:#ff8b8b">' + x.late + '</b>' : '—') + '</td><td class="n">' + rmf(x.amt) + '</td><td>' + chip(en(x.st), x.st === 'Diluluskan' ? 'g' : 'w') + '</td></tr>'; }).join('') + '</tbody></table></div></details>' : '') + '</section>';
    var cawMax = s.byCaw.length ? s.byCaw[0].v : 1;
    var charts = '<section class="grid2"><div class="glass pad"><div class="sec-h"><h3>Purchases by month</h3></div>' + barChart(s.months.map(function (m) { return { l: m.m.slice(5) + '/' + m.m.slice(2, 4), v: m.v }; }), { a: 'Purchases (RM)', w: 560 }) + '</div>' +
      '<div class="glass pad"><div class="sec-h"><h3>Purchases by branch</h3></div>' + (s.byCaw.length ? hbars(s.byCaw.map(function (c) { return { l: CAWN[c.caw] || c.caw, v: s.spend ? c.v / s.spend * 100 : 0, sub: rmf(c.v), lamp: 'g' }; }), { max: 100 }) : '<div class="empty">No purchases in this period</div>') + '</div></section>';
    var items = '<section class="glass pad"><div class="sec-h"><div><h3>Items & pricing</h3><div class="note">From AP › Item Invois tab · ' + s.itemRows + ' rows</div></div></div>' + (s.items.length ?
      '<div class="tw"><table class="t"><thead><tr><th>Item</th><th>Unit</th><th class="n">Quantity</th><th class="n">Amount</th><th class="n">Average price</th><th class="n">Min – Max</th><th class="n">Latest</th><th class="n">Change</th></tr></thead><tbody>' +
      s.items.map(function (o) { return '<tr><td><b>' + esc(o.item) + '</b><div class="muted" style="font-size:11px">' + o.n + ' purchases</div></td><td>' + esc(o.unit || '—') + '</td><td class="n">' + fnum(o.qty, o.qty % 1 ? 2 : 0) + '</td><td class="n">' + rmf(o.amt) + '</td><td class="n">' + (o.avg ? rmf(o.avg) : '—') + '</td><td class="n">' + (o.pmin !== null ? rmf(o.pmin) + ' – ' + rmf(o.pmax) : '—') + '</td><td class="n">' + (o.plast !== null ? rmf(o.plast) : '—') + '</td><td class="n">' + (o.chg === null ? '—' : '<b style="color:' + (o.chg > 0.5 ? '#ff8b8b' : o.chg < -0.5 ? '#2fe07a' : 'inherit') + '">' + (o.chg > 0 ? '+' : '') + o.chg.toFixed(1) + '%</b>') + '</td></tr>'; }).join('') + '</tbody></table></div>'
      : '<div class="empty">No item details for this vendor yet. Record items, quantities and prices in the <b>Item Invois</b> tab (AP file) when invoices are entered — FIRAX will calculate volumes and price changes automatically.</div>') + '</section>';
    var tips = '<section class="glass pad soa-tips"><div class="sec-h"><h3>🎯 Supplier negotiation insights 2027</h3><span class="note">Generated from data, not assumptions</span></div>' + s.tips.map(function (t) { return '<div class="tip"><span class="dot ' + t[0] + '"></span><p>' + esc(t[1]) + '</p></div>'; }).join('') + '</section>';
    return head + tiles + tips + stmt + aging + charts + items;
  }
  A.soaPick = function (el) { S.soaQ.sup = el.getAttribute('data-k'); view('<div class="skel" style="height:300px"></div>'); renderSoa(); window.scrollTo(0, 0); };
  A.soaP = function (el) { var p = el.getAttribute('data-p'), rg = soaRange(p, S.soa.today); S.soaQ.p = p; S.soaQ.from = rg[0]; S.soaQ.to = rg[1]; renderSoa(); };
  A.soaGo = function () { var f = val('sf'), t = val('st'); if (!f || !t) { toast('Select dates', true); return; } S.soaQ.from = f; S.soaQ.to = t; S.soaQ.p = ''; renderSoa(); };
  A.soaXls = function () {
    var r = S.soa, s = r.soa, v = s.sup, name = 'SOA ' + v.short + ' ' + dmy(s.from).replace(/\//g, '') + '-' + dmy(s.to).replace(/\//g, '');
    var st = [['SUPPLIER STATEMENT OF ACCOUNT'], ['Sofwah Arabiata (M) Sdn Bhd'], ['Supplier', v.key], ['Code', v.kod], ['Credit terms (days)', v.terma], ['Period', dmy(s.from) + ' – ' + dmy(s.to)], ['Prepared', dmy(r.today) + ' by ' + S.me.name], [],
      ['Date', 'Type', 'Reference', 'Description', 'Debit (invoices) RM', 'Credit (payments) RM', 'Running balance RM'], [dmy(s.from), '', '', 'Balance brought forward', '', '', r2(s.open)]]
      .concat(s.tx.map(function (t) { return [dmy(t.d), t.t === 'INV' ? 'Invoice' : 'Payment', t.ref, t.desc, t.dr ? r2(t.dr) : '', t.cr ? r2(t.cr) : '', t.bal]; }))
      .concat([[dmy(s.to), '', '', 'CLOSING BALANCE', r2(s.dr), r2(s.cr), r2(s.close)]]);
    var ag = [['AP AGING as at ' + dmy(s.to)], ['Category', 'No. of invoices', 'Amount RM']].concat(s.aging.map(function (a) { return [a.l, a.n, r2(a.v)]; })).concat([[], ['Invoice no.', 'Branch', 'Date', 'Due date', 'Days overdue', 'Amount RM', 'Status']])
      .concat(s.openInv.map(function (x) { return [x.inv || x.id, CAWN[x.caw] || x.caw, dmy(x.d), dmy(x.due), Math.max(0, x.late), r2(x.amt), en(x.st)]; }));
    var an = [['ANALYSIS & NEGOTIATION 2027'], ['Purchases (period) RM', r2(s.spend)], ['No. of invoices', s.invN], ['Average invoice RM', r2(s.avgInv)], ['Share of AP spend %', s.share === null ? '' : r2(s.share)], ['Rank', s.rank + ' / ' + s.ranks], ['Annualised run-rate RM', r2(s.annual)], ['Days payable outstanding (DPO)', s.dpo === null ? '' : Math.round(s.dpo)], ['On-time payment rate %', s.ontime === null ? '' : Math.round(s.ontime)], [],
      ['Month', 'Purchases RM']].concat(s.months.map(function (m) { return [m.m, m.v]; })).concat([[], ['Branch', 'Purchases RM']]).concat(s.byCaw.map(function (c) { return [CAWN[c.caw] || c.caw, r2(c.v)]; })).concat([[], ['Insights']]).concat(s.tips.map(function (t) { return [t[1]]; }));
    var it = [['Item', 'Unit', 'Quantity', 'Amount RM', 'Average price RM', 'Min price RM', 'Max price RM', 'Latest price RM', 'Change %', 'Times purchased']].concat(s.items.map(function (o) { return [o.item, o.unit, r2(o.qty), r2(o.amt), o.avg ? r2(o.avg) : '', o.pmin, o.pmax, o.plast, o.chg === null ? '' : r2(o.chg), o.n]; }));
    dlXlsx(name, [{ n: 'Statement', rows: st, w: [12, 9, 16, 46, 16, 16, 14] }, { n: 'AP aging', rows: ag, w: [22, 14, 12, 12, 10, 12, 12] }, { n: 'Analysis', rows: an, w: [26, 16] }, { n: 'Items & pricing', rows: it, w: [30, 8, 10, 12, 14, 12, 12, 14, 12, 10] }]);
  };
  /* Muat turun senarai run bayaran (untuk M2U / rekod) */
  A.payXls = function () {
    var r = S.pay, rows = [['PAYMENT LIST ' + r.day.toUpperCase() + ' ' + ymdS(r.ymd)], ['Approved items only. For bank account numbers, see M2U / the HR file (not stored in FIRAX).'], [], ['Payee', 'Branch', 'Invoice no. / item', 'Invoice date', 'Due date', 'Amount RM', 'Status', 'Payment reference']];
    r.groups.forEach(function (g) { g.items.forEach(function (x) { rows.push([g.label, CAWN[x.caw] || x.caw, x.inv, x.tinv, x.due, r2(x.amt), x.st, x.ref || '']); }); rows.push(['', '', '', '', 'Total ' + g.label, r2(g.total), '', '']); });
    if (r.hr) { (r.sambilan || []).forEach(function (p) { rows.push(['Part-time · ' + p.name, CAWN[p.caw] || p.caw, p.rows.map(function (x) { return x.mon; }).join(', '), '', '', r2(p.amt), p.hold ? 'ON HOLD — do not pay' : p.final ? 'Payable' : 'Not final yet', '']); }); (r.bday || []).forEach(function (b) { rows.push(['Birthday gift · ' + b.name, CAWN[b.caw] || b.caw, 'Birthday ' + b.bd, '', ymdS(b.pay), 100, 'Not yet paid', '']); }); }
    rows.push([], ['', '', '', '', 'TOTAL TO PAY', r2(r.sum.due - r.sum.paid)]);
    dlXlsx('Payments ' + r.day + ' ' + ymdS(r.ymd).replace(/\//g, ''), [{ n: 'Payment list', rows: rows, w: [30, 14, 20, 12, 18, 12, 20, 18] }]);
  };

  /* ======================= Reconciliation (v2.5 — check & balance first) =======================
   * Layout: verdict → heat map (done / not done) → check & balance for the chosen day → 30-day totals.
   * Data-completion work (download / paste statements, reasons owed) sits in a side panel, not in the way. */
  var RK = { match: ['g', 'Balanced'], explained: ['e', 'Explained'], short: ['r', 'Short'], over: ['y', 'Over'], wait: ['w', 'Waiting for bank'] };
  var REASONS = ['Weekend card settlement — timing only, lands next working day', 'Bank statement for this date not downloaded yet', 'QR paid into another branch / HQ account', 'Sale not keyed correctly in FeedMe (POS error)', 'Cash not yet banked in', 'Refund / void after closing'];
  var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function renderRecon() {
    var c = kept('recon'); if (c && !S.recon) S.recon = c;
    if (S.recon) reconView(S.recon);
    rpc('fxRecon', [S.token]).then(function (r) { var ch = JSON.stringify(r) !== JSON.stringify(S.recon); S.recon = r; keep('recon', r); if (ch && S.page === 'recon') reconView(r); }).catch(function (e) { if (!S.recon) fail(e); });
  }
  function rd(y) { return y ? y.slice(8, 10) + '/' + y.slice(5, 7) : '—'; }
  function rmx(n) { return n === null || n === undefined ? '—' : (n < 0 ? '−' : '') + 'RM' + fnum(Math.abs(n), 2); }
  function rk0(n) { return n === null || n === undefined ? '' : (n < 0 ? '−' : '+') + fnum(Math.abs(n), 0); }
  function ymdAdd(y, n) { var d = new Date(y + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dowOf(y) { return new Date(y + 'T00:00:00').getDay(); }
  function isNeed(x) { return x.kind === 'short' || x.kind === 'over'; }

  function rmd(n) { return n === null || n === undefined ? '—' : (n > 0.004 ? '+' : '') + rmx(n); }
  /* Client-side tidy: fill blank differences, and a day with sales but no bank figure is "waiting for bank" (statement missing), not a real difference. */
  function recNorm(r0) {
    var r = JSON.parse(JSON.stringify(r0)), sub = function (a, b) { return a === null || b === null || a === undefined || b === undefined ? null : Math.round((a - b) * 100) / 100; };
    r.days.forEach(function (x) {
      x.ch.forEach(function (c) { if (c.diff === null || c.diff === undefined) c.diff = sub(c.rec, c.exp); });
      if (x.diff === null || x.diff === undefined) x.diff = sub(x.rec, x.exp);
      if (x.kind !== 'wait' && x.rec === null && x.exp !== null) { x.kind = 'wait'; x.miss = true; }
    });
    r.openAmt = r.days.filter(isNeed).reduce(function (a, x) { return a + Math.abs(x.diff || 0); }, 0);
    return r;
  }
  function reconView(r0) {
    var r = recNorm(r0), from = ymdAdd(r.today, -30), last = r.days.filter(function (x) { return x.d >= from; }), byD = {};
    r.days.forEach(function (x) { byD[x.d] = x; });
    var cnt = { match: 0, explained: 0, short: 0, over: 0, wait: 0 }; last.forEach(function (x) { cnt[x.kind]++; });
    var need = r.days.filter(isNeed), wait = r.days.filter(function (x) { return x.kind === 'wait'; });
    var checked = cnt.match + cnt.explained + cnt.short + cnt.over, done = cnt.match + cnt.explained, tol = parseFloat(String(r.tolerance || '5').replace(/,/g, '')) || 5;
    if (!S.recSel || !byD[S.recSel]) S.recSel = (need[0] || r.days.filter(function (x) { return x.kind !== 'wait'; })[0] || r.days[0] || {}).d;
    var todo = (wait.length ? 1 : 0) + (need.length ? 1 : 0);

    /* 1 · Verdict */
    var seg = ['match', 'explained', 'short', 'over', 'wait'].map(function (k) { return cnt[k] ? '<i class="' + k + '" style="flex:' + cnt[k] + '" title="' + RK[k][1] + ' · ' + cnt[k] + '"></i>' : ''; }).join('');
    var verdict = '<section class="glass pad rc-hero"><div class="rc-hl"><div class="kicker">Bank vs sales · last 30 days</div>' +
      '<div class="rc-big' + (need.length ? ' warn' : '') + '">' + done + '<small> of ' + checked + ' days balanced</small></div>' +
      '<div class="note">' + (need.length ? need.length + ' day' + (need.length > 1 ? 's' : '') + ' still need a reason · ' + rmx(r.openAmt) + ' unexplained' : checked ? 'Every checked day is balanced or explained ✓' : 'No days checked yet') +
      (wait.length ? ' · ' + wait.length + ' day' + (wait.length > 1 ? 's' : '') + ' waiting for bank data' : '') + '</div></div>' +
      '<div class="rc-hr"><div class="rc-seg">' + seg + '</div><div class="rc-leg">' +
      ['match', 'explained', 'short', 'over', 'wait'].map(function (k) { return '<span><i class="rc-k ' + k + '"></i>' + RK[k][1] + ' <b>' + cnt[k] + '</b></span>'; }).join('') + '</div>' +
      (todo ? '<button class="rc-todo" data-act="recTodo">⚠ ' + todo + ' thing' + (todo > 1 ? 's' : '') + ' to complete</button>' : '') + '</div></section>';

    /* 2 · Heat map (5 weeks, Sun → Sat) */
    var start = ymdAdd(r.today, -34); start = ymdAdd(start, -dowOf(start));
    var cells = '';
    for (var d = start; d <= ymdAdd(r.today, 6 - dowOf(r.today)); d = ymdAdd(d, 1)) {
      var x = byD[d], fut = d > r.today, k = x ? x.kind : fut ? 'fut' : 'none';
      var lab = x ? (k === 'match' ? '✓' : k === 'explained' ? '✎' : k === 'wait' ? '…' : rk0(x.diff)) : '';
      cells += fut ? '<span class="rc-c fut"></span>' :
        '<button class="rc-c ' + k + (d === S.recSel ? ' sel' : '') + (d === r.today ? ' today' : '') + '"' + (x ? ' data-act="recDay" data-d="' + d + '"' : ' disabled') +
        ' title="' + esc(DOW[dowOf(d)] + ' ' + rd(d) + ' · ' + (x ? RK[k][1] + (x.diff ? ' ' + rmx(x.diff) : '') : 'No sales / closed')) + '"><b>' + d.slice(8, 10) + '</b><small>' + esc(lab) + '</small></button>';
    }
    var heat = '<section class="glass pad"><div class="sec-h"><div><h3>Day by day</h3><div class="note">Green = done · red / amber = needs a reason · grey = waiting for bank. Tap a day to check it.</div></div></div>' +
      '<div class="rc-heat">' + DOW.map(function (w) { return '<span class="rc-w">' + w + '</span>'; }).join('') + cells + '</div></section>';

    /* 3 · Check & balance for the selected day */
    var x = byD[S.recSel], chk = '';
    if (x) {
      var row = function (n, e, rc, df, strong) {
        var ok = x.kind === 'wait' ? null : df === null || df === undefined ? null : Math.abs(df) <= tol;
        return '<tr' + (strong ? ' class="tot"' : '') + '><td>' + esc(n) + '</td><td class="n">' + rmx(e) + '</td><td class="n">' + (x.kind === 'wait' && rc === null ? '<span class="muted">not in yet</span>' : rmx(rc)) + '</td><td class="n ' + (ok === false ? (df < 0 ? 'neg' : 'pos') : '') + '">' + (x.kind === 'wait' ? '—' : rmd(df)) + '</td><td class="ck">' + (ok === null ? '<span class="muted">…</span>' : ok ? '<span class="okk">✓</span>' : '<span class="bad">✗</span>') + '</td></tr>';
      };
      var verdictTxt = { match: 'Balanced — money received matches sales.', explained: 'Difference explained.', short: 'Bank received LESS than sales. Give a reason.', over: 'Bank received MORE than sales. Give a reason.', wait: x.miss ? 'Sales recorded but no bank figure — the statement for this day is missing.' : 'Bank statement for this day is not in yet.' }[x.kind];
      chk = '<section class="glass pad rc-chk ' + x.kind + '" id="recchk"><div class="sec-h"><div><div class="kicker">Check &amp; balance</div><h3>' + DOW[dowOf(x.d)] + ' ' + rd(x.d) + ' ' + chip(RK[x.kind][1], RK[x.kind][0] === 'e' ? 'g' : RK[x.kind][0]) + '</h3></div>' +
        '<div class="rc-nav"><button class="iconbtn" data-act="recStep" data-n="1" title="Older day">‹</button><button class="iconbtn" data-act="recStep" data-n="-1" title="Newer day">›</button></div></div>' +
        '<div class="rc-eq"><div><small>Expected</small><b>' + rmx(x.exp) + '</b><span>FeedMe sales (QR + card + online)</span></div><i>−</i>' +
        '<div><small>Received</small><b>' + (x.kind === 'wait' && x.rec === null ? '—' : rmx(x.rec)) + '</b><span>Money into Maybank</span></div><i>=</i>' +
        '<div class="res"><small>Difference</small><b>' + (x.kind === 'wait' ? '—' : rmd(x.diff)) + '</b><span>' + esc(verdictTxt) + '</span></div></div>' +
        '<div class="tw"><table class="t rc-t"><thead><tr><th>Channel</th><th class="n">Expected</th><th class="n">Received</th><th class="n">Difference</th><th></th></tr></thead><tbody>' +
        x.ch.map(function (c) { return row(c.n.replace(' DuitNow', '').replace(' (EDC)', '').replace('Online banking', 'Online'), c.exp, c.rec, c.diff); }).join('') + row('Total', x.exp, x.rec, x.diff, true) + '</tbody></table></div>' +
        (x.kind === 'explained' && x.note ? '<div class="rc-note">✎ ' + esc(x.note) + '</div>' : '') +
        (isNeed(x) && r.canEdit ? '<div class="rc-why"><b>Why is it different?</b><div class="rq">' + REASONS.map(function (t, i) { return '<button class="chip" data-act="recPick" data-d="' + x.d + '" data-i="' + i + '">' + esc(t.split(' — ')[0]) + '</button>'; }).join('') + '</div>' +
          '<div class="rin"><input class="inp" id="rn-' + x.d + '" placeholder="One sentence — e.g. Saturday card settlement arrived Monday"><button class="btn pri" data-act="recSave" data-d="' + x.d + '">Save reason</button></div><div class="note">Saved to Rekon Harian › column P (Catatan finance).</div></div>' : '') + '</section>';
    }

    /* 4 · 30-day totals by channel (checked days only) */
    var tot = {}, order = [];
    last.forEach(function (y) { if (y.kind === 'wait') return; y.ch.forEach(function (c) { if (c.exp === null || c.rec === null) return; if (!tot[c.n]) { tot[c.n] = { e: 0, r: 0 }; order.push(c.n); } tot[c.n].e += c.exp || 0; tot[c.n].r += c.rec || 0; }); });
    var te = 0, tr = 0;
    var totals = '<section class="glass pad"><div class="sec-h"><div><h3>30-day check &amp; balance</h3><div class="note">' + checked + ' checked days · waiting days left out</div></div></div><div class="tw"><table class="t rc-t rc-tot"><thead><tr><th>Channel</th><th class="n">Expected</th><th class="n">Received</th><th class="n">Difference</th><th class="n">Received %</th></tr></thead><tbody>' +
      order.map(function (n) { var o = tot[n], df = o.r - o.e; te += o.e; tr += o.r; return '<tr><td>' + esc(n) + '</td><td class="n">' + rmx(o.e) + '</td><td class="n">' + rmx(o.r) + '</td><td class="n ' + (Math.abs(df) > tol ? (df < 0 ? 'neg' : 'pos') : '') + '">' + rmd(df) + '</td><td class="n">' + (o.e ? (o.r / o.e * 100).toFixed(1) + '%' : '—') + '</td></tr>'; }).join('') +
      '<tr class="tot"><td>Total</td><td class="n">' + rmx(te) + '</td><td class="n">' + rmx(tr) + '</td><td class="n ' + (Math.abs(tr - te) > tol ? (tr < te ? 'neg' : 'pos') : '') + '">' + rmd(tr - te) + '</td><td class="n">' + (te ? (tr / te * 100).toFixed(1) + '%' : '—') + '</td></tr></tbody></table></div></section>';

    /* Side · To complete */
    var yday = ymdAdd(r.today, -1), side = '<aside class="rc-side" id="rectodo"><section class="glass pad"><div class="kicker">To complete</div>';
    var miss = wait.filter(function (y) { return y.miss; }), late = wait.length - miss.length;
    if (wait.length) side += '<div class="rc-al y"><b>' + (late ? 'Bank data stops at ' + rd(r.bankAsOf) : 'Bank statements missing') + '</b><small>' +
      (late ? late + ' day' + (late > 1 ? 's' : '') + ' can\'t be checked yet. Download ' + rd(r.waitFrom || r.bankAsOf) + ' → ' + rd(yday) + '.' : '') +
      (miss.length ? (late ? '<br>' : '') + 'Also missing: ' + miss.map(function (y) { return rd(y.d); }).reverse().join(', ') + ' (sales recorded, no bank figure).' : '') + '</small>' +
      '<a class="btn pri sm" href="' + esc(r.m2u) + '" target="_blank" rel="noopener">' + ic(I.bank) + '1 · Download in Maybank2u Biz ↗</a><a class="btn sm" href="' + esc(r.urlBank) + '" target="_blank" rel="noopener">2 · Paste in "Bank Maybank" ↗</a></div>';
    if (need.length) side += '<div class="rc-al r"><b>' + need.length + ' day' + (need.length > 1 ? 's' : '') + ' need a reason</b><small>Tap a day, then pick or write a reason.</small><div class="rc-nl">' +
      need.map(function (y) { return '<button data-act="recDay" data-d="' + y.d + '" class="' + y.kind + (y.d === S.recSel ? ' sel' : '') + '"><span>' + DOW[dowOf(y.d)] + ' ' + rd(y.d) + '</span><b>' + rmd(y.diff) + '</b></button>'; }).join('') + '</div></div>';
    if (!todo) side += '<div class="rc-al g"><b>✅ Nothing to complete</b><small>Bank data is current and every difference is explained.</small></div>';
    side += '<div class="rc-meta"><span>Bank data to <b>' + rd(r.bankAsOf) + '</b></span><span>POS data to <b>' + rd(r.feedAsOf) + '</b></span><span>Tolerance <b>RM' + fnum(tol, 2) + '</b> · card/online may land up to ' + esc(r.lagDays || 3) + ' days late</span></div>' +
      '<a class="btn sm ghost" href="' + esc(r.urlRekon) + '" target="_blank" rel="noopener">Open Rekon Harian sheet ↗</a></section></aside>';

    view('<div class="rc-grid"><div class="rc-main">' + verdict + heat + chk + totals + '</div>' + side + '</div>');
  }
  A.recDay = function (el) {
    S.recSel = el.getAttribute('data-d'); reconView(S.recon);
    var c = $('#recchk'); if (c && window.innerWidth < 1100) c.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  A.recStep = function (el) {
    var ds = S.recon.days.map(function (x) { return x.d; }), i = ds.indexOf(S.recSel) + (+el.getAttribute('data-n'));
    if (i >= 0 && i < ds.length) { S.recSel = ds[i]; reconView(S.recon); }
  };
  A.recTodo = function () { var w = $('#rectodo'); if (w) w.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  A.recPick = function (el) { var i = $('#rn-' + el.getAttribute('data-d')); if (i) { i.value = REASONS[+el.getAttribute('data-i')]; i.focus(); } };
  A.recSave = function (el) {
    var d = el.getAttribute('data-d'), t = val('rn-' + d); if (t.length < 5) { toast('Write a short reason first', true); return; }
    el.disabled = true; el.textContent = 'Saving…';
    rpc('fxReconNote', [S.token, d, t]).then(function () {
      toast('Reason saved for ' + rd(d));
      S.recon.days.forEach(function (x) { if (x.d === d) { x.kind = 'explained'; x.note = t; } });
      var nx = S.recon.days.filter(isNeed)[0]; if (nx) S.recSel = nx.d;
      keep('recon', S.recon); reconView(S.recon);
    }).catch(function (e) { el.disabled = false; el.textContent = 'Save reason'; toast(e.error, true); });
  };

  /* ======================= acara & mula ======================= */
  document.addEventListener('click', function (e) {
    if (e.target.closest('a[href]') && !e.target.closest('a[href]').hasAttribute('data-act')) return;
    var el = e.target.closest('[data-act]'); if (!el) return;
    var a = el.getAttribute('data-act'); if (!A[a]) return;
    if (el.tagName === 'A' && el.getAttribute('href')) return;
    e.preventDefault(); A.closeSide && a !== 'openSide' && A.closeSide(); A[a](el, e);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
    if (!S.token && S.pu && $('.pinpad') && !e.target.closest('input')) { if (/^\d$/.test(e.key)) { if (S.pin.length < 4) { S.pin += e.key; dots(); if (S.pin.length === 4) submitPin(); } } else if (e.key === 'Backspace') { S.pin = S.pin.slice(0, -1); dots(); } }
  });
  var tok = sget(TK);
  if (tok) rpc('fxBoot', [tok]).then(function (b) { S.version = b.version; start(tok, b.me, b); }).catch(function (e) { sset(TK, null); renderLogin(e && e.code === 'AUTH' ? '' : ''); });
  else renderLogin();
})();
