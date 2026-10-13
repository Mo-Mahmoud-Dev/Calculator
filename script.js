const calculatorContainer = document.getElementById('calculator_container');
const displayArea = document.getElementById('display_area');

calculatorContainer.addEventListener('click', (e) => {
    if (e.target.nodeName === 'BUTTON') {
        switch (e.target.textContent) {
            case 'C':
                clear();
                break;
            case 'Del':
                deleteOneValue();
                break;
            case '=':
                calculate();
                break;
            default:
                addToDisplayArea(e.target.textContent);
                break;
        }
    }
});

function clear() {
    displayArea.textContent = '';
}

function addToDisplayArea(value) {
    displayArea.textContent += value;
}

function deleteOneValue() {
    let currentContent = displayArea.textContent;
    displayArea.textContent = currentContent.substring(0, currentContent.length - 1);
}

function calculate() {
    const expression = displayArea.textContent.trim();
    if (!expression) return;

    try {
        displayArea.textContent = math.evaluate(expression);
    } catch (error) {
        displayArea.textContent = 'Error';
    }
}
