(function () {
  'use strict';

  var DATA_URL = 'data/reference_ontology.json';

  // Which reference-ontology topics each notebook already gives students a
  // worked example of. Keyed by the notebook's base filename (the part
  // shared by the .ipynb / .html / .slides.html triplet in index.html).
  // Edit this map whenever a new notebook is added — see the "Adding a new
  // example" note on this page for the workflow.
  var NOTEBOOK_TOPICS = {
    T1_ChemEng_Intro_Commented: [],
    T2_Python_Programming_Basics: ['T-01.06.01'],
    T3_Programming_Logic_and_Control_Statements: ['T-01.06.01'],
    T4_Functions_in_Python: ['T-01.06.01'],
    T5_Sequences_Lists_and_Tuples: ['T-01.06.01'],
    T6_Dictionaries_and_Sets: ['T-01.06.01'],
    T7_Array_Oriented_Programming_with_NumPy: ['T-01.06.02'],
    T8_Strings_Processing: ['T-01.06.01'],
    T9_Files_and_Exceptions: ['T-01.06.03'],
    T10_Linear_Regression: ['T-01.05.03'],
    T15_Machine_Learning: ['T-01.08.01', 'T-01.08.02', 'T-01.08.03'],
  };

  var NOTEBOOK_LABEL = {
    T1_ChemEng_Intro_Commented: 'T1 · Intro to ChemEng & Python',
    T2_Python_Programming_Basics: 'T2 · Python Basics',
    T3_Programming_Logic_and_Control_Statements: 'T3 · Control Statements',
    T4_Functions_in_Python: 'T4 · Functions',
    T5_Sequences_Lists_and_Tuples: 'T5 · Lists & Tuples',
    T6_Dictionaries_and_Sets: 'T6 · Dicts & Sets',
    T7_Array_Oriented_Programming_with_NumPy: 'T7 · NumPy',
    T8_Strings_Processing: 'T8 · Strings',
    T9_Files_and_Exceptions: 'T9 · Files & Exceptions',
    T10_Linear_Regression: 'T10 · Linear Regression',
    T15_Machine_Learning: 'T15 · Machine Learning',
  };

  // topic id -> [ { code, label, href } ]
  var TOPIC_NOTEBOOKS = {};
  Object.keys(NOTEBOOK_TOPICS).forEach(function (code) {
    NOTEBOOK_TOPICS[code].forEach(function (topicId) {
      (TOPIC_NOTEBOOKS[topicId] = TOPIC_NOTEBOOKS[topicId] || []).push({
        code: code,
        label: NOTEBOOK_LABEL[code] || code,
        href: 'index.html#notebooks',
        read: code + '.html',
      });
    });
  });

  var RAW = null;
  var QUERY = '';
  var CORE_ONLY = false;
  var AREA_COLOR = {};

  document.addEventListener('DOMContentLoaded', boot);

  function boot() {
    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        RAW = data;
        buildColors();
        renderStats();
        renderSpotlight();
        renderOutline();
        wireControls();
        handleHash();
      })
      .catch(function (err) {
        var el = document.getElementById('ont-outline');
        if (el) {
          el.innerHTML =
            '<div class="ont-empty">Could not load the reference ontology (' +
            escapeHtml(err.message) +
            ').</div>';
        }
      });
  }

  function buildColors() {
    var palette = [
      '#1a56db', '#6d28d9', '#0369a1', '#c9981a', '#15803d',
      '#b45309', '#be185d', '#4338ca', '#0f766e', '#a16207',
      '#7c3aed', '#0891b2', '#b91c1c', '#4d7c0f', '#334155', '#9333ea',
    ];
    RAW.areas.forEach(function (a, i) {
      AREA_COLOR[a.id] = palette[i % palette.length];
    });
  }

  function renderStats() {
    var units = flat(RAW.areas, 'units');
    var topics = flat(units, 'topics');
    var core = units.filter(function (u) { return u.core; }).length;
    var covered = Object.keys(TOPIC_NOTEBOOKS).length;
    var el = document.getElementById('ont-stats');
    if (!el) return;
    el.innerHTML =
      stat(RAW.areas.length, 'knowledge areas') +
      stat(units.length, 'units (' + core + ' core)') +
      stat(topics.length, 'topics') +
      stat(covered, 'topics with a notebook so far');
  }

  function stat(n, label) {
    return '<div><b>' + n + '</b> ' + escapeHtml(label) + '</div>';
  }

  function flat(list, key) {
    var out = [];
    (list || []).forEach(function (item) {
      out = out.concat(item[key] || []);
    });
    return out;
  }

  /* ── KA-01 spotlight: the area this course actually lives in ────── */

  function renderSpotlight() {
    var host = document.getElementById('ont-spotlight');
    if (!host) return;
    var area = RAW.areas.filter(function (a) { return a.id === 'KA-01'; })[0];
    if (!area) return;

    var unitsHtml = area.units
      .map(function (u) {
        var topicsHtml = (u.topics || [])
          .map(function (t) {
            var nbs = TOPIC_NOTEBOOKS[t.id] || [];
            var link = nbs.length
              ? nbs
                  .map(function (nb) {
                    return (
                      '<a class="ont-topic-link" href="' +
                      nb.read +
                      '" target="_blank" rel="noopener">' +
                      escapeHtml(nb.label) +
                      ' ↗</a>'
                    );
                  })
                  .join(' ')
              : '<span class="ont-topic-link" style="opacity:.45;cursor:default;border-style:dashed;">no notebook yet</span>';
            return (
              '<div class="ont-topic" id="topic-' +
              t.id +
              '"><span class="ont-topic-id">' +
              t.id +
              '</span><span class="ont-topic-name">' +
              escapeHtml(t.name) +
              '</span>' +
              link +
              '<span class="ont-topic-desc">' +
              escapeHtml(t.description || '') +
              '</span></div>'
            );
          })
          .join('');
        return (
          '<div class="ont-unit open" id="unit-' +
          u.id +
          '"><div class="ont-unit-head"><span class="ont-unit-id">' +
          u.id +
          '</span><span class="ont-unit-name">' +
          escapeHtml(u.name) +
          '</span><span class="ont-badge ' +
          (u.core ? 'core">CORE' : 'elective">elective') +
          '</span><span class="ont-badge bloom">' +
          escapeHtml(u.expected_bloom || '') +
          '</span></div><div class="ont-unit-body" style="display:block;"><div class="ont-unit-desc">' +
          escapeHtml(u.description || '') +
          '</div>' +
          topicsHtml +
          '</div></div>'
        );
      })
      .join('');

    host.innerHTML =
      '<div class="ont-spotlight-label">' +
      area.id +
      ' · where this course lives</div>' +
      '<p style="font-size:.82rem;line-height:1.6;color:rgb(var(--color-muted));max-width:60ch;">' +
      escapeHtml(area.description || '') +
      ' CHE-226 is the course’s primary vehicle for this area — every notebook below teaches ' +
      'one or more of these units. When picking a new example, look for a topic still marked ' +
      '“no notebook yet”, then pair it with a real process context from one of the domain areas ' +
      'further down the page.</p><div style="margin-top:.75rem;">' +
      unitsHtml +
      '</div>';
  }

  /* ── Full outline (all 16 areas) ─────────────────────────────────── */

  function renderOutline() {
    var host = document.getElementById('ont-outline');
    if (!host) return;
    var areas = RAW.areas.filter(areaVisible);

    if (!areas.length) {
      host.innerHTML = '<div class="ont-empty">Nothing matches “' + escapeHtml(QUERY) + '”.</div>';
      return;
    }

    host.innerHTML = areas
      .map(function (a) {
        var units = a.units.filter(function (u) { return unitVisible(a, u); });
        var nTopics = units.reduce(function (s, u) { return s + (u.topics || []).length; }, 0);
        var color = AREA_COLOR[a.id];
        var openCls = QUERY ? ' open' : '';

        var unitsHtml = units
          .map(function (u) {
            var topicsHtml = (u.topics || [])
              .map(function (t) {
                var nbs = TOPIC_NOTEBOOKS[t.id] || [];
                var link = nbs.length
                  ? nbs
                      .map(function (nb) {
                        return (
                          '<a class="ont-topic-link" href="' +
                          nb.read +
                          '" target="_blank" rel="noopener">' +
                          escapeHtml(nb.label) +
                          ' ↗</a>'
                        );
                      })
                      .join(' ')
                  : '';
                return (
                  '<div class="ont-topic" id="topic-' +
                  t.id +
                  '"><span class="ont-topic-id">' +
                  t.id +
                  '</span><span class="ont-topic-name">' +
                  markMatch(t.name) +
                  '</span>' +
                  link +
                  '<span class="ont-topic-desc">' +
                  markMatch(t.description || '') +
                  '</span></div>'
                );
              })
              .join('');
            return (
              '<div class="ont-unit' +
              openCls +
              '" id="unit-' +
              u.id +
              '"><div class="ont-unit-head" onclick="this.parentNode.classList.toggle(\'open\')">' +
              '<span class="ont-unit-id">' +
              u.id +
              '</span><span class="ont-unit-name">' +
              markMatch(u.name) +
              '</span><span class="ont-badge ' +
              (u.core ? 'core">CORE' : 'elective">elective') +
              '</span><span class="ont-badge bloom">' +
              escapeHtml(u.expected_bloom || '') +
              '</span><span class="ont-unit-id">' +
              (u.topics || []).length +
              ' topics</span></div><div class="ont-unit-body"><div class="ont-unit-desc">' +
              markMatch(u.description || '') +
              '</div>' +
              topicsHtml +
              '</div></div>'
            );
          })
          .join('');

        return (
          '<div class="ont-area' +
          openCls +
          '" id="area-' +
          a.id +
          '" style="--area-color:' +
          color +
          '"><div class="ont-area-head" onclick="this.parentNode.classList.toggle(\'open\')">' +
          '<span class="ont-chev">▶</span><span class="ont-area-id">' +
          a.id +
          '</span><span class="ont-area-name">' +
          markMatch(a.name) +
          '</span><span class="ont-area-meta">' +
          units.length +
          ' units · ' +
          nTopics +
          ' topics</span></div><div class="ont-area-body"><div class="ont-area-desc">' +
          markMatch(a.description || '') +
          '</div>' +
          unitsHtml +
          '</div></div>'
        );
      })
      .join('');
  }

  function matches(text) {
    return QUERY && text && String(text).toLowerCase().indexOf(QUERY) !== -1;
  }

  function markMatch(text) {
    text = String(text == null ? '' : text);
    if (!QUERY) return escapeHtml(text);
    var idx = text.toLowerCase().indexOf(QUERY);
    if (idx === -1) return escapeHtml(text);
    return (
      escapeHtml(text.slice(0, idx)) +
      '<mark class="ont-highlight">' +
      escapeHtml(text.slice(idx, idx + QUERY.length)) +
      '</mark>' +
      escapeHtml(text.slice(idx + QUERY.length))
    );
  }

  function unitVisible(area, unit) {
    if (CORE_ONLY && !unit.core) return false;
    if (!QUERY) return true;
    if (matches(unit.name) || matches(unit.description) || matches(unit.id)) return true;
    if (matches(area.name)) return true;
    return (unit.topics || []).some(function (t) {
      return matches(t.name) || matches(t.description) || matches(t.id);
    });
  }

  function areaVisible(area) {
    return area.units.some(function (u) { return unitVisible(area, u); });
  }

  /* ── Controls ─────────────────────────────────────────────────────── */

  function wireControls() {
    var search = document.getElementById('ont-search');
    var hits = document.getElementById('ont-hits');
    var coreBtn = document.getElementById('ont-core-btn');
    var expandBtn = document.getElementById('ont-expand-btn');
    var collapseBtn = document.getElementById('ont-collapse-btn');

    if (search) {
      search.addEventListener('input', debounce(function () {
        QUERY = search.value.trim().toLowerCase();
        renderOutline();
        if (hits) {
          if (QUERY) {
            var units = flat(RAW.areas.filter(areaVisible), 'units').filter(function (u) {
              var area = RAW.areas.filter(function (a) { return a.units.indexOf(u) !== -1; })[0];
              return unitVisible(area, u);
            });
            hits.textContent = units.length + ' units match';
          } else {
            hits.textContent = '';
          }
        }
      }, 180));
    }

    if (coreBtn) {
      coreBtn.addEventListener('click', function () {
        CORE_ONLY = !CORE_ONLY;
        coreBtn.classList.toggle('active', CORE_ONLY);
        renderOutline();
      });
    }
    if (expandBtn) {
      expandBtn.addEventListener('click', function () {
        document.querySelectorAll('#ont-outline .ont-area, #ont-outline .ont-unit').forEach(function (el) {
          el.classList.add('open');
        });
      });
    }
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function () {
        document.querySelectorAll('#ont-outline .ont-area, #ont-outline .ont-unit').forEach(function (el) {
          el.classList.remove('open');
        });
      });
    }
  }

  function handleHash() {
    var id = (location.hash || '').replace('#', '');
    if (!id) return;
    // Expand the area/unit chain for a topic or unit id landed on directly.
    RAW.areas.forEach(function (a) {
      a.units.forEach(function (u) {
        var hasTopic = (u.topics || []).some(function (t) { return t.id === id; });
        if (u.id === id || hasTopic) {
          var areaEl = document.getElementById('area-' + a.id);
          var unitEl = document.getElementById('unit-' + u.id);
          if (areaEl) areaEl.classList.add('open');
          if (unitEl) unitEl.classList.add('open');
        }
      });
    });
    setTimeout(function () {
      var target = document.getElementById('topic-' + id) || document.getElementById('unit-' + id) || document.getElementById('area-' + id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('ont-highlight');
        setTimeout(function () { target.classList.remove('ont-highlight'); }, 2200);
      }
    }, 60);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
