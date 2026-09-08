(function () {
  'use strict';

  var DATA_URL = 'data/reference_ontology.json';

  // How the notebooks sit against the reference ontology.
  //
  // A notebook is not built around one ontology topic. Each one teaches a slice
  // of Python — variables, control flow, functions, arrays — and then borrows the
  // worked examples that carry it from wherever on the map they fit: a density
  // calculation, an energy balance, the Reynolds number, an Arrhenius constant.
  // So there are two maps, and most notebooks appear in both:
  //
  //   NOTEBOOK_TEACHES  — the programming / data-science topic the notebook is
  //                       actually teaching (nearly always inside KA-01).
  //   NOTEBOOK_EXAMPLES — the engineering topics its examples borrow, anywhere on
  //                       the map. Empty means the notebook still runs on generic
  //                       examples; that is a gap to fill on the next revision,
  //                       not a topic that needs its own new notebook.
  //
  // Keyed by the notebook's base filename (the part shared by the .ipynb /
  // .html / .slides.html triplet in index.html).
  var NOTEBOOK_TEACHES = {
    T1_ChemEng_Intro_Commented: ['T-01.06.01'],
    T2_Python_Programming_Basics: ['T-01.06.01'],
    T3_Programming_Logic_and_Control_Statements: ['T-01.06.01', 'T-01.09.02'],
    T4_Functions_in_Python: ['T-01.06.01'],
    T5_Sequences_Lists_and_Tuples: ['T-01.06.01'],
    T6_Dictionaries_and_Sets: ['T-01.06.01'],
    T7_Array_Oriented_Programming_with_NumPy: ['T-01.06.02'],
    T8_Strings_Processing: ['T-01.06.01'],
    T9_Files_and_Exceptions: ['T-01.06.01', 'T-01.06.03'],
    T10_Linear_Regression: ['T-01.05.03', 'T-01.06.03', 'T-01.09.04'],
    T15_Machine_Learning: ['T-01.08.01', 'T-01.08.02', 'T-01.08.03', 'T-01.08.04'],
  };

  var NOTEBOOK_EXAMPLES = {
    // reactor temperature readings, density, °C/°F/K conversions, ideal gas law,
    // mole fractions
    T1_ChemEng_Intro_Commented: ['T-03.01.01', 'T-03.01.02', 'T-03.01.03', 'T-04.02.02'],
    // density from user input, mole fraction, Q = m·Cp·ΔT, component molar mass
    T2_Python_Programming_Basics: ['T-03.01.02', 'T-03.01.03', 'T-03.04.01'],
    // density algorithm and flowchart, phase of water from temperature
    T3_Programming_Logic_and_Control_Statements: ['T-03.01.03', 'T-04.02.01'],
    // Reynolds number for water in a pipe, Arrhenius rate constant
    T4_Functions_in_Python: ['T-05.02.03', 'T-08.01.02'],
    T5_Sequences_Lists_and_Tuples: [],
    T6_Dictionaries_and_Sets: [],
    T7_Array_Oriented_Programming_with_NumPy: [],
    T8_Strings_Processing: [],
    T9_Files_and_Exceptions: [],
    T10_Linear_Regression: [],
    T15_Machine_Learning: [],
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

  // topic id -> [ { code, label, read, kind } ], kind: 'teaches' | 'example'
  var TOPIC_NOTEBOOKS = {};
  [['teaches', NOTEBOOK_TEACHES], ['example', NOTEBOOK_EXAMPLES]].forEach(function (pair) {
    var kind = pair[0];
    var map = pair[1];
    Object.keys(map).forEach(function (code) {
      map[code].forEach(function (topicId) {
        (TOPIC_NOTEBOOKS[topicId] = TOPIC_NOTEBOOKS[topicId] || []).push({
          code: code,
          label: NOTEBOOK_LABEL[code] || code,
          read: code + '.html',
          kind: kind,
        });
      });
    });
  });

  // Notebook chips shown against one topic. A topic can collect several: the
  // notebook that teaches it, plus any whose examples borrow it.
  function topicLinks(topicId, showPlaceholder) {
    var nbs = TOPIC_NOTEBOOKS[topicId] || [];
    if (!nbs.length) {
      return showPlaceholder
        ? '<span class="ont-topic-link placeholder">not covered this term</span>'
        : '';
    }
    return nbs
      .map(function (nb) {
        var isExample = nb.kind === 'example';
        return (
          '<a class="ont-topic-link' +
          (isExample ? ' example' : '') +
          '" href="' +
          nb.read +
          '" target="_blank" rel="noopener" title="' +
          (isExample
            ? 'A worked example in this notebook uses this topic'
            : 'This notebook teaches this topic') +
          '">' +
          escapeHtml(nb.label) +
          (isExample ? ' · example ↗' : ' ↗') +
          '</a>'
        );
      })
      .join(' ');
  }

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
      stat(covered, 'topics the notebooks reach');
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
            var link = topicLinks(t.id, true);
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
      ' This is the area CHE-226 belongs to, so the topics below are the ones the course ' +
      'teaches you directly. A topic marked “not covered this term” is still part of your ' +
      'degree — you will meet it in another course, or you can read ahead on your own. ' +
      'Look further down the page for the engineering topics the notebook examples borrow.' +
      '</p><div style="margin-top:.75rem;">' +
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
                var link = topicLinks(t.id, false);
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
