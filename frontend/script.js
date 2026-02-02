// ------------------------------------------------------------
// Calculator Logic – Vanilla JavaScript
// ------------------------------------------------------------

/**
 * Simple safe evaluator for arithmetic expressions.
 * Allows digits, decimal points, parentheses and the four basic operators.
 * Returns the computed result or throws an Error on invalid input.
 *
 * @param {string} expr The arithmetic expression to evaluate.
 * @returns {number} The numeric result.
 */
function evaluateExpression(expr) {
    // Remove whitespace for validation
    const sanitized = expr.replace(/\s+/g, "");
    // Allowed characters: digits, + - * / . ( )
    const validPattern = /^[0-9+\-*/().]+$/;
    if (!validPattern.test(sanitized)) {
        throw new Error("Invalid characters in expression");
    }
    // Use Function constructor instead of eval for a tiny bit more safety
    // The expression is already validated, so this is acceptable for a calculator.
    // eslint-disable-next-line no-new-func
    return new Function(`"use strict"; return (${sanitized});`)();
}

/**
 * Updates the calculator display.
 * @param {string} value The string to show in the display.
 */
function updateDisplay(value) {
    const display = document.getElementById("display");
    display.value = value;
}

/**
 * Main entry – set up event listeners after DOM is ready.
 */
document.addEventListener("DOMContentLoaded", () => {
    const calculator = document.querySelector(".calculator-buttons");
    let currentExpression = "";

    // Helper to append characters safely
    const appendToExpression = (char) => {
        // Prevent multiple consecutive operators (except minus for negative numbers)
        const operators = "+-*/";
        const lastChar = currentExpression.slice(-1);
        if (operators.includes(char)) {
            if (currentExpression === "" && char !== "-") {
                // Do not start expression with +, *, /
                return;
            }
            if (operators.includes(lastChar) && !(char === "-" && lastChar !== "-")) {
                // Replace the previous operator with the new one
                currentExpression = currentExpression.slice(0, -1) + char;
                updateDisplay(currentExpression);
                return;
            }
        }
        currentExpression += char;
        updateDisplay(currentExpression);
    };

    // Click handling using event delegation
    calculator.addEventListener("click", (e) => {
        const target = e.target;
        if (!target.matches("button")) return;
        const action = target.dataset.action;
        const value = target.dataset.value;

        switch (action) {
            case "digit":
                appendToExpression(value);
                break;
            case "decimal":
                // Prevent multiple decimals in the current number segment
                const parts = currentExpression.split(/[+\-*/]/);
                const lastPart = parts[parts.length - 1];
                if (!lastPart.includes('.')) {
                    appendToExpression('.');
                }
                break;
            case "operator":
                appendToExpression(value);
                break;
            case "clear":
                currentExpression = "";
                updateDisplay("0");
                break;
            case "equals":
                try {
                    const result = evaluateExpression(currentExpression);
                    // Limit to 12 characters to keep display tidy
                    const formatted = Number.isFinite(result) ? Number(result).toString() : "Error";
                    updateDisplay(formatted);
                    currentExpression = formatted;
                } catch (err) {
                    updateDisplay("Error");
                    currentExpression = "";
                }
                break;
            default:
                // No action (empty placeholder buttons)
                break;
        }
    });

    // Initialize display
    updateDisplay("0");
});
