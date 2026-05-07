const TOTAL_IMAGES = 15;
const SLIDE_WIDTH = 288;
const GAP = 8;
const slideStep = SLIDE_WIDTH + GAP;

const track = document.getElementById('carouselTrack');
const viewport = document.getElementById('carouselViewport');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('carouselDots');

let currentIndex = 0;
let visibleCount = 4;
let maxIndex = 0;
let totalSlides = TOTAL_IMAGES;

let isSmartMode = true;

const contentArray = ["Главный корпус <br><span>пл. Гагарина, 1</span>", "Учебный корпус №8 <br><span>пл. Гагарина, 1</span>", "Учебный корпус №2 <br><span>просп. Михаила Нагибина, 3А</span>", "Учебный корпус №7 <br><span>просп. Михаила Нагибина, 3Г</span>", "Учебный корпус №6 <br><span>пл. Гагарина, 1</span>", "Учебный корпус №3, 4, 5 <br><span>ул. Мечникова, 81</span>", "Конгресс-холл <br><span>пл. Гагарина, 1</span>", "Спортивный манеж <br><span>ул. Юфимцева, 16</span>", "Бассейн ДГТУ <br><span>пл. Гагарина, 1/1</span>", "Общежитие №2 <br><span>просп. Михаила Нагибина, 5</span>", "Общежитие №4 <br><span> ул. Текучёва, 145</span>", "Общежитие №10 <br><span>ул. Мечникова, 79Б</span>", "Общежитие №5 <br><span>ул. Мечникова 154А</span>", "Механические часы <br><span>пл. Гагарина, 1</span>", "Фонтан <br><span>пл. Гагарина, 1</span>"];

if (track) {
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    const img = document.createElement('img');
    img.src = `img/b${i}.png`;
    img.alt = `b${i}`;
    const text = document.createElement('div');
    text.className = 'carousel-item-text';
    text.innerHTML = contentArray[i-1];
    slide.appendChild(img);
    slide.appendChild(text);
    track.appendChild(slide);
}
}

const DOTS_COUNT = 5;

function createDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < DOTS_COUNT; i++) {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        dotsContainer.appendChild(dot);
    }
}

function updateDots() {
    if (!dotsContainer) return;
    if (!isSmartMode) {
        const scrollPosition = viewport.scrollLeft;
        const totalScrollWidth = track.scrollWidth - viewport.clientWidth;
        
        if (totalScrollWidth <= 0) {
            highlightDot(0);
            return;
        }
        
        const scrollPercent = scrollPosition / totalScrollWidth;
        let dotIndex = Math.floor(scrollPercent * DOTS_COUNT);
        dotIndex = Math.min(dotIndex, DOTS_COUNT - 1);
        dotIndex = Math.max(dotIndex, 0);
        
        highlightDot(dotIndex);
    }
}

function highlightDot(index) {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

function scrollToSlideIndex(slideIndex) {
    if (!isSmartMode && viewport) {
        const scrollPosition = slideIndex * (SLIDE_WIDTH + GAP);
        viewport.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }
}

function updateButtonsState() {
    if (currentIndex === 0) {
        prevBtn.classList.add('disabled');
    } else {
        prevBtn.classList.remove('disabled');
    }
    
    if (currentIndex === maxIndex) {
        nextBtn.classList.add('disabled');
    } else {
        nextBtn.classList.remove('disabled');
    }
}

function updateSmartLayout() {
    const windowWidth = window.innerWidth;
    if (windowWidth < 700) visibleCount = 1;
    else if (windowWidth < 1001) visibleCount = 2;
    else if (windowWidth < 1250) visibleCount = 3;
    else visibleCount = 4;

    const viewportWidth = (visibleCount * SLIDE_WIDTH) + ((visibleCount - 1) * GAP);
    viewport.style.width = viewportWidth + 'px';
    viewport.style.overflow = 'hidden';

    maxIndex = Math.max(0, totalSlides - visibleCount);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const translateX = -(currentIndex * slideStep);
    track.style.transform = `translateX(${translateX}px)`;
    track.style.transition = 'transform 0.3s ease';

    updateButtonsState();
}

function nextSlide() {
    if (totalSlides <= visibleCount) return;
    if (currentIndex + 1 <= maxIndex) {
        currentIndex++;
        updateSmartLayout();
    }
}

function prevSlide() {
    if (totalSlides <= visibleCount) return;
    if (currentIndex - 1 >= 0) {
        currentIndex--;
        updateSmartLayout();
    }
}

let startX = 0;
let scrollLeft = 0;
let isDragging = false;
let scrollTimeout = null;

function enableDragScroll() {
    track.style.transform = 'none';
    track.style.transition = 'none';
    track.style.width = `${totalSlides * (SLIDE_WIDTH + GAP)}px`;
    
    viewport.style.width = '100%';
    viewport.style.overflowX = 'auto';
    viewport.style.cursor = 'grab';
    viewport.style.scrollBehavior = 'auto';
    track.style.position = 'static';
    
    if (dotsContainer) {
        dotsContainer.style.display = 'flex';
        createDots();
        updateDots();
    }
    
    viewport.removeEventListener('mousedown', onMouseDown);
    viewport.removeEventListener('mouseleave', onMouseLeave);
    viewport.removeEventListener('mouseup', onMouseUp);
    viewport.removeEventListener('mousemove', onMouseMove);
    
    viewport.addEventListener('mousedown', onMouseDown);
    viewport.addEventListener('mouseleave', onMouseLeave);
    viewport.addEventListener('mouseup', onMouseUp);
    viewport.addEventListener('mousemove', onMouseMove);
    
    viewport.addEventListener('scroll', onScroll);
    
    viewport.style.touchAction = 'pan-x';
    
    setTimeout(() => updateDots(), 100);

    viewport.addEventListener('scroll', () => {
        updateDots();
    });
}

function disableDragScroll() {
    viewport.style.overflowX = 'hidden';
    viewport.style.cursor = 'default';
    viewport.style.touchAction = 'auto';
    viewport.style.width = '';
    
    if (dotsContainer) dotsContainer.style.display = 'none';
    
    viewport.removeEventListener('mousedown', onMouseDown);
    viewport.removeEventListener('mouseleave', onMouseLeave);
    viewport.removeEventListener('mouseup', onMouseUp);
    viewport.removeEventListener('mousemove', onMouseMove);
    viewport.removeEventListener('scroll', onScroll);
}

function onScroll() {
    if (!isSmartMode) {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            updateDots();
        }, 50);
    }
}

