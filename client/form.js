const form = document.querySelector('.authorization__login');
const emailInput = document.getElementById('login-email');
const passwordInput2 = document.getElementById('login-pass');
const rememberCheckbox = document.querySelector('.remember-me input');

async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isLoggedIn) {
            document.querySelector('.btn--outline').style.display = 'none';
            document.querySelector('.btn--primary').style.display = 'none';
            document.querySelector('.btn--lk').style.display = 'block';
            document.querySelector('.btn--logout').style.display = 'block';
            const buttonLink = document.querySelector('.adviсe-header__button-link');
            if (buttonLink) {
                buttonLink.style.display = 'block';
            }
            if (document.getElementById('switch-view')) {
                document.getElementById('switch-view').disabled = false;
            }
            return true;
        } else {
            if (document.getElementById('switch-view')) {
                document.getElementById('switch-view').checked = false;
                document.getElementById('switch-view').disabled = true;
                document.querySelectorAll('.point').forEach(el => el.style.display = 'none');
            }
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        return false;
    }
}

async function login(email, password, remember = false) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            console.log('Успешный вход:', data.user);
            checkAuth();
            if (remember) {
                localStorage.setItem('rememberMe', 'true');
            }
            document.querySelector('.btn--outline').style.display = 'none';
            document.querySelector('.btn--primary').style.display = 'none';
            document.querySelector('.btn--lk').style.display = 'block';
            document.querySelector('.btn--logout').style.display = 'block';
            closeModal();
        } else {
            alert(data.error || 'Ошибка входа');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        alert('Ошибка соединения с сервером');
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput2.value;
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;
    
    if (!email || !password) {
        alert('Заполните email и пароль');
        return;
    }
    
    await login(email, password, remember);
});

checkAuth();

document.querySelector('.btn--logout')?.addEventListener('click', async () => {
    const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    });
    
    if (response.ok) {
        localStorage.removeItem('rememberMe');
        window.location.href = '/index.html';
    }
});

// Получаем элементы формы
const form2 = document.getElementsByClassName('authorization__form')[1];
const firstNameInput = document.getElementById('registration-name');
const lastNameInput = document.getElementById('registration-surname');
const patronymicInput = document.getElementById('registration-patronymic');
const emailInput2 = document.getElementById('registration-email');
const passwordInput3 = document.getElementById('registration-pass');
const studentRadio = document.getElementById('registration-role--student');
const lecturerRadio = document.getElementById('registration-role--lecturer');
const groupInput = document.getElementById('registration-group');
const yearSelect = document.getElementById('registration-year');
const facultySelect = document.getElementById('registration-faculty');
const departmentInput = document.getElementById('registration-department');
const positionInput = document.getElementById('registration-position');

// Функция преобразования значения курса
function getYearValue(selectedOption) {
    const yearMap = {
        'year1': '1',
        'year2': '2',
        'year3': '3',
        'year4': '4',
        'year5': '5',
        'year6': '6'
    };
    return yearMap[selectedOption] || selectedOption;
}

async function register(userData) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Регистрация успешна!');
            window.location.href = '/index.html';
        } else if (response.status === 409) {
            alert(data.error || 'Пользователь с таким email уже существует');
        } else if (data.errors) {
            const errorMessages = data.errors.map(err => err.msg).join('\n');
            alert('Ошибка:\n' + errorMessages);
        } else {
            alert(data.error || 'Ошибка регистрации');
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        alert('Ошибка соединения с сервером');
    }
}

// Обработчик отправки формы
form2.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Определяем роль
    const role = studentRadio.checked ? 'student' : 'teacher';
    
    // Собираем данные в соответствии с твоей таблицей
    const userData = {
        first_name: firstNameInput.value.trim(),
        last_name: lastNameInput.value.trim(),
        patronymic: patronymicInput.value.trim() || null,
        email: emailInput2.value.trim(),
        password: passwordInput3.value,
        role: role
    };
    
    // Проверяем обязательные поля
    if (!userData.first_name) {
        alert('Введите имя');
        return;
    }
    if (!userData.last_name) {
        alert('Введите фамилию');
        return;
    }
    if (!userData.email) {
        alert('Введите email');
        return;
    }
    if (!userData.password) {
        alert('Введите пароль');
        return;
    }
    if (userData.password.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }
    
    // Добавляем поля в зависимости от роли
    if (role === 'student') {
        if (!groupInput.value.trim()) {
            alert('Введите группу');
            return;
        }
        if (!yearSelect.value) {
            alert('Выберите курс');
            return;
        }
        if (!facultySelect.value || facultySelect.value === 'Выберите факультет') {
            alert('Выберите факультет');
            return;
        }
        
        userData.user_group = groupInput.value.trim();
        userData.year = getYearValue(yearSelect.value);
        userData.faculty = facultySelect.options[facultySelect.selectedIndex]?.text || facultySelect.value;
        // Для студента эти поля null
        userData.department = null;
        userData.academic_position = null;
    } 
    else { // role === 'teacher'
        if (departmentInput && !departmentInput.value.trim()) {
            alert('Введите кафедру');
            return;
        }
        if (positionInput && !positionInput.value.trim()) {
            alert('Введите должность');
            return;
        }
        
        userData.department = departmentInput?.value.trim() || null;
        userData.academic_position = positionInput?.value.trim() || null;
        // Для преподавателя эти поля null
        userData.user_group = null;
        userData.year = null;
        userData.faculty = null;
    }
    
    // Отправляем регистрацию
    await register(userData);
});