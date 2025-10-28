const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
};

const displayElement = document.getElementById('display');
const buttonsGrid = document.getElementById('buttons-grid');

/**
 * Updates the text content of the `displayElement` with the current `calculator.displayValue`.
 */
function updateDisplay() {
    displayElement.textContent = calculator.displayValue;
}

/**
 * Resets the calculator's state to its initial values.
 */
function clearCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    updateDisplay();
}

/**
 * Handles input of a number digit, appending it to the display or starting a new number.
 * @param {string} digit - The digit (0-9) to be added to the display.
 */
function inputDigit(digit) {
    if (calculator.waitingForSecondOperand === true) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        if (calculator.displayValue === '0') {
            calculator.displayValue = digit;
        } else {
            calculator.displayValue += digit;
        }
    }
    updateDisplay();
}

/**
 * Performs the specified arithmetic operation.
 * @param {number} first - The first operand.
 * @param {string} operator - The arithmetic operator (+, -, *, /).
 * @param {number} second - The second operand.
 * @returns {number | string} The result of the operation, or 'Error' for division by zero.
 */
function calculate(first, operator, second) {
    switch (operator) {
        case '+':
            return first + second;
        case '-':
            return first - second;
        case '*':
            return first * second;
        case '/':
            if (second === 0) {
                return 'Error'; // Division by zero
            }
            return first / second;
        default:
            return second; // Should not be reached with valid operators
    }
}

/**
 * Executes the pending arithmetic operation when '=' is pressed or a new operator is chained.
 */
function performCalculation() {
    if (calculator.firstOperand === null || calculator.operator === null) {
        return; // Nothing to calculate yet
    }

    const secondOperand = parseFloat(calculator.displayValue);

    // If the display value is not a valid number (e.g., 'Error' or empty after an operator)
    if (isNaN(secondOperand)) {
        return;
    }

    const result = calculate(calculator.firstOperand, calculator.operator, secondOperand);

    calculator.displayValue = String(result);
    // If there was an error, reset firstOperand to prevent further calculations with 'Error'
    calculator.firstOperand = (result === 'Error') ? null : result;
    calculator.waitingForSecondOperand = true;
    calculator.operator = null; // Reset operator after calculation
    updateDisplay();
}

/**
 * Processes an operator button click, storing the first operand and the selected operator.
 * @param {string} nextOperator - The operator (+, -, *, /) that was clicked.
 */
function handleOperator(nextOperator) {
    const inputValue = parseFloat(calculator.displayValue);

    // If firstOperand is null and inputValue is a valid number, store it as the first operand.
    if (calculator.firstOperand === null && !isNaN(inputValue)) {
        calculator.firstOperand = inputValue;
    } else if (calculator.operator && !calculator.waitingForSecondOperand) {
        // If an operator already exists and we're not waiting for a second operand,
        // it means we're chaining operations (e.g., 5 + 3 +)
        performCalculation();
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
    updateDisplay();
}

// --- Initialization and Event Handling ---

// Initial display update when the script loads
updateDisplay();

// Event Delegation: Attach a single event listener to the buttonsGrid container
buttonsGrid.addEventListener('click', (event) => {
    const { target } = event;

    // Check if the clicked element is a button
    if (!target.matches('button')) {
        return;
    }

    const dataType = target.dataset.type;
    const buttonText = target.textContent;

    // Handle button clicks based on their data-type attribute
    switch (dataType) {
        case 'number':
            inputDigit(buttonText);
            break;
        case 'operator':
            handleOperator(buttonText);
            break;
        case 'clear':
            clearCalculator();
            break;
        case 'equals':
            performCalculation();
            break;
        default:
            // Do nothing for other button types or non-buttons
            break;
    }
});