// script.js – Vanilla JavaScript scientific calculator
// All logic is encapsulated in an IIFE to avoid polluting the global scope.

(() => {
  // ==============================
  //   State & Configuration
  // ==============================
  const displayEl = document.getElementById('display');
  const errorEl = document.getElementById('error');
  const memoryDisplayEl = document.getElementById('memory-display');
  const angleToggleBtn = document.getElementById('angle-toggle');
  const themeToggleBtn = document.getElementById('theme-toggle');

  let expression = '';
  let lastAnswer = 0;
  let memory = 0;
  let angleMode = 'DEG'; // or 'RAD'

  // ==============================
  //   Utility Functions
  // ==============================
  const updateDisplay = () => {
    displayEl.value = expression || '0';
  };

  const setError = (msg) => {
    errorEl.textContent = msg;
    setTimeout(() => (errorEl.textContent = ''), 3000);
  };

  const addToExpression = (val) => {
    // Prevent two consecutive operators (except for unary minus/plus)
    const operators = '+-*/^%';
    const lastChar = expression.slice(-1);
    if (operators.includes(val) && operators.includes(lastChar) && val !== '(' && val !== ')') {
      // Replace the last operator with the new one
      expression = expression.slice(0, -1) + val;
    } else {
      expression += val;
    }
    updateDisplay();
  };

  const clearAll = () => {
    expression = '';
    updateDisplay();
    setError('');
  };

  const deleteLast = () => {
    expression = expression.slice(0, -1);
    updateDisplay();
  };

  const toggleAngleMode = () => {
    angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
    angleToggleBtn.textContent = angleMode;
    angleToggleBtn.setAttribute('aria-pressed', angleMode === 'RAD');
  };

  const toggleTheme = () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    themeToggleBtn.setAttribute('aria-pressed', isDark);
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  };

  const handleMemory = (action) => {
    switch (action) {
      case 'MC':
        memory = 0;
        break;
      case 'MR':
        addToExpression(memory.toString());
        return; // avoid updating display twice
      case 'M+':
        memory += Number(lastAnswer);
        break;
      case 'M-':
        memory -= Number(lastAnswer);
        break;
    }
    memoryDisplayEl.textContent = `M: ${memory}`;
  };

  // ==============================
  //   Parsing & Evaluation
  // ==============================
  // Tokenizer – splits the expression into numbers, identifiers, operators, parentheses.
  const tokenize = (expr) => {
    const tokens = [];
    const regex = /\s*([0-9]*\.?[0-9]+|π|e|[a-zA-Z_][a-zA-Z0-9_]*|[+\-*/^%()!])\s*/g;
    let m;
    while ((m = regex.exec(expr)) !== null) {
      tokens.push(m[1]);
    }
    return tokens;
  };

  const isNumber = (token) => !isNaN(token);
  const isOperator = (token) => '+-*/^%'.includes(token);
  const isFunction = (token) => ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'exp'].includes(token);
  const precedence = {
    '!': 5,
    '^': 4,
    '*': 3,
    '/': 3,
    '%': 3,
    '+': 2,
    '-': 2,
  };
  const rightAssociative = new Set(['^', '!']);

  const shuntingYard = (tokens) => {
    const output = [];
    const stack = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (isNumber(token) || token === 'π' || token === 'e') {
        output.push(token);
      } else if (isFunction(token)) {
        stack.push(token);
      } else if (token === ',') {
        // Not used – placeholder for future multi‑arg functions
        while (stack.length && stack[stack.length - 1] !== '(') {
          output.push(stack.pop());
        }
        if (!stack.length) setError('Misplaced comma');
      } else if (isOperator(token) || token === '!') {
        while (
          stack.length &&
          ((isOperator(stack[stack.length - 1]) &&
            ((rightAssociative.has(token) && precedence[token] < precedence[stack[stack.length - 1]]) ||
              (!rightAssociative.has(token) && precedence[token] <= precedence[stack[stack.length - 1]]))) ||
            stack[stack.length - 1] === '!')
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
        if (stack.length === 0) {
          setError('Mismatched parentheses');
          return [];
        }
        stack.pop(); // Remove '('
        if (stack.length && isFunction(stack[stack.length - 1])) {
          output.push(stack.pop());
        }
      } else {
        setError(`Unknown token: ${token}`);
        return [];
      }
    }
    while (stack.length) {
      const op = stack.pop();
      if (op === '(' || op === ')') {
        setError('Mismatched parentheses');
        return [];
      }
      output.push(op);
    }
    return output;
  };

  const factorial = (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const evaluateRPN = (rpn) => {
    const stack = [];
    for (const token of rpn) {
      if (isNumber(token)) {
        stack.push(parseFloat(token));
      } else if (token === 'π') {
        stack.push(Math.PI);
      } else if (token === 'e') {
        stack.push(Math.E);
      } else if (isOperator(token)) {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) {
          setError('Invalid expression');
          return NaN;
        }
        let result;
        switch (token) {
          case '+':
            result = a + b;
            break;
          case '-':
            result = a - b;
            break;
          case '*':
            result = a * b;
            break;
          case '/':
            if (b === 0) {
              setError('Division by zero');
              return NaN;
            }
            result = a / b;
            break;
          case '^':
            result = Math.pow(a, b);
            break;
          case '%':
            result = a % b;
            break;
          default:
            setError(`Unsupported operator ${token}`);
            return NaN;
        }
        stack.push(result);
      } else if (token === '!') {
        const a = stack.pop();
        if (a === undefined) {
          setError('Missing operand for factorial');
          return NaN;
        }
        stack.push(factorial(a));
      } else if (isFunction(token)) {
        const a = stack.pop();
        if (a === undefined) {
          setError(`Missing argument for ${token}`);
          return NaN;
        }
        let rad = a;
        if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(token) && angleMode === 'DEG') {
          rad = (a * Math.PI) / 180; // convert degrees to radians for trig
        }
        let result;
        switch (token) {
          case 'sin':
            result = Math.sin(rad);
            break;
          case 'cos':
            result = Math.cos(rad);
            break;
          case 'tan':
            result = Math.tan(rad);
            break;
          case 'asin':
            result = Math.asin(rad);
            if (angleMode === 'DEG') result = (result * 180) / Math.PI;
            break;
          case 'acos':
            result = Math.acos(rad);
            if (angleMode === 'DEG') result = (result * 180) / Math.PI;
            break;
          case 'atan':
            result = Math.atan(rad);
            if (angleMode === 'DEG') result = (result * 180) / Math.PI;
            break;
          case 'log':
            result = Math.log10(a);
            break;
          case 'ln':
            result = Math.log(a);
            break;
          case 'sqrt':
            result = Math.sqrt(a);
            break;
          case 'exp':
            result = Math.exp(a);
            break;
          default:
            setError(`Unsupported function ${token}`);
            return NaN;
        }
        stack.push(result);
      } else {
        setError(`Unrecognized token ${token}`);
        return NaN;
      }
    }
    if (stack.length !== 1) {
      setError('Invalid expression');
      return NaN;
    }
    return stack[0];
  };

  const evaluateExpression = () => {
    if (!expression) return;
    // Replace special constants
    const sanitized = expression.replace(/π/g, 'π').replace(/e/g, 'e');
    const tokens = tokenize(sanitized);
    if (tokens.length === 0) return;
    const rpn = shuntingYard(tokens);
    if (rpn.length === 0) return;
    const result = evaluateRPN(rpn);
    if (Number.isFinite(result)) {
      lastAnswer = result;
      expression = result.toString();
      updateDisplay();
    } else {
      setError('Computation error');
    }
  };

  // ==============================
  //   Event Handlers
  // ==============================
  const onButtonClick = (e) => {
    const btn = e.target.closest('.calc-btn');
    if (!btn) return;
    const val = btn.dataset.value;
    if (!val) return;
    switch (val) {
      case 'C':
        clearAll();
        break;
      case 'DEL':
        deleteLast();
        break;
      case '=':
        evaluateExpression();
        break;
      case 'Ans':
        addToExpression(lastAnswer.toString());
        break;
      case '±':
        // Negate the current number (simple implementation)
        if (expression) {
          if (expression[0] === '-') {
            expression = expression.slice(1);
          } else {
            expression = '-' + expression;
          }
          updateDisplay();
        }
        break;
      case 'MC':
      case 'MR':
      case 'M+':
      case 'M-':
        handleMemory(val);
        break;
      default:
        // For functions like sin, cos, etc., we append the name followed by '('
        if (isFunction(val)) {
          addToExpression(`${val}(`);
        } else if (val === '!') {
          addToExpression('!');
        } else {
          addToExpression(val);
        }
    }
  };

  const onKeyDown = (e) => {
    const key = e.key;
    if (e.ctrlKey || e.metaKey) return; // ignore shortcuts
    if (key >= '0' && key <= '9') {
      addToExpression(key);
    } else if (key === '.') {
      addToExpression('.');
    } else if (key === '+') {
      addToExpression('+');
    } else if (key === '-') {
      addToExpression('-');
    } else if (key === '*') {
      addToExpression('*');
    } else if (key === '/') {
      addToExpression('/');
    } else if (key === '^') {
      addToExpression('^');
    } else if (key === '(') {
      addToExpression('(');
    } else if (key === ')') {
      addToExpression(')');
    } else if (key === 'Enter') {
      e.preventDefault();
      evaluateExpression();
    } else if (key === 'Backspace') {
      deleteLast();
    } else if (key === 'Escape') {
      clearAll();
    } else if (key === 'Delete') {
      clearAll();
    } else if (key === 'm' && e.shiftKey) {
      // Shift+M toggles angle mode (just an example shortcut)
      toggleAngleMode();
    }
  };

  // ==============================
  //   Initialization
  // ==============================
  document.querySelector('.button-panel').addEventListener('click', onButtonClick);
  document.addEventListener('keydown', onKeyDown);
  angleToggleBtn.addEventListener('click', toggleAngleMode);
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Set initial UI state
  updateDisplay();
  memoryDisplayEl.textContent = `M: ${memory}`;
  angleToggleBtn.textContent = angleMode;
  themeToggleBtn.textContent = '🌙';
})();