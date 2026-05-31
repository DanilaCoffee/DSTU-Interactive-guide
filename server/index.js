require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const schedule = require('./schedule.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
    }
}));

const pool = mysql.createPool({
    // host: '127.0.0.1',
    // user: 'root',
    // password: '',
    // database: 'dstu-interactive-guide',
    // waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0
    
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Успешное подключение к облачной БД timeweb cloud');
        console.log('   Host:', process.env.DB_HOST);
        console.log('   Database:', process.env.DB_NAME);
        connection.release();
    } catch (error) {
        console.error('❌ Ошибка подключения к БД:', error.message);
        console.error('   Проверь данные в server/.env');
        process.exit(1);
    }
}

testConnection();

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

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Только JPG и PNG изображения'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

app.use(express.static(path.join(__dirname, '../client')));
app.use('/uploads', express.static('uploads'));

app.get('/api/schedule', async (req, res) => {
    try {
        const today = new Date();
        const todayFormatted = `${String(today.getDate()).padStart(2, '0')}.${String(today.getMonth() + 1).padStart(2, '0')}.${today.getFullYear()}`;
        
        const todaySchedule = schedule.filter(item => item.date === todayFormatted);
        
        res.json(todaySchedule);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Ошибка при получении расписания' });
    }
});

app.get('/api/fullschedule', async (req, res) => {
    try {
        res.json(schedule);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении расписания');
    }
});

// ---------- НОВЫЙ ЭНДПОИНТ: ЛОГИН ----------
app.post('/api/login', [
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').notEmpty().withMessage('Введите пароль')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    
    try {
        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ?', 
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        req.session.userId = user.user_id;
        req.session.userFirstName = user.first_name;
        req.session.userLastName = user.last_name;
        req.session.userPatronymic = user.patronymic;
        req.session.userPhone = user.phone;
        req.session.userFaculty = user.faculty;
        req.session.userGroup = user.user_group;
        req.session.userRole = user.role;
        req.session.userYear = user.year;
        req.session.userDepartment = user.department;
        req.session.userAcademicPosition = user.academic_position;
        req.session.userAvatar = user.avatar_url;
        req.session.isLoggedIn = true;

        res.json({
            success: true,
            user: {
                id: user.user_id,
                fullname: [user.first_name, user.last_name, user.patronymic],
                faculty: user.faculty,
                group: user.user_group,
                role: user.role,
                year: user.year,
                department: user.department,
                academicposition: user.academic_position,
                avatar: user.avatar_url
            }
        });
        
    } catch (error) {
        handleError(res, error, 'Ошибка при входе');
    }
});

// ---------- НОВЫЙ ЭНДПОИНТ: ПРОВЕРКА АВТОРИЗАЦИИ ----------
app.get('/api/check-auth', async (req, res) => {
    try {
        if (req.session.isLoggedIn && req.session.userId) {
            res.json({
                isLoggedIn: true,
                id: req.session.userId,
                fullname: [req.session.userFirstName, req.session.userLastName, req.session.userPatronymic],
                faculty: req.session.userFaculty,
                group: req.session.userGroup,
                role: req.session.userRole,
                year: req.session.userYear,
                department: req.session.userDepartment,
                academicposition: req.session.userAcademicPosition,
                avatar: req.session.userAvatar
            });
        } else {
            res.json({ isLoggedIn: false });
        }
    } catch (error) {
        handleError(res, error, 'Ошибка проверки авторизации');
    }
});

// ---------- НОВЫЙ ЭНДПОИНТ: ВЫХОД ----------
app.post('/api/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return handleError(res, err, 'Ошибка при выходе');
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Вы вышли из системы' });
    });
});

