// Generated automatically by nearley, version 2.19.1
// http://github.com/Hardmath123/nearley
(function() {
  function id(x) {
    return x[0];
  }
  var grammar = {
    Lexer: undefined,
    ParserRules: [
      {
        name: "konami",
        symbols: ["combo", "__", "konami"],
        postprocess: function(d) {
          const items = [d[0], ...(d[2].konami || [d[2]])];
          const string = items.map(i => i.string).join(" ");
          const maxKeys = items.map(i => i.maxKeys).reduce((a, b) => a + b, 0);
          return { konami: items, maxKeys, string };
        }
      },
      {
        name: "konami",
        symbols: ["or"],
        postprocess: function(d) {
          return d[0];
        }
      },
      {
        name: "or",
        symbols: ["combo", { literal: "|" }, "or"],
        postprocess: function(d) {
          const items = [d[0], ...(d[2].or || [d[2]])];
          const string = items.map(i => i.string).join("|");
          const maxKeys = Math.max(...items.map(i => i.maxKeys));
          return { or: items, maxKeys, string };
        }
      },
      {
        name: "or",
        symbols: ["combo"],
        postprocess: function(d) {
          return d[0];
        }
      },
      {
        name: "combo",
        symbols: ["not", { literal: "+" }, "combo"],
        postprocess: function(d) {
          const items = [d[0], ...(d[2].combo || [d[2]])];
          const string = items.map(i => i.string).join("+");
          const maxKeys = items.map(i => i.maxKeys).reduce((a, b) => a + b, 0);
          return { combo: items, maxKeys, string };
        }
      },
      {
        name: "combo",
        symbols: ["not"],
        postprocess: function(d) {
          return d[0];
        }
      },
      {
        name: "not",
        symbols: [{ literal: "!" }, "not"],
        postprocess: function(d) {
          return {
            not: d[1],
            maxKeys: d[1].maxKeys,
            string: `!${d[1].string}`
          };
        }
      },
      {
        name: "not",
        symbols: ["p"],
        postprocess: function(d) {
          return d[0];
        }
      },
      {
        name: "p",
        symbols: [{ literal: "(" }, "konami", { literal: ")" }],
        postprocess: function(d) {
          return { ...d[1], string: `(${d[1].string})` };
        }
      },
      {
        name: "p",
        symbols: ["key"],
        postprocess: function(d) {
          return d[0];
        }
      },
      { name: "key$subexpression$1", symbols: ["escapedChar"] },
      { name: "key$subexpression$1", symbols: ["any"] },
      {
        name: "key",
        symbols: ["key$subexpression$1"],
        postprocess: function(d) {
          return { key: d[0][0], maxKeys: 1, string: d[0][0] };
        }
      },
      {
        name: "escapedChar",
        symbols: [{ literal: "\\" }, /[()|!+]/],
        postprocess: function(d) {
          return d[1];
        }
      },
      { name: "any$ebnf$1", symbols: [/[^()|!+\s]/] },
      {
        name: "any$ebnf$1",
        symbols: ["any$ebnf$1", /[^()|!+\s]/],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        }
      },
      {
        name: "any",
        symbols: ["any$ebnf$1"],
        postprocess: function(d) {
          return d[0].join("");
        }
      },
      { name: "__$ebnf$1", symbols: [/[\s]/] },
      {
        name: "__$ebnf$1",
        symbols: ["__$ebnf$1", /[\s]/],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        }
      },
      {
        name: "__",
        symbols: ["__$ebnf$1"],
        postprocess: function(d) {
          return d[0].join("");
        }
      }
    ],
    ParserStart: "konami"
  };
  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();

export default module.exports;
