/* Scientific Calculator v2
 * Author: ChatGPT
 * Description: Implements expression parsing, evaluation, UI interaction,
 *              theme/angle toggles, memory slots, keyboard support, and
 *              accessibility features.
 */

// ==================== Utility Functions ====================
/**
 * Escape HTML to prevent XSS when updating the display.
 * @param {string} str
 * @returns {string}
 */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Convert degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Factorial of a non-negative integer.
 * @param {number} n
 * @returns {number}
 */
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial only defined for non‑negative integers');
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// ==================== Parser & Evaluator ====================
const operators = {
  '+': { precedence: 2, associativity: 'Left', func: (a, b) => a + b },
  '-': { precedence: 2, associativity: 'Left', func: (a, b) => a - b },
  '*': { precedence: 3, associativity: 'Left', func: (a, b) => a * b },
  '/': { precedence: 3, associativity: 'Left', func: (a, b) => a / b },
  '^': { precedence: 4, associativity: 'Right', func: (a, b) => Math.pow(a, b) },
};

const functions = {
  sin: (x, angleMode) => (angleMode === 'deg' ? Math.sin(degToRad(x)) : Math.sin(x)),
  cos: (x, angleMode) => (angleMode === 'deg' ? Math.cos(degToRad(x)) : Math.cos(x)),
  tan: (x, angleMode) => (angleMode === 'deg' ? Math.tan(degToRad(x)) : Math.tan(x)),
  asin: (x) => Math.asin(x),
  acos: (x) => Math.acos(x),
  atan: (x) => Math.atan(x),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  exp: (x) => Math.exp(x),
  sqrt: (x) => Math.sqrt(x),
  factorial: (x) => factorial(x),
};

/**
 * Tokenize the input expression.
 * @param {string} expr
 * @returns {Array<string>}
 */
function tokenize(expr) {
  const tokens = [];
  let i = 0;
  while (i < expr.length) {
    const char = expr[i];
    if (\s/.test(char)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      let num = char;
      i++;
      while (i < expr.length && /[0-9.]/.test(expr[i])) {
        num += expr[i];
        i++;
      }
      tokens.push(num);
      continue;
    }
    if (/[()+\-*/^]/.test(char)) {
      tokens.push(char);
      i++;
      continue;
    }
    // Function names
    const funcMatch = expr.slice(i).match(/^[a-zA-Z]+/);
    if (funcMatch) {
      tokens.push(funcMatch[0]);
      i += funcMatch[0].length;
      continue;
    }
    throw new Error('Invalid character: ' + char);
  }
  return tokens;
}

/**
 * Convert infix tokens to Reverse Polish Notation using Shunting‑Yard.
 * @param {Array<string>} tokens
 * @returns {Array<string>}
 */
function toRPN(tokens) {
  const output = [];
  const stack = [];
  tokens.forEach((token) => {
    if (!isNaN(token)) {
      output.push(token);
    } else if (functions[token]) {
      stack.push(token);
    } else if (token in operators) {
      const o1 = operators[token];
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top in operators) {
          const o2 = operators[top];
          if ((o1.associativity === 'Left' && o1.precedence <= o2.precedence) ||
              (o1.associativity === 'Right' && o1.precedence < o2.precedence)) {
            output.push(stack.pop());
            continue;
          }
        }
        break;
      }
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      if (stack.length === 0) throw new Error('Mismatched parentheses');
      stack.pop(); // Remove '('
      if (stack.length && functions[stack[stack.length - 1]]) {
        output.push(stack.pop());
      }
    } else {
      throw new Error('Unknown token: ' + token);
    }
  });
  while (stack.length) {
    const op = stack.pop();
    if (op === '(' || op === ')') throw new Error('Mismatched parentheses');
    output.push(op);
  }
  return output;
}

/**
 * Evaluate RPN expression.
 * @param {Array<string>} rpn
 * @param {string} angleMode 'deg' | 'rad'
 * @returns {number}
 */
