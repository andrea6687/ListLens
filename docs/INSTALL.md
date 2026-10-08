# ListLens — estensione per browser

Filtra e riordina le liste di qualsiasi sito, solo per te. Tocchi un elemento della lista, ListLens riconosce la struttura e ti dà filtri e ordinamento sui campi (prezzo, anno, regione…).

Un solo codice (`listlens.js`) per tutte le piattaforme. L'estensione fa due cose:

- **Icona nella barra:** avvia ListLens sulla scheda aperta.
- **Riapplicazione automatica:** sulle pagine per cui hai già configurato filtri e ordine, li rimette da sola al caricamento. Dove non hai configurato nulla non compare niente.

Tutto resta sul tuo dispositivo: il codice non fa richieste di rete e la configurazione è salvata nella memoria locale della pagina.

## Cosa si genera

Dalla radice del repository, `npm install` e poi `npm run build` creano la cartella `dist/`:

| File | A cosa serve |
|---|---|
| `dist/listlens-extension.zip` | Chrome, Edge e altri browser basati su Chromium (Windows, Linux, macOS) |
| `dist/listlens-firefox.xpi` | Stesso contenuto per Firefox (desktop e Android) |
| `dist/bookmarklet.txt` | Codice da incollare in un segnalibro (iPhone, iPad, Android, qualsiasi browser) |
| `dist/index.html` | Pagina di installazione con la bookmarklet e una lista di prova |
| `extension/` | Cartella sorgente dell'estensione, caricabile direttamente e usata per la conversione Safari |

## Installazione per piattaforma

### Windows, Linux, macOS — Chrome / Edge
1. Usa la cartella `extension/` del repository, oppure decomprimi `dist/listlens-extension.zip`.
2. Apri `chrome://extensions` (o `edge://extensions`) e attiva **Modalità sviluppatore**.
3. Scegli **Carica estensione non pacchettizzata** e seleziona la cartella.
4. Fissa l'icona di ListLens nella barra degli strumenti.

Così resta installata finché non la rimuovi. Per distribuirla ad altri conviene pubblicarla su Chrome Web Store (quota una tantum) o su Edge Add-ons.

### Windows, Linux, macOS — Firefox
- **Prova:** `about:debugging` → Questo Firefox → **Carica componente aggiuntivo temporaneo** → seleziona `manifest.json` nella cartella `extension/`. Si rimuove al riavvio.
- **Permanente:** va firmata. Si carica su addons.mozilla.org come "non in elenco" (gratuito) e si installa il file firmato.
- Se la riapplicazione automatica non parte, controlla nei permessi dell'estensione che l'accesso ai dati dei siti sia consentito.

### Android
- **Firefox:** l'estensione funziona, ma Firefox Android installa solo componenti pubblicati su addons.mozilla.org. Serve quindi la pubblicazione sopra.
- **Chrome:** non supporta le estensioni. Usa la bookmarklet (pagina di installazione di ListLens).

### iPhone, iPadOS, macOS — Safari
Safari richiede di incapsulare l'estensione in un'app. Serve un Mac con Xcode:

```
xcrun safari-web-extension-converter extension --app-name ListLens --bundle-identifier it.tuonome.listlens
```

Poi in Xcode scegli la destinazione (Mac, iPhone, iPad) ed esegui. Sul dispositivo: Impostazioni → Safari → Estensioni → ListLens, e consenti l'accesso ai siti.

- Con un Apple ID gratuito puoi installarla sui tuoi dispositivi da Xcode, ma il profilo scade dopo un periodo breve e va rifatto.
- Per averla stabile o distribuirla servono l'Apple Developer Program (a pagamento) e TestFlight o App Store.
- In alternativa gratuita su iPhone/iPad: la bookmarklet.

## Permessi richiesti
- `activeTab` e `scripting`: per avviare ListLens sulla scheda dove tocchi l'icona.
- Accesso ai siti `http`/`https`: serve solo alla riapplicazione automatica. Senza configurazione salvata lo script termina subito e non modifica la pagina.

## Limiti noti
- Se un sito ridisegna la lista da solo (app React e simili), può annullare l'ordinamento. I nuovi elementi caricati scorrendo vengono invece rilevati.
- La riapplicazione automatica attende la lista per circa 10 secondi; oltre, tocca l'icona.
- Funziona con liste dentro un unico contenitore. Pagine con più sezioni separate vanno scelte una alla volta.
- Le pagine interne del browser e gli store delle estensioni non permettono l'esecuzione.

## Aggiornare il pacchetto
Il sorgente è `src/listlens.js`. Dopo ogni modifica esegui `npm run build`: copia il file in `extension/` e rigenera gli archivi. `npm test` controlla anche che le due copie siano allineate.
