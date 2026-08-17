(function () {
  'use strict';

  // ── Theme toggle ──────────────────────────────────────────
  // Initial dark/light class is set by an inline script in <head> (before
  // first paint, to avoid a flash of the wrong theme). This just wires up
  // the toggle button once the DOM is ready.
  var root = document.documentElement;

  function updateToggleLabel() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', root.classList.contains('dark'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateToggleLabel();
    var btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var nowDark = !root.classList.contains('dark');
        root.classList.toggle('dark', nowDark);
        localStorage.setItem('theme', nowDark ? 'dark' : 'light');
        updateToggleLabel();
      });
    }

    // ── Search + group filter ────────────────────────────────
    var searchInput = document.getElementById('nb-search');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.nb-card'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('.nb-group'));
    var emptyState = document.getElementById('nb-empty');
    var activeGroup = 'all';

    function applyFilters() {
      var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = card.dataset.search || '';
        var group = card.dataset.group || '';
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesGroup = activeGroup === 'all' || group === activeGroup;
        var show = matchesQuery && matchesGroup;
        card.classList.toggle('hidden', !show);
        if (show) visibleCount += 1;
      });

      groups.forEach(function (section) {
        var visibleInGroup = section.querySelectorAll('.nb-card:not(.hidden)').length;
        section.classList.toggle('hidden', visibleInGroup === 0);
      });

      if (emptyState) emptyState.classList.toggle('hidden', visibleCount !== 0);
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeGroup = chip.dataset.filter;
        chips.forEach(function (c) {
          var active = c === chip;
          c.classList.toggle('bg-accent', active);
          c.classList.toggle('text-white', active);
          c.classList.toggle('border-accent', active);
          c.classList.toggle('bg-surface', !active);
          c.classList.toggle('text-muted', !active);
          c.classList.toggle('border-border', !active);
        });
        applyFilters();
      });
    });
  });
})();
