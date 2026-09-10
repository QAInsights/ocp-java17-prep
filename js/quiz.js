(function () {
  "use strict";
  function allQuestions() {
    return OCP.chapters.reduce(function (a, c) {
      return a.concat(c.questions || []);
    }, []);
  }
  function shuffle(a) {
    return a.slice().sort(function () {
      return Math.random() - 0.5;
    });
  }
  window.Quiz = {
    all: allQuestions,
    forChapter: function (id) {
      var c = OCP.chapters.find(function (x) {
        return x.id === Number(id);
      });
      return c ? (c.questions || []).slice() : [];
    },
    missed: function () {
      return allQuestions().filter(function (q) {
        return Store.question(q.id).missedPending;
      });
    },
    mixed: function () {
      return shuffle(allQuestions());
    },
    exam: function () {
      var all = allQuestions();
      if (all.length <= 50) return shuffle(all);
      var chapters = OCP.chapters.filter(function (c) {
        return c.questions && c.questions.length;
      });
      var pools = chapters.map(function (c) {
          return shuffle(c.questions);
        }),
        out = [],
        cursor = 0;
      while (out.length < 50) {
        var added = false;
        pools.forEach(function (pool) {
          if (pool[cursor]) {
            out.push(pool[cursor]);
            added = true;
          }
        });
        if (!added) {
          cursor = 0;
          break;
        }
        cursor++;
      }
      return shuffle(out.slice(0, 50));
    },
  };
})();
