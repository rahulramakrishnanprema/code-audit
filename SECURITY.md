# Security Audit Report

## 1. Overview
The project is a static portfolio website consisting of a single HTML page, a CSS stylesheet, and a vanilla JavaScript file. There is no server‑side code, no external dependencies, and no user‑generated content. Consequently, the attack surface is minimal. The audit focuses on potential misconfigurations, missing best‑practice headers, and accessibility/semantic issues that could indirectly affect security.

## 2. Findings
| # | Category | Issue | Impact | Severity |
|---|----------|-------|--------|----------|
| 1 | **Missing Security Headers** | The site does not enforce HTTPS or provide HSTS. | Medium – an attacker could perform a man‑in‑the‑middle attack if the site is served over HTTP. | Medium |
| 2 | **Missing Content‑Security‑Policy (CSP)** | No CSP header or meta tag is set. | Low – a CSP would mitigate XSS if any dynamic content were added in the future. | Low |
| 3 | **External Link Handling** | The LinkedIn link uses `rel="noopener"` but not `noreferrer`. | Low – missing `noreferrer` can leak the referrer. | Low |
| 4 | **Accessibility / ARIA** | The mobile navigation toggle button lacks `type="button"`, `aria-expanded`, and `aria-controls`. | Low – not a direct security flaw but can affect usability and potentially expose the menu state to assistive technologies. | Low |
| 5 | **Potential XSS if Content Becomes Dynamic** | The HTML contains static content, but if future updates allow user‑generated content without sanitization, XSS could be introduced. | Medium – XSS can lead to credential theft or defacement. | Medium |
| 6 | **No Error Handling** | The JavaScript does not guard against missing DOM elements (e.g., `navToggle` or `nav`). | Low – a missing element could cause a runtime error but not a security breach. | Low |

### Summary of Vulnerabilities
- Missing HTTPS/HSTS enforcement
- No CSP header
- External link missing `noreferrer`
- Accessibility attributes missing on nav toggle
- Future risk of XSS if content becomes dynamic
- Minor runtime errors due to missing element checks

## 3. Recommendations
1. **Serve over HTTPS** and enable **HTTP Strict Transport Security (HSTS)** to prevent protocol downgrade attacks.
2. **Add a Content‑Security‑Policy** header or `<meta http-equiv="Content-Security-Policy" …>` to restrict script sources, style sources, and image origins. A basic policy could be:
   ```http
   Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';
   ```
3. Update external links to include `rel="noopener noreferrer"`.
4. Enhance the mobile nav toggle button:
   ```html
   <button type="button" class="nav__toggle" id="navToggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="nav">
   ```
   Update the script to toggle `aria-expanded` accordingly.
5. Add defensive checks in `script.js` to avoid runtime errors when elements are missing.
6. If future features introduce user‑generated content, always sanitize or escape output and consider using a library like DOMPurify.
7. Consider adding a `meta` tag for `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` if the site is embedded elsewhere.

## 4. Security Score
Given the minimal attack surface and absence of secrets or third‑party libraries, the project is largely secure. The primary areas for improvement are header configuration and future‑proofing against XSS. Therefore, the overall security score is:

**Score: 95/100**

---

**Vulnerabilities List**
- Missing HTTPS/HSTS enforcement
- No CSP header
- External link missing `noreferrer`
- Accessibility attributes missing on nav toggle
- Potential XSS if content becomes dynamic
- Minor runtime errors due to missing element checks
