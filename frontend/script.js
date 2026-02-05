// Calculator logic for a vanilla JS calculator

const display = document.getElementById('display');
const keys = document.querySelector('.keys');
let expression = '';

/**
 * Update the calculator display.
 * @param {string} value - The value to show on the display.
 */
function updateDisplay(value) {
  display.textContent = value;
}

/**
 * Safely evaluate the arithmetic expression.
 * Only allows digits, decimal point and operators + - * /.
 * @returns {string} Result or error message.
 */
function evaluateExpression() {
  if (!expression) return '0';
  // Validate expression characters
  if (!/^[-+*/0-9\.\s]+$/.test(expression)) {
    return 'Error';
  }
  try {
    const result = eval(expression);
    if (result === Infinity || result === -Infinity) {
      return 'Error';
    }
    return result.toString();
  } catch (e) {
    return 'Error';
  }
}

/**
 * Handle button click events.
 * @param {Event} e
 */
function handleButtonClick(e) {
  const target = e.target;
  if (!target.matches('.btn')) return;

  const value = target.dataset.value;
  const action = target.dataset.action;

  if (value !== undefined) {
    // Append numeric or operator
    expression += value;
    updateDisplay(expression);
  } else if (action === 'evaluate') {
    const result = evaluateExpression();
    updateDisplay(result);
    expression = result;
  } else if (action === 'clear') {
    expression = '';
    updateDisplay('0');
  } else if (action === 'backspace') {
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
  }
}

/**
 * Handle keyboard input.
 * @param {KeyboardEvent} e
 */
function handleKeyDown(e) {
  const key = e.key;
  if (key === 'Enter') {
    e.preventDefault();
    const result = evaluateExpression();
    updateDisplay(result);
    expression = result;
  } else if (key === 'Backspace') {
    e.preventDefault();
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
  } else if (key === 'Escape') {
    e.preventDefault();
    expression = '';
    updateDisplay('0');
  } else if (/^[0-9]$/.test(key)) {
    expression += key;
    updateDisplay(expression);
  } else if (key === '.') {
    expression += key;
    updateDisplay(expression);
  } else if (['+', '-', '*', '/'].includes(key)) {
    expression += key;
    updateDisplay(expression);
  }
}

// Event listeners
keys.addEventListener('click', handleButtonClick);
window.addEventListener('keydown', handleKeyDown);

// Initialize display
updateDisplay('0');
