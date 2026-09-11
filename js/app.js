(function () {
  "use strict";
  var app = document.getElementById("app"),
    activeQuiz = null,
    examTimer = null;
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function chapter(id) {
    return OCP.chapters.find(function (c) {
      return c.id === Number(id);
    });
  }
  function allPlanned() {
    return OCP.plannedChapters.map(function (p) {
      return { id: p.id, title: p.title, chapter: chapter(p.id) };
    });
  }
  function progress() {
    var qs = Quiz.all(),
      answered = qs.filter(function (q) {
        return Store.question(q.id).attempts;
      }),
      correct = answered.reduce(function (n, q) {
        return n + Store.question(q.id).correct;
      }, 0);
    return {
      answered: answered.length,
      total: qs.length,
      correct: correct,
      pct: answered.length
        ? Math.round(
            (correct /
              answered.reduce(function (n, q) {
                return n + Store.question(q.id).attempts;
              }, 0)) *
              100,
          )
        : 0,
    };
  }
  function bar(value) {
    return (
      '<div class="progress"><span style="width:' +
      Math.min(100, value || 0) +
      '%"></span></div>'
    );
  }
  function layout(html, title) {
    app.innerHTML =
      '<div class="view-head"><div><p class="eyebrow">OCP Java SE 17 · 1Z0-829</p><h1>' +
      title +
      "</h1></div></div>" +
      html;
    app.focus();
  }
  function renderDashboard() {
    var p = progress(),
      cards = allPlanned()
        .map(function (x) {
          if (!x.chapter)
            return (
              '<article class="card muted-card"><span class="badge">Coming soon</span><h2>' +
              x.id +
              ". " +
              esc(x.title) +
              "</h2><p>Content will be added as the study guide grows.</p></article>"
            );
          var qs = x.chapter.questions || [],
            attempts = qs.reduce(function (n, q) {
              return n + Store.question(q.id).attempts;
            }, 0),
            correct = qs.reduce(function (n, q) {
              return n + Store.question(q.id).correct;
            }, 0),
            read = (Store.get().notesRead[x.id] || []).length,
            notes = (x.chapter.notes || []).length,
            gotchas = (x.chapter.gotchas || []).length,
            traps = (x.chapter.traps || []).length;
          return (
            '<article class="card"><div class="card-top"><span class="badge">Chapter ' +
            x.id +
            '</span><span class="small">' +
            read +
            "/" +
            notes +
            " notes</span></div><h2>" +
            esc(x.chapter.title) +
            '</h2><p class="small">Objectives: ' +
            x.chapter.objectiveIds.join(", ") +
            '</p><p class="small">' +
            notes +
            " note sections · " +
            gotchas +
            " gotchas · " +
            traps +
            " traps · " +
            qs.length +
            " questions</p>" +
            bar(attempts ? (correct / attempts) * 100 : 0) +
            '<p class="small">' +
            attempts +
            " attempts · " +
            (attempts ? Math.round((correct / attempts) * 100) : 0) +
            '% correct</p><a class="button" href="#/ch/' +
            x.id +
            '">Start</a></article>'
          );
        })
        .join("");
    var weak = Quiz.all()
      .map(function (q) {
        var s = Store.question(q.id);
        return {
          q: q,
          pct: s.attempts ? s.correct / s.attempts : 1,
          attempts: s.attempts,
        };
      })
      .filter(function (x) {
        return x.attempts >= 3;
      })
      .sort(function (a, b) {
        return a.pct - b.pct;
      })
      .slice(0, 5);
    layout(
      '<section class="hero card"><div><p class="eyebrow">Your study dashboard</p><h2>Build confidence, one question at a time.</h2><p>Review notes, learn from traps, and keep your exam readiness visible.</p></div><div class="hero-actions"><a class="button primary" href="' +
        esc(Store.get().lastRoute || "#/ch/3") +
        '">Resume</a><a class="button" href="#/quiz/mixed">Mixed review</a><a class="button" href="#/exam">Mock exam</a></div></section><section class="stats"><div class="stat"><strong>' +
        p.answered +
        '</strong><span>Questions attempted</span></div><div class="stat"><strong>' +
        p.pct +
        '%</strong><span>Overall accuracy</span></div><div class="stat"><strong>' +
        (Store.get().exams || []).length +
        '</strong><span>Mock exams</span></div></section><section class="section-heading"><h2>Chapters</h2><div class="button-row"><a class="button" href="#/quiz/missed">Retry missed</a><a class="button" href="#/flashcards">Flashcards</a><a class="button" href="#/coverage">Coverage matrix</a></div></section><section class="cards">' +
        cards +
        '</section><section class="split"><div class="card"><h2>Weak areas</h2>' +
        (weak.length
          ? '<ul class="link-list">' +
            weak
              .map(function (x) {
                return (
                  '<li><a href="#/quiz/ch/' +
                  (
                    OCP.chapters.find(function (c) {
                      return c.questions.indexOf(x.q) >= 0;
                    }) || {}
                  ).id +
                  '">' +
                  esc(x.q.id) +
                  "</a><span>" +
                  Math.round(x.pct * 100) +
                  "%</span></li>"
                );
              })
              .join("") +
            "</ul>"
          : '<p class="muted">Complete three attempts on a question to see weak areas.</p>') +
        '</div><div class="card"><h2>Exam history</h2>' +
        ((Store.get().exams || []).length
          ? Store.get()
              .exams.slice(-5)
              .reverse()
              .map(function (e) {
                return (
                  '<p class="history"><strong>' +
                  e.score +
                  "/" +
                  e.total +
                  "</strong> · " +
                  (e.passed ? "Passed" : "Keep practicing") +
                  "<span>" +
                  new Date(e.date).toLocaleDateString() +
                  "</span></p>"
                );
              })
              .join("")
          : '<p class="muted">Your mock exam results will appear here.</p>') +
        "</div></section>",
      "Dashboard",
    );
  }
  function renderChapter(id, tab) {
    var c = chapter(id);
    if (!c) return renderNotFound();
    tab = tab || "notes";
    var tabs = [
      ["notes", "Notes"],
      ["gotchas", "Gotchas"],
      ["traps", "Code traps"],
      ["quiz", "Quiz"],
      ["checklist", "Checklist"],
    ];
    var body = "";
    if (tab === "notes")
      body =
        '<div class="notes-layout"><aside class="toc"><h3>Sections</h3>' +
        c.notes
          .map(function (n) {
            var read = (Store.get().notesRead[c.id] || []).indexOf(n.id) >= 0;
            return (
              '<a class="' +
              (read ? "read" : "") +
              '" href="#note-' +
              n.id +
              '">' +
              (read ? "✓ " : "") +
              esc(n.title) +
              "</a>"
            );
          })
          .join("") +
        '</aside><div class="note-content">' +
        c.notes
          .map(function (n) {
            var read = (Store.get().notesRead[c.id] || []).indexOf(n.id) >= 0;
            return (
              '<article id="note-' +
              n.id +
              '" class="note card"><div class="card-top"><h2>' +
              esc(n.title) +
              '</h2><button class="button small-button mark-note" data-note="' +
              esc(n.id) +
              '">' +
              (read ? "Marked read" : "Mark read") +
              "</button></div>" +
              renderMarkdown(n.md, { headingOffset: 1 }) +
              "</article>"
            );
          })
          .join("") +
        "</div></div>";
    if (tab === "gotchas")
      body =
        '<div class="cards">' +
        (c.gotchas || [])
          .map(function (g) {
            return (
              '<article class="card"><h2>' +
              esc(g.title) +
              "</h2>" +
              renderMarkdown(g.md) +
              "</article>"
            );
          })
          .join("") +
        "</div>";
    if (tab === "traps")
      body =
        '<div class="trap-list">' +
        (c.traps || [])
          .map(function (t, i) {
            return (
              '<article class="card trap"><h2>Trap ' +
              (i + 1) +
              "</h2>" +
              highlightJava(t.code) +
              "<p>" +
              renderMarkdown(t.prompt) +
              '</p><button class="button reveal" data-trap="' +
              i +
              '">Reveal</button><div class="reveal-answer hidden">' +
              renderMarkdown(t.answer) +
              "</div></article>"
            );
          })
          .join("") +
        "</div>";
    if (tab === "quiz")
      body =
        '<article class="card"><h2>Chapter quiz</h2><p>' +
        (c.questions || []).length +
        ' placeholder questions are available.</p><a class="button primary" href="#/quiz/ch/' +
        c.id +
        '">Start quiz</a></article>';
    if (tab === "checklist")
      body =
        '<article class="card checklist">' +
        (c.checklist || [])
          .map(function (item, i) {
            var checked =
              Store.get().checklist[c.id] && Store.get().checklist[c.id][i];
            return (
              '<label><input type="checkbox" data-check="' +
              i +
              '" ' +
              (checked ? "checked" : "") +
              "> " +
              esc(item) +
              "</label>"
            );
          })
          .join("") +
        "</article>";
    layout(
      '<p class="lead">' +
        renderMarkdown(c.intro) +
        '</p><div class="tabs">' +
        tabs
          .map(function (t) {
            return (
              '<a class="' +
              (tab === t[0] ? "active" : "") +
              '" href="#/ch/' +
              c.id +
              "/" +
              t[0] +
              '">' +
              t[1] +
              "</a>"
            );
          })
          .join("") +
        "</div>" +
        body,
      c.id + ". " + c.title,
    );
    app.querySelectorAll(".mark-note").forEach(function (b) {
      b.onclick = function () {
        Store.toggleNote(c.id, b.dataset.note);
        renderChapter(c.id, "notes");
      };
    });
    app.querySelectorAll(".reveal").forEach(function (b) {
      b.onclick = function () {
        b.nextElementSibling.classList.toggle("hidden");
        b.textContent = b.nextElementSibling.classList.contains("hidden")
          ? "Reveal"
          : "Hide";
      };
    });
    app.querySelectorAll("[data-check]").forEach(function (b) {
      b.onchange = function () {
        Store.checklist(c.id, b.dataset.check, b.checked);
      };
    });
    if (window.IntersectionObserver) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var note = entry.target.id.slice(5),
                read = Store.get().notesRead[c.id] || [];
              if (read.indexOf(note) < 0) {
                Store.toggleNote(c.id, note);
                entry.target.querySelector(".mark-note").textContent =
                  "Marked read";
              }
            }
          });
        },
        { threshold: 0.6 },
      );
      app.querySelectorAll(".note").forEach(function (note) {
        observer.observe(note);
      });
    }
  }
  function renderQuiz(mode, id) {
    var questions =
      mode === "ch"
        ? Quiz.forChapter(id)
        : mode === "missed"
          ? Quiz.missed()
          : Quiz.mixed();
    if (!questions.length)
      return layout(
        '<article class="card empty"><h2>No questions here yet</h2><p>Try another review mode.</p><a class="button" href="#/">Back to dashboard</a></article>',
        "Quiz",
      );
    activeQuiz = {
      questions: questions,
      index: 0,
      answers: {},
      checked: false,
      exam: false,
    };
    renderQuestion();
  }
  function renderQuestion() {
    var q = activeQuiz.questions[activeQuiz.index],
      chosen = activeQuiz.answers[q.id] || [],
      checked = activeQuiz.checked,
      record = Store.question(q.id),
      instantAnswers = !!Store.get().instantAnswers,
      questionText = q.question.replace(/\s*\(Choose all that apply\.\)/, ""),
      isCorrect =
        checked &&
        chosen.length === q.answer.length &&
        chosen.every(function (x) {
          return q.answer.indexOf(x) >= 0;
        });
    var opts = q.options
      .map(function (o, i) {
        var selected = chosen.indexOf(i) >= 0,
          cls =
            checked && q.answer.indexOf(i) >= 0
              ? " correct"
              : checked && selected
                ? " incorrect"
                : "";
        return (
          '<label class="option' +
          cls +
          '"><input type="' +
          (q.type === "multi" ? "checkbox" : "radio") +
          '" name="answer" value="' +
          i +
          '" ' +
          (selected ? "checked" : "") +
          " " +
          (checked ? "disabled" : "") +
          '><span class="option-letter">' +
          String.fromCharCode(65 + i) +
          "</span><span>" +
          renderMarkdown(o) +
          (checked && q.optionNotes && q.optionNotes[i]
            ? "<small>" + renderMarkdown(q.optionNotes[i]) + "</small>"
            : "") +
          "</span>" +
          (checked
            ? q.answer.indexOf(i) >= 0
              ? '<span class="verdict verdict-correct">✓ Correct</span>'
              : selected
                ? '<span class="verdict verdict-wrong">✗ Your pick</span>'
                : ""
            : "") +
          "</label>"
        );
      })
      .join("");
    var footer = checked
      ? '<div class="feedback ' +
        (isCorrect ? "success" : "danger") +
        '"><strong>' +
        (isCorrect ? "Correct" : "Not quite") +
        "</strong>" +
        renderMarkdown(q.explanation) +
        '</div><button class="button primary" id="nextQuestion">' +
        (activeQuiz.index + 1 === activeQuiz.questions.length
          ? "Finish"
          : "Next") +
        "</button>"
      : '<button class="button primary" id="checkAnswer" ' +
        (chosen.length ? "" : "disabled") +
        ">" +
        (instantAnswers ? "Submit" : "Check") +
        "</button>";
    layout(
      '<div class="quiz-meta"><span>Question ' +
        (activeQuiz.index + 1) +
        " of " +
        activeQuiz.questions.length +
        "</span><span>" +
        q.difficulty +
        '</span><label class="toggle"><input type="checkbox" id="instantToggle" ' +
        (instantAnswers ? "checked" : "") +
        '> Instant answers</label><button class="bookmark ' +
        (record.bookmarked ? "on" : "") +
        '" id="bookmark">★</button></div><article class="quiz-card card"><div class="question">' +
        renderMarkdown(questionText) +
        '<p class="select-hint">Select ' +
        (q.type === "multi" ? q.answer.length : 1) +
        (q.type === "multi" ? " options." : " option.") +
        "</p>" +
        "</div>" +
        (q.code ? highlightJava(q.code) : "") +
        '<div class="options">' +
        opts +
        "</div>" +
        footer +
        '</article><p class="keyboard-hint">Keys 1–5 select · Enter submit/next · B bookmark</p>',
      "Quiz",
    );
    app.querySelectorAll("input[name=answer]").forEach(function (input) {
      input.onchange = function () {
        var a = activeQuiz.answers[q.id] || [];
        var n = Number(input.value);
        if (q.type === "single") a = [n];
        else if (input.checked) a.push(n);
        else
          a = a.filter(function (x) {
            return x !== n;
          });
        activeQuiz.answers[q.id] = a;
        var submit = document.getElementById("checkAnswer");
        if (submit) submit.disabled = !a.length;
      };
    });
    document.getElementById("instantToggle").onchange = function () {
      Store.get().instantAnswers = this.checked;
      Store.save();
      renderQuestion();
    };
    document.getElementById("checkAnswer") &&
      (document.getElementById("checkAnswer").onclick = check);
    document.getElementById("nextQuestion") &&
      (document.getElementById("nextQuestion").onclick = function () {
        if (activeQuiz.index + 1 < activeQuiz.questions.length) {
          activeQuiz.index++;
          activeQuiz.checked = false;
          renderQuestion();
        } else renderSummary();
      });
    document.getElementById("bookmark").onclick = function () {
      Store.toggleBookmark(q.id);
      renderQuestion();
    };
  }
  function check() {
    var q = activeQuiz.questions[activeQuiz.index],
      a = activeQuiz.answers[q.id] || [],
      good =
        a.length === q.answer.length &&
        a.every(function (x) {
          return q.answer.indexOf(x) >= 0;
        });
    Store.answered(q.id, a, good);
    activeQuiz.checked = true;
    renderQuestion();
  }
  function renderSummary() {
    var qs = activeQuiz.questions,
      correct = qs.filter(function (q) {
        var s = Store.question(q.id);
        return (
          s.lastAnswer &&
          s.lastAnswer.length === q.answer.length &&
          s.lastAnswer.every(function (x) {
            return q.answer.indexOf(x) >= 0;
          })
        );
      }).length;
    layout(
      '<article class="card"><h2>Review complete</h2><div class="big-score">' +
        correct +
        "/" +
        qs.length +
        "</div><p>" +
        Math.round((correct / qs.length) * 100) +
        '% correct</p><h3>Missed questions</h3><ul class="link-list">' +
        qs
          .filter(function (q) {
            return Store.question(q.id).missedPending;
          })
          .map(function (q) {
            return (
              "<li>" +
              esc(q.id) +
              '<a href="#/quiz/missed">Review missed</a></li>'
            );
          })
          .join("") +
        '</ul><a class="button primary" href="#/">Dashboard</a></article>',
      "Quiz summary",
    );
  }
  function renderExam() {
    activeQuiz = {
      questions: Quiz.exam(),
      index: 0,
      answers: {},
      checked: false,
      exam: true,
      started: Date.now(),
    };
    if (!activeQuiz.questions.length)
      return layout(
        '<article class="card"><h2>No exam questions yet</h2></article>',
        "Mock exam",
      );
    renderExamQuestion();
  }
  function renderExamQuestion() {
    var q = activeQuiz.questions[activeQuiz.index],
      chosen = activeQuiz.answers[q.id] || [],
      questionText = q.question.replace(/\s*\(Choose all that apply\.\)/, "");
    layout(
      '<div class="quiz-meta"><span>Mock exam · ' +
        (activeQuiz.index + 1) +
        "/" +
        activeQuiz.questions.length +
        '</span><strong id="examClock">90:00</strong></div><article class="quiz-card card"><div class="question">' +
        renderMarkdown(questionText) +
        '<p class="select-hint">Select ' +
        (q.type === "multi" ? q.answer.length : 1) +
        (q.type === "multi" ? " options." : " option.") +
        "</p>" +
        "</div>" +
        (q.code ? highlightJava(q.code) : "") +
        '<div class="options">' +
        q.options
          .map(function (o, i) {
            return (
              '<label class="option"><input type="' +
              (q.type === "multi" ? "checkbox" : "radio") +
              '" name="answer" value="' +
              i +
              '" ' +
              (chosen.indexOf(i) >= 0 ? "checked" : "") +
              '><span class="option-letter">' +
              String.fromCharCode(65 + i) +
              "</span><span>" +
              renderMarkdown(o) +
              "</span></label>"
            );
          })
          .join("") +
        '</div><div class="button-row"><button class="button" id="examPrev">Previous</button><button class="button primary" id="examNext">' +
        (activeQuiz.index + 1 === activeQuiz.questions.length
          ? "Submit exam"
          : "Save & next") +
        '</button></div></article><p class="muted">Feedback is hidden until you submit. Leaving this page will ask for confirmation.</p>',
      "Mock exam",
    );
    app.querySelectorAll("input[name=answer]").forEach(function (input) {
      input.onchange = function () {
        var a = activeQuiz.answers[q.id] || [],
          n = Number(input.value);
        if (q.type === "single") a = [n];
        else if (input.checked) a.push(n);
        else
          a = a.filter(function (x) {
            return x !== n;
          });
        activeQuiz.answers[q.id] = a;
      };
    });
    document.getElementById("examPrev").onclick = function () {
      if (activeQuiz.index) {
        activeQuiz.index--;
        renderExamQuestion();
      }
    };
    document.getElementById("examNext").onclick = function () {
      if (activeQuiz.index + 1 < activeQuiz.questions.length) {
        activeQuiz.index++;
        renderExamQuestion();
      } else submitExam();
    };
    clearInterval(examTimer);
    examTimer = setInterval(function () {
      var left = Math.max(
          0,
          5400 - Math.floor((Date.now() - activeQuiz.started) / 1000),
        ),
        el = document.getElementById("examClock");
      if (el)
        el.textContent =
          Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0");
      if (!left) submitExam();
    }, 1000);
  }
  function submitExam() {
    clearInterval(examTimer);
    var qs = activeQuiz.questions,
      correct = 0,
      result = {
        date: new Date().toISOString(),
        score: 0,
        total: qs.length,
        passed: false,
        perArea: {},
      };
    qs.forEach(function (q) {
      var a = activeQuiz.answers[q.id] || [],
        good =
          a.length === q.answer.length &&
          a.every(function (x) {
            return q.answer.indexOf(x) >= 0;
          });
      if (good) correct++;
      Store.answered(q.id, a, good);
    });
    result.score = correct;
    result.passed = correct / qs.length >= 0.68;
    OCP.objectives.forEach(function (area) {
      var ids = area.bullets.map(function (b) {
          return b.id;
        }),
        areaQs = qs.filter(function (q) {
          return (q.objectiveIds || []).some(function (id) {
            return ids.indexOf(id) >= 0;
          });
        });
      if (areaQs.length)
        result.perArea[area.area] = {
          correct: areaQs.filter(function (q) {
            var s = Store.question(q.id);
            return (
              s.lastAnswer.length === q.answer.length &&
              s.lastAnswer.every(function (x) {
                return q.answer.indexOf(x) >= 0;
              })
            );
          }).length,
          total: areaQs.length,
        };
    });
    Store.get().exams.push(result);
    Store.save();
    var breakdown = Object.keys(result.perArea)
      .map(function (name) {
        var x = result.perArea[name];
        return (
          "<li><span>" +
          esc(name) +
          "</span><strong>" +
          x.correct +
          "/" +
          x.total +
          "</strong></li>"
        );
      })
      .join("");
    layout(
      '<article class="card exam-result"><h2>Mock exam review</h2><div class="big-score">' +
        correct +
        "/" +
        qs.length +
        '</div><p class="' +
        (result.passed ? "success-text" : "danger-text") +
        '">' +
        (result.passed ? "Pass · " : "Keep practicing · ") +
        Math.round((correct / qs.length) * 100) +
        '% (68% required)</p><h3>Per-objective-area breakdown</h3><ul class="link-list">' +
        (breakdown ||
          "<li>Not enough objective-tagged questions for a breakdown.</li>") +
        '</ul><p>Every answer has been recorded. Use Retry missed for targeted review.</p><a class="button primary" href="#/">Dashboard</a></article>',
      "Mock exam complete",
    );
    activeQuiz = null;
  }
  function renderFlashcards() {
    var allCards = OCP.chapters.reduce(function (a, c) {
        return a.concat(
          (c.gotchas || []).map(function (g, i) {
            return { key: c.id + ":" + i, chapter: c, gotcha: g };
          }),
        );
      }, []),
      cards = allCards.slice(),
      index = 0,
      flipped = false,
      filter = "all";
    function draw() {
      var x = cards[index] || cards[0];
      if (!x) {
        layout(
          '<article class="card empty"><h2>No flashcards in this chapter yet</h2><p>Choose another chapter or return to all cards.</p></article>',
          "Flashcards",
        );
        return;
      }
      layout(
        '<div class="flash-toolbar"><label>Chapter <select id="flashFilter"><option value="all">All chapters</option>' +
          OCP.chapters
            .filter(function (c) {
              return (c.gotchas || []).length;
            })
            .map(function (c) {
              return (
                '<option value="' +
                c.id +
                '">' +
                c.id +
                ". " +
                esc(c.title) +
                "</option>"
              );
            })
            .join("") +
          '</select></label><button class="button" id="shuffleCards">Shuffle</button></div><article class="flashcard card ' +
          (flipped ? "flipped" : "") +
          '" id="flashcard"><div class="flash-front"><span class="badge">Gotcha</span><h2>' +
          esc(x.gotcha.title) +
          '</h2><p>Think of the exam trap, then flip.</p></div><div class="flash-back"><h2>' +
          esc(x.gotcha.title) +
          "</h2>" +
          renderMarkdown(x.gotcha.md) +
          '</div></article><div class="button-row centered"><button class="button" id="again">Again</button><button class="button primary" id="gotit">Got it</button></div>',
        "Flashcards",
      );
      document.getElementById("flashFilter").value = filter;
      document.getElementById("flashFilter").onchange = function () {
        filter = this.value;
        cards =
          filter === "all"
            ? allCards.slice()
            : allCards.filter(function (card) {
                return String(card.chapter.id) === filter;
              });
        index = 0;
        flipped = false;
        draw();
      };
      document.getElementById("flashcard").onclick = function () {
        flipped = !flipped;
        draw();
      };
      document.getElementById("again").onclick = function () {
        Store.get().flashcards[x.key] = "again";
        Store.save();
        index = (index + 1) % cards.length;
        flipped = false;
        draw();
      };
      document.getElementById("gotit").onclick = function () {
        Store.get().flashcards[x.key] = "got";
        Store.save();
        index = (index + 1) % cards.length;
        flipped = false;
        draw();
      };
      document.getElementById("shuffleCards").onclick = function () {
        cards = cards.sort(function () {
          return Math.random() - 0.5;
        });
        index = 0;
        draw();
      };
    }
    if (!cards.length)
      return layout(
        '<article class="card empty"><h2>No flashcards yet</h2></article>',
        "Flashcards",
      );
    draw();
  }
  function renderCheatsheet() {
    layout(
      '<button class="button print-button" onclick="window.print()">Print</button><div class="cheatsheet">' +
        OCP.cheatsheet
          .map(function (x) {
            return (
              '<article class="card"><h2>' +
              esc(x.title) +
              "</h2>" +
              renderMarkdown(x.md) +
              "</article>"
            );
          })
          .join("") +
        "</div>",
      "Cheat sheet",
    );
  }
  function renderCoverage() {
    var rows = OCP.objectives
      .reduce(function (a, area) {
        return a.concat(
          area.bullets.map(function (b) {
            var cs = OCP.chapters.filter(function (c) {
                return c.objectiveIds.indexOf(b.id) >= 0;
              }),
              notes = cs.reduce(function (n, c) {
                return n + (c.notes || []).length;
              }, 0),
              qs = Quiz.all().filter(function (q) {
                return q.objectiveIds.indexOf(b.id) >= 0;
              }).length;
            return (
              '<tr class="' +
              (!qs ? "uncovered" : "") +
              '"><td><strong>' +
              esc(b.id) +
              "</strong></td><td>" +
              esc(area.area) +
              "</td><td>" +
              esc(b.text) +
              "</td><td>" +
              (cs.length
                ? cs
                    .map(function (c) {
                      return c.id + ". " + esc(c.title);
                    })
                    .join(", ")
                : OCP.plannedChapters
                    .filter(function (p) {
                      return p.objectiveIds.indexOf(b.id) >= 0;
                    })
                    .map(function (p) {
                      return "planned: ch " + p.id;
                    })
                    .join(", ") || "—") +
              "</td><td>" +
              notes +
              "</td><td>" +
              qs +
              "</td></tr>"
            );
          }),
        );
      }, [])
      .join("");
    layout(
      '<div class="table-wrap"><table class="coverage"><thead><tr><th>ID</th><th>Area</th><th>Objective bullet</th><th>Chapters</th><th>Notes</th><th>Questions</th></tr></thead><tbody>' +
        rows +
        "</tbody></table></div>",
      "Coverage matrix",
    );
  }
  function renderSearch(query) {
    var q = (query || "").toLowerCase(),
      results = [];
    OCP.chapters.forEach(function (c) {
      (c.notes || []).forEach(function (n) {
        if ((n.title + n.md).toLowerCase().indexOf(q) >= 0)
          results.push(
            '<li><a href="#/ch/' +
              c.id +
              '/notes">' +
              esc(n.title) +
              "</a><span>Chapter " +
              c.id +
              " · note</span></li>",
          );
      });
      (c.questions || []).forEach(function (x) {
        if ((x.question + x.id).toLowerCase().indexOf(q) >= 0)
          results.push(
            '<li><a href="#/quiz/ch/' +
              c.id +
              '">' +
              esc(x.id) +
              "</a><span>Chapter " +
              c.id +
              " · question</span></li>",
          );
      });
    });
    layout(
      '<form id="inlineSearch" class="search-large"><input name="q" value="' +
        esc(query) +
        '" placeholder="Search notes and questions"><button class="button primary">Search</button></form><ul class="results">' +
        (results.length ? results.join("") : "<li>No results found.</li>") +
        "</ul>",
      "Search",
    );
    document.getElementById("inlineSearch").onsubmit = function (e) {
      e.preventDefault();
      location.hash = "#/search?q=" + encodeURIComponent(e.target.q.value);
    };
  }
  function renderNotFound() {
    layout(
      '<article class="card"><h2>Page not found</h2><a class="button" href="#/">Dashboard</a></article>',
      "Not found",
    );
  }
  function settings() {
    var old = document.getElementById("settingsDialog");
    if (old) old.remove();
    var d = document.createElement("dialog");
    d.id = "settingsDialog";
    d.innerHTML =
      '<form method="dialog"><h2>Settings</h2><label>Theme <select id="themeChoice"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label class="toggle"><input type="checkbox" id="settingsInstant"> Instant answers in practice quizzes</label><button class="button" id="exportProgress">Export progress</button><label class="button file-button">Import progress<input type="file" id="importProgress" accept=".json"></label><button class="button danger-button" id="resetProgress">Reset progress</button><button class="button">Close</button></form>';
    document.body.appendChild(d);
    d.showModal();
    var theme = Store.get().theme || "auto";
    d.querySelector("#themeChoice").value = theme;
    d.querySelector("#settingsInstant").checked = !!Store.get().instantAnswers;
    d.querySelector("#settingsInstant").onchange = function () {
      Store.get().instantAnswers = this.checked;
      Store.save();
    };
    d.querySelector("#themeChoice").onchange = function () {
      applyTheme(this.value);
      Store.setTheme(this.value);
    };
    d.querySelector("#exportProgress").onclick = function () {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([Store.export()], { type: "application/json" }),
      );
      a.download = "ocp17-progress.json";
      a.click();
    };
    d.querySelector("#importProgress").onchange = function (e) {
      var r = new FileReader();
      r.onload = function () {
        try {
          Store.import(JSON.parse(r.result));
          location.reload();
        } catch (x) {
          alert("Invalid progress file.");
        }
      };
      r.readAsText(e.target.files[0]);
    };
    d.querySelector("#resetProgress").onclick = function () {
      if (confirm("Reset all saved progress?")) {
        Store.reset();
        location.reload();
      }
    };
  }
  function applyTheme(theme) {
    document.documentElement.dataset.theme =
      theme === "auto"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;
  }
  function route() {
    var hash = location.hash || "#/";
    if (hash.charAt(1) !== "/") {
      if (app.innerHTML) return;
      hash = "#/";
    }
    var bits = hash.slice(2).split("?"),
      path = bits[0].split("/"),
      query = new URLSearchParams(bits[1] || ""),
      s = Store.get();
    s.lastRoute = hash;
    Store.save();
    if (activeQuiz && activeQuiz.exam && !/^#\/exam/.test(hash)) {
      if (!confirm("Leave this exam? Your current exam answers will be lost."))
        return;
      clearInterval(examTimer);
      activeQuiz = null;
    }
    if (path[0] === "") renderDashboard();
    else if (path[0] === "ch") renderChapter(path[1], path[2]);
    else if (path[0] === "quiz")
      renderQuiz(path[1] === "ch" ? "ch" : path[1], path[2]);
    else if (path[0] === "exam") renderExam();
    else if (path[0] === "flashcards") renderFlashcards();
    else if (path[0] === "cheatsheet") renderCheatsheet();
    else if (path[0] === "coverage") renderCoverage();
    else if (path[0] === "search") renderSearch(query.get("q"));
    else renderNotFound();
  }
  document.getElementById("searchForm").onsubmit = function (e) {
    e.preventDefault();
    location.hash =
      "#/search?q=" +
      encodeURIComponent(document.getElementById("searchInput").value);
  };
  document.getElementById("themeToggle").onclick = function () {
    var next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    Store.setTheme(next);
  };
  document.getElementById("settingsButton").onclick = settings;
  var cs = document.getElementById("chapterSelect");
  OCP.plannedChapters.forEach(function (p) {
    var o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.id + ". " + p.title;
    cs.appendChild(o);
  });
  cs.onchange = function () {
    if (this.value) location.hash = "#/ch/" + this.value;
  };
  applyTheme(Store.get().theme || "auto");
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", function (e) {
    if (!activeQuiz || e.target.matches("input,textarea,select")) return;
    if (/^[1-5]$/.test(e.key) && !activeQuiz.checked) {
      var el = app.querySelectorAll("input[name=answer]")[Number(e.key) - 1];
      if (el) {
        el.click();
      }
    }
    if (e.key.toLowerCase() === "b") {
      var q = activeQuiz.questions[activeQuiz.index];
      Store.toggleBookmark(q.id);
      renderQuestion();
    }
    if (e.key === "Enter") {
      e.preventDefault();
      var b = document.getElementById(
        activeQuiz.checked ? "nextQuestion" : "checkAnswer",
      );
      if (b) b.click();
    }
  });
  route();
})();
