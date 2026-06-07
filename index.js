/* gesetzeslinks – erkennt deutsche Gesetzesreferenzen und rendert sie als
   klickbare Links auf gesetze-im-internet.de.
   Lädt @logseq/libs (window.logseq), GLParser, GLGesetze, GLForm als globale Scripts. */

(function () {
const { rewrite, parseMacroArgs } = window.GLParser;
const { buildUrl } = window.GLGesetze;

const SETTINGS_SCHEMA = [
  {
    key: 'autoRewrite',
    type: 'boolean',
    default: true,
    title: 'Automatisch umschreiben',
    description:
      'Gesetzesreferenzen beim Tippen automatisch in Links umwandeln. Wenn aus: nur per Slash-Command „Gesetzeslinks".',
  },
  {
    key: 'userMappings',
    type: 'object',
    default: {},
    title: 'Eigene Gesetz-Zuordnungen',
    description:
      'Selbst gelernte Abkürzungen → { slug, anchor }. Wird über „Mapping ergänzen" gefüllt.',
  },
];

const STYLE = `
.gesetzeslink { text-decoration: none; border-bottom: 1px solid currentColor; }
.gesetzeslink.unbekannt { border-bottom: 1px dashed var(--ls-warning-text-color, #b58900); }
.gesetzeslink-add {
  margin-left: 4px; cursor: pointer; font-size: 0.85em; opacity: 0.6;
}
.gesetzeslink-add:hover { opacity: 1; }
`;

// Guard gegen Reentrancy: UUIDs, die wir gerade selbst schreiben.
const writing = new Set();

async function processBlock(uuid) {
  if (writing.has(uuid)) return;
  const block = await logseq.Editor.getBlock(uuid);
  if (!block || typeof block.content !== 'string') return;
  const { text, count } = rewrite(block.content);
  if (count === 0 || text === block.content) return;
  writing.add(uuid);
  try {
    await logseq.Editor.updateBlock(uuid, text);
  } finally {
    // kurz verzögert freigeben, damit das resultierende onChanged ignoriert wird
    setTimeout(() => writing.delete(uuid), 50);
  }
}

function renderMacro({ slot, payload }) {
  const [type, ...args] = payload.arguments;
  if (type !== ':gesetz') return;
  const { abbr, nr, label } = parseMacroArgs(args.join(', '));
  const userMappings = logseq.settings?.userMappings || {};
  const { url, known } = buildUrl(abbr, nr, userMappings);
  const safeLabel = label.replace(/</g, '&lt;');
  const cls = known ? 'gesetzeslink' : 'gesetzeslink unbekannt';
  const addBtn = known
    ? ''
    : `<a class="gesetzeslink-add" data-on-click="addMapping"
         data-abbr="${abbr.replace(/"/g, '&quot;')}" title="Mapping ergänzen…">＋</a>`;
  logseq.provideUI({
    key: `gesetz-${payload.uuid}-${slot}`,
    slot,
    reset: true,
    template: `<a class="${cls}" href="${url}" target="_blank"
                  rel="noopener noreferrer" title="gesetze-im-internet.de">${safeLabel}</a>${addBtn}`,
  });
}

async function rewriteCurrentBlock() {
  const block = await logseq.Editor.getCurrentBlock();
  if (block) await processBlock(block.uuid);
}

function main() {
  logseq.useSettingsSchema(SETTINGS_SCHEMA);
  logseq.provideStyle(STYLE);

  logseq.provideModel({
    addMapping(e) {
      const abbr = e.dataset.abbr || '';
      window.GLForm.open(abbr);
    },
  });

  logseq.App.onMacroRendererSlotted(renderMacro);

  logseq.DB.onChanged(({ blocks }) => {
    if (logseq.settings?.autoRewrite === false) return;
    for (const b of blocks || []) {
      if (b && b.uuid) processBlock(b.uuid);
    }
  });

  logseq.Editor.registerSlashCommand('Gesetzeslinks', rewriteCurrentBlock);

  console.log('gesetzeslinks ready');
}

logseq.ready(main).catch(console.error);
})();
