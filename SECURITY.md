# Security Audit Report

## Project Overview
The project is a simple vanilla‑JS calculator consisting of an HTML UI, CSS styling, and a single JavaScript file that handles input, validation, and expression evaluation.

## Findings

| # | Category | Issue | Impact | Likelihood |
|---|----------|-------|--------|------------|
| 1 | Runtime | **Use of `Function` constructor** to evaluate user‑supplied expressions. | Medium – if the validation regex is bypassed or extended, arbitrary code could be executed. | Low – current regex is strict, but the approach is inherently risky. |
| 2 | Runtime | **Potential XSS if the validation regex fails** or is modified. | Medium – an attacker could inject malicious characters that bypass the regex and trigger code execution. | Low – the regex is currently tight, but future changes could introduce a flaw. |
| 3 | Deployment | **Missing Content Security Policy (CSP)** header. | Low – without CSP, the page is more susceptible to XSS if a malicious script is injected via other means (e.g., compromised CDN). | Medium – CSP is a best practice for all web pages. |

### Additional Observations
- No hardcoded secrets or API keys are present.
- No external dependencies are used, so dependency‑related risks are absent.
- Input validation is performed via a regex that allows only digits, operators, parentheses, decimal points, percent signs, and whitespace.
- Error handling is minimal but does not leak sensitive information.
- The UI uses a `readonly` input; however, a malicious user could still manipulate the DOM via the console.

## Recommendations
1. **Replace the `Function` constructor** with a dedicated math‑parsing library (e.g., `math.js`, `expr-eval`) or implement a simple parser that only supports the required operators. This eliminates the risk of arbitrary code execution.
2. **Strengthen input validation** by explicitly rejecting any characters outside the allowed set and by sanitizing the expression before evaluation. Consider using a whitelist approach and rejecting any unexpected tokens.
3. **Add a Content Security Policy** header (e.g., `Content-Security-Policy: default-src 'self'; script-src 'self'; object-src 'none';`) to mitigate XSS attacks.
4. **Implement a more robust error handling strategy** – instead of `alert`, display user‑friendly messages in the UI and log detailed errors to a server‑side endpoint if needed.
5. **Consider disabling the `readonly` attribute** only after ensuring that the input cannot be tampered with via the console or by adding a small obfuscation layer.

## Security Score
The project demonstrates good practices in terms of minimal dependencies and clear input validation. However, the use of the `Function` constructor and the absence of a CSP introduce moderate risk. Overall, the security posture is acceptable for a simple client‑side calculator but can be improved.

**Score: 90/100**

---

*Prepared by: Security Architect*