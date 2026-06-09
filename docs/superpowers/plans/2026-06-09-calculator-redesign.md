# Calculator Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, complete standard calculator while keeping the project dependency-free and static.

**Architecture:** Keep `index.html`, `style.css`, and `script.js`. Add `tests/calculator.test.js` for Node tests. In `script.js`, isolate a pure `CalculatorEngine` from DOM code so behavior can be tested without a browser.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Node built-in `node:test` and `assert`.

---

### Task 1: Calculation Engine Tests

**Files:**
- Create: `tests/calculator.test.js`
- Modify: `script.js`

- [ ] Add tests that load `CalculatorEngine` from `script.js`.
- [ ] Cover precedence, parentheses, decimal arithmetic, percent, square, square root, reciprocal, sign toggle, and division-by-zero errors.
- [ ] Run `node --test tests/calculator.test.js` and verify the tests fail before implementing the engine export.

### Task 2: Calculation Engine

**Files:**
- Modify: `script.js`

- [ ] Replace `eval`-based expression handling with tokenization, shunting-yard conversion, and RPN evaluation.
- [ ] Add helper operations for square, square root, reciprocal, percent, and sign toggle.
- [ ] Export `CalculatorEngine` under CommonJS when running in Node.
- [ ] Run `node --test tests/calculator.test.js` and verify it passes.

### Task 3: UI Structure

**Files:**
- Modify: `index.html`

- [ ] Update the calculator markup with semantic display, status, keypad, and history areas.
- [ ] Add buttons for AC, CE, parentheses, percent, square root, reciprocal, square, sign toggle, four operators, decimal, equals, and backspace.
- [ ] Keep all controls accessible through button text and ARIA labels where icon-like symbols are used.

### Task 4: Visual Redesign

**Files:**
- Modify: `style.css`

- [ ] Replace the current glass-heavy theme with a restrained, clean calculator surface.
- [ ] Use responsive sizing, stable grid tracks, visible focus states, and mobile-friendly touch targets.
- [ ] Style number, function, operator, danger, and equals buttons consistently.
- [ ] Add compact history styling without nested card layouts.

### Task 5: UI Controller

**Files:**
- Modify: `script.js`

- [ ] Wire all buttons to the new engine and state model.
- [ ] Add keyboard support for digits, operators, parentheses, percent, Enter, Backspace, Delete, Escape, and clear shortcuts.
- [ ] Render recent history and allow clicking a history item to reuse its result.
- [ ] Keep error recovery smooth after invalid expressions.

### Task 6: Verification

**Files:**
- Test: `tests/calculator.test.js`
- Manual: `index.html`

- [ ] Run `node --test tests/calculator.test.js`.
- [ ] Start a static server with `python3 -m http.server`.
- [ ] Open the app in the browser and verify desktop and mobile screenshots render without overlap.
- [ ] Exercise mouse and keyboard flows for basic arithmetic, functions, history, and error recovery.
