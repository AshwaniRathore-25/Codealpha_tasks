document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const expressionDisplay = document.getElementById('expressionDisplay');
  const mainDisplay = document.getElementById('mainDisplay');
  const previewDisplay = document.getElementById('previewDisplay');
  const keypad = document.querySelector('.keypad');
  const themeToggle = document.getElementById('themeToggle');
  const historyToggle = document.getElementById('historyToggle');
  const historyPanel = document.getElementById('historyPanel');
  const closeHistory = document.getElementById('closeHistory');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // State Variables
  let currentInput = '0';
  let firstOperand = null;
  let operator = null;
  let waitingForSecondOperand = false;
  let fullExpression = '';
  let calculationDone = false;
  let history = JSON.parse(localStorage.getItem('calc_history') || '[]');

  // Operations Mapping
  const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '×': (a, b) => a * b,
    '÷': (a, b) => b === 0 ? 'Error' : a / b
  };

  // Initialize
  updateDisplay();
  renderHistory();

  // --- Display Updates & Formatting ---
  function formatNumber(num) {
    if (typeof num === 'string' && (num === 'Error' || num === 'Cannot divide by 0')) return num;
    const n = Number(num);
    if (isNaN(n)) return 'Error';
    
    // Avoid floating point inaccuracy (e.g., 0.1 + 0.2 = 0.30000000000000004)
    const fixed = parseFloat(n.toFixed(10));
    
    // If number is huge or tiny, use exponential
    if (Math.abs(fixed) > 1e12 || (Math.abs(fixed) < 1e-6 && fixed !== 0)) {
      return fixed.toExponential(6);
    }

    // Format with commas for integer part if reasonable
    const parts = fixed.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  function updateDisplay() {
    mainDisplay.textContent = formatNumber(currentInput);
    
    // Auto scale font size if length is large
    if (currentInput.length > 10) {
      mainDisplay.style.fontSize = '1.8rem';
    } else if (currentInput.length > 7) {
      mainDisplay.style.fontSize = '2.1rem';
    } else {
      mainDisplay.style.fontSize = '2.5rem';
    }

    expressionDisplay.textContent = fullExpression;

    // Real-time Preview Calculation
    if (operator && firstOperand !== null && !waitingForSecondOperand && currentInput !== 'Error') {
      const secondOperand = parseFloat(currentInput.replace(/,/g, ''));
      if (!isNaN(secondOperand)) {
        const previewResult = operations[operator](firstOperand, secondOperand);
        if (previewResult === 'Error') {
          previewDisplay.textContent = '= Cannot divide by 0';
        } else {
          previewDisplay.textContent = '= ' + formatNumber(previewResult);
        }
      } else {
        previewDisplay.textContent = '';
      }
    } else {
      previewDisplay.textContent = '';
    }

    updateActiveOperator();
  }

  function updateActiveOperator() {
    document.querySelectorAll('.btn-operator').forEach(btn => {
      if (waitingForSecondOperand && btn.dataset.value === operator) {
        btn.classList.add('active-op');
      } else {
        btn.classList.remove('active-op');
      }
    });
  }

  // --- Input Handlers ---
  function inputDigit(digit) {
    if (calculationDone) {
      currentInput = digit;
      fullExpression = '';
      calculationDone = false;
    } else if (waitingForSecondOperand) {
      currentInput = digit;
      waitingForSecondOperand = false;
    } else {
      currentInput = currentInput === '0' ? digit : currentInput + digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (calculationDone) {
      currentInput = '0.';
      fullExpression = '';
      calculationDone = false;
      updateDisplay();
      return;
    }

    if (waitingForSecondOperand) {
      currentInput = '0.';
      waitingForSecondOperand = false;
      updateDisplay();
      return;
    }

    if (!currentInput.includes('.')) {
      currentInput += '.';
      updateDisplay();
    }
  }

  function handleOperator(nextOperator) {
    const inputValue = parseFloat(currentInput.replace(/,/g, ''));

    if (isNaN(inputValue)) return;

    if (firstOperand === null) {
      firstOperand = inputValue;
    } else if (operator && !waitingForSecondOperand) {
      const result = operations[operator](firstOperand, inputValue);
      
      if (result === 'Error') {
        handleError('Cannot divide by 0');
        return;
      }
      
      firstOperand = parseFloat(parseFloat(result.toFixed(10)));
      currentInput = String(firstOperand);
    }

    waitingForSecondOperand = true;
    operator = nextOperator;
    fullExpression = `${formatNumber(firstOperand)} ${operator}`;
    calculationDone = false;
    updateDisplay();
  }

  function handleCalculate() {
    if (firstOperand === null || operator === null || waitingForSecondOperand) return;

    const secondOperand = parseFloat(currentInput.replace(/,/g, ''));
    if (isNaN(secondOperand)) return;

    const exprString = `${formatNumber(firstOperand)} ${operator} ${formatNumber(secondOperand)}`;
    const result = operations[operator](firstOperand, secondOperand);

    if (result === 'Error') {
      handleError('Cannot divide by 0');
      return;
    }

    const finalResult = parseFloat(parseFloat(result.toFixed(10)));
    const formattedRes = formatNumber(finalResult);

    // Save to History
    addHistoryItem(exprString, formattedRes);

    fullExpression = `${exprString} =`;
    currentInput = String(finalResult);
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    calculationDone = true;

    updateDisplay();
  }

  function handleBackspace() {
    if (calculationDone) {
      clearAll();
      return;
    }

    if (waitingForSecondOperand) return;

    if (currentInput.length > 1) {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = '0';
    }
    updateDisplay();
  }

  function handlePercent() {
    const val = parseFloat(currentInput.replace(/,/g, ''));
    if (isNaN(val)) return;

    const percentVal = val / 100;
    currentInput = String(parseFloat(percentVal.toFixed(10)));
    updateDisplay();
  }

  function handleToggleSign() {
    const val = parseFloat(currentInput.replace(/,/g, ''));
    if (isNaN(val) || val === 0) return;

    currentInput = String(val * -1);
    updateDisplay();
  }

  function clearAll() {
    currentInput = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    fullExpression = '';
    calculationDone = false;
    updateDisplay();
  }

  function handleError(msg) {
    currentInput = msg;
    fullExpression = '';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    calculationDone = true;
    updateDisplay();
  }

  // --- Click Events ---
  keypad.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    triggerButtonVisual(target);

    const { action, value } = target.dataset;

    if (!action && value !== undefined) {
      if (value === '.') {
        inputDecimal();
      } else {
        inputDigit(value);
      }
      return;
    }

    switch (action) {
      case 'operator':
        handleOperator(value);
        break;
      case 'calculate':
        handleCalculate();
        break;
      case 'clear-all':
        clearAll();
        break;
      case 'backspace':
        handleBackspace();
        break;
      case 'percent':
        handlePercent();
        break;
      case 'toggle-sign':
        handleToggleSign();
        break;
    }
  });

  // --- Keyboard Support ---
  window.addEventListener('keydown', (e) => {
    // Prevent scrolling or unwanted default actions for calc keys
    if (['+', '-', '*', '/', '=', 'Enter', 'Backspace', 'Escape', '%'].includes(e.key)) {
      e.preventDefault();
    }

    let btnSelector = null;

    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key);
      btnSelector = `#btn-${e.key}`;
    } else if (e.key === '.') {
      inputDecimal();
      btnSelector = '#btn-decimal';
    } else if (e.key === '+') {
      handleOperator('+');
      btnSelector = '#btn-add';
    } else if (e.key === '-') {
      handleOperator('-');
      btnSelector = '#btn-subtract';
    } else if (e.key === '*') {
      handleOperator('×');
      btnSelector = '#btn-multiply';
    } else if (e.key === '/') {
      handleOperator('÷');
      btnSelector = '#btn-divide';
    } else if (e.key === '=' || e.key === 'Enter') {
      handleCalculate();
      btnSelector = '#btn-equals';
    } else if (e.key === 'Backspace') {
      handleBackspace();
      btnSelector = '#btn-backspace';
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      clearAll();
      btnSelector = '#btn-AC';
    } else if (e.key === '%') {
      handlePercent();
      btnSelector = '#btn-percent';
    }

    if (btnSelector) {
      const btn = document.querySelector(btnSelector);
      if (btn) triggerButtonVisual(btn);
    }
  });

  function triggerButtonVisual(button) {
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 120);
  }

  // --- Theme Toggle ---
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    themeToggle.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '🌙' : '☀️';
  });

  // --- History Drawer ---
  historyToggle.addEventListener('click', () => {
    historyPanel.classList.toggle('open');
  });

  closeHistory.addEventListener('click', () => {
    historyPanel.classList.remove('open');
  });

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    localStorage.removeItem('calc_history');
    renderHistory();
  });

  function addHistoryItem(expr, res) {
    history.unshift({ expr, res, id: Date.now() });
    if (history.length > 20) history.pop(); // Keep last 20
    localStorage.setItem('calc_history', JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = '<p class="no-history">No calculations yet</p>';
      return;
    }

    historyList.innerHTML = history.map(item => `
      <div class="history-item" data-res="${item.res}">
        <div class="history-expr">${item.expr}</div>
        <div class="history-res">${item.res}</div>
      </div>
    `).join('');

    // Click on history item to paste result into current calculation
    document.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const rawRes = item.dataset.res.replace(/,/g, '');
        currentInput = rawRes;
        calculationDone = false;
        updateDisplay();
      });
    });
  }
});
