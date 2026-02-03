# Security Audit Report

## Project Overview
The project is a simple client‑side calculator implemented with vanilla HTML, CSS, and JavaScript. It performs arithmetic operations locally in the browser and does not communicate with any external services.

## Identified Risks

| # | Risk | Description | Impact | Likelihood | Severity | Recommendation |
|---|------|-------------|--------|------------|----------|----------------|
| 1 | **Use of `Function` constructor for evaluation** | The calculator evaluates user‑supplied expressions using `Function('return ' + expression)()`. While the input is filtered by a regex, any future change or oversight could allow code injection. | Medium | Medium | High | Validate the expression with a dedicated parser or use a safe math library (e.g., `mathjs`). If you must use `Function`, ensure the regex is exhaustive and consider sandboxing. |
| 2 | **Missing Content Security Policy (CSP)** | No CSP header or meta tag is present. This leaves the page vulnerable to XSS if any future code or third‑party scripts are added. | Medium | High | High | Add a strict CSP header such as:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self';
```
or use a meta tag for static sites. |
| 3 | **No input length limit** | The `expression` string can grow arbitrarily large, potentially exhausting memory or causing a denial‑of‑service if a user enters a very long sequence. | Low | Medium | Medium | Enforce a maximum length (e.g., 256 characters) and truncate or reject longer inputs. |
| 4 | **Lack of error detail suppression** | The UI displays a generic "Error" message, which is good. However, the `catch` block swallows the actual error without logging. While this prevents information leakage, it also hinders debugging. | Low | Low | Low | Log errors to a client‑side console or a remote logging service for maintenance, but keep the user message generic. |

## Recommendations
1. **Replace the `Function` evaluator** with a safe math parser or a well‑maintained library.
2. **Implement a CSP** to mitigate XSS risks.
3. **Enforce an input length limit** to protect against DoS.
4. **Add structured error logging** for developers while keeping the UI message generic.
5. **Consider accessibility improvements** (e.g., ARIA roles for buttons) to enhance usability.

## Security Score
The project is largely secure due to its minimal surface area and lack of external dependencies. The main concerns are the use of `Function` for evaluation and the absence of a CSP. After applying the recommendations, the security posture would be near‑perfect.

**Score: 90/100**

---

### Vulnerabilities Summary
- Use of `Function` constructor for evaluating user input
- No Content Security Policy (CSP) header
- No input length limit leading to potential DoS