function onMouseDown(e) {
    if (!isSmartMode) {
        isDragging = true;
        startX = e.pageX - viewport.offsetLeft;
        scrollLeft = viewport.scrollLeft;
        viewport.style.cursor = 'grabbing';
        e.preventDefault();
    }
}

function onMouseLeave() {
    if (!isSmartMode) {
        isDragging = false;
        viewport.style.cursor = 'grab';
    }
}

function onMouseUp() {
    if (!isSmartMode) {
        isDragging = false;
        viewport.style.cursor = 'grab';
    }
}

function onMouseMove(e) {
    if (!isSmartMode && isDragging) {
        const x = e.pageX - viewport.offsetLeft;
        const walk = (x - startX);
        viewport.scrollLeft = scrollLeft - walk;
    }
}

function updateLayout() {
    const windowWidth = window.innerWidth;
    const newSmartMode = windowWidth >= 1001;
    
    if (newSmartMode !== isSmartMode) {
        isSmartMode = newSmartMode;
        
        if (isSmartMode) {
            disableDragScroll();
            updateSmartLayout();
            if (prevBtn) prevBtn.style.display = '';
            if (nextBtn) nextBtn.style.display = '';
        } else {
            enableDragScroll();
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    } else if (isSmartMode) {
        updateSmartLayout();
    }
}

if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);

if (track) {
    window.addEventListener('resize', () => {
        updateLayout();
    });

    window.addEventListener('load', () => {
        updateLayout();
    });

    updateLayout();
}

const facultyCards = document.querySelectorAll('.faculty-card');

function closeAllCardsExcept(currentCard) {
    facultyCards.forEach(card => {
        if (card !== currentCard && card.classList.contains('active')) {
            card.classList.remove('active');
            
            const subtitleDrop = card.querySelector('.faculty-card__subtitle--drop');
            const link = card.querySelector('.faculty-card__link');
            
            if (subtitleDrop) {
                subtitleDrop.classList.remove('active');
            }
            if (link) {
                link.classList.remove('active');
            }
        }
    });
}

facultyCards.forEach(card => {
    card.addEventListener('click', function() {
        const subtitleDrop = this.querySelector('.faculty-card__subtitle--drop');
        const link = this.querySelector('.faculty-card__link');
        
        this.classList.toggle('active');
        
        if (subtitleDrop) {
            subtitleDrop.classList.toggle('active');
        }
        if (link) {
            link.classList.toggle('active');
        }
        
        closeAllCardsExcept(this);
    });
});

const burger = document.querySelector('.page-header__burger');
const header = document.querySelector('.page-header');

burger.addEventListener('click', () => {
  header.classList.toggle('active');
  burger.classList.toggle('is-active');
});

const tabs = document.querySelectorAll('.tab');
const slider = document.querySelector('.slider');

function updateSlider(activeTab) {
  const tabRect = activeTab.getBoundingClientRect();
  const containerRect = activeTab.parentElement.getBoundingClientRect();
  const offsetLeft = tabRect.left - containerRect.left;
  slider.style.transform = `translateX(${offsetLeft - 5}px)`;
  slider.style.width = `${tabRect.width}px`;
}

if (tabs && slider) {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            updateSlider(tab);
        });
    });

    const defaultActive = document.querySelector('.tab.active');
    if (defaultActive) {
      updateSlider(defaultActive);
    } else {
      tabs[0].classList.add('active');
      updateSlider(tabs[0]);
    }

    window.addEventListener('resize', () => {
      const currentActive = document.querySelector('.tab.active');
      if (currentActive) updateSlider(currentActive);
    });
}

const profileButtonsContainer = document.querySelector('.profile-buttons');
let buttons = []
if (profileButtonsContainer) {
    buttons = profileButtonsContainer.querySelectorAll('.profile-buttons__item');
}
const scheduleSection = document.querySelector('.profile-sections__schedule');
const adviceSection = document.querySelector('.profile-sections__adviсe');
const testsSection = document.querySelector('.profile-sections__tests');
const settingsSection = document.querySelector('.profile-sections__settings');

const sections = [scheduleSection, adviceSection, testsSection, settingsSection];

function setActiveButton(activeButton) {
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    activeButton.classList.add('active');
}

function setActiveSection(activeSection) {
    sections.forEach(section => {
        if (section) {
            section.classList.remove('active');
        }
    });
    if (activeSection) {
        activeSection.classList.add('active');
    }
}

if (buttons.length != 0) {
    buttons.forEach((button, index) => {
        button.addEventListener('click', function() {
            setActiveButton(this);
            setActiveSection(sections[index]);
        });
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
    } else {
        authorizationTabs[0].classList.add('active');
        authorizationUpdateSlider(authorizationTabs[0]);
        const tabType = authorizationTabs[0].getAttribute('data-tab');
        switchContent(tabType);
    }

    window.addEventListener('resize', () => {
        const currentActive = document.querySelector('.authorization__switch--tab.active');
        if (currentActive) authorizationUpdateSlider(currentActive);
    });
}

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