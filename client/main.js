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