// ---------- НОВЫЙ ЭНДПОИНТ: РЕГИСТРАЦИЯ ----------
app.post('/api/register', [
    body('first_name').notEmpty().withMessage('Введите имя'),
    body('last_name').notEmpty().withMessage('Введите фамилию'),
    body('email').isEmail().withMessage('Некорректный email'),
    body('password').isLength({ min: 6 }).withMessage('Пароль должен быть минимум 6 символов'),
    body('role').isIn(['student', 'teacher']).withMessage('Неверная роль')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {
        first_name,
        last_name,
        patronymic = null,
        email,
        password,
        role,
        user_group = null,
        year = null,
        faculty = null,
        department = null,
        academic_position = null,
        phone = null
    } = req.body;

    try {
        const [existingUsers] = await pool.execute(
            'SELECT user_id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            `INSERT INTO users (
                first_name, 
                last_name, 
                patronymic, 
                email, 
                password_hash, 
                role,
                user_group,
                year,
                faculty,
                department,
                academic_position,
                phone,
                avatar_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '')`,
            [
                first_name,
                last_name,
                patronymic,
                email,
                hashedPassword,
                role,
                user_group,
                year,
                faculty,
                department,
                academic_position,
                phone
            ]
        );

        const newUserId = result.insertId;
        
        req.session.userId = newUserId;
        req.session.userFirstName = first_name;
        req.session.userLastName = last_name;
        req.session.userPatronymic = patronymic;
        req.session.userPhone = phone;
        req.session.userFaculty = faculty;
        req.session.userGroup = user_group;
        req.session.userRole = role;
        req.session.userYear = year;
        req.session.userDepartment = department;
        req.session.userAcademicPosition = academic_position;
        req.session.isLoggedIn = true;

        res.json({
            success: true,
            message: 'Регистрация успешна',
            user: {
                id: newUserId,
                fullname: [first_name, last_name, patronymic],
                faculty: faculty,
                group: user_group,
                role: role,
                year: year,
                department: department,
                academicposition: academic_position
            }
        });

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка при регистрации', details: error.message });
    }
});

app.get('/api/activities', async (req, res) => {
    try {
        const [activities] = await pool.execute(
            'SELECT * FROM activity ORDER BY datetime DESC'
        );

        const [relations] = await pool.execute(
            `SELECT at.activity_id, t.tag_id, t.tag_name, t.tag_topic
             FROM activity_tags at
             JOIN tags t ON at.tag_id = t.tag_id`
        );

        const tagsMap = new Map();
        for (const relation of relations) {
            if (!tagsMap.has(relation.activity_id)) {
                tagsMap.set(relation.activity_id, []);
            }
            tagsMap.get(relation.activity_id).push({
                tag_id: relation.tag_id,
                tag_name: relation.tag_name,
                tag_topic: relation.tag_topic
            });
        }

        const activitiesWithTags = activities.map(activity => ({
            ...activity,
            tags: tagsMap.get(activity.id) || []
        }));

        res.json(activitiesWithTags);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении активностей');
    }
});

app.get('/api/advice', async (req, res) => {
    try {
        const [posts] = await pool.execute(
            'SELECT * FROM posts ORDER BY created_at DESC'
        );
        
        if (posts.length === 0) {
            return res.json([]);
        }
        
        const postIds = posts.map(post => post.post_id);
        
        const [postTags] = await pool.execute(
            `SELECT pt.post_id, t.tag_name 
             FROM post_tags pt
             JOIN tags t ON pt.tag_id = t.tag_id
             WHERE pt.post_id IN (${postIds.map(() => '?').join(',')})`,
            postIds
        );
        
        const tagsByPostId = {};
        postTags.forEach(item => {
            if (!tagsByPostId[item.post_id]) {
                tagsByPostId[item.post_id] = [];
            }
            tagsByPostId[item.post_id].push(item.tag_name);
        });
        
        const postsWithTags = posts.map(post => ({
            ...post,
            tags: tagsByPostId[post.post_id] || []
        }));
        
        res.json(postsWithTags);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении советов');
    }
});

app.get('/api/advice/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [users] = await pool.execute(
            'SELECT user_id FROM users WHERE user_id = ?',
            [userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        const [posts] = await pool.execute(
            'SELECT * FROM posts WHERE author_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        if (posts.length === 0) {
            return res.json([]);
        }
        
        const postIds = posts.map(post => post.post_id);
        
        const [postTags] = await pool.execute(
            `SELECT pt.post_id, t.tag_name 
             FROM post_tags pt
             JOIN tags t ON pt.tag_id = t.tag_id
             WHERE pt.post_id IN (${postIds.map(() => '?').join(',')})`,
            postIds
        );
        
        const tagsByPostId = {};
        postTags.forEach(item => {
            if (!tagsByPostId[item.post_id]) {
                tagsByPostId[item.post_id] = [];
            }
            tagsByPostId[item.post_id].push(item.tag_name);
        });
        
        const postsWithTags = posts.map(post => ({
            ...post,
            tags: tagsByPostId[post.post_id] || []
        }));
        
        res.json(postsWithTags);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении советов пользователя');
    }
});

app.get('/api/tests', async (req, res) => {
    try {
        const [tests] = await pool.execute(
            'SELECT * FROM tests ORDER BY created_at DESC'
        );
        
        res.json(tests);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении тестов');
    }
});

app.get('/api/tags', async (req, res) => {
    try {
        const [tags] = await pool.execute(
            'SELECT * FROM tags'
        );
        
        res.json(tags);
    } catch (error) {
        handleError(res, error, 'Ошибка при получении тегов');
    }
});

app.post('/api/newpost', 
    upload.single('image'),
    [ 
        body('title').notEmpty().withMessage('Введите заголовок поста'),
        body('tags').custom(value => {
            try {
                const tags = JSON.parse(value);
                return tags.length === 1 || tags.length === 2;
            } catch {
                return false;
            }
        }).withMessage('Должен быть 1 или 2 тега'),
        body('short_description').notEmpty().withMessage('Введите краткое описание'),
        body('content').notEmpty().withMessage('Введите текст поста'),
        body('author_id').isInt({ min: 1 }).withMessage('Некорректный ID автора')
    ], 
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({ errors: errors.array() });
        }

        let tags;
        try {
            tags = JSON.parse(req.body.tags);
        } catch {
            tags = [];
        }

        const {
            title,
            short_description,
            content,
            author_id
        } = req.body;

        let image_url = '';
        if (req.file) {
            image_url = `/uploads/${req.file.filename}`;
        }

        const connection = await pool.getConnection();
        
        try {
            const [authorExists] = await connection.execute(
                'SELECT user_id FROM users WHERE user_id = ?',
                [author_id]
            );

            if (authorExists.length === 0) {
                if (req.file) fs.unlinkSync(req.file.path);
                connection.release();
                return res.status(404).json({ error: 'Автор с указанным ID не найден' });
            }

            await connection.query('START TRANSACTION');

            const [postResult] = await connection.execute(
                `INSERT INTO posts (
                    title,
                    short_description,
                    content,
                    image_url,
                    author_id,
                    status,
                    created_at,
                    likes,
                    views
                ) VALUES (?, ?, ?, ?, ?, 'pending', NOW(), 0, 0)`,
                [title, short_description, content, image_url, author_id]
            );

            const newPostId = postResult.insertId;

            for (const tagName of tags) {
                const [tagRows] = await connection.execute(
                    'SELECT tag_id FROM tags WHERE tag_name = ?',
                    [tagName]
                );

                if (tagRows.length === 0) {
                    await connection.query('ROLLBACK');
                    if (req.file) fs.unlinkSync(req.file.path);
                    connection.release();
                    return res.status(404).json({ 
                        error: `Тег "${tagName}" не найден в базе данных` 
                    });
                }

                await connection.execute(
                    'INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)',
                    [newPostId, tagRows[0].tag_id]
                );
            }

            await connection.query('COMMIT');
            connection.release();

            res.status(201).json({
                success: true,
                message: 'Пост успешно создан',
                post: {
                    id: newPostId,
                    image_url: image_url
                }
            });

        } catch (error) {
            await connection.query('ROLLBACK');
            if (req.file) fs.unlinkSync(req.file.path);
            connection.release();
            throw error;
        }
    }
);

app.get('/', (req, res) => {
    res.json({ 
        message: 'API сервер интерактивного гида ДГТУ',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/login',
                register: 'POST /api/register',
                logout: 'POST /api/logout',
                checkAuth: 'GET /api/check-auth'
            },
            schedule: {
                today: 'GET /api/schedule',
                full: 'GET /api/fullschedule'
            },
            activities: 'GET /api/activities',
            advice: {
                all: 'GET /api/advice',
                byUser: 'GET /api/advice/:userId'
            },
            tests: 'GET /api/tests',
            tags: 'GET /api/tags',
            posts: 'POST /api/newpost'
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});