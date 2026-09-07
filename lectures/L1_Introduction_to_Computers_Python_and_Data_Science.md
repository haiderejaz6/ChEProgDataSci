---
marp: true
paginate: true
size: "16:9"
---

<style>
/* @theme lecture */

section {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  background: #ffffff;
  color: #1a1a1a;
  padding: 60px 70px;
  font-size: 28px;
}

h1 {
  font-size: 44px;
  color: #0b3d91;
  border-bottom: 4px solid #0b3d91;
  padding-bottom: 12px;
}

h2 {
  font-size: 34px;
  color: #0b3d91;
}

h3 {
  font-size: 26px;
  color: #444;
  text-transform: none;
  letter-spacing: 0.5px;
  margin-bottom: 24px;
}

code {
  background: #f4f4f4;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.85em;
}

pre {
  background: #f7f7f9;
  border-left: 4px solid #0b3d91;
  border-radius: 4px;
  padding: 16px;
  font-size: 0.75em;
}

section.title {
  background: #0b3d91;
  color: white;
}

section.title h1 {
  color: white;
  border-bottom: 4px solid white;
}

footer, header {
  color: #888;
  font-size: 16px;
}
</style>

<!-- _class: title -->

# CHE-226: Programming and AI for Chemical Engineers

### Lecture 1 — Introduction to Computers, Python, and Data Science

Dr. Haider Ejaz
School of Chemical and Materials Engineering (SCME), NUST

---

### Today's Roadmap

1. Welcome, syllabus & how this course works
2. Getting set up: terminal, Python, Jupyter
3. Computers 101 — hardware, software, data
4. From machine code to Python — languages & objects
5. Why Python? — the library ecosystem
6. **Hands-on:** your first lines of Python
7. Internet → Cloud → IoT → Big Data
8. AI: where CS meets data science

<!--
Frame this as a "zoom out, then zoom in" lecture: today is the big picture of the whole field. Starting next week we go deep on Python syntax itself.
-->

---

### About Me

🎓 SCME (NUST) → MS Energy Systems, USPCASE (semester at ASU)
💼 Research Associate, USPCASE
🌍 Fulbright Scholar — PhD Chemical & Biochemical Engineering, Rutgers
🔬 Research: DFT (VASP), Python-based data automation, Kinetic Monte Carlo (ZACROS)

---

### Course at a Glance

CHE-226 = Python programming **+** engineering data analysis, taught through chemical engineering problems, not syntax drills.

Three blocks: Programming fundamentals → NumPy/Pandas/Matplotlib → intro AI/ML (scikit-learn)

2 lecture hours + 3 lab hours per week

---

### How You'll Be Graded

**Theory (75%)** — Assignments 10% · Quizzes 10% · Midterm 25% · Project 15% · Final 40%

**Practical (25%)** — Lab reports/participation 10% · Lab quizzes/viva 5% · Mini project 10%

---

### Course Project

Teams of 3–5 · must connect to a chemical engineering problem · uses programming/data analysis

**Timeline:** Proposal (Wk 4) → Progress update (Wk 8) → Draft report (Wk 12) → Final report + presentation (Wk 14–15)

---

### 💬 Quick Poll — Let's Warm Up

1. How often do you use a computer for something *beyond* social media / streaming?
2. Which programming languages (if any) have you already used?

*(Open your polling tool of choice now — e.g. Slido — and share your answers.)*

<!--
Purpose: gauge the room's baseline before diving in. Don't over-invest time here — 3-4 minutes total including a few verbal call-outs.
-->

---

### What Is a Terminal?

A text-based way to talk to your computer — navigate folders, run programs, automate tasks. You'll use it constantly this semester.

```
ls / dir        → list files
cd foldername   → move into a folder
cd ..           → go back one level
pwd             → show current folder (Mac/Linux)
```

---

### Setting Up Jupyter Notebook

1. Install **Python** (check "Add Python to PATH")
2. Install Jupyter: `pip install notebook`
3. Run it: `jupyter notebook`
4. Opens automatically at `http://localhost:8888`

Create and run `.ipynb` notebooks from there — this is where almost all your coding this semester happens.

<!--
If lab sessions handle installation separately, this slide can be a preview/pointer rather than a live walkthrough — check the lab schedule.
-->

---

