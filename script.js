let currentOperand = '0';
let previousOperand = '';
let operation = undefined;
let shouldResetDisplay = false;

const calculatorDisplay = document.querySelector('#calculator-display');
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-equals]');
const clearButton = document.querySelector('[data-clear]');
const decimalButton = document.querySelector('[data-decimal]');

/**
 * Updates the calculator's display element with the current and previous operand values,
 * along with the active operation if one is selected. Ensures real-time feedback to the user.
 */
function updateDisplay() {
    if (shouldResetDisplay && currentOperand === 'Error') {
        calculatorDisplay.textContent = currentOperand;
        return;
    }

    calculatorDisplay.textContent = currentOperand;
    if (operation != null && previousOperand !== '') {
        calculatorDisplay.textContent = `${previousOperand} ${operation} ${currentOperand}`;
    } else if (operation != null && previousOperand === '') {
        // This case might happen right after choosing an operation and before entering a new number
        calculatorDisplay.textContent = `${currentOperand} ${operation}`;
    }
}

/**
 * Resets all calculator state variables (currentOperand, previousOperand, operation, shouldResetDisplay)
 * to their initial values and updates the display to '0'.
 */
function clear() {
    currentOperand = '0';
    previousOperand = '';
    operation = undefined;
    shouldResetDisplay = false;
    updateDisplay();
}

/**
 * Handles input of numbers and decimal points. Appends the given number to `currentOperand`,
 * preventing multiple decimal points. Resets the display if `shouldResetDisplay` is true.
 * @param {string} number - The digit or decimal point to append to the current operand.
 */
function appendNumber(number) {
    if (shouldResetDisplay) {
        currentOperand = '';
        shouldResetDisplay = false;
    }

    if (number === '.' && currentOperand.includes('.')) {
        return; // Prevent multiple decimal points
    }

    if (currentOperand === '0' && number !== '.') {
        currentOperand = number; // Replace initial '0' with the first digit
    } else {
        currentOperand += number;
    }
    updateDisplay();
}

/**
 * Stores the selected operator, moves the `currentOperand` to `previousOperand`,
 * and prepares for the next number input. If a previous operation is pending, it computes it first.
 * @param {string} operator - The arithmetic operator (+, -, *, /) selected by the user.
 */
function chooseOperation(operator) {
    if (currentOperand === '') {
        return; // Do nothing if no number has been entered
    }

    if (previousOperand !== '') {
        compute(); // Compute previous operation if one exists
    }

    operation = operator;
    previousOperand = currentOperand;
    currentOperand = ''; // Clear currentOperand for the next number input
    shouldResetDisplay = true; // Prepare to reset display for next number
    updateDisplay();
}

/**
 * Performs the arithmetic calculation based on the stored `operation` and `previousOperand`
 * and `currentOperand`. Updates `currentOperand` with the result and resets `operation`
 * and `previousOperand`. Includes error handling for division by zero.
 */
function compute() {
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(current)) {
        return; // Cannot compute if operands are not valid numbers
    }

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
            if (current === 0) {
                currentOperand = 'Error';
                shouldResetDisplay = true;
                operation = undefined;
                previousOperand = '';
                updateDisplay();
                return;
            }
            computation = prev / current;
            break;
        default:
            return; // No valid operation
    }

    currentOperand = computation.toString();
    operation = undefined;
    previousOperand = '';
    shouldResetDisplay = true; // After computation, next number should clear the display
    updateDisplay();
}

/**
 * Attaches click event listeners to all number, operator, clear, decimal, and equals buttons,
 * mapping them to their respective handler functions.
 */
function addEventListeners() {
    numberButtons.forEach(button => {
        button.addEventListener('click', () => appendNumber(button.textContent));
    });

    operatorButtons.forEach(button => {
        button.addEventListener('click', () => chooseOperation(button.textContent));
    });

    equalsButton.addEventListener('click', () => compute());

    clearButton.addEventListener('click', () => clear());

    decimalButton.addEventListener('click', () => appendNumber('.'));
}

// Initial Setup
addEventListeners();
updateDisplay();