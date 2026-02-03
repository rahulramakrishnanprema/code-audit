// Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  let expression = '';

  const updateDisplay = (value) => {
    display.textContent = value;
  };

  const clearExpression = () => {
    expression = '';
    updateDisplay('0');
  };

  const deleteLast = () => {
    expression = expression.slice(0, -1);
    updateDisplay(expression || '0');
  };

  const appendValue = (val) => {
    expression += val;
    updateDisplay(expression);
  };

  const evaluateExpression = () => {
    if (!expression) return;
    // Basic validation: allow digits, operators, parentheses, decimal point
    const validPattern = /^[0-9+\-*/().\s]+$/;
    if (!validPattern.test(expression)) {
      updateDisplay('Error');
      expression = '';
      return;
    }
    try {
      // Use Function constructor for safer eval
      const result = Function('return ' + expression)();
      if (result === Infinity || result === -Infinity) {
        throw new Error('Division by zero');
      }
      updateDisplay(result.toString());
      expression = result.toString();
    } catch (e) {
      updateDisplay('Error');
      expression = '';
    }
  };

  const handleButtonClick = (e) => {
    const btn = e.target;
    if (!btn.classList.contains('btn')) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    switch (action) {
      case 'clear':
        clearExpression();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'equals':
        evaluateExpression();
        break;
      case 'decimal':
        if (!expression.endsWith('.')) appendValue('.');
        break;
      case 'operator':
        if (expression && /[0-9)]$/.test(expression)) {
          appendValue(value);
        }
        break;
      case 'parenthesis':
        appendValue(value);
        break;
      default:
        if (value) appendValue(value);
    }
  };

  // Button click handling
  document.querySelector('.buttons').addEventListener('click', handleButtonClick);

  // Keyboard support
  const keyMap = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
    '+': '+', '-': '-', '*': '*', '/': '/', '(': '(', ')': ')', '.': '.',
    'Enter': '=', 'Backspace': 'Backspace', 'Delete': 'Delete', 'c': 'Clear', 'C': 'Clear',
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    if (key === 'Enter') {
      e.preventDefault();
      evaluateExpression();
    } else if (key === 'Backspace') {
      e.preventDefault();
      deleteLast();
    } else if (key === 'Delete') {
      e.preventDefault();
      clearExpression();
    } else if (key === 'c' || key === 'C') {
      e.preventDefault();
      clearExpression();
    } else if (keyMap[key] !== undefined) {
      const val = keyMap[key];
      if (val === '=') {
        evaluateExpression();
      } else {
        appendValue(val);
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
});