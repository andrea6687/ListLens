# Installare ListLens

ListLens si usa in due modi. Scegli quello che ti serve, i passi sono qui sotto.

- **Bookmarklet.** Un segnalibro del browser che contiene tutto il programma. Non installa nulla, funziona su telefono, tablet e computer. Lo avvii a mano ogni volta che vuoi usarlo.
- **Estensione.** Un'icona nella barra del browser. Oltre ad avviare ListLens, riapplica da sola i filtri e l'ordine che hai già scelto quando riapri una pagina.

## Quale scegliere

| Dispositivo e browser | Cosa usare |
|---|---|
| iPhone o iPad, Safari | Bookmarklet |
| Android, Chrome | Bookmarklet |
| Android, Firefox | Bookmarklet. L'estensione solo dopo la pubblicazione su addons.mozilla.org |
| Windows, Linux, macOS, Chrome o Edge | Estensione |
| Windows, Linux, macOS, Firefox | Estensione (installazione temporanea) o bookmarklet |
| macOS, Safari | Bookmarklet. L'estensione richiede Xcode |

## Prima di iniziare

**Solo segnalibro, per esempio dal telefono:** non serve compilare niente. Il codice pronto è sulla [pagina di installazione](https://andrea6687.github.io/ListLens/) e nel file `bookmarklet.txt` nella radice del repository, sempre allineati all'ultima versione. Passa direttamente a [Portare il codice sul telefono](#portare-il-codice-sul-telefono).

**Estensione:** usa la cartella `extension/` del repository così com'è (vedi [Chrome ed Edge](#chrome-ed-edge-windows-linux-macos)). Gli archivi `.zip` e `.xpi` si generano dal repository; serve Node.js.

```
npm install
npm run build
```

Nella cartella `dist/` trovi:

| File | A cosa serve |
|---|---|
| `bookmarklet.txt` | Il codice del segnalibro: un unico testo che inizia con `javascript:` |
| `index.html` | Una pagina con il pulsante "Copia bookmarklet", le istruzioni e una lista di prova |
| `listlens-extension.zip` | L'estensione per Chrome, Edge e altri browser basati su Chromium |
| `listlens-firefox.xpi` | La stessa estensione per Firefox |

### Portare il codice sul telefono

Il codice è un'unica riga molto lunga che inizia con `javascript:`. Va copiato per intero: se ne manca anche un pezzo, il segnalibro non parte. Hai tre modi, dal più semplice:

1. **Dalla pagina di installazione.** Sul telefono apri https://andrea6687.github.io/ListLens/ e tocca **Copia bookmarklet**. Nella stessa pagina c'è una lista di prova per controllare che funzioni.
2. **Da GitHub.** Apri il file `bookmarklet.txt` del repository su github.com (o nell'app GitHub) e tocca il pulsante **Copia** (Copy raw file), l'icona con due quadratini sopra il testo. Se non lo vedi, tocca **Raw**, poi tieni premuto sul testo, scegli **Seleziona tutto** e **Copia**.
3. **Mandandolo a te stesso.** Dal computer invia `bookmarklet.txt` per email, messaggio o AirDrop. Sul telefono aprilo, tieni premuto sul testo, **Seleziona tutto**, **Copia**.

Poi segui i passi per il tuo telefono qui sotto. Quando ListLens viene aggiornato, ricopia il codice e sostituisci l'indirizzo del segnalibro: filtri e ordine salvati non si perdono.

---

## Bookmarklet

Il procedimento è lo stesso ovunque: crei un segnalibro qualsiasi, poi ne sostituisci l'indirizzo con il codice di ListLens. Prima copia il codice come descritto sopra.

### iPhone e iPad (Safari)

1. Apri un sito qualsiasi. Tocca Condividi, poi **Aggiungi segnalibro** (o Aggiungi ai Preferiti) e salva.
2. Tocca il pulsante dei Preferiti (l'icona del libro), poi **Modifica**, poi il segnalibro appena creato.
3. Cambia il titolo in `ListLens`. Nel campo dell'indirizzo cancella tutto e incolla il codice. Tocca **Fine**.

Per usarlo: apri il sito con la lista, tocca l'icona dei Preferiti e poi **ListLens**.

In alternativa, sul sito con la lista scrivi `ListLens` nella barra dell'indirizzo e tocca il segnalibro tra i suggerimenti. Con la bookmarklet i filtri non si riapplicano da soli quando riapri il sito: tocca di nuovo **ListLens** e tornano subito.

### Android con Firefox

1. Apri un sito qualsiasi e salvalo nei segnalibri dal menu.
2. Apri i segnalibri, tieni premuto sul nuovo segnalibro e scegli **Modifica**.
3. Chiamalo `ListLens` e sostituisci l'indirizzo incollando il codice. Salva.

Per usarlo: apri il sito con la lista, poi i segnalibri, e tocca **ListLens**.

### Android con Chrome

1. Salva un sito qualsiasi nei segnalibri dal menu.
2. Apri i segnalibri, tocca i tre puntini accanto al nuovo segnalibro e scegli **Modifica**.
3. Chiamalo `ListLens` e sostituisci l'indirizzo incollando il codice. Salva.

Su Chrome il segnalibro non parte se lo tocchi dall'elenco. Per usarlo, sul sito con la lista scrivi `ListLens` nella barra dell'indirizzo e scegli il suggerimento con la stellina.

### Computer (Chrome, Edge, Firefox, Safari)

1. Mostra la barra dei preferiti. Su Chrome ed Edge: Ctrl+Maiusc+B (Cmd+Maiusc+B su Mac).
2. Aggiungi un nuovo segnalibro alla barra, scegliendo di crearlo a mano o di modificarne uno esistente.
3. Nome `ListLens`, indirizzo il codice incollato.

Per usarlo: apri il sito con la lista e fai clic sul segnalibro.

---

## Estensione

### Chrome ed Edge (Windows, Linux, macOS)

1. Usa la cartella `extension/` del repository, oppure decomprimi `listlens-extension.zip` in una cartella.
2. Apri `chrome://extensions` (su Edge `edge://extensions`) e attiva **Modalità sviluppatore**.
3. Scegli **Carica estensione non pacchettizzata** e seleziona la cartella.
4. Fissa l'icona di ListLens nella barra degli strumenti, dal menu a forma di puzzle.

L'estensione resta installata finché non la rimuovi. Per distribuirla ad altre persone va pubblicata su Chrome Web Store (quota una tantum) o su Edge Add-ons.

### Firefox (Windows, Linux, macOS)

1. Apri `about:debugging` e scegli **Questo Firefox**.
2. Premi **Carica componente aggiuntivo temporaneo** e seleziona il file `manifest.json` dentro `extension/`.

Così l'estensione funziona fino alla chiusura di Firefox. Per averla in modo permanente va firmata: si carica su addons.mozilla.org come "non in elenco" (gratuito) e poi si installa il file firmato.

Se i filtri non si riapplicano da soli, controlla nei permessi dell'estensione che l'accesso ai dati dei siti sia consentito.

### Firefox su Android

L'estensione funziona, ma Firefox per Android installa solo componenti pubblicati su addons.mozilla.org. Finché non è pubblicata, usa la bookmarklet.

### Safari su iPhone, iPad e Mac

Safari vuole l'estensione dentro un'app, quindi serve un Mac con Xcode.

1. Dalla cartella del repository esegui:
   ```
   xcrun safari-web-extension-converter extension --app-name ListLens --bundle-identifier it.tuonome.listlens
   ```
2. Apri il progetto creato in Xcode, scegli la destinazione (Mac, iPhone o iPad) ed esegui.
3. Sul dispositivo abilita l'estensione: su iPhone e iPad da Impostazioni, Safari, Estensioni, e consenti l'accesso ai siti.

Con un Apple ID gratuito puoi installarla sui tuoi dispositivi da Xcode, ma il profilo scade dopo un periodo breve e va rifatto. Per averla stabile o distribuirla servono l'Apple Developer Program (a pagamento) e TestFlight o l'App Store. In alternativa gratuita su iPhone e iPad resta la bookmarklet.

---

## Controllare che funzioni

1. Apri la [pagina di installazione](https://andrea6687.github.io/ListLens/) (sezione "Provala qui") oppure `demo/demo.html`: è una lista di annunci di auto senza filtri.
2. Avvia ListLens (segnalibro o icona). In basso compare il pannello **⚡ ListLens** con il pulsante **Scegli la lista**.
3. Toccalo, poi tocca un'auto qualsiasi. ListLens evidenzia gli annunci simili e indica quanti elementi e campi ha trovato.
4. Conferma. Dovresti vedere i filtri per regione, prezzo, anno e km, e un menu per ordinare.

## Uso di ogni giorno

1. Apri il sito con la lista e avvia ListLens.
2. Se hai già configurato quella pagina, ritrovi filtri e ordine. Con l'estensione si riapplicano da soli; con la bookmarklet basta toccarla di nuovo.
3. Se è la prima volta: **Scegli la lista**, tocca un elemento, **Conferma**, poi usa i filtri.
4. Per cambiare lista usa **Cambia lista**. Per cancellare ciò che ListLens ricorda di quella pagina usa **Dimentica**.

## Se qualcosa non va

| Problema | Cosa fare |
|---|---|
| Il segnalibro non fa nulla | Controlla che l'indirizzo cominci con `javascript:` e che il codice sia stato incollato per intero. Su Chrome per Android avvialo dalla barra dell'indirizzo. Alcuni siti molto protetti bloccano le bookmarklet: prova con l'estensione. |
| Su iPhone il segnalibro apre una ricerca o una pagina vuota | Nel campo dell'indirizzo c'era ancora l'indirizzo vecchio, oppure il codice non è stato incollato tutto. Modifica il segnalibro, cancella tutto il campo e incolla di nuovo. |
| "Non vedo una lista qui" | Tocca un elemento della lista, non lo sfondo o il titolo della pagina. |
| ListLens evidenzia gli elementi sbagliati | Tocca **Riprova** e scegli un altro punto dentro un elemento della lista. |
| L'estensione dice che non può partire | Le pagine interne del browser e gli store delle estensioni non permettono l'esecuzione. Apri un sito normale. |
| L'ordine sparisce da solo | Alcuni siti ridisegnano la lista dopo il caricamento e annullano l'ordinamento. Riavvia ListLens. |
| Con l'estensione i filtri non tornano da soli | La riapplicazione aspetta la lista per circa 10 secondi. Se la pagina è più lenta, tocca l'icona. Su Firefox controlla i permessi dell'estensione. |

## Permessi e privacy

- L'estensione chiede `activeTab` e `scripting` per avviarsi sulla scheda dove tocchi l'icona, e l'accesso ai siti `http` e `https` solo per la riapplicazione automatica. Se per una pagina non hai salvato nulla, lo script termina subito e non la modifica.
- Il codice non fa richieste di rete. Filtri e ordine sono salvati nella memoria locale della pagina, sul tuo dispositivo.

## Per chi sviluppa

Il sorgente è `src/listlens.js`. Dopo ogni modifica esegui `npm run build`: copia il file in `extension/`, aggiorna `bookmarklet.txt` e la pagina `index.html` nella radice (quella pubblicata su GitHub Pages) e rigenera gli archivi in `dist/`. `npm test` controlla il comportamento in jsdom e verifica anche che tutte le copie siano allineate. Il modello della pagina è `docs/index.template.html`.
