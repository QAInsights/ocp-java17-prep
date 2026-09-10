(function () {
  "use strict";
  var keywords =
    /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|record|return|sealed|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|var|void|volatile|while|yield|permits|non-sealed)\b/g;
  var types = /\b[A-Z][A-Za-z0-9_]*\b/g;
  function esc(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function tokenize(source) {
    var out = "",
      i = 0;
    while (i < source.length) {
      var rest = source.slice(i),
        m;
      if ((m = rest.match(/^(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/))) {
        out += '<span class="tok-comment">' + esc(m[0]) + "</span>";
        i += m[0].length;
        continue;
      }
      if (
        (m = rest.match(
          /^(?:"""[\s\S]*?"""|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])')/,
        ))
      ) {
        out += '<span class="tok-string">' + esc(m[0]) + "</span>";
        i += m[0].length;
        continue;
      }
      if (
        (m = rest.match(/^\b(?:\d+(?:\.\d+)?[fFdDlL]?|0[xX][\da-fA-F]+)\b/))
      ) {
        out += '<span class="tok-number">' + m[0] + "</span>";
        i += m[0].length;
        continue;
      }
      if ((m = rest.match(/^@[A-Za-z][\w.]*/))) {
        out += '<span class="tok-annotation">' + esc(m[0]) + "</span>";
        i += m[0].length;
        continue;
      }
      if ((m = rest.match(/^[A-Za-z_$][\w$]*/))) {
        var cls = keywords.test(m[0])
          ? "tok-keyword"
          : /^[A-Z]/.test(m[0])
            ? "tok-type"
            : "";
        keywords.lastIndex = 0;
        out += cls
          ? '<span class="' + cls + '">' + m[0] + "</span>"
          : esc(m[0]);
        i += m[0].length;
        continue;
      }
      out += esc(source[i++]);
    }
    return out;
  }
  window.highlightJava = function (source) {
    var lines = String(source || "").split("\n");
    return (
      '<pre class="code"><code>' +
      lines
        .map(function (line) {
          return '<span class="code-line">' + tokenize(line) + "</span>";
        })
        .join("\n") +
      "</code></pre>"
    );
  };
})();
