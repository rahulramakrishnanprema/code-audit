# Security Audit

## Project Overview
The project is a simple vanilla‑JavaScript calculator consisting of three files:
- **index.html** – UI markup
- **style.css** – styling
- **script.js** – calculator logic

The application runs entirely in the browser with no backend, external APIs, or third‑party libraries.

## Audit Findings

| # | Category | Issue | Impact | Severity | Recommendation |
|---|----------|-------|--------|----------|----------------|
| 1 | **Code Quality** | Use of `eval()` for expression evaluation | `eval()` can execute arbitrary JavaScript if the input is not properly sanitized. Although a regex is used to filter the expression, reliance on `eval()` is generally discouraged. | **Low** | Replace `eval()` with a simple arithmetic parser or use a library like `mathjs` that is designed for safe evaluation. |
| 2 | **Input Validation** | Expression validation only allows characters `[-+*/0-9\.\s]` | The regex blocks many dangerous characters, but does not prevent malformed expressions such as `1++2` or `1..2`. These could produce `NaN` or other unexpected results, but do not expose security flaws. | **Low** | Add stricter validation or use a parser that can detect syntactically invalid expressions. |
| 3 | **Error Handling** | Errors are shown as a generic `Error` string | No stack traces or sensitive information are exposed, which is good. However, the UI does not differentiate between types of errors (e.g., syntax vs. division by zero). | **Informational** | Provide user‑friendly error messages if desired, but keep them generic to avoid leaking implementation details. |
| 4 | **Secrets / Credentials** | None detected | No hard‑coded secrets or API keys are present. | N/A |
| 5 | **Dependencies** | None | No external dependencies, so no risk of vulnerable libraries. | N/A |
| 6 | **Cross‑Site Scripting (XSS)** | `updateDisplay` uses `textContent` | Using `textContent` prevents injection of HTML or scripts. | **Low** |
| 7 | **Denial of Service** | No rate limiting or size checks on the expression | A malicious user could input a very large expression, potentially causing a temporary slowdown. | **Low** | Limit the length of `expression` (e.g., max 100 characters) and provide user feedback if exceeded. |
| 8 | **Content Security Policy** | No CSP headers set | In a static site this is not a major issue, but adding a CSP can mitigate XSS in future expansions. | **Informational** | Add a minimal CSP such as `default-src 'self'; script-src 'self'` in the HTML `<head>`. |

## Summary of Risks
- **eval() usage** – considered an anti‑pattern; replace with a safe parser.
- **Expression length** – potential for performance issues.
- **No CSP** – could be added for future safety.

## Recommended Fixes
1. **Replace `eval()`**
   ```js
   // Simple safe evaluator (supports +,-,*,/ only)
   function safeEval(expr) {
     const tokens = expr.match(/\d+\.?\d*|[+\-*/]/g);
     if (!tokens) return 'Error';
     const stack = [];
     let current = 0;
     let op = '+';
     tokens.forEach(tok => {
       if (!isNaN(tok)) {
         const num = parseFloat(tok);
         switch (op) {
           case '+': current += num; break;
           case '-': current -= num; break;
           case '*': current *= num; break;
           case '/': current /= num; break;
         }
       } else {
         op = tok;
       }
     });
     return current.toString();
   }
   ```
2. **Limit expression length** – add a check before appending a new character.
3. **Add CSP** – insert `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">` in the `<head>`.
4. **Optional** – provide user‑friendly error messages.

## Security Score
The application is a small, self‑contained front‑end with no secrets or external dependencies. The main security concern is the use of `eval()`. After addressing the recommendations, the risk profile becomes very low.

**Security Score: 92/100**

- 10 points deducted for `eval()` usage.
- 1 point deducted for lack of expression length validation.
- 1 point deducted for missing CSP.

## Vulnerabilities List
- Use of `eval()` for expression evaluation.
- No expression length validation.
- No CSP headers.

---

**Next Steps**
- Implement the suggested safe evaluator.
- Add expression length checks.
- Add CSP meta tag.
- Run a quick unit test to ensure calculator functionality remains unchanged.
