/* Il popup si apre quando tocchi l'icona dell'estensione: avvia ListLens sulla scheda attiva e si chiude. */
const api = globalThis.browser || globalThis.chrome;
const msg = document.getElementById('msg');

(async () => {
  try {
    const [tab] = await api.tabs.query({ active: true, currentWindow: true });
    if (!tab || tab.id == null) throw new Error('nessuna scheda');
    /* Annulla la modalità automatica per questa esecuzione, così compare l'interfaccia completa.
       Se ListLens è già attivo sulla pagina, lo script si limita ad aprire o chiudere il pannello. */
    await api.scripting.executeScript({ target: { tabId: tab.id }, func: () => { window.__LISTLENS_AUTO = false; } });
    await api.scripting.executeScript({ target: { tabId: tab.id }, files: ['listlens.js'] });
    window.close();
  } catch (e) {
    msg.textContent = 'ListLens non può partire su questa pagina. Le pagine interne del browser e gli store delle estensioni sono escluse.';
  }
})();
