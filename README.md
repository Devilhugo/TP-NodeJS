# Blog Node.js (TP - Parties 1 et 2)

Blog en Express + EJS + MongoDB : posts avec image, éditeur Summernote,
inscription / connexion (bcrypt + sessions), messages d'erreur flash, page 404.

## Prérequis
- Node.js 18 ou plus
- MongoDB lancé en local sur `mongodb://127.0.0.1:27017` (base `newBlog`, créée automatiquement)

## Lancer le projet
```bash
npm install
npm start
```
Puis ouvrir http://127.0.0.1:3000

## Structure
```
app.js                 configuration Express + routes
bin/www                démarrage du serveur
models/                BlogPost, User
controllers/           un fichier par action
middleware/            validation, authentification, redirection si connecté
views/                 pages EJS (+ layouts/)
public/                thème Clean Blog (css, js, assets) + images/ (uploads)
```

## Routes
| Méthode | URL              | Accès        |
|---------|------------------|--------------|
| GET     | /                | tous         |
| GET     | /post/:id        | tous         |
| GET     | /posts/new       | connecté     |
| POST    | /posts/store     | connecté     |
| GET     | /auth/register   | non connecté |
| POST    | /users/register  | non connecté |
| GET     | /auth/login      | non connecté |
| POST    | /users/login     | non connecté |
| GET     | /auth/logout     | tous         |

Thème : Start Bootstrap Clean Blog (licence MIT).
