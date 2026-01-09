const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'dstu-interactive-guide',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ==================== Вспомогательные функции ====================
const handleError = (res, error, message = 'Ошибка сервера') => {
    console.error(error);
    res.status(500).json({ error: message, details: error.message });
};

const validateRequest = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
};

// ==================== API для пользователей ====================

// Регистрация пользователя
app.post('/api/register', [
    body('full_name').notEmpty().withMessage('ФИО обязательно'),
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
    body('role').optional().isIn(['student', 'teacher', 'admin'])
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const { full_name, email, password, phone, faculty, user_group, role = 'student' } = req.body;
        
        // Проверка существования пользователя
        const [existingUsers] = await pool.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        
        // Хеширование пароля
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Создание пользователя
        const [result] = await pool.execute(
            `INSERT INTO users 
            (full_name, email, password_hash, phone, faculty, user_group, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [full_name, email, passwordHash, phone || null, faculty || null, user_group || null, role]
        );
        
        // Получение созданного пользователя (без пароля)
        const [users] = await pool.execute(
            'SELECT user_id, full_name, email, phone, faculty, user_group, avatar_url, role, registration_date FROM users WHERE user_id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: users[0]
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при регистрации');
    }
});

// Авторизация пользователя
app.post('/api/login', [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен')
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const { email, password } = req.body;
        
        // Поиск пользователя
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const user = users[0];
        
        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        // Удаляем хеш пароля из ответа
        delete user.password_hash;
        
        res.json({
            message: 'Авторизация успешна',
            user
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при авторизации');
    }
});

// Получение информации о пользователе
app.get('/api/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        const [users] = await pool.execute(
            'SELECT user_id, full_name, email, phone, faculty, user_group, avatar_url, role, registration_date FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json(users[0]);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении пользователя');
    }
});

// ==================== API для постов ====================

// Создание поста
app.post('/api/posts', [
    body('title').notEmpty().withMessage('Заголовок обязателен'),
    body('content').notEmpty().withMessage('Контент обязателен'),
    body('author_id').isInt().withMessage('ID автора должен быть числом')
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const { title, short_description, content, image_url, author_id, status = 'draft' } = req.body;
        
        const [result] = await pool.execute(
            `INSERT INTO posts 
            (title, short_description, content, image_url, author_id, status) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [title, short_description || null, content, image_url || null, author_id, status]
        );
        
        // Получение созданного поста
        const [posts] = await pool.execute(
            'SELECT * FROM posts WHERE post_id = ?',
            [result.insertId]
        );
        
        res.status(201).json({
            message: 'Пост успешно создан',
            post: posts[0]
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при создании поста');
    }
});

// Получение всех постов (с пагинацией)
app.get('/api/posts', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'published';
        const offset = (page - 1) * limit;
        
        // Получение постов
        const [posts] = await pool.execute(
            `SELECT p.*, u.full_name as author_name 
             FROM posts p 
             LEFT JOIN users u ON p.author_id = u.user_id 
             WHERE p.status = ? 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`,
            [status, limit, offset]
        );
        
        // Получение общего количества
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM posts WHERE status = ?',
            [status]
        );
        
        res.json({
            posts,
            pagination: {
                page,
                limit,
                total: countResult[0].total,
                totalPages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при получении постов');
    }
});

// Получение поста по ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        
        const [posts] = await pool.execute(
            `SELECT p.*, u.full_name as author_name 
             FROM posts p 
             LEFT JOIN users u ON p.author_id = u.user_id 
             WHERE p.post_id = ?`,
            [postId]
        );
        
        if (posts.length === 0) {
            return res.status(404).json({ error: 'Пост не найден' });
        }
        
        // Получение тегов поста
        const [tags] = await pool.execute(
            `SELECT t.* FROM tags t
             JOIN post_tags pt ON t.tag_id = pt.tag_id
             WHERE pt.post_id = ?`,
            [postId]
        );
        
        res.json({
            ...posts[0],
            tags
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при получении поста');
    }
});

