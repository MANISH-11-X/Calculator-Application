import React, { useState, useEffect, useRef } from "react";

export default function MinimalScientificCalculator() {
  const [expr, setExpr] = useState("");
  const [output, setOutput] = useState("");
  const [degMode, setDegMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scope = {
    sin: (x) => (degMode ? Math.sin((x * Math.PI) / 180) : Math.sin(x)),
    cos: (x) => (degMode ? Math.cos((x * Math.PI) / 180) : Math.cos(x)),
    tan: (x) => (degMode ? Math.tan((x * Math.PI) / 180) : Math.tan(x)),
    asin: (x) => (degMode ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
    acos: (x) => (degMode ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
    atan: (x) => (degMode ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
    ln: (x) => Math.log(x),
    log: (x) => Math.log10(x),
    sqrt: (x) => Math.sqrt(x),
    abs: (x) => Math.abs(x),
    exp: (x) => Math.exp(x),
    pow: (a, b) => Math.pow(a, b),
    pi: Math.PI,
    e: Math.E,
  };

  const isExpressionSafe = (s) => {
    const blacklist = /(window|global|process|constructor|require|module|Function|while|for|=>|\bnew\b)/i;
    if (blacklist.test(s)) return false;
    return /^[0-9A-Za-z+\-*/%^()., _]*$/.test(s);
  };

  const evaluateExpr = (raw) => {
    if (!raw || raw.trim() === "") return "";
    if (!isExpressionSafe(raw)) return "Error";
    let transformed = raw.replace(/\^/g, "**");
    transformed = transformed.replace(/(\d)\s*([a-zA-Z(])/g, "$1*$2");
    transformed = transformed.replace(/([)a-zA-Z])\s*(\d)/g, "$1*$2");
    const paramNames = Object.keys(scope);
    const paramValues = Object.values(scope);
    try {
      const func = new Function(...paramNames, `return (${transformed})`);
      const result = func(...paramValues);
      if (typeof result === "number" && !Number.isFinite(result)) return "Math Error";
      return String(result);
    } catch (e) {
      return "Error";
    }
  };

  const handleButton = (v) => {
    switch (v) {
      case "C":
        setExpr("");
        setOutput("");
        break;
      case "⌫":
        setExpr((s) => s.slice(0, -1));
        break;
      case "=": {
        const res = evaluateExpr(expr);
        if (res !== "Error" && res !== "Math Error" && res !== "") {
          setHistory((h) => [{ in: expr, out: res }, ...h].slice(0, 20));
          setOutput(res);
          setExpr(res);
        } else {
          setOutput(res);
        }
        break;
      }
      case "±":
        setExpr((s) => {
          if (!s) return "-";
          const m = s.match(/(.*?)([-]?\d*\.?\d+)$/);
          if (!m) return s;
          const [_, head, num] = m;
          if (num.startsWith("-")) return head + num.slice(1);
          return head + "(" + "-" + num + ")";
        });
        break;
      default:
        setExpr((s) => s + v);
        break;
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    const allowed = "0123456789+-*/()^.,%";
    if (e.key === "Enter") {
      e.preventDefault();
      handleButton("=");
      return;
    }
    if (e.key === "Backspace") {
      handleButton("⌫");
      return;
    }
    if (e.key.length === 1 && (allowed.includes(e.key) || /[a-zA-Z]/.test(e.key))) {
      setExpr((s) => s + e.key);
    }
  };

  const buttons = [
    ["C", "( ", ")", "⌫"],
    ["sin(", "cos(", "tan(", "^"],
    ["ln(", "log(", "sqrt(", "%"],
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["0", ".", "±", "+"],
    ["pi", "e", "pow(", "="]
  ];

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} min-h-screen p-4`}>
      <div className={`max-w-md mx-auto mt-8 p-4 ${darkMode ? "bg-gray-800" : "bg-white/90"} backdrop-blur-md rounded-2xl shadow-lg grid gap-4`}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Minimal Scientific Calculator</h1>
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={degMode}
                onChange={() => setDegMode((d) => !d)}
                className="w-4 h-4"
              />
              <span>{degMode ? "DEG" : "RAD"}</span>
            </label>
            <button
              onClick={() => setDarkMode((d) => !d)}
              className={`px-2 py-1 rounded ${darkMode ? "bg-gray-600 text-white" : "bg-gray-200 text-black"}`}
            >
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} rounded-xl p-3 grid gap-2`}>
          <input
            ref={inputRef}
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type expression or use buttons"
            className={`bg-transparent outline-none text-right text-xl font-mono ${darkMode ? "text-white" : "text-black"}`}
          />
          <div className={`text-right text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{output}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {buttons.flat().map((b) => (
            <button
              key={b}
              onClick={() => handleButton(b)}
              className={`py-3 rounded-xl text-sm font-medium shadow-sm transition-transform active:scale-95 ${
                b === "=" ? "col-span-1 bg-indigo-600 text-white" : darkMode ? "bg-gray-600 text-white" : "bg-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="max-h-32 overflow-auto text-sm">
          {history.length === 0 ? (
            <div className={darkMode ? "text-gray-400" : "text-gray-500"}>No history yet</div>
          ) : (
            history.map((h, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-dashed">
                <div className="font-mono">{h.in}</div>
                <div className="font-semibold">{h.out}</div>
              </div>
            ))
          )}
        </div>

        <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tip: functions accept parentheses. Example: <code>2*sin(30)+ln(5)</code></div>
      </div>
    </div>
  );
}
