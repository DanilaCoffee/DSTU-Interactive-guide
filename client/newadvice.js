let userID = 0;

async function checkAuth() {
    try {
        const response = await fetch('/api/check-auth', {
            method: 'GET',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isLoggedIn) {
            console.log('Пользователь авторизован:', data);
            document.querySelector('.btn--lk').style.display = 'block';
            document.querySelector('.btn--logout').style.display = 'block';
            userID = data.id;
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

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => {
    fileInput.click();
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
    });
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
    });
});

dropZone.addEventListener('drop', handleDrop);

fileInput.addEventListener('change', function() {
    if (this.files.length) {
        handleFiles(this.files);
    }
});

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    const file = files[0];
    
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        alert('Пожалуйста, загружайте только JPG или PNG файлы');
        return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Размер файла не должен превышать 5 МБ');
        return;
    }
    
    document.querySelector('.upload-text').innerHTML = `Файл "${file.name}" загружен!<br>Размер: ${(file.size / 1024).toFixed(2)} КБ`;
}

const newadviсeSectionOne = document.querySelector('.section-one');
const newadviсeSectionTwo = document.querySelector('.section-two');
const newadviсePostInfo = document.querySelector('.newadviсe-content__post-info');
const newadviсePostText = document.querySelector('.newadviсe-content__post-text');

document.querySelector('.newadviсe__buttons--next').addEventListener('click', () => {
    if (document.getElementById('post-header').value == '') {
        alert('Введите заголовок поста');
        return;
    }

    if (document.getElementById('tag1').value == 'Тэг 1, например: стипендия' && document.getElementById('tag2').value == 'Тэг 2, например: учеба') {
        alert('Выберите хотя бы один тэг');
        return;
    }

    if (document.getElementById('fileInput').value == '') {
        alert('Введите обложку поста');
        return;
    }

    if (document.getElementById('fileInput').value == '') {
        alert('Введите обложку поста');
        return;
    }

    if (document.getElementById('post-description').value == '') {
        alert('Напишите описание поста');
        return;
    }

    newadviсeSectionOne.classList.remove('active');
    newadviсeSectionTwo.classList.add('active');
    newadviсePostInfo.classList.remove('active');
    newadviсePostText.classList.add('active');
    window.scrollTo({ top: 0});
});

document.querySelector('.newadviсe__buttons--back').addEventListener('click', () => {
    newadviсeSectionTwo.classList.remove('active');
    newadviсeSectionOne.classList.add('active');
    newadviсePostText.classList.remove('active');
    newadviсePostInfo.classList.add('active');
    window.scrollTo({ top: 0});
});

document.querySelector('.newadviсe__buttons--publish').addEventListener('click', async () => {
    if (document.getElementById('post-text').value == '') {
        alert('Введите текст поста');
        return;
    }

    const title = document.getElementById('post-header').value;
    const short_description = document.getElementById('post-description').value;
    const content = document.getElementById('post-text').value;
    const author_id = userID;
    
    const fileInput = document.getElementById('fileInput');
    const imageFile = fileInput.files[0];
    
    if (!imageFile) {
        alert('Загрузите обложку поста');
        return;
    }
    
    if (!imageFile.type.match('image/jpeg') && !imageFile.type.match('image/png')) {
        alert('Можно загружать только JPG и PNG изображения');
        return;
    }
    
    if (imageFile.size > 5 * 1024 * 1024) {
        alert('Размер изображения не должен превышать 5 МБ');
        return;
    }
    
    const tags = [];
    const tag1 = document.getElementById('tag1').value;
    const tag2 = document.getElementById('tag2').value;
    
    if (tag1 != 'Тэг 1, например: стипендия') tags.push(tag1);
    if (tag2 != 'Тэг 2, например: учеба') tags.push(tag2);
    
    if (tags.length === 0) {
        alert('Заполните хотя бы один тег');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('tags', JSON.stringify(tags));
    formData.append('short_description', short_description);
    formData.append('content', content);
    formData.append('author_id', author_id);
    formData.append('image', imageFile);

    try {
        const response = await fetch('/api/newpost', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            alert('Пост успешно создан!');
            window.location.href = '/advice.html';
        } else {
            if (result.errors) {
                const errorMessages = result.errors.map(err => err.msg).join('\n');
                alert(`Ошибка валидации:\n${errorMessages}`);
            } else if (result.error) {
                alert(`Ошибка: ${result.error}`);
            } else {
                alert('Произошла ошибка при создании поста');
            }
        }
    } catch (error) {
        console.error('Ошибка при отправке запроса:', error);
        alert('Ошибка соединения с сервером');
    }
});