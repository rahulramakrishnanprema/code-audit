"use strict";

(function () {
  const display = document.getElementById('display');
  const buttons = document.querySelectorAll('.btn');
  let expression = '';
  const MAX_LENGTH = 100;

  // Whitelist for data-value attributes
  const VALID_VALUES = new Set(['0','1','2','3','4','5','6','7','8','9','.','+','-','×','÷']);

  // Update the display element
  function updateDisplay(value) {
    display.textContent = value;
  }

  // Tokenize an expression string into numbers and operators
  function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const char = expr[i];
      if (char >= '0' && char <= '9' || char === '.') {
        let num = '';
        while (i < expr.length && (expr[i] >= '0' && expr[i] <= '9' || expr[i] === '.')) {
          num += expr[i++];
        }
        tokens.push(num);
      } else if (['+','-','*','/'].includes(char)) {
        tokens.push(char);
        i++;
      } else {
        // Invalid character (should not happen due to whitelist)
        i++;
      }
    }
    return tokens;
  }

  // Convert infix tokens to Reverse Polish Notation using shunting-yard
  function toRPN(tokens) {
    const output = [];
    const ops = [];
    const precedence = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      'u-': 3
    };
    const isRightAssoc = {
      'u-': true
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!isNaN(token)) {
        output.push(token);
      } else if (token === '+' || token === '-' || token === '*' || token === '/') {
        const op = token;
        while (ops.length) {
          const top = ops[ops.length - 1];
          if (top === '(') break;
          if ((precedence[top] > precedence[op]) || (precedence[top] === precedence[op] && !isRightAssoc[op])) {
            output.push(ops.pop());
          } else {
            break;
          }
        }
        ops.push(op);
      } else if (token === '(') {
        ops.push(token);
      } else if (token === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop());
        }
        ops.pop(); // Remove '('
      }
    }
    while (ops.length) {
      output.push(ops.pop());
    }
    return output;
  }

  // Evaluate RPN expression
  function evaluateRPN(rpn) {
    const stack = [];
    for (const token of rpn) {
      if (!isNaN(token)) {
        stack.push(parseFloat(token));
      } else {
        if (token === 'u-') {
          const val = stack.pop();
          stack.push(-val);
        } else {
          const b = stack.pop();
          const a = stack.pop();
          let res;
          switch (token) {
            case '+': res = a + b; break;
            case '-': res = a - b; break;
            case '*': res = a * b; break;
            case '/':
              if (b === 0) return 'Division by zero';
              res = a / b;
              break;
          }
          stack.push(res);
        }
      }
    }
    return stack[0];
  }

  // Main evaluation function
  function evaluateExpression(expr) {
    // Replace unicode operators with JS equivalents for internal use
    const sanitized = expr.replace(/÷/g, '/').replace(/×/g, '*');
    if (sanitized.length === 0) return '0';

    // Tokenization and RPN conversion
    const tokens = tokenize(sanitized);
    if (tokens.length === 0) return 'Error';

    // Handle unary minus: prepend 0 before leading '-'
    const processedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token === '-' && (i === 0 || ['+','-','*','/'].includes(tokens[i - 1]))) {
        processedTokens.push('0');
        processedTokens.push('u-');
      } else {
        processedTokens.push(token);
      }
    }

    const rpn = toRPN(processedTokens);
    const result = evaluateRPN(rpn);
    if (typeof result === 'string') return result; // Error message
    if (!isFinite(result)) return 'Division by zero';
    return result.toString();
  }

  // Button click handler
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const value = btn.dataset.value;

      if (action === 'number' || action === 'operator') {
        if (!VALID_VALUES.has(value)) return; // Reject invalid data-value
        if (expression.length >= MAX_LENGTH) return; // Enforce max length
        expression += value;
        updateDisplay(expression);
      } else if (action === 'clear') {
        expression = '';
        updateDisplay('0');
      } else if (action === 'backspace') {
        expression = expression.slice(0, -1);
        updateDisplay(expression || '0');
      } else if (action === 'equals') {
        const result = evaluateExpression(expression);
        updateDisplay(result);
        expression = result === 'Error' || result === 'Division by zero' ? '' : result;
      }
    });
  });
})();