# Security Audit Report

## Project Overview
The project is a simple client‑side calculator built with vanilla HTML, CSS, and JavaScript. It contains no server‑side code, external dependencies, or network communication. The primary functionality is to accept user input via button clicks, build an arithmetic expression, evaluate it, and display the result.

## Findings

| # | Category | Risk | Impact | Likelihood | Recommendation |
|---|----------|------|--------|------------|----------------|
| 1 | **Code Quality** | Use of `new Function` for evaluation | **High** – `new Function` executes arbitrary JavaScript. If an attacker can inject characters into the expression (e.g., by modifying the DOM or adding a malicious button), they could run arbitrary code. | **Low** – Current UI only exposes digits, operators, and a decimal point, but the code is still vulnerable if the UI is tampered with or if future changes introduce new input sources. | Replace the `new Function` approach with a safe arithmetic parser (e.g., `mathjs`, a custom shunting‑yard implementation, or a simple recursive descent parser). |
| 2 | **Input Validation** | No length or complexity limits on the expression | **Medium** – Extremely long expressions could cause performance issues or stack overflows in the evaluation step. | **Low** – Attackers would need to craft a very long input, which is unlikely in a typical calculator use case. | Enforce a reasonable maximum length (e.g., 100 characters) and reject or truncate longer inputs. |
| 3 | **Error Handling** | Generic error messages (`"Error"`) but no logging | **Low** – The UI does not expose stack traces, but the lack of logging makes debugging difficult. | **Low** – Not a direct security risk. | Add optional client‑side logging (e.g., to a remote error‑tracking service) for diagnostics while keeping the UI message generic. |
| 4 | **Hardcoded Secrets** | None | **N/A** | **N/A** | No action needed. |
| 5 | **Dependencies** | None | **N/A** | **N/A** | No action needed. |
| 6 | **Content Security Policy (CSP)** | No CSP header or meta tag | **Medium** – Without CSP, the page is vulnerable to XSS if an attacker can inject `<script>` tags via other vectors (e.g., if the page is embedded in a larger application). | **Low** – The current page is static, but future integration could expose it to injection. | Add a CSP meta tag such as `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self';">` to restrict script execution to the same origin. |
| 7 | **Accessibility / UX** | Not a security issue | **N/A** | **N/A** | No action needed. |

## Summary of Risks
1. **Arbitrary code execution via `new Function`** – The most significant risk. |
2. **Potential for denial‑of‑service via very long expressions** – Mitigated by input length checks. |
3. **Missing CSP** – Adds a layer of protection against XSS if the page is later embedded or extended. |

## Recommendations
1. **Replace `new Function`** with a safe arithmetic parser. A lightweight implementation can be written in plain JavaScript or a small library like `mathjs` can be used if future features require more complex math. |
2. **Implement input length limits** to prevent performance degradation. |
3. **Add a CSP meta tag** to restrict script execution to the same origin. |
4. **Optional** – Add client‑side logging for errors to aid debugging without exposing sensitive data. |

## Security Score
The project is a minimal, client‑side application with no external dependencies or secrets. The primary security concern is the use of `new Function` for evaluation. After applying the recommended mitigations, the application would be considered secure for its intended use.

**Score: 90/100** – The score reflects the low complexity of the application and the fact that the major risk can be mitigated with straightforward changes.

---

## Vulnerabilities List
- Use of `new Function` for expression evaluation
- No input length validation
- No Content Security Policy

