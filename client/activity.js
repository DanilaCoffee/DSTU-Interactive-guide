activityGrid = document.querySelector('.activity-grid');
upcomingActivitiesBlock = document.querySelector('.upcoming-activities__list');
tagsGrid = document.querySelector('.activity-filter__tags-list');
let allActivities = [];
let allTags = [];

function parseISODate(dateString) {
  const date = new Date(dateString);
  
  const day = date.getUTCDate();
  const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const month = monthNames[date.getUTCMonth()];
  const dateStr = `${day} ${month}`;
  
  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const weekDay = weekDays[date.getUTCDay()];
  
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  return {
    date: dateStr,
    weekday: weekDay,
    time: timeStr
  };
}

function getTwoClosestFutureActivities(activities) {
  const now = new Date();
  
  const futureActivities = activities.filter(activity => {
    const activityDate = new Date(activity.datetime);
    return activityDate > now;
  });
  
  futureActivities.sort((a, b) => {
    return new Date(a.datetime) - new Date(b.datetime);
  });

  return futureActivities.slice(0, 2);
}

async function fetchActivities() {
    try {
        const response = await fetch('/api/activities');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const activities = await response.json();
        return activities;
    } catch (error) {
        console.error('Ошибка при получении активностей:', error);
        throw error;
    }
}

async function loadActivities() {
    try {
        const activities = await fetchActivities();
        allActivities = activities
        activityGrid.innerHTML = '';
        activities.forEach(active => {
            if (active.topic == "Творчество") {
                activityGrid.innerHTML += `
                <div class="activity-card">
                  <div class="activity-card__title">${active.title}</div>
                  <div class="activity-card__description">${active.description}</div>
                  <div class="activity-card__phone"><img src="img/acti1.svg" alt="">${active.phone}</div>
                  <div class="activity-card__link"><a href="${active.link}" target="_blank"><img src="img/acti2.svg" alt="">${active.link}</a></div>
                  <div class="activity-card__button"><a href="${active.link}" target="_blank">Подробнее →</a></div>
                </div>`
            }
        });
        upcomingActivitiesBlock.innerHTML = '';
        upcomingActivities = getTwoClosestFutureActivities(allActivities);
        upcomingActivities.forEach(active => {
            upcomingActivitiesBlock.innerHTML += `
            <div class="activity-short">
            <div class="activity-short__datetime">
              ${parseISODate(active.datetime).date} <span></span> ${parseISODate(active.datetime).weekday} <span></span> ${parseISODate(active.datetime).time}
            </div>
            <div class="activity-short__title"><a href="${active.link}" target="_blank">${active.title_short}</a></div>
            <div class="activity-short__location">${active.location}</div>
          </div>`
        });
        
    } catch (error) {
        console.log("activities error");
    }
}

loadActivities()

// async function fetchTags() {
//     try {
//         const response = await fetch('/api/tags');
        
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const tags = await response.json();
//         return tags;
//     } catch (error) {
//         console.error('Ошибка при получении активностей:', error);
//         throw error;
//     }
// }

// async function loadTags() {
//     try {
//         const tags = await fetchTags();
//         allTags = tags
//         tagsGrid.innerHTML = '<div class="activity-filter__tag active">все</div>';
//         tags.forEach(tag => {
//             if (tag.tag_topic == "Творчество") {
//                 tagsGrid.innerHTML += `<div class="activity-filter__tag">${tag.tag_name}</div>`
//             }
//         });
//     } catch (error) {
//         console.log("activities error");
//     }
// }

// loadTags()

const activityButtons = document.getElementsByClassName('tab');

for (let i = 0; i < 3; i++) {
    activityButtons[i].addEventListener('click', () => {
        let topic = "";
        switch (i) {
            case 0:
                topic = "Творчество";
            break;
            case 1:
                topic = "Спорт";
            break;
            case 2:
                topic = "Волонтерство";
            break;
            default:
                topic = "Творчество";
        }
        activityGrid.innerHTML = '';
        allActivities.forEach(active => {
            if (active.topic == topic) {
                activityGrid.innerHTML += `
                <div class="activity-card">
                  <div class="activity-card__title">${active.title}</div>
                  <div class="activity-card__description">${active.description}</div>
                  <div class="activity-card__phone"><img src="img/acti1.svg" alt="">${active.phone}</div>
                  <div class="activity-card__link"><a href="${active.link}" target="_blank"><img src="img/acti2.svg" alt="">${active.link}</a></div>
                  <div class="activity-card__button"><a href="${active.link}" target="_blank">Подробнее →</a></div>
                </div>`
            }
        });
        // tagsGrid.innerHTML = '<div class="activity-filter__tag active">все</div>';
        // allTags.forEach(tag => {
        //     if (tag.tag_topic == topic) {
        //         tagsGrid.innerHTML += `<div class="activity-filter__tag">${tag.tag_name}</div>`
        //     }
        // });
    })
}