# Security Audit

## Overview

The project is a purely client‑side scientific calculator implemented with vanilla HTML, CSS and JavaScript. It contains no external dependencies, no API keys, and no server‑side components. The code is therefore largely immune to typical web‑application vulnerabilities such as injection attacks, cross‑site scripting (XSS), or server‑side data exposure.

## Identified Risks

1. **Global Exposure of `evaluateExpression`**
   - The `evaluateExpression` function is attached to the global `window` object. Any script that runs on the page can call this function and evaluate arbitrary mathematical expressions. While this is not a security flaw in the traditional sense, it does expose internal logic that could be abused in a malicious context (e.g., a malicious extension or injected script).
   - **Fix**: Remove the global export or wrap it in a module and expose only the minimal API required for the UI.

2. **Error Messages Leak Internal Implementation Details**
   - The `showError` function displays the raw error message from the parser (e.g., "Mismatched parentheses", "Invalid expression"). These messages reveal the internal parsing logic and could aid an attacker in crafting more precise injection attempts.
   - **Fix**: Map internal errors to user‑friendly, generic messages before displaying them.

3. **Limited Input Validation**
   - The tokenizer accepts any sequence of letters as a function name. While unknown functions are rejected, the parser does not enforce strict numeric formatting (e.g., multiple decimal points, leading zeros). This could lead to confusing error messages but does not pose a security risk.
   - **Fix**: Add stricter validation for numeric literals and provide clearer feedback.

4. **No Protection Against DOM Manipulation**
   - The UI relies on the presence of specific `data-action` attributes. An attacker who can modify the DOM (e.g., via a browser extension) could inject buttons with arbitrary `data-action` values that are appended to the expression. The parser will reject unknown tokens, but the attacker could still cause denial‑of‑service by flooding the expression with invalid characters.
   - **Fix**: Validate `data-action` values against a whitelist before processing.

5. **No Rate‑Limiting or Denial‑of‑Service Mitigation**
   - The calculator can be used to evaluate extremely large expressions or deep recursion (e.g., factorial of a large number). This could cause high CPU usage and potentially freeze the browser.
   - **Fix**: Impose limits on expression length, recursion depth, and numeric ranges.

## Recommendations

- **Encapsulate the Calculator Logic**: Use an ES6 module or IIFE to avoid leaking internal functions to the global scope.
- **Sanitize Error Messages**: Replace detailed parser errors with generic messages such as "Invalid input".
- **Validate Input Strictly**: Ensure numeric literals are well‑formed and enforce a maximum expression length.
- **Whitelist `data-action` Values**: Reject any button click that does not match an allowed action.
- **Implement Execution Limits**: Cap the size of expressions and the depth of recursive functions like factorial.
- **Add Unit Tests**: Verify that invalid inputs are handled gracefully and that the UI does not expose internal state.

## Security Score

The application is a simple, client‑side calculator with no external dependencies or secrets. After addressing the minor issues above, the overall security posture is strong.

**Score: 92/100**

## Vulnerabilities Summary

| ID | Description | Severity |
|----|-------------|----------|
| VULN-001 | Global exposure of `evaluateExpression` | Low |
| VULN-002 | Error messages reveal internal logic | Low |
| VULN-003 | Limited numeric input validation | Low |
| VULN-004 | Potential DOM manipulation of `data-action` | Low |
| VULN-005 | No execution limits for large expressions | Medium |

---

*Prepared by: Security Architect*