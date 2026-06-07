/* Mini-Formular „Mapping ergänzen". Rendert ins Plugin-iframe-DOM und wird
   über logseq.showMainUI / hideMainUI ein-/ausgeblendet. */
(function () {
  const el = document.getElementById('gl-form');
  const abbrInput = document.getElementById('gl-abbr');
  const slugInput = document.getElementById('gl-slug');
  const anchorSel = document.getElementById('gl-anchor');
  const saveBtn = document.getElementById('gl-save');
  const cancelBtn = document.getElementById('gl-cancel');

  // Defensiv: fehlt ein Element, Formular deaktivieren statt den Plugin-Load
  // zu killen (ein Fehler hier würde logseq.ready() blockieren -> Handshake-Timeout).
  if (!el || !abbrInput || !slugInput || !anchorSel || !saveBtn || !cancelBtn) {
    window.GLForm = { open() { logseq.UI.showMsg('Formular nicht verfügbar.', 'warning'); } };
    return;
  }

  function close() {
    logseq.hideMainUI();
  }

  function open(abbr) {
    abbrInput.value = abbr || '';
    slugInput.value = '';
    anchorSel.value = 'p';
    logseq.showMainUI();
    setTimeout(() => slugInput.focus(), 50);
  }

  function save() {
    const abbr = abbrInput.value.trim();
    const slug = slugInput.value.trim().replace(/^\/+|\/+$/g, '');
    const anchor = anchorSel.value;
    if (!abbr || !slug) {
      logseq.UI.showMsg('Abkürzung und Slug sind erforderlich.', 'warning');
      return;
    }
    const userMappings = Object.assign({}, logseq.settings?.userMappings || {});
    userMappings[abbr] = { slug, anchor };
    logseq.updateSettings({ userMappings });
    logseq.UI.showMsg(`Zuordnung gespeichert: ${abbr} → /${slug}/`, 'success');
    close();
  }

  saveBtn.addEventListener('click', save);
  cancelBtn.addEventListener('click', close);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') save();
  });

  // Klick außerhalb der Karte schließt das Fenster.
  document.addEventListener('click', (e) => {
    if (e.target === document.body) close();
  });

  window.GLForm = { open };
})();
