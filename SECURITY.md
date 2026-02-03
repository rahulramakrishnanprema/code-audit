# Security Audit

## 1. Overview
The project is a purely client‑side vanilla‑JS calculator. It contains no server side code, no external dependencies, and no secrets. The audit focuses on the following areas:

1. **Hardcoded secrets** – none found.
2. **Dependencies** – no third‑party libraries are used.
3. **Input validation** – the code validates the expression before evaluation.
4. **Error handling** – errors are caught and a generic message is shown.
5. **Content‑Security‑Policy** – a CSP meta tag is present.

## 2. Findings

| # | Category | Observation | Impact | Recommendation |
|---|----------|-------------|--------|----------------|
| 1 | Hardcoded Secrets | No secrets or API keys are present. | None | N/A |
| 2 | Insecure Dependencies | The project uses only native browser APIs. | None | N/A |
| 3 | Input Validation | `isValidExpression` checks:
- Length (max 200 chars)
- Allowed characters (digits, operators, parentheses, dot)
- Balanced parentheses
- Single dot per number

This prevents injection, whitespace, and malformed expressions. | Low – the current checks are sufficient for the calculator’s scope. | Consider adding a stricter check for leading zeros or disallowing expressions that start with an operator other than `-` to improve user experience. |
| 4 | Error Handling | All evaluation errors are caught and the user sees a generic `Error` string. No stack traces or sensitive data are exposed. | Low – safe error handling. | None |
| 5 | CSP | The HTML includes a meta CSP that restricts resources to the same origin. | Low – mitigates XSS if the project is extended. | Ensure the CSP is also sent via HTTP headers when deployed. |
| 6 | Denial‑of‑Service | The expression length is capped at 200 characters, preventing runaway CPU/memory usage. | Low – adequate for a calculator. | None |
| 7 | Rate Limiting | Rapid repeated evaluation of `=` is debounced (300 ms). | Low – protects against accidental rapid presses. | None |

## 3. Recommendations

1. **Unit Tests** – Add tests for `isValidExpression`, `tokenize`, `toRPN`, and `evaluateRPN` to guard against future regressions.
2. **CSP Header** – When hosting, serve the CSP via an HTTP header in addition to the meta tag.
3. **User‑Friendly Errors** – Replace the generic `Error` string with more descriptive messages (e.g., "Division by zero", "Malformed expression"). This does not compromise security but improves UX.
4. **Negative Numbers** – Extend the parser to support unary minus for a more complete calculator experience.
5. **Accessibility** – Add ARIA attributes to the calculator for better screen‑reader support.

## 4. Security Score
The application is intentionally simple and has no obvious security weaknesses. The only areas for improvement are minor UX and future‑proofing considerations.

**Score: 98 / 100**

## 5. Summary
- **Hardcoded secrets:** None
- **Insecure dependencies:** None
- **Input validation:** Robust for the current feature set
- **Error handling:** Safe and generic
- **CSP:** Present and restrictive

Overall, the calculator is secure for its intended use. The recommended changes will further harden the code and improve maintainability.
