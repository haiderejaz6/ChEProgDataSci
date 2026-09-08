## Reference ontology

`ontology.html` browses the department's reference ontology for chemical engineering
(`data/reference_ontology.json`) — 16 knowledge areas, independent of any one course's
syllabus, grounded in PEC 2023–2024 accreditation guidelines and AIChE/ABET programme
criteria. It's used two ways: to pick a real chemical-engineering context (a reactor, a
column, a heat exchanger) when writing a new notebook, and to show students how this
course's programming/data-science content (knowledge area KA-01) connects to the rest
of the curriculum. See the "Adding a new example" note on that page, and the
`NOTEBOOK_TOPICS` map in `assets/js/ontology.js`, for the workflow to follow when a new
notebook is added.

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

## Disclaimer

These lecture materials are prepared for the course **Programming and Data Science** for undergraduate students of Chemical Engineering. 

The content is based on the textbook *"Intro to Python for Computer Science and Data Science"* by Paul Deitel and Harvey Deitel. This repository is intended **solely for educational purposes** to support student learning. 

All materials are provided for **non-commercial use only**. Please do not redistribute or use them for commercial purposes without proper attribution to the original authors.
