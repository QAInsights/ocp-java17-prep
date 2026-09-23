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
  var copyIcon =
    '<svg class="copy-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
  var checkIcon =
    '<svg class="check-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>';

  function wrapCode(innerHtml) {
    return (
      '<div class="code-block">' +
      '<button class="copy-btn" type="button" aria-label="Copy code to clipboard" title="Copy code">' +
      copyIcon +
      checkIcon +
      '<span class="copy-text">Copy</span>' +
      "</button>" +
      '<pre class="code"><code>' +
      innerHtml +
      "</code></pre></div>"
    );
  }
  window.wrapCodeBlock = wrapCode;

  window.highlightJava = function (source) {
    var lines = String(source || "").replace(/\r/g, "").split("\n");
    var codeHtml = lines
      .map(function (line) {
        return '<span class="code-line">' + tokenize(line) + "</span>";
      })
      .join("\n");
    return wrapCode(codeHtml);
  };

  function fallbackCopy(text) {
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";
        ta.style.opacity = "0";
        ta.setAttribute("readonly", "");
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error("Copy command failed"));
      } catch (err) {
        reject(err);
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return fallbackCopy(text);
      });
    }
    return fallbackCopy(text);
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var block = btn.closest(".code-block");
    if (!block) return;
    var codeEl = block.querySelector("code");
    if (!codeEl) return;

    var text = codeEl.textContent;
    copyText(text)
      .then(function () {
        btn.classList.add("copied");
        var textEl = btn.querySelector(".copy-text");
        if (textEl) textEl.textContent = "Copied!";
        clearTimeout(btn._resetTimer);
        btn._resetTimer = setTimeout(function () {
          btn.classList.remove("copied");
          if (textEl) textEl.textContent = "Copy";
        }, 2000);
      })
      .catch(function (err) {
        console.error("Failed to copy code: ", err);
      });
  });
})();
