(function (root) {
  'use strict';

  const MAX_HISTORY = 6;
  const DISPLAY_PRECISION = 12;
  const OPERATORS = {
    '+': { precedence: 1, fn: (a, b) => a + b },
    '-': { precedence: 1, fn: (a, b) => a - b },
    '*': { precedence: 2, fn: (a, b) => a * b },
    '/': {
      precedence: 2,
      fn: (a, b) => {
        if (b === 0) throw new Error('除数不能为 0');
        return a / b;
      },
    },
  };

  function normalizeNumber(value) {
    if (!Number.isFinite(value)) throw new Error('结果无效');
    if (Object.is(value, -0)) return 0;
    return Number(value.toPrecision(DISPLAY_PRECISION));
  }

  function formatNumber(value) {
    const normalized = normalizeNumber(value);
    if (Number.isInteger(normalized)) return String(normalized);
    return String(normalized).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  }

  function createResult(value, expression) {
    const normalized = normalizeNumber(value);
    return {
      value: normalized,
      display: formatNumber(normalized),
      expression,
    };
  }

  function isDigit(char) {
    return char >= '0' && char <= '9';
  }

  function tokenize(expression) {
    const tokens = [];
    let i = 0;
    let expectingValue = true;

    while (i < expression.length) {
      const char = expression[i];

      if (/\s/.test(char)) {
        i += 1;
        continue;
      }

      if (isDigit(char) || char === '.' || ((char === '-' || char === '+') && expectingValue)) {
        const sign = char === '-' ? -1 : 1;
        if (char === '-' || char === '+') i += 1;

        if (expression[i] === '(' && sign === -1) {
          tokens.push({ type: 'number', value: 0 });
          tokens.push({ type: 'operator', value: '-' });
          expectingValue = true;
          continue;
        }

        let number = '';
        let dots = 0;
        while (i < expression.length && (isDigit(expression[i]) || expression[i] === '.')) {
          if (expression[i] === '.') dots += 1;
          if (dots > 1) throw new Error('数字格式不正确');
          number += expression[i];
          i += 1;
        }

        if (number === '' || number === '.') throw new Error('表达式不完整');
        tokens.push({ type: 'number', value: sign * Number(number) });
        expectingValue = false;
        continue;
      }

      if (char in OPERATORS) {
        if (expectingValue) throw new Error('表达式不完整');
        tokens.push({ type: 'operator', value: char });
        expectingValue = true;
        i += 1;
        continue;
      }

      if (char === '(') {
        tokens.push({ type: 'leftParen', value: char });
        expectingValue = true;
        i += 1;
        continue;
      }

      if (char === ')') {
        if (expectingValue) throw new Error('表达式不完整');
        tokens.push({ type: 'rightParen', value: char });
        expectingValue = false;
        i += 1;
        continue;
      }

      if (char === '%') {
        if (expectingValue) throw new Error('百分号位置不正确');
        tokens.push({ type: 'percent', value: char });
        i += 1;
        continue;
      }

      throw new Error('包含不支持的字符');
    }

    return tokens;
  }

  function toRpn(tokens) {
    const output = [];
    const stack = [];

    tokens.forEach((token) => {
      if (token.type === 'number' || token.type === 'percent') {
        output.push(token);
        return;
      }

      if (token.type === 'operator') {
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top.type !== 'operator') break;
          if (OPERATORS[top.value].precedence < OPERATORS[token.value].precedence) break;
          output.push(stack.pop());
        }
        stack.push(token);
        return;
      }

      if (token.type === 'leftParen') {
        stack.push(token);
        return;
      }

      if (token.type === 'rightParen') {
        while (stack.length && stack[stack.length - 1].type !== 'leftParen') {
          output.push(stack.pop());
        }
        if (!stack.length) throw new Error('括号不匹配');
        stack.pop();
      }
    });

    while (stack.length) {
      const token = stack.pop();
      if (token.type === 'leftParen' || token.type === 'rightParen') throw new Error('括号不匹配');
      output.push(token);
    }

    return output;
  }

  function evaluateRpn(tokens) {
    const stack = [];

    tokens.forEach((token) => {
      if (token.type === 'number') {
        stack.push(token.value);
        return;
      }

      if (token.type === 'percent') {
        if (!stack.length) throw new Error('百分号位置不正确');
        stack.push(stack.pop() / 100);
        return;
      }

      if (token.type === 'operator') {
        if (stack.length < 2) throw new Error('表达式不完整');
        const b = stack.pop();
        const a = stack.pop();
        stack.push(OPERATORS[token.value].fn(a, b));
      }
    });

    if (stack.length !== 1) throw new Error('表达式不完整');
    return normalizeNumber(stack[0]);
  }

  const CalculatorEngine = {
    evaluate(expression) {
      const cleanExpression = String(expression || '').trim();
      if (!cleanExpression) throw new Error('请输入表达式');
      const tokens = tokenize(cleanExpression);
      if (!tokens.length) throw new Error('请输入表达式');
      const last = tokens[tokens.length - 1];
      if (last.type === 'operator' || last.type === 'leftParen') throw new Error('表达式不完整');
      return createResult(evaluateRpn(toRpn(tokens)), cleanExpression);
    },

    square(expression) {
      const result = this.evaluate(expression);
      return createResult(result.value * result.value, `sqr(${result.display})`);
    },

    sqrt(expression) {
      const result = this.evaluate(expression);
      if (result.value < 0) throw new Error('不能对负数开平方');
      return createResult(Math.sqrt(result.value), `sqrt(${result.display})`);
    },

    reciprocal(expression) {
      const result = this.evaluate(expression);
      if (result.value === 0) throw new Error('除数不能为 0');
      return createResult(1 / result.value, `1/(${result.display})`);
    },

    toggleSign(expression) {
      const result = this.evaluate(expression);
      return createResult(-result.value, `negate(${result.display})`);
    },

    formatNumber,
  };

  function createCalculatorApp(engine, documentRef) {
    const displayExpression = documentRef.querySelector('[data-display-expression]');
    const displayValue = documentRef.querySelector('[data-display-value]');
    const statusText = documentRef.querySelector('[data-status]');
    const historyList = documentRef.querySelector('[data-history]');
    const buttons = Array.from(documentRef.querySelectorAll('[data-action]'));

    const state = {
      expression: '',
      result: '0',
      status: '准备就绪',
      error: false,
      history: [],
      justCalculated: false,
    };

    function readableExpression(expression) {
      return expression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/sqrt/g, '√');
    }

    function setError(error) {
      state.expression = '';
      state.result = '错误';
      state.status = error.message || '表达式无效';
      state.error = true;
      state.justCalculated = false;
      render();
    }

    function getTargetExpression() {
      return state.expression || (state.result !== '错误' ? state.result : '');
    }

    function resetAfterErrorOrResult() {
      if (state.error || state.justCalculated) {
        state.expression = '';
        state.result = '0';
        state.status = '准备就绪';
        state.error = false;
        state.justCalculated = false;
      }
    }

    function appendNumber(value) {
      resetAfterErrorOrResult();
      const parts = state.expression.split(/[+\-*/()]/);
      const current = parts[parts.length - 1];
      if (value === '.' && current.includes('.')) return;
      if (value === '.' && (state.expression === '' || /[+\-*/(]$/.test(state.expression))) {
        state.expression += '0';
      }
      state.expression += value;
      state.status = '输入中';
      render();
    }

    function appendOperator(operator) {
      if (state.error) resetAfterErrorOrResult();
      if (state.justCalculated) {
        state.expression = state.result;
        state.justCalculated = false;
      }
      if (!state.expression && state.result !== '0') state.expression = state.result;
      if (!state.expression) return;
      if (/[+\-*/]$/.test(state.expression)) {
        state.expression = state.expression.slice(0, -1) + operator;
      } else {
        state.expression += operator;
      }
      state.status = '选择运算符';
      render();
    }

    function appendToken(token) {
      resetAfterErrorOrResult();
      if (token === '(' && /[\d.)%]$/.test(state.expression)) return;
      if (token === ')') {
        const openCount = (state.expression.match(/\(/g) || []).length;
        const closeCount = (state.expression.match(/\)/g) || []).length;
        if (openCount <= closeCount || /[+\-*/(]$/.test(state.expression)) return;
      }
      state.expression += token;
      state.status = '输入中';
      render();
    }

    function addPercent() {
      if (state.error) resetAfterErrorOrResult();
      if (state.justCalculated) {
        state.expression = state.result;
        state.justCalculated = false;
      }
      if (!state.expression || /[+\-*/(]$/.test(state.expression)) return;
      state.expression += '%';
      state.status = '百分比';
      render();
    }

    function calculate() {
      const target = getTargetExpression();
      if (!target) return;
      try {
        const output = engine.evaluate(target);
        state.result = output.display;
        state.expression = '';
        state.status = `${readableExpression(output.expression)} =`;
        state.error = false;
        state.justCalculated = true;
        state.history.unshift({ expression: readableExpression(output.expression), result: output.display });
        state.history = state.history.slice(0, MAX_HISTORY);
        render();
      } catch (error) {
        setError(error);
      }
    }

    function runFunction(name) {
      const target = getTargetExpression();
      if (!target) return;
      try {
        const output = engine[name](target);
        state.result = output.display;
        state.expression = '';
        state.status = `${readableExpression(output.expression)} =`;
        state.error = false;
        state.justCalculated = true;
        state.history.unshift({ expression: readableExpression(output.expression), result: output.display });
        state.history = state.history.slice(0, MAX_HISTORY);
        render();
      } catch (error) {
        setError(error);
      }
    }

    function clearAll() {
      state.expression = '';
      state.result = '0';
      state.status = '准备就绪';
      state.error = false;
      state.justCalculated = false;
      render();
    }

    function clearEntry() {
      if (state.expression) {
        const trimmed = state.expression.replace(/(\d+\.?\d*|\.\d+)%?$/, '');
        state.expression = trimmed === state.expression ? state.expression.slice(0, -1) : trimmed;
      } else {
        state.result = '0';
      }
      state.status = '已清除当前输入';
      state.error = false;
      state.justCalculated = false;
      render();
    }

    function backspace() {
      if (state.error || state.justCalculated) {
        clearEntry();
        return;
      }
      state.expression = state.expression.slice(0, -1);
      state.status = state.expression ? '输入中' : '准备就绪';
      render();
    }

    function useHistory(index) {
      const item = state.history[index];
      if (!item) return;
      state.expression = '';
      state.result = item.result;
      state.status = `${item.expression} =`;
      state.error = false;
      state.justCalculated = true;
      render();
    }

    function handleAction(action, value) {
      if (action === 'number') appendNumber(value);
      if (action === 'operator') appendOperator(value);
      if (action === 'token') appendToken(value);
      if (action === 'percent') addPercent();
      if (action === 'equals') calculate();
      if (action === 'clear-all') clearAll();
      if (action === 'clear-entry') clearEntry();
      if (action === 'backspace') backspace();
      if (action === 'square') runFunction('square');
      if (action === 'sqrt') runFunction('sqrt');
      if (action === 'reciprocal') runFunction('reciprocal');
      if (action === 'sign') runFunction('toggleSign');
    }

    function handleKeyboard(event) {
      const key = event.key;
      if (/^[0-9]$/.test(key) || key === '.') {
        event.preventDefault();
        appendNumber(key);
        return;
      }
      if (['+', '-', '*', '/'].includes(key)) {
        event.preventDefault();
        appendOperator(key);
        return;
      }
      if (key === '(' || key === ')') {
        event.preventDefault();
        appendToken(key);
        return;
      }
      if (key === '%') {
        event.preventDefault();
        addPercent();
        return;
      }
      if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
        return;
      }
      if (key === 'Backspace') {
        event.preventDefault();
        backspace();
        return;
      }
      if (key === 'Delete') {
        event.preventDefault();
        clearEntry();
        return;
      }
      if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault();
        clearAll();
      }
    }

    function render() {
      displayExpression.textContent = state.status;
      displayValue.textContent = state.expression
        ? readableExpression(state.expression)
        : state.result;
      statusText.textContent = state.status;
      historyList.innerHTML = '';

      if (!state.history.length) {
        const empty = documentRef.createElement('li');
        empty.className = 'history-empty';
        empty.textContent = '暂无历史记录';
        historyList.appendChild(empty);
      } else {
        state.history.forEach((item, index) => {
          const li = documentRef.createElement('li');
          const button = documentRef.createElement('button');
          button.type = 'button';
          button.className = 'history-item';
          button.addEventListener('click', () => useHistory(index));
          button.innerHTML = `<span>${item.expression}</span><strong>${item.result}</strong>`;
          li.appendChild(button);
          historyList.appendChild(li);
        });
      }
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => handleAction(button.dataset.action, button.dataset.value));
    });
    documentRef.addEventListener('keydown', handleKeyboard);
    render();
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CalculatorEngine };
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => createCalculatorApp(CalculatorEngine, document));
  }

  root.CalculatorEngine = CalculatorEngine;
})(typeof globalThis !== 'undefined' ? globalThis : window);
