# Blog Node.js (TP - Parties 1 et 2)

Blog en Express + EJS + PostgreSQL : posts avec image, éditeur Summernote,
inscription / connexion (bcrypt + sessions), messages d'erreur flash, page 404.

## Prérequis
- Node.js 18 ou plus
- PostgreSQL (local ou en ligne : Neon, Netlify DB...)

## Lancer le projet en local
```bash
npm install
cp .env.example .env      # puis mettre ta DATABASE_URL dans .env
npm run db:init           # crée les tables users, blogposts, session
npm start
```
Puis ouvrir http://127.0.0.1:3000

## Structure
```
app.js                 configuration Express + routes
bin/www                démarrage du serveur
db/                    connexion (index.js), schéma SQL (schema.sql), init.js
models/                BlogPost, User (requêtes SQL)
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

## Base de données
| Table       | Colonnes principales                                                   |
|-------------|------------------------------------------------------------------------|
| `users`     | id, username (unique), password (hash bcrypt), created_at              |
| `blogposts` | id, title, body, image_data, image_type, user_id → users.id, date_posted |
| `session`   | sid, sess, expire (sessions express)                                   |

## Déploiement sur Netlify
1. Créer une base PostgreSQL gratuite (par exemple sur https://neon.tech) et copier
   sa chaîne de connexion.
2. Créer les tables : mettre cette URL dans `DATABASE_URL` du fichier `.env`,
   puis `npm run db:init` (ou coller `db/schema.sql` dans l'éditeur SQL de Neon).
3. Sur Netlify : Add new site > Import an existing project > GitHub > `TP-NodeJS`.
4. Dans Site configuration > Environment variables, ajouter :
   - `DATABASE_URL` : la chaîne de connexion PostgreSQL
   - `SESSION_SECRET` : une longue chaîne aléatoire
   - `NODE_ENV` : `production`
5. Redéployer (Deploys > Trigger deploy).

Si tu utilises Netlify DB, la variable `NETLIFY_DATABASE_URL` est aussi reconnue.
Le disque Netlify étant en lecture seule, les images et les sessions sont en base.
