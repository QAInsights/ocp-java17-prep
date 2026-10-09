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
  var LIST_ITEM = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
  function renderList(items) {
    var html = "",
      stack = [];
    items.forEach(function (item) {
      var top = stack[stack.length - 1];
      while (top && item.indent < top.indent) {
        html += "</li></" + stack.pop().tag + ">";
        top = stack[stack.length - 1];
      }
      if (top && item.indent === top.indent && top.tag === item.tag)
        html += "</li><li>";
      else if (top && item.indent === top.indent) {
        html += "</li></" + stack.pop().tag + ">";
        html += "<" + item.tag + "><li>";
        stack.push(item);
      } else {
        html += "<" + item.tag + "><li>";
        stack.push(item);
      }
      html += item.lines.map(inline).join("<br>");
    });
    while (stack.length) html += "</li></" + stack.pop().tag + ">";
    return html;
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
      var fence = line.match(/^\s*```(\w*)/);
      if (fence) {
        var fenceIndent = line.match(/^\s*/)[0].length,
          lang = fence[1],
          code = [],
          dedent = new RegExp("^ {0," + fenceIndent + "}");
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) {
          code.push(lines[i].replace(dedent, ""));
          i++;
        }
        i++;
        out.push(
          lang === "java" && (window.highlightJava || typeof highlightJava !== "undefined")
            ? (window.highlightJava || highlightJava)(code.join("\n"))
            : (window.wrapCodeBlock
                ? window.wrapCodeBlock(escape(code.join("\n")))
                : '<pre class="code"><code>' +
                    escape(code.join("\n")) +
                    "</code></pre>"),
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
          var rowLine = lines[i].trim().replace(/^\||\|$/g, "");
          rowLine = rowLine.replace(/\\\|/g, "\u0001");
          rowLine = rowLine.replace(/(`+)([\s\S]*?)\1/g, function (m, b, code) {
            return b + code.replace(/\|/g, "\u0001") + b;
          });
          var cells = rowLine.split("|").map(function (x) {
            return x.replace(/\u0001/g, "|").trim();
          });
          if (rows.length > 0 && cells.length < rows[0].length) {
            while (cells.length < rows[0].length) cells.push("");
          }
          rows.push(cells);
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
      if (LIST_ITEM.test(line)) {
        var items = [];
        while (
          i < lines.length &&
          lines[i].trim() &&
          !/^\s*```/.test(lines[i])
        ) {
          var li = lines[i].match(LIST_ITEM);
          if (li) {
            items.push({
              indent: li[1].length,
              tag: /\d/.test(li[2]) ? "ol" : "ul",
              lines: [li[3]],
            });
          } else if (items.length && /^\s/.test(lines[i])) {
            items[items.length - 1].lines.push(lines[i].trim());
          } else break;
          i++;
        }
        out.push(renderList(items));
        continue;
      }
      var para = [line];
      i++;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{1,3})\s|^\s*```|^\s*>|^\s*[-*]\s+|^\s*\d+\.\s+|\|/.test(
          lines[i],
        )
      )
        para.push(lines[i++]);
      out.push("<p>" + para.map(inline).join("<br>") + "</p>");
    }
    return out.join("");
  };
})();
