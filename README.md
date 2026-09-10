# OCP Java 17 Prep

An offline-first, plain HTML/CSS/JavaScript study companion for the Oracle Certified Professional Java SE 17 exam (1Z0-829). It has no build step, npm dependencies, or CDN dependencies.

## Run

Open `index.html` directly in a browser, or serve the directory:

```sh
python3 -m http.server 8765
```

Then visit <http://localhost:8765/#/>.

## Add a chapter

Create a `data/chNN.js` classic script and load it from `index.html`. Register one object with `OCP.registerChapter`:

```js
OCP.registerChapter({
  id: 3,
  slug: 'making-decisions',
  title: 'Making Decisions',
  objectiveIds: ['2'],
  intro: 'Markdown',
  notes: [{ id: 'section', title: 'Section', md: 'Markdown with ```java fences' }],
  gotchas: [{ title: 'Trap', md: 'Markdown' }],
  traps: [{ code: 'java source', prompt: 'Does it compile?', answer: 'Markdown' }],
  questions: [{
    id: 'ch03-q01', type: 'single', difficulty: 'easy',
    question: 'Markdown', code: null, options: ['A', 'B'],
    answer: [0], explanation: 'Why', optionNotes: {},
    tags: ['topic'], objectiveIds: ['2'], verify: null
  }],
  checklist: ['I can explain the topic']
});
```

Keep question IDs unique and use objective IDs from `data/index.js`. Add the new script to `index.html` before `js/app.js`.

## Validate snippets

The validator uses only Node.js and the JDK; it validates the data schema and compiles/runs every question with a `verify` block:

```sh
node tools/validate-snippets.mjs
```

JDK 17's `javac` must be available on `PATH`.

## Content coverage

The coverage matrix is available at [`#/coverage`](#/coverage). It audits every
exam objective bullet against authored chapters, notes, and questions. The
planned chapter coverage is:

1. Building Blocks → `1a`
2. Operators → `1a`
3. Making Decisions → `2`
4. Core APIs → `1a`, `1b`, `1c`, `5` (arrays)
5. Methods → `3b`, `3c`, `3d`, `12b`
6. Class Design → `3a`, `3b`, `3e`
7. Beyond Classes → `3e`, `3f`, `3g`, `3a`
8. Lambdas & Functional Interfaces → `3f`, `6a`
9. Collections & Generics → `5`, `12c`
10. Streams → `6a`, `6b`
11. Exceptions & Localization → `4`, `11`, `12a`
12. Modules → `7a`, `7b`
13. Concurrency → `8a`, `8b`, `8c`
14. I/O & NIO.2 → `9a`, `9b`, `9c`
15. JDBC → `10`
