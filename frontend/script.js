// Scientific Calculator Implementation
// Author: ChatGPT
// Date: 2026-02-03

(() => {
  // DOM Elements
  const display = document.getElementById('display');
  const angleModeSelect = document.getElementById('angle-mode');
  const memSelect = document.getElementById('mem-select');
  const memStoreBtn = document.getElementById('mem-store');
  const memRecallBtn = document.getElementById('mem-recall');
  const memClearBtn = document.getElementById('mem-clear');
  const clearAllBtn = document.getElementById('clear-all');
  const clearEntryBtn = document.getElementById('clear-entry');
  const backspaceBtn = document.getElementById('backspace');
  const equalsBtn = document.getElementById('equals');
  const buttons = document.querySelectorAll('.btn[data-action]');

  // State
  let currentExpression = '';
  const memory = Array(5).fill(null);
  let angleMode = angleModeSelect.value; // 'rad' or 'deg'

  // Utility Functions
  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const updateDisplay = (value) => {
    display.textContent = value;
  };

  const clearDisplay = () => {
    currentExpression = '';
    updateDisplay('0');
  };

  const appendToExpression = (value) => {
    if (currentExpression === '0') {
      currentExpression = value;
    } else {
      currentExpression += value;
    }
    updateDisplay(currentExpression);
  };

  const backspace = () => {
    if (currentExpression.length > 0) {
      currentExpression = currentExpression.slice(0, -1);
      updateDisplay(currentExpression || '0');
    }
  };

  const clearEntry = () => {
    currentExpression = '';
    updateDisplay('0');
  };

  const storeMemory = () => {
    const slot = parseInt(memSelect.value, 10);
    const value = evaluateExpression(currentExpression);
    if (value !== null && !isNaN(value)) {
      memory[slot] = value;
      alert(`Stored ${value} in memory slot ${slot}`);
    } else {
      alert('Cannot store invalid expression');
    }
  };

  const recallMemory = () => {
    const slot = parseInt(memSelect.value, 10);
    const value = memory[slot];
    if (value !== null) {
      currentExpression = value.toString();
      updateDisplay(currentExpression);
    } else {
      alert(`Memory slot ${slot} is empty`);
    }
  };

  const clearMemory = () => {
    const slot = parseInt(memSelect.value, 10);
    memory[slot] = null;
    alert(`Cleared memory slot ${slot}`);
  };

  // Expression Parsing and Evaluation
  const isOperator = (c) => '+-*/^!'.includes(c);

  const precedence = {
    '+': 2,
    '-': 2,
    '*': 3,
    '/': 3,
    '^': 4,
    '!': 5,
  };

  const rightAssociative = {'^': true, '!': true};

  const functions = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    log: Math.log10,
    ln: Math.log,
    exp: Math.exp,
    sqrt: Math.sqrt,
    factorial: (n) => {
      if (n < 0 || !Number.isInteger(n)) throw new Error('Factorial domain error');
      let res = 1;
      for (let i = 2; i <= n; i++) res *= i;
      return res;
    },
  };

  const tokenize = (expr) => {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const c = expr[i];
      if (c === ' ') {
        i++;
        continue;
      }
      if (/\d/.test(c) || c === '.') {
        let num = '';
        while (i < expr.length && (/\d/.test(expr[i]) || expr[i] === '.')) {
          num += expr[i++];
        }
        tokens.push({ type: 'number', value: parseFloat(num) });
      } else if (/[a-zA-Z]/.test(c)) {
        let name = '';
        while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
          name += expr[i++];
        }
        if (functions[name]) {
          tokens.push({ type: 'function', value: name });
        } else {
          throw new Error(`Unknown function: ${name}`);
        }
      } else if (isOperator(c) || c === '(' || c === ')') {
        tokens.push({ type: 'operator', value: c });
        i++;
      } else {
        throw new Error(`Invalid character: ${c}`);
      }
    }
    return tokens;
  };

  const toRPN = (tokens) => {
    const output = [];
    const stack = [];
    tokens.forEach((token, idx) => {
      if (token.type === 'number') {
        output.push(token);
      } else if (token.type === 'function') {
        stack.push(token);
      } else if (token.type === 'operator') {
        const op = token.value;
        if (op === '(') {
          stack.push(token);
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
          const o1 = op;
          while (stack.length) {
            const o2 = stack[stack.length - 1].value;
            if (stack[stack.length - 1].type === 'operator' &&
                ((rightAssociative[o1] && precedence[o1] < precedence[o2]) ||
                 (!rightAssociative[o1] && precedence[o1] <= precedence[o2]))) {
              output.push(stack.pop());
            } else {
              break;
            }
          }
          stack.push(token);
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

  const evaluateRPN = (rpn) => {
    const stack = [];
    rpn.forEach((token) => {
      if (token.type === 'number') {
        stack.push(token.value);
      } else if (token.type === 'operator') {
        const op = token.value;
        if (op === '!') {
          const a = stack.pop();
          stack.push(functions.factorial(a));
        } else {
          const b = stack.pop();
          const a = stack.pop();
          let res;
          switch (op) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/': res = a / b; break;
            case '^': res = Math.pow(a, b); break;
            default: throw new Error(`Unknown operator: ${op}`);
          }
          stack.push(res);
        }
      } else if (token.type === 'function') {
        const a = stack.pop();
        let res;
        if (token.value === 'sin' || token.value === 'cos' || token.value === 'tan') {
          const angle = angleMode === 'deg' ? a * Math.PI / 180 : a;
          res = functions[token.value](angle);
        } else if (token.value === 'asin' || token.value === 'acos' || token.value === 'atan') {
          res = functions[token.value](a);
          if (angleMode === 'deg') res = res * 180 / Math.PI;
        } else {
          res = functions[token.value](a);
        }
        stack.push(res);
      }
    });
    if (stack.length !== 1) throw new Error('Invalid expression');
    return stack[0];
  };

  const evaluateExpression = (expr) => {
    try {
      const tokens = tokenize(expr);
      const rpn = toRPN(tokens);
      const result = evaluateRPN(rpn);
      return result;
    } catch (e) {
      alert(`Error: ${e.message}`);
      return null;
    }
  };

  // Event Listeners
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'num') {
        appendToExpression(btn.dataset.num);
      } else if (action === 'op') {
        appendToExpression(btn.dataset.op);
      } else if (action === 'func') {
        appendToExpression(btn.dataset.func + '(');
      }
    });
  });

  equalsBtn.addEventListener('click', () => {
    if (currentExpression.trim() === '') return;
    const result = evaluateExpression(currentExpression);
    if (result !== null) {
      currentExpression = result.toString();
      updateDisplay(currentExpression);
    }
  });

  clearAllBtn.addEventListener('click', clearDisplay);
  clearEntryBtn.addEventListener('click', clearEntry);
  backspaceBtn.addEventListener('click', backspace);

  memStoreBtn.addEventListener('click', storeMemory);
  memRecallBtn.addEventListener('click', recallMemory);
  memClearBtn.addEventListener('click', clearMemory);

  angleModeSelect.addEventListener('change', () => {
    angleMode = angleModeSelect.value;
  });

  // Keyboard Support
  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === 'Enter') {
      e.preventDefault();
      equalsBtn.click();
    } else if (key === 'Backspace') {
      e.preventDefault();
      backspaceBtn.click();
    } else if (key === 'Escape') {
      e.preventDefault();
      clearAllBtn.click();
    } else if (key === 'c' || key === 'C') {
      e.preventDefault();
      clearEntryBtn.click();
    } else if (/[0-9]/.test(key)) {
      e.preventDefault();
      appendToExpression(key);
    } else if (key === '.') {
      e.preventDefault();
      appendToExpression('.');
    } else if (['+', '-', '*', '/', '^', '(', ')', '!'].includes(key)) {
      e.preventDefault();
      appendToExpression(key);
    } else if (key.toLowerCase() === 's') {
      e.preventDefault();
      appendToExpression('sin(');
    } else if (key.toLowerCase() === 'c' && e.shiftKey) {
      e.preventDefault();
      appendToExpression('cos(');
    } else if (key.toLowerCase() === 't') {
      e.preventDefault();
      appendToExpression('tan(');
    }
  });

  // Initialize
  clearDisplay();
})();