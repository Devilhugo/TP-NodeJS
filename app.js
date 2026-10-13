require('dotenv').config();
if (!process.env.SESSION_SECRET) {
  throw new Error("La variable d'environnement SESSION_SECRET n'est pas définie.");
}

const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const expressSession = require('express-session');
const pgSession = require('connect-pg-simple')(expressSession);
const pool = require('./db');
const flash = require('connect-flash');

// Controllers
const homeController = require('./controllers/home');
const newPostController = require('./controllers/newPost');
const getPostController = require('./controllers/getPost');
const storePostController = require('./controllers/storePost');
const imageController = require('./controllers/image');
const newUserController = require('./controllers/newUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');

// Middlewares
const validateMiddleware = require('./middleware/ValidationMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware');

const isProd = process.env.NODE_ENV === 'production';

const app = express();

// Netlify est derrière un proxy HTTPS (nécessaire pour les cookies "secure")
app.set('trust proxy', 1);

// Moteur de vues
// Dossier des vues : à côté d'app.js en local, ou à la racine de la fonction sur Netlify
const viewsDir = [path.join(__dirname, 'views'), path.join(process.cwd(), 'views')]
  .find(dir => fs.existsSync(dir));
app.set('views', viewsDir);
app.set('view engine', 'ejs');

// Middlewares globaux
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- API REST (authentification JWT, sans session) ----------
// CORS : origine autorisée et en-têtes acceptés
app.use('/api', cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);

// Route d'API inconnue : 404 en JSON
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Ressource introuvable.' });
});

// Gestionnaire d'erreurs de l'API
app.use('/api', (err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

// ---------- Site du blog (sessions) ----------
app.use(fileUpload({
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 Mo max (limite Netlify : 6 Mo par requête, encodage base64 compris)
  abortOnLimit: true
}));
app.use(expressSession({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // Sessions stockées dans PostgreSQL (table "session") : indispensable en serverless
  store: new pgSession({ pool, tableName: 'session' }),
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 24 h
  }
}));
app.use(flash());

// Rend "loggedIn" disponible dans toutes les vues EJS
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.userId;
  next();
});

// Routes
app.get('/', homeController);
app.get('/post/:id', getPostController);
app.get('/image/:id', imageController);

app.get('/posts/new', authMiddleware, newPostController);
app.post('/posts/store', authMiddleware, validateMiddleware, storePostController);

app.get('/auth/register', redirectIfAuthenticatedMiddleware, newUserController);
app.post('/users/register', redirectIfAuthenticatedMiddleware, storeUserController);

app.get('/auth/login', redirectIfAuthenticatedMiddleware, loginController);
app.post('/users/login', redirectIfAuthenticatedMiddleware, loginUserController);

app.get('/auth/logout', logoutController);

// 404 : toujours en dernier
app.use((req, res) => {
  res.status(404).render('notfound');
});

module.exports = app;
