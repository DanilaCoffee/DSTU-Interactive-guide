const profileCard = document.querySelector('.profile-card');

function getShortFacultyName(fullName) {
    const mapping = {
        "Авиастроение": "Авиа",
        "Автоматизация, мехатроника и управление": "АМиУ",
        "Агропромышленный": "Агро",
        "Безопасность жизнедеятельности и инженерная экология": "БЖДиИЭ",
        "Дорожно-транспортный": "ДТФ",
        "Инженерно-строительный": "ИСФ",
        "Информатика и вычислительная техника": "ИиВТ",
        "Кораблестроение и морская техника": "КиМТ",
        "Машиностроительные технологии и оборудование": "МТиО",
        "Приборостроение и техническое регулирование": "ПиТР",
        "Промышленное и гражданское строительство": "ПиГС",
        "Технология машиностроения": "ТМ",
        "Транспорт, сервис и эксплуатация": "ТСиЭ",
        "Энергетика и нефтегазопромышленность": "ЭиН",
        "Биоинженерия и ветеринарная медицина": "БиВМ",
        "Инновационный бизнес и менеджмент": "ИБиМ",
        "Медиакоммуникации и мультимедийные технологии": "МиМТ",
        "Международный": "Междун",
        "Психология, педагогика и дефектология": "ППиД",
        "Сервис и туризм": "СиТ",
        "Социально-гуманитарный": "СоцГум",
        "Школа архитектуры, дизайна и искусств": "АДИ",
        "Юридический": "Юр"
    };

    return mapping[fullName] || "null";
}

function formatToDDMMYYYY(dateString) {
    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();

    return `${day}.${month}.${year}`;
}

function getFormattedDate() {
    const now = new Date();
    
    const days = [
        'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 
        'Четверг', 'Пятница', 'Суббота'
    ];
    
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    
    const dayName = days[now.getDay()];
    const dayNumber = now.getDate();
    const monthName = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName} ${dayNumber} ${monthName} ${year}`;
}

function shortenFullName(fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';
    const surname = parts[0];
    const initials = parts.slice(1).map(part => part.charAt(0).toUpperCase() + '.');
    return [surname, ...initials].join(' ');
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function getUserAdvice(userId) {
    try {
        const response = await fetch(`/api/advice/${userId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при загрузке советов');
        }
        
        const adviceList = await response.json();
        return adviceList;
    } catch (error) {
        console.error('Ошибка:', error.message);
        throw error;
    }
}

async function getUserSchedule() {
    try {
        const response = await fetch('/api/schedule');
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при загрузке расписания');
        }
        
        const schedule = await response.json();
        return schedule;
    } catch (error) {
        console.error('Ошибка:', error.message);
        throw error;
    }
}

