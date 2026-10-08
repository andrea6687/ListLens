import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { minify } from 'terser';

/* Genera tutto ciò che si distribuisce, in dist/:
   - listlens-extension.zip   Chrome, Edge e altri Chromium
   - listlens-firefox.xpi     Firefox (stesso contenuto)
   - bookmarklet.txt          codice da incollare in un segnalibro
   - index.html               pagina di installazione con la bookmarklet e una lista di prova
   Allinea inoltre extension/listlens.js a src/listlens.js. */

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

const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const page = read('docs/index.template.html')
  .split('__BOOKMARKLET__').join(escHtml(bookmarklet))
  .split('__SRC__').join(min);
fs.writeFileSync(root + 'dist/index.html', page);

const kb = n => (fs.statSync(root + 'dist/' + n).size / 1024).toFixed(1) + ' KB';
for (const n of fs.readdirSync(root + 'dist').sort()) console.log(n.padEnd(26), kb(n));
