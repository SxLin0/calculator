# 计算器（Calculator）

一个纯前端的桌面/移动友好的标准计算器，包含四则运算、括号、百分比、平方、平方根、倒数、正负号、历史记录与键盘输入支持。

## 功能概览
- 四则运算：支持优先级、括号、小数、百分比与精度处理。
- 功能键：平方（x²）、平方根（√x）、倒数（1/x）、正负号（±）、退格（⌫）、AC、CE。
- 历史记录：保存最近计算结果，点击历史项可复用结果。
- 键盘支持：数字、运算符、括号、百分号、回车/等号、退格、Delete、Esc/C。
- 体验优化：重复小数点拦截、错误状态自动恢复、除零和非法表达式提示。
- 界面：简洁浅色工具风格，适配桌面和移动端。

## 快速开始
1. 克隆代码
	 ```bash
	 git clone https://github.com/SxLin0/calculator.git
	 cd calculator
	 ```
2. 直接打开 `index.html`（双击或用浏览器打开）。无需构建或依赖。

## 测试
使用 Node.js 内置测试运行计算核心用例：
```bash
node --test tests/calculator.test.js
```

## 交互说明
- 鼠标/触屏：点击按钮输入；CE 清空；⌫ 退格；= 计算。
- 键盘：
	- 数字键 0-9、小数点 .
	- 运算符 + - * /
	- 括号 ( )、百分号 %
	- Enter 或 = 计算
	- Backspace 退格，Delete 清除当前输入
	- Esc / C 清空全部

## 项目结构
- `index.html`：页面结构
- `style.css`：样式与渐变/玻璃拟态主题
- `script.js`：计算引擎、界面状态与键盘绑定
- `tests/calculator.test.js`：计算核心测试

## 兼容性
- 现代浏览器（Chrome/Edge/Firefox/Safari 最新版本）。
- 移动端可用，建议竖屏体验。

## 许可证

本项目基于 MIT License 开源，详见 [LICENSE](LICENSE)。

