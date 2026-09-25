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
    // Q = m·Cp·ΔT, mole fractions
    T1_ChemEng_Intro_Commented: [
      'T-03.01.01', 'T-03.01.02', 'T-03.01.03', 'T-03.04.01', 'T-04.02.02',
    ],
    // density from user input, mole fraction, Q = m·Cp·ΔT, component molar mass
    T2_Python_Programming_Basics: ['T-03.01.02', 'T-03.01.03', 'T-03.04.01'],
    // Sneak peeks: Reynolds number flow regime, Stokes' law terminal
    // velocity, friction F = uN
    T3_Programming_Logic_and_Control_Statements: [
      'T-05.02.03', 'T-09.02.01', 'T-15.01.03',
    ],
    // Sneak peeks: ideal gas law n = PV/RT, Arrhenius rate constant
    T4_Functions_in_Python: ['T-02.01.01', 'T-08.01.02'],
    // mass fractions and a stream composition table, reactor readings
    T5_Sequences_Lists_and_Tuples: ['T-03.01.02', 'T-03.01.03'],
    // stream compositions as dicts, mole fractions, mixer component balance
    T6_Dictionaries_and_Sets: ['T-03.01.02'],
    // Sneak peeks: vectorized Newton-Raphson, series resistances for U
    T7_Array_Oriented_Programming_with_NumPy: ['T-01.04.01', 'T-06.04.01'],
    // parsing a composition string into a dictionary
    T8_Strings_Processing: ['T-03.01.02'],
    // Sneak peeks: fuel heating values, relative volatility from K-values
    T9_Files_and_Exceptions: ['T-16.03.01', 'T-07.02.02'],
    // Sneak peeks: ideal vs. van der Waals P-V curves, steel strength
    // regression
    T10_Linear_Regression: ['T-04.02.01', 'T-12.01.02'],
    // Sneak peeks: first-order response, six-tenths rule capital cost,
    // hazard classification, ethics of relying on a model
    T15_Machine_Learning: [
      'T-10.01.03', 'T-11.04.01', 'T-13.02.01', 'T-14.01.02',
    ],
  };

  var NOTEBOOK_LABEL = {
    T1_ChemEng_Intro_Commented: 'T1 · Intro to Computers & Python',
    T2_Python_Programming_Basics: 'T2 · Python Basics',
    T3_Programming_Logic_and_Control_Statements: 'T3 · Control Statements',
    T4_Functions_in_Python: 'T4 · Functions',
    T5_Sequences_Lists_and_Tuples: 'T5 · Lists & Tuples',
    T6_Dictionaries_and_Sets: 'T6 · Dicts & Sets',
    T7_Array_Oriented_Programming_with_NumPy: 'T7 · NumPy',
    T8_Strings_Processing: 'T8 · Strings',
    T9_Files_and_Exceptions: 'T9 · Files & Exceptions',
    T10_Linear_Regression: 'T10 · Visualization & Regression',
    T15_Machine_Learning: 'T15 · Machine Learning',
  };

  // Full lecture titles, for the "what each lecture covers" cards.
  var NOTEBOOK_TITLE = {
    T1_ChemEng_Intro_Commented: 'Introduction to Computers, Python & Data Science',
    T2_Python_Programming_Basics: 'Python Programming Basics',
    T3_Programming_Logic_and_Control_Statements: 'Programming Logic & Control Statements',
    T4_Functions_in_Python: 'Functions in Python',
    T5_Sequences_Lists_and_Tuples: 'Sequences: Lists & Tuples',
    T6_Dictionaries_and_Sets: 'Dictionaries & Sets',
    T7_Array_Oriented_Programming_with_NumPy: 'Array-Oriented Programming with NumPy',
    T8_Strings_Processing: 'Strings: A Deeper Look',
    T9_Files_and_Exceptions: 'Files & Exceptions',
    T10_Linear_Regression: 'Data Visualization & Linear Regression',
    T15_Machine_Learning: 'Machine Learning with scikit-learn',
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
        renderLectures();
        renderOutline();
        wireControls();
        window.CHE226Ontology = {
          data: RAW,
          areaColor: AREA_COLOR,
          topicNotebooks: TOPIC_NOTEBOOKS,
          showInOutline: showInOutline,
        };
        document.dispatchEvent(new CustomEvent('ontology:ready'));
        handleHash();
        window.addEventListener('hashchange', handleHash);
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
    var areasReached = {};
    Object.keys(TOPIC_NOTEBOOKS).forEach(function (id) {
      areasReached[id.slice(2, 4)] = true;
    });
    var el = document.getElementById('ont-stats');
    if (!el) return;
    el.innerHTML =
      stat(RAW.areas.length, 'knowledge areas') +
      stat(units.length, 'units (' + core + ' core)') +
      stat(topics.length, 'topics') +
      stat(covered, 'topics the lectures reach') +
      stat(Object.keys(areasReached).length + ' of ' + RAW.areas.length, 'areas the lectures reach');
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

  /* ── What each lecture covers ───────────────────────────────────── */

  // topic id -> { topic, unit, area }
  function topicIndex() {
    var idx = {};
    RAW.areas.forEach(function (a) {
      a.units.forEach(function (u) {
        (u.topics || []).forEach(function (t) {
          idx[t.id] = { topic: t, unit: u, area: a };
        });
      });
    });
    return idx;
  }

  function lectureChip(entry, kind) {
    var t = entry.topic;
    return (
      '<a class="lec-chip ' + kind + '" href="#' + t.id + '" style="--area-color:' +
      AREA_COLOR[entry.area.id] + '" title="' + escapeHtml(entry.area.id + ' ' +
      entry.area.name + ' / ' + entry.unit.name) + '">' +
      '<span class="lec-chip-id">' + t.id + '</span>' + escapeHtml(t.name) + '</a>'
    );
  }

  function renderLectures() {
    var host = document.getElementById('ont-lectures');
    if (!host) return;
    var idx = topicIndex();

    host.innerHTML = Object.keys(NOTEBOOK_LABEL)
      .map(function (code) {
        var num = code.split('_')[0];
        var teaches = (NOTEBOOK_TEACHES[code] || []).filter(function (id) { return idx[id]; });
        var examples = (NOTEBOOK_EXAMPLES[code] || []).filter(function (id) { return idx[id]; });

        // Group worked examples by knowledge area, in area order.
        var byArea = {};
        examples.forEach(function (id) {
          var aid = idx[id].area.id;
          (byArea[aid] = byArea[aid] || []).push(id);
        });
        var exampleHtml = Object.keys(byArea).sort().map(function (aid) {
          var area = idx[byArea[aid][0]].area;
          return (
            '<div class="lec-area"><span class="lec-area-id" style="--area-color:' +
            AREA_COLOR[aid] + '">' + aid + '</span><span class="lec-area-name">' +
            escapeHtml(area.name) + '</span></div><div class="lec-chips">' +
            byArea[aid].map(function (id) { return lectureChip(idx[id], 'example'); }).join('') +
            '</div>'
          );
        }).join('');

        return (
          '<article class="lec-card" id="lec-' + code + '">' +
          '<img class="lec-art" src="images/lectures/' + num.toLowerCase() +
          '.svg" alt="" loading="lazy" width="400" height="120" />' +
          '<div class="lec-body">' +
          '<div class="lec-head"><span class="lec-num">' + num + '</span>' +
          '<a class="lec-title" href="' + code + '.html" target="_blank" rel="noopener">' +
          escapeHtml(NOTEBOOK_TITLE[code] || NOTEBOOK_LABEL[code]) + '</a></div>' +
          '<div class="lec-label">Teaches</div><div class="lec-chips">' +
          teaches.map(function (id) { return lectureChip(idx[id], 'teaches'); }).join('') +
          '</div>' +
          (exampleHtml
            ? '<div class="lec-label">Worked examples borrowed from</div>' + exampleHtml
            : '<div class="lec-label">Worked examples</div><p class="lec-none">General ' +
              'programming examples only; no topic tagged yet.</p>') +
          '</div></article>'
        );
      })
      .join('');
  }

  // Open the area and unit holding a topic in the full outline, then scroll to it.
  function showInOutline(id) {
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    handleHash();
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
                var link = topicLinks(t.id, a.id === 'KA-01');
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

    var lectures = document.getElementById('ont-lectures');
    if (lectures) {
      lectures.addEventListener('click', function (e) {
        var chip = e.target.closest && e.target.closest('.lec-chip');
        if (!chip) return;
        e.preventDefault();
        showInOutline(chip.getAttribute('href').slice(1));
      });
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
    var id = decodeURIComponent((location.hash || '').replace('#', ''));
    if (!id) return;
    if (id === 'graph') {
      if (window.OntologyGraph) window.OntologyGraph.open();
      return;
    }
    if (id.indexOf('lec-') === 0) {
      var lec = document.getElementById(id);
      if (lec) lec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
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
