class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '';
        this.previousOperand = '';
        this.operation = undefined;
        // The updateDisplay method will handle showing '0' if currentOperand is empty.
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) {
            return; // Prevent multiple decimal points
        }
        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') {
            return; // Do nothing if no current number to operate on
        }
        if (this.previousOperand !== '') {
            this.compute(); // Resolve pending operation before storing a new one
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = ''; // Clear current operand for new input
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) {
            return; // Error handling: Abort if operands are missing or invalid
        }

        switch (this.operation) {
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
                    this.currentOperand = 'Error'; // Error handling: Division by zero
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default:
                return; // No valid operation
        }
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    getDisplayNumber(number) {
        if (number === 'Error') {
            return 'Error';
        }
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        // Display '0' if currentOperand is empty, otherwise display the formatted currentOperand
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand === '' ? '0' : this.currentOperand);

        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// 1. DOM Element Selection
const numberButtons = document.querySelectorAll('[data-number]');
const operatorButtons = document.querySelectorAll('[data-operator]');
const equalsButton = document.querySelector('[data-equals]');
const clearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

// 2. Calculator Instantiation
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// 3. Number Button Event Listeners
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

// 4. Operator Button Event Listeners
operatorButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.innerText);
        calculator.updateDisplay();
    });
});

// 5. Equals Button Event Listener
equalsButton.addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// 6. Clear Button Event Listener
clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay(); // Update display to '0' after clearing
});

// Initial display update when the page loads
calculator.updateDisplay();