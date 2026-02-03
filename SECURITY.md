# Security Audit Report

## 1. Overview
The Scientific Calculator is a purely client‑side application written in vanilla JavaScript, HTML and CSS. It has no external dependencies, no network communication and no secrets. The audit focuses on:

- Hardcoded secrets
- Insecure dependencies
- Input validation gaps
- Error handling and information leakage
- Denial‑of‑Service (DoS) vectors

## 2. Findings

| # | Category | Risk | Impact | Likelihood | Recommendation |
|---|----------|------|--------|------------|----------------|
| 1 | Hardcoded Secrets | None | N/A | N/A | N/A |
| 2 | Insecure Dependencies | None | N/A | N/A | N/A |
| 3 | Input Validation | *Multiple decimal points* (e.g., `1..2`) are accepted and parsed as `1.` followed by a new number, which may lead to confusing results. | Low | Medium | Add a stricter number parser that rejects multiple decimal points and other malformed numeric literals.
| 4 | Input Validation | *Large factorials* (up to 170!) are allowed. While 170! fits in a JS number, the loop is still CPU‑intensive and can be abused for DoS. | Medium | Medium | Keep the current `MAX_FACTORIAL` guard but consider limiting the loop iterations or adding a timeout for evaluation.
| 5 | Input Validation | *Division by zero* and *modulo by zero* produce `Infinity` or `NaN`. These values are then stored in memory or displayed, potentially propagating errors. | Low | Medium | Explicitly check for division/modulo by zero and return a user‑friendly error.
| 6 | Input Validation | *Memory functions* can store `Infinity`, `-Infinity` or `NaN` when the display contains such values. Subsequent calculations will then produce `NaN` or `Infinity`. | Low | Medium | Validate the value before storing it in memory; reject non‑finite numbers.
| 7 | Error Handling | Detailed stack traces are logged to the console (`console.error`). While not a direct security issue, it can aid an attacker in debugging the client code. | Low | Low | Keep console logging for development, but consider stripping stack traces in production builds.
| 8 | DoS | *Expression length* is limited to 100 tokens, but a user could still craft a 100‑token expression that triggers heavy computation (e.g., many nested factorials). | Medium | Medium | Add a per‑evaluation CPU time budget or a more aggressive token limit.
| 9 | DoS | *Keyboard support* does not handle the `m` key, which could lead to unexpected behavior if a user types `m` and then presses `=`. The parser will treat it as an unknown function and throw an error. | Low | Low | Either ignore unknown characters or map `m` to a meaningful action.

## 3. Recommendations
1. **Improve numeric parsing** – Reject numbers with multiple decimal points and other malformed literals.
2. **Guard factorial evaluation** – Keep `MAX_FACTORIAL` but consider a per‑evaluation timeout or a stricter limit on the number of factorial operations.
3. **Validate memory storage** – Reject `Infinity`, `-Infinity` and `NaN` before storing them.
4. **Handle division/modulo by zero** – Detect and return a clear error message.
5. **Refine error handling** – Keep console logs for debugging but avoid exposing stack traces in production.
6. **Enhance DoS protection** – Increase the token limit or add a CPU budget for evaluation.
7. **Keyboard handling** – Remove or repurpose the unused `m` key to avoid confusing errors.

## 4. Security Score
The application is a low‑risk, client‑side tool with no secrets or external dependencies. The main concerns are user‑experience related and minor DoS vectors that can be mitigated with simple checks.

**Score: 92/100**

---

## 5. Vulnerabilities Summary
- Potential DoS via large factorial expressions
- Memory functions can store non‑finite values (Infinity/NaN)
- Missing validation for multiple decimal points
- Division or modulo by zero can propagate NaN/Infinity
- Unhandled `m` key in keyboard support
- Console logs expose stack traces in production

