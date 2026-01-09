function updateHeaderAuthState() {
	const user = JSON.parse(localStorage.getItem('user'))
	const userName = document.querySelector('.userNameContent')
	const userNameLink = document.querySelector('.userNameLink')
	const login = document.querySelector('.login-trigger')
	const register = document.querySelector('.register-trigger')

	if (user) {
		login.classList.add('dn');
		register.classList.add('dn');
		userName.classList.remove('dn');
		userNameLink.innerHTML = user.full_name
	} else {
		login.classList.remove('dn');
		register.classList.remove('dn');
		userName.classList.add('dn');
	}

	const userNameBlock = document.querySelector('.userName')

	let userNameShow = () => {
		document.querySelector('.userImg').style.transform = `translateX(0px)`
	    userNameBlock.style.transform = `translateX(0px)`
	}

	let userNameHide = () => {
		const textWidth = userNameBlock.scrollWidth + 31;
	    document.querySelector('.userImg').style.transform = `translateX(${textWidth}px)`
	    userNameBlock.style.transform = `translateX(${textWidth}px)`
	}

	userNameHide()
	userNameShow()
}

// POST /api/register
async function registerUser(formData) {
    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log('Регистрация успешна:', data);
            const registerForm = document.querySelector('.register-form');
            registerForm.reset();
            const popup = document.getElementById('authPopup');
            popup.classList.remove('show');
            localStorage.setItem('user', JSON.stringify(formData));
            updateHeaderAuthState()
        } else {
            console.error('Ошибка регистрации:', data.error);
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
    }
}

// POST /api/login
async function loginUser(formData) {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (response.ok) {
            console.log('Авторизация успешна:', data);
            const loginForm = document.querySelector('.login-form');
            loginForm.reset();
            const popup = document.getElementById('authPopup');
            popup.classList.remove('show');
            localStorage.setItem('user', JSON.stringify(data.user));
            updateHeaderAuthState()
        } else {
            console.error('Ошибка авторизации:', data.error);
        }
    } catch (error) {
        console.error('Ошибка сети:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
	updateHeaderAuthState()

    const registerForm = document.querySelector('.register-form');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = {
                full_name: this.querySelector('input[type="text"]').value || '',
                email: this.querySelector('input[type="email"]').value || '',
                password: this.querySelectorAll('input[type="password"]')[0].value || '',
                phone: this.querySelector('input[type="tel"]')?.value || '',
                faculty: this.querySelector('input[placeholder="Факультет"]')?.value || '',
                user_group: this.querySelector('input[placeholder="Группа"]')?.value || '',
                role: 'student'
            };
            
            registerUser(formData)
        });
    }

    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const formData = {
                email: this.querySelector('input[type="email"]').value || '',
                password: this.querySelectorAll('input[type="password"]')[0].value || '',
            };
            
            loginUser(formData)
        });
    }
});