function renderProfile(user) {
    let role = '';
    switch(user.role) {
        case 'student':
            role = '🎓 студент';
        break;
        case 'teacher':
            role = '🎓 преподаватель';
        break;
        case 'admin':
            role = '🎓 администратор';
        break;
        default:
            role = '🎓 null';
        break;
    }
    let tmp = '<div class="profile-card__img"><img src="img/noimage.svg" alt=""></div>'
    let avatar = '';
    if (user.avatar != '') {
        avatar = 'user.avatar';
    } else {
        avatar = `<div class="user-noavatar">${user.fullname[0][0].toUpperCase()}${user.fullname[1][0].toUpperCase()}</div>`;
    }
    profileCard.innerHTML = `
          <div class="profile-card__img">${avatar}</div>
          <span class="profile-card__status">${role}</span>
          <div class="profile-card__name">${user.fullname[0]} ${user.fullname[1]}</div>
          <div class="profile-card__info">${user.group}<span></span>${user.year} курс <span></span>${getShortFacultyName(user.faculty)}</div>
          <div class="profile-card__data">
            <div class="data-row">
              <div class="data-name">Факультет</div>
              <div class="data-value data-value--faculty">${getShortFacultyName(user.faculty)}</div>
            </div>
            <div class="data-row">
              <div class="data-name">Курс</div>
              <div class="data-value data-value--year">${user.year}</div>
            </div>
            <div class="data-row">
              <div class="data-name">Группа</div>
              <div class="data-value data-value--group">${user.group}</div>
            </div>
            <div class="data-row">
              <div class="data-name">Зачетка</div>
              <div class="data-value data-value--student-id">2644365</div>
            </div>
          </div>`;

    getUserAdvice(user.id)
    .then(adviceList => {
        try {
            let adviсeHTML = '';
            adviceList.forEach(advice => {
                let tags = '';
                advice.tags.forEach(tag => tags += `<div class="adviсe-card__tag">${tag}</div>`);

                let imageUrl = 'img/acimg.png';
                if (advice.image_url && advice.image_url !== '') {
                    imageUrl = advice.image_url;
                }
                
                let adviceStatus = '';
                switch(advice.status) {
                    case 'draft':
                        adviceStatus = '<img src="img/statusidraft.svg" alt=""><span style="color: #6B7280">Черновик</span>';
                    break;
                    case 'published':
                        adviceStatus = '<img src="img/statusipublished.svg" alt=""><span style="color: #2CC765">Опубликовано</span>';
                    break;
                    case 'pending':
                        adviceStatus = '<img src="img/statusipending.svg" alt=""><span style="color: #EAB308">В проверке</span>';
                    break;
                    case 'rejected':
                        adviceStatus = '<img src="img/statusirejected.svg" alt=""><span style="color: #EF4444">Отклонён</span>';
                    break;
                    default:
                        adviceStatus = 'null';
                    break;
                }
                
                adviсeHTML += `
                <div class="profile-adviсe__card">
                  <div class="profile-adviсe__img">
                    <img src="${imageUrl}" alt="">  
                  </div>
                  <div class="profile-adviсe__status">${adviceStatus}</div>
                  <div class="profile-adviсe__tags-list">
                    ${tags}
                  </div>
                  <div class="profile-adviсe__title">${escapeHtml(advice.title)}</div>
                  <div class="profile-adviсe__description">${escapeHtml(advice.short_description)}</div>
                  <div class="profile-adviсe__data">
                    <div class="profile-adviсe__social">
                      <div class="profile-adviсe__social--views"><img src="img/ai5.svg" alt="">${advice.views}</div>
                    </div>
                    <div class="profile-adviсe__date">${formatToDDMMYYYY(advice.created_at)}</div>
                  </div>
                </div>`;
            });
            
            if (adviсeHTML != '') {
                document.querySelector('.profile-adviсe').innerHTML = adviсeHTML;
            } else {
                document.querySelector('.profile-adviсe').innerHTML = '<div class="profile-empty">Советов пока нет</div>';
            }
            
        } catch (error) {
            console.log("adviсe error", error);
        }
    })
    .catch(error => {
        alert('Не удалось загрузить советы');
    });
    getUserSchedule()
    .then(schedule => {
        const scheduleBlock = document.querySelector('.profile-sections__schedule');
        let scheduleHTML = `
        <div class="profile-sections__title">
            Расписание
            <span>${getFormattedDate()}</span>
        </div>
        <a href="schedule.html"><button class="full-schedule"><img src="img/si4.svg" alt="">Полное расписание</button></a>`;
        
        schedule.forEach((classObject, index) => {
            let classType = '';
            switch(classObject.classType) {
                case 'lecture':
                    classType = 'Лекция';
                break;
                case 'practice':
                    classType = 'Практика';
                break;
                case 'laboratory':
                    classType = 'Лабораторная';
                break;
                case 'exam':
                    classType = 'Экзамен';
                break;
                default:
                    classType = 'null';
                break;
            }
            
            scheduleHTML += `
            <div class="schedule-card" data-class-index="${index}">
                <div class="schedule-card__data">
                  <div class="type ${classObject.classType}">${classType}</div>
                  <div class="title">${classObject.subjectName}</div>
                  <div class="info">
                    <div class="info-item time"><img src="img/si1.svg" alt="">${classObject.startTime}<span></span>${classObject.endTime}</div>
                    <div class="info-item location"><img src="img/si2.svg" alt=""> ауд. ${classObject.building}-${classObject.room}</div>
                    <div class="info-item lecturer"><img src="img/si3.svg" alt="">${classObject.teacher}</div>
                  </div>
                </div>
                <div class="schedule-card__buttons">
                  <a href="map.html"><button class="schedule-card__buttons--map">На карте</button></a>
                  <button class="schedule-card__buttons--details" data-class-data='${JSON.stringify(classObject)}'>Детали</button>
                </div>
            </div>`;
        });
        
        if (schedule.length != 0) {
            scheduleBlock.innerHTML = scheduleHTML;
        } else {
            scheduleBlock.innerHTML = `
            <div class="profile-sections__title">
                Расписание
                <span>${getFormattedDate()}</span>
            </div>
            <button class="full-schedule"><img src="img/si4.svg" alt="">Полное расписание</button>
            <div class="profile-empty">На сегодня занятий нет</div>`;
        }
        
        attachDetailsHandlers();
    })
    .catch(error => {
        alert('Не удалось загрузить расписание');
    });
}

async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isLoggedIn) {
            console.log('Пользователь авторизован:', data);
            renderProfile(data);
            document.querySelector('.btn--lk').style.display = 'block';
            document.querySelector('.btn--logout').style.display = 'block';
            return true;
        } else {
            console.log('Пользователь не авторизован');
            window.location.href = '/index.html';
            return false;
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
        return false;
    }
}

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

