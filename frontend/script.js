// Secure vanilla‑JS calculator implementation
// -------------------------------------------------
// Features:
//   • Input validation (no whitespace, max length, balanced parentheses)
//   • Safe arithmetic evaluation using a hand‑rolled shunting‑yard parser (no Function/Eval)
//   • Graceful error handling (division by zero, malformed expressions)
//   • Keyboard support
//   • Simple debounce on the "=" operation to avoid accidental rapid re‑evaluation
// -------------------------------------------------

(() => {
  const displayEl = document.getElementById('display');
  let expression = '';
  const MAX_LENGTH = 200; // Prevent DoS via extremely long input
  const DEBOUNCE_DELAY = 300; // ms
  let debounceTimer = null;

  /** Update the calculator display */
  function updateDisplay() {
    displayEl.value = expression || '0';
  }

  /** Simple regex validation – only digits, operators, parentheses and a single dot */
  function isValidChars(expr) {
    const pattern = /^[0-9+\-*/().]*$/; // no whitespace allowed
    return pattern.test(expr);
  }

  /** Check that parentheses are balanced */
  function areParenthesesBalanced(expr) {
    let depth = 0;
    for (const ch of expr) {
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth < 0) return false; // closing before opening
      }
    }
    return depth === 0;
  }

  /** Validate the whole expression before evaluation */
  function isValidExpression(expr) {
    if (expr.length === 0) return false;
    if (expr.length > MAX_LENGTH) return false;
    if (!isValidChars(expr)) return false;
    if (!areParenthesesBalanced(expr)) return false;
    // Prevent multiple dots in a single number (e.g., "1..2")
    const numberParts = expr.split(/[^0-9.]/).filter(Boolean);
    for (const part of numberParts) {
      if ((part.match(/\./g) || []).length > 1) return false;
    }
    return true;
  }

  /** Tokenize the expression into numbers, operators and parentheses */
  function tokenize(expr) {
    const tokens = [];
    let numberBuffer = '';
    const pushNumber = () => {
      if (numberBuffer) {
        tokens.push(numberBuffer);
        numberBuffer = '';
      }
    };
    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (/[0-9.]/.test(ch)) {
        numberBuffer += ch;
      } else if (/[+\-*/()]/.test(ch)) {
        pushNumber();
        tokens.push(ch);
      } else {
        // Should never happen because of validation, but guard anyway
        throw new Error('Invalid character');
      }
    }
    pushNumber();
    return tokens;
  }

  /** Convert tokens to Reverse Polish Notation using the shunting‑yard algorithm */
  function toRPN(tokens) {
    const output = [];
    const operators = [];
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const isOperator = (t) => '+-*/'.includes(t);

    for (const token of tokens) {
      if (isOperator(token)) {
        while (
          operators.length &&
          isOperator(operators[operators.length - 1]) &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output.push(operators.pop());
        }
        operators.push(token);
      } else if (token === '(') {
        operators.push(token);
      } else if (token === ')') {
        while (operators.length && operators[operators.length - 1] !== '(') {
          output.push(operators.pop());
        }
        if (!operators.length) throw new Error('Mismatched parentheses');
        operators.pop(); // remove '('
      } else {
        // number
        output.push(token);
      }
    }
    while (operators.length) {
      const op = operators.pop();
      if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
      output.push(op);
    }
    return output;
  }

  /** Evaluate the RPN expression */
  function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
      if (/[+\-*/]/.test(token)) {
        const b = parseFloat(stack.pop());
        const a = parseFloat(stack.pop());
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
            if (b === 0) return NaN; // division by zero -> error
            result = a / b;
            break;
        }
        stack.push(result);
      } else {
        stack.push(token);
      }
    }
    if (stack.length !== 1) throw new Error('Invalid RPN');
    return stack[0];
  }

  /** Main evaluation wrapper – returns a string (result or "Error") */
  function evaluateExpression(expr) {
    if (!isValidExpression(expr)) return 'Error';
    try {
      const tokens = tokenize(expr);
      const rpn = toRPN(tokens);
      const result = evaluateRPN(rpn);
      if (!isFinite(result) || isNaN(result)) return 'Error';
      // Round to 12 decimal places to avoid floating‑point noise
      const rounded = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
      return String(rounded);
    } catch (e) {
      return 'Error';
    }
  }

  /** Handle button or keyboard input */
  function handleInput(value) {
    switch (value) {
      case 'C':
        expression = '';
        updateDisplay();
        break;
      case 'DEL':
        expression = expression.slice(0, -1);
        updateDisplay();
        break;
      case '=':
        // Debounce rapid presses of '='
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const result = evaluateExpression(expression);
          expression = result === 'Error' ? '' : result;
          updateDisplay();
        }, DEBOUNCE_DELAY);
        break;
      default:
        // Prevent adding characters that would exceed the max length
        if (expression.length >= MAX_LENGTH) return;
        // Basic operator placement rules (no two operators in a row, except leading '-')
        const operators = '+-*/';
        const lastChar = expression.slice(-1);
        if (operators.includes(value)) {
          if (!expression && value !== '-') return; // cannot start with +, *, /
          if (operators.includes(lastChar) && !(value === '-' && lastChar !== '-')) {
            // Replace the previous operator (except when user wants a negative sign after another operator)
            expression = expression.slice(0, -1) + value;
            updateDisplay();
            return;
          }
        }
        expression += value;
        updateDisplay();
    }
  }

  // Attach click listeners to all calculator buttons
  document.querySelectorAll('.button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      handleInput(val);
    });
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '0' && key <= '9') {
      handleInput(key);
    } else if (key === '.' || key === '(' || key === ')') {
      handleInput(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      handleInput(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleInput('=');
    } else if (key === 'Backspace') {
      handleInput('DEL');
    } else if (key === 'Escape') {
      handleInput('C');
    }
  });

  // Initialise display
  updateDisplay();
})();