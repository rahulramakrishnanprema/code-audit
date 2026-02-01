// Vanilla JS Calculator
// ------------------------------------------------------------
// This script wires up the calculator UI, handles mouse clicks,
// keyboard input, basic validation and safe evaluation of the
// arithmetic expression.
// ------------------------------------------------------------

(() => {
  const display = document.getElementById('display');
  const keys = document.querySelector('.calculator__keys');

  // Allowed characters for a safe eval (digits, operators, decimal point, parentheses)
  const VALID_EXPRESSION_REGEX = /^[0-9+\-*/().\s]+$/;

  /**
   * Append a character to the current expression.
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
  function evaluate() {
    const expr = display.value.trim();
    if (!expr) return;
    // Validate characters – prevents injection of malicious code.
    if (!VALID_EXPRESSION_REGEX.test(expr)) {
      alert('Invalid characters in expression');
      return;
    }
    try {
      // Using Function constructor is safer than eval when the input is validated.
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${expr})`)();
      display.value = Number.isFinite(result) ? result : 'Error';
    } catch (e) {
      display.value = 'Error';
    }
  }

  /**
   * Map a keyboard event to a calculator action.
   * @param {KeyboardEvent} e
   */
  function handleKeyboard(e) {
    const { key } = e;
    if (/[0-9]/.test(key)) {
      append(key);
    } else if (key === '.' || key === '+' || key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
      append(key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      evaluate();
    } else if (key === 'Backspace') {
      deleteLast();
    } else if (key === 'Escape') {
      clearDisplay();
    }
  }

  // Click handling – delegation from the container.
  keys.addEventListener('click', (e) => {
    const target = e.target;
    if (!target.matches('button')) return;
    const action = target.dataset.action;
    switch (action) {
      case 'clear':
        clearDisplay();
        break;
      case 'delete':
        deleteLast();
        break;
      case '=':
        evaluate();
        break;
      default:
        // For numbers, decimal point and operators.
        append(action);
    }
  });

  // Keyboard support.
  document.addEventListener('keydown', handleKeyboard);
})();
