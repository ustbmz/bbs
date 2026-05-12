# BBS Blog System · 博客系统

This repository is a decoupled blog / community-style site: the public web app, admin console, and HTTP API live in three separate packages that can be developed and deployed on their own.

---

### `front` — Public web app

**Role**: End-user SPA for reading posts, account flows, and publishing.

<img width="1470" height="802" alt="bbsfront" src="https://github.com/user-attachments/assets/7e23e989-91fb-4ea5-b57b-0db4e30b9649" />
<img width="1470" height="802" alt="newPost" src="https://github.com/user-attachments/assets/c3dd394d-8e97-4f7b-b263-ae13618257ad" />
<img width="1470" height="802" alt="content" src="https://github.com/user-attachments/assets/bbb93739-64e8-4960-8c4f-ecc689532da5" />



**Stack**

- Vue 2, Vue Router, Vuex
- Vue CLI 4, Sass
- Axios
- LayUI (layout / styling)
- vue-i18n
- vee-validate, yup
- JWT (`jsonwebtoken`), SVG captcha (`svg-captcha`)
- dayjs

**Features**

- Home and channel listing, category templates (`channels`)
- Sign up, sign in, forgot password, email confirmation, password reset
- User public profile (`/home/:uid`)
- User center (auth required): profile & password, avatar, account binding; my posts & collections; messages and other entry points
- Create, edit, and view posts (route guards for protected actions)
- Basic pages such as 404

**Commands** (from `front/`)

```bash
npm install
npm run dev
npm run build
```

---

### `admin` — Admin console

**Role**: Operations / staff UI (View Design, iView-admin–style shell).

**Stack**

- Vue 2, Vue Router, Vuex
- View Design (iView 4)
- Vue CLI 4, Less / Sass
- ECharts; wangEditor, CodeMirror, SimpleMDE, and related editor tooling
- axios, vue-i18n, js-cookie
- Unit tests (Mocha), E2E (Cypress-related setup), husky + lint-staged

**Features**

- Dashboard home and stats
- **Content**: articles, tags, friend links
- **Moderation**: comment review and management
- **Users**: back-office user list and maintenance
- **Menus & RBAC**: dynamic menus and role-based access
- **System**: error log inspection
- **Blog**: Markdown-oriented article list, create, and edit
- Login and 401 / 404 / 500 pages

**Commands** (from `admin/`)

```bash
npm install
npm run dev
npm run build
npm run test:unit
```

---

### `api` — Backend service

**Role**: HTTP API for `front` and `admin`: auth, domain data, and some realtime behavior.

**Stack**

- Node.js, Koa 2
- koa-router, koa-body, koa-jwt, JWT
- Mongoose (MongoDB)
- Redis
- bcrypt, nodemailer
- WebSocket (`ws`)
- Babel 7, Webpack 4 bundle for deployment; nodemon in development

**Features** (by route modules)

- **Auth & public**: registration, login, captcha, static assets, etc.
- **Users**: profile and related behavior APIs
- **Blog / content**: posts, categories, tags, etc.
- **Comments**: create and read flows
- **Admin**: dedicated back-office APIs (e.g. `AdminController`)
- Middleware: CORS (`@koa/cors`), security headers (koa-helmet), compression, etc.

**Commands** (from `api/`)

```bash
npm install
npm run start
npm run build
npm run dev
```

Optional data seeds: `npm run seed`, `npm run seed:admin` (requires DB and environment configuration).

---

### Repository layout

| Path | Description |
|------|-------------|
| `front/` | Public user SPA |
| `admin/` | Admin SPA |
| `api/` | Koa + MongoDB + Redis server |

Each package has its own `package.json` and optional Docker assets; configure environment variables and database connections before deployment.

---