## Part 2: Computers, Data, and How They Fit Together

---

### 💡 Concept

A computer is **hardware** (physical: CPU, memory, sensors) driven by **software** (instructions you write — Python, Aspen, Excel).

Hardware gets faster and cheaper every year or two — this is **Moore's Law**.

---

### 💡 Concept — The Data Hierarchy

Bits build up into everything a computer stores:

**Bit → Byte → Field → Record → File → Database → Big Data**

Each level is just a meaningful grouping of the level below it.

---

### 🔍 Example

A student record: `("Ali Raza", "Chemical Eng.", 3.42)`

- Each **character** (A, l, i, …) is built from **bits**
- The name, major, GPA are each a **field**
- All three fields together = one **record**
- All students' records together = a **file** / **database**

---

### ✍️ Your Turn (4 min)

With a neighbor:

1. Name **2 hardware** and **2 software** components in a lab instrument you've used (e.g. a pH meter, a GC).
2. Where would "today's reactor temperature reading" sit in the data hierarchy — field, record, or file?

<!--
Answer key: temperature reading alone = a field; combined with timestamp + sensor ID = a record; a day's worth = a file. Accept reasonable variations — the point is the mental model, not one "correct" answer.
-->

---

### 💬 Check

Poll: *"Moore's Law says computing power roughly doubles every ___ months."*
A) 6  B) 18–24  C) 60  D) It doesn't change

<!--
Answer: B (18-24 months). Cold-call one pair on their hardware/software example before revealing.
-->

---

## Part 3: From Machine Code to Python

---

### 💡 Concept

Programming languages sit on a spectrum: **machine language** (raw 0s/1s) → **assembly** (symbolic shorthand) → **high-level languages** like Python (near-English).

Higher level = easier for humans, translated for you by a compiler/interpreter.

---

### 💡 Concept — Thinking in Objects

Python is **object-oriented**: data (attributes) and behavior (methods) are bundled into reusable **classes**.

A car's engineering drawing = a *class*. An actual car you drive = an *object* (instance).

---

### 🔍 Example

Same task, three languages:

```
+1300042774              # machine language
load basepay              # assembly
add overpay
store grosspay
grossPay = basePay + overTimePay   # high-level (Python-like)
```

Pressing the gas pedal = calling a **method** on the car **object**.

---

### ✍️ Your Turn (5 min)

Think-pair-share: pick **one object** from a chemical plant (a pump, a tank, a sensor).

- What would its **attributes** be?
- What would its **methods** (actions) be?

<!--
Example answer for a "Tank" object: attributes = capacity, current_level, fluid_type; methods = fill(), drain(), check_level(). Push students past "it just holds liquid" toward specific attribute/method names.
-->

---

### 💬 Check

Cold-call 2 pairs to share their object. Ask the room: *does everyone agree these are attributes, not methods (or vice versa)?*

<!--
Common mix-up: students list an action as an "attribute" (e.g., "pumping" instead of a pump() method). Use it to reinforce attribute = state/data, method = action/behavior.
-->

---

## Part 4: Why Python?

---

### 💡 Concept

Python is popular because it's **readable, free, and backed by libraries** that do the hard work for you — you rarely start from scratch.

"It's the libraries!" — you write a few lines; the library does the heavy lifting.

---

### 🔍 Example — Libraries You'll Use This Semester

| Library | What it's for |
|---|---|
| **NumPy** | fast numerical arrays |
| **Pandas** | tabular data (like a spreadsheet in code) |
| **Matplotlib** | plots and charts |
| **scikit-learn** | machine learning |

---

### ✍️ Your Turn (4 min)

Match each chemical engineering task to the library that fits best (NumPy / Pandas / Matplotlib / scikit-learn):

1. Plotting a titration curve
2. Cleaning a CSV of reactor sensor logs
3. Predicting yield from process conditions
4. Doing fast matrix math for a mass-balance model

<!--
Answer key: 1-Matplotlib, 2-Pandas, 3-scikit-learn, 4-NumPy. Note some accept multiple reasonable answers (e.g. Pandas can also plot) — the goal is the mental map, not rote memorization.
-->

---

### 💬 Check

Poll: *"Which library would you reach for first to clean messy data before analysis?"* A) NumPy B) Pandas C) Matplotlib D) scikit-learn

