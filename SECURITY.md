# Security Audit Report

## Overview
The Scientific Calculator is a purely client‑side web application. It contains no server‑side logic, no external API calls, and no persistent storage. As such, the attack surface is limited to the JavaScript code, the HTML markup, and the CSS. The audit focused on:

1. **Hardcoded secrets** – none found.
2. **Insecure dependencies** – none, the project uses only standard browser APIs.
3. **Input validation** – expression parsing is performed locally; however, there are no limits on expression length or complexity.
4. **Error handling** – errors are surfaced to the user as plain text, exposing implementation details.
5. **Other security concerns** – code quality bugs that could lead to runtime failures.

## Identified Risks & Recommendations

| # | Risk | Impact | Likelihood | Recommendation |
|---|------|--------|------------|----------------|
| 1 | **Missing input length/complexity validation** | Denial‑of‑Service (CPU exhaustion, memory blow‑up) | High | Enforce a maximum expression length (e.g., 200 characters) and a maximum depth of nested parentheses. Reject or truncate longer inputs. |
| 2 | **Potential infinite recursion / large factorial** | CPU exhaustion when evaluating `fact(100000)` or deeply nested expressions | Medium | Add a guard in the factorial implementation to limit the maximum input (e.g., 170) and throw a user‑friendly error if exceeded. |
| 3 | **Exposing internal error messages** | Information disclosure (e.g., “Division by zero”, “Factorial domain error”) | Low | Replace detailed error strings with generic messages such as “Invalid expression” and log the detailed error to the console for debugging only. |
| 4 | **Bug: `angleBtn` selector contains an extra semicolon** | Runtime error when toggling angle mode; could break the UI | High | Change the selector to `document.querySelector('[data-action="angle"]');` and add a null check before accessing `textContent`. |
| 5 | **No Content Security Policy (CSP)** | While the app is static, a missing CSP allows arbitrary inline scripts if the page is later extended or embedded. | Low | Add a CSP meta tag such as `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self';">` to restrict resources to the same origin. |
| 6 | **No input sanitization for display** | The `safeText` helper does escape text, but the implementation relies on `innerHTML` after setting `textContent`. | Low | Consider using `textContent` directly for both expression and result to avoid any accidental HTML injection. |

### Summary of Recommendations
1. **Limit input size** – Prevent extremely long or deeply nested expressions.
2. **Guard heavy operations** – Cap factorial input and add timeouts for evaluation if needed.
3. **Improve error handling** – Show user‑friendly messages; log details to console.
4. **Fix selector bug** – Correct the angle button query and add defensive coding.
5. **Add CSP** – Protect against future script injection or accidental inclusion of malicious code.
6. **Simplify display updates** – Use `textContent` for both expression and result to guarantee safety.

## Security Score
The application demonstrates solid client‑side engineering with no obvious secrets or external dependencies. The primary concerns are missing input limits and a runtime bug that could affect usability. After weighting these factors, the overall security score is:

**Score: 85 / 100**

A score of 85 indicates a generally secure implementation but with room for improvement in defensive coding and user input handling.

---

**Action Items**
- Implement input length checks in `evaluateExpression` or before updating the display.
- Add a maximum factorial limit and return a clear error if exceeded.
- Refactor `safeText` to use `textContent` directly.
- Correct the angle button selector and add null checks.
- Add a CSP meta tag to the `<head>`.
- Replace detailed error messages with generic ones in the UI.

