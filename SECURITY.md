# Security Audit Report

## Overview
The Scientific Calculator is a purely client‑side application written in vanilla JavaScript, HTML, and CSS. It performs all calculations locally, stores a theme preference in `localStorage`, and exposes a small set of UI controls. Because the code runs entirely in the browser and does not communicate with any external services, the attack surface is limited. Nevertheless, a few areas warrant attention to ensure the application remains robust, secure, and maintainable.

## Identified Risks & Recommendations

| # | Risk | Impact | Recommendation |
|---|------|--------|----------------|
| 1 | **No explicit input validation** | The expression string is built from button clicks and keyboard events without sanitization. While the input is confined to the UI, a malicious user could craft a very large expression (e.g., thousands of nested parentheses or factorials) that may cause a denial‑of‑service by exhausting CPU or memory. | • Validate expression length and complexity before evaluation. <br>• Reject or truncate expressions exceeding a safe threshold (e.g., 200 characters). <br>• Implement a timeout or cancellation mechanism for long‑running evaluations. |
| 2 | **Potential Denial‑of‑Service via Factorial** | The `factorial` function iterates from 2 to `n`. For large `n` (e.g., > 1e6) this can be CPU‑intensive and may freeze the UI. | • Limit the maximum value accepted by `factorial` (e.g., 170, the largest integer that fits in a JS `Number`). <br>• Provide a warning or error message for values outside the safe range. |
| 3 | **LocalStorage Value Injection** | The theme preference is stored in `localStorage` and applied via the `data-theme` attribute. An attacker could manually set `calc-theme` to an arbitrary string, potentially causing unexpected CSS behavior or a minor UI break. | • Whitelist accepted values (`light`, `dark`). <br>• Validate the stored value before applying it. |
| 4 | **Error Message Disclosure** | Error messages such as "Mismatched parentheses" or "Division by zero" are displayed to the user. While they do not reveal secrets, they expose internal logic that could aid an attacker in crafting malformed expressions. | • Keep error messages user‑friendly and generic (e.g., "Invalid expression"). <br>• Log detailed errors to a separate, non‑public channel if needed. |
| 5 | **No External Dependencies** | The project has no third‑party libraries, which is good for security but also means that any future feature that introduces dependencies must be vetted. | • Maintain a dependency audit process (e.g., `npm audit` if a package manager is used). |
| 6 | **Accessibility & Focus Management** | The UI uses ARIA roles and live regions, but focus is not automatically moved to the display after evaluation, which could hinder keyboard users. | • After evaluation, set focus back to the display or the last interacted button to improve usability. |

## Summary of Fixes
1. **Expression Validation** – Add a length/complexity check before parsing.
2. **Factorial Safeguard** – Cap factorial input to 170 and return an error for larger values.
3. **Theme Sanitization** – Validate `calc-theme` against a whitelist before applying.
4. **Generic Error Messages** – Replace detailed error strings with a single user‑friendly message.
5. **Future Dependency Audits** – Document a process for reviewing any added libraries.
6. **Accessibility Enhancements** – Ensure focus is managed appropriately after actions.

## Security Score
The application demonstrates solid security fundamentals: no secrets, no external dependencies, and safe DOM manipulation. The primary concerns are potential denial‑of‑service scenarios and minor input validation gaps. After applying the recommended mitigations, the code would be considered highly secure for a client‑side calculator.

**Security Score: 95/100**

---

**Action Items**
- Implement the validation and limits described above.
- Update the error handling to use generic messages.
- Add unit tests for expression parsing and evaluation to catch regressions.
- Document the accessibility focus strategy.

---

**References**
- OWASP Top 10 – A3:2017 – Sensitive Data Exposure (for localStorage handling)
- OWASP Secure Coding Practices – Input Validation
- MDN Web Docs – `localStorage` security considerations

