# Fall 2025 exam papers

Every paper is published twice:

* **`<Paper>.pdf`** — the paper exactly as it was sat. Wording, mark allocation,
  time limit and instructions intact. This is the record, and the thing students
  should attempt under time.
* **`<Paper>.ipynb`** — the same questions as a runnable notebook, with the answer
  cells left empty and all outputs cleared. This is what makes the paper practice
  rather than reading: it opens in Colab in one click.

Worked solutions are deliberately not published with the paper. If you want to
release them later, add a `<Paper>_solutions.ipynb` and point the `solutions`
key at it (see below) — the card grows a "Solutions" link automatically.

## Adding a paper

1. Drop the files in this folder, e.g.
   `OHT1_Fall2025.pdf` and `OHT1_Fall2025.ipynb`.

2. Strip outputs and any leftover answers from the notebook before committing:

   ```bash
   jupyter nbconvert --clear-output --inplace archive/fall25/exams/OHT1_Fall2025.ipynb
   ```

   `--clear-output` removes cell outputs, not the code that produced them. Read
   through the code cells and blank out anything that gives the answer away.

3. Add an entry to the `exams` array in `data/archive_fall25.json`. Paths are
   relative to `archive/fall25/`:

   ```json
   {
     "code": "OHT-1",
     "title": "One Hour Test 1",
     "date": "October 2025",
     "meta": "60 minutes · 30 marks",
     "topics": "T1–T4",
     "blurb": "Variables, control flow and functions on a mass-balance problem.",
     "pdf": "exams/OHT1_Fall2025.pdf",
     "notebook": "exams/OHT1_Fall2025.ipynb",
     "keywords": "oht1 midterm mass balance loops functions"
   }
   ```

   Only `code`, `title` and `pdf` are really needed — every other key is
   optional, and any link whose key is missing simply isn't drawn. Leave
   `notebook` out for a paper that was pen-and-paper only.

4. Push. The deploy workflow copies the PDFs across, renders each exam notebook
   to a "Read" page, and the card appears on `archive.html`.

Nothing here is listed anywhere until it has an entry in the JSON, so a file
committed by mistake does not go on the site — but it is still in a public
repository, so don't commit a paper you intend to reuse unchanged.
