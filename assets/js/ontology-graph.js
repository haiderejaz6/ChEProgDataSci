/* ── Reference ontology: radial graph view ────────────────────────
   Chemical engineering at the centre, the 16 knowledge areas around it,
   their units on the next ring and the topics on the outermost one.
   Plain SVG with no library, so it works offline and on any static host.
   Reads the data ontology.js has already loaded (window.CHE226Ontology).
------------------------------------------------------------------ */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var LEAF_GAP = 13;         // minimum arc length per leaf on its ring, px
  var AREA_GAP = 1.2;        // extra leaf slots left between areas
  var BASE_R = [0, 110, 360, 540];  // ring radius for depth 0..3;
  // the wide gap from ring 1 to ring 2 holds the area names

  var ONT = null;            // window.CHE226Ontology
  var ROOT = null;           // tree built from the data
  var overlay, svg, viewport, linkLayer, nodeLayer, panel;
  var view = { x: 0, y: 0, k: 1 };
  var coverage = false;
  var built = false;

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var a in attrs) n.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ── Tree ─────────────────────────────────────────────────────── */

  function buildTree() {
    var data = ONT.data;
    ROOT = { id: 'root', name: 'Chemical Engineering', depth: 0, open: true, children: [] };
    data.areas.forEach(function (a) {
      var area = {
        id: a.id, name: a.name, desc: a.description, depth: 1, open: true,
        color: ONT.areaColor[a.id], parent: ROOT, children: [], src: a,
      };
      ROOT.children.push(area);
      a.units.forEach(function (u) {
        var unit = {
          id: u.id, name: u.name, desc: u.description, depth: 2, open: false,
          color: area.color, parent: area, children: [], core: u.core, src: u,
        };
        area.children.push(unit);
        (u.topics || []).forEach(function (t) {
          unit.children.push({
            id: t.id, name: t.name, desc: t.description, depth: 3,
            color: area.color, parent: unit, children: [],
            lectures: ONT.topicNotebooks[t.id] || [],
          });
        });
        unit.covered = unit.children.some(function (t) { return t.lectures.length; });
      });
      area.covered = area.children.some(function (u) { return u.covered; });
    });
  }

  function visibleChildren(n) {
    return n.open ? n.children : [];
  }

  /* ── Radial layout ────────────────────────────────────────────── */

  // Leaves are spread evenly around the circle (with a small gap between
  // areas); every parent sits at the mean angle of its first and last leaf.
  function layout() {
    var slots = 0;
    var leaves = [];
    ROOT.children.forEach(function (area, i) {
      if (i > 0) slots += AREA_GAP;
      walk(area);
    });
    slots += AREA_GAP;

    function walk(n) {
      var kids = visibleChildren(n);
      if (!kids.length) {
        n.slot = slots;
        slots += 1;
        leaves.push(n);
        return;
      }
      kids.forEach(walk);
    }

    // Scale the rings out until the outermost leaves have room for a label.
    var maxDepth = leaves.reduce(function (m, n) { return Math.max(m, n.depth); }, 1);
    var need = (slots * LEAF_GAP) / (2 * Math.PI);
    var scale = Math.max(1, need / BASE_R[maxDepth]);
    var radius = BASE_R.map(function (r) { return r * scale; });

    function place(n) {
      var kids = visibleChildren(n);
      if (!kids.length) {
        n.angle = (2 * Math.PI * n.slot) / slots;
      } else {
        kids.forEach(place);
        n.angle = (kids[0].angle + kids[kids.length - 1].angle) / 2;
      }
      n.r = radius[n.depth];
      n.x = n.r * Math.sin(n.angle);
      n.y = -n.r * Math.cos(n.angle);
    }
    ROOT.children.forEach(place);
    ROOT.x = 0;
    ROOT.y = 0;
    ROOT.r = 0;
    return radius[maxDepth];
  }

  /* ── Drawing ─────────────────────────────────────────────────── */

  function linkPath(p, c) {
    if (p.depth === 0) return 'M0,0L' + c.x + ',' + c.y;
    var rm = (p.r + c.r) / 2;
    var x1 = rm * Math.sin(p.angle), y1 = -rm * Math.cos(p.angle);
    var x2 = rm * Math.sin(c.angle), y2 = -rm * Math.cos(c.angle);
    return 'M' + p.x + ',' + p.y + 'C' + x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ' + c.x + ',' + c.y;
  }

  function isLeafShown(n) {
    return !visibleChildren(n).length;
  }

  function render() {
    var outer = layout();
    linkLayer.innerHTML = '';
    nodeLayer.innerHTML = '';

    var all = [];
    (function collect(n) {
      all.push(n);
      visibleChildren(n).forEach(function (c) {
        el('path', {
          d: linkPath(n, c),
          class: 'og-link' + (coverage && !isCovered(c) ? ' dim' : ''),
          stroke: c.color,
        }, linkLayer);
        collect(c);
      });
    })(ROOT);

    all.forEach(drawNode);
    return outer;
  }

  function isCovered(n) {
    if (n.depth === 3) return n.lectures.length > 0;
    if (n.depth === 0) return true;
    return !!n.covered;
  }

  function drawNode(n) {
    var g = el('g', {
      class: 'og-node depth-' + n.depth + (coverage && !isCovered(n) ? ' dim' : '') +
        (n.depth === 3 && n.lectures.length ? ' covered' : ''),
      transform: 'translate(' + n.x + ',' + n.y + ')',
      tabindex: n.depth === 0 ? '-1' : '0',
      role: 'button',
      'aria-label': (n.depth ? n.id + ' ' : '') + n.name,
    }, nodeLayer);

    if (n.depth === 0) {
      el('circle', { r: 58, class: 'og-root' }, g);
      var t = el('text', { class: 'og-root-label', 'text-anchor': 'middle', y: -4 }, g);
      t.textContent = 'Chemical';
      var t2 = el('text', { class: 'og-root-label', 'text-anchor': 'middle', y: 16 }, g);
      t2.textContent = 'Engineering';
      return;
    }

    var radius = [0, 15, 5.5, 3.5][n.depth];
    if (n.depth === 3 && n.lectures.length) radius = 5;
    var hasHidden = n.children.length && !n.open;
    el('circle', {
      r: radius,
      fill: n.depth === 3 && !n.lectures.length ? 'rgb(var(--color-surface))' : n.color,
      stroke: n.color,
      'stroke-width': hasHidden ? 3 : 1.5,
      class: 'og-dot',
    }, g);
    if (n.depth === 1) {
      var num = el('text', { class: 'og-area-num', 'text-anchor': 'middle', dy: '0.35em' }, g);
      num.textContent = n.id.slice(3);
    }
    if (n.depth === 3 && n.lectures.length) {
      el('circle', { r: 9, fill: 'none', stroke: n.color, 'stroke-width': 1.5, class: 'og-ring' }, g);
    }

    // Labels run along the radius, flipped on the left half so they read
    // left-to-right. Leaves label outward; inner nodes carry a haloed label.
    var deg = (n.angle * 180) / Math.PI - 90;
    var left = n.angle > Math.PI;
    var leaf = isLeafShown(n);
    var label = el('text', {
      class: 'og-label depth-' + n.depth + (leaf ? ' leaf' : ''),
      transform: 'rotate(' + (left ? deg + 180 : deg) + ')',
      'text-anchor': left ? 'end' : 'start',
      x: (left ? -1 : 1) * (radius + 5),
      dy: '0.32em',
    }, g);
    var name = n.name;
    if (n.depth === 2 && !leaf) name = n.id;
    if (hasHidden) name += ' +';
    if (n.depth === 1) {
      // Area names are long: wrap onto two lines; the number sits in the dot.
      var lines = wrap(name, 22);
      lines.forEach(function (line, i) {
        var ts = el('tspan', {
          x: (left ? -1 : 1) * (radius + 5),
          dy: i === 0 ? (-(lines.length - 1) * 0.55 + 0.32) + 'em' : '1.1em',
        }, label);
        ts.textContent = line;
      });
      label.removeAttribute('dy');
    } else {
      label.textContent = name;
    }

    var title = el('title', {}, g);
    title.textContent = n.id + ' ' + n.name + (n.children.length
      ? (n.open ? '  (click to collapse)' : '  (click to expand)') : '');

    g.addEventListener('click', function (e) {
      e.stopPropagation();
      select(n);
      if (n.children.length) {
        n.open = !n.open;
        render();
      }
    });
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        g.dispatchEvent(new MouseEvent('click'));
      }
    });
  }

  function wrap(text, width) {
    if (text.length <= width) return [text];
    var words = text.split(' ');
    var best = null;
    // Split at the space that leaves the two lines closest in length.
    for (var i = 1; i < words.length; i++) {
      var a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
      var score = Math.abs(a.length - b.length);
      if (!best || score < best.score) best = { lines: [a, b], score: score };
    }
    return best ? best.lines : [text];
  }

  /* ── Side panel ───────────────────────────────────────────────── */

  function select(n) {
    var kind = ['', 'Knowledge area', 'Knowledge unit', 'Topic'][n.depth];
    var html =
      '<div class="og-panel-kind" style="color:' + n.color + '">' + kind + ' · ' + n.id + '</div>' +
      '<div class="og-panel-name">' + escapeHtml(n.name) + '</div>' +
      (n.desc ? '<p class="og-panel-desc">' + escapeHtml(n.desc) + '</p>' : '');
    if (n.depth === 3) {
      html += n.lectures.length
        ? '<div class="og-panel-sub">In CHE-226</div><div class="og-panel-links">' +
          n.lectures.map(function (l) {
            return '<a href="' + l.read + '" target="_blank" rel="noopener" class="ont-topic-link' +
              (l.kind === 'example' ? ' example' : '') + '">' + escapeHtml(l.label) +
              (l.kind === 'example' ? ' · example' : '') + ' ↗</a>';
          }).join(' ') + '</div>'
        : '<p class="og-panel-desc">Not reached by a CHE-226 lecture this term.</p>';
    } else if (n.depth) {
      var topics = n.depth === 1
        ? n.children.reduce(function (s, u) { return s + u.children.length; }, 0)
        : n.children.length;
      html += '<p class="og-panel-meta">' + (n.depth === 1 ? n.children.length + ' units · ' : '') +
        topics + ' topics' + (n.depth === 2 ? (n.core ? ' · core' : ' · elective') : '') + '</p>';
    }
    html += '<button type="button" class="og-panel-go">Show in the list ↓</button>';
    panel.innerHTML = html;
    panel.hidden = false;
    panel.querySelector('.og-panel-go').addEventListener('click', function () {
      close();
      ONT.showInOutline(n.id);
    });
  }

  /* ── Pan and zoom ─────────────────────────────────────────────── */

  function applyView() {
    viewport.setAttribute('transform', 'translate(' + view.x + ',' + view.y + ') scale(' + view.k + ')');
  }

  function fit(outer) {
    var box = svg.getBoundingClientRect();
    var span = 2 * (outer + 260);  // room for the outermost labels
    view.k = Math.min(box.width, box.height) / span;
    view.x = box.width / 2;
    view.y = box.height / 2;
    applyView();
  }

  function zoomAt(factor, cx, cy) {
    var k = Math.max(0.08, Math.min(6, view.k * factor));
    factor = k / view.k;
    view.x = cx - (cx - view.x) * factor;
    view.y = cy - (cy - view.y) * factor;
    view.k = k;
    applyView();
  }

  function wirePanZoom() {
    var pointers = {};
    var last = null;
    var pinch = null;

    svg.addEventListener('wheel', function (e) {
      e.preventDefault();
      var box = svg.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - box.left, e.clientY - box.top);
    }, { passive: false });

    svg.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('.og-node')) return;
      svg.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      last = { x: e.clientX, y: e.clientY };
      svg.classList.add('grabbing');
    });
    svg.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) {
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        var box = svg.getBoundingClientRect();
        if (pinch) zoomAt(d / pinch, (a.x + b.x) / 2 - box.left, (a.y + b.y) / 2 - box.top);
        pinch = d;
        return;
      }
      view.x += e.clientX - last.x;
      view.y += e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      applyView();
    });
    function up(e) {
      delete pointers[e.pointerId];
      pinch = null;
      var ids = Object.keys(pointers);
      last = ids.length ? pointers[ids[0]] : null;
      if (!ids.length) svg.classList.remove('grabbing');
    }
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', up);
  }

  /* ── Overlay ──────────────────────────────────────────────────── */

  function setAll(depth, open) {
    ROOT.children.forEach(function (a) {
      if (depth === 1) a.open = open;
      a.children.forEach(function (u) {
        if (depth === 2) u.open = open;
      });
    });
  }

  function buildOverlay() {
    overlay = document.getElementById('og-overlay');
    svg = overlay.querySelector('svg');
    panel = overlay.querySelector('.og-panel');
    viewport = el('g', {}, svg);
    linkLayer = el('g', { class: 'og-links' }, viewport);
    nodeLayer = el('g', { class: 'og-nodes' }, viewport);
    wirePanZoom();

    function on(id, fn) {
      var b = document.getElementById(id);
      if (b) b.addEventListener('click', fn);
    }
    on('og-areas', function () { setAll(1, false); fit(render()); });
    on('og-units', function () { setAll(1, true); setAll(2, false); fit(render()); });
    on('og-topics', function () { setAll(1, true); setAll(2, true); fit(render()); });
    on('og-coverage', function (e) {
      coverage = !coverage;
      e.currentTarget.classList.toggle('active', coverage);
      e.currentTarget.setAttribute('aria-pressed', coverage);
      if (coverage) {
        // Open exactly the branches that lead to a topic a lecture reaches.
        ROOT.children.forEach(function (a) {
          a.open = a.covered;
          a.children.forEach(function (u) { u.open = u.covered; });
        });
      }
      fit(render());
    });
    on('og-zoom-in', function () {
      var b = svg.getBoundingClientRect();
      zoomAt(1.3, b.width / 2, b.height / 2);
    });
    on('og-zoom-out', function () {
      var b = svg.getBoundingClientRect();
      zoomAt(1 / 1.3, b.width / 2, b.height / 2);
    });
    on('og-fit', function () { fit(render()); });
    on('og-close', close);
    svg.addEventListener('click', function () { panel.hidden = true; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });
    window.addEventListener('resize', function () {
      if (!overlay.hidden) fit(render());
    });
  }

  var lastFocus = null;

  function open() {
    ONT = window.CHE226Ontology;
    if (!ONT) return;
    if (!built) {
      buildTree();
      buildOverlay();
      built = true;
    }
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('og-lock');
    if (location.hash !== '#graph' && history.replaceState) {
      history.replaceState(null, '', '#graph');
    }
    fit(render());
    var closeBtn = document.getElementById('og-close');
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    overlay.hidden = true;
    panel.hidden = true;
    document.body.classList.remove('og-lock');
    if (location.hash === '#graph' && history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  window.OntologyGraph = { open: open, close: close };

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('ont-graph-btn');
    if (btn) btn.addEventListener('click', open);
  });
})();
