// Calculator script – vanilla JavaScript
// -------------------------------------------------
// This script wires up the UI defined in index.html, validates user input,
// evaluates arithmetic expressions safely, and updates the display.

(() => {
  const display = document.getElementById('display');
  const keys = document.querySelector('.calculator__keys');

  // Allowed characters for a safe evaluation (digits, operators, parentheses, dot)
  const VALID_EXPRESSION = /^[0-9+\-*/().%\s]+$/;

  /**
   * Append a character to the display.
   * @param {string} char
   */
  function append(char) {
    display.value += char;
  }

  /**
   * Clear the entire display.
   */
  function clearDisplay() {
    display.value = '';
  }

  /**
   * Delete the last character.
   */
  function deleteLast() {
    display.value = display.value.slice(0, -1);
  }

  /**
   * Evaluate the expression safely.
   */
  function calculate() {
    const expr = display.value.trim();
    if (!expr) return;
    // Validate expression – only allowed characters
    if (!VALID_EXPRESSION.test(expr)) {
      alert('Invalid characters in expression');
      return;
    }
    try {
      // Replace % with /100 for percentage calculations
      const sanitized = expr.replace(/%/g, '/100');
      // Using Function constructor instead of eval for a tiny bit more control
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      display.value = Number.isFinite(result) ? result : 'Error';
    } catch (e) {
      display.value = 'Error';
    }
  }

  /**
   * Handle click events on calculator keys.
   * @param {MouseEvent} e
   */
  function handleClick(e) {
    const target = e.target;
    if (!target.matches('button')) return;
    const action = target.dataset.action;
    const value = target.dataset.value;

    switch (action) {
      case 'number':
        append(value);
        break;
      case 'decimal':
        // Prevent multiple decimals in the current number segment
        const parts = display.value.split(/[+\-*/%]/);
        if (!parts[parts.length - 1].includes('.')) {
          append('.');
        }
        break;
      case 'operator':
        // Avoid two consecutive operators
        if (display.value && !/[+\-*/%]$/.test(display.value)) {
          append(value);
        }
        break;
      case 'clear':
        clearDisplay();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'percent':
        // Append % – handled in calculate()
        if (display.value && !/[+\-*/%]$/.test(display.value)) {
          append('%');
        }
        break;
      case 'calculate':
        calculate();
        break;
      default:
        break;
    }
  }

  /**
   * Map keyboard keys to calculator actions.
   * @param {KeyboardEvent} e
   */
  function handleKey(e) {
    const key = e.key;
    if (/[0-9]/.test(key)) {
      append(key);
    } else if (key === '.') {
      // Same decimal handling as button
      const parts = display.value.split(/[+\-*/%]/);
      if (!parts[parts.length - 1].includes('.')) {
        append('.');
      }
    } else if (['+', '-', '*', '/', '%'].includes(key)) {
      if (display.value && !/[+\-*/%]$/.test(display.value)) {
        append(key);
      }
    } else if (key === 'Enter') {
      e.preventDefault();
      calculate();
    } else if (key === 'Backspace') {
      deleteLast();
    } else if (key === 'Escape') {
      clearDisplay();
    }
  }

  // Event listeners
  keys.addEventListener('click', handleClick);
  document.addEventListener('keydown', handleKey);
})();