function evaluateRPN(rpn, angleMode) {
  const stack = [];
  rpn.forEach((token) => {
    if (!isNaN(token)) {
      stack.push(parseFloat(token));
    } else if (token in operators) {
      const b = stack.pop();
      const a = stack.pop();
      if (a === undefined || b === undefined) throw new Error('Invalid expression');
      const result = operators[token].func(a, b);
      stack.push(result);
    } else if (functions[token]) {
      const a = stack.pop();
      if (a === undefined) throw new Error('Invalid expression');
      const result = functions[token](a, angleMode);
      stack.push(result);
    } else {
      throw new Error('Unknown token during evaluation: ' + token);
    }
  });
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

/**
 * Evaluate an expression string.
 * @param {string} expr
 * @param {string} angleMode
 * @returns {number}
 */
function evaluateExpression(expr, angleMode) {
  const tokens = tokenize(expr);
  const rpn = toRPN(tokens);
  return evaluateRPN(rpn, angleMode);
}

// ==================== UI Logic ====================
const display = document.getElementById('display');
const errorBanner = document.getElementById('error-banner');
const buttons = document.querySelectorAll('.btn');
let currentExpression = '';
let angleMode = 'rad'; // or 'deg'
let memory = Array(5).fill(0); // 5 memory slots
let theme = 'light';
let highContrast = false;

function updateDisplay() {
  display.textContent = currentExpression || '0';
}

function showError(msg) {
  errorBanner.textContent = msg;
  errorBanner.hidden = false;
  setTimeout(() => {
    errorBanner.hidden = true;
  }, 3000);
}

function handleButtonClick(action) {
  switch (action) {
    case 'clear':
      currentExpression = '';
      updateDisplay();
      break;
    case 'del':
      currentExpression = currentExpression.slice(0, -1);
      updateDisplay();
      break;
    case 'equals':
      try {
        const result = evaluateExpression(currentExpression, angleMode);
        currentExpression = String(result);
        updateDisplay();
      } catch (e) {
        showError(e.message);
      }
      break;
    case 'angle':
      angleMode = angleMode === 'rad' ? 'deg' : 'rad';
      document.getElementById('angle-toggle').textContent = angleMode === 'rad' ? 'Rad' : 'Deg';
      break;
    case 'theme':
      theme = theme === 'light' ? 'dark' : 'light';
      document.body.classList.toggle('dark-theme', theme === 'dark');
      document.getElementById('theme-toggle').textContent = theme === 'light' ? 'Dark' : 'Light';
      break;
    case 'contrast':
      highContrast = !highContrast;
      document.body.classList.toggle('high-contrast', highContrast);
      document.getElementById('contrast-toggle').textContent = highContrast ? 'Normal' : 'High Contrast';
      break;
    case 'mc':
      memory = Array(5).fill(0);
      break;
    case 'mr':
      // Recall last memory value
      currentExpression = String(memory[0]);
      updateDisplay();
      break;
    case 'm+':
      try {
        const val = evaluateExpression(currentExpression, angleMode);
        memory[0] = val;
      } catch (e) {
        showError('Cannot store: ' + e.message);
      }
      break;
    default:
      // For numbers, operators, functions, parentheses
      currentExpression += action;
      updateDisplay();
  }
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-action');
    handleButtonClick(action);
  });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if ((key >= '0' && key <= '9') || key === '.' || key === '+' || key === '-' || key === '*' || key === '/' || key === '^' || key === '(' || key === ')') {
    e.preventDefault();
    handleButtonClick(key);
  } else if (key === 'Enter' || key === '=') {
    e.preventDefault();
    handleButtonClick('equals');
  } else if (key === 'Backspace') {
    e.preventDefault();
    handleButtonClick('del');
  } else if (key === 'Delete') {
    e.preventDefault();
    handleButtonClick('clear');
  } else if (key.toLowerCase() === 'a') {
    e.preventDefault();
    handleButtonClick('angle');
  } else if (key.toLowerCase() === 't') {
    e.preventDefault();
    handleButtonClick('theme');
  } else if (key.toLowerCase() === 'c') {
    e.preventDefault();
    handleButtonClick('contrast');
  }
});

// Initialize
updateDisplay();
// Ensure theme class is applied
if (theme === 'dark') {
  document.body.classList.add('dark-theme');
}
// Accessibility: focus outline visible
document.body.addEventListener('focusin', (e) => {
  if (e.target.matches('.btn')) {
    e.target.classList.add('focus-visible');
  }
});

// Expose for debugging
window.calculator = {
  evaluateExpression,
  memory,
};
