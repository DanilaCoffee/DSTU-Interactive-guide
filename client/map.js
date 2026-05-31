const MAP_WIDTH = 1920;
const MAP_HEIGHT = 1080;

let scale = 1.0;
let translateX = 0;
let translateY = 0;

const container = document.getElementById('mapContainer');
const pointsLayer = document.getElementById('pointsLayer');

function applyTransform() {
    container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function updateTransform() {
    applyTransform();
}

function zoomAtPoint(delta, clientX, clientY) {
    const oldScale = scale;
    let newScale = scale * (delta > 0 ? 1.1 : 0.9);
    newScale = Math.min(10, Math.max(0.9, newScale));
    
    if (newScale === scale) return;
    
    const mouseX = clientX;
    const mouseY = clientY;
    
    const oldTransX = translateX;
    const oldTransY = translateY;
    
    const mapX = (mouseX - oldTransX) / oldScale;
    const mapY = (mouseY - oldTransY) / oldScale;
    
    scale = newScale;
    if (scale > 3) {
        document.querySelector('.map-bg').style.backgroundImage = "url('img/map2.svg')";
    } else {
        document.querySelector('.map-bg').style.backgroundImage = "url('img/map.svg')";
    }
    
    translateX = mouseX - mapX * scale;
    translateY = mouseY - mapY * scale;
    
    updateTransform();
}

function zoomFromCenter(delta) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    zoomAtPoint(delta, centerX, centerY);
}

function resetView() {
    scale = 1.0;
    document.querySelector('.map-bg').style.backgroundImage = "url('img/map.svg')";
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    translateX = (viewW - MAP_WIDTH) / 2;
    translateY = (viewH - MAP_HEIGHT) / 2 - 110;
    updateTransform();
}

let isDragging = false;
let dragStartX = 0, dragStartY = 0;
let panStartX = 0, panStartY = 0;

function onMouseDown(e) {
    if (e.target.closest('button')) return;
    
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = translateX;
    panStartY = translateY;
    container.style.cursor = 'grabbing';
    e.preventDefault();
}

function onMouseMove(e) {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    
    translateX = panStartX + dx;
    translateY = panStartY + dy;
    updateTransform();
}

function onMouseUp() {
    isDragging = false;
    container.style.cursor = 'grab';
}

function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    zoomAtPoint(delta, e.clientX, e.clientY);
}

