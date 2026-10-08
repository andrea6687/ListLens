import { JSDOM } from 'jsdom';
import fs from 'fs';

const root = new URL('..', import.meta.url).pathname;
const html = fs.readFileSync(root + 'demo/demo.html', 'utf8');
const src = fs.readFileSync(root + 'src/listlens.js', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'https://demo.test/auto', pretendToBeVisual: true });
const w = dom.window;
const d = w.document;
let fails = 0;
const check = (name, cond, extra = '') => { console.log((cond ? 'OK   ' : 'FAIL ') + name + (extra ? '  -> ' + extra : '')); if (!cond) fails++; };

check('extension/listlens.js allineato a src/listlens.js (esegui npm run build se fallisce)',
  fs.readFileSync(root + 'extension/listlens.js', 'utf8') === src);

w.eval(src);
const L = w.__listLens;
check('script caricato', !!L);

L.startFrom(d.querySelector('li.car h3'));
check('modalita confirm', L.S.mode === 'confirm', L.S.mode);
check('selettore trovato', !!L.S.itemSel, L.S.itemSel);
check('14 elementi (annuncio escluso)', L.S.count === 14, String(L.S.count));
console.log('campi:', L.S.fields.map(f => `${f.name}:${f.type}`).join(', '));
const byName = n => L.S.fields.find(f => f.name === n);
check('campo Prezzo numerico', byName('Prezzo') && byName('Prezzo').type === 'num');
check('campo Regione categorico', byName('Regione') && byName('Regione').type === 'cat');
check('campo Anno numerico', byName('Anno') && byName('Anno').type === 'num');
check('campo Km numerico', byName('Km') && byName('Km').type === 'num');

L.confirm();
check('modalita tools', L.S.mode === 'tools');
check('14 righe', L.S.rows.length === 14, String(L.S.rows.length));
check('parseNum italiano', L.parseNum('€ 12.500') === 12500 && L.parseNum('85.000 km') === 85000 && L.parseNum('1.234,56') === 1234.56);

const vis = () => [...d.querySelectorAll('li.car')].filter(e => e.style.display !== 'none');
const titles = () => vis().map(e => e.querySelector('h3').textContent);

// filtro regione
const reg = byName('Regione');
L.S.filters[reg.key] = { sel: new Set(['Lazio']) };
L.apply();
check('filtro Lazio -> 4 auto', vis().length === 4, String(vis().length));
check('annuncio non toccato', d.querySelector('li.ad').style.display !== 'none');

// ordinamento prezzo crescente
const pr = byName('Prezzo');
L.S.sort = { key: pr.key, dir: 1 };
L.apply();
const prices = vis().map(e => L.parseNum(e.querySelector('.price').textContent));
check('ordinato per prezzo crescente', prices.every((p, i) => i === 0 || prices[i - 1] <= p), prices.join(','));

// filtro numerico max prezzo
L.S.filters[pr.key] = { max: 12000 };
L.apply();
const p2 = vis().map(e => L.parseNum(e.querySelector('.price').textContent));
check('prezzo <= 12000 nel Lazio', p2.length === 2 && p2.every(p => p <= 12000), p2.join(','));
check('campo titolo riconosciuto', !!byName('Titolo'));

// azzera
L.S.filters = {}; L.S.sort = null; L.apply();
check('azzera -> 14 visibili', vis().length === 14);
check('ordine originale ripristinato', titles()[0] === 'Fiat Panda 1.2 Easy' && titles()[13] === 'Alfa Romeo Giulietta', titles().join(' | '));

// ordinamento decrescente anno
const an = byName('Anno');
L.S.sort = { key: an.key, dir: -1 };
L.apply();
const years = vis().map(e => parseInt(e.querySelector('.meta span:nth-child(2)').textContent.replace(/\D/g, '')));
check('ordinato per anno decrescente', years.every((y, i) => i === 0 || years[i - 1] >= y), years.join(','));