<!--
Answer: B (Pandas).
-->

---

## Part 5: Hands-On — Meet IPython & Jupyter

---

### 💡 Concept

You'll write Python two ways this semester:

- **IPython** — type a snippet, see the result immediately (like a calculator)
- **Jupyter Notebook** — cells of code + text + output, in your browser

---

### 🔍 Example — IPython as a Calculator

```python
In [1]: 45 + 72
Out[1]: 117

In [2]: 5 * (12.7 - 4) / 2
Out[2]: 21.75
```

Parentheses force evaluation order — just like in math.

---

### ✍️ Your Turn (8 min) — Hands-on

Open Jupyter (or IPython in your terminal) and evaluate:

1. `5 * (3 + 4)`
2. `5 * 3 + 4`
3. `10 / 3` and `10 // 3` — what's the difference?

Be ready to say **why** (1) and (2) give different answers.

<!--
Answer key: (1) = 35, (2) = 19 — parentheses change order of operations.
10 / 3 = 3.333... (true division), 10 // 3 = 3 (floor/integer division).
Circulate and watch for students confusing / and // — that's the main misconception to catch here.
-->

---

### 💬 Check

Cold-call 2-3 students for their answers to `5 * (3 + 4)` vs `5 * 3 + 4`, and ask one to explain `//` vs `/` in their own words.

---

## Part 6: The Connected World

---

### 💡 Concept

Internet → World Wide Web → Cloud → Internet of Things (IoT) form the pipeline that generates today's **Big Data**: huge in **Volume**, fast-moving (**Velocity**), many formats (**Variety**), and of varying trustworthiness (**Veracity**).

---

### 🔍 Example — Case Study: Waze

Every phone = a streaming IoT sensor. Waze combines millions of these real-time GPS streams (Big Data) with AI to predict the fastest route — and re-routes you the moment conditions change.

---

### ✍️ Your Turn (4 min)

Think-pair-share: name **one IoT device** you personally interact with daily.

- What data does it likely send?
- Which of the 4 V's (Volume/Velocity/Variety/Veracity) matters most for it?

<!--
Examples students might give: fitness tracker (Velocity - continuous stream), smart thermostat (Variety - temp + schedule + weather data), smart meter (Volume - readings across a whole grid).
-->

---

### 💬 Check

Poll: *"For a hospital's real-time patient heart-rate monitors, which of the 4 V's matters most?"* A) Volume B) Velocity C) Variety D) Veracity

<!--
Defensible answers are Velocity (must process fast, near real-time) or Veracity (a wrong reading is dangerous) — use this to show that "it depends on context," not one memorized answer.
-->

---

## Part 7: AI — Where CS Meets Data Science

---

### 💡 Concept

AI is what happens when a computer **learns from data** instead of being told exact steps for every case. Machine learning, deep learning, and reinforcement learning are all forms of this.

---

### 🔍 Example — Milestones That Made AI Real

- **1997** — IBM DeepBlue beats world chess champion Kasparov
- **2011** — IBM Watson wins *Jeopardy!* against top human players
- **2015–2017** — AlphaGo, then AlphaZero, master Go and chess through self-play

---

### ✍️ Your Turn (4 min)

Think-pair-share: pick a chemical engineering process you've studied (distillation, reactor design, a plant utility).

Where could an AI system that "learns from data" add value there?

<!--
Example answers: predictive maintenance on pumps/compressors from sensor data, soft-sensors that estimate hard-to-measure quality variables, optimizing reflux ratio from historical plant data. Accept any reasonably justified answer.
-->

---

### 💬 Check

Cold-call 2 pairs. Push back gently: *"Is that really learning from data, or just automating a fixed rule?"* — the distinction matters for the AI module later in the course.

---

### Recap — Today's Arc

Hardware + software → data hierarchy → **machine code to Python** → **why Python** (libraries) → **hands-on** IPython/Jupyter → Internet/Cloud/IoT → **Big Data** → **AI**

One thread: computers process data, and Python is the tool you'll use to make that useful for engineering.

---

<!-- _class: title -->

# Next Class

### Week 2 — Python Basics: variables, input/output, arithmetic operators

Bring a laptop with Python + Jupyter installed and working.

Course project proposal due **Week 4** — start thinking about your team now.
