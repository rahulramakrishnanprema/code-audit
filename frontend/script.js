// Scientific Calculator Core Logic
// Author: OpenAI ChatGPT
// Description: Implements expression parsing, evaluation, memory, angle mode, and UI interactions.

// Global state
const state = {
  expression: "",
  result: "",
  memory: 0,
  angleMode: "deg", // 'deg' or 'rad'
};

// DOM elements
const exprEl = document.getElementById("expression");
const resEl = document.getElementById("result");
const angleBtn = document.querySelector('[data-action="angle"];');

// Utility: escape text content
function safeText(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Update display
function updateDisplay() {
  exprEl.innerHTML = safeText(state.expression);
  resEl.innerHTML = safeText(state.result);
}

// Memory operations
function memoryAdd(value) {
  state.memory += value;
}
function memorySubtract(value) {
  state.memory -= value;
}
function memoryRecall() {
  return state.memory;
}
function memoryClear() {
  state.memory = 0;
}

// Angle mode toggle
function toggleAngleMode() {
  state.angleMode = state.angleMode === "deg" ? "rad" : "deg";
  angleBtn.textContent = state.angleMode === "deg" ? "Deg" : "Rad";
}

// Tokenization
function tokenize(expr) {
  const tokens = [];
  const regex = /\s*([0-9]*\.?[0-9]+|[a-zA-Z_][a-zA-Z0-9_]*|[()+\-*/^%])\s*/g;
  let match;
  while ((match = regex.exec(expr)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

// Shunting-yard algorithm to convert to RPN
function toRPN(tokens) {
  const output = [];
  const stack = [];
  const precedence = {
    '^': 4,
    '*': 3,
    '/': 3,
    '%': 3,
    '+': 2,
    '-': 2,
  };
  const rightAssoc = { '^': true };

  let prevToken = null;

  for (let token of tokens) {
    if (token.match(/^[0-9]/) || token.match(/^\./)) { // number
      output.push(token);
    } else if (token === 'pi' || token === 'e') {
      output.push(token);
    } else if (token.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) { // function or variable
      stack.push(token);
    } else if (token === '(') {
      stack.push(token);
    } else if (token === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop(); // pop '('
      if (stack.length && stack[stack.length - 1].match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        output.push(stack.pop());
      }
    } else if (['+', '-', '*', '/', '^', '%'].includes(token)) {
      // Handle unary minus
      if (token === '-' && (prevToken === null || (['+', '-', '*', '/', '^', '%', '('].includes(prevToken)))) {
        stack.push('neg');
      } else {
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (['+', '-', '*', '/', '^', '%'].includes(top) &&
              ((rightAssoc[top] && precedence[top] > precedence[token]) ||
               (!rightAssoc[top] && precedence[top] >= precedence[token]))) {
            output.push(stack.pop());
          } else {
            break;
          }
        }
        stack.push(token);
      }
    }
    prevToken = token;
  }
  while (stack.length) {
    output.push(stack.pop());
  }
  return output;
}

// Evaluate RPN
function evaluateRPN(rpn) {
  const stack = [];
  const funcs = {
    sin: (x) => state.angleMode === 'deg' ? Math.sin((x * Math.PI) / 180) : Math.sin(x),
    cos: (x) => state.angleMode === 'deg' ? Math.cos((x * Math.PI) / 180) : Math.cos(x),
    tan: (x) => state.angleMode === 'deg' ? Math.tan((x * Math.PI) / 180) : Math.tan(x),
    asin: (x) => {
      const val = Math.asin(x);
      return state.angleMode === 'deg' ? (val * 180) / Math.PI : val;
    },
    acos: (x) => {
      const val = Math.acos(x);
      return state.angleMode === 'deg' ? (val * 180) / Math.PI : val;
    },
    atan: (x) => {
      const val = Math.atan(x);
      return state.angleMode === 'deg' ? (val * 180) / Math.PI : val;
    },
    log: (x) => Math.log10(x),
    ln: (x) => Math.log(x),
    sqrt: (x) => Math.sqrt(x),
    abs: (x) => Math.abs(x),
    fact: (x) => {
      if (x < 0 || !Number.isInteger(x)) throw new Error('Factorial domain error');
      let res = 1;
      for (let i = 2; i <= x; i++) res *= i;
      return res;
    },
    neg: (x) => -x,
  };

  for (let token of rpn) {
    if (token.match(/^[0-9]/) || token.match(/^\./)) {
      stack.push(parseFloat(token));
    } else if (token === 'pi') {
      stack.push(Math.PI);
    } else if (token === 'e') {
      stack.push(Math.E);
    } else if (['+', '-', '*', '/', '^', '%'].includes(token)) {
      const b = stack.pop();
      const a = stack.pop();
      let val;
      switch (token) {
        case '+': val = a + b; break;
        case '-': val = a - b; break;
        case '*': val = a * b; break;
        case '/':
          if (b === 0) throw new Error('Division by zero');
          val = a / b; break;
        case '^': val = Math.pow(a, b); break;
        case '%': val = a % b; break;
      }
      stack.push(val);
    } else if (Object.keys(funcs).includes(token)) {
      const arg = stack.pop();
      const val = funcs[token](arg);
      stack.push(val);
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression');
  return stack[0];
}

// Main evaluation function
function evaluateExpression(expr) {
  try {
    const tokens = tokenize(expr);
    const rpn = toRPN(tokens);
    const result = evaluateRPN(rpn);
    if (!isFinite(result)) throw new Error('Result is infinite');
    return result.toString();
  } catch (e) {
    return 'Error: ' + e.message;
  }
}

// Button handling
function handleButtonClick(e) {
  const btn = e.currentTarget;
  const num = btn.dataset.num;
  const op = btn.dataset.op;
  const func = btn.dataset.func;
  const action = btn.dataset.action;
  const constVal = btn.dataset.const;

  if (num !== undefined) {
    state.expression += num;
  } else if (op !== undefined) {
    state.expression += op;
  } else if (func !== undefined) {
    state.expression += func + '(';
  } else if (constVal !== undefined) {
    state.expression += constVal;
  } else if (action) {
    switch (action) {
      case 'clear':
        state.expression = '';
        state.result = '';
        break;
      case 'back':
        state.expression = state.expression.slice(0, -1);
        break;
      case 'equals':
        state.result = evaluateExpression(state.expression);
        break;
      case 'mc': memoryClear(); break;
      case 'mr': state.expression += memoryRecall(); break;
      case 'mplus': memoryAdd(parseFloat(evaluateExpression(state.expression)) || 0); break;
      case 'mminus': memorySubtract(parseFloat(evaluateExpression(state.expression)) || 0); break;
      case 'angle': toggleAngleMode(); break;
    }
  }
  updateDisplay();
}

// Attach event listeners
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', handleButtonClick);
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/^[0-9]$/.test(key)) {
    state.expression += key;
    updateDisplay();
  } else if (key === '.') {
    state.expression += key;
    updateDisplay();
  } else if (['+', '-', '*', '/', '^', '%'].includes(key)) {
    state.expression += key;
    updateDisplay();
  } else if (key === '(' || key === ')') {
    state.expression += key;
    updateDisplay();
  } else if (key === 'Enter') {
    state.result = evaluateExpression(state.expression);
    updateDisplay();
    e.preventDefault();
  } else if (key === 'Backspace') {
    state.expression = state.expression.slice(0, -1);
    updateDisplay();
  } else if (key === 'Delete') {
    state.expression = '';
    state.result = '';
    updateDisplay();
  }
});

// Initial render
updateDisplay();
