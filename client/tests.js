testsGrid = document.querySelector('.adviсe-grid');

async function fetchTests() {
    try {
        const response = await fetch('/api/tests');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tests = await response.json();
        return tests;
    } catch (error) {
        console.error('Ошибка при получении тестов:', error);
        throw error;
    }
}

async function loadTests() {
    try {
        const tests = await fetchTests();
        testsGrid.innerHTML = '';
        tests.forEach(test => {
            testsGrid.innerHTML += `
            <div class="tests-card">
	        <div class="tests-card__img">
	          <img src="img/testimg.png" alt="">
	        </div>
	        <div class="tests-card__title">${test.test_name}</div>
	        <div class="tests-card__description">${test.test_description}</div>
	        <div class="tests-card__data">
	          <div class="tests-card__data--questions"><img src="img/ti1.svg" alt="">${test["questions-number"]}</div>
	          <div class="tests-card__data--attempts"><img src="img/ti2.svg" alt="">${test["passes-number"]}</div>
	        </div>
	        <button class="tests-card__button" onClick="alert('Тесты пока не доступны')">
	          <img src="img/ti3.svg" alt=""> Пройти
	        </button>
	      </div>`
        });    
    } catch (error) {
        console.log("tests error");
    }
}

loadTests()