let classInfoModal = null;

function createModalIfNeeded() {
    if (!classInfoModal) {
        classInfoModal = document.createElement('div');
        classInfoModal.className = 'class-info';
        classInfoModal.style.display = 'none';
        document.body.appendChild(classInfoModal);
        
        classInfoModal.addEventListener('click', (e) => {
            const closeBtn = classInfoModal.querySelector('.class-info__close');
            if (e.target === closeBtn || closeBtn?.contains(e.target)) {
                classInfoModal.style.display = 'none';
            }
        });
        
        document.addEventListener('click', (e) => {
            if (classInfoModal.style.display === 'block' && !classInfoModal.contains(e.target)) {
                const isDetailsButton = e.target.closest('.schedule-card__buttons--details');
                if (!isDetailsButton) {
                    classInfoModal.style.display = 'none';
                }
            }
        });
    }
}

function updateModalContent(classData) {
    let classTypeText = '';
    switch(classData.classType) {
        case 'lecture': classTypeText = 'Лекция'; break;
        case 'practice': classTypeText = 'Практика'; break;
        case 'laboratory': classTypeText = 'Лабораторная'; break;
        case 'exam': classTypeText = 'Экзамен'; break;
        default: classTypeText = classData.classType || 'Не указано';
    }
    
    classInfoModal.innerHTML = `
        <div class="class-info__close"><img src="img/x.svg" alt=""></div>
        <div class="class-info__title">Информация о паре</div>
        <div class="class-info__time">
          <div class="class-info__time--img">
            <img src="img/citime.svg" alt="">
          </div>
          <div class="class-info__time--content">
            <div class="time">${classData.startTime || ''} - ${classData.endTime || ''}</div>
            <div class="class-number">${classData.classNumber}-я пара</div>
          </div>
        </div>
        <div class="class-info__subject">
          <div class="class-info__subject--title">Дисциплина</div>
          <div class="class-info__subject--name">${classData.subjectName || ''}</div>
        </div>
        <div class="class-info__grid">
          <div class="class-info__grid-item">
            <div class="class-info__grid-item--title"><img src="img/ci_i1.svg" alt="">Тип занятия</div>
            <div class="class-info__grid-item--content ${classData.classType}">${classTypeText}</div>
          </div>
          <div class="class-info__grid-item">
            <div class="class-info__grid-item--title"><img src="img/ci_i2.svg" alt="">Аудитория</div>
            <div class="class-info__grid-item--content">${classData.room || ''}</div>
          </div>
          <div class="class-info__grid-item">
            <div class="class-info__grid-item--title"><img src="img/ci_i3.svg" alt="">Преподаватель</div>
            <div class="class-info__grid-item--content">${shortenFullName(classData.teacher) || ''}</div>
          </div>
          <div class="class-info__grid-item">
            <div class="class-info__grid-item--title"><img src="img/ci_i4.svg" alt="">Корпус</div>
            <div class="class-info__grid-item--content">${classData.building || ''}</div>
          </div>
        </div>
        <div class="class-info__floor"><span></span>${classData.floor || '?'} этаж</div>
        <a href="map.html"><button class="class-info__button">Открыть схему</button></a>
    `;
    
    const schemaButton = classInfoModal.querySelector('.class-info__button');
    if (schemaButton) {
        schemaButton.addEventListener('click', () => {
            // TODO
        });
    }
}

function positionModalNearElement(element, modal) {
    const rect = element.getBoundingClientRect();
    const modalRect = modal.getBoundingClientRect();
    
    let top = rect.top;
    
    if (top + modalRect.height > window.innerHeight - 10) {
        top = window.innerHeight - modalRect.height - 10;
    }
    
    if (top < 10) {
        top = 10;
    }
    
    modal.style.top = top + 'px';
    modal.style.display = 'block';
}

function handleDetailsClick(event) {
    event.stopPropagation();
    
    const button = event.currentTarget;
    const classDataRaw = button.getAttribute('data-class-data');
    
    if (classDataRaw) {
        try {
            const classData = JSON.parse(classDataRaw);
            createModalIfNeeded();
            updateModalContent(classData);
            positionModalNearElement(button, classInfoModal);
            positionModalNearElement(button, classInfoModal);
        } catch (error) {
            console.error('Ошибка парсинга данных:', error);
        }
    }
}

function attachDetailsHandlers() {
    const detailsButtons = document.querySelectorAll('.schedule-card__buttons--details');
    detailsButtons.forEach(button => {
        button.removeEventListener('click', handleDetailsClick);
        button.addEventListener('click', handleDetailsClick);
    });
}