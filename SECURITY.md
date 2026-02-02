# Security Audit

## Overview
The project is a simple vanilla JavaScript calculator. It contains no external dependencies, no hard‑coded secrets, and no server‑side code. The main security concerns revolve around the way arithmetic expressions are evaluated and the lack of a Content‑Security‑Policy.

## Identified Risks

1. **Use of `Function` constructor for evaluating user input**
   - The `evaluateExpression` function sanitises the expression with a regular expression and then passes it to `new Function`. While the regex is strict, any future change or a missed edge‑case could allow arbitrary JavaScript code to be executed. This is a classic code‑injection risk.
   - **Fix**: Replace the `Function` constructor with a small, well‑tested expression parser (e.g. `mathjs`, `expr-eval`) or implement a simple shunting‑yard algorithm.

2. **Missing Content‑Security‑Policy (CSP)**
   - The application does not declare a CSP. If the page is ever served from a domain that allows inline scripts or external script injection, an attacker could inject malicious code. While the current code is static, a CSP would provide an additional safety net.
   - **Fix**: Add a CSP header such as `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self';` or use a meta tag.

3. **No explicit error handling for extremely large or NaN results**
   - The calculator displays the raw string representation of the result. Very large numbers may be rendered in scientific notation, which could be confusing but is not a security issue.
   - **Fix**: Optionally format large numbers or clamp the result to a reasonable range.

## Recommendations

- **Replace the `Function` constructor** with a safer evaluation method.
- **Add a CSP** to mitigate XSS and code injection.
- **Validate and sanitize** the expression more defensively if the regex is ever extended.
- **Consider adding unit tests** for edge cases (e.g. division by zero, nested parentheses).

## Security Score
The application is largely safe due to its simplicity, but the use of `Function` and lack of CSP lower the score.

**Score: 90/100**

## Summary
Overall, the calculator is a low‑risk front‑end component. The main improvement area is the evaluation strategy and the addition of a CSP.
