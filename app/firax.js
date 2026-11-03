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
    o = o || {}; var W = o.w || 640, H = o.h || 220, P = { l: 46, r: 12, t: 14, b: 28 }, n = data.length; if (!n) return '<div class="empty">Tiada data</div>';
    var max = Math.max.apply(null, data.map(function (d) { return Math.max(d.v || 0, d.t || 0); })) || 1; max *= 1.12;
    var bw = (W - P.l - P.r) / n, y = function (v) { return P.t + (H - P.t - P.b) * (1 - (v || 0) / max); };
    var s = '<div class="chart"><svg viewBox="0 0 ' + W + ' ' + H + '">';
    for (var g = 0; g <= 4; g++) { var gv = max * g / 4, gy = y(gv); s += '<line x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + gy + '" y2="' + gy + '" stroke="rgba(140,255,190,.08)"/><text x="' + (P.l - 8) + '" y="' + (gy + 4) + '" fill="#7f9888" font-size="10" text-anchor="end">' + (gv >= 1e6 ? (gv / 1e6).toFixed(1) + 'j' : gv >= 1000 ? Math.round(gv / 1000) + 'k' : Math.round(gv)) + '</text>'; }
    s += '<defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3af08a"/><stop offset="1" stop-color="#0f6b34"/></linearGradient></defs>';
    data.forEach(function (d, i) {
      var x = P.l + i * bw + bw * .2, w = bw * .6, yy = y(d.v), hit = d.t ? d.v >= d.t : true;
      s += '<rect x="' + x + '" y="' + yy + '" width="' + w + '" height="' + Math.max(0, H - P.b - yy) + '" rx="6" fill="' + (hit ? 'url(#bg1)' : 'rgba(255,181,71,.75)') + '"><title>' + esc(d.l) + ': RM' + fnum(d.v) + (d.t ? ' / sasaran RM' + fnum(d.t) : '') + '</title></rect>';
      s += '<text x="' + (x + w / 2) + '" y="' + (H - 9) + '" fill="#7f9888" font-size="10" text-anchor="middle">' + esc(d.l) + '</text>';
    });
    var tg = data.filter(function (d) { return d.t; });
    if (tg.length) s += '<polyline fill="none" stroke="#ffda7c" stroke-width="2" stroke-dasharray="5 4" points="' + data.map(function (d, i) { return d.t ? (P.l + i * bw + bw / 2) + ',' + y(d.t) : ''; }).filter(Boolean).join(' ') + '"/>';
    s += '</svg><div class="legend"><span><i style="background:#2fe07a"></i>' + esc(o.a || 'Sebenar') + '</span>' + (tg.length ? '<span><i style="background:#ffda7c"></i>' + esc(o.b || 'Sasaran') + '</span><span><i style="background:#ffb547"></i>Bawah sasaran</span>' : '') + '</div></div>';
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
      if (!window.google || !google.script) return rej({ error: 'Buka FIRAX melalui pautan rasmi (firax.sofwah.my).' });
      var r = google.script.run.withSuccessHandler(function (x) {
        if (x && x.ok) return res(x.data);
        if (x && x.code === 'AUTH' && S.token) { sset(TK, null); S.token = null; renderLogin(x.error); }
        if (x && x.code === 'PINCHANGE' && S.token && S.me) { S.me.mustChange = true; forcePin(); }
        rej(x || { error: 'Tiada jawapan daripada pelayan.' });
      }).withFailureHandler(function (e) { rej({ error: (e && e.message) || 'Masalah sambungan. Cuba lagi.' }); });
      r[fn].apply(r, args || []);
    });
  }

  /* ======================= Kamus & panduan (untuk pasukan yang baru) ======================= */
  /** k: kunci · n: nama · m: regex pengesan pada label/kepala jadual · a: apa itu · f: cara kira · s: julat sihat (amalan industri) · w: siapa bertindak */
  var GL = [
    { k: 'jualan', n: 'Jualan operasi', m: /^jualan( operasi| okt| nov| bulan| sehari| 20| minggu)?\b|jualan \(rm\)|jualan 2026/i, a: 'Jualan bersih yang dipakai untuk sasaran team: jualan FeedMe tolak SST, dan jualan delivery dikira 50% (kerana platform ambil komisen).', f: 'Jualan Nett − SST, delivery × 50%', s: 'Capai ≥ 100% sasaran bulanan. 🟡 90–99%, 🔴 bawah 90%.', w: 'BM + Pengurus Operasi' },
    { k: 'sasaran', n: '% capai sasaran', m: /% (capai|sasaran)|sasaran 2027/i, a: 'Berapa banyak sasaran jualan sudah dicapai.', f: 'Jualan sebenar ÷ sasaran × 100%', s: 'Sasaran 2027 Sofwah: RM10.9 juta (±RM30k sehari).', w: 'CEO + BM' },
    { k: 'aliran', n: 'Aliran tunai bersih', m: /aliran (tunai|bersih)/i, a: 'Wang yang betul-betul masuk ke bank tolak wang yang keluar dalam tempoh itu. Ini bukan untung: untung boleh positif sedangkan tunai berkurang.', f: 'Terimaan bank − bayaran bank', s: 'Positif setiap bulan. Negatif 2 bulan berturut = amaran.', w: 'Finance Manager' },
    { k: 'runway', n: 'Runway tunai', m: /runway/i, a: 'Berapa minggu syarikat boleh terus membayar kos operasi dengan tunai sedia ada, jika tiada wang masuk.', f: 'Baki semua akaun bank ÷ purata opex seminggu', s: 'Sihat ≥ 8 minggu (2 bulan). 🔴 bawah 2 minggu.', w: 'CEO + Finance Manager' },
    { k: 'baki', n: 'Baki bank', m: /^baki (semua|bank)/i, a: 'Jumlah wang dalam semua akaun bank syarikat pada tarikh penyata terakhir.', f: 'Baki awal + terimaan − bayaran', s: 'Sentiasa melebihi opex 8 minggu.', w: 'Finance Manager' },
    { k: 'rekon', n: 'Rekon (rekonsiliasi) harian', m: /rekon|hari 🟢|padan/i, a: 'Memadankan jualan yang direkod di POS (FeedMe) dengan wang yang benar-benar masuk ke bank, ikut kaedah bayaran (QR, kad, online).', f: 'Hari padan ÷ hari yang ada penyata bank', s: 'Sofwah: transaksi & rekon dikemas kini setiap Ahad untuk 7 hari lepas; sasaran 100% hari padan atau ada sebab bertulis.', w: 'Staf Akaun + BM' },
    { k: 'short', n: 'SHORT / LEBIH', m: /short|lebih \(|beza \(rm\)|jurang/i, a: 'SHORT: wang masuk bank KURANG daripada jualan. LEBIH: wang masuk LEBIH. Selalunya disebabkan masa settlement kad atau QR masuk akaun lain.', f: 'Diterima bank − jangkaan dari POS', s: 'Beza ≤ toleransi (RM50) atau ada sebab bertulis.', w: 'Staf Akaun' },
    { k: 'payout', n: 'Payout delivery', m: /payout|potongan/i, a: 'Wang yang dibayar oleh Grab, foodpanda atau Shopee kepada Sofwah selepas mereka tolak komisen, iklan dan diskaun.', f: 'Jualan platform − potongan platform', s: 'Payout masuk bank ikut jadual platform; beza dengan jangkaan ≤ 3%.', w: 'PIC Delivery + Staf Akaun' },
    { k: 'ketepatan', n: 'Ketepatan POS delivery', m: /ketepatan/i, a: 'Adakah setiap pesanan delivery ditekan di FeedMe? Jika POS rekod kurang daripada portal, jualan dan SST dalam laporan terkurang.', f: 'Jualan delivery di POS ÷ jualan di portal platform', s: '99% hingga 101%. Bawah 97% atau atas 103% = 🔴.', w: 'PIC Delivery' },
    { k: 'ap', n: 'AP (akaun belum bayar)', m: /\bap\b|belum dibayar|tertunggak|aging|tuntutan/i, a: 'Invois supplier yang sudah diterima tetapi belum dibayar. "Tertunggak" bermaksud sudah melepasi terma bayaran.', f: 'Jumlah invois terbuka; umur = hari sejak tarikh invois', s: '≥ 95% invois dibayar dalam terma; tiada invois lebih 60 hari.', w: 'Finance Manager + Staf Akaun' },
    { k: 'pnl', n: 'Untung Rugi (P&L)', m: /p&l|untung (kendalian|bersih|rugi)|untung bulanan/i, a: 'Laporan sama ada perniagaan untung: jualan tolak semua kos. P&L pengurusan FIRAX ikut tarikh wang keluar bank (asas tunai); P&L rasmi QuickBooks ikut asas akruan.', f: 'Jualan − kos bahan − kos staf − kos operasi', s: 'Untung bersih restoran lazimnya 5% hingga 15% jualan.', w: 'Finance Manager → CEO' },
    { k: 'margin', n: 'Margin bersih', m: /margin (bersih|kendalian)/i, a: 'Berapa sen untung daripada setiap RM1 jualan selepas semua kos.', f: 'Untung bersih ÷ jualan × 100%', s: 'Restoran: 5% hingga 15% (10% dianggap baik). Angka 60%+ biasanya bermaksud kos belum lengkap.', w: 'CEO' },
    { k: 'food', n: 'Food cost %', m: /food cost|kos bahan|modal \/ plate/i, a: 'Peratus jualan yang dibelanjakan untuk bahan mentah. Kos terbesar restoran selepas gaji.', f: 'Kos bahan ÷ jualan × 100%', s: 'Restoran lazim: 28% hingga 35%. Atas 38% = margin tertekan.', w: 'Ops / Chef + Procurement' },
    { k: 'prime', n: 'Prime cost', m: /prime cost/i, a: 'Gabungan dua kos terbesar restoran: bahan + staf. Ukuran utama kawalan kos dalam industri F&B.', f: '(Kos bahan + kos staf) ÷ jualan', s: 'Sasaran industri ≤ 60% hingga 65% jualan.', w: 'CEO + Ops' },
    { k: 'scor', n: 'SCOR (kos staf ÷ jualan)', m: /scor|kos staf/i, a: 'Peratus jualan yang digunakan untuk gaji dan caruman staf.', f: 'Kos staf (payroll) ÷ jualan × 100%', s: 'Restoran lazim: 25% hingga 35%.', w: 'HR + BM' },
    { k: 'splh', n: 'SPLH', m: /splh/i, a: 'Sales Per Labour Hour: jualan yang dihasilkan bagi setiap jam kerja seorang staf. Ukuran produktiviti dan susunan shift.', f: 'Jualan ÷ jumlah jam kerja staf', s: 'Sasaran Sofwah: RM60 sejam. Terlalu tinggi = staf tidak cukup (servis jatuh).', w: 'HR + BM' },
    { k: 'breakeven', n: 'Breakeven', m: /breakeven|pulang modal/i, a: 'Jualan minimum supaya tidak untung dan tidak rugi. Di bawah breakeven, setiap hari menambah kerugian.', f: 'Kos tetap ÷ margin sumbangan %', s: 'Capai ≥ 120% breakeven (ada ruang selamat).', w: 'BM + CEO' },
    { k: 'sumbangan', n: 'Margin sumbangan', m: /margin sumbangan/i, a: 'Baki setiap RM1 jualan selepas kos berubah (bahan, pembungkusan, caj kad) yang digunakan untuk menampung kos tetap.', f: '(Jualan − kos berubah) ÷ jualan', s: 'Lebih tinggi lebih baik; restoran lazim 55% hingga 70%.', w: 'Finance' },
    { k: 'tetap', n: 'Kos tetap / kos berubah', m: /kos (tetap|berubah)/i, a: 'Kos tetap tidak berubah walaupun jualan naik turun (sewa, gaji tetap). Kos berubah naik ikut jualan (bahan, pembungkusan).', f: '—', s: '—', w: 'Finance' },
    { k: 'aov', n: 'AOV (purata nilai bil)', m: /aov|purata \/ bil/i, a: 'Purata ringgit yang dibelanjakan setiap bil.', f: 'Jualan ÷ bilangan bil', s: 'Naikkan dengan set, add-on dan upsell.', w: 'BM + Marketing' },
    { k: 'sst', n: 'SST', m: /\bsst\b/i, a: 'Cukai yang dikutip daripada pelanggan bagi pihak kerajaan. Ia BUKAN pendapatan syarikat dan mesti dibayar melalui SST-02.', f: 'Ikut kadar SST semasa atas jualan bercukai', s: 'Asingkan ke akaun simpanan setiap minggu.', w: 'Finance Manager' },
    { k: 'einvois', n: 'e-Invois LHDN', m: /e-invois/i, a: 'Invois elektronik yang dihantar ke LHDN melalui MyInvois. Jualan runcit (B2C) boleh disatukan setiap bulan.', f: '—', s: 'Hantar e-Invois disatukan sebelum 7hb bulan berikutnya.', w: 'Staf Akaun' },
    { k: 'kunci', n: 'Kunci kira-kira (Balance Sheet)', m: /kunci kira|aset|liabiliti|ekuiti/i, a: 'Gambaran pada satu tarikh: apa syarikat miliki (aset), apa syarikat berhutang (liabiliti) dan baki milik pemegang saham (ekuiti).', f: 'Aset = Liabiliti + Ekuiti', s: 'Aset semasa ≥ 1.2 × liabiliti semasa.', w: 'Finance Manager' },
    { k: 'akruan', n: 'Asas tunai lawan akruan', m: /akruan|asas tunai/i, a: 'Asas tunai: kos dikira bila wang keluar. Akruan (standard perakaunan MPERS/MFRS): kos dikira pada bulan ia berlaku walaupun belum dibayar. Akruan lebih tepat untuk P&L bulanan.', f: '—', s: 'Laporan rasmi mesti asas akruan.', w: 'Finance Manager' },
    { k: 'susut', n: 'Susut nilai', m: /susut nilai/i, a: 'Kos aset (dapur, renovasi, peralatan) diagih sepanjang hayatnya, bukan sekali gus.', f: 'Kos aset ÷ tahun hayat ÷ 12 sebulan', s: 'Direkod setiap bulan semasa tutup buku.', w: 'Finance Manager' },
    { k: 'tutup', n: 'Tutup buku', m: /tutup buku/i, a: 'Proses hujung bulan untuk memastikan semua transaksi lengkap, betul dan dikunci sebelum laporan dikeluarkan.', f: 'Hari bekerja dari hujung bulan hingga buku dikunci', s: 'Amalan terbaik: 3 hingga 5 hari bekerja.', w: 'Finance Manager' },
    { k: 'payback', n: 'Payback & ROI', m: /payback|roi/i, a: 'Payback: berapa bulan untuk dapat balik modal pelaburan. ROI: pulangan setahun berbanding modal.', f: 'Payback = pelaburan ÷ untung bulanan · ROI = untung setahun ÷ pelaburan', s: 'Cawangan F&B: payback ≤ 24 bulan dianggap baik.', w: 'CEO + Lembaga Penasihat' },
    { k: 'void', n: 'Void & diskaun manual', m: /void|diskaun manual|tukar (kaedah )?bayaran/i, a: 'Bil yang dibatalkan atau diberi potongan secara manual. Kawalan penting untuk elak salah guna.', f: 'Nilai void ÷ jualan', s: 'Bawah 0.5% jualan.', w: 'BM + Finance' },
    { k: 'kpi', n: 'Lampu status', m: /^lampu|^status$/i, a: '🟢 OK · 🟡 pantau · 🔴 tindakan sekarang · ⚪ menunggu data atau keputusan (BUKAN prestasi buruk).', f: '—', s: '—', w: '—' },
    { k: 'skor', n: 'Skor Kesihatan Kewangan', m: /skor kesihatan/i, a: 'Gabungan 10 KPI FIRAX menjadi satu nombor 0 hingga 100. Hanya KPI yang datanya lengkap dikira.', f: 'Purata KPI: 🟢 = 100, 🟡 = 60, 🔴 = 20 (⚪ tidak dikira)', s: '80+ sihat · 60–79 stabil · 40–59 perlu perhatian · bawah 40 kritikal.', w: 'CEO' },
    { k: 'yakin', n: 'Keyakinan Data', m: /keyakinan data/i, a: 'Berapa peratus KPI yang datanya lengkap. Skor rendah bermaksud keputusan masih berasaskan anggaran.', f: 'KPI berlampu 🟢🟡🔴 ÷ 10 KPI', s: 'Sasaran ≥ 90%.', w: 'Finance Manager' }
  ];
  var GLK = {}; GL.forEach(function (g) { GLK[g.k] = g; });
  function termFor(label) { label = String(label || ''); if (!label || label.length > 70) return null; for (var i = 0; i < GL.length; i++) if (GL[i].m.test(label)) return GL[i]; return null; }
  function helpBtn(label, key) { var g = key ? GLK[key] : termFor(label); return g ? '<button class="hlp" data-act="help" data-k="' + g.k + '" aria-label="Apa maksud ' + esc(g.n) + '" title="Apa maksud ini?">?</button>' : ''; }
  function glossHtml(g) {
    return '<div class="gl-i"><div class="kicker">Kamus FIRAX</div><h3 style="margin:6px 0 12px">' + esc(g.n) + '</h3>' +
      '<div class="gl-row"><b>Apa itu</b><p>' + esc(g.a) + '</p></div>' +
      (g.f !== '—' ? '<div class="gl-row"><b>Cara kira</b><p class="mono">' + esc(g.f) + '</p></div>' : '') +
      (g.s !== '—' ? '<div class="gl-row ok"><b>Julat sihat</b><p>' + esc(g.s) + '</p></div>' : '') +
      (g.w !== '—' ? '<div class="gl-row"><b>Siapa bertindak</b><p>' + esc(g.w) + '</p></div>' : '') + '</div>';
  }
  A.help = function (el) { var g = GLK[el.getAttribute('data-k')]; if (g) modal(glossHtml(g) + '<div class="row-btn"><button class="btn sm" data-act="nav" data-p="guide">Buka Kamus penuh</button><button class="btn pri sm" data-act="closeModal">Faham</button></div>'); };

  /** Panduan ringkas setiap modul: apa halaman ini, nombor yang paling penting, apa perlu dibuat. */
  var MG = {
    'M1 Nadi Tunai': ['Berapa wang syarikat dalam bank sekarang dan berapa lama ia cukup.', 'Runway tunai (minggu) dan aliran tunai bersih bulan ini.', 'Jika ⚪: muat naik penyata bank dan isi baki awal akaun. Jika 🔴: rancang pindahan dana atau tangguh bayaran bukan kritikal.'],
    'M9 Bajet & Ramalan': ['Jualan setiap bulan lawan sasaran, dan sasaran 2027 ikut cawangan.', '% capai dan perubahan berbanding bulan lepas.', 'Bulan di bawah 90% sasaran: minta pelan tindakan daripada BM cawangan itu.'],
    'M2 Rekon Harian': ['Adakah jualan setiap hari benar-benar masuk ke bank.', 'Hari 🔴 SHORT tanpa catatan dan hari ⚪ tiada penyata.', 'Staf Akaun tulis sebab setiap hari 🔴 dan muat naik penyata yang hilang.'],
    'M3 Payout Delivery': ['Adakah Grab, foodpanda dan Shopee bayar dengan betul, dan adakah POS rekod semua pesanan.', 'Ketepatan POS (sasaran 99%) dan jurang payout.', 'PIC Delivery pastikan setiap pesanan ditekan di FeedMe dan audit payout setiap Isnin.'],
    'M5 P&L Cawangan': ['Untung atau rugi setiap cawangan bulan ini (asas tunai).', 'Margin bersih dan lampu. ⚪ bermaksud kos belum lengkap, jangan buat keputusan dahulu.', 'Lengkapkan kategori bayaran bank dan payroll sebelum P&L dibentang.'],
    'M7 Food Cost': ['Kos bahan berbanding jualan, dan menu mana untung atau rugi.', 'Food cost % (industri 28% hingga 35%) dan menu belum berkos.', 'Isi modal per plate 20 menu terlaris dahulu.'],
    'M8 Tenaga Kerja': ['Kos staf dan produktiviti setiap cawangan dan slot waktu.', 'SPLH (sasaran RM60) dan slot 🔴 kekurangan staf.', 'HR + BM alih staf dari slot berlebihan ke slot kekurangan sebelum menambah pekerja.'],
    'M4 AP & Opex': ['Invois supplier yang belum dibayar dan umurnya.', 'Tertunggak dan invois lebih 60 hari.', 'Semak invois baharu setiap hari; bayar ikut run Ahad & Rabu (supplier) dan Selasa (HR) di halaman Bayaran.'],
    'M13 QB Kewangan': ['P&L dan kunci kira-kira rasmi daripada QuickBooks, dengan penilaian juruaudit.', 'Untung bersih versi QB lawan versi dilaras juruaudit.', 'FM selesaikan pelarasan sebelum laporan digunakan untuk bank atau LHDN.'],
    'M14 Audit Pendapatan': ['Perbandingan jualan FeedMe (POS) dengan rekod QuickBooks dan senarai penemuan audit.', 'Penemuan 🔴 dan jurang pendapatan.', 'Selesaikan penemuan 🔴 satu per satu dan catat bukti.'],
    'M6 Breakeven': ['Jualan minimum setiap cawangan supaya tidak rugi.', '% capai breakeven (sasaran ≥ 120%). ⚪ bermaksud input kos belum lengkap.', 'Finance sahkan kos tetap F01–F12 dengan bil sebenar.'],
    'M12 Expansion Lab': ['Simulasi cawangan baharu: untung, payback dan ROI dalam 3 senario.', 'Payback senario buruk (sasaran ≤ 24 bulan).', 'Gantikan semua nilai CONTOH dengan sebut harga sebenar sebelum dibentang.'],
    'M10 Kawalan & Audit': ['Semakan integriti data dan kawalan dalaman setiap hari.', 'Semakan 🔴 dan ujian rambang 5 transaksi.', 'Selesaikan semakan 🔴 dan buat ujian rambang setiap hari.'],
    'M11 Cukai': ['SST, e-Invois dan tarikh akhir caruman setiap bulan.', 'SST belum dibayar dan tarikh akhir terdekat.', 'Asingkan SST setiap minggu; bayar caruman sebelum 15hb.'],
    'KPI': ['Kad skor 10 KPI kewangan utama dengan sasaran.', 'KPI 🔴 dan KPI ⚪ (data belum lengkap).', 'Setiap KPI 🔴 mesti ada tindakan di halaman Tindakan.'],
    'Live': ['Kesegaran data, jualan 7 hari dan pengesan anomali.', 'Data paling lama (hari) dan hari bertanda ⚠.', 'Data lebih 1 hari: maklumkan pemilik sumber.'],
    'Tetapan': ['Ambang, sasaran dan PIC yang digunakan FIRAX.', 'Sel kuning = input yang boleh diubah.', 'Hanya CEO / Finance Manager ubah nilai di fail Sheets.']
  };
  function guideBox(name) {
    var g = MG[name]; if (!g) return '';
    return '<details class="guide" open><summary>' + ic('<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v4h1"/>') + 'Cara baca halaman ini</summary><div class="gd">' +
      '<div><b>Apa halaman ini</b><p>' + esc(g[0]) + '</p></div><div><b>Lihat nombor ini dahulu</b><p>' + esc(g[1]) + '</p></div><div class="do"><b>Apa perlu dibuat</b><p>' + esc(g[2]) + '</p></div></div></details>';
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
    app.innerHTML = loginShell('<div class="kicker">Log masuk</div><h2 style="margin-top:6px">Selamat datang 👋</h2><p class="note" style="margin:4px 0 12px">Pilih nama anda, kemudian masukkan PIN 4 digit.</p><input class="inp" id="lq" placeholder="Cari nama" autocomplete="off"><div class="ulist" id="ll"><div class="skel" style="height:60px"></div><div class="skel" style="height:60px"></div></div>' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '<p class="note" style="margin-top:auto;padding-top:14px">Akaun baharu atau lupa PIN? Minta <b>kod aktivasi</b> daripada CEO. PIN anda tidak pernah dipaparkan atau dihantar kepada sesiapa.</p>');
    rpc('fxLoginList', []).then(function (L) {
      S.users = L;
      var draw = function (q) {
        q = (q || '').toLowerCase();
        var list = L.filter(function (u) { return !q || (u.name + ' ' + u.jawatan + ' ' + u.roleLabel).toLowerCase().indexOf(q) >= 0; });
        $('#ll').innerHTML = list.length ? list.map(function (u) { return '<button class="uitem" data-act="pick" data-id="' + esc(u.id) + '"><span class="av">' + esc(ini(u.name)) + '</span><span class="t"><b>' + esc(u.name) + '</b><small>' + esc(u.jawatan || u.roleLabel) + '</small></span>' + (u.needsCode ? '<span class="chip y">Aktifkan</span>' : '<span class="chip g">' + esc(u.role) + '</span>') + '</button>'; }).join('') : '<div class="empty"><b>Tiada nama sepadan</b></div>';
      };
      draw(''); $('#lq').oninput = function () { draw(this.value); };
    }).catch(function (e) { $('#ll').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  }
  A.pick = function (el) { var u = S.users.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (u.needsCode) activation(u); else pinPad(u); };
  function who(u) { return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button class="iconbtn" data-act="back" aria-label="Kembali">' + ic('<path d="m15 18-6-6 6-6"/>') + '</button><span class="av">' + esc(ini(u.name)) + '</span><div><b>' + esc(u.name) + '</b><div class="note">' + esc(u.roleLabel) + '</div></div></div>'; }
  function pinPad(u, msg) {
    S.pu = u; S.pin = '';
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'kod', 0, 'del'].map(function (k) { return '<button class="' + (typeof k === 'string' ? 'fn' : '') + '" data-act="key" data-k="' + k + '" aria-label="' + (k === 'del' ? 'Padam' : k === 'kod' ? 'Guna kod aktivasi' : k) + '">' + (k === 'del' ? '⌫' : k === 'kod' ? 'Kod' : k) + '</button>'; }).join('');
    app.innerHTML = loginShell(who(u) + '<p class="note" style="text-align:center;margin-top:14px">Masukkan PIN 4 digit anda</p><div class="pinbox" id="dots"><i></i><i></i><i></i><i></i></div><div class="pinpad">' + keys + '</div><div id="pmsg">' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '</div><input type="password" inputmode="numeric" maxlength="4" class="sr" id="pinkb" aria-label="PIN" autocomplete="off">');
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
  A.back = function () { if (S.token) { rpc('fxLogout', [S.token]).catch(function () {}); sset(TK, null); } renderLogin(); };
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
    app.innerHTML = loginShell(who(u) + '<h3 style="margin-top:12px">Aktifkan akaun</h3><p class="note">Masukkan kod aktivasi 8 aksara daripada CEO, kemudian pilih PIN 4 digit anda sendiri. Kod hanya boleh digunakan sekali.</p>' +
      '<div style="display:grid;gap:4px;margin-top:10px">' + field('Kod aktivasi', '<input class="inp" id="ac" placeholder="XXXX-XXXX" maxlength="9" autocomplete="off" style="text-transform:uppercase;letter-spacing:.2em">') +
      field('PIN baharu (4 digit)', '<input class="inp" id="ap1" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') + field('Sahkan PIN', '<input class="inp" id="ap2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') +
      '<button class="btn pri" style="justify-content:center" data-act="doActivate">Aktifkan & log masuk</button></div><div id="amsg">' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '</div>');
  }
  A.doActivate = function (el) {
    var c = val('ac'), a = val('ap1'), b = val('ap2');
    if (a !== b) { $('#amsg').innerHTML = '<div class="err">PIN tidak sepadan.</div>'; return; }
    el.disabled = true;
    rpc('fxActivate', [S.pu.id, c, a]).then(function (r) { toast('Akaun diaktifkan. Selamat datang!'); start(r.token, r.me); }).catch(function (e) { el.disabled = false; $('#amsg').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  /** PIN ditetapkan admin wajib ditukar sebelum FIRAX dibuka. */
  function forcePin(msg) {
    var me = S.me;
    app.innerHTML = loginShell(who({ name: me.name, roleLabel: me.roleLabel }) + '<h3 style="margin-top:12px">Pilih PIN anda sendiri</h3><p class="note">PIN semasa ditetapkan oleh admin. Pilih PIN 4 digit baharu yang hanya anda tahu.</p>' +
      '<div style="display:grid;gap:4px;margin-top:10px">' + field('PIN semasa (daripada admin)', '<input class="inp" id="fp0" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password">') +
      field('PIN baharu (4 digit)', '<input class="inp" id="fp1" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') + field('Sahkan PIN baharu', '<input class="inp" id="fp2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password">') +
      '<button class="btn pri" style="justify-content:center" data-act="doForcePin">Simpan PIN & teruskan</button></div><div id="fmsg">' + (msg ? '<div class="err">' + esc(msg) + '</div>' : '') + '</div>');
  }
  A.doForcePin = function (el) {
    var a = val('fp0'), b = val('fp1'), c = val('fp2');
    if (b !== c) { $('#fmsg').innerHTML = '<div class="err">PIN baharu tidak sepadan.</div>'; return; }
    el.disabled = true;
    rpc('fxChangePin', [S.token, a, b]).then(function (r) { toast('PIN disimpan. Selamat datang!'); delete S.me.mustChange; start(r.token, S.me); })
      .catch(function (e) { el.disabled = false; $('#fmsg').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  function start(token, me, boot) {
    S.token = token; S.me = me; sset(TK, token);
    if (me && me.mustChange) return forcePin();
    if (boot && boot.home) S.home = boot.home;
    var p = window.FX_PAGE || sget('firax.p') || 'home'; if (!PG[p]) p = 'home';
    go(p);
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
  var PG = {
    home: { t: 'Utama', i: 'home', sub: 'Pusat kawalan kewangan · gambaran 30 saat' },
    routine: { t: 'Rutin Kewangan', i: 'routine', sub: 'Apa perlu dibuat hari ini, minggu ini dan bulan ini (SOP standard)' },
    pay: { t: 'Bayaran', i: 'bank', sub: 'Run bayaran Ahad & Rabu (supplier) · Selasa (HR) · hanya senarai diluluskan' },
    actions: { t: 'Tindakan', i: 'actions', sub: 'Action Engine · setiap 🔴 ada PIC, SLA dan cara selesaikan' },
    cash: { t: 'Tunai & Ramalan', i: 'cash', sub: 'Baki bank, aliran tunai, runway dan ramalan' },
    sales: { t: 'Jualan & Rekon', i: 'sales', sub: 'POS lawan bank setiap hari, payout delivery dan semakan harga' },
    profit: { t: 'Untung & Kos', i: 'profit', sub: 'P&L cawangan, food cost, kos staf, AP & Opex' },
    books: { t: 'Buku & Audit', i: 'books', sub: 'P&L dan kunci kira-kira QuickBooks serta penemuan juruaudit' },
    planning: { t: 'Perancangan', i: 'planning', sub: 'Breakeven, bajet dan simulasi cawangan baharu' },
    control: { t: 'Kawalan & Cukai', i: 'control', sub: 'Kawalan dalaman, SST, e-Invois dan kad skor 10 KPI' },
    live: { t: 'Live', i: 'live', sub: 'Kesegaran data, jualan 7 hari dan pengesan anomali' },
    guide: { t: 'Panduan & Kamus', i: 'guide', sub: 'Maksud setiap istilah, julat sihat industri dan cara guna FIRAX' },
    settings: { t: 'Tetapan', i: 'settings', sub: 'Pengguna, ambang, PIC dan sumber data', ceo: true }
  };
  var NAVG = [['', ['home', 'routine', 'pay', 'actions']], ['Modul', ['cash', 'sales', 'profit', 'books', 'planning', 'control']], ['Sistem', ['live', 'guide', 'settings']]];
  function navHtml() {
    var red = S.home && S.home.actions && S.home.actions.counts ? num(S.home.actions.counts.r) : 0, rt = S.rt && S.rt.prog ? S.rt.prog.H : null;
    return NAVG.map(function (g) {
      var items = g[1].filter(function (k) { return !PG[k].ceo || S.me.role === 'CEO' || S.me.role === 'FM'; }).map(function (k) {
        var badge = k === 'actions' && red ? '<span class="cnt">' + red + '</span>' : k === 'routine' && rt && rt.done < rt.all ? '<span class="cnt y">' + (rt.all - rt.done) + '</span>' : '';
        return '<button class="' + (S.page === k ? 'on' : '') + '" data-act="nav" data-p="' + k + '">' + ic(I[PG[k].i]) + '<span>' + PG[k].t + '</span>' + badge + '</button>';
      }).join('');
      return (g[0] ? '<div class="navh">' + g[0] + '</div>' : '') + items;
    }).join('');
  }
  function sideCard() {
    var h = S.home; if (!h || !h.live) return '';
    var l = h.live;
    return '<div class="side-card"><b>' + dot(l.status) + ' &nbsp;' + esc(unemo(l.status) || 'Status') + '</b><small>Sumber data · ' + esc(l.sources || '—') + ' bersambung</small>' +
      '<div class="row"><span class="muted">Data paling lama</span><b>' + esc(l.oldest || '—') + '</b></div><div class="row"><span class="muted">Tindakan 🔴</span><b style="color:#ff8b8b">' + esc(l.red || '0') + '</b></div></div>';
  }
  function layout(inner) {
    var p = PG[S.page], live = S.home && S.home.live;
    app.innerHTML = '<div class="app"><aside class="side glass" id="side"><div class="brand"><div class="mark">' + MARK + '</div><div><b>FIRAX</b><small>Financial Intelligence, Risk &amp; Analytics eXecutive</small></div></div>' +
      '<nav class="nav">' + navHtml() + '</nav>' + sideCard() + '</aside><div class="scrim" id="scrim" data-act="closeSide"></div>' +
      '<main class="main"><header class="top glass"><button class="iconbtn burger" data-act="openSide" aria-label="Menu">' + ic(I.menu) + '</button>' +
      '<div class="grow"><h1>' + esc(p.t) + '</h1><div class="sub">' + esc(p.sub) + '</div></div>' +
      (live ? '<span class="pill live hide-m">' + dot(live.status) + esc(unemo(live.status) || 'Live') + '</span>' : '') +
      '<button class="pill hide-m" data-act="refresh" title="Muat semula data dari sheet">' + ic(I.refresh).replace('<svg', '<svg width="15" height="15"') + 'Muat semula</button>' +
      '<button class="pill hide-m" data-act="print" title="Cetak / simpan PDF halaman ini">' + ic(I.print).replace('<svg', '<svg width="15" height="15"') + 'Cetak</button>' +
      '<button class="user" data-act="userMenu"><span class="av">' + esc(ini(S.me.name)) + '</span><b>' + esc(S.me.name) + '</b>' + ic(I.arrow).replace('<svg', '<svg width="14" height="14" style="transform:rotate(90deg)"') + '</button></header>' +
      '<div class="printh"><b>SOFWAH FIRAX</b> · ' + esc(p.t) + ' · dicetak ' + esc(new Date().toLocaleDateString('ms-MY')) + ' oleh ' + esc(S.me.name) + '</div>' +
      '<div id="view" class="stack">' + (inner || '<div class="skel" style="height:300px"></div><div class="skel" style="height:220px"></div>') + '</div></main></div>';
  }
  function go(p) {
    if (!PG[p]) p = 'home'; S.page = p; sset('firax.p', p); closeModal();
    layout(); window.scrollTo(0, 0);
    var R = { home: renderHome, actions: renderActions, settings: renderSettings, routine: renderRoutine, guide: renderGuide, pay: renderPay }[p] || renderModule;
    R();
  }
  A.nav = function (el) { go(el.getAttribute('data-p')); };
  A.openSide = function () { $('#side').classList.add('open'); $('#scrim').classList.add('open'); };
  A.closeSide = function () { var s = $('#side'); if (s) s.classList.remove('open'); var c = $('#scrim'); if (c) c.classList.remove('open'); };
  A.refresh = function (el) {
    if (el) el.disabled = true; toast('Memuat semula dari sheet FIRAX…');
    rpc('fxRefresh', [S.token]).then(function () { S.home = null; S.pages = {}; S.acts = null; S.rt = null; S.pay = null; return rpc('fxHome', [S.token]); })
      .then(function (h) { S.home = h; go(S.page); toast('Data dikemas kini'); }).catch(function (e) { toast(e.error, true); if (el) el.disabled = false; });
  };
  A.userMenu = function () {
    modal('<div style="display:flex;gap:12px;align-items:center"><span class="av">' + esc(ini(S.me.name)) + '</span><div><b>' + esc(S.me.name) + '</b><div class="note">' + esc(S.me.roleLabel) + '</div></div></div>' +
      '<div class="note" style="margin:14px 0">FIRAX v' + esc(S.version || '') + ' · data dibaca terus daripada spreadsheet <b>Sofwah FIRAX 2027</b>. Panduan & Kamus menerangkan setiap istilah.</div>' +
      '<div class="row-btn"><button class="btn" data-act="changePin">Tukar PIN</button><button class="btn" data-act="logout">' + ic(I.out) + 'Log keluar</button></div>');
  };
  A.changePin = function () {
    modal('<h3>Tukar PIN</h3><div style="margin-top:12px">' + field('PIN semasa', '<input id="c0" type="password" inputmode="numeric" maxlength="4">') + field('PIN baharu', '<input id="c1" type="password" inputmode="numeric" maxlength="4">') + field('Sahkan PIN baharu', '<input id="c2" type="password" inputmode="numeric" maxlength="4">') +
      '</div><div id="cm"></div><div class="row-btn"><button class="btn" data-act="closeModal">Batal</button><button class="btn pri" data-act="doChangePin">Simpan</button></div>');
  };
  A.closeModal = closeModal;
  A.doChangePin = function (el) {
    if (val('c1') !== val('c2')) { $('#cm').innerHTML = '<div class="err">PIN baharu tidak sepadan.</div>'; return; }
    el.disabled = true;
    rpc('fxChangePin', [S.token, val('c0'), val('c1')]).then(function (r) { S.token = r.token; sset(TK, r.token); closeModal(); toast('PIN ditukar'); }).catch(function (e) { el.disabled = false; $('#cm').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  function view(html) { var v = $('#view'); if (v) v.innerHTML = html; }
  function fail(e) { view('<div class="glass pad"><div class="err">' + esc((e && e.error) || 'Gagal dimuatkan.') + '</div><div class="row-btn" style="justify-content:flex-start"><button class="btn" data-act="refresh">' + ic(I.refresh) + 'Cuba lagi</button></div></div>'); }
  function needHome() { return S.home ? Promise.resolve(S.home) : rpc('fxHome', [S.token]).then(function (h) { S.home = h; return h; }); }
  function needRt() { return S.rt ? Promise.resolve(S.rt) : rpc('fxRoutine', [S.token]).then(function (r) { S.rt = r; return r; }); }
  A.print = function () { document.body.setAttribute('data-print', new Date().toLocaleString('ms-MY')); window.print(); };

  /* ======================= Utama (Home) ======================= */
  function renderHome() {
    needHome().then(function (h) { var s = $('#side'); if (s) { $('.nav', s).innerHTML = navHtml(); } homeView(h); needRt().then(function () { var b = $('#rt-today'); if (b) b.outerHTML = rtToday(); var s2 = $('#side'); if (s2) $('.nav', s2).innerHTML = navHtml(); }).catch(function () {}); }).catch(fail);
  }
  function cardBy(h, re) { return (h.cards || []).filter(function (c) { return re.test(c.l); })[0] || { l: '', v: '—', n: '' }; }
  function kpiBy(h, re) { return (h.kpi || []).filter(function (k) { return re.test(k.k); })[0] || { k: '', v: '', t: '', lamp: '⚪' }; }
  var LW = { g: 'Sihat', y: 'Pantau', r: 'Tindakan sekarang', w: 'Menunggu data' }, LS = { g: 100, y: 60, r: 20 };
  /** Lampu paling teruk antara yang dinilai; ⚪ jika tiada yang dinilai. */
  function worst(ls) { var o = ['r', 'y', 'g']; for (var i = 0; i < o.length; i++) if (ls.indexOf(o[i]) >= 0) return o[i]; return 'w'; }
  function healthOf(h) {
    var ks = h.kpi || [], rated = ks.filter(function (k) { return LS[lamp(k.lamp)] !== undefined; });
    var score = rated.length ? rated.reduce(function (a, k) { return a + LS[lamp(k.lamp)]; }, 0) / rated.length : null;
    return { score: score, rated: rated.length, all: ks.length || 10, grade: score === null ? 'Belum cukup data' : score >= 80 ? 'Sihat' : score >= 60 ? 'Stabil, perlu dipantau' : score >= 40 ? 'Perlu perhatian' : 'Kritikal' };
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
      { p: 'cash', n: 'Tunai', icon: I.cash, l: worst([lamp(k.run.lamp), lamp(cash.n)].filter(function (x) { return x && x !== 'w'; })), big: k.run.v && lamp(k.run.lamp) !== 'w' ? k.run.v + ' minggu' : 'Belum sah', sub: 'Runway tunai · AP tertunggak ' + ap.v, key: 'runway',
        say: { w: 'Baki awal akaun bank belum lengkap, jadi FIRAX belum boleh kira berapa lama tunai cukup.', g: 'Tunai cukup untuk operasi lebih 8 minggu.', y: 'Tunai di bawah 8 minggu. Kawal bayaran yang tidak kritikal.', r: 'Tunai hampir habis. Tindakan segera.' } },
      { p: 'sales', n: 'Jualan', icon: I.sales, l: lamp(sales.n) || 'w', big: sales.v, sub: unemo(sales.n), key: 'jualan',
        say: { g: 'Jualan mencapai sasaran.', y: 'Jualan hampir sasaran. Tolak promosi di cawangan yang ketinggalan.', r: 'Jualan jauh di bawah sasaran. Minta pelan tindakan setiap BM.', w: 'Data jualan belum lengkap.' } },
      { p: 'profit', n: 'Untung', icon: I.profit, l: worst([lamp(k.mar.lamp), lamp(k.be.lamp)].filter(function (x) { return x && x !== 'w'; })), big: prof.v, sub: 'Untung kendalian (had atas)', key: 'margin',
        say: { w: unemo(prof.n) + '. Jangan buat keputusan berdasarkan untung ini dahulu.', g: 'Margin di atas sasaran.', y: 'Untung positif tetapi di bawah sasaran.', r: 'Cawangan atau syarikat rugi.' } },
      { p: 'profit', n: 'Kos', icon: I.bill, l: worst([lamp(k.fc.lamp), lamp(k.scor.lamp), lamp(splh.n)].filter(function (x) { return x && x !== 'w'; })), big: fc.v, sub: 'Food cost · SCOR ' + (k.scor.v || '—') + ' · SPLH ' + splh.v, key: 'food',
        say: { g: 'Kos dalam julat industri.', y: (fcN && fcN > 35 ? 'Food cost ' + Math.round(fcN) + '% melebihi julat industri 28–35%. ' : '') + 'Produktiviti staf di bawah sasaran RM60 sejam.', r: 'Kos melebihi had. Semak bahan dan shift.', w: 'Sasaran food cost dan SCOR belum diputuskan CEO.' } },
      { p: 'control', n: 'Kawalan', icon: I.control, l: worst([k.rek, k.gap, k.ap, k.close].map(function (x) { return lamp(x.lamp); }).filter(function (x) { return x && x !== 'w'; })), big: k.rek.v || rek.v, sub: 'Hari rekon padan · AP tepat masa ' + (k.ap.v || '—'), key: 'rekon',
        say: { g: 'Rekon dan bayaran terkawal.', y: 'Ada kelewatan kecil. Pantau.', r: 'Banyak hari rekon belum padan dan penyata bank lewat. Risiko kebocoran tidak dapat dikesan.', w: 'Data kawalan belum lengkap.' } }
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
      avg ? [avgT && avg >= avgT ? 'g' : avgT && avg >= avgT * .9 ? 'y' : 'r', '7 hari lepas: purata <b>RM' + fnum(avg) + '</b> sehari' + (avgT ? ' (' + Math.round(avg / avgT * 100) + '% sasaran harian)' : '') + '. Terbaik ' + esc(best.d) + ' RM' + fnum(best.v) + ', terlemah ' + esc(low.d) + ' RM' + fnum(low.v) + '.'] : null,
      brS.length ? ['w', 'Paling hampir sasaran: <b>' + esc(brS[0].n) + ' ' + Math.round(brS[0].pct) + '%</b>. Paling jauh: <b>' + esc(brS[brS.length - 1].n) + ' ' + Math.round(brS[brS.length - 1].pct) + '%</b>.'] : null,
      [reds.length ? 'r' : 'g', reds.length ? '<b>' + reds.length + ' isu 🔴</b> perlu tindakan hari ini: ' + esc(reds[0].trigger) + (reds[1] ? ', ' + esc(reds[1].trigger) : '') + '.' : 'Tiada isu 🔴 hari ini.'],
      [num(bank.age) > 1 ? 'y' : 'g', 'Data: penyata bank sehingga <b>' + esc(bank.date || '—') + '</b>' + (bank.age ? ' (' + esc(bank.age) + ' hari)' : '') + ' · ' + hs.rated + ' daripada ' + hs.all + ' KPI ada data lengkap.']
    ].filter(Boolean);

    var hero = '<section class="glass hero2"><div class="art">' + heroArt('hm') + '</div><div class="l"><div class="kicker">Assalamualaikum, ' + esc(S.me.name) + ' · ' + esc(lv.clock ? String(lv.clock).split('·')[0] : '') + '</div>' +
      '<h2><span>Financial Clarity.</span> <span>Intelligent Decisions.</span> <span>Profitable Growth.</span></h2>' +
      '<div class="brief"><div class="bh">Ringkasan 30 saat</div>' + bullets.map(function (b) { return '<div class="bl"><span class="dot ' + b[0] + '"></span><span>' + b[1] + '</span></div>'; }).join('') + '</div>' +
      '<div class="cta"><button class="btn pri" data-act="nav" data-p="actions">' + ic(I.bolt) + 'Tindakan hari ini' + (reds.length ? ' · ' + reds.length + ' 🔴' : '') + '</button><button class="btn" data-act="nav" data-p="routine">' + ic(I.routine) + 'Rutin hari ini</button></div></div>' +
      '<div class="r"><div class="health"><div class="hh"><span>Skor Kesihatan Kewangan</span>' + helpBtn('', 'skor') + '</div>' + gauge(hs.score, hs.grade, hs.score === null ? '' : 'Dikira daripada ' + hs.rated + ' KPI yang lengkap') +
      '<div class="conf"><div class="ch"><span>Keyakinan Data ' + helpBtn('', 'yakin') + '</span><b>' + Math.round(hs.rated / hs.all * 100) + '%</b></div><div class="prog"><i style="width:' + (hs.rated / hs.all * 100) + '%;' + (hs.rated / hs.all < .7 ? 'background:linear-gradient(90deg,#ff8a3d,#ffb547)' : '') + '"></i></div><small>' + hs.rated + ' / ' + hs.all + ' KPI ada data lengkap · selebihnya ⚪ menunggu data atau keputusan</small></div>' +
      '<div class="pmini">' + P.map(function (p) { return '<button data-act="nav" data-p="' + p.p + '"><span class="dot ' + p.l + '"></span>' + p.n + '<em>' + LW[p.l] + '</em></button>'; }).join('') + '</div></div></div></section>';

    var pillars = '<section class="pillars">' + P.map(function (p) {
      return '<article class="glass pillar ' + p.l + '" data-act="nav" data-p="' + p.p + '"><div class="ph1"><span class="pi">' + ic(p.icon) + '</span><b>' + p.n + '</b>' + chip((p.l === 'g' ? '🟢 ' : p.l === 'y' ? '🟡 ' : p.l === 'r' ? '🔴 ' : '⚪ ') + LW[p.l]) + '</div>' +
        '<div class="pv">' + esc(p.big) + helpBtn('', p.key) + '</div><div class="ps">' + esc(p.sub) + '</div><p class="pm">' + esc(p.say[p.l] || '') + '</p><div class="pf">Lihat butiran ' + ic(I.arrow) + '</div></article>';
    }).join('') + '</section>';

    var fresh = '<section class="glass fresh">' + (lv.pulse || []).slice(0, 6).map(function (p) { return '<div class="fr"><span class="dot ' + lamp(p.lamp) + '"></span><div><small>' + esc(p.what) + '</small><b>' + esc(p.date || '—') + (p.age !== '' && p.age !== undefined ? ' · ' + esc(p.age) + ' hari' : '') + '</b></div></div>'; }).join('') + '</section>';

    var open = rules.filter(function (r) { var l = lamp(r.lamp); return l === 'r' || l === 'y'; }).slice(0, 5);
    var todo = '<section class="grid2"><div class="glass pad"><div class="sec-h"><h3>Tindakan hari ini</h3><button class="btn sm" data-act="nav" data-p="actions">Semua tindakan ' + ic(I.arrow) + '</button></div>' +
      (open.length ? open.map(function (r) { var l = lamp(r.lamp); return '<div class="todo-i ' + l + '"><span class="code">' + esc(r.code) + '</span><div><b>' + esc(r.trigger) + '</b><small>' + esc(r.action) + '</small></div><div class="tm"><span class="chip">' + esc(r.pic) + '</span><span class="chip ' + (l === 'r' ? 'r' : 'y') + '">' + esc(r.sla) + '</span></div></div>'; }).join('') : '<div class="empty">Tiada tindakan terbuka 🎉</div>') + '</div>' +
      rtToday() + '</section>';

    var chartSales = s7.map(function (r) { return { l: r.d, v: r.v, t: r.t }; });
    var facts = [['Purata sehari (7 hari)', avg ? 'RM' + fnum(avg) : '—'], ['Sasaran harian purata', avgT ? 'RM' + fnum(avgT) : '—'], ['Hari terbaik', best ? best.d + ' · RM' + fnum(best.v) : '—'], ['Hari terlemah', low ? low.d + ' · RM' + fnum(low.v) : '—'], ['Trend 30 hari', lv.trend ? lv.trend.pct + ' sasaran' : '—']];
    var row7 = '<section class="grid2"><div class="glass pad"><div class="sec-h"><h3>Jualan 7 hari terakhir ' + helpBtn('', 'jualan') + '</h3><span class="note">Bar kuning = bawah sasaran harian</span></div>' + barChart(chartSales, { a: 'Jualan operasi', b: 'Sasaran harian' }) + '</div>' +
      '<div class="glass pad"><div class="sec-h"><h3>Fakta pantas</h3></div><div class="facts">' + facts.map(function (f) { return '<div><small>' + esc(f[0]) + '</small><b>' + esc(f[1]) + '</b></div>'; }).join('') + '</div></div></section>';

    var league = br.length ? '<section class="glass pad"><div class="sec-h"><h3>Kedudukan cawangan · % sasaran bulan ini ' + helpBtn('', 'sasaran') + '</h3><button class="btn sm" data-act="nav" data-p="profit">P&L cawangan ' + ic(I.arrow) + '</button></div>' +
      hbars(brS.map(function (b) { return { l: b.n, v: b.pct, sub: 'RM' + fnum(b.sales) + (b.splh ? ' · SPLH ' + b.splh : '') + (b.fc ? ' · food cost ' + b.fc : '') }; }), { good: 100, warn: 80, mark: 100 }) +
      '<details class="more"><summary>Lihat jadual penuh semua cawangan</summary>' + tbl({ head: (h.branches || {}).head || [], rows: (h.branches || {}).rows || [], totals: ((h.branches || {}).rows || []).map(function (r, i) { return /Semua/.test(r[0]) ? i : -1; }).filter(function (i) { return i >= 0; }) }) + '</details></section>' : '';

    var kp = '<div class="kpis">' + (h.kpi || []).map(function (x) { return '<div class="kpi"><span>' + dot(x.lamp) + '</span><span class="k">' + esc(x.k) + ' ' + helpBtn(x.k) + '</span><span class="v">' + esc(x.v || '—') + '</span><span class="t">sasaran ' + esc(x.t || '—') + '</span></div>'; }).join('') + '</div>';
    var row5 = '<section class="grid2"><div class="glass pad"><div class="sec-h"><h3>Kad skor 10 KPI</h3><span class="note">' + esc(h.kpiScore || '') + '</span></div>' + kp + '</div>' +
      '<div class="glass pad"><div class="sec-h"><h3>Keputusan diperlukan daripada CEO</h3></div>' + (h.decisions || []).map(function (d) { return '<div class="dec"><span class="n">' + esc(d.n) + '</span><div><b style="font-size:13px">' + esc(d.t) + '</b><small>' + esc(d.why) + '</small></div>' + chip(d.st) + '</div>'; }).join('') + '</div></section>';

    var ins = (h.insights || []).filter(function (x) { return x.fakta; }).length ? '<section class="glass pad"><div class="sec-h"><h3>Insight · Fakta → Maksud → Tindakan</h3></div><div class="ins">' + h.insights.filter(function (x) { return x.fakta; }).map(insightHtml).join('') + '</div></section>' : '';
    var months = (h.months || []).filter(function (m) { return num(m.v); }).map(function (m) { return { l: m.m.replace(/ 20\d\d/, ''), v: num(m.v), t: num(m.t) }; });
    var mon = months.length ? '<section class="glass pad"><div class="sec-h"><h3>Jualan bulanan 2026</h3><span class="note">Jualan operasi (tanpa SST, delivery 50%)</span></div>' + barChart(months, { a: 'Jualan', b: 'Sasaran', w: 1200, h: 230 }) + '</section>' : '';

    view(hero + pillars + fresh + todo + row7 + league + row5 + ins + mon + '<div class="note" style="text-align:center">Data pada ' + esc(h.asOf || '') + ' · dibaca terus daripada sheet FIRAX · ⚪ = menunggu data atau keputusan, bukan prestasi buruk</div>');
  }
  /** Baris cawangan daripada jadual Dashboard (kepala dikesan ikut nama). */
  function branchRows(h) {
    var b = h.branches || {}, hd = b.head || [], ix = function (re) { for (var i = 0; i < hd.length; i++) if (re.test(hd[i])) return i; return -1; };
    var iS = ix(/^Jualan/), iP = ix(/% sasaran/), iF = ix(/Food cost/), iL = ix(/SPLH/);
    return (b.rows || []).filter(function (r) { return r[0] && !/Semua/.test(r[0]); }).map(function (r) { return { n: r[0], sales: num(r[iS]), pct: iP >= 0 ? pct(r[iP]) : null, fc: iF >= 0 ? r[iF] : '', splh: iL >= 0 ? r[iL] : '' }; });
  }
  function rtToday() {
    var r = S.rt; if (!r) return '<div class="glass pad" id="rt-today"><div class="sec-h"><h3>Rutin hari ini</h3></div><div class="skel" style="height:150px"></div></div>';
    var t = r.tasks.filter(function (x) { return x.c === 'H'; }), p = r.prog.H;
    return '<div class="glass pad" id="rt-today"><div class="sec-h"><h3>Rutin hari ini · ' + p.done + '/' + p.all + '</h3><button class="btn sm" data-act="nav" data-p="routine">Buka rutin ' + ic(I.arrow) + '</button></div><div class="prog" style="margin-bottom:12px"><i style="width:' + (p.done / p.all * 100) + '%"></i></div>' +
      t.map(function (x) { return '<div class="rt-i' + (x.ok ? ' ok' : '') + '"><span class="ck">' + (x.ok ? '✓' : '') + '</span><div><b>' + esc(x.t) + '</b><small>' + esc(x.who) + ' · ' + esc(x.when) + (x.auto ? ' · ' + esc(x.auto.text) : '') + '</small></div></div>'; }).join('') + '</div>';
  }
  function insightHtml(x) {
    return '<div class="insight"><div class="f"><b>Fakta</b>' + esc(x.fakta) + '</div>' + (x.maksud ? '<div class="m"><b>Maksud</b>' + esc(x.maksud) + '</div>' : '') + (x.tindakan ? '<div class="a"><b>Tindakan</b>' + esc(x.tindakan) + '</div>' : '') + '</div>';
  }

  /* ======================= halaman modul (generik, ikut tab sheet) ======================= */
  function tbl(b, opt) {
    opt = opt || {}; var head = b.head || [], rows = b.rows || [], tot = b.totals || [];
    if (!rows.length) return '<div class="empty">Tiada baris</div>';
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
        if (/^https:\/\//.test(v)) return '<td><a href="' + esc(v) + '" target="_blank" rel="noopener">Buka ↗</a></td>';
        if (/^[A-Z]\d{2}[a-z]?$/.test(v)) return '<td class="n"><span class="chip w" title="Menunggu keputusan ' + esc(v) + '">Belum diputuskan</span></td>';
        if (c === 0 && !numc[c]) { var hb = helpBtn(v); if (hb) return '<td class="' + (v.length > 46 ? 'wrap' : 'first') + '">' + esc(v) + hb + '</td>'; }
        var l = lamp(v);
        if (l && v.length < 40) return '<td>' + chip(v) + '</td>';
        return '<td' + (v.length > 46 ? ' class="wrap"' : '') + '>' + show(v) + '</td>';
      }).join('') + '</tr>';
    }
    h += '</tbody></table></div>';
    if (rows.length > lim) h += '<div style="margin-top:10px"><button class="btn sm" data-act="showAll" data-b="' + esc(opt.id || '') + '">Tunjuk semua ' + rows.length + ' baris</button></div>';
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
    if (t.missing) return '<div class="glass pad"><div class="err">Tab "' + esc(t.name) + '" tidak ditemui dalam sheet FIRAX.</div></div>';
    var cards = (t.cards || []).length ? '<section class="cards">' + t.cards.map(function (c) { var l = lamp(c.n) || lamp(c.v); return '<div class="glass card ' + l + '"><div class="l">' + esc(c.l) + helpBtn(c.l) + '</div><div class="v">' + esc(unemo(c.v) || c.v) + '</div><div class="nn">' + dot(c.n) + ' ' + esc(unemo(c.n)) + '</div></div>'; }).join('') + '</section>' : '';
    var bl = (t.blocks || []).map(function (b, i) { b._i = i; return b; });
    var insights = bl.filter(function (b) { return b.type === 'insight'; });
    var top = insights.length ? '<section class="ins top">' + insights.map(function (b) { return insightHtml(b); }).join('') + '</section>' : '';
    var blocks = bl.filter(function (b) { return b.type !== 'insight'; }).map(function (b) { var i = b._i;
      var id = bi + '-' + i;
      if (b.type === 'note') return '<div class="notebox">' + esc(b.text) + '</div>';
      return '<section class="glass block"><h3>' + esc(b.title || t.title) + '</h3>' + autoChart(b) + tbl(b, { id: id, all: S.all && S.all[id] }) + (b.note ? '<div class="bnote">' + esc(b.note) + '</div>' : '') + '</section>';
    }).join('');
    return cards + top + blocks + (t.errs ? '<div class="notebox">⚠ ' + t.errs + ' sel dalam tab ini ada ralat formula dan dipaparkan sebagai "—". Maklumkan Finance Manager supaya formula dibaiki.</div>' : '');
  }
  function renderModule() {
    var key = S.page;
    var got = S.pages[key] ? Promise.resolve(S.pages[key]) : rpc('fxPage', [S.token, key]).then(function (d) { S.pages[key] = d; return d; });
    got.then(function (d) { moduleView(d); }).catch(fail);
  }
  function moduleView(d) {
    var key = d.key, ti = Math.min(S.tab[key] || 0, d.tabs.length - 1), t = d.tabs[ti];
    var tabs = d.tabs.length > 1 ? '<div class="tabs">' + d.tabs.map(function (x, i) { return '<button class="' + (i === ti ? 'on' : '') + '" data-act="tab" data-i="' + i + '">' + esc(x.name) + '</button>'; }).join('') + '</div>' : '';
    var head = '<section class="glass ph"><div class="hero-art" style="position:absolute;inset:0;opacity:.35;pointer-events:none">' + heroArt('ph' + key) + '</div><div style="position:relative;display:flex;flex-direction:column;gap:10px">' +
      '<div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><div><div class="kicker">' + esc(t.name) + '</div><h2 style="margin-top:4px">' + esc(t.title || t.name) + '</h2></div>' + (t.status ? chip(t.status) : '') + '</div>' +
      (t.sub ? '<p>' + esc(t.sub) + '</p>' : '') + guideBox(t.name) + (t.alert ? '<div class="err" style="color:#ffcf8a;background:rgba(255,181,71,.08);border-color:rgba(255,181,71,.3)">' + esc(t.alert) + '</div>' : '') + tabs + '</div></section>';
    view(head + moduleTab(t, key + ti) + '<div class="note" style="text-align:center">Data pada ' + esc(d.asOf || '') + ' · tab "' + esc(t.name) + '"</div>');
  }
  A.tab = function (el) { S.tab[S.page] = +el.getAttribute('data-i'); moduleView(S.pages[S.page]); };
  A.showAll = function (el) { S.all = S.all || {}; S.all[el.getAttribute('data-b')] = true; if (S.page === 'settings') renderSettings(); else moduleView(S.pages[S.page]); };

  /* ======================= Action Engine ======================= */
  function renderActions() {
    var got = S.acts ? Promise.resolve(S.acts) : rpc('fxActions', [S.token]).then(function (a) { S.acts = a; return a; });
    got.then(actionsView).catch(fail);
  }
  function actionsView(a) {
    var c = a.counts || {}, f = S.actF || 'open';
    var list = (a.rules || []).filter(function (r) { var l = lamp(r.lamp); return f === 'all' ? true : f === 'open' ? (l === 'r' || l === 'y') : l === f; });
    var sum = '<section class="sumtiles">' + [['r', '🔴', 'Tindakan sekarang', c.r], ['y', '🟡', 'Pantau', c.y], ['w', '⚪', 'Menunggu data / keputusan', c.w], ['g', '🟢', 'OK', c.g]].map(function (x) {
      return '<button class="glass sumtile" style="text-align:left;color:inherit;' + (f === x[0] ? 'border-color:rgba(47,224,122,.5)' : '') + '" data-act="actF" data-f="' + x[0] + '"><span class="dot ' + x[0] + '" style="width:14px;height:14px"></span><div><b>' + esc(x[3] || 0) + '</b><small>' + esc(x[2]) + '</small></div></button>';
    }).join('') + '</section>';
    var tabs = '<div class="tabs">' + [['open', 'Terbuka (🔴 + 🟡)'], ['all', 'Semua 12 peraturan'], ['r', 'Merah'], ['y', 'Kuning'], ['w', 'Menunggu'], ['g', 'OK']].map(function (x) { return '<button class="' + (f === x[0] ? 'on' : '') + '" data-act="actF" data-f="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    var items = list.length ? list.map(function (r) {
      var l = lamp(r.lamp) || 'w';
      var upd = a.canEdit ? '<div class="upd"><label class="note">Status</label><select id="st-' + esc(r.code) + '">' + opts([''].concat(a.statuses || []), r.status) + '</select>' +
        '<textarea id="nt-' + esc(r.code) + '" placeholder="Bukti / catatan (wajib untuk Selesai)"></textarea><button class="btn pri sm" style="justify-content:center" data-act="actSave" data-c="' + esc(r.code) + '">Kemas kini</button>' +
        (r.note ? '<div class="note">Terakhir: ' + esc(r.note) + '</div>' : '') + '</div>' : '<div class="upd"><div class="note">Status: <b>' + esc(r.status || 'Baru') + '</b></div>' + (r.note ? '<div class="note">' + esc(r.note) + '</div>' : '') + '</div>';
      return '<article class="act ' + l + '"><div class="edge"></div><div class="body"><div><div class="code">' + esc(r.code) + ' · ' + dot(r.lamp) + '</div><h4>' + esc(r.trigger) + '</h4>' +
        '<div class="todo">' + esc(r.action && r.action !== '—' ? r.action : 'Tiada tindakan diperlukan sekarang.') + '</div><div class="vt">Kini <b style="color:#ecf7f0">' + esc(r.value || '—') + '</b> · had ' + esc(r.threshold || '—') + '</div>' + (r.how ? '<details class="how"><summary>Cara selesaikan (' + r.how.steps.length + ' langkah)</summary><p class="note">' + esc(r.how.why) + '</p><ol>' + r.how.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>' : '') +
        '<div class="meta"><span class="chip">' + esc(r.pic) + '</span><span class="chip y">SLA ' + esc(r.sla) + '</span>' + (r.status ? '<span class="chip g">' + esc(r.status) + '</span>' : '') + (r.url ? '<a class="chip g" href="' + esc(r.url) + '" target="_blank" rel="noopener">Selesaikan sekarang ↗</a>' : '') + '</div></div>' + upd + '</div></article>';
    }).join('') : '<div class="glass pad"><div class="empty"><b>Tiada apa-apa di sini 🎉</b></div></div>';
    view(sum + '<section class="glass pad">' + tabs + '<p class="note" style="margin:10px 0 0">Ambang dan PIC ditetapkan di sheet FIRAX (Tetapan). Item 🔴 yang belum selesai dibawa ke Isu Berbangkit WAR. Kemas kini di sini menulis Status dan bukti ke tab Action Engine.</p></section><section class="acts">' + items + '</section><div class="note" style="text-align:center">Data pada ' + esc(a.asOf || '') + '</div>');
  }
  A.actF = function (el) { S.actF = el.getAttribute('data-f'); actionsView(S.acts); };
  A.actSave = function (el) {
    var c = el.getAttribute('data-c'), st = val('st-' + c), nt = val('nt-' + c);
    if (!st) return toast('Pilih status dahulu.', true);
    el.disabled = true;
    rpc('fxActionSave', [S.token, c, st, nt]).then(function () { toast(c + ' dikemas kini'); S.acts = null; S.home = null; renderActions(); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };

  /* ======================= Settings ======================= */
  var ROLES = [['CEO', 'CEO & Founder'], ['FM', 'Finance Manager'], ['ACC', 'Staf Akaun'], ['BM', 'Pengurus Cawangan'], ['VIEW', 'Paparan sahaja']];
  function renderSettings() {
    var pU = S.me.role === 'CEO' ? rpc('fxUsers', [S.token]) : Promise.resolve(null);
    var pT = S.pages.settings ? Promise.resolve(S.pages.settings) : rpc('fxPage', [S.token, 'settings']).then(function (d) { S.pages.settings = d; return d; });
    Promise.all([pU, pT]).then(function (x) { S.users = x[0]; settingsView(x[0], x[1]); }).catch(fail);
  }
  function settingsView(users, d) {
    var ti = S.tab.settings || 0, t = d.tabs[Math.min(ti, d.tabs.length - 1)];
    var u = users ? '<section class="glass block"><h3>Pengguna & akses</h3><p class="note" style="margin:-4px 0 12px">Nama + PIN 4 digit. PIN admin hanya ditulis ke lajur N tab <b>APP PENGGUNA</b> dan wajib ditukar oleh pengguna semasa log masuk pertama. PIN tidak pernah dipaparkan dalam FIRAX.</p>' +
      '<div class="tw"><table class="t"><thead><tr><th>Nama</th><th>Peranan</th><th>Status</th><th>PIN</th><th>Log masuk terakhir</th><th></th></tr></thead><tbody>' +
      users.map(function (x) { return '<tr><td><b>' + esc(x.name) + '</b><div class="note">' + esc(x.jawatan) + '</div></td><td>' + esc(x.roleLabel) + '</td><td>' + (x.active ? chip('🟢 Aktif') : chip('⚪ Tidak aktif')) + '</td><td>' + (x.mustChange ? chip('🟡 Wajib tukar') : x.pinSet ? chip('🟢 Ditetapkan') : x.codePending ? chip('🟡 Kod dihantar') : chip('⚪ Belum')) + '</td><td>' + show(x.last) + '</td><td style="white-space:nowrap"><button class="btn sm" data-act="userEdit" data-id="' + esc(x.id) + '">Ubah</button> <button class="btn sm" data-act="userReset" data-id="' + esc(x.id) + '">Reset PIN</button></td></tr>'; }).join('') +
      '</tbody></table></div><div class="row-btn" style="justify-content:flex-start"><button class="btn pri" data-act="userEdit">+ Tambah pengguna</button></div></section>' : '';
    var tabs = '<section class="glass pad"><div class="tabs">' + d.tabs.map(function (x, i) { return '<button class="' + (x === t ? 'on' : '') + '" data-act="setTab" data-i="' + i + '">' + esc(x.name) + '</button>'; }).join('') + '</div><p class="note" style="margin:10px 0 0">Ambang, PIC dan pautan diubah di sheet FIRAX (sel kuning). FIRAX memaparkannya di sini untuk dibaca sahaja.</p></section>';
    view(u + tabs + moduleTab(t, 'set' + ti));
  }
  A.setTab = function (el) { S.tab.settings = +el.getAttribute('data-i'); settingsView(S.users, S.pages.settings); };
  A.userEdit = function (el) {
    var id = el.getAttribute('data-id'), x = id ? (S.users || []).filter(function (u) { return u.id === id; })[0] : { role: 'ACC', active: true };
    modal('<h3>' + (id ? 'Ubah pengguna' : 'Tambah pengguna') + '</h3><div style="margin-top:12px">' + field('Nama', '<input id="un" value="' + esc(x.name || '') + '">') + field('Peranan', '<select id="ur">' + opts(ROLES, x.role) + '</select>') + field('Jawatan', '<input id="uj" value="' + esc(x.jawatan || '') + '">') +
      (id ? field('Status', '<select id="ua">' + opts([['1', 'Aktif'], ['0', 'Tidak aktif']], x.active ? '1' : '0') + '</select>') : field('Cara akses', '<select id="um">' + opts([['pin', 'PIN admin (ditulis ke APP PENGGUNA lajur N)'], ['code', 'Kod aktivasi sekali guna (72 jam)']], 'pin') + '</select>')) +
      '</div><div id="um2"></div><div class="row-btn"><button class="btn" data-act="closeModal">Batal</button><button class="btn pri" data-act="userSave" data-id="' + esc(id || '') + '">Simpan</button></div>');
  };
  A.userSave = function (el) {
    var id = el.getAttribute('data-id');
    el.disabled = true;
    rpc('fxUserSave', [S.token, { id: id || '', name: val('un'), role: val('ur'), jawatan: val('uj'), caw: 'SEMUA', active: id ? val('ua') === '1' : true, method: val('um') }]).then(function (r) {
      if (r.code) modal('<h3>Kod aktivasi</h3><p class="note">Beri kod ini kepada <b>' + esc(r.name) + '</b>. Kod sah sekali sahaja dan tamat ' + esc(r.tamat) + '.</p><div style="font-size:28px;letter-spacing:.2em;font-weight:700;text-align:center;margin:16px 0;color:#2fe07a">' + esc(r.code) + '</div><div class="row-btn"><button class="btn pri" data-act="closeModal">Selesai</button></div>');
      else { closeModal(); toast(r.pinRecorded ? 'Pengguna ditambah — PIN ditulis ke APP PENGGUNA lajur N' : 'Disimpan'); }
      renderSettings();
    }).catch(function (e) { el.disabled = false; $('#um2').innerHTML = '<div class="err">' + esc(e.error) + '</div>'; });
  };
  A.userReset = function (el) {
    var id = el.getAttribute('data-id');
    modal('<h3>Reset PIN</h3><p class="note">PIN lama tidak boleh digunakan serta-merta.</p><div class="row-btn"><button class="btn" data-act="doReset" data-id="' + esc(id) + '" data-m="code">Kod aktivasi</button><button class="btn pri" data-act="doReset" data-id="' + esc(id) + '" data-m="pin">PIN admin baharu</button></div>');
  };
  A.doReset = function (el) {
    el.disabled = true;
    rpc('fxUserCode', [S.token, el.getAttribute('data-id'), el.getAttribute('data-m')]).then(function (r) {
      if (r.code) modal('<h3>Kod aktivasi</h3><div style="font-size:28px;letter-spacing:.2em;font-weight:700;text-align:center;margin:16px 0;color:#2fe07a">' + esc(r.code) + '</div><p class="note">Tamat ' + esc(r.tamat) + '.</p><div class="row-btn"><button class="btn pri" data-act="closeModal">Selesai</button></div>');
      else { closeModal(); toast('PIN baharu ditulis ke APP PENGGUNA lajur N'); }
      renderSettings();
    }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };

  /* ======================= Rutin Kewangan (SOP) ======================= */
  var CADS = [['H', 'Harian', 'Setiap hari bekerja'], ['M', 'Mingguan', 'Ahad transaksi · bayaran Ahad/Selasa/Rabu'], ['B', 'Bulanan', 'Bulan ini · tutup buku'], ['T', 'Tahunan', 'Tahun ini']];
  function renderRoutine() { needRt().then(routineView).catch(fail); }
  function routineView(r) {
    var f = S.rtF || 'H', list = r.tasks.filter(function (t) { return t.c === f; });
    var tiles = '<section class="sumtiles">' + CADS.map(function (c) {
      var p = r.prog[c[0]], pc = p.all ? Math.round(p.done / p.all * 100) : 0;
      return '<button class="glass sumtile rt-t' + (f === c[0] ? ' on' : '') + '" data-act="rtF" data-f="' + c[0] + '"><div class="mring">' + ring(pc) + '</div><div><b>' + p.done + '/' + p.all + '</b><small>' + c[1] + ' · ' + c[2] + '</small></div></button>';
    }).join('') + '</section>';
    var intro = '<section class="glass pad rt-intro"><div><div class="kicker">' + esc(r.today) + '</div><h3 style="margin:6px 0">Rutin kewangan standard Sofwah</h3>' +
      '<p class="note" style="margin:0">Ikut senarai ini setiap hari dan buku akan sentiasa bersih, bulan boleh ditutup dalam 3 hari bekerja (amalan terbaik antarabangsa), dan CEO mendapat angka yang tepat. ' +
      'Tugas bertanda <span class="chip g">Sistem: selesai</span> disahkan automatik oleh FIRAX daripada data. Tugas lain ditanda sendiri selepas dibuat.</p></div></section>';
    var items = list.map(function (t) {
      var st = t.ok ? 'ok' : t.auto && t.auto.s === 'todo' ? 'todo' : '';
      return '<article class="glass rt ' + st + '"><button class="rck' + (t.ok ? ' on' : '') + '" ' + (r.canEdit && !(t.auto && t.auto.s === 'ok') ? 'data-act="rtTick" data-id="' + t.id + '" data-d="' + (t.done ? 0 : 1) + '"' : 'disabled') + ' aria-label="Tanda selesai">' + (t.ok ? '✓' : '') + '</button>' +
        '<div class="rb"><div class="rh"><span class="code">' + esc(t.id) + '</span><h4>' + esc(t.t) + '</h4></div>' +
        '<div class="meta"><span class="chip">' + esc(t.who) + '</span><span class="chip y">' + ic(I.clock).replace('<svg', '<svg width="12" height="12"') + esc(t.when) + '</span>' +
        (t.auto ? '<span class="chip ' + (t.auto.s === 'ok' ? 'g' : t.auto.s === 'todo' ? 'r' : 'w') + '">' + esc(t.auto.text) + '</span>' : '') +
        (t.done ? '<span class="chip g">✓ ' + esc(t.done.by) + ' · ' + esc(t.done.at) + '</span>' : '') + '</div>' +
        '<p class="why">' + esc(t.why) + '</p>' +
        '<details class="how"' + (t.ok ? '' : ' open') + '><summary>Langkah-langkah (' + t.steps.length + ')</summary><ol>' + t.steps.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></details>' +
        (t.done && t.done.note ? '<div class="note">Catatan: ' + esc(t.done.note) + '</div>' : '') +
        '<div class="ra"><button class="btn sm" data-act="nav" data-p="' + esc(t.page) + '">Buka halaman berkaitan ' + ic(I.arrow) + '</button>' +
        (r.canEdit && !(t.auto && t.auto.s === 'ok') ? (t.done ? '<button class="btn sm" data-act="rtTick" data-id="' + t.id + '" data-d="0">Batal tanda</button>' : '<input class="inp sm" id="rn-' + t.id + '" placeholder="Catatan ringkas (pilihan)"><button class="btn pri sm" data-act="rtTick" data-id="' + t.id + '" data-d="1">Tanda selesai</button>') : '') + '</div></div></article>';
    }).join('');
    view(tiles + intro + '<section class="rts">' + items + '</section><div class="note" style="text-align:center">Tanda disimpan dalam tab APP RUTIN mengikut tempoh (' + esc(r.prog[f].key) + '). Rekod siapa dan bila ditanda untuk jejak audit.</div>');
  }
  A.rtF = function (el) { S.rtF = el.getAttribute('data-f'); routineView(S.rt); };
  A.rtTick = function (el) {
    var id = el.getAttribute('data-id'), d = el.getAttribute('data-d') === '1', note = val('rn-' + id);
    el.disabled = true;
    rpc('fxRoutineSave', [S.token, id, d, note]).then(function () { toast(d ? id + ' ditanda selesai' : id + ' dibatalkan'); S.rt = null; renderRoutine(); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };

  /* ======================= Panduan & Kamus ======================= */
  var BENCH = [
    ['Food cost %', 'Kos bahan ÷ jualan', '28% – 35%', 'food'],
    ['SCOR (kos staf %)', 'Kos staf ÷ jualan', '25% – 35%', 'scor'],
    ['Prime cost', '(Bahan + staf) ÷ jualan', '≤ 60% – 65%', 'prime'],
    ['Sewa', 'Sewa ÷ jualan', '≤ 6% – 10%', ''],
    ['Margin bersih', 'Untung bersih ÷ jualan', '5% – 15%', 'margin'],
    ['Runway tunai', 'Baki tunai ÷ opex seminggu', '≥ 8 minggu', 'runway'],
    ['Breakeven', 'Jualan ÷ breakeven', '≥ 120%', 'breakeven'],
    ['Rekon bank', 'Hari padan ÷ hari ada penyata', '100% setiap hari bekerja', 'rekon'],
    ['AP dibayar tepat masa', 'Invois dalam terma ÷ semua', '≥ 95%', 'ap'],
    ['Tutup buku', 'Hari bekerja selepas hujung bulan', '3 – 5 hari', 'tutup'],
    ['Ketepatan POS delivery', 'POS ÷ portal', '99% – 101%', 'ketepatan'],
    ['Void + diskaun manual', '÷ jualan', '< 0.5%', 'void']
  ];
  function renderGuide() {
    if (!S.home) { needHome().then(renderGuide).catch(function () { S.home = { kpi: [] }; renderGuide(); }); return; }
    var KM = { food: /Food cost/, scor: /SCOR/, margin: /Margin bersih/, runway: /Runway/, breakeven: /breakeven/i, rekon: /rekon tertutup/, ap: /AP dibayar/, tutup: /tutup buku/, ketepatan: /Ketepatan/ };
    var now = function (k) { var re = KM[k]; if (!re) return '<span class="muted">—</span>'; var x = (S.home.kpi || []).filter(function (y) { return re.test(y.k); })[0]; return x && x.v ? dot(x.lamp) + ' <b>' + esc(x.v) + '</b>' + (k === 'tutup' ? ' hari' : k === 'runway' ? ' minggu' : '') : '<span class="muted">⚪ belum ada data</span>'; };
    var q = (S.gq || '').toLowerCase(), list = GL.filter(function (g) { return !q || (g.n + ' ' + g.a).toLowerCase().indexOf(q) >= 0; });
    var steps = [['1', 'Mulakan di Utama', 'Lihat Skor Kesihatan, 5 tiang dan Ringkasan 30 saat. ⚪ bermaksud data belum lengkap, bukan prestasi buruk.'],
      ['2', 'Buat Rutin hari ini', 'Halaman Rutin Kewangan memberi senarai tugas harian, mingguan dan bulanan dengan langkah demi langkah.'],
      ['3', 'Selesaikan Tindakan 🔴', 'Setiap amaran ada PIC, SLA dan butang "Cara selesaikan". Tanda Selesai dengan bukti.'],
      ['4', 'Faham setiap nombor', 'Tekan butang ? di sebelah mana-mana istilah untuk maksud, cara kira dan julat sihat.'],
      ['5', 'Lapor dengan yakin', 'Tekan Cetak di bahagian atas untuk PDF laporan WAR atau lembaga.']];
    view('<section class="glass pad"><div class="kicker">Cara guna FIRAX dalam 5 langkah</div><div class="steps5">' + steps.map(function (s) { return '<div><span>' + s[0] + '</span><b>' + esc(s[1]) + '</b><p>' + esc(s[2]) + '</p></div>'; }).join('') + '</div></section>' +
      '<section class="glass pad"><div class="sec-h"><h3>Penanda aras industri restoran</h3><span class="note">Panduan umum amalan F&B antarabangsa; sasaran rasmi Sofwah ditetapkan CEO di Tetapan</span></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>Ukuran</th><th>Cara kira</th><th>Julat sihat (industri)</th><th>Sofwah kini</th><th></th></tr></thead><tbody>' + BENCH.map(function (b) { return '<tr><td><b>' + esc(b[0]) + '</b></td><td>' + esc(b[1]) + '</td><td><span class="chip g">' + esc(b[2]) + '</span></td><td>' + now(b[3]) + '</td><td>' + (b[3] ? helpBtn('', b[3]) : '') + '</td></tr>'; }).join('') + '</tbody></table></div></section>' +
      '<section class="glass pad"><div class="sec-h"><h3>Kamus kewangan FIRAX · ' + GL.length + ' istilah</h3><input class="inp" id="gq" placeholder="Cari istilah, cth. runway" value="' + esc(S.gq || '') + '" style="max-width:280px"></div>' +
      '<div class="gloss">' + (list.length ? list.map(function (g) { return '<article class="gcard">' + glossHtml(g) + '</article>'; }).join('') : '<div class="empty">Tiada istilah sepadan</div>') + '</div></section>');
    var inp = $('#gq'); if (inp) { inp.oninput = function () { S.gq = this.value; var pos = this.selectionStart; renderGuide(); var n = $('#gq'); n.focus(); n.setSelectionRange(pos, pos); }; }
  }

  /* ======================= Bayaran (run Ahad · Selasa · Rabu) ======================= */
  var CAWN = { GN: 'Gurun', KN: 'Kuala Nerang', SP: 'Sungai Petani', AS: 'Alor Setar', JT: 'Jitra', AC: 'Aman Central', HQ: 'HQ' };
  function rmf(n) { return 'RM' + fnum(n, 2); }
  function renderPay(ymd) {
    var want = ymd || S.payD || '';
    rpc('fxPay', [S.token, want]).then(function (r) { S.pay = r; S.payD = r.ymd; payView(r); }).catch(function (e) { if (want) { S.payD = ''; renderPay(); } else fail(e); });
  }
  function link(u, t) { return /^https?:\/\//.test(u || '') ? '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(t) + '</a>' : '<span class="muted">' + esc(u ? 'WhatsApp' : '—') + '</span>'; }
  function payView(r) {
    var tabs = '<section class="paytabs">' + r.runs.map(function (d) {
      return '<button class="glass ptab' + (d.ymd === r.ymd ? ' on' : '') + '" data-act="payD" data-d="' + d.ymd + '"><small>' + (d.today ? 'HARI INI · ' : d.past ? 'LEPAS · ' : '') + esc(d.dmy) + '</small><b>' + esc(d.day) + '</b><span>' + (d.hr ? 'HR: staf, sambilan, hari jadi' : 'Supplier / vendor') + '</span></button>';
    }).join('') + '</section>';
    var s = r.sum, left = s.n - s.nPaid;
    var tiles = '<section class="sumtiles">' +
      '<div class="glass sumtile"><div><b>' + rmf(s.due - s.paid) + '</b><small>Perlu dibayar run ini</small></div></div>' +
      '<div class="glass sumtile"><div><b>' + left + '</b><small>Penerima belum dibayar</small></div></div>' +
      '<div class="glass sumtile"><div><b>' + rmf(s.paid) + '</b><small>Sudah dibayar · ' + s.nPaid + ' penerima</small></div></div>' +
      '<div class="glass sumtile"><div><b style="color:var(--y)">' + r.wait.n + '</b><small>Belum diluluskan · ' + rmf(r.wait.amt) + ' (tidak dibayar)</small></div></div></section>';
    var steps = [['1', 'Buka folder bayaran', 'Semua invois run ini dalam satu folder Drive.'], ['2', 'Bayar di M2U Biz', 'Ikut jumlah dalam setiap kad. Satu supplier = satu transaksi.'], ['3', 'Tanda dibayar', 'Muat naik slip dan isi rujukan M2U.'], ['4', 'Sistem buat selebihnya', 'Slip dinamakan, difailkan ke folder supplier' + (r.autoMail ? ' dan emel balasan dihantar ke supplier' : '') + '.']];
    var how = '<section class="glass pad"><div class="sec-h"><div><div class="kicker">' + esc(r.day) + ' · ' + esc(ymdS(r.ymd)) + (r.hr ? ' · Khusus HR' : ' · Supplier') + '</div><h3 style="margin-top:6px">Hanya item dalam senarai ini dibayar</h3></div>' +
      (r.canEdit ? '<div class="row-btn" style="margin:0"><button class="btn" data-act="payFile">' + ic(I.refresh) + 'Fail & namakan invois</button><button class="btn pri" data-act="payFolder">' + ic(I.books) + 'Buka folder bayaran</button></div>' : '') + '</div>' +
      '<div class="steps4">' + steps.map(function (x) { return '<div><span>' + x[0] + '</span><b>' + esc(x[1]) + '</b><p>' + esc(x[2]) + '</p></div>'; }).join('') + '</div></section>';
    var body = '';
    if (!r.groups.length && !(r.hr && (r.sambilan.length || r.bday.length))) body = '<section class="glass pad"><div class="empty">✅ Tiada bayaran dijadualkan untuk ' + esc(r.day) + ' ini.' + (r.wait.n ? '<br>' + r.wait.n + ' invois masih menunggu kelulusan — lihat di bawah.' : '') + '</div></section>';
    body += r.groups.map(function (g, i) { return supCard(r, g, i); }).join('');
    if (r.hr) body += sambilanCard(r) + bdayCard(r);
    view(tabs + tiles + how + body + waitCard(r) +
      '<div class="note" style="text-align:center">FIRAX tidak membuat bayaran dan tidak menyimpan nombor akaun bank. Bayaran dibuat oleh staf di M2U Biz; sistem hanya menyediakan senarai, memfailkan slip dan menghantar emel balasan.</div>');
  }
  function ymdS(y) { var p = String(y).split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  function supCard(r, g, i) {
    var done = g.paid >= g.total - 0.004, part = g.paid > 0 && !done, open = g.items.filter(function (x) { return x.st !== 'Dibayar'; });
    var mailSt = g.items.map(function (x) { return x.mail; }).filter(String)[0] || '';
    var head = '<div class="sec-h"><div><h3>' + (done ? '✅ ' : '') + esc(g.label) + '</h3><div class="meta">' +
      chip(g.staff ? 'Tuntutan staf' : (g.hari || 'Hari bayar belum ditetapkan'), g.hari ? '' : 'y') +
      (g.email ? '<span class="chip">✉ ' + esc(g.email) + '</span>' : '<span class="chip w">Tiada emel · WhatsApp</span>') +
      (g.items.some(function (x) { return x.late && x.st !== 'Dibayar'; }) ? '<span class="chip r">Tertunggak dari run lepas</span>' : '') +
      (mailSt ? '<span class="chip ' + (/Dihantar/.test(mailSt) ? 'g' : /Menunggu/.test(mailSt) ? 'y' : 'w') + '">' + esc(mailSt) + '</span>' : '') +
      (g.folder ? '<a class="chip" href="' + esc(g.folder) + '" target="_blank" rel="noopener">📁 Folder supplier</a>' : '') + '</div></div>' +
      '<div class="paytot"><small>' + (done ? 'Dibayar' : part ? 'Baki' : 'Jumlah bayar') + '</small><b>' + rmf(done ? g.total : g.total - g.paid) + '</b></div></div>';
    var rows = g.items.map(function (x) {
      return '<tr class="' + (x.st === 'Dibayar' ? 'paid' : '') + '"><td>' + esc(CAWN[x.caw] || x.caw) + '</td><td><b>' + show(x.inv) + '</b><div class="muted" style="font-size:11px">' + esc(x.id) + '</div></td><td>' + show(x.tinv) + '</td><td>' + show(x.due) + '</td><td class="n">' + rmf(x.amt) + '</td><td>' + link(x.file, x.std ? 'Invois ✓' : 'Invois') + '</td><td>' +
        (x.st === 'Dibayar' ? chip('✅ Dibayar ' + (x.paidOn || ''), 'g') + (x.slip ? ' ' + link(x.slip, 'Slip') : '') : r.canEdit ? '<label class="ck"><input type="checkbox" class="pk" data-g="' + i + '" value="' + x.row + '" checked> bayar</label>' : chip('Belum', 'y')) + '</td></tr>';
    }).join('');
    return '<section class="glass pad paycard' + (done ? ' done' : '') + '">' + head + '<div class="tw"><table class="t"><thead><tr><th>Cawangan</th><th>No. invois</th><th>Tarikh invois</th><th>Jatuh tempo</th><th class="n">Amaun</th><th>Fail</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      (open.length && r.canEdit ? '<div class="row-btn"><button class="btn pri" data-act="payMark" data-k="sup" data-g="' + i + '">Tanda dibayar + muat naik slip</button></div>' : '') + '</section>';
  }
  function sambilanCard(r) {
    if (!r.sambilan.length) return '<section class="glass pad"><div class="sec-h"><h3>Staf sambilan / casual</h3></div><div class="empty">Tiada bayaran sambilan tertunggak.</div></section>';
    var rows = r.sambilan.map(function (p, i) {
      var ok = !p.hold && p.final;
      return '<tr><td>' + esc(CAWN[p.caw] || p.caw) + '</td><td><b>' + esc(p.name) + '</b><div class="muted" style="font-size:11px">' + esc(p.jenis) + ' · ' + p.rows.map(function (x) { return esc(x.mon) + ' (' + esc(x.qty) + ')'; }).join(', ') + '</div></td><td class="n">' + rmf(p.amt) + '</td><td>' +
        (p.hold ? chip('🔴 Ditahan HR — jangan bayar') : !p.final ? chip('⏳ Belum muktamad (4hb)') : r.canEdit ? '<button class="btn sm" data-act="payMark" data-k="sambilan" data-g="' + i + '">Tanda dibayar</button>' : chip('Belum', 'y')) + '</td></tr>';
    }).join('');
    var tot = r.sambilan.filter(function (p) { return !p.hold && p.final; }).reduce(function (a, p) { return a + p.amt; }, 0);
    return '<section class="glass pad"><div class="sec-h"><div><h3>Staf sambilan / casual</h3><div class="note">Dari WAR HR › Bayaran Sambilan. Bank & no. akaun rujuk sheet HR (tidak dipaparkan di FIRAX).</div></div><div class="paytot"><small>Boleh dibayar</small><b>' + rmf(tot) + '</b></div></div>' +
      '<div class="tw"><table class="t"><thead><tr><th>Cawangan</th><th>Nama</th><th class="n">Jumlah</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
  }
  function bdayCard(r) {
    var rows = r.bday.map(function (b, i) {
      return '<tr><td>' + esc(CAWN[b.caw] || b.caw) + '</td><td><b>' + esc(b.name) + '</b><div class="muted" style="font-size:11px">' + esc(b.id) + '</div></td><td>🎂 ' + esc(b.bd) + '</td><td>' + (b.late ? chip('🔴 Lewat · Selasa ' + ymdS(b.pay)) : chip('🟡 Selasa ini')) + '</td><td class="n">RM100.00</td><td>' + (r.canEdit ? '<label class="ck"><input type="checkbox" class="pkb" value="' + b.row + '" checked> bayar</label>' : '') + '</td></tr>';
    }).join('');
    return '<section class="glass pad"><div class="sec-h"><div><h3>🎁 Hadiah hari jadi staf · RM100</h3><div class="note">Dibayar Selasa pertama selepas hari jadi. Senarai dari AP › Hari Jadi Staf (QuickHR; IC tidak disimpan).</div></div><div class="paytot"><small>' + r.bday.length + ' staf</small><b>' + rmf(r.bday.length * 100) + '</b></div></div>' +
      (r.bday.length ? '<div class="tw"><table class="t"><thead><tr><th>Cawangan</th><th>Nama</th><th>Hari jadi</th><th>Jadual</th><th class="n">Hadiah</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' + (r.canEdit ? '<div class="row-btn"><button class="btn pri" data-act="payMark" data-k="hadiah">Tanda hadiah dibayar</button></div>' : '') : '<div class="empty">Tiada hari jadi untuk dibayar minggu ini.</div>') + '</section>';
  }
  function waitCard(r) {
    if (!r.wait.n) return '';
    var rows = r.wait.list.map(function (x) {
      return '<tr><td>' + (r.canApprove ? '<input type="checkbox" class="pka" value="' + x.row + '">' : '') + '</td><td><b>' + esc(x.sup) + '</b><div class="muted" style="font-size:11px">' + esc(x.id) + (x.note ? ' · ' + esc(String(x.note).slice(0, 90)) : '') + '</div></td><td>' + esc(CAWN[x.caw] || x.caw) + '</td><td>' + show(x.inv) + '</td><td>' + show(x.due) + '</td><td class="n">' + rmf(x.amt) + '</td><td>' + chip(x.st, x.st === 'Disemak' ? 'y' : 'w') + '</td><td>' + link(x.file, 'Invois') + '</td></tr>';
    }).join('');
    return '<section class="glass pad"><details' + (r.canApprove ? ' open' : '') + '><summary class="sec-h" style="cursor:pointer"><h3>⏳ Menunggu kelulusan · ' + r.wait.n + ' invois · ' + rmf(r.wait.amt) + '</h3><span class="note">Tidak masuk senarai bayaran sehingga Diluluskan</span></summary>' +
      '<div class="tw"><table class="t"><thead><tr><th></th><th>Supplier</th><th>Cawangan</th><th>No. invois</th><th>Jatuh tempo</th><th class="n">Amaun</th><th>Status</th><th>Fail</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="row-btn">' + '<a class="btn" href="' + esc(r.apUrl) + '" target="_blank" rel="noopener">Buka fail AP</a>' + (r.canApprove ? '<button class="btn pri" data-act="payApprove">Luluskan yang dipilih</button>' : '') + '</div></details></section>';
  }
  A.payD = function (el) { S.payD = el.getAttribute('data-d'); view('<div class="skel" style="height:300px"></div>'); renderPay(S.payD); };
  A.payFolder = function (el) {
    el.disabled = true; toast('Menyediakan folder bayaran…');
    rpc('fxPayFolder', [S.token, S.pay.ymd]).then(function (x) { el.disabled = false; window.open(x.url, '_blank'); toast('Folder ' + x.name + (x.added ? ' · ' + x.added + ' invois ditambah' : '')); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };
  A.payFile = function (el) {
    el.disabled = true; toast('Menamakan & memfailkan invois…');
    rpc('fxPayFileNow', [S.token]).then(function (x) { toast(x.filed + ' invois difailkan' + (x.errors ? ' · ' + x.errors + ' gagal' : '')); renderPay(S.pay.ymd); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };
  A.payApprove = function (el) {
    var rows = Array.prototype.map.call(document.querySelectorAll('.pka:checked'), function (c) { return +c.value; });
    if (!rows.length) { toast('Pilih invois untuk diluluskan', true); return; }
    el.disabled = true;
    rpc('fxPayApprove', [S.token, rows]).then(function (x) { toast(x.approved + ' invois diluluskan · masuk jadual bayaran'); renderPay(S.pay.ymd); }).catch(function (e) { el.disabled = false; toast(e.error, true); });
  };
  A.payMark = function (el) {
    var k = el.getAttribute('data-k'), gi = +el.getAttribute('data-g'), r = S.pay, rows, title, total, needSlip = k === 'sup', key = '';
    if (k === 'sup') { var g = r.groups[gi]; key = g.key; rows = Array.prototype.map.call(document.querySelectorAll('.pk[data-g="' + gi + '"]:checked'), function (c) { return +c.value; }); total = g.items.filter(function (x) { return rows.indexOf(x.row) >= 0; }).reduce(function (a, x) { return a + x.amt; }, 0); title = g.label; }
    else if (k === 'sambilan') { var p = r.sambilan[gi]; key = p.name; rows = p.rows.map(function (x) { return x.row; }); total = p.amt; title = 'Sambilan · ' + p.name; }
    else { rows = Array.prototype.map.call(document.querySelectorAll('.pkb:checked'), function (c) { return +c.value; }); total = rows.length * 100; title = 'Hadiah hari jadi · ' + rows.length + ' staf'; }
    if (!rows.length) { toast('Pilih sekurang-kurangnya satu baris', true); return; }
    S.payM = { kind: k, key: key, rows: rows };
    modal('<h3>Tanda dibayar</h3><p class="note" style="margin:6px 0 14px">' + esc(title) + ' · ' + rows.length + ' baris · <b style="color:#2fe07a">' + rmf(total) + '</b><br>Pastikan jumlah di M2U sama dengan jumlah ini.</p>' +
      field('Slip bayaran M2U (PDF / gambar)' + (needSlip ? '' : ' · pilihan'), '<input type="file" id="pslip" accept="application/pdf,image/*">') +
      field('Rujukan transaksi M2U', '<input id="pref" placeholder="cth. M2U 1234567890">') +
      field('Tarikh bayar', '<input type="date" id="pdate" value="' + esc(r.today) + '" max="' + esc(r.today) + '">') +
      (k === 'sup' && r.autoMail ? '<p class="note">Selepas disimpan, emel balasan berserta slip dihantar ke supplier dalam ±30 minit (invois yang diterima melalui emel sahaja).</p>' : '') +
      '<div class="row-btn"><button class="btn" data-act="closeModal">Batal</button><button class="btn pri" id="psave" data-act="paySave">Simpan</button></div>');
  };
  A.paySave = function (el) {
    var m = S.payM, f = $('#pslip').files[0], ref = val('pref'), d = val('pdate');
    if (!ref) { toast('Isi rujukan M2U', true); return; }
    if (m.kind === 'sup' && !f) { toast('Muat naik slip bayaran', true); return; }
    if (f && f.size > 10 * 1048576) { toast('Fail terlalu besar (had 10MB)', true); return; }
    el.disabled = true; el.textContent = 'Menyimpan…';
    var send = function (b64) {
      rpc('fxPaySlip', [S.token, { ymd: S.pay.ymd, kind: m.kind, key: m.key, rows: m.rows, ref: ref, paid: d, b64: b64 || '', mime: f ? f.type : '', name: f ? f.name : '' }])
        .then(function (x) { closeModal(); toast('✅ ' + x.n + ' baris ditanda Dibayar' + (x.name ? ' · slip: ' + x.name : '')); renderPay(S.pay.ymd); })
        .catch(function (e) { el.disabled = false; el.textContent = 'Simpan'; toast(e.error, true); });
    };
    if (!f) return send('');
    var rd = new FileReader(); rd.onload = function () { send(String(rd.result).split(',')[1]); }; rd.onerror = function () { el.disabled = false; toast('Gagal membaca fail', true); }; rd.readAsDataURL(f);
  };

  /* ======================= acara & mula ======================= */
  document.addEventListener('click', function (e) {
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