// nuovi elementi (infinite scroll)
L.S.filters[reg.key] = { sel: new Set(['Lazio']) };
L.apply();
d.getElementById('more').click();
await new Promise(r => setTimeout(r, 500));
check('nuovi elementi rilevati (18 righe)', L.S.rows.length === 18, String(L.S.rows.length));
const lazioNow = vis().map(e => e.querySelector('.region').textContent);
check('filtro riapplicato ai nuovi (5 Lazio: +Dacia)', lazioNow.length === 5 && lazioNow.every(x => x.includes('Lazio')), String(lazioNow.length));

// persistenza
const saved = w.localStorage.getItem('listlens:demo.test/auto');
check('configurazione salvata', !!saved && JSON.parse(saved).itemSel === L.S.itemSel);

/* ---------- modalità automatica (estensione) ---------- */
const URL_ = 'https://demo.test/auto';
const KEY = 'listlens:demo.test/auto';
const mk = (opts = {}) => new JSDOM(opts.html || html, { runScripts: opts.runScripts || 'dangerously', url: URL_, pretendToBeVisual: true });
const wait = ms => new Promise(r => setTimeout(r, ms));

// A: configurazione salvata -> riapplicata da sola, FAB chiuso
const w2 = mk().window;
w2.localStorage.setItem(KEY, saved);
w2.__LISTLENS_AUTO = true;
w2.eval(src);
const d2 = w2.document;
const vis2 = [...d2.querySelectorAll('li.car')].filter(e => e.style.display !== 'none');
check('AUTO: __listLens creato', !!w2.__listLens);
check('AUTO: interfaccia presente', !!d2.getElementById('listlens-host'));
check('AUTO: filtro Lazio riapplicato (4 visibili)', vis2.length === 4, String(vis2.length));
const y2 = vis2.map(e => parseInt(e.querySelector('.meta span:nth-child(2)').textContent.replace(/\D/g, '')));
check('AUTO: ordine per anno decrescente riapplicato', y2.every((y, i) => i === 0 || y2[i - 1] >= y), y2.join(','));
check('AUTO: pannello chiuso (solo pulsante)', w2.__listLens.S.open === false);

// B: nessuna configurazione -> nessuna UI e nessuna traccia
const w3 = mk().window;
w3.__LISTLENS_AUTO = true;
w3.eval(src);
check('AUTO senza config: nessun host', !w3.document.getElementById('listlens-host'));
check('AUTO senza config: __listLens assente', w3.__listLens === undefined);
// ...e un avvio manuale dopo (popup) funziona
w3.__LISTLENS_AUTO = false;
w3.eval(src);
check('avvio manuale dopo AUTO vuoto: UI presente e aperta', !!w3.document.getElementById('listlens-host') && w3.__listLens.S.open === true);

// C: lista che compare in ritardo
const demoScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const w4 = mk({ runScripts: 'outside-only' }).window;
w4.localStorage.setItem(KEY, saved);
w4.__LISTLENS_AUTO = true;
w4.eval(src);
check('AUTO in attesa: ancora nessuna UI', !w4.document.getElementById('listlens-host'));
await wait(700);
w4.eval(demoScript);
await wait(1200);
const vis4 = [...w4.document.querySelectorAll('li.car')].filter(e => e.style.display !== 'none');
check('AUTO: lista comparsa in ritardo gestita', !!w4.document.getElementById('listlens-host') && vis4.length === 4, String(vis4.length));

// D: doppio avvio non duplica l'interfaccia
w2.__LISTLENS_AUTO = false;
w2.eval(src);
check('secondo avvio: un solo host (alterna il pannello)', w2.document.querySelectorAll('#listlens-host').length === 1 && w2.__listLens.S.open === true);

console.log(fails ? `\n${fails} test falliti` : '\nTutti i test passati');
process.exit(fails ? 1 : 0);
