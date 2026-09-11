(function () {
  "use strict";
  var key = "ocp17.state.v1",
    timer;
  var initial = function () {
    return {
      theme: "",
      lastRoute: "#/",
      questions: {},
      notesRead: {},
      checklist: {},
      flashcards: {},
      exams: [],
      instantAnswers: false,
    };
  };
  var state;
  try {
    state = JSON.parse(localStorage.getItem(key)) || initial();
  } catch (e) {
    state = initial();
  }
  function save() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      localStorage.setItem(key, JSON.stringify(state));
    }, 100);
  }
  window.Store = {
    get: function () {
      return state;
    },
    save: save,
    question: function (id) {
      return (
        state.questions[id] ||
        (state.questions[id] = {
          attempts: 0,
          correct: 0,
          lastAnswer: [],
          bookmarked: false,
          missedPending: false,
        })
      );
    },
    answered: function (id, answer, correct) {
      var q = this.question(id);
      q.attempts++;
      q.correct += correct ? 1 : 0;
      q.lastAnswer = answer;
      q.missedPending = !correct;
      if (correct) q.missedPending = false;
      save();
    },
    toggleBookmark: function (id) {
      var q = this.question(id);
      q.bookmarked = !q.bookmarked;
      save();
      return q.bookmarked;
    },
    toggleNote: function (ch, id) {
      var list = state.notesRead[ch] || (state.notesRead[ch] = []),
        n = list.indexOf(id);
      if (n < 0) list.push(id);
      else list.splice(n, 1);
      save();
    },
    checklist: function (ch, idx, value) {
      var list = state.checklist[ch] || (state.checklist[ch] = []);
      list[idx] = value;
      save();
    },
    setTheme: function (theme) {
      state.theme = theme;
      save();
    },
    export: function () {
      return JSON.stringify(state, null, 2);
    },
    import: function (value) {
      state = Object.assign(initial(), value);
      save();
    },
    reset: function () {
      state = initial();
      save();
    },
  };
})();
