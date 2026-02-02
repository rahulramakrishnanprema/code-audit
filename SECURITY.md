# Security Audit Report

## Overview
The Scientific Calculator v2 is a purely client‑side application written in vanilla JavaScript, HTML, and CSS. It performs all calculations in the browser, without any server‑side code, external APIs, or third‑party libraries. As such, the attack surface is limited to the browser environment and the code itself.

## Findings

| # | Category | Risk Description | Impact | Likelihood | Recommendation |
|---|----------|------------------|--------|------------|----------------|
| 1 | Hardcoded Secrets | None detected. | N/A | N/A | N/A |
| 2 | Insecure Dependencies | No external dependencies are used. | N/A | N/A | N/A |
| 3 | Input Validation | The calculator accepts any string built from button clicks or keyboard input. While the tokenizer only accepts a predefined set of tokens, there is no explicit length or complexity limit. Very large expressions (e.g., factorial of a huge number or deep nesting of parentheses) can cause long CPU usage or stack overflows, leading to a denial‑of‑service (DoS) scenario. | High (client‑side DoS) | Medium | • Add a maximum expression length (e.g., 200 characters).<br>• Reject or warn on factorials of numbers > 170 (Math factorial overflows to Infinity).<br>• Throttle evaluation or run it in a Web Worker to avoid blocking the UI. |
| 4 | Error Handling | Error messages are displayed in the UI via `textContent`. They are cleared after 3 s. The messages are not logged or exposed to external systems, so there is no information leakage to attackers. However, the error strings expose internal token names (e.g., "Unknown token: xyz"). While this is not a critical vulnerability, it can aid an attacker in crafting malformed expressions. | Low | Low | • Replace detailed error messages with generic ones (e.g., "Invalid expression").<br>• Log detailed errors to a local debug console only when a debug flag is set. |
| 5 | Performance / Resource Exhaustion | The `factorial` function uses a simple loop and can become expensive for large inputs. Similarly, `Math.pow` and `Math.log10` can produce `Infinity` or `NaN` for extreme values. | Medium | Medium | • Validate operands before performing factorial or exponentiation.<br>• Cap the maximum exponent (e.g., 10^10) and factorial (e.g., 170!).<br>• Provide user feedback when a calculation is too large. |
| 6 | Accessibility & UX | Not a security issue, but the UI relies on `aria-live` regions for error and display updates. If the screen reader interprets the error region as a live alert, it may read out internal error details. | Low | Low | • Use `aria-live="polite"` for non‑critical updates and `assertive` only for genuine alerts.<br>• Ensure error messages are concise and user‑friendly. |
| 7 | Cross‑Site Scripting (XSS) | The code uses `textContent` for all dynamic text, preventing HTML injection. No `innerHTML` or `eval` is used. | Low | Low | • Continue using `textContent` or `setAttribute('value', ...)` for all dynamic content.<br>• If future features involve user‑generated HTML, enforce strict sanitization. |
| 8 | Content Security Policy (CSP) | The application does not declare a CSP. While the current code is safe, a CSP can protect against future changes or accidental inclusion of unsafe scripts. | Low | Low | • Add a default CSP header (e.g., `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self';`) to the server or embed it in a meta tag. |

## Summary of Recommendations
1. **Input Length & Complexity Limits** – Prevent extremely long or deeply nested expressions.
2. **Operation Caps** – Reject factorials > 170 and exponentials that would overflow.
3. **Error Message Sanitization** – Use generic error messages for end‑users.
4. **Performance Safeguards** – Consider off‑loading heavy calculations to a Web Worker.
5. **CSP Implementation** – Add a CSP to guard against future script injection.
6. **Logging** – Keep detailed logs in a debug mode, not exposed to users.

## Security Score
The application demonstrates good security hygiene for a client‑side calculator. The primary concerns are potential DoS via large computations and overly verbose error messages. After applying the above mitigations, the risk profile would be near‑zero.

**Score: 95/100**

## Vulnerabilities List
- **Potential DoS via large factorial/exponent calculations**
- **Verbose error messages exposing internal token names**
- **No CSP declared**

---

*Prepared by: Security Architect – Automated Audit*