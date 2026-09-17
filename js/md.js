(function () {
  "use strict";
  function escape(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function inline(s) {
    return escape(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  }
  window.renderMarkdown = function (md, options) {
    var headingOffset = (options && options.headingOffset) || 0;
    var lines = String(md || "")
        .replace(/\r/g, "")
        .split("\n"),
      out = [],
      i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (/^```/.test(line)) {
        var lang = line.slice(3).trim(),
          code = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i]))
          code.push(lines[i++]);
        i++;
        out.push(
          lang === "java"
            ? highlightJava(code.join("\n"))
            : '<pre class="code"><code>' +
                escape(code.join("\n")) +
                "</code></pre>",
        );
        continue;
      }
      if (!line.trim()) {
        i++;
        continue;
      }
      var heading = line.match(/^(#{1,3})\s+(.+)/);
      if (heading) {
        var headingLevel = Math.min(6, heading[1].length + headingOffset);
        out.push(
          "<h" +
            headingLevel +
            ">" +
            inline(heading[2]) +
            "</h" +
            headingLevel +
            ">",
        );
        i++;
        continue;
      }
      if (/^>\s?/.test(line)) {
        out.push(
          "<blockquote>" + inline(line.replace(/^>\s?/, "")) + "</blockquote>",
        );
        i++;
        continue;
      }
      if (
        /^\|/.test(line) &&
        i + 1 < lines.length &&
        /^\s*\|?[\s:-]+/.test(lines[i + 1])
      ) {
        var rows = [];
        while (i < lines.length && /^\|/.test(lines[i])) {
          rows.push(
            lines[i]
              .trim()
              .replace(/^\||\|$/g, "")
              .replace(/\\\|/g, "\u0001")
              .split("|")
              .map(function (x) {
                return x.replace(/\u0001/g, "|").trim();
              }),
          );
          i++;
        }
        out.push(
          '<div class="table-wrap"><table><thead><tr>' +
            rows[0]
              .map(function (x) {
                return "<th>" + inline(x) + "</th>";
              })
              .join("") +
            "</tr></thead><tbody>" +
            rows
              .slice(2)
              .map(function (r) {
                return (
                  "<tr>" +
                  r
                    .map(function (x) {
                      return "<td>" + inline(x) + "</td>";
                    })
                    .join("") +
                  "</tr>"
                );
              })
              .join("") +
            "</tbody></table></div>",
        );
        continue;
      }
      if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
        var ordered = /^\d+\./.test(line),
          items = [];
        while (
          i < lines.length &&
          (ordered ? /^\d+\.\s+/.test(lines[i]) : /^[-*]\s+/.test(lines[i]))
        )
          items.push(
            lines[i++].replace(ordered ? /^\d+\.\s+/ : /^[-*]\s+/, ""),
          );
        out.push(
          "<" +
            (ordered ? "ol" : "ul") +
            ">" +
            items
              .map(function (x) {
                return "<li>" + inline(x) + "</li>";
              })
              .join("") +
            "</" +
            (ordered ? "ol" : "ul") +
            ">",
        );
        continue;
      }
      var para = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{1,3})\s|^```|^>|^[-*]\s+|^\d+\.\s+|\|/.test(lines[i])
      )
        para.push(lines[i++]);
      out.push("<p>" + inline(para.join("\n").replace(/\n/g, "<br>")) + "</p>");
    }
    return out.join("");
  };
})();
