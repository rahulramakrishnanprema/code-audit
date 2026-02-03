# Security Audit

## Project Overview
The project is a client‑side calculator built with vanilla HTML, CSS, and JavaScript. It runs entirely in the browser and does not communicate with any backend services.

## Identified Risks
| # | Risk | Description | Impact | Likelihood | Recommendation |
|---|------|-------------|--------|------------|----------------|
| 1 | **Potential DOM manipulation / data‑attribute injection** | The calculator relies on `data-action` and `data-value` attributes. A malicious user could modify these attributes in the browser console to inject disallowed characters or change the action type. The current code only checks the final expression string, not the raw `data-value`. | Low | Medium | Validate `data-value` against an explicit whitelist before appending it to the expression. Reject or sanitize any other values. |
| 2 | **Missing explicit protection against excessively long expressions** | Although the code enforces a `MAX_LENGTH` of 100 characters, the limit is only applied when a button is pressed. A user could still manipulate the `expression` variable via the console to exceed this limit, potentially causing performance degradation. | Low | Low | Add a defensive check before evaluating the expression to ensure it does not exceed the maximum length. |
| 3 | **No explicit error handling for division by zero** | The code returns the string `'Division by zero'` when a division by zero occurs. While this is user‑friendly, it could be improved by providing a more descriptive message or resetting the calculator state. | Low | Low | Provide a clearer error message (e.g., "Cannot divide by zero") and optionally reset the expression to an empty state. |
| 4 | **No Content Security Policy (CSP)** | The application does not declare a CSP. While the code does not load external scripts, a CSP would still provide an additional layer of protection against XSS if the project were to evolve. | Low | Low | Add a basic CSP header or meta tag that restricts script execution to the same origin. |

## Recommendations Summary
1. **Validate `data-value` and `data-action`** before using them to build the expression.
2. **Enforce expression length** at the point of evaluation, not just during button clicks.
3. **Improve error messages** for division by zero and other edge cases.
4. **Add a CSP** to guard against future XSS vectors.

## Security Score
The project is a simple, client‑only calculator with minimal attack surface. The primary concerns are the lack of strict validation for data attributes and the absence of a CSP. After applying the recommended fixes, the risk profile would be very low.

**Score: 95/100**
