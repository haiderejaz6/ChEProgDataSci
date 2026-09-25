## Reference ontology

`ontology.html` browses the department's reference ontology for chemical engineering
(`data/reference_ontology.json`) — 16 knowledge areas, independent of any one course's
syllabus, grounded in PEC 2023–2024 accreditation guidelines and AIChE/ABET programme
criteria. The page is written for students: it shows where CHE-226 sits (KA-01) and,
for a given topic, which notebook to open.

Notebooks are not one-per-topic. Each teaches a slice of Python and borrows its worked
examples from wherever on the map they fit, so `assets/js/ontology.js` carries two maps
keyed by notebook filename:

* `NOTEBOOK_TEACHES` — the programming/data-science topic the notebook actually teaches
  (nearly always inside KA-01). Rendered as an amber chip on that topic.
* `NOTEBOOK_EXAMPLES` — the engineering topics its examples borrow, anywhere on the map
  (T1's ideal-gas law, T2's `Q = m·Cp·ΔT`, T3's Reynolds number, T4's Arrhenius constant).
  Rendered as a blue "example" chip.

An empty `NOTEBOOK_EXAMPLES` entry means that notebook still runs on generic examples —
the gap to close on its next revision, by weaving a context in, not by writing a new
notebook for the topic. Update both maps when a notebook gains or loses an example; the
"topics the notebooks reach" count on the page comes from them.

## Fall 2025 archive

`archive.html` is the students' practice page: past exam papers, plus the notebooks
frozen exactly as they were taught in Fall 2025. The live notebooks at the repo root
are revised topic by topic during the term; the copies in `archive/fall25/` are never
edited, so a link handed out in Fall 2025 keeps working and students can still practise
on the material the Fall 2025 papers were set from. Both versions stay listed — the
current one on the home page, the frozen one in the archive.

The page is driven by `data/archive_fall25.json` (notebook cards and exam cards) and
rendered by `assets/js/archive.js`; nothing appears on the site until it has an entry
there. To publish a past paper, see `archive/fall25/exams/README.md`. To freeze another
term, copy the notebooks into `archive/<term>/`, add a matching JSON file and page, and
extend the archive step in `.github/workflows/deploy.yml`.

## Run and present notebooks live (Binder + RISE)

Each notebook card's "Open in Binder" link launches the repo on mybinder.org straight
into that file in the classic Jupyter Notebook interface, with a live kernel — students
and TAs can run cells, not just read a static export. `requirements.txt` and
`runtime.txt` at the repo root pin the environment mybinder.org builds
(`notebook==6.5.7` + `rise==5.7.1`, since RISE's slideshow toolbar button only ships for
the classic notebook UI, plus the scientific stack the notebooks import: numpy, pandas,
matplotlib, seaborn, scipy, scikit-learn, ipywidgets).

RISE reads the same `slideshow.slide_type` cell metadata that `deploy.yml` already feeds
to `jupyter nbconvert --to slides` for the static `.slides.html` pages, so a notebook
opened in Binder presents identically — just live. Click the toolbar's slideshow icon
(or press Alt+R) to enter/exit presentation mode.

When adding a new top-level notebook, add its "Open in Binder" link alongside the
existing "Open in Colab" one (same `nb-action nb-action-binder` pattern in `index.html`),
pointing at
`https://mybinder.org/v2/gh/haiderejaz6/ChEProgDataSci/main?urlpath=notebooks%2F<file>.ipynb`.
If it imports a new third-party package, add it to `requirements.txt` too — Binder only
rebuilds the environment image when that file changes, so a missing dependency fails
silently as an import error inside the launched notebook, not at build time.

## Disclaimer

These lecture materials are prepared for the course **Programming and Data Science** for undergraduate students of Chemical Engineering. 

The content is based on the textbook *"Intro to Python for Computer Science and Data Science"* by Paul Deitel and Harvey Deitel. This repository is intended **solely for educational purposes** to support student learning. 

All materials are provided for **non-commercial use only**. Please do not redistribute or use them for commercial purposes without proper attribution to the original authors.