// ==================== API для тегов ====================

// Создание тега
app.post('/api/tags', [
    body('tag_name').notEmpty().withMessage('Название тега обязательно')
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const { tag_name, tag_description } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO tags (tag_name, tag_description) VALUES (?, ?)',
            [tag_name, tag_description || null]
        );
        
        res.status(201).json({
            message: 'Тег успешно создан',
            tag_id: result.insertId
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при создании тега');
    }
});

// Получение всех тегов
app.get('/api/tags', async (req, res) => {
    try {
        const [tags] = await pool.execute('SELECT * FROM tags ORDER BY tag_name');
        res.json(tags);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении тегов');
    }
});

// Добавление тега к посту
app.post('/api/posts/:id/tags', [
    body('tag_id').isInt().withMessage('ID тега должен быть числом')
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const postId = req.params.id;
        const { tag_id } = req.body;
        
        // Проверка существования поста и тега
        const [postExists] = await pool.execute('SELECT 1 FROM posts WHERE post_id = ?', [postId]);
        const [tagExists] = await pool.execute('SELECT 1 FROM tags WHERE tag_id = ?', [tag_id]);
        
        if (postExists.length === 0) {
            return res.status(404).json({ error: 'Пост не найден' });
        }
        if (tagExists.length === 0) {
            return res.status(404).json({ error: 'Тег не найден' });
        }
        
        // Проверка существования связи
        const [existingLink] = await pool.execute(
            'SELECT 1 FROM post_tags WHERE post_id = ? AND tag_id = ?',
            [postId, tag_id]
        );
        
        if (existingLink.length > 0) {
            return res.status(400).json({ error: 'Тег уже добавлен к посту' });
        }
        
        await pool.execute(
            'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
            [postId, tag_id]
        );
        
        res.json({ message: 'Тег успешно добавлен к посту' });
    } catch (error) {
        handleError(res, error, 'Ошибка при добавлении тега');
    }
});

// ==================== API для тестов ====================

// Создание теста
app.post('/api/tests', [
    body('test_name').notEmpty().withMessage('Название теста обязательно'),
    body('creator_id').isInt().withMessage('ID создателя должен быть числом')
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const { test_name, test_description, creator_id, is_published = false } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO tests (test_name, test_description, creator_id, is_published) VALUES (?, ?, ?, ?)',
            [test_name, test_description || null, creator_id, is_published]
        );
        
        res.status(201).json({
            message: 'Тест успешно создан',
            test_id: result.insertId
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при создании теста');
    }
});

// Получение опубликованных тестов
app.get('/api/tests', async (req, res) => {
    try {
        const [tests] = await pool.execute(
            `SELECT t.*, u.full_name as creator_name 
             FROM tests t 
             LEFT JOIN users u ON t.creator_id = u.user_id 
             WHERE t.is_published = TRUE 
             ORDER BY t.created_at DESC`
        );
        
        res.json(tests);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении тестов');
    }
});

// Получение теста по ID с вопросами и ответами
app.get('/api/tests/:id', async (req, res) => {
    try {
        const testId = req.params.id;
        
        // Получение информации о тесте
        const [tests] = await pool.execute(
            'SELECT * FROM tests WHERE test_id = ?',
            [testId]
        );
        
        if (tests.length === 0) {
            return res.status(404).json({ error: 'Тест не найден' });
        }
        
        const test = tests[0];
        
        // Получение вопросов теста
        const [questions] = await pool.execute(
            'SELECT * FROM questions WHERE test_id = ? ORDER BY question_id',
            [testId]
        );
        
        // Для каждого вопроса получаем варианты ответов
        for (let question of questions) {
            const [options] = await pool.execute(
                'SELECT option_id, option_text FROM answer_options WHERE question_id = ? ORDER BY option_id',
                [question.question_id]
            );
            question.options = options;
        }
        
        test.questions = questions;
        
        res.json(test);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении теста');
    }
});

