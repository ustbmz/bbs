# BBS 博客系统

本仓库为前后端分离的博客 / 论坛类站点：公开站点、管理后台与 REST API 分属三个子项目，可独立开发与部署。

---

## `front` — 用户前台

**定位**：访客与登录用户使用的 Web 前端（文章浏览、个人中心、发帖等）。

**技术栈**

- Vue 2、Vue Router、Vuex
- Vue CLI 4、Sass
- Axios 请求封装
- LayUI（布局与样式）
- vue-i18n 国际化
- vee-validate / yup 表单校验
- JWT（jsonwebtoken）、图形验证码（svg-captcha）
- dayjs 日期处理

**功能简介**

- 首页与频道列表、按分类模板展示（`channels`）
- 用户注册、登录、找回密码、邮箱确认与密码重置
- 用户个人主页（`/home/:uid`）
- 个人中心（需登录）：资料与密码、头像、账号绑定；我的发帖与收藏；消息与其他入口
- 文章发布、编辑、详情（需登录的路由守卫）
- 404 等基础页面

**常用命令**（在 `front/` 下）

```bash
npm install
npm run dev
npm run build
```

---

## `admin` — 管理后台

**定位**：运营与管理员使用的控制台（基于 iView Admin 风格的 View Design 后台）。

**技术栈**

- Vue 2、Vue Router、Vuex
- View Design（iView 4）
- Vue CLI 4、Less / Sass
- ECharts 图表、wangEditor / CodeMirror / SimpleMDE 等编辑器能力
- axios、vue-i18n、js-cookie
- 单元测试（Mocha）、E2E（Cypress 相关配置）、husky + lint-staged

**功能简介**

- 控制台首页与数据统计展示
- **内容管理**：文章、标签、友链
- **内容安全**：评论审核与管理
- **用户管理**：后台用户列表与维护
- **菜单 / 角色权限**：动态菜单与 RBAC
- **系统管理**：错误日志查看
- **博客管理**：Markdown 类文章列表、新增与编辑
- 登录、401/404/500 等错误页

**常用命令**（在 `admin/` 下）

```bash
npm install
npm run dev
npm run build
npm run test:unit
```

---

## `api` — 服务端接口

**定位**：为 `front` 与 `admin` 提供 HTTP API，负责认证、业务数据与部分实时能力。

**技术栈**

- Node.js、Koa 2
- koa-router、koa-body、koa-jwt、JWT
- Mongoose（MongoDB）
- Redis
- bcrypt 密码哈希、nodemailer 邮件
- WebSocket（`ws`）
- Babel 7、Webpack 4 打包为可部署 bundle；开发可用 nodemon

**功能简介**（按路由模块划分）

- **登录与公开接口**：注册、登录、验证码、静态资源等
- **用户**：个人资料、积分或行为相关接口
- **博客 / 内容**：文章、分类、标签等业务
- **评论**：评论发表与查询
- **管理端**：后台专用管理接口（`AdminController` 等）
- 跨域（`@koa/cors`）、安全头（koa-helmet）、压缩等中间件

**常用命令**（在 `api/` 下）

```bash
npm install
npm run start
npm run build
npm run dev
```

数据种子脚本示例：`npm run seed`、`npm run seed:admin`（需配置好数据库与环境）。

---

## 目录结构（概要）

| 目录 | 说明 |
|------|------|
| `front/` | 用户前台 SPA |
| `admin/` | 管理后台 SPA |
| `api/` | Koa + MongoDB + Redis 服务端 |

各子项目内另有 `package.json` 与可选 Docker 配置，部署前请分别配置环境变量与数据库连接。
