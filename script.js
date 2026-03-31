// DOM 元素
const exprInput = document.getElementById('expr');
const resultInput = document.getElementById('result');

// 状态变量
let currentExpr = '';      // 当前表达式（显示在上方）
let lastResult = '';        // 上一次计算结果（用于连续运算）
let lastExpr = '';         // 最近一次计算的表达式（用于展示）

// 更新显示
function updateDisplay(exprOverride, resultOverride) {
    const exprText = exprOverride !== undefined
        ? exprOverride
        : (currentExpr || (lastExpr ? `${lastExpr}=` : '0'));

    const resultText = resultOverride !== undefined
        ? resultOverride
        : (lastResult || '0');

    exprInput.value = exprText;
    resultInput.value = resultText;
}

// 移除末尾无效字符（运算符或孤立的小数点）
function sanitizeExpr(expr) {
    return expr.replace(/[\+\-\*\/\.]+$/g, '');
}

// 处理数字或小数点
function handleNumber(value) {
    // 如果已有结果且未输入新运算符，则开始新的输入
    if (lastResult !== '' && currentExpr === '') {
        currentExpr = '';
        lastExpr = '';
        lastResult = '';
    }

    // 防止同一数字块重复输入多个小数点
    if (value === '.') {
        const parts = currentExpr.split(/[\+\-\*\/]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return;
        if (lastPart === '') currentExpr += '0';
    }

    currentExpr += value;
    updateDisplay();
}

// 处理运算符
function handleOperator(op) {
    // 如果表达式为空，但存在上次结果，则用上次结果作为第一个操作数
    if (currentExpr === '' && lastResult !== '') {
        currentExpr = lastResult;
        lastResult = '';
        lastExpr = '';
    }
    // 首个输入不能是运算符
    if (currentExpr === '') return;
    // 防止连续输入运算符：如果最后一位已经是运算符，则替换
    if (/[\+\-\*\/]$/.test(currentExpr)) {
        currentExpr = currentExpr.slice(0, -1) + op;
    } else {
        currentExpr += op;
    }
    updateDisplay();
}

// 计算结果
function calculate() {
    if (currentExpr === '' && lastResult !== '') {
        // 没有新表达式时直接展示上一结果
        updateDisplay(lastExpr ? `${lastExpr}=` : '0', lastResult);
        return;
    }
    if (currentExpr === '') return;

    try {
        const exprToEval = sanitizeExpr(currentExpr);
        if (exprToEval === '') return;

        // 使用 eval 计算表达式（按钮已限制字符）
        let result = eval(exprToEval);

        if (!isFinite(result)) throw new Error('Invalid result');

        // 处理浮点数精度
        if (Math.abs(result) % 1 !== 0) {
            result = parseFloat(result.toFixed(10));
        }
        lastResult = result.toString();
        lastExpr = exprToEval;
        // 清空 currentExpr 表示新开始
        currentExpr = '';
        updateDisplay(`${lastExpr}=`, lastResult);
    } catch (err) {
        currentExpr = '';
        lastResult = '';
        lastExpr = '';
        updateDisplay('错误', '错误');
    }
}

// 清除所有
function clearAll() {
    currentExpr = '';
    lastResult = '';
    lastExpr = '';
    updateDisplay();
}

// 退格
function backspace() {
    if (currentExpr !== '') {
        currentExpr = currentExpr.slice(0, -1);
        updateDisplay();
    }
}

// 平方
function square() {
    const targetExpr = currentExpr || lastResult;
    if (targetExpr !== '') {
        try {
            const exprToEval = sanitizeExpr(targetExpr);
            if (exprToEval === '') return;
            let val = eval(exprToEval);
            let result = val * val;
            if (!isFinite(result)) throw new Error('Invalid result');
            if (Math.abs(result) % 1 !== 0) {
                result = parseFloat(result.toFixed(10));
            }
            lastResult = result.toString();
            lastExpr = `${exprToEval}²`;
            currentExpr = '';
            updateDisplay(`${lastExpr}=`, lastResult);
        } catch (err) {
            currentExpr = '';
            lastResult = '';
            lastExpr = '';
            updateDisplay('错误', '错误');
        }
    }
}

// 正负号
function negate() {
    const targetExpr = currentExpr || lastResult;
    if (targetExpr !== '') {
        try {
            const exprToEval = sanitizeExpr(targetExpr);
            if (exprToEval === '') return;
            let val = eval(exprToEval);
            let result = -val;
            if (Math.abs(result) % 1 !== 0) {
                result = parseFloat(result.toFixed(10));
            }
            lastResult = result.toString();
            lastExpr = `${exprToEval}±`;
            currentExpr = '';
            updateDisplay(`${lastExpr}=`, lastResult);
        } catch (err) {
            currentExpr = '';
            lastResult = '';
            lastExpr = '';
            updateDisplay('错误', '错误');
        }
    }
}

// 绑定按钮事件
document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
        // 数字或小数点
        if (btn.hasAttribute('data-value')) {
            handleNumber(btn.getAttribute('data-value'));
        }
        // 运算符
        else if (btn.hasAttribute('data-op')) {
            handleOperator(btn.getAttribute('data-op'));
        }
        // 等号
        else if (btn.id === 'equal') {
            calculate();
        }
        // 清除
        else if (btn.id === 'clear') {
            clearAll();
        }
        // 退格
        else if (btn.id === 'backspace') {
            backspace();
        }
        // 功能按钮
        else if (btn.hasAttribute('data-func')) {
            const func = btn.getAttribute('data-func');
            if (func === 'square') square();
            else if (func === 'negate') negate();
        }
    });
});

// 键盘支持
document.body.addEventListener('keydown', (e) => {
    const key = e.key;
    // 数字 0-9
    if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleNumber(key);
    }
    // 小数点
    else if (key === '.') {
        e.preventDefault();
        handleNumber('.');
    }
    // 运算符
    else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        let op = key;
        if (key === '*') op = '*';
        if (key === '/') op = '/';
        handleOperator(op);
    }
    // 回车或等号
    else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    }
    // 退格
    else if (key === 'Backspace') {
        e.preventDefault();
        backspace();
    }
    // ESC 或 c 清除
    else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        clearAll();
    }
});

// 初始化显示
updateDisplay();