function addMapPoint(x, y, text) {
    const pointDiv = document.createElement('div');
    pointDiv.className = 'point';
    pointDiv.style.left = `${x}px`;
    pointDiv.style.top = `${y}px`;
    
    pointDiv.innerHTML = `
        <div class="point-dot"></div>
        <div class="point-label">${escapeHtml(text)}</div>
    `;
    
    pointsLayer.appendChild(pointDiv);
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

function init() {
    document.getElementById('zoomIn').addEventListener('click', () => zoomFromCenter(1));
    document.getElementById('zoomOut').addEventListener('click', () => zoomFromCenter(-1));
    document.getElementById('reset').addEventListener('click', resetView);
    
    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    container.addEventListener('wheel', onWheel, { passive: false });
    
    resetView();
    
    addMapPoint(710, 630, "08:30");
    addMapPoint(800, 570, "12:00");
    addMapPoint(910, 680, "14:15");
}

window.addEventListener('DOMContentLoaded', init);

const passwordInput = document.getElementById('login-pass');
const toggleButton = document.getElementById('togglePassword');

if (passwordInput && toggleButton) {
    const eyeClosed = toggleButton.querySelector('.eye-closed');
    const eyeOpen = toggleButton.querySelector('.eye-open');
    eyeOpen.style.display = 'none';

    toggleButton.addEventListener('click', function() {
        const currentType = passwordInput.getAttribute('type');
        const newType = currentType === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', newType);

        if (newType === 'text') {
            eyeClosed.style.display = 'none';
            eyeOpen.style.display = 'block';
        } else {
            eyeClosed.style.display = 'block';
            eyeOpen.style.display = 'none';
        }
    });
}

const passwordInputRegistration = document.getElementById('registration-pass');
const toggleButtonRegistration = document.getElementById('togglePasswordRegistration');

if (passwordInputRegistration && toggleButtonRegistration) {
    const eyeClosedRegistration = toggleButtonRegistration.querySelector('.eye-closed--Registration');
    const eyeOpenRegistration = toggleButtonRegistration.querySelector('.eye-open--Registration');
    eyeOpenRegistration.style.display = 'none';

    toggleButtonRegistration.addEventListener('click', function() {
        const currentType = passwordInputRegistration.getAttribute('type');
        const newType = currentType === 'password' ? 'text' : 'password';
        passwordInputRegistration.setAttribute('type', newType);

        if (newType === 'text') {
            eyeClosedRegistration.style.display = 'none';
            eyeOpenRegistration.style.display = 'block';
        } else {
            eyeClosedRegistration.style.display = 'block';
            eyeOpenRegistration.style.display = 'none';
        }
    });
}

const radioButtons = document.querySelectorAll('input[name="registration-role"]');
const studentTab = document.querySelector('.student-tab');
const lecturerTab = document.querySelector('.lecturer-tab');

if (radioButtons.length != 0) {
    radioButtons[0].addEventListener('change', function() {
        if (radioButtons[0].checked) {
            studentTab.classList.add('active');
            lecturerTab.classList.remove('active');
        }
    });

    radioButtons[1].addEventListener('change', function() {
        if (radioButtons[1].checked) {
            lecturerTab.classList.add('active');
            studentTab.classList.remove('active');
        }
    });
}

function openModal(activeTab = 'login') {
    const modal = document.querySelector('.modal');
    const body = document.body;
    const loginTab = document.querySelector('.authorization__switch--tab[data-tab="login"]');
    const registrationTab = document.querySelector('.authorization__switch--tab[data-tab="registration"]');
    const loginBlock = document.querySelector('.authorization__login');
    const registrationBlock = document.querySelector('.authorization__registration');
    const authorizationSlider = document.querySelector('.authorization__switch--slider');
    
    if (!modal) return;

    modal.style.display = 'block';
    body.style.height = '100vh';
    body.style.overflow = 'hidden';
    
    if (activeTab === 'login') {
        loginTab.classList.add('active');
        registrationTab.classList.remove('active');
        loginBlock.classList.add('active');
        registrationBlock.classList.remove('active');
    } else if (activeTab === 'registration') {
        registrationTab.classList.add('active');
        loginTab.classList.remove('active');
        registrationBlock.classList.add('active');
        loginBlock.classList.remove('active');
    }
    
    const currentActive = document.querySelector('.authorization__switch--tab.active');
    if (currentActive && authorizationSlider) {
        const tabRect = currentActive.getBoundingClientRect();
        const containerRect = currentActive.parentElement.getBoundingClientRect();
        const offsetLeft = tabRect.left - containerRect.left;
        authorizationSlider.style.transform = `translateX(${offsetLeft - 5}px)`;
        authorizationSlider.style.width = `${tabRect.width}px`;
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    const body = document.body;
    
    if (!modal) return;
    modal.style.display = 'none';
    body.style.height = '';
    body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.btn--outline');
    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('login');
        });
    }
    
    const registrationButton = document.querySelector('.btn--primary');
    if (registrationButton) {
        registrationButton.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('registration');
        });
    }
    
    const closeButton = document.querySelector('.authorization__close');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeModal();
        });
    }
    
    const modal = document.querySelector('.modal');
    const authorizationBlock = document.querySelector('.authorization');
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal && authorizationBlock) {
                if (!authorizationBlock.contains(e.target)) {
                    closeModal();
                }
            }
        });
    }
    
    const authorizationTabs = document.querySelectorAll('.authorization__switch--tab');
    const authorizationSlider = document.querySelector('.authorization__switch--slider');
    const loginBlock = document.querySelector('.authorization__login');
    const registrationBlock = document.querySelector('.authorization__registration');
    
    function authorizationUpdateSlider(activeTab) {
        const tabRect = activeTab.getBoundingClientRect();
        const containerRect = activeTab.parentElement.getBoundingClientRect();
        const offsetLeft = tabRect.left - containerRect.left;
        authorizationSlider.style.transform = `translateX(${offsetLeft - 5}px)`;
        authorizationSlider.style.width = `${tabRect.width}px`;
    }
    
    function switchContent(tabType) {
        loginBlock.classList.remove('active');
        registrationBlock.classList.remove('active');
        
        if (tabType === 'login') {
            loginBlock.classList.add('active');
        } else if (tabType === 'registration') {
            registrationBlock.classList.add('active');
        }
    }
    
    if (authorizationTabs && authorizationSlider && loginBlock && registrationBlock) {
        authorizationTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authorizationTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                authorizationUpdateSlider(tab);
                const tabType = tab.getAttribute('data-tab');
                switchContent(tabType);
            });
        });
        
        const defaultActive = document.querySelector('.authorization__switch--tab.active');
        if (defaultActive) {
            authorizationUpdateSlider(defaultActive);
            const tabType = defaultActive.getAttribute('data-tab');
            switchContent(tabType);
        } else if (authorizationTabs[0]) {
            authorizationTabs[0].classList.add('active');
            authorizationUpdateSlider(authorizationTabs[0]);
            const tabType = authorizationTabs[0].getAttribute('data-tab');
            switchContent(tabType);
        }
        
        window.addEventListener('resize', () => {
            if (modal && modal.style.display === 'block') {
                const currentActive = document.querySelector('.authorization__switch--tab.active');
                if (currentActive) authorizationUpdateSlider(currentActive);
            }
        });
    }
});

const switchView = document.getElementById('switch-view');

switchView.addEventListener('change', () => {
  const displayValue = switchView.checked ? 'block' : 'none';
  document.querySelectorAll('.point').forEach(el => el.style.display = displayValue);
});
