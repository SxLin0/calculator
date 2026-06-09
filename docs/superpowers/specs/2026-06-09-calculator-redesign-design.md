# Calculator Redesign Design

## Goal

Optimize the existing static web calculator so it is simpler to maintain, more polished visually, and complete enough for everyday calculator use.

## Scope

Build a full standard calculator, not a scientific calculator. The calculator will support numbers, decimals, binary operators, parentheses, percent, square, square root, reciprocal, sign toggle, AC, CE, backspace, equals, keyboard input, error messages, and a compact history list.

## Architecture

Keep the app as plain HTML, CSS, and JavaScript with no build step. Split JavaScript into a small calculation engine and UI controller inside `script.js`, exposing pure calculation helpers for direct Node-based tests while still working in the browser.

The calculation engine will parse expressions with tokenization and the shunting-yard algorithm instead of using `eval`. The UI controller will own input state, display formatting, button events, keyboard mapping, and history rendering.

## Interface

The page will remain a single calculator surface. The display shows the expression, current value, and status text. The keypad uses a clear standard layout with stable button sizes and touch-friendly spacing. A small history panel shows recent completed calculations and can restore a result when clicked.

## Error Handling

Invalid input, division by zero, malformed expressions, and invalid functions will show a readable `错误` state and reset cleanly on the next number or AC action.

## Testing

Add a Node test file for pure calculation behavior. Cover operator precedence, parentheses, decimals, percent, unary negative values, square root, reciprocal, division by zero, and expression formatting edge cases.
