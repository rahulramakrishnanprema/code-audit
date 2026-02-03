# Security Audit Report

## Overview
The Scientific Calculator v2 is a purely client‑side application written in vanilla HTML, CSS, and JavaScript. It performs all calculations in the browser, stores a small amount of state in `localStorage`, and displays results directly in the DOM. Because the code runs entirely on the client, the attack surface is limited to the browser environment and the data stored locally.

## Identified Risks

| # | Risk | Impact | Likelihood | Recommendation |
|---|-------|--------|------------|----------------|
| 1 | **Information Leakage via Error Messages** | The `showToast` function displays raw error messages (e.g., "Unknown token: abc") to the user. While the calculator is not a sensitive application, leaking implementation details can aid an attacker in crafting malformed expressions or probing the parser. | Low | Add a generic error message for user‑facing errors and log the detailed error to the console for debugging.
| 2 | **LocalStorage Exposure** | Memory values and theme preference are persisted in `localStorage`. Any script running on the same origin can read or modify this data. Although the data is not sensitive, it could be abused by a malicious script injected via XSS. | Medium | Store data in a more secure storage if sensitive, or at least prefix keys with a unique namespace to reduce accidental collisions. Consider using `sessionStorage` if persistence across sessions is not required.
| 3 | **Missing Input Sanitization** | The tokenizer accepts any sequence of letters and digits. Unknown function names trigger an error but are otherwise not sanitized. While this does not currently lead to code execution, it could be a vector for future extensions that might inadvertently expose `eval` or other dangerous APIs. | Low | Validate function names against the `functions` map before pushing them onto the stack, and reject any unknown identifiers with a user‑friendly message.
| 4 | **Denial‑of‑Service via Heavy Computation** | Functions like `factorial` and exponentiation can be called with very large arguments, potentially causing long CPU usage or stack overflows. | Low | Impose reasonable limits on input size (e.g., maximum number of digits or maximum factorial argument) and provide a warning if the limit is exceeded.
| 5 | **No External Dependencies** | The project does not import any third‑party libraries, eliminating the risk of vulnerable dependencies. | N/A | Continue to avoid unnecessary dependencies.

## Summary of Recommendations
1. **Sanitize Error Messages** – Replace detailed error strings with generic messages for the UI, while logging the full stack trace to the console.
2. **Namespace LocalStorage Keys** – Prefix keys (e.g., `calc_memory_0`) to avoid accidental collisions and make intent clear.
3. **Validate Function Names** – Ensure that only known functions are accepted during tokenization.
4. **Input Size Limits** – Enforce maximum input length and argument bounds for heavy operations.
5. **Code Review & Testing** – Periodically review the parser for edge cases and run automated tests to catch regressions.

## Security Score
The application demonstrates good security hygiene for a client‑side calculator. The primary concerns are minor information leakage and localStorage exposure. After applying the above mitigations, the risk profile would be negligible.

**Score: 95/100**

---

### Vulnerabilities List
- Information leakage via detailed error messages
- LocalStorage data exposed to any script on the same origin
- Lack of strict input validation for function names
- Potential denial‑of‑service from heavy computations
- No hardcoded secrets or insecure dependencies

