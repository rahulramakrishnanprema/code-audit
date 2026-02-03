"use strict";

// Scientific Calculator – client side implementation
// All user input is processed locally with strict validation to avoid DoS and security issues.

(() => {
  /* ---------- DOM Elements ---------- */
  const displayEl = document.getElementById('display');
  const errorEl = document.getElementById('error');
  const buttons = document.querySelectorAll('.btn');
  const memSlots = document.querySelectorAll('.mem-slot');
  const angleToggleBtn = document.querySelector('[data-action="toggle-angle"]');

  /* ---------- State ---------- */
  let expression = '';
  let angleMode = 'rad'; // 'rad' or 'deg'
  const memory = Array(10).fill(0);
  let activeSlot = 0;

  /* ---------- Constants ---------- */
  const MAX_OPERAND = 1e12; // Prevent huge numbers that could cause overflow
  const MAX_FACTORIAL = 170; // 170! is the largest factorial that fits in JS number
  const MAX_TOKENS = 100;   // Guard against extremely long expressions

  /* ---------- Utility Functions ---------- */
  const setDisplay = text => { displayEl.textContent = text; };
  const setError = msg => { errorEl.textContent = msg; };
  const clearError = () => { errorEl.textContent = ''; };
  const updateActiveSlot = slot => {
    activeSlot = slot;
    memSlots.forEach(btn => btn.classList.toggle('active', parseInt(btn.dataset.slot) === slot));
  };

  /* ---------- Tokenizer ---------- */
  const tokenize = expr => {
    const tokens = [];
    let i = 0;
    let prevTokenType = 'operator'; // start as operator to allow leading unary minus

    while (i < expr.length) {
      const ch = expr[i];

      if (\n        ch.match(/[0-9.]/)) {
        let num = ch;
        i++;
        while (i < expr.length && expr[i].match(/[0-9.]/)) {
          num += expr[i];
          i++;
        }
        const value = parseFloat(num);
        if (isNaN(value)) throw new Error('Invalid number');
        if (Math.abs(value) > MAX_OPERAND) throw new Error('Number too large');
        tokens.push({ type: 'number', value });
        prevTokenType = 'number';
      } else if (ch.match(/[()+\-*/^%]/)) {
        if (ch === '-') {
          // Determine if unary minus
          if (prevTokenType === 'operator' || prevTokenType === '(') {
            tokens.push({ type: 'operator', value: 'u-' }); // unary minus
          } else {
            tokens.push({ type: 'operator', value: ch });
          }
        } else {
          tokens.push({ type: 'operator', value: ch });
        }
        prevTokenType = 'operator';
        i++;
      } else if (ch === '!') {
        tokens.push({ type: 'operator', value: ch });
        prevTokenType = 'operator';
        i++;
      } else if (ch.match(/[a-zA-Z]/)) {
        let name = ch;
        i++;
        while (i < expr.length && expr[i].match(/[a-zA-Z]/)) {
          name += expr[i];
          i++;
        }
        tokens.push({ type: 'function', value: name.toLowerCase() });
        prevTokenType = 'function';
      } else if (ch === ' ') {
        i++; // skip spaces
      } else {
        throw new Error('Invalid character');
      }
    }

    if (tokens.length > MAX_TOKENS) throw new Error('Expression too long');
    return tokens;
  };

  /* ---------- Shunting Yard (to RPN) ---------- */
  const toRPN = tokens => {
    const output = [];
    const stack = [];
    const precedence = {
      'u-': 5,
      '!': 5,
      '^': 4,
      '*': 3,
      '/': 3,
      '%': 3,
      '+': 2,
      '-': 2
    };
    const rightAssoc = new Set(['^', 'u-']);

    tokens.forEach(tok => {
      if (tok.type === 'number') {
        output.push(tok);
      } else if (tok.type === 'function') {
        stack.push(tok);
      } else if (tok.type === 'operator') {
        const op = tok.value;
        if (op === '(') {
          stack.push(tok);
        } else if (op === ')') {
          while (stack.length && stack[stack.length - 1].value !== '(') {
            output.push(stack.pop());
          }
          if (!stack.length) throw new Error('Mismatched parentheses');
          stack.pop(); // pop '('
          if (stack.length && stack[stack.length - 1].type === 'function') {
            output.push(stack.pop());
          }
        } else {
          while (stack.length) {
            const top = stack[stack.length - 1];
            if (top.type === 'function') break;
            const topOp = top.value;
            if ((rightAssoc.has(op) && precedence[op] < precedence[topOp]) ||
                (!rightAssoc.has(op) && precedence[op] <= precedence[topOp])) {
              output.push(stack.pop());
            } else break;
          }
          stack.push(tok);
        }
      }
    });

    while (stack.length) {
      const top = stack.pop();
      if (top.value === '(' || top.value === ')') throw new Error('Mismatched parentheses');
      output.push(top);
    }

    return output;
  };

  /* ---------- RPN Evaluation ---------- */
  const evaluateRPN = rpn => {
    const stack = [];
    rpn.forEach(tok => {
      if (tok.type === 'number') {
        stack.push(tok.value);
      } else if (tok.type === 'operator') {
        if (tok.value === 'u-') {
          const a = stack.pop();
          stack.push(-a);
        } else if (tok.value === '!') {
          const a = stack.pop();
          if (a < 0 || !Number.isInteger(a)) throw new Error('Factorial only for non‑negative integers');
          if (a > MAX_FACTORIAL) throw new Error('Factorial too large');
          let res = 1;
          for (let i = 2; i <= a; i++) res *= i;
          stack.push(res);
        } else {
          const b = stack.pop();
          const a = stack.pop();
          let res;
          switch (tok.value) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/': res = a / b; break;
            case '%': res = a % b; break;
            case '^': res = Math.pow(a, b); break;
            default: throw new Error('Unknown operator');
          }
          if (Math.abs(res) > MAX_OPERAND) throw new Error('Result too large');
          stack.push(res);
        }
      } else if (tok.type === 'function') {
        const a = stack.pop();
        const rad = angleMode === 'deg' ? a * Math.PI / 180 : a;
        let res;
        switch (tok.value) {
          case 'sin': res = Math.sin(rad); break;
          case 'cos': res = Math.cos(rad); break;
          case 'tan': res = Math.tan(rad); break;
          case 'asin': res = Math.asin(a); break;
          case 'acos': res = Math.acos(a); break;
          case 'atan': res = Math.atan(a); break;
          case 'log': res = Math.log10(a); break;
          case 'ln': res = Math.log(a); break;
          case 'exp': res = Math.exp(a); break;
          case 'sqrt': res = Math.sqrt(a); break;
          default: throw new Error('Unknown function');
        }
        if ([ 'asin', 'acos', 'atan' ].includes(tok.value) && angleMode === 'deg') {
          res = res * 180 / Math.PI;
        }
        if (Math.abs(res) > MAX_OPERAND) throw new Error('Result too large');
        stack.push(res);
      }
    });

    if (stack.length !== 1) throw new Error('Invalid expression');
    const result = stack[0];
    if (!Number.isFinite(result)) throw new Error('Result is not a finite number');
    return result;
  };

  /* ---------- Main Evaluation ---------- */
  const evaluateExpression = () => {
    try {
      const tokens = tokenize(expression);
      const rpn = toRPN(tokens);
      const result = evaluateRPN(rpn);
      setDisplay(result.toString());
      expression = result.toString();
      clearError();
    } catch (e) {
      console.error('Evaluation error:', e);
      setError('Invalid expression');
    }
  };

  /* ---------- Button Handlers ---------- */
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (!action) return;

      switch (action) {
        case 'c':
          expression = '';
          setDisplay('');
          clearError();
          break;
        case 'back':
          expression = expression.slice(0, -1);
          setDisplay(expression);
          clearError();
          break;
        case '=':
          evaluateExpression();
          break;
        case 'toggle-angle':
          angleMode = angleMode === 'rad' ? 'deg' : 'rad';
          angleToggleBtn.textContent = angleMode === 'rad' ? 'Rad' : 'Deg';
          break;
        case 'm+':
        case 'm-':
        case 'mr':
        case 'mc':
          const current = parseFloat(displayEl.textContent) || 0;
          if (action === 'm+') memory[activeSlot] += current;
          if (action === 'm-') memory[activeSlot] -= current;
          if (action === 'mr') {
            expression = memory[activeSlot].toString();
            setDisplay(expression);
            clearError();
          }
          if (action === 'mc') memory[activeSlot] = 0;
          break;
        default:
          // Append to expression
          expression += action;
          setDisplay(expression);
          clearError();
      }
    });
  });

  /* ---------- Memory Slot Selection ---------- */
  memSlots.forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = parseInt(btn.dataset.slot, 10);
      updateActiveSlot(slot);
    });
  });
  updateActiveSlot(activeSlot);

  /* ---------- Keyboard Support ---------- */
  document.addEventListener('keydown', e => {
    const key = e.key;
    if (key === 'Enter') {
      e.preventDefault();
      evaluateExpression();
    } else if (key === 'Backspace') {
      e.preventDefault();
      expression = expression.slice(0, -1);
      setDisplay(expression);
    } else if (key === 'Escape') {
      e.preventDefault();
      expression = '';
      setDisplay('');
    } else if (key === 'c' || key === 'C') {
      e.preventDefault();
      expression = '';
      setDisplay('');
    } else if (key.match(/[0-9+\-*/^%().!]/)) {
      e.preventDefault();
      expression += key;
      setDisplay(expression);
    }
  });
})();