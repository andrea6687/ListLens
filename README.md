# ListLens

Filtra e riordina le liste di qualsiasi sito, solo per te.

Molti siti mostrano un elenco (annunci, prodotti, offerte) senza filtri né ordinamento. Con ListLens tocchi un elemento della lista, lui riconosce la struttura, legge i campi (prezzo, anno, regione…) e ti dà subito filtri e ordinamento. Funziona sul sito reale, direttamente nella tua pagina, senza server e senza account. Le modifiche restano solo sul tuo dispositivo.

## Come funziona

1. Avvia ListLens sulla pagina (bookmarklet o icona dell'estensione) e tocca **Scegli la lista**.
2. Tocca un elemento qualsiasi della lista. ListLens evidenzia tutti gli elementi simili e ne estrae i campi.
3. Conferma. Per ogni campo ottieni il controllo adatto:
   - **valori ripetuti** (regione, carburante): chip da attivare, con il conteggio;
   - **numeri** (prezzo, anno, km): intervallo da/a. Legge i formati italiani come `€ 12.500` e `85.000 km`;
   - **testo libero**: ricerca;
   - **foto**: chip per mostrare solo gli annunci con una foto vera oppure solo quelli con l'immagine generica di una categoria (per esempio "foto non disponibile"), ognuna con la sua miniatura. È facoltativo e si combina con gli altri filtri.
   Un menu permette di ordinare per qualsiasi campo, crescente o decrescente.

I filtri e l'ordine vengono ricordati per pagina. Con l'estensione si riapplicano da soli al caricamento. Gli elementi che il sito aggiunge scorrendo vengono rilevati e filtrati.

## Installazione

Un solo codice (`src/listlens.js`) per tutte le piattaforme:

| Piattaforma | Come |
|---|---|
| Windows, Linux, macOS | Estensione per Chrome, Edge, Firefox (o bookmarklet) |
| Android | Firefox con l'estensione (pubblicata su AMO); su Chrome la bookmarklet |
| iPhone, iPadOS | Bookmarklet in Safari; estensione Safari tramite Xcode |
| macOS Safari | Estensione Safari tramite Xcode |

Istruzioni passo per passo, permessi e limiti: [docs/INSTALL.md](docs/INSTALL.md).

### Su telefono (iPhone, iPad, Android)

Sul telefono ListLens si usa come segnalibro del browser. Non serve installare niente né compilare: il codice pronto è nel file [`bookmarklet.txt`](bookmarklet.txt).

1. **Copia il codice.** Dal telefono apri [`bookmarklet.txt`](bookmarklet.txt) su GitHub, entrando con un account che vede il repository, e tocca il pulsante **Copia** (Copy raw file) sopra il testo. Il codice è un'unica riga lunga che inizia con `javascript:`: va copiata per intero.
2. **Crea il segnalibro.** Salva nei preferiti un sito qualsiasi, poi modifica quel preferito: titolo `ListLens`, e al posto dell'indirizzo incolla il codice.
   - **iPhone e iPad (Safari):** Condividi → Aggiungi segnalibro; poi icona dei Preferiti → Modifica → tocca il segnalibro.
   - **Android (Chrome o Firefox):** menu → aggiungi ai segnalibri; poi apri i segnalibri e scegli Modifica sul nuovo segnalibro.
3. **Usalo.** Sul sito con la lista apri i Preferiti e tocca **ListLens** (su Chrome per Android scrivi invece `ListLens` nella barra dell'indirizzo e tocca il suggerimento con la stellina). Poi **Scegli la lista** → tocca un elemento → **Conferma**.

Filtri e ordine restano salvati per quella pagina: la volta dopo basta toccare di nuovo il segnalibro. Quando ListLens viene aggiornato, ripeti i passi 1 e 2 con il codice nuovo. Dettagli e soluzioni ai problemi: [docs/INSTALL.md](docs/INSTALL.md#bookmarklet).

```
npm install
npm run build     # crea dist/: estensione (zip e xpi), bookmarklet e pagina di installazione
```

## Struttura

```
src/listlens.js          il codice: rilevamento lista, campi, filtri, ordinamento, interfaccia
extension/               estensione Manifest V3 (popup di avvio, content script automatico, icone)
demo/demo.html           pagina di prova con annunci di auto
docs/                    istruzioni di installazione e modello della pagina di installazione
scripts/build.mjs        genera dist/ e aggiorna bookmarklet.txt
bookmarklet.txt          il codice del segnalibro, pronto da copiare (generato dalla build)
test/test.mjs            test automatici in jsdom
```

## Test

```
npm test
```

Coprono rilevamento della lista, tipi di campo, formati numerici, filtri, ordinamento, nuovi elementi caricati dopo, salvataggio e la modalità automatica dell'estensione. Girano in jsdom, non in un browser reale: il primo caricamento su un browser vero resta da verificare a mano.

## Limiti noti

- Se un sito ridisegna la lista da solo (app React e simili) mantenendo gli stessi elementi, può annullare l'ordinamento. Gli elementi nuovi o sostituiti (scorrendo, cambiando pagina, con una nuova ricerca) vengono invece rilevati e filtrati.
- Funziona con liste dentro un unico contenitore. Pagine con più sezioni separate vanno scelte una alla volta.
- Alcuni siti con protezioni molto rigide possono bloccare l'avvio da bookmarklet.
- Le date non hanno ancora un controllo dedicato: si filtrano come testo.
- Il filtro foto legge solo le immagini vere e proprie (`<img>`), non quelle messe come sfondo con il CSS. Un'immagine è considerata generica quando compare identica in almeno due annunci, oppure quando il nome del file lo dice (`placeholder`, `no-image`, `nofoto`…). Le immagini generiche già riconosciute vengono ricordate, anche sulle pagine dove ne compare una sola.

## Idee per dopo

- Controllo per le date e per i valori con unità diverse.
- Più liste nella stessa pagina e scelta del campo da mostrare nell'elenco.
- Userscript per Tampermonkey e per l'app Userscripts su Safari, senza passare da Xcode.
- Esportare la vista filtrata.

## Licenza

[MIT](LICENSE)
