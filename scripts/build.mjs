import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { minify } from 'terser';

/* Genera tutto ciò che si distribuisce, in dist/:
   - listlens-extension.zip   Chrome, Edge e altri Chromium
   - listlens-firefox.xpi     Firefox (stesso contenuto)
   - bookmarklet.txt          codice da incollare in un segnalibro
   - index.html               pagina di installazione con la bookmarklet e una lista di prova
   Allinea inoltre extension/listlens.js a src/listlens.js e aggiorna nella radice del repository
   bookmarklet.txt (da cui si copia il codice dal telefono senza eseguire la build) e index.html
   (la pagina di installazione pubblicata su GitHub Pages). */

const root = new URL('..', import.meta.url).pathname;
const read = p => fs.readFileSync(root + p, 'utf8');

const src = read('src/listlens.js');
fs.copyFileSync(root + 'src/listlens.js', root + 'extension/listlens.js');
fs.rmSync(root + 'dist', { recursive: true, force: true });
fs.mkdirSync(root + 'dist');

for (const name of ['listlens-extension.zip', 'listlens-firefox.xpi']) {
  execFileSync('zip', ['-r', '-q', root + 'dist/' + name, '.'], { cwd: root + 'extension' });
}

const min = (await minify(src, { compress: true, mangle: true })).code;
if (/<\/script/i.test(min)) throw new Error('Il codice minificato contiene </script');
const bookmarklet = 'javascript:' + encodeURIComponent(min);
fs.writeFileSync(root + 'dist/bookmarklet.txt', bookmarklet);
fs.writeFileSync(root + 'bookmarklet.txt', bookmarklet);

const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/* Intestazione della pagina pubblicata su GitHub Pages: documento completo e anteprima per i link condivisi */
const SITE = 'https://andrea6687.github.io/ListLens/';
const DESC = 'Filtri e ordinamento su qualsiasi lista di qualsiasi sito, anche quando il sito non li offre. Su telefono e computer, senza account.';
const head = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${DESC}">
<meta property="og:title" content="ListLens">
<meta property="og:description" content="${DESC}">
<meta property="og:image" content="${SITE}assets/hero.png">
<meta property="og:url" content="${SITE}">
<meta name="twitter:card" content="summary_large_image">
`;
const page = head + read('docs/index.template.html')
  .split('__BOOKMARKLET__').join(escHtml(bookmarklet))
  .split('__SRC__').join(min);
fs.writeFileSync(root + 'dist/index.html', page);
/* copia nella radice del repository: è la pagina servita da GitHub Pages */
fs.writeFileSync(root + 'index.html', page);

const kb = n => (fs.statSync(root + 'dist/' + n).size / 1024).toFixed(1) + ' KB';
for (const n of fs.readdirSync(root + 'dist').sort()) console.log(n.padEnd(26), kb(n));
