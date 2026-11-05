# Contributing

🇮🇹 Italiano più sotto.

Thanks for helping! Bug reports are the most useful contribution: ListLens runs on sites it has never seen, and every site builds its lists a little differently.

## Reporting a bug

Open an [issue](https://github.com/andrea6687/ListLens/issues/new/choose) with the bug template and include:

- the page where it happens (the address, if it's public);
- your device and browser (e.g. iPhone 15, Safari; Windows 11, Chrome 131);
- how you started ListLens (bookmarklet or extension);
- which item you tapped, what you expected and what happened;
- a screenshot, if you can.

Before posting, remove anything private from addresses and screenshots.

## Suggesting an idea

Open an issue with the idea template and explain the problem you want to solve, not only the solution.

## Sending code

1. Open an issue first for anything bigger than a small fix, so we can agree on the approach.
2. Edit `src/listlens.js` only, then run `npm run build`: it copies the code into `extension/` and regenerates `bookmarklet.txt` and `index.html`. The tests fail if these copies are out of date.
3. Add or update a test in `test/test.mjs` for every behavior you change, and run `npm test`.
4. Try it on a real browser too (the demo page `demo/demo.html` is a good start) and say in the pull request what you tested.
5. ListLens must stay private: no network requests, no tracking, nothing that leaves the device.
6. Interface text is in Italian for now. Keep it short and plain.
7. Update both READMEs (`README.md` and `README.it.md`) if the behavior changes.

## Scope

In scope: filtering, sorting and reading lists on any site, for the person using it.
Out of scope: scraping, bulk downloading of data, automating actions on sites, or getting around sites' protections.

---

## Italiano

Grazie per l'aiuto! Le segnalazioni di problemi sono il contributo più utile: ListLens gira su siti che non ha mai visto, e ognuno costruisce le sue liste in modo diverso.

- **Problema:** apri una [issue](https://github.com/andrea6687/ListLens/issues/new/choose) con il modello "bug" indicando la pagina (se è pubblica), dispositivo e browser, se usi la bookmarklet o l'estensione, cosa hai toccato, cosa ti aspettavi e cosa è successo. Togli eventuali dati privati.
- **Idea:** apri una issue con il modello "idea" e spiega il problema da risolvere.
- **Codice:** per modifiche non piccole apri prima una issue. Modifica solo `src/listlens.js` e poi esegui `npm run build`. Aggiungi un test per ogni comportamento che cambi ed esegui `npm test`. Prova anche su un browser vero. Niente richieste di rete né tracciamento. Aggiorna entrambi i README se cambia il comportamento.
- **Fuori tema:** scraping, download di dati in massa, automazione di azioni sui siti, aggirare le protezioni dei siti.
