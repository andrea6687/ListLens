/* ListLens - filtra e riordina le liste di qualsiasi sito (prototipo) */
(() => {
'use strict';
if (window.__listLens) { window.__listLens.toggle(); return; }

/* ---------- utilità ---------- */
const NUMRE = /-?\d[\d.,'’\s]*\d|-?\d/;
const UNITS = /^(eur|euro|km|kg|cv|kw|hp|mq|m2|m|cm|mm|l|anni|mesi|pz|k)?$/;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cssEsc = s => (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/[^\w-]/g, '\\$&');
const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
const classes = el => [...el.classList];

function parseNum(s) {
  const m = String(s).match(NUMRE);
  if (!m) return NaN;
  let t = m[0].replace(/[\s'’]/g, '');
  const c = t.lastIndexOf(','), d = t.lastIndexOf('.');
  if (c > -1 && d > -1) t = c > d ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  else if (c > -1) t = t.replace(',', '.');
  else if (d > -1 && /^-?\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');
  return parseFloat(t);
}
function isNumeric(s) {
  const m = s.match(NUMRE);
  if (!m) return false;
  const rest = s.replace(m[0], '').toLowerCase().replace(/[€$£%.,/\s-]/g, '');
  return UNITS.test(rest);
}
const h = (t, p = {}, ...k) => {
  const e = document.createElement(t);
  for (const [a, v] of Object.entries(p)) {
    if (a === 'class') e.className = v;
    else if (a.startsWith('on')) e.addEventListener(a.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(a, v === true ? '' : v);
  }
  k.flat().filter(Boolean).forEach(c => e.append(c instanceof Node ? c : document.createTextNode(String(c))));
  return e;
};

/* ---------- stato ---------- */
const S = { itemSel: null, parent: null, rows: [], markers: [], fields: [], filters: {}, sort: null,
  mode: 'intro', open: true, obs: null, busy: false, msg: '', count: 0, shown: 0, countEl: null };
const store = {
  key: () => 'listlens:' + location.host + location.pathname,
  load() { try { return JSON.parse(localStorage.getItem(this.key())); } catch (e) { return null; } },
  save(v) { try { localStorage.setItem(this.key(), JSON.stringify(v)); } catch (e) {} },
  clear() { try { localStorage.removeItem(this.key()); } catch (e) {} }
};

/* ---------- rilevamento lista ---------- */
function similar(a, b) {
  if (a.tagName !== b.tagName) return false;
  const ca = classes(a), cb = classes(b);
  if (!ca.length && !cb.length) return true;
  const inter = ca.filter(c => cb.includes(c)).length;
  return inter / new Set([...ca, ...cb]).size >= 0.5;
}
function fieldPaths(item) {
  const out = [];
  (function walk(el, path) {
    [...el.children].forEach((c, i) => {
      if (/^(script|style|noscript|svg)$/i.test(c.tagName)) return;
      const p = path.concat(i), t = ownText(c);
      if (t) out.push({ key: p.join('.'), path: p, text: t, el: c });
      walk(c, p);
    });
  })(item, []);
  return out;
}
function detectFrom(target) {
  let el = target && target.nodeType === 1 ? target : target && target.parentElement, best = null, depth = 0;
  while (el && el !== document.documentElement && depth < 10) {
    const par = el.parentElement;
    if (par) {
      const sibs = [...par.children].filter(c => similar(c, el));
      if (sibs.length >= 3 && fieldPaths(el).length >= 2 && (!best || sibs.length > best.sibs.length)) best = { el, parent: par, sibs };
    }
    el = par; depth++;
  }
  return best;
}
function pathTo(el) {
  const parts = [];
  while (el && el.nodeType === 1 && el !== document.documentElement) {
    if (el.id && document.querySelectorAll('#' + cssEsc(el.id)).length === 1) { parts.unshift('#' + cssEsc(el.id)); break; }
    let p = el.tagName.toLowerCase();
    const par = el.parentElement;
    if (par) { const same = [...par.children].filter(c => c.tagName === el.tagName); if (same.length > 1) p += ':nth-of-type(' + (same.indexOf(el) + 1) + ')'; }
    parts.unshift(p); el = par;
  }
  return parts.join(' > ');
}
function selectorFor(d) {
  const common = d.sibs.map(classes).reduce((a, b) => a.filter(c => b.includes(c)));
  return pathTo(d.parent) + ' > ' + d.el.tagName.toLowerCase() + common.slice(0, 3).map(c => '.' + cssEsc(c)).join('');
}
function queryItems() {
  let els = [];
  try { els = [...document.querySelectorAll(S.itemSel)]; } catch (e) {}
  els = els.filter(e => !host.contains(e));
  const p = els.length ? els[0].parentElement : null;
  return els.filter(e => e.parentElement === p);
}

/* ---------- campi ---------- */
const HINTS = [[/pric|prezz|cost/i, 'Prezzo'], [/year|anno|immatr/i, 'Anno'], [/\bkm|mileage|chilom/i, 'Km'],
  [/region/i, 'Regione'], [/city|citt|comune/i, 'Città'], [/loc|luogo|place/i, 'Luogo'],
  [/title|titol|name|nome|model/i, 'Titolo'], [/date|data/i, 'Data'], [/fuel|carbur|alimentaz/i, 'Carburante']];
function prep(f) { f.re = f.prefix ? new RegExp('^\\s*' + esc(f.prefix) + '\\s*:\\s*', 'i') : null; return f; }
function extract(el, f) {
  let n = el;
  for (const i of f.path) n = n && n.children[i];
  if (!n) return '';
  let t = ownText(n);
  if (f.re) t = t.replace(f.re, '');
  return t;
}
function buildFields(els) {
  const agg = new Map(), n = els.length;
  els.forEach(el => fieldPaths(el).forEach(f => {
    let a = agg.get(f.key);
    if (!a) { a = { key: f.key, path: f.path, vals: [], hint: '', tag: f.el.tagName }; agg.set(f.key, a); }
    a.vals.push(f.text);
    if (!a.hint && typeof f.el.className === 'string') a.hint = f.el.className;
  }));
  const out = [], used = new Set();
  for (const a of agg.values()) {
    if (a.vals.length < n * 0.5) continue;
    let prefix = null;
    const ms = a.vals.map(v => v.match(/^([^:\d]{2,24}):\s*(.+)$/)).filter(Boolean);
    if (ms.length >= a.vals.length * 0.8) {
      const lab = ms[0][1].trim();
      if (ms.filter(x => x[1].trim().toLowerCase() === lab.toLowerCase()).length >= ms.length * 0.8) {
        prefix = lab;
        const re = new RegExp('^\\s*' + esc(lab) + '\\s*:\\s*', 'i');
        a.vals = a.vals.map(v => v.replace(re, ''));
      }
    }
    const distinct = new Set(a.vals).size;
    if (distinct < 2) continue;
    let type = 'text';
    if (a.vals.filter(isNumeric).length >= a.vals.length * 0.8) type = 'num';
    else if (distinct <= 40 && distinct <= Math.max(2, n * 0.7)) type = 'cat';
    let name = prefix;
    if (!name) { const hm = HINTS.find(([re]) => re.test(a.hint)); if (hm) name = hm[1]; }
    if (!name && /^H[1-3]$/.test(a.tag)) name = 'Titolo';
    if (!name) {
      if (a.vals.filter(v => /[€$£]/.test(v)).length >= a.vals.length * 0.5) name = 'Prezzo';
      else if (a.vals.filter(v => /\bkm\b/i.test(v)).length >= a.vals.length * 0.5) name = 'Km';
      else if (a.vals.filter(v => /^(19|20)\d\d$/.test(v.trim())).length >= a.vals.length * 0.5) name = 'Anno';
    }
    if (!name) name = 'Campo ' + (out.length + 1);
    let uniq = name, k = 2;
    while (used.has(uniq)) uniq = name + ' ' + k++;
    used.add(uniq);
    out.push(prep({ key: a.key, path: a.path, name: uniq, type, prefix }));
    if (out.length >= 12) break;
  }
  return out;
}

/* ---------- applicazione filtri / ordinamento ---------- */
function setHidden(el, hide) {
  if (hide) {
    if (!el.hasAttribute('data-ll-h')) {
      el.setAttribute('data-ll-h', '1');
      el.dataset.llPv = el.style.getPropertyValue('display');
      el.dataset.llPp = el.style.getPropertyPriority('display');
    }
    el.style.setProperty('display', 'none', 'important');
  } else if (el.hasAttribute('data-ll-h')) {
    el.removeAttribute('data-ll-h');
    el.style.removeProperty('display');
    if (el.dataset.llPv) el.style.setProperty('display', el.dataset.llPv, el.dataset.llPp);
  }
}
function rebuild() {
  S.busy = true;
  S.markers.forEach(m => m.remove()); S.markers = [];
  const old = new Map(S.rows.map(r => [r.el, r.i]));
  let next = 1e6;
  const domEls = queryItems();
  domEls.forEach(el => { const m = document.createComment('ll'); el.before(m); S.markers.push(m); });
  S.rows = domEls.map(el => {
    const v = {}, n = {};
    S.fields.forEach(f => { v[f.key] = extract(el, f); n[f.key] = f.type === 'num' ? parseNum(v[f.key]) : NaN; });
    return { el, i: old.has(el) ? old.get(el) : next++, v, n, ok: true };
  }).sort((a, b) => a.i - b.i);
  S.rows.forEach((r, i) => r.i = i);
  S.parent = domEls[0] ? domEls[0].parentElement : null;
  watch();
  S.busy = false;
}
function watch() {
  if (S.obs) S.obs.disconnect();
  if (!S.parent) return;
  let t;
  S.obs = new MutationObserver(() => {
    if (S.busy) return;
    clearTimeout(t);
    t = setTimeout(() => {
      if (queryItems().length !== S.rows.length) { rebuild(); apply(); if (S.open && S.mode === 'tools') render(); }
    }, 250);
  });
  S.obs.observe(S.parent, { childList: true });
}
function apply() {
  if (!S.rows.length) return;
  S.busy = true;
  const pass = r => S.fields.every(f => {
    const st = S.filters[f.key];
    if (!st) return true;
    if (f.type === 'cat') return !st.sel || !st.sel.size || st.sel.has(r.v[f.key]);
    if (f.type === 'num') {
      const x = r.n[f.key];
      if (st.min != null && !(x >= st.min)) return false;
      if (st.max != null && !(x <= st.max)) return false;
      return true;
    }
    return !st.q || r.v[f.key].toLowerCase().includes(st.q.toLowerCase());
  });
  let shown = 0;
  S.rows.forEach(r => { r.ok = pass(r); setHidden(r.el, !r.ok); if (r.ok) shown++; });
  const order = S.rows.slice();
  const sf = S.sort && S.fields.find(x => x.key === S.sort.key);
  if (sf) {
    const d = S.sort.dir;
    order.sort((a, b) => {
      let c;
      if (sf.type === 'num') {
        const x = a.n[sf.key], y = b.n[sf.key];
        if (isNaN(x) && isNaN(y)) c = 0; else if (isNaN(x)) return 1; else if (isNaN(y)) return -1; else c = x - y;
      } else c = a.v[sf.key].localeCompare(b.v[sf.key], 'it', { numeric: true, sensitivity: 'base' });
      return c * d || a.i - b.i;
    });
  }
  order.forEach((r, i) => S.markers[i].after(r.el));
  if (S.obs) S.obs.takeRecords();
  S.busy = false;
  S.shown = shown;
  updateCount();
  save();
}
function restore() {
  S.filters = {}; S.sort = null;
  if (S.rows.length) apply();
  if (S.obs) S.obs.disconnect();
  S.markers.forEach(m => m.remove());
  S.rows = []; S.markers = [];
}
function save() {
  if (!S.itemSel || S.mode !== 'tools') return;
  store.save({
    itemSel: S.itemSel,
    fields: S.fields.map(({ key, path, name, type, prefix }) => ({ key, path, name, type, prefix })),
    sort: S.sort,
    filters: Object.fromEntries(Object.entries(S.filters).map(([k, s]) => [k, { sel: s.sel ? [...s.sel] : undefined, min: s.min, max: s.max, q: s.q }]))
  });
}

/* ---------- wizard ---------- */
const hl = new Set();
function mark(el) { if (!hl.has(el)) { el.dataset.llOl = el.style.outline; el.style.outline = '3px solid #2563eb'; el.style.outlineOffset = '-3px'; hl.add(el); } }
function clearHl() { hl.forEach(el => { el.style.outline = el.dataset.llOl || ''; el.style.outlineOffset = ''; delete el.dataset.llOl; }); hl.clear(); }
let pickOff = null;
function startPick() {
  if (pickOff) pickOff();
  restore(); clearHl();
  S.mode = 'pick'; S.msg = ''; S.open = false; render();
  const inHost = e => e.composedPath && e.composedPath().includes(host);
  const onClick = e => {
    if (inHost(e)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    pick(e.target);
  };
  const onMove = e => {
    if (e.pointerType !== 'mouse' || inHost(e)) return;
    clearHl();
    const d = detectFrom(e.target);
    if (d) mark(d.el);
  };
  document.addEventListener('click', onClick, true);
  document.addEventListener('pointermove', onMove, true);
  pickOff = () => { document.removeEventListener('click', onClick, true); document.removeEventListener('pointermove', onMove, true); clearHl(); pickOff = null; };
}
function cancelPick() { if (pickOff) pickOff(); S.mode = 'intro'; S.open = true; render(); }
function pick(target) {
  const d = detectFrom(target);
  if (!d) { S.msg = 'Non vedo una lista qui. Tocca un elemento di un annuncio.'; render(); return; }
  if (pickOff) pickOff();
  S.itemSel = selectorFor(d);
  const els = queryItems();
  S.fields = buildFields(els);
  els.forEach(mark);
  S.count = els.length; S.mode = 'confirm'; S.msg = '';
  render();
}
function confirmList() {
  clearHl();
  S.mode = 'tools'; S.open = true; S.filters = {}; S.sort = null;
  rebuild(); apply(); render();
}
function forget() { store.clear(); restore(); S.mode = 'intro'; S.fields = []; S.itemSel = null; render(); }

/* ---------- interfaccia ---------- */
const CSS_TEXT = `
*{box-sizing:border-box;font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}
button,select,input{font-size:15px}
.fab{position:fixed;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));width:52px;height:52px;border-radius:26px;border:0;background:#111;color:#fff;font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,.35)}
.sheet{position:fixed;left:0;right:0;bottom:0;max-height:72vh;display:flex;flex-direction:column;background:#fff;color:#111;border-radius:16px 16px 0 0;box-shadow:0 -6px 24px rgba(0,0,0,.28);padding-bottom:env(safe-area-inset-bottom)}
@media(min-width:700px){.sheet{left:auto;right:16px;bottom:16px;width:380px;border-radius:16px}}
.hd{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #e5e7eb}
.hd b{flex:1}.count{font-size:13px;color:#555;background:#f3f4f6;padding:3px 9px;border-radius:99px}
.x{border:0;background:none;font-size:18px;padding:6px 8px;color:#444}
.body{padding:12px 14px;overflow:auto;display:flex;flex-direction:column;gap:12px}
p{margin:0;font-size:14px;color:#444;line-height:1.4}
.pri,.sec{border-radius:10px;padding:10px 14px;min-height:42px;border:1px solid #111}
.pri{background:#111;color:#fff}.sec{background:#fff;color:#111;border-color:#d1d5db}
.row{display:flex;gap:8px;align-items:center}.row select{flex:1;min-height:42px;border:1px solid #d1d5db;border-radius:10px;padding:0 8px;background:#fff}
.dir{min-width:46px;min-height:42px;border:1px solid #d1d5db;border-radius:10px;background:#fff}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px}
.ft{display:flex;justify-content:space-between;gap:8px;font-size:14px}.ex{color:#888;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:50%}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{border:1px solid #d1d5db;background:#fff;border-radius:99px;padding:7px 12px;font-size:14px;color:#111}
.chip.on{background:#2563eb;border-color:#2563eb;color:#fff}
.mm{display:flex;gap:8px}.mm input,.q{flex:1;min-width:0;min-height:42px;border:1px solid #d1d5db;border-radius:10px;padding:0 10px}
.ft2{display:flex;gap:8px;flex-wrap:wrap}.ft2 .sec{flex:1;min-width:90px;padding:8px 10px;min-height:38px;font-size:14px}
.banner{position:fixed;left:10px;right:10px;top:calc(10px + env(safe-area-inset-top));display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:#111;color:#fff;padding:12px 14px;border-radius:14px;box-shadow:0 6px 20px rgba(0,0,0,.35);font-size:14px}
.banner .bb{display:flex;gap:8px}.banner .sec{background:#333;color:#fff;border-color:#555;min-height:38px;padding:6px 12px}.banner .pri{background:#2563eb;border-color:#2563eb;min-height:38px;padding:6px 12px}
`;
const host = h('div', { id: 'listlens-host' });
host.style.cssText = 'all:initial;position:fixed;left:0;top:0;z-index:2147483647';
const shadow = host.attachShadow({ mode: 'open' });
shadow.append(h('style', {}, CSS_TEXT));
const ui = h('div');
shadow.append(ui);

const fab = () => h('button', { class: 'fab', 'aria-label': 'ListLens', onclick: () => { S.open = true; render(); } }, '⚡');
const banner = (text, ...btns) => h('div', { class: 'banner' }, h('span', {}, text), h('div', { class: 'bb' }, ...btns));
function updateCount() { if (S.countEl) S.countEl.textContent = S.shown + ' / ' + S.rows.length; }

function toolsBody() {
  const b = h('div', { class: 'body' });
  const dirBtn = h('button', { class: 'dir', onclick: e => { if (!S.sort) return; S.sort.dir *= -1; e.currentTarget.textContent = S.sort.dir > 0 ? '▲' : '▼'; apply(); } }, S.sort && S.sort.dir < 0 ? '▼' : '▲');
  const sel = h('select', { onchange: e => { S.sort = e.target.value ? { key: e.target.value, dir: S.sort ? S.sort.dir : 1 } : null; apply(); } },
    h('option', { value: '' }, 'Ordine originale'),
    S.fields.map(f => h('option', { value: f.key, selected: !!(S.sort && S.sort.key === f.key) }, 'Ordina per ' + f.name)));
  b.append(h('div', { class: 'row' }, sel, dirBtn));
  S.fields.forEach(f => {
    const st = S.filters[f.key] || (S.filters[f.key] = {});
    const sample = S.rows[0] ? S.rows[0].v[f.key] : '';
    const card = h('div', { class: 'card' }, h('div', { class: 'ft' }, h('b', {}, f.name), h('span', { class: 'ex' }, sample)));
    if (f.type === 'cat') {
      const cnt = {};
      S.rows.forEach(r => { const v = r.v[f.key]; if (v) cnt[v] = (cnt[v] || 0) + 1; });
      const chips = h('div', { class: 'chips' });
      Object.entries(cnt).sort((a, c) => c[1] - a[1] || a[0].localeCompare(c[0], 'it')).forEach(([v, n]) =>
        chips.append(h('button', { class: 'chip' + (st.sel && st.sel.has(v) ? ' on' : ''), onclick: e => {
          st.sel = st.sel || new Set();
          st.sel.has(v) ? st.sel.delete(v) : st.sel.add(v);
          e.currentTarget.classList.toggle('on'); apply();
        } }, v + ' · ' + n)));
      card.append(chips);
    } else if (f.type === 'num') {
      const vals = S.rows.map(r => r.n[f.key]).filter(x => !isNaN(x));
      const lo = Math.min(...vals), hi = Math.max(...vals);
      const inp = (key, ph) => h('input', { type: 'number', inputmode: 'decimal', placeholder: ph, value: st[key] != null ? st[key] : '',
        oninput: e => { st[key] = e.target.value === '' ? null : parseFloat(e.target.value); apply(); } });
      card.append(h('div', { class: 'mm' }, inp('min', 'da ' + lo.toLocaleString('it-IT')), inp('max', 'a ' + hi.toLocaleString('it-IT'))));
    } else {
      card.append(h('input', { class: 'q', type: 'search', placeholder: 'Cerca in ' + f.name.toLowerCase(), value: st.q || '',
        oninput: e => { st.q = e.target.value; apply(); } }));
    }
    b.append(card);
  });
  b.append(h('div', { class: 'ft2' },
    h('button', { class: 'sec', onclick: () => { S.filters = {}; S.sort = null; apply(); render(); } }, 'Azzera'),
    h('button', { class: 'sec', onclick: startPick }, 'Cambia lista'),
    h('button', { class: 'sec', onclick: forget }, 'Dimentica')));
  return b;
}
function render() {
  ui.textContent = ''; S.countEl = null;
  if (S.mode === 'pick') {
    ui.append(banner(S.msg || 'Tocca un elemento della lista (es. un annuncio)', h('button', { class: 'sec', onclick: cancelPick }, 'Annulla')));
    return;
  }
  if (S.mode === 'confirm') {
    const ok = S.fields.length > 0;
    ui.append(banner(ok ? `Trovati ${S.count} elementi, ${S.fields.length} campi` : `Trovati ${S.count} elementi, ma nessun campo leggibile`,
      h('div', { class: 'bb' }, h('button', { class: 'sec', onclick: startPick }, 'Riprova'), ok && h('button', { class: 'pri', onclick: confirmList }, 'Conferma'))));
    return;
  }
  if (!S.open) { ui.append(fab()); return; }
  const tools = S.mode === 'tools';
  if (tools) S.countEl = h('span', { class: 'count' });
  ui.append(h('div', { class: 'sheet' },
    h('div', { class: 'hd' }, h('b', {}, '⚡ ListLens'), S.countEl, h('button', { class: 'x', 'aria-label': 'Chiudi', onclick: () => { S.open = false; render(); } }, '✕')),
    tools ? toolsBody() : h('div', { class: 'body' },
      h('p', {}, 'Filtra e riordina le liste di questa pagina, solo per te. Tocca il pulsante e poi un elemento della lista.'),
      h('button', { class: 'pri', onclick: startPick }, 'Scegli la lista'))));
  if (tools) updateCount();
}

/* ---------- avvio ---------- */
/* In modalità automatica (estensione, userscript) il flag __LISTLENS_AUTO è true:
   senza una configurazione salvata per questa pagina non si fa nulla e non compare alcuna interfaccia. */
const AUTO = window.__LISTLENS_AUTO === true;
const saved = store.load();
const hasSaved = !!(saved && saved.itemSel);
if (hasSaved) {
  S.itemSel = saved.itemSel;
  S.fields = (saved.fields || []).map(prep);
  S.sort = saved.sort || null;
  Object.entries(saved.filters || {}).forEach(([k, s]) => { S.filters[k] = { ...s, sel: s.sel ? new Set(s.sel) : undefined }; });
}
const ready = () => hasSaved && queryItems().length >= 2;
const api = {
  toggle() { if (S.mode === 'pick' || S.mode === 'confirm') return; S.open = !S.open; render(); },
  S, apply, parseNum, detectFrom, startFrom: pick, confirm: confirmList
};
function launch() {
  if (window.__listLens && window.__listLens !== api) return;
  window.__listLens = api;
  document.documentElement.append(host);
  if (ready()) { S.mode = 'tools'; rebuild(); apply(); }
  S.open = !AUTO;
  render();
}
if (!AUTO) launch();
else if (hasSaved) {
  if (ready()) launch();
  else {
    /* la lista può comparire dopo il caricamento: riprova per circa 10 secondi */
    let tries = 0;
    const iv = setInterval(() => {
      if (ready()) { clearInterval(iv); launch(); }
      else if (++tries >= 20) clearInterval(iv);
    }, 500);
  }
}
})();
