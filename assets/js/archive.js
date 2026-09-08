(function () {
  'use strict';

  var DATA_URL = 'data/archive_fall25.json';

  var DATA = null;
  var QUERY = '';

  document.addEventListener('DOMContentLoaded', boot);

  function boot() {
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        DATA = json;
        var note = document.getElementById('archive-note');
        if (note && json.term && json.term.note) note.textContent = json.term.note;
        wireSearch();
        render();
      })
      .catch(function (err) {
        var main = document.getElementById('archive-body');
        if (main) {
          main.innerHTML =
            '<p class="text-sm text-muted">Could not load the archive index (' +
            escapeHtml(err.message) +
            '). The notebooks are still browsable in the ' +
            '<a class="text-accent hover:underline" href="https://github.com/haiderejaz6/ChEProgDataSci/tree/main/archive/fall25">archive/fall25 folder on GitHub ↗</a>.</p>';
        }
      });
  }

  function wireSearch() {
    var input = document.getElementById('archive-search');
    if (!input) return;
    input.addEventListener('input', function () {
      QUERY = input.value.trim().toLowerCase();
      render();
    });
  }

  function matches(haystack) {
    return !QUERY || haystack.toLowerCase().indexOf(QUERY) !== -1;
  }

  // Raw-notebook URL on GitHub, for the "Open in Colab" action.
  function colabUrl(relPath) {
    return (
      'https://colab.research.google.com/github/' +
      DATA.repo +
      '/blob/' +
      DATA.branch +
      '/' +
      DATA.path +
      '/' +
      relPath
    );
  }

  function sitePath(relPath) {
    return DATA.path + '/' + relPath;
  }

  function render() {
    renderExams();
    renderNotebooks();
  }

  // ── Exams ────────────────────────────────────────────────
  function renderExams() {
    var host = document.getElementById('exam-grid');
    var empty = document.getElementById('exam-empty');
    if (!host) return;

    var exams = (DATA.exams || []).filter(function (ex) {
      return matches([ex.code, ex.title, ex.date, ex.topics, ex.keywords].join(' '));
    });

    host.innerHTML = exams.map(examCard).join('');

    if (empty) {
      var noneAtAll = !(DATA.exams || []).length;
      empty.textContent = noneAtAll
        ? 'No past papers have been published yet.'
        : 'No past papers match your search.';
      empty.classList.toggle('hidden', exams.length !== 0);
    }
  }

  function examCard(ex) {
    var actions = [];
    if (ex.pdf) {
      actions.push(action(sitePath(ex.pdf), 'Paper (PDF) ↗', true));
    }
    if (ex.notebook) {
      actions.push(action(sitePath(stripExt(ex.notebook) + '.html'), 'Read', true));
      actions.push(action(colabUrl(ex.notebook), 'Open in Colab', true, 'nb-action-colab'));
      actions.push(action(sitePath(ex.notebook), 'Download .ipynb', false));
    }
    if (ex.solutions) {
      actions.push(action(sitePath(stripExt(ex.solutions) + '.html'), 'Solutions', true));
    }

    var meta = [ex.date, ex.meta].filter(Boolean).join(' · ');

    return (
      '<article class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-surface-hover">' +
      '<div class="flex items-center justify-between gap-3">' +
      '<span class="font-mono text-xs font-semibold text-accent">' + escapeHtml(ex.code || 'Exam') + '</span>' +
      (ex.topics ? '<span class="tag-pill">' + escapeHtml(ex.topics) + '</span>' : '') +
      '</div>' +
      '<h4 class="text-sm font-semibold leading-snug text-ink">' + escapeHtml(ex.title || '') + '</h4>' +
      (meta ? '<p class="font-mono text-[0.65rem] text-muted">' + escapeHtml(meta) + '</p>' : '') +
      (ex.blurb ? '<p class="text-xs leading-relaxed text-muted">' + escapeHtml(ex.blurb) + '</p>' : '') +
      '<div class="mt-1 flex flex-wrap gap-2">' + actions.join('') + '</div>' +
      '</article>'
    );
  }

  // ── Notebooks ────────────────────────────────────────────
  function renderNotebooks() {
    var host = document.getElementById('archive-nb-grid');
    var empty = document.getElementById('archive-nb-empty');
    if (!host) return;

    var books = (DATA.notebooks || []).filter(function (nb) {
      return matches([nb.code, nb.title, nb.blurb, nb.keywords, (nb.tags || []).join(' ')].join(' '));
    });

    host.innerHTML = books.map(notebookCard).join('');
    if (empty) empty.classList.toggle('hidden', books.length !== 0);
  }

  function notebookCard(nb) {
    var tags = (nb.tags || [])
      .map(function (t) {
        return '<span class="tag-pill">' + escapeHtml(t) + '</span>';
      })
      .join('');

    return (
      '<article class="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-surface-hover">' +
      '<div class="flex items-center justify-between gap-3">' +
      '<span class="font-mono text-xs font-semibold text-accent">' + escapeHtml(nb.code) + '</span>' +
      '<div class="flex flex-wrap justify-end gap-1">' + tags + '</div>' +
      '</div>' +
      '<h4 class="text-sm font-semibold leading-snug text-ink">' + escapeHtml(nb.title) + '</h4>' +
      '<p class="text-xs leading-relaxed text-muted">' + escapeHtml(nb.blurb || '') + '</p>' +
      '<div class="mt-1 flex flex-wrap gap-2">' +
      action(sitePath(nb.file + '.html'), 'Read', true) +
      action(sitePath(nb.file + '.slides.html'), 'Slides', true) +
      action(colabUrl(nb.file + '.ipynb'), 'Open in Colab', true, 'nb-action-colab') +
      action('index.html#notebooks', 'Current version', false) +
      '</div>' +
      '</article>'
    );
  }

  function action(href, label, newTab, extraClass) {
    return (
      '<a href="' + escapeHtml(href) + '"' +
      (newTab ? ' target="_blank" rel="noopener"' : '') +
      ' class="nb-action' + (extraClass ? ' ' + extraClass : '') + '">' +
      escapeHtml(label) +
      '</a>'
    );
  }

  function stripExt(path) {
    return path.replace(/\.ipynb$/, '');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
})();
