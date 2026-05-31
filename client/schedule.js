async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isLoggedIn) {
            console.log('Пользователь авторизован:', data);
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

function scheduleRender(scheduleData){
    const daysOrder = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    function parseDateFromRu(dateStr) {
        let parts = dateStr.split('.');
        if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
        }
        return new Date(dateStr);
    }

    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
        const yearStart = new Date(d.getFullYear(), 0, 4);
        const weekNum = 1 + Math.round(((d - yearStart) / 86400000 - 3 + (yearStart.getDay() + 6) % 7) / 7);
        return weekNum;
    }

    function getYearWeekKey(date) {
        const d = new Date(date);
        const weekNum = getWeekNumber(d);
        return `${d.getFullYear()}-W${weekNum}`;
    }

    function groupByWeek(data) {
        const weeksMap = new Map();
        data.forEach(item => {
            const dateObj = parseDateFromRu(item.date);
            const weekKey = getYearWeekKey(dateObj);
            if (!weeksMap.has(weekKey)) {
                weeksMap.set(weekKey, []);
            }
            weeksMap.get(weekKey).push(item);
        });
        return weeksMap;
    }

    function getMondayOfWeek(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diffToMonday = (day === 0 ? -6 : 1 - day);
        const monday = new Date(d);
        monday.setDate(d.getDate() + diffToMonday);
        return monday;
    }

    function getWeekRangeFromMonday(mondayDate) {
        const start = new Date(mondayDate);
        const end = new Date(mondayDate);
        end.setDate(mondayDate.getDate() + 6);
        const formatDate = (dt) => {
            let day = dt.getDate();
            let month = dt.getMonth() + 1;
            let year = dt.getFullYear();
            return `${day.toString().padStart(2,'0')}.${month.toString().padStart(2,'0')}.${year}`;
        };
        return `${formatDate(start)} - ${formatDate(end)}`;
    }

    function getCurrentWeekMonday() {
        const today = new Date();
        return getMondayOfWeek(today);
    }

    function getMondayByWeekNumber(refDate) {
        const monday = getMondayOfWeek(refDate);
        return monday;
    }

    function getDateFromWeekKey(weekKey) {
        const parts = weekKey.split('-W');
        if (parts.length !== 2) return new Date();
        const year = parseInt(parts[0]);
        const week = parseInt(parts[1]);
        const simpleDate = new Date(year, 0, 4);
        const weekNumSimple = getWeekNumber(simpleDate);
        const daysOffset = (week - weekNumSimple) * 7;
        const targetMonday = new Date(simpleDate);
        targetMonday.setDate(simpleDate.getDate() + daysOffset);
        return getMondayOfWeek(targetMonday);
    }

    function isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    function getTodayDate() {
        const today = new Date();
        today.setHours(0,0,0,0);
        return today;
    }

    let currentWeekKey = null;
    let weeksDataMap = new Map();
    let currentWeekMonday = null;

    function timeToMinutes(time) {
        const [h, m] = time.split(':');
        return parseInt(h) * 60 + parseInt(m);
    }

    function getTopPosition(startTime) {
        const minutes = timeToMinutes(startTime);
        const baseHour = 8;
        const minutesFromBase = minutes - (baseHour * 60);
        return minutesFromBase * 1.5;
    }

    function getHeight(startTime, endTime) {
        const start = timeToMinutes(startTime);
        const endM = timeToMinutes(endTime);
        return (endM - start) * 1.5;
    }

    function renderSchedule(weekData, mondayDate, weekKeyForCheck) {
        const scheduleDiv = document.getElementById('schedule');
        if (!scheduleDiv) return;
        scheduleDiv.innerHTML = '';

        const timeCol = document.createElement('div');
        timeCol.className = 'time-column';
        hours.forEach(hour => {
            const slot = document.createElement('div');
            slot.className = 'time-slot';
            slot.innerText = hour;
            timeCol.appendChild(slot);
        });
        scheduleDiv.appendChild(timeCol);

        const todayDate = getTodayDate();
        let currentDayDate = new Date(mondayDate);

        for (let i = 0; i < daysOrder.length; i++) {
            const dayName = daysOrder[i];
            const dayCol = document.createElement('div');
            dayCol.className = 'day-column';

            const header = document.createElement('div');
            header.className = 'day-header';
            header.innerText = dayName;

            const cellDate = new Date(mondayDate);
            cellDate.setDate(mondayDate.getDate() + i);
            const isToday = isSameDay(cellDate, todayDate);

            if (isToday) {
                header.classList.add('today');
            }

            dayCol.appendChild(header);

            const dayGrid = document.createElement('div');
            dayGrid.className = 'day-grid';
            dayGrid.style.position = 'relative';

            hours.forEach(() => {
                const hourRow = document.createElement('div');
                hourRow.className = 'hour-row';
                dayGrid.appendChild(hourRow);
            });

            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'cards-container';
            cardsContainer.style.position = 'absolute';
            cardsContainer.style.top = '0';
            cardsContainer.style.left = '0';
            cardsContainer.style.right = '0';
            cardsContainer.style.bottom = '0';

            const dayClasses = weekData.filter(cls => cls.weekday === dayName);
            dayClasses.forEach(cls => {
                const topPx = getTopPosition(cls.startTime);
                const heightPx = getHeight(cls.startTime, cls.endTime);
                const card = document.createElement('div');
                card.className = `card ${cls.classType}`;
                card.style.top = `${topPx}px`;
                card.style.height = `${heightPx}px`;
                card.style.minHeight = '42px';

                const buildingText = cls.building === "1" ? "1-й корпус" : `${cls.building}-й корпус`;
                const typeIcon = cls.classType === 'lecture' ? '📘' : (cls.classType === 'practice' ? '✍️' : (cls.classType === 'laboratory' ? '🔬' : '📝'));
                card.innerHTML = `
                    <div class="subject">${escapeHtml(cls.subjectName)}</div>
                    <div class="type">${typeIcon} ${capitalize(cls.classType)}</div>
                    <div class="room">🏢 ${buildingText}, ауд. ${cls.room}</div>
                    <div class="teacher">👨‍🏫 ${escapeHtml(cls.teacher)}</div>
                    <div class="room">⏰ ${cls.startTime}–${cls.endTime}</div>
                `;
                cardsContainer.appendChild(card);
            });

            dayGrid.appendChild(cardsContainer);
            dayCol.appendChild(dayGrid);
            scheduleDiv.appendChild(dayCol);
        }
    }

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function updateWeekRangeLabel(mondayDate) {
        const rangeElem = document.getElementById('weekRangeLabel');
        if (rangeElem) {
            const rangeStr = getWeekRangeFromMonday(mondayDate);
            rangeElem.innerText = rangeStr;
        }
    }

    function loadWeekByKey(weekKey) {
        if (!weeksDataMap.has(weekKey)) {
            weeksDataMap.set(weekKey, []);
        }
        const weekItems = weeksDataMap.get(weekKey) || [];
        const mondayForRange = getDateFromWeekKey(weekKey);
        currentWeekMonday = mondayForRange;
        updateWeekRangeLabel(mondayForRange);
        renderSchedule(weekItems, mondayForRange, weekKey);
    }

    function changeWeek(delta) {
        if (!currentWeekMonday) {
            const initMonday = getCurrentWeekMonday();
            const initKey = getYearWeekKey(initMonday);
            currentWeekKey = initKey;
            currentWeekMonday = initMonday;
        }
        const newMonday = new Date(currentWeekMonday);
        newMonday.setDate(currentWeekMonday.getDate() + (delta * 7));
        const newWeekKey = getYearWeekKey(newMonday);
        currentWeekKey = newWeekKey;
        currentWeekMonday = newMonday;
        if (!weeksDataMap.has(newWeekKey)) {
            weeksDataMap.set(newWeekKey, []);
        }
        loadWeekByKey(newWeekKey);
    }

    function init() {
        weeksDataMap = groupByWeek(scheduleData);

        const today = new Date();
        const currentMonday = getMondayOfWeek(today);
        const startWeekKey = getYearWeekKey(currentMonday);
        currentWeekKey = startWeekKey;
        currentWeekMonday = currentMonday;

        if (!weeksDataMap.has(startWeekKey)) {
            weeksDataMap.set(startWeekKey, []);
        }

        loadWeekByKey(startWeekKey);

        const prevBtn = document.getElementById('prevWeek');
        const nextBtn = document.getElementById('nextWeek');
        if (prevBtn) prevBtn.onclick = () => changeWeek(-1);
        if (nextBtn) nextBtn.onclick = () => changeWeek(1);
    }

    init();
}

async function getSchedule() {
    try {
        const response = await fetch('/api/fullschedule');
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка при загрузке расписания');
        }
        
        const schedule = await response.json();
        scheduleRender(schedule);
    } catch (error) {
        console.error('Ошибка:', error.message);
        throw error;
    }
}

getSchedule();