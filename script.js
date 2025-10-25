let currentOperand = '';
let previousOperand = '';
let operation = undefined;
let displayElement;

/**
 * Initializes the calculator by selecting DOM elements and attaching event listeners to all buttons.
 * This function is called once the DOM is loaded.
 */
function initializeCalculator() {
    displayElement = document.querySelector('.calculator-display');
    const buttons = document.querySelectorAll('.calculator-button');

    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });

    // Initialize the display and state
    clearCalculator();
    updateDisplay();
}

/**
 * Central event handler for all calculator button clicks.
 * Determines the type of button pressed (number, operator, clear, equals)
 * using `data-action` attributes and dispatches to appropriate logic functions.
 * @param {Event} event - Event object from button click.
 */
function handleButtonClick(event) {
    const button = event.target;
    const action = button.dataset.action;
    const buttonText = button.textContent;

    if (action === 'number') {
        appendNumber(buttonText);
        updateDisplay();
    } else if (action === 'operator') {
        chooseOperation(buttonText);
        updateDisplay();
    } else if (action === 'equals') {
        compute();
        updateDisplay();
    } else if (action === 'clear') {
        clearCalculator();
        updateDisplay();
    }
}

/**
 * Updates the calculator's display element with the current operand or result,
 * based on the internal state.
 */
function updateDisplay() {
    displayElement.textContent = currentOperand === '' ? '0' : currentOperand;
}

/**
 * Resets all calculator state variables (current operand, previous operand, operation)
 * and clears the display.
 */
function clearCalculator() {
    currentOperand = '';
    previousOperand = '';
    operation = undefined;
}

/**
 * Appends a digit to the `currentOperand` string.
 * Handles decimal points to ensure only one is present.
 * @param {string} number - The digit or decimal point clicked.
 */
function appendNumber(number) {
    if (number === '.' && currentOperand.includes('.')) return;
    currentOperand = currentOperand.toString() + number.toString();
}

/**
 * Stores the selected operator and moves the `currentOperand` to `previousOperand`,
 * preparing for the next number input. If a previous operation is pending, it computes it first.
 * @param {string} operator - The arithmetic operator (+, -, *, /).
 */
function chooseOperation(operator) {
    if (currentOperand === '') return; // Cannot choose operator if no number is entered

    if (previousOperand !== '') {
        compute(); // Compute previous operation if one exists
    }

    operation = operator;
    previousOperand = currentOperand;
    currentOperand = '';
}

/**
 * Performs the arithmetic calculation based on `previousOperand`, `currentOperand`,
 * and `operation`. Updates `currentOperand` with the result and clears
 * `previousOperand` and `operation`.
 */
function compute() {
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    // Gracefully handles cases where compute is called without sufficient operands.
    if (isNaN(prev) || isNaN(current)) return;

    let computation;
    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '*':
            computation = prev * current;
            break;
        case '/':
            // Handles division by zero
            if (current === 0) {
                computation = 'Error';
            } else {
                computation = prev / current;
            }
            break;
        default:
            return; // No valid operation
    }

    if (computation === 'Error') {
        currentOperand = 'Error';
        previousOperand = '';
        operation = undefined;
    } else {
        currentOperand = computation.toString();
        operation = undefined;
        previousOperand = '';
    }
}

// Ensure the calculator is initialized once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', initializeCalculator);