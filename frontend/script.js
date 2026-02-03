// Scientific Calculator Implementation

(function () {
  "use strict";

  // Utility Functions
  const toRadians = (deg) => (deg * Math.PI) / 180;

  // Operator Definitions
  const operators = {
    "+": { precedence: 2, associativity: "left", func: (a, b) => a + b },
    "-": { precedence: 2, associativity: "left", func: (a, b) => a - b },
    "*": { precedence: 3, associativity: "left", func: (a, b) => a * b },
    "/": { precedence: 3, associativity: "left", func: (a, b) => a / b },
    "^": { precedence: 4, associativity: "right", func: (a, b) => Math.pow(a, b) },
    "u-": { precedence: 5, associativity: "right", func: (a) => -a }, // unary minus
  };

  // Supported Functions
  const functions = {
    sin: (x, degMode) => Math.sin(degMode ? toRadians(x) : x),
    cos: (x, degMode) => Math.cos(degMode ? toRadians(x) : x),
    tan: (x, degMode) => Math.tan(degMode ? toRadians(x) : x),
    asin: (x) => Math.asin(x),
    acos: (x) => Math.acos(x),
    atan: (x) => Math.atan(x),
    log: (x) => Math.log10(x),
    ln: (x) => Math.log(x),
    exp: (x) => Math.exp(x),
    sqrt: (x) => Math.sqrt(x),
    factorial: (x) => {
      if (x < 0 || !Number.isInteger(x)) throw new Error("Factorial only for non‑negative integers");
      let res = 1;
      for (let i = 2; i <= x; i++) res *= i;
      return res;
    },
  };

  // Memory Slots (10 slots)
  const MEMORY_KEY = "calc_memory";
  let memory = Array(10).fill(0);
  const loadMemory = () => {
    const stored = localStorage.getItem(MEMORY_KEY);
    if (stored) memory = JSON.parse(stored);
  };
  const saveMemory = () => localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));

  // Angle Mode
  let degMode = false;
  const toggleAngleMode = () => {
    degMode = !degMode;
    document.querySelector("button[data-action='angle']").textContent = degMode ? "Rad" : "Deg";
  };

  // Theme
  const THEME_KEY = "calc_theme";
  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  };
  const toggleTheme = () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  };

  // Toast for Errors
  const toastEl = document.getElementById("error-toast");
  const showToast = (msg) => {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    setTimeout(() => {
      toastEl.hidden = true;
    }, 3000);
  };

  // Expression Handling
  let expression = "";
  const exprEl = document.getElementById("expression");
  const resultEl = document.getElementById("result");

  const updateDisplay = () => {
    exprEl.textContent = expression;
  };

  const appendToExpression = (value) => {
    expression += value;
    updateDisplay();
  };

  const clearExpression = () => {
    expression = "";
    resultEl.textContent = "";
    updateDisplay();
  };

  const backspace = () => {
    expression = expression.slice(0, -1);
    updateDisplay();
  };

  // Tokenization
  const tokenize = (expr) => {
    const tokens = [];
    const regex = /\d*\.?\d+|[a-zA-Z]+|[()+\-*/^]/g;
    let match;
    while ((match = regex.exec(expr)) !== null) {
      tokens.push(match[0]);
    }
    return tokens;
  };

  // Shunting Yard Algorithm
  const toPostfix = (tokens) => {
    const output = [];
    const stack = [];
    let prevToken = null;
    for (const token of tokens) {
      if (parseFloat(token) + 0 === token * 1) {
        output.push(token);
      } else if (token in functions) {
        stack.push(token);
      } else if (token === ",") {
        while (stack.length && stack[stack.length - 1] !== "(") {
          output.push(stack.pop());
        }
        if (!stack.length) throw new Error("Misplaced comma or mismatched parentheses");
      } else if (token in operators) {
        const op = token === "-" && (prevToken === null || prevToken in operators || prevToken === "(") ? "u-" : token;
        const o1 = operators[op];
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top in operators) {
            const o2 = operators[top];
            if ((o1.associativity === "left" && o1.precedence <= o2.precedence) ||
                (o1.associativity === "right" && o1.precedence < o2.precedence)) {
              output.push(stack.pop());
              continue;
            }
          }
          break;
        }
        stack.push(op);
      } else if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length && stack[stack.length - 1] !== "(") {
          output.push(stack.pop());
        }
        if (!stack.length) throw new Error("Mismatched parentheses");
        stack.pop(); // Remove "(")
        if (stack.length && stack[stack.length - 1] in functions) {
          output.push(stack.pop());
        }
      } else {
        throw new Error(`Unknown token: ${token}`);
      }
      prevToken = token;
    }
    while (stack.length) {
      const op = stack.pop();
      if (op === "(" || op === ")") throw new Error("Mismatched parentheses");
      output.push(op);
    }
    return output;
  };

  // Postfix Evaluation
  const evaluatePostfix = (postfix) => {
    const stack = [];
    for (const token of postfix) {
      if (parseFloat(token) + 0 === token * 1) {
        stack.push(parseFloat(token));
      } else if (token in operators) {
        if (token === "u-") {
          const a = stack.pop();
          stack.push(operators[token].func(a));
        } else {
          const b = stack.pop();
          const a = stack.pop();
          stack.push(operators[token].func(a, b));
        }
      } else if (token in functions) {
        const a = stack.pop();
        stack.push(functions[token](a, degMode));
      } else {
        throw new Error(`Unknown token in evaluation: ${token}`);
      }
    }
    if (stack.length !== 1) throw new Error("Invalid Expression");
    return stack[0];
  };

  const evaluateExpression = () => {
    try {
      const tokens = tokenize(expression);
      const postfix = toPostfix(tokens);
      const value = evaluatePostfix(postfix);
      resultEl.textContent = value.toString();
    } catch (e) {
      showToast(e.message);
      resultEl.textContent = "";
    }
  };

  // Memory Operations
  const memoryAdd = (index) => {
    const val = parseFloat(resultEl.textContent);
    if (!isNaN(val)) memory[index] += val;
    saveMemory();
  };
  const memorySubtract = (index) => {
    const val = parseFloat(resultEl.textContent);
    if (!isNaN(val)) memory[index] -= val;
    saveMemory();
  };
  const memoryRecall = (index) => {
    expression = memory[index].toString();
    updateDisplay();
  };
  const memoryClear = (index) => {
    memory[index] = 0;
    saveMemory();
  };

  // Event Listeners
  const init = () => {
    loadMemory();
    const savedTheme = localStorage.getItem(THEME_KEY) || "light";
    applyTheme(savedTheme);

    // Button Clicks
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        const value = btn.dataset.value;
        if (action) {
          switch (action) {
            case "equals":
              evaluateExpression();
              break;
            case "angle":
              toggleAngleMode();
              break;
            case "theme":
              toggleTheme();
              break;
            case "mc":
              memory.forEach((_, i) => memoryClear(i));
              break;
            case "mr":
              memoryRecall(0); // default to slot 0 for simplicity
              break;
            case "m+":
              memoryAdd(0);
              break;
            case "m-":
              memorySubtract(0);
              break;
            default:
              break;
          }
        } else if (value) {
          appendToExpression(value);
        }
      });
    });

    // Keyboard Input
    window.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        evaluateExpression();
      } else if (e.key === "Escape") {
        clearExpression();
      } else if (e.key === "Backspace") {
        backspace();
      } else {
        const key = e.key;
        const numKeys = "0123456789";
        const ops = "+-*/^().";
        if (numKeys.includes(key)) {
          appendToExpression(key);
        } else if (ops.includes(key)) {
          appendToExpression(key);
        } else {
          const funcMap = {
            s: "sin(",
            c: "cos(",
            t: "tan(",
            a: "asin(",
            o: "acos(",
            r: "atan(",
            l: "log(",
            n: "ln(",
            e: "exp(",
            q: "sqrt(",
            f: "factorial(",
          };
          if (funcMap[key]) appendToExpression(funcMap[key]);
        }
      }
    });
  };

  document.addEventListener("DOMContentLoaded", init);
})();