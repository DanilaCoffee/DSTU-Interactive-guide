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

document.querySelector('.profileBlock').addEventListener('mouseenter', () => {
    userNameShow()
})

document.querySelector('.profileBlock').addEventListener('mouseleave', () => {
	userNameHide()
})

window.addEventListener('load', () => {
    userNameHide()
    setTimeout(() => {
    	document.querySelector('.userImg').style.transition = 'transform 0.2s ease-in-out'
    	document.querySelector('.userName').style.transition = 'transform 0.2s ease-in-out'
    	document.querySelector('header').style.opacity = '1'
    	document.querySelector('.welcomeBlock').style.opacity = '1'
    }, 10)
})

const advices = document.querySelector('.advices')
const advicesText = document.querySelector('.advicesText')
const header = document.querySelector('header')
let scrollY = 0

advicesText.addEventListener('mouseenter', function() {
    advices.classList.remove('active')
})

advicesText.addEventListener('mouseleave', function() {
    advices.classList.add('active')
})

document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('authPopup');
    const loginTrigger = document.querySelector('.login-trigger');
    const registerTrigger = document.querySelector('.register-trigger');
    const closePopup = document.querySelector('.close-popup');
    const authTabs = document.querySelector('.auth-tabs');
    const tabButtons = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    loginTrigger.addEventListener('click', function() {
        popup.classList.add('show');
        switchTab('login');
    });
    
    registerTrigger.addEventListener('click', function() {
        popup.classList.add('show');
        switchTab('register');
    });
    
    closePopup.addEventListener('click', function() {
        popup.classList.remove('show');
    });
    
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    });
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    function switchTab(tab) {
        if (tab === 'login') {
            authTabs.classList.remove('register-active');
        } else {
            authTabs.classList.add('register-active');
        }
        
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tab) {
                btn.classList.add('active');
            }
        });
        
        forms.forEach(form => {
            form.classList.remove('active');
            if (form.classList.contains(tab + '-form')) {
                form.classList.add('active');
            }
        });
    }
});