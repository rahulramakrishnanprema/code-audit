// Vanilla Scientific Calculator – Core Logic
// -------------------------------------------------
// This script handles:
//   • UI updates (display, button states)
//   • Expression building & validation
//   • Evaluation with support for trig, log, sqrt, power, modulo
//   • Angle mode (Deg / Rad)
//   • Memory operations (M+, M-, MR, MC)
//   • Keyboard shortcuts
//   • Light/Dark theme toggle

(() => {
  // ------------------- State -------------------
  let expression = ""; // raw expression shown to user
  let angleMode = "deg"; // or "rad"
  let memory = 0; // numeric memory storage

  // ------------------- DOM refs -------------------
  const displayEl = document.getElementById("display");
  const buttons = document.querySelectorAll(".btn");
  const themeToggle = document.getElementById("theme-toggle");
  const angleToggle = document.getElementById("angle-toggle");

  // ------------------- Helper Functions -------------------
  const setDisplay = (text) => {
    // Escape any potential HTML (defensive – we only set textContent)
    displayEl.textContent = text;
  };

  const appendToExpression = (value) => {
    // Prevent two consecutive operators (except for '-' which can be unary)
    const operators = ["+", "-", "*", "/", "%", "^" ];
    const lastChar = expression.slice(-1);
    if (operators.includes(value) && operators.includes(lastChar) && !(value === "-" && lastChar !== "-")) {
      // Replace the last operator with the new one
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
    setDisplay(expression);
  };

  const clearExpression = () => {
    expression = "";
    setDisplay("0");
  };

  const deleteLast = () => {
    expression = expression.slice(0, -1);
    setDisplay(expression || "0");
  };

  const toggleAngle = () => {
    angleMode = angleMode === "deg" ? "rad" : "deg";
    angleToggle.textContent = angleMode === "deg" ? "Deg" : "Rad";
    angleToggle.setAttribute("aria-pressed", angleMode === "rad");
  };

  const toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    themeToggle.textContent = isDark ? "☀️ Light" : "🌙 Dark";
    themeToggle.setAttribute("aria-pressed", isDark);
  };

  // ------------------- Evaluation Logic -------------------
  const sanitize = (expr) => {
    // Allow only numbers, operators, parentheses, decimal point and supported function names
    // This simple whitelist prevents code injection via Function constructor.
    const allowed = /[^0-9+\-*/%^().,\s]|(sin|cos|tan|log|ln|sqrt)/gi;
    // Remove any characters not allowed (they will be caught later as syntax error)
    return expr.replace(/[^0-9+\-*/%^().,\s]|(sin|cos|tan|log|ln|sqrt)/gi, (match) => {
      // Keep allowed function names, strip everything else
      return /^(sin|cos|tan|log|ln|sqrt)$/i.test(match) ? match : "";
    });
  };

  const toRadians = (deg) => deg * (Math.PI / 180);

  const evaluateExpression = () => {
    if (!expression) return;
    try {
      // Replace user‑friendly symbols with JS equivalents
      let expr = expression
        .replace(/÷/g, "/")
        .replace(/×/g, "*")
        .replace(/√/g, "sqrt")
        .replace(/%/g, "%")
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString());

      // Insert explicit multiplication where needed (e.g., 2sin(30) → 2*sin(30))
      expr = expr.replace(/(\d)(sin|cos|tan|log|ln|sqrt)/g, "$1*$2");
      expr = expr.replace(/(\))(sin|cos|tan|log|ln|sqrt)/g, "$1*$2");
      expr = expr.replace(/(sin|cos|tan|log|ln|sqrt)\(/g, "$1(");

      // Convert trig functions to use Math and handle angle mode
      const trigWrapper = (fnName, arg) => {
        const rad = angleMode === "deg" ? `toRadians(${arg})` : arg;
        return `Math.${fnName}(${rad})`;
      };

      expr = expr.replace(/sin\(([^)]+)\)/gi, (_, a) => trigWrapper('sin', a));
      expr = expr.replace(/cos\(([^)]+)\)/gi, (_, a) => trigWrapper('cos', a));
      expr = expr.replace(/tan\(([^)]+)\)/gi, (_, a) => trigWrapper('tan', a));
      expr = expr.replace(/log\(([^)]+)\)/gi, (_, a) => `Math.log10(${a})`);
      expr = expr.replace(/ln\(([^)]+)\)/gi, (_, a) => `Math.log(${a})`);
      expr = expr.replace(/sqrt\(([^)]+)\)/gi, (_, a) => `Math.sqrt(${a})`);

      // Power operator '^' → Math.pow
      expr = expr.replace(/([0-9\.]+)\^([0-9\.]+)/g, (_, base, exp) => `Math.pow(${base},${exp})`);

      // Final sanitisation – remove any leftover unsafe characters
      expr = sanitize(expr);

      // eslint-disable-next-line no-new-func
      const result = Function('toRadians', `"use strict"; return (${expr});`)(toRadians);

      // Round to avoid floating point noise (12 decimal places max)
      const rounded = Number.isFinite(result) ? Number(result.toFixed(12)) : "Error";
      setDisplay(rounded);
      expression = String(rounded);
    } catch (e) {
      setDisplay("Error");
      expression = "";
    }
  };

  // ------------------- Memory Functions -------------------
  const memoryAdd = () => {
    const val = parseFloat(displayEl.textContent);
    if (!isNaN(val)) memory += val;
  };

  const memorySubtract = () => {
    const val = parseFloat(displayEl.textContent);
    if (!isNaN(val)) memory -= val;
  };

  const memoryRecall = () => {
    setDisplay(memory);
    expression = String(memory);
  };

  const memoryClear = () => {
    memory = 0;
  };

  // ------------------- Event Handlers -------------------
  const handleButtonClick = (e) => {
    const action = e.target.getAttribute("data-action");
    if (!action) return;
    switch (action) {
      case "clear":
        clearExpression();
        break;
      case "delete":
        deleteLast();
        break;
      case "=":
        evaluateExpression();
        break;
      case "M+":
        memoryAdd();
        break;
      case "M-":
        memorySubtract();
        break;
      case "MR":
        memoryRecall();
        break;
      case "MC":
        memoryClear();
        break;
      default:
        // Functions like sin, cos, sqrt, log, ln are treated as normal input
        appendToExpression(action);
    }
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    if (key === "Enter") {
      e.preventDefault();
      evaluateExpression();
    } else if (key === "Escape") {
      clearExpression();
    } else if (key === "Backspace") {
      deleteLast();
    } else if (key === "Delete") {
      clearExpression();
    } else if (key === "ArrowUp") {
      // Toggle angle mode with ArrowUp for quick access
      toggleAngle();
    } else if (key === "ArrowDown") {
      // Theme toggle with ArrowDown
      toggleTheme();
    } else if (/^[0-9]$/.test(key)) {
      appendToExpression(key);
    } else if (/[+\-*/%^().]/.test(key)) {
      // Map keyboard symbols to our internal representation
      const map = {
        "+": "+",
        "-": "-",
        "*": "*",
        "/": "/",
        "%": "%",
        "^": "^",
        "(": "(",
        ")": ")",
        ".": "."
      };
      appendToExpression(map[key]);
    } else if (key.toLowerCase() === "s") {
      // Shortcut for sin
      appendToExpression("sin");
    } else if (key.toLowerCase() === "c") {
      appendToExpression("cos");
    } else if (key.toLowerCase() === "t") {
      appendToExpression("tan");
    } else if (key.toLowerCase() === "l") {
      appendToExpression("log");
    } else if (key.toLowerCase() === "n") {
      appendToExpression("ln");
    } else if (key.toLowerCase() === "r") {
      // r toggles angle mode (deg/rad)
      toggleAngle();
    } else if (key.toLowerCase() === "m") {
      // m toggles theme
      toggleTheme();
    }
  };

  // ------------------- Initialization -------------------
  const init = () => {
    // Set initial display
    setDisplay("0");

    // Button listeners
    buttons.forEach((btn) => btn.addEventListener("click", handleButtonClick));

    // Control listeners
    themeToggle.addEventListener("click", toggleTheme);
    angleToggle.addEventListener("click", toggleAngle);

    // Keyboard listener
    document.addEventListener("keydown", handleKeyDown);
  };

  // Run init on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();