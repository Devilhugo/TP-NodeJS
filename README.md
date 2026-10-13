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
cp .env.example .env      # puis renseigner DATABASE_URL, SESSION_SECRET et JWT_SECRET
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
   - `SESSION_SECRET` : une longue chaîne aléatoire (**obligatoire**)
   - `JWT_SECRET` : une autre longue chaîne aléatoire (**obligatoire** : sans elle
     l'application refuse de démarrer)
   - `CLIENT_ORIGIN` (facultatif) : l'origine du front autorisée par CORS
   - `NODE_ENV` : `production` (exclu du scan de secrets via `netlify.toml`)
5. Redéployer (Deploys > Trigger deploy).

Si tu utilises Netlify DB, la variable `NETLIFY_DATABASE_URL` est aussi reconnue.
Le disque Netlify étant en lecture seule, les images et les sessions sont en base.

### Erreur « The dialect https is not supported »
`DATABASE_URL` doit être une chaîne de connexion PostgreSQL commençant par
`postgres://` ou `postgresql://`, pas une adresse HTTPS de console, de projet ou
d'API. Une URL HTTPS ne peut pas être convertie en connexion PostgreSQL en
remplaçant simplement son préfixe.

Récupérer la chaîne de connexion dans les paramètres de connexion de la base,
puis corriger `DATABASE_URL` dans les variables d'environnement Netlify du
contexte concerné, avec disponibilité pour les Functions, et redéployer.
Pour une base Netlify liée, utiliser `NETLIFY_DATABASE_URL` et supprimer une
éventuelle valeur `DATABASE_URL` incorrecte : `DATABASE_URL` reste prioritaire.
Ne pas copier les identifiants dans le dépôt ni dans les journaux.

Pour récupérer la bonne valeur dans Neon :
1. Ouvrir le tableau de bord du projet, puis cliquer sur **Connect**.
2. Sélectionner la branche contenant les données de l'application, la base
   `neondb` et le rôle PostgreSQL approprié.
3. Copier la **connection string** PostgreSQL complète, avec ses paramètres SSL.
   Ne pas copier l'adresse du navigateur ou celle du SQL Editor.
4. Dans Netlify, remplacer uniquement la valeur de `DATABASE_URL` par cette
   chaîne, disponible pour les Functions dans le contexte de déploiement utilisé.
5. Enregistrer et déclencher un nouveau déploiement.

L'adresse du SQL Editor n'indique ni l'hôte PostgreSQL ni les identifiants de
connexion. Elle ne suffit donc pas à configurer l'application automatiquement.
Ne pas partager la chaîne de connexion dans une conversation : la renseigner
directement dans les paramètres sécurisés de Netlify.

### Secrets et analyse du déploiement
Les fichiers `.env` et `.env.*` sont ignorés par Git, sauf `.env.example`, qui ne
contient aucune valeur. Renseigner la connexion PostgreSQL et deux clés aléatoires
distinctes dans le fichier `.env` local et dans les variables d'environnement
Netlify, disponibles pour les Functions dans chaque contexte de déploiement utilisé.
Aucune connexion ni clé de session de secours n'est intégrée au code.

L'analyse des secrets reste activée. Seules les variables non sensibles `NODE_ENV`,
`CLIENT_ORIGIN` et `JWT_EXPIRES_IN` sont exclues par `SECRETS_SCAN_OMIT_KEYS` dans
`[build.environment]` : leurs valeurs peuvent légitimement figurer dans le code.
Ne pas exclure `DATABASE_URL`, `NETLIFY_DATABASE_URL`, `SESSION_SECRET` ou `JWT_SECRET`.

Si une clé ou une connexion a été publiée, la remplacer immédiatement auprès du
fournisseur et dans Netlify. Supprimer une valeur du code ne l'efface pas de
l'historique Git. Le journal fourni ne contient pas les lignes identifiant le
fichier détecté ; si le prochain déploiement échoue, consulter ces lignes sans
partager les valeurs sensibles.
