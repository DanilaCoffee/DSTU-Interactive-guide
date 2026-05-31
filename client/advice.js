// ============= ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =============
const adviсeGrid = document.querySelector('.adviсe-grid');
const adviсeContent = document.querySelector('.adviсe-content');
const adviсeNav = document.querySelector('.adviсe-nav');
const adviсeHeader = document.querySelector('.adviсe-header');
const adviсeControls = document.querySelector('.adviсe-controls');
const tagsGrid = document.querySelector('.adviсe-filter__tags-list');

let allAdvice = [];
let activeTags = [];
let currentSearchQuery = '';

// ============= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =============
function formatToDDMMYYYY(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}.${month}.${year}`;
}

// Получаем URL картинки (своя или дефолтная)
function getImageUrl(advice) {
    if (advice.image_url && advice.image_url !== '') {
        return advice.image_url; // уже содержит /uploads/...
    }
    return 'img/acimg.png';
}

// Создаем HTML для тегов карточки
function renderTags(tags) {
    return tags.map(tag => `<div class="adviсe-card__tag">${tag}</div>`).join('');
}

// ============= ОСНОВНАЯ ФУНКЦИЯ ОТРИСОВКИ =============
function renderAdvice() {
    if (!allAdvice.length) {
        adviсeGrid.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        return;
    }

    let adviсeHTML = '';
    
    for (const advice of allAdvice) {
        // Фильтрация по тегам (если выбран не "все")
        let shouldShow = true;
        
        if (activeTags.length > 0 && !activeTags.includes('все')) {
            shouldShow = activeTags.some(tag => advice.tags.includes(tag));
        }
        
        // Фильтрация по поиску (если есть запрос)
        if (shouldShow && currentSearchQuery !== '') {
            shouldShow = advice.title
                .toLowerCase()
                .startsWith(currentSearchQuery.toLowerCase());
        }
        
        if (!shouldShow) continue;
        
        // Рендерим карточку
        const tagsHTML = renderTags(advice.tags);
        const imageUrl = getImageUrl(advice);
        
        adviсeHTML += `
            <div class="adviсe-card" data-id="${advice.post_id}">
                <div class="adviсe-card__img">
                    <img src="${imageUrl}" alt="">    
                </div>
                <div class="adviсe-card__tags-list">
                    ${tagsHTML}
                </div>
                <div class="adviсe-card__title">${escapeHtml(advice.title)}</div>
                <div class="adviсe-card__description">${escapeHtml(advice.short_description)}</div>
                <div class="adviсe-card__data">
                    <div class="adviсe-card__social">
                        <div class="adviсe-card__social--views">
                            <img src="img/ai5.svg" alt="">${advice.views}
                        </div>
                        <div class="adviсe-card__social--likes">
                            <img src="img/ai6.svg" alt="">${advice.likes}
                        </div>
                    </div>
                    <div class="adviсe-card__date">${formatToDDMMYYYY(advice.created_at)}</div>
                </div>
            </div>
        `;
    }
    
    adviсeGrid.innerHTML = adviсeHTML || '<div class="no-results">Ничего не найдено</div>';
}

// Функция для рендера полной страницы поста (при клике на карточку)
function renderFullAdvice(advice) {
    const tagsHTML = renderTags(advice.tags);
    const imageUrl = getImageUrl(advice);
    
    adviсeGrid.style.display = "none";
    adviсeContent.style.display = "block";
    adviсeHeader.style.display = "none";
    adviсeControls.style.display = "none";
    
    adviсeNav.innerHTML = `
        <a href="index.html">Главная</a>
        <span></span>
        <a href="advice.html">Советы</a>
        <span></span>
        ${escapeHtml(advice.title)}
    `;
    
    adviсeContent.innerHTML = `
        <div class="adviсe-content__header">
            <div class="adviсe-content__img">
                <img src="${imageUrl}" alt="">
            </div>
            <div class="adviсe-content__title-wrapper">
                <div class="adviсe-content__title">${escapeHtml(advice.title)}</div>
                <div class="adviсe-content__description">${escapeHtml(advice.short_description)}</div>
                <div class="adviсe-card__tags-list">
                    ${tagsHTML}
                </div>
            </div>
        </div>
        <div class="adviсe-content__text">
            ${advice.content} <!-- content может содержать HTML, поэтому не экранируем -->
        </div>
        <div class="adviсe-content__info">
            <div class="adviсe-card__social--views">
                <img src="img/ai5.svg" alt="">${advice.views}
            </div>
            <div class="adviсe-card__social--likes">
                <img src="img/ai6.svg" alt="">${advice.likes}
            </div>
            <div class="adviсe-card__date">${formatToDDMMYYYY(advice.created_at)}</div>
        </div>
    `;
    
    window.scrollTo({ top: 0 });
}

// Безопасное экранирование HTML (защита от XSS)
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============= ЗАГРУЗКА ДАННЫХ =============
async function fetchAdvice() {
    try {
        const response = await fetch('/api/advice');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении советов:', error);
        throw error;
    }
}

async function loadAdvice() {
    try {
        const advice = await fetchAdvice();
        allAdvice = advice;
        renderAdvice(); // Отрисовываем с текущими фильтрами
    } catch (error) {
        console.log("advice error", error);
        adviсeGrid.innerHTML = '<div class="error">Ошибка загрузки советов</div>';
    }
}

async function fetchTags() {
    try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Ошибка при получении тегов:', error);
        throw error;
    }
}

function updateActiveTagsFromButtons() {
    const allTags = document.querySelectorAll('.adviсe-filter__tag');
    const allActive = Array.from(allTags)
        .filter(t => t.classList.contains('active'))
        .map(t => t.textContent);
    
    if (allActive.length === 1 && allActive[0] === 'все') {
        activeTags = ['все'];
    } else {
        activeTags = allActive.filter(tagName => tagName !== 'все');
    }

    currentSearchQuery = '';
    const searchInput = document.querySelector('.search-input');
    if (searchInput) searchInput.value = '';
    
    renderAdvice();
}

async function loadTags() {
    try {
        const tags = await fetchTags();
        
        let tagsHTML = '<div class="adviсe-filter__tag active">все</div>';
        tags.forEach(tag => {
            if (tag.tag_topic === "Советы") {
                tagsHTML += `<div class="adviсe-filter__tag">${escapeHtml(tag.tag_name)}</div>`;
            }
        });
        tagsGrid.innerHTML = tagsHTML;
        
        tagsGrid.addEventListener('click', (e) => {
            const tag = e.target.closest('.adviсe-filter__tag');
            if (!tag) return;
            
            const isAll = tag.textContent === 'все';
            const allTags = document.querySelectorAll('.adviсe-filter__tag');
            const allTag = allTags[0];
            
            if (isAll) {
                allTags.forEach(t => t.classList.remove('active'));
                allTag.classList.add('active');
            } else {
                if (tag.classList.contains('active')) {
                    tag.classList.remove('active');
                    const remainingActive = Array.from(allTags).filter(t => 
                        t.classList.contains('active') && t.textContent !== 'все'
                    );
                    if (remainingActive.length === 0) {
                        allTag.classList.add('active');
                    }
                } else {
                    allTag.classList.remove('active');
                    tag.classList.add('active');
                }
            }
            
            updateActiveTagsFromButtons();
        });

        activeTags = ['все'];
        renderAdvice();
        
    } catch (error) {
        console.log("tags error", error);
    }
}

function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        
        activeTags = ['все'];
        const allTags = document.querySelectorAll('.adviсe-filter__tag');
        allTags.forEach((tag, index) => {
            if (index === 0) {
                tag.classList.add("active");
            } else {
                tag.classList.remove("active");
            }
        });
        
        renderAdvice();
    });
}

// ============= КЛИК ПО КАРТОЧКЕ =============
function initCardClick() {
    adviсeGrid.addEventListener('click', (event) => {
        const titleElement = event.target.closest('.adviсe-card__title');
        if (!titleElement) return;
        
        const card = titleElement.closest('.adviсe-card');
        const adviceId = parseInt(card.dataset.id);
        
        if (adviceId) {
            const selectedAdvice = allAdvice.find(a => a.post_id === adviceId);
            if (selectedAdvice) {
                renderFullAdvice(selectedAdvice);
            }
        }
    });
}

// ============= ИНИЦИАЛИЗАЦИЯ =============
async function init() {
    await loadAdvice();  // Загружаем советы
    await loadTags();    // Загружаем теги
    initSearch();        // Инициализируем поиск
    initCardClick();     // Инициализируем клики по карточкам
}

// Запускаем всё
init();