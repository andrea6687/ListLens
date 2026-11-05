# Security Policy

🇮🇹 Italiano più sotto.

## Reporting a vulnerability

Please **don't open a public issue** for security problems.

Use GitHub's private reporting instead: go to the [Security tab](https://github.com/andrea6687/ListLens/security) and choose **Report a vulnerability**. You'll get an answer as soon as possible, usually within a week.

Examples of what to report:

- a way for a website to run its own code through ListLens, for example through the text or image addresses ListLens reads from the page;
- a way for ListLens to send data anywhere, or to expose what you saved for one site to another site;
- an extension permission that allows more than what is described in [docs/INSTALL.md](docs/INSTALL.md).

## Supported versions

Only the latest version on the `main` branch is supported. The bookmarklet on the install page and in `bookmarklet.txt` is always built from it.

## What ListLens does and doesn't do

- It makes no network requests and has no server.
- It saves filters and sorting in the page's local storage, on your device only.
- The bookmarklet runs only when you tap it. The extension's automatic mode does nothing on pages where you haven't saved anything.
- You can read the full code in `src/listlens.js` before installing it. `bookmarklet.txt` is the same code, minified.

---

## Italiano

Per i problemi di sicurezza **non aprire una issue pubblica**: usa la [scheda Security](https://github.com/andrea6687/ListLens/security) → **Report a vulnerability**, che è privata.

È supportata solo l'ultima versione su `main`. ListLens non fa richieste di rete, non ha un server e salva filtri e ordine solo sul tuo dispositivo. La bookmarklet parte solo quando la tocchi; l'estensione non fa nulla sulle pagine dove non hai salvato niente. Il codice completo è in `src/listlens.js`: puoi leggerlo prima di installarlo.
