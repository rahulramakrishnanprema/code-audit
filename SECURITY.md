# Security Audit – Vanilla Scientific Calculator

## Overview
The project is a pure client‑side calculator written in vanilla JavaScript, HTML and CSS. It contains no external dependencies, no network traffic, and no secrets. The primary security concerns arise from the way user input is processed and evaluated.

## Identified Risks

| # | Risk | Impact | Likelihood | Recommendation |
|---|------|--------|------------|----------------|
| 1 | **Use of `Function` constructor for expression evaluation** | Medium – If the sanitisation routine fails or is bypassed, arbitrary JavaScript could be executed. | Low – Current sanitisation removes most dangerous characters, but the approach is inherently risky. | Replace the custom evaluator with a well‑maintained math‑expression parser (e.g., `math.js`, `expr-eval`) that guarantees safe evaluation. |
| 2 | **Incomplete input sanitisation** | Low – The regex used in `sanitize()` may not cover all edge cases (e.g., nested function calls, Unicode operators). | Medium – A clever attacker could craft an expression that slips through the filter. | Refactor sanitisation to whitelist only allowed tokens (numbers, operators, parentheses, function names) and reject everything else. Consider tokenising the expression instead of regex replacement. |
| 3 | **Potential DoS via large or complex expressions** | Low – Extremely long or deeply nested expressions could cause stack overflows or long evaluation times. | Low – Users are unlikely to intentionally abuse the calculator, but a malicious user could. | Impose a reasonable limit on expression length (e.g., 200 characters) and depth of nested parentheses. Provide a graceful error message if the limit is exceeded. |
| 4 | **No protection against accidental injection of the letter `e`** | Very Low – The code replaces the literal `e` with `Math.E`. While not a security flaw, it could lead to unexpected results. | Low – Minor usability issue. | Either escape the letter `e` in the UI or remove the automatic replacement and require explicit `Math.E` usage. |
| 5 | **No CSRF or authentication concerns** | N/A – The application is purely client‑side and does not interact with a server. | N/A |

## Recommended Fixes
1. **Replace the custom evaluator** – Use a proven library such as `math.js` or `expr-eval`. These libraries parse the expression into an abstract syntax tree and evaluate it safely, eliminating the need for `Function`.
2. **Improve sanitisation** – Implement a tokenizer that accepts only numeric literals, operators, parentheses, and the supported function names. Reject any token that does not match the whitelist.
3. **Input length & complexity limits** – Add a check in `appendToExpression()` to reject input that would exceed a predefined maximum length or nesting depth.
4. **Error handling** – Ensure that any exception during evaluation results in a user‑friendly message and does not expose stack traces or internal state.
5. **Code review & static analysis** – Run tools like ESLint with security plugins (e.g., `eslint-plugin-security`) to catch potential issues early.

## Security Score
The application is simple and contains no secrets or external dependencies. The main security concern is the use of the `Function` constructor for evaluating user input. After applying the recommended mitigations, the risk profile would be very low.

**Score: 88/100**

---

**Action Items**
- Replace the evaluator with a safe math parser.
- Tighten input sanitisation and add length limits.
- Run a static analysis scan.
- Document the security posture in `SECURITY.md`.

---

**References**
- OWASP: JavaScript Security Cheat Sheet
- MDN: Using the Function constructor
- Math.js documentation

