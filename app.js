const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const expressSession = require('express-session');
const flash = require('connect-flash');

// Controllers
const homeController = require('./controllers/home');
const newPostController = require('./controllers/newPost');
const getPostController = require('./controllers/getPost');
const storePostController = require('./controllers/storePost');
const newUserController = require('./controllers/newUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require('./controllers/logout');

// Middlewares
const validateMiddleware = require('./middleware/ValidationMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const redirectIfAuthenticatedMiddleware = require('./middleware/redirectIfAuthenticatedMiddleware');

// Connexion MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/newBlog')
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

// Dossier des images uploadées
fs.mkdirSync(path.join(__dirname, 'public', 'images'), { recursive: true });

const app = express();

// Moteur de vues
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares globaux
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(expressSession({
  secret: process.env.SESSION_SECRET || 'nodejs est top',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// Rend "loggedIn" disponible dans toutes les vues EJS
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.userId;
  next();
});

// Routes (une seule déclaration par route !)
app.get('/', homeController);
app.get('/post/:id', getPostController);

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
