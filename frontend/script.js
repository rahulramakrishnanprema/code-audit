// Scientific Calculator – Vanilla JS Implementation
// --------------------------------------------------------
// This script provides:
//   • Expression parsing via the Shunting‑Yard algorithm
//   • Evaluation of RPN with support for scientific functions
//   • Angle mode (Deg / Rad) handling
//   • Simple memory (M+, M-, MR, MC)
//   • Theme switching (light / dark)
//   • Keyboard shortcuts and full accessibility support
// --------------------------------------------------------

(() => {
  // ---------- State ----------
  let expression = '';
  let angleMode = 'DEG'; // or 'RAD'
  let memory = 0;
  const displayEl = document.getElementById('display');
  const errorToast = document.getElementById('error-toast');

  // ---------- Utility Functions ----------
  const setError = (msg) => {
    errorToast.textContent = msg;
    errorToast.hidden = false;
    setTimeout(() => (errorToast.hidden = true), 3000);
  };

  const updateDisplay = () => {
    displayEl.value = expression || '0';
  };

  const pushToExpression = (str) => {
    expression += str;
    updateDisplay();
  };

  const clearExpression = () => {
    expression = '';
    updateDisplay();
  };

  const backspace = () => {
    expression = expression.slice(0, -1);
    updateDisplay();
  };

  const toggleAngleMode = () => {
    angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
    document.getElementById('angle-toggle').textContent = angleMode;
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('calc-theme', next);
    // Update icon
    document.getElementById('theme-toggle').textContent = next === 'dark' ? '☀️' : '🌙';
  };

  const loadTheme = () => {
    const saved = localStorage.getItem('calc-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      document.getElementById('theme-toggle').textContent = saved === 'dark' ? '☀️' : '🌙';
    }
  };

  // ---------- Memory Operations ----------
  const memClear = () => {
    memory = 0;
  };

  const memRecall = () => {
    expression += memory.toString();
    updateDisplay();
  };

  const memAdd = () => {
    const val = evaluateExpression(false);
    if (val !== null) memory += val;
  };

  const memSub = () => {
    const val = evaluateExpression(false);
    if (val !== null) memory -= val;
  };

  // ---------- Tokenizer ----------
  const tokenRegex = /[A-Za-z]+|\d*\.?\d+|[+\-*/^(),!]/g;

  const isOperator = (t) => '+-*/^'.includes(t);
  const isFunction = (t) => ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'exp', 'factorial'].includes(t);
  const precedence = {
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
    '^': 4,
  };
  const associativity = {
    '+': 'L',
    '-': 'L',
    '*': 'L',
    '/': 'L',
    '^': 'R',
  };

  // ---------- Shunting‑Yard Algorithm ----------
  const toRPN = (expr) => {
    const output = [];
    const stack = [];
    const tokens = expr.match(tokenRegex) || [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (parseFloat(token).toString() === token) {
        output.push(token);
      } else if (isFunction(token)) {
        stack.push(token);
      } else if (token === ',') {
        // function argument separator – not used here but kept for completeness
        while (stack.length && stack[stack.length - 1] !== '(') {
          output.push(stack.pop());
        }
        if (!stack.length) setError('Misplaced comma');
      } else if (isOperator(token)) {
        while (
          stack.length &&
          isOperator(stack[stack.length - 1]) &&
          ((associativity[token] === 'L' && precedence[token] <= precedence[stack[stack.length - 1]]) ||
            (associativity[token] === 'R' && precedence[token] < precedence[stack[stack.length - 1]]))
        ) {
          output.push(stack.pop());
        }
        stack.push(token);
      } else if (token === '(') {
        stack.push(token);
      } else if (token === ')') {
        while (stack.length && stack[stack.length - 1] !== '(') {
          output.push(stack.pop());
        }
        if (!stack.length) {
          setError('Mismatched parentheses');
          return null;
        }
        stack.pop(); // pop '('
        if (stack.length && isFunction(stack[stack.length - 1])) {
          output.push(stack.pop());
        }
      } else if (token === '!') {
        // factorial as a postfix operator
        output.push('factorial');
      } else {
        setError(`Unknown token: ${token}`);
        return null;
      }
    }
    while (stack.length) {
      const op = stack.pop();
      if (op === '(' || op === ')') {
        setError('Mismatched parentheses');
        return null;
      }
      output.push(op);
    }
    return output;
  };

  // ---------- RPN Evaluation ----------
  const evalRPN = (rpn) => {
    const stack = [];
    for (const token of rpn) {
      if (parseFloat(token).toString() === token) {
        stack.push(parseFloat(token));
      } else if (isOperator(token)) {
        if (stack.length < 2) {
          setError('Insufficient values');
          return null;
        }
        const b = stack.pop();
        const a = stack.pop();
        let res;
        switch (token) {
          case '+':
            res = a + b;
            break;
          case '-':
            res = a - b;
            break;
          case '*':
            res = a * b;
            break;
          case '/':
            if (b === 0) {
              setError('Division by zero');
              return null;
            }
            res = a / b;
            break;
          case '^':
            res = Math.pow(a, b);
            break;
          default:
            setError(`Unsupported operator ${token}`);
            return null;
        }
        stack.push(res);
      } else if (isFunction(token)) {
        if (stack.length < 1) {
          setError('Insufficient values for function');
          return null;
        }
        const val = stack.pop();
        let res;
        switch (token) {
          case 'sin':
            res = Math.sin(toRadians(val));
            break;
          case 'cos':
            res = Math.cos(toRadians(val));
            break;
          case 'tan':
            res = Math.tan(toRadians(val));
            break;
          case 'asin':
            res = fromRadians(Math.asin(val));
            break;
          case 'acos':
            res = fromRadians(Math.acos(val));
            break;
          case 'atan':
            res = fromRadians(Math.atan(val));
            break;
          case 'log':
            if (val <= 0) {
              setError('Logarithm of non‑positive number');
              return null;
            }
            res = Math.log10(val);
            break;
          case 'ln':
            if (val <= 0) {
              setError('Natural log of non‑positive number');
              return null;
            }
            res = Math.log(val);
            break;
          case 'sqrt':
            if (val < 0) {
              setError('Square root of negative number');
              return null;
            }
            res = Math.sqrt(val);
            break;
          case 'exp':
            res = Math.exp(val);
            break;
          case 'factorial':
            if (val < 0 || !Number.isInteger(val)) {
              setError('Factorial only defined for non‑negative integers');
              return null;
            }
            res = factorial(val);
            break;
          default:
            setError(`Unsupported function ${token}`);
            return null;
        }
        stack.push(res);
      } else {
        setError(`Unknown token during evaluation: ${token}`);
        return null;
      }
    }
    if (stack.length !== 1) {
      setError('Invalid expression');
      return null;
    }
    return stack[0];
  };

  const factorial = (n) => {
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  };

  const toRadians = (val) => (angleMode === 'DEG' ? (val * Math.PI) / 180 : val);
  const fromRadians = (val) => (angleMode === 'DEG' ? (val * 180) / Math.PI : val);

  // ---------- Evaluation Wrapper ----------
  const evaluateExpression = (showResult = true) => {
    if (!expression) return null;
    const rpn = toRPN(expression);
    if (!rpn) return null;
    const result = evalRPN(rpn);
    if (result === null) return null;
    if (showResult) {
      expression = Number.isFinite(result) ? result.toString() : 'Error';
      updateDisplay();
    }
    return result;
  };

  // ---------- Button Handlers ----------
  const handleButtonClick = (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    switch (action) {
      case 'digit':
        pushToExpression(value);
        break;
      case 'decimal':
        pushToExpression('.');
        break;
      case 'operator':
        pushToExpression(` ${value} `);
        break;
      case 'paren':
        pushToExpression(value);
        break;
      case 'func':
        pushToExpression(`${value}(`);
        break;
      case 'constant':
        if (value === 'π') pushToExpression(Math.PI.toString());
        else if (value === 'e') pushToExpression(Math.E.toString());
        break;
      case 'sign':
        // Toggle sign of the last number entered
        toggleSign();
        break;
      case 'clear':
        clearExpression();
        break;
      case 'backspace':
        backspace();
        break;
      case 'evaluate':
        evaluateExpression();
        break;
      case 'mem-clear':
        memClear();
        break;
      case 'mem-recall':
        memRecall();
        break;
      case 'mem-add':
        memAdd();
        break;
      case 'mem-sub':
        memSub();
        break;
      default:
        break;
    }
  };

  const toggleSign = () => {
    // Find the last number in the expression and toggle its sign
    const match = expression.match(/(-?\d*\.?\d+)(?!.*-?\d*\.?\d+)/);
    if (!match) return;
    const number = match[0];
    const start = match.index;
    const toggled = number.startsWith('-') ? number.slice(1) : '-' + number;
    expression = expression.slice(0, start) + toggled + expression.slice(start + number.length);
    updateDisplay();
  };

  // ---------- Keyboard Support ----------
  const keyMap = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '.': '.',
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    '^': '^',
    Enter: 'evaluate',
    '=': 'evaluate',
    Backspace: 'backspace',
    Delete: 'clear',
    '(' : '(',
    ')' : ')',
    '!': 'factorial',
    's': 'sin',
    'c': 'cos',
    't': 'tan',
    'l': 'log',
    'n': 'ln',
    'r': 'sqrt',
    'e': 'exp',
    'p': 'π',
    'm': 'mem-recall',
    'M': 'mem-add',
    'Shift+M': 'mem-sub',
    'd': 'angle-toggle',
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    if (e.ctrlKey || e.metaKey) return; // ignore shortcuts
    if (keyMap[key] !== undefined) {
      e.preventDefault();
      const mapped = keyMap[key];
      if (mapped.length === 1 && /[0-9.]/.test(mapped)) {
        pushToExpression(mapped);
      } else if (mapped === 'evaluate') {
        evaluateExpression();
      } else if (mapped === 'backspace') {
        backspace();
      } else if (mapped === 'clear') {
        clearExpression();
      } else if (mapped === 'angle-toggle') {
        toggleAngleMode();
      } else if (mapped === 'mem-recall') {
        memRecall();
      } else if (mapped === 'mem-add') {
        memAdd();
      } else if (mapped === 'mem-sub') {
        memSub();
      } else if (mapped === 'π') {
        pushToExpression(Math.PI.toString());
      } else if (mapped === 'factorial') {
        pushToExpression('!');
      } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'exp'].includes(mapped)) {
        pushToExpression(`${mapped}(`);
      } else if (['+', '-', '*', '/', '^', '(', ')'].includes(mapped)) {
        pushToExpression(` ${mapped} `);
      }
    }
  };

  // ---------- Initialization ----------
  const init = () => {
    document.querySelector('.keypad').addEventListener('click', handleButtonClick);
    document.getElementById('angle-toggle').addEventListener('click', toggleAngleMode);
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.addEventListener('keydown', handleKeyDown);
    loadTheme();
    updateDisplay();
  };

  // Run init after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();