# Security Audit Report

## Project Overview
The project is a client‑side scientific calculator built with vanilla HTML, CSS, and JavaScript. It performs expression parsing, evaluation, and offers memory slots, angle mode selection, and keyboard support. No external libraries or network communication are involved.

## Audit Scope
The audit examined the following aspects:
1. **Hardcoded secrets** – none found.
2. **Insecure dependencies** – none; the code is self‑contained.
3. **Input validation** – how user‑supplied expressions are parsed and evaluated.
4. **Error handling** – visibility of internal error messages and potential information leakage.
5. **Other security concerns** – such as DoS vectors, XSS, CSRF, etc.

## Identified Risks
| # | Risk | Impact | Likelihood | Severity | Recommendation |
|---|-------|--------|------------|----------|----------------|
| 1 | **Internal error messages exposed via `alert()`** | Users see stack‑trace‑style messages that may reveal implementation details. | Medium | Low | Use a user‑friendly error display that does not expose internal exception messages. |
| 2 | **No protection against computationally expensive operations** | A user could input a factorial of a very large number or a deeply nested expression, causing the browser to freeze or crash (client‑side DoS). | Medium | Medium | Validate operand ranges (e.g., limit factorial input to a reasonable bound) and implement a timeout or recursion depth guard. |
| 3 | **Missing input validation for malformed expressions** | Malformed input can trigger uncaught errors or stack overflows, potentially leading to denial‑of‑service. | Medium | Medium | Add stricter syntax checks (e.g., disallow consecutive operators, enforce balanced parentheses) before tokenization. |
| 4 | **Unused `escapeHTML` helper** | While not a direct risk, it indicates potential oversight in sanitization practices. | Low | Low | Remove unused code or repurpose it for sanitizing any dynamic content that might be inserted via `innerHTML`. |
| 5 | **Potential browser compatibility issue with `Math.log10`** | Older browsers may not support `Math.log10`, causing runtime errors. | Low | Low | Provide a polyfill or use `Math.log(value) / Math.LN10` as a fallback. |

## Recommendations
1. **Error Handling** – Replace `alert()` with a dedicated error UI component that displays generic messages. Log detailed errors to the console only.
2. **Input Validation** – Implement a pre‑validation step that checks for balanced parentheses, disallows consecutive operators, and limits operand sizes (e.g., factorial input ≤ 170 to avoid Infinity).
3. **DoS Mitigation** – Add a recursion depth counter or a maximum token count. If the limit is exceeded, abort evaluation and show a friendly error.
4. **Code Cleanup** – Remove the unused `escapeHTML` function or use it for any future dynamic content. Ensure all dynamic text is set via `textContent` to avoid XSS.
5. **Polyfills** – Add a small polyfill for `Math.log10` to guarantee compatibility across all browsers.
6. **Testing** – Write unit tests for the parser and evaluator, covering edge cases such as large factorials, deeply nested parentheses, and invalid syntax.

## Overall Assessment
The application is largely secure due to its client‑side nature and lack of external dependencies. The primary concerns are user‑visible error messages and potential DoS vectors from computationally heavy expressions. Addressing these will bring the project to a high security posture.

**Security Score: 95/100** – Minor improvements are needed to mitigate the identified risks.

---

### Vulnerabilities Summary
- Potential exposure of internal error messages via `alert()`
- No protection against computationally expensive operations (DoS)
- Missing input validation for expression evaluation
- Unused `escapeHTML` helper
- Potential browser compatibility issue with `Math.log10`

