# Security Audit

## Overview
The project is a simple vanilla‑JS calculator with no external dependencies or secrets. The code is largely client‑side and does not interact with a backend.

## Identified Risks
1. **Use of `Function` constructor** – The calculator evaluates user input via `Function('return (' + expr + ')')()`. While the input is validated against a regex, the `Function` constructor still allows arbitrary code execution if the regex is bypassed or modified.
2. **Limited input validation** – The regex only checks for allowed characters but does not enforce syntactic correctness (e.g., mismatched parentheses). Malformed expressions can cause `Function` to throw or return unexpected results.
3. **No Content‑Security‑Policy (CSP)** – The application does not set a CSP header or meta tag, leaving it vulnerable to XSS if an attacker can inject script tags via other vectors.
4. **User‑visible error messages** – The `alert('Invalid characters in expression')` exposes the exact reason for failure, which could aid an attacker in crafting malicious input.

## Recommendations
- Replace the `Function` constructor with a safe expression parser (e.g., `mathjs`, `expr-eval`) or implement a simple shunting‑yard algorithm.
- Enhance validation to check for balanced parentheses and disallow consecutive operators.
- Add a CSP meta tag such as `<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'; script-src 'self'; object-src 'none';\">`.
- Use non‑blocking error handling (e.g., display a generic error message) instead of `alert`.

## Security Score
The application scores **92/100**. It is a low‑risk, client‑side tool, but the use of `Function` and lack of CSP are the main concerns.

## Vulnerabilities
- Use of `Function` constructor for evaluating user input
- Limited input validation (no syntax checks)
- Absence of Content‑Security‑Policy
- Exposing detailed error messages via `alert`