// ==================== API для попыток тестирования ====================

// Начало попытки тестирования
app.post('/api/attempts', [
    body('student_id').isInt().withMessage('ID студента должен быть числом'),
    body('test_id').isInt().withMessage('ID теста должен быть числом')
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const { student_id, test_id } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO test_attempts (student_id, test_id) VALUES (?, ?)',
            [student_id, test_id]
        );
        
        res.status(201).json({
            message: 'Попытка тестирования начата',
            attempt_id: result.insertId
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при начале попытки');
    }
});

// Отправка ответа на вопрос
app.post('/api/attempts/:id/answers', [
    body('question_id').isInt().withMessage('ID вопроса должен быть числом'),
    body('selected_option_id').isInt().withMessage('ID выбранного варианта должен быть числом')
], async (req, res) => {
    try {
        validateRequest(req, res);
        
        const attemptId = req.params.id;
        const { question_id, selected_option_id } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO user_answers (attempt_id, question_id, selected_option_id) VALUES (?, ?, ?)',
            [attemptId, question_id, selected_option_id]
        );
        
        res.status(201).json({
            message: 'Ответ сохранен',
            answer_id: result.insertId
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при сохранении ответа');
    }
});

// Завершение попытки и расчет баллов
app.post('/api/attempts/:id/finish', async (req, res) => {
    try {
        const attemptId = req.params.id;
        
        // Получение всех ответов пользователя
        const [userAnswers] = await pool.execute(
            `SELECT ua.*, ao.is_correct 
             FROM user_answers ua 
             JOIN answer_options ao ON ua.selected_option_id = ao.option_id 
             WHERE ua.attempt_id = ?`,
            [attemptId]
        );
        
        // Расчет баллов
        let correctAnswers = 0;
        userAnswers.forEach(answer => {
            if (answer.is_correct) {
                correctAnswers++;
            }
        });
        
        const totalQuestions = await pool.execute(
            `SELECT COUNT(*) as total 
             FROM questions q 
             JOIN tests t ON q.test_id = t.test_id 
             JOIN test_attempts ta ON t.test_id = ta.test_id 
             WHERE ta.attempt_id = ?`,
            [attemptId]
        );
        
        const total = totalQuestions[0][0].total;
        const finalScore = total > 0 ? (correctAnswers / total) * 100 : 0;
        
        // Обновление попытки
        await pool.execute(
            'UPDATE test_attempts SET final_score = ?, completed_at = NOW() WHERE attempt_id = ?',
            [finalScore, attemptId]
        );
        
        res.json({
            message: 'Попытка завершена',
            score: finalScore,
            correct: correctAnswers,
            total: total
        });
    } catch (error) {
        handleError(res, error, 'Ошибка при завершении попытки');
    }
});

// Получение результатов попытки
app.get('/api/attempts/:id', async (req, res) => {
    try {
        const attemptId = req.params.id;
        
        const [attempts] = await pool.execute(
            `SELECT ta.*, u.full_name as student_name, t.test_name 
             FROM test_attempts ta 
             JOIN users u ON ta.student_id = u.user_id 
             JOIN tests t ON ta.test_id = t.test_id 
             WHERE ta.attempt_id = ?`,
            [attemptId]
        );
        
        if (attempts.length === 0) {
            return res.status(404).json({ error: 'Попытка не найдена' });
        }
        
        res.json(attempts[0]);
    } catch (error) {
        handleError(res, error);
    }
});

// ==================== Запуск сервера ====================
app.get('/', (req, res) => {
    res.json({ 
        message: 'API сервер интерактивного гида ДГТУ',
        version: '1.0.0',
        endpoints: {
            users: '/api/users',
            posts: '/api/posts',
            tests: '/api/tests',
            tags: '/api/tags'
        }
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});