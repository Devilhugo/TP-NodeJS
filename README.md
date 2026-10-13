# Blog Node.js API REST

Blog en Express + EJS + PostgreSQL : posts avec image, éditeur Summernote,
inscription / connexion (bcrypt + sessions), messages d'erreur flash, page 404.

API REST sous `/api` (TP « authentification JWT ») : inscription, connexion par
jeton JWT et contrôle des rôles (user, moderator, admin), avec Sequelize sur la
**même base PostgreSQL** que le blog (le TP d'origine utilise MySQL : seul le
dialecte change). Les comptes sont partagés entre le site et l'API.

## Prérequis
- Node.js 18 ou plus
- PostgreSQL (local ou en ligne : Neon, Netlify DB...)

## Lancer le projet en local
```bash
npm install
cp .env.example .env      # puis mettre DATABASE_URL et JWT_SECRET dans .env
npm run db:init           # crée users, blogposts, session, roles, user_roles
npm start
```
Puis ouvrir http://127.0.0.1:3000

## Structure
```
app.js                 configuration Express + routes
bin/www                démarrage du serveur
config/                db.config.js (connexion), auth.config.js (clé JWT)
db/                    pool pg (index.js), schéma SQL (schema.sql), init.js
models/                BlogPost, User (requêtes SQL du blog)
                       index.js, user.model.js, role.model.js (Sequelize, API)
controllers/           un fichier par action du blog
                       auth.controller.js, user.controller.js (API)
middleware/            validation, authentification, redirection si connecté
                       authJwt.js, verifySignUp.js (API)
routes/                auth.routes.js, user.routes.js (API)
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

## API JWT
| Méthode | URL                | Accès                        |
|---------|--------------------|------------------------------|
| POST    | /api/auth/signup   | public                       |
| POST    | /api/auth/signin   | public (renvoie le jeton)    |
| GET     | /api/test/all      | public                       |
| GET     | /api/test/user     | jeton valide                 |
| GET     | /api/test/mod      | modérateur ou administrateur |
| GET     | /api/test/admin    | administrateur               |

Le jeton s'envoie dans `x-access-token: <jeton>` ou `Authorization: Bearer <jeton>`.

```bash
curl -X POST http://127.0.0.1:3000/api/auth/signup -H "Content-Type: application/json"   -d '{"username":"bob","email":"bob@example.com","password":"secret123"}'
curl -X POST http://127.0.0.1:3000/api/auth/signin -H "Content-Type: application/json"   -d '{"username":"bob","password":"secret123"}'
curl http://127.0.0.1:3000/api/test/user -H "x-access-token: <jeton>"
```
(Sous PowerShell, taper `curl.exe`.)

Différences avec le TP d'origine :
- PostgreSQL au lieu de MySQL. La table `users` du blog est réutilisée, avec une
  colonne `email` en plus. Les comptes créés par le formulaire du blog peuvent se
  connecter à l'API (email `null`, aucun rôle : seul `/api/test/user` leur est ouvert).
- Les tables sont créées par `npm run db:init` et non au démarrage du serveur
  (`sync()`), car sur Netlify chaque fonction redémarre souvent.
- Express 4 (celui du blog) : les erreurs `async` des middlewares sont transmises
  à la main avec `next(err)`.
- Question 9 appliquée : `/api/test/mod` utilise `isModeratorOrAdmin`.

### Compte rendu des tests
Codes obtenus (après la question 9) :

| Route                       | bob (user) | marie (moderator) | admin (admin) |
|-----------------------------|-----------|-------------------|---------------|
| /api/test/all (sans jeton)  | 200       | 200               | 200           |
| /api/test/user              | 200       | 200               | 200           |
| /api/test/mod               | 403       | 200               | 200           |
| /api/test/admin             | 403       | 403               | 200           |

```
signup bob une 2e fois   -> Erreur : ce nom d'utilisateur est déjà utilisé.        (400)
signup rôle superuser    -> Erreur : le rôle « superuser » n'existe pas.           (400)
signup email invalide    -> Validation error: Validation isEmail on email failed   (400)
signin mauvais mdp       -> Mot de passe incorrect.                                (401)
signin inconnu           -> Utilisateur non trouvé.                                (404)
/api/test/user sans jeton -> Aucun jeton fourni.                                   (401)
/api/test/user jeton faux -> Jeton invalide ou expiré.                             (401)
```

Jeton décodé : `{"alg":"HS256","typ":"JWT"}` / `{"id":2,"iat":…,"exp":…}`,
avec `exp - iat = 86 400 s = 24 h`.

**Question 8.** Si on modifie le payload (par exemple `"id":2` → `"id":3` pour se
faire passer pour l'admin), on obtient `Jeton invalide ou expiré.` (401). La signature
HMAC-SHA256 est calculée sur `header.payload` avec `JWT_SECRET`. `jwt.verify()` la
recalcule à partir du payload reçu, et elle ne correspond plus. Sans la clé secrète,
on ne peut pas refaire une signature valide. Le jeton est donc **intègre**, mais pas
**confidentiel** : son payload reste lisible par tous.

**Question 9.** Avec `isModerator`, l'admin reçoit 403 (« Rôle requis : moderator. »),
car les rôles ne sont pas hiérarchiques. Avec `isModeratorOrAdmin`, il reçoit 200.

## Base de données
| Table       | Colonnes principales                                                   |
|-------------|------------------------------------------------------------------------|
| `users`     | id, username (unique), password (hash bcrypt), email (unique), created_at |
| `blogposts` | id, title, body, image_data, image_type, user_id → users.id, date_posted |
| `session`   | sid, sess, expire (sessions express)                                   |
| `roles`     | id, name (1 user, 2 moderator, 3 admin) - créée par Sequelize          |
| `user_roles`| userId → users.id, roleId → roles.id (une ligne par couple)             |

## Déploiement sur Netlify
1. Créer une base PostgreSQL gratuite (par exemple sur https://neon.tech) et copier
   sa chaîne de connexion.
2. Créer les tables : mettre cette URL dans `DATABASE_URL` du fichier `.env`,
   puis `npm run db:init` (crée aussi `roles` et `user_roles` pour l'API).
3. Sur Netlify : Add new site > Import an existing project > GitHub > `TP-NodeJS`.
4. Dans Site configuration > Environment variables, ajouter :
   - `DATABASE_URL` : la chaîne de connexion PostgreSQL
   - `SESSION_SECRET` : une longue chaîne aléatoire
   - `JWT_SECRET` : une autre longue chaîne aléatoire (**obligatoire** : sans elle
     l'application refuse de démarrer)
   - `CLIENT_ORIGIN` (facultatif) : l'origine du front autorisée par CORS
   - `NODE_ENV` : `production`
5. Redéployer (Deploys > Trigger deploy).

Si tu utilises Netlify DB, la variable `NETLIFY_DATABASE_URL` est aussi reconnue.
Le disque Netlify étant en lecture seule, les images et les sessions sont en base.
