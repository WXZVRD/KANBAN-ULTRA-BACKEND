# 🗂 KANBAN-ULTRA Backend

![NestJS](https://img.shields.io/badge/Backend-NestJS-red?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)
![Redis](https://img.shields.io/badge/Cache-Redis-orange?logo=redis)
![Swagger](https://img.shields.io/badge/Docs-Swagger-85EA2D?logo=swagger)
![Docker](https://img.shields.io/badge/Docker-Fully%20Containerized-2496ED?logo=docker)

> **Русский:** Мощный бэкенд для современного Kanban-проекта с продвинутыми механизмами авторизации, безопасности и аналитики.  
> **English:** Powerful backend for a modern Kanban project with advanced authentication, security, and analytics features.

---

## 🎬 Демонстрация функций / Project Demo

| GIF | Описание / Description |
|-----|------------------------|
| ![OAuth](./assets/1-presentation.gif) | 🇷🇺 OAuth авторизация. <br> 🇺🇸 OAuth authorization. |
| ![Password Reset](./assets/2-presentation.gif) | 🇷🇺 Стандартный вход, сброс пароля с кодом по почте. <br> 🇺🇸 Standard login, password reset with code via email. |
| ![2FA Login](./assets/3-presentation.gif) | 🇷🇺 Вход с кодом двухфакторной аутентификации. <br> 🇺🇸 Login with two-factor authentication code. |
| ![Kanban Board](./assets/4-presentation.gif) | 🇷🇺 Драг-н-дроп колонок и задач. <br> 🇺🇸 Drag & drop columns and tasks. |
| ![Themes & i18n](./assets/6-presentation.gif) | 🇷🇺 Смена тем и локализация интерфейса. <br> 🇺🇸 Theme switch and interface localization. |
| ![Table View](./assets/7-presentation.gif) | 🇷🇺 Табличный вид, статистика и аналитика. <br> 🇺🇸 Table view, statistics, and analytics. |
| ![Admin Panel](./assets/8-presentation.gif) | 🇷🇺 Админ-панель для управления участниками. <br> 🇺🇸 Admin panel for managing participants. |

---

## 🔹 Полное описание / Full Description

**🇷🇺 Русский:**  
Backend KANBAN-ULTRA обеспечивает полный функционал Kanban-доски: управление проектами, колонками и задачами, авторизация пользователей (стандартная, OAuth, двухфакторная), почтовые уведомления (приглашения, подтверждения аккаунта, смена пароля), контроль доступа по ролям, аналитика и статистика. Используется Redis для кеширования, безопасная работа с сессиями и каптча для защиты.

**🇺🇸 English:**  
KANBAN-ULTRA backend provides full Kanban board functionality: project, column, and task management, user authentication (standard, OAuth, two-factor), email notifications (invitations, account confirmation, password reset), role-based access control, analytics, and statistics. Redis caching, secure session management, and CAPTCHA protection are implemented for performance and security.

---

## 📌 Основные фичи / Features

**🇷🇺 Русский:**
- 🔑 Авторизация: стандартная, OAuth (Google/Yandex), двухфакторная, сброс пароля
- 📧 Почтовые уведомления: приглашения, подтверждение аккаунта, коды и токены для смены пароля
- 🛡 Контроль доступа по ролям: роли в проекте и приложения
- 🗂 CRUD для проектов, колонок и задач
- ⚡ Поддержка Drag & Drop на фронтенде через API
- 📊 Полная аналитика и статистика проекта
- 🏎 Кеширование через Redis
- 🔒 Защита через каптчу при регистрации/логине
- 📜 Документация API через Swagger и JSDoc

**🇺🇸 English:**
- 🔑 User authentication: standard, OAuth (Google/Yandex), two-factor, password reset
- 📧 Email notifications: invitations, account confirmation, password tokens/codes
- 🛡 Role-based access control: project roles and application roles
- 🗂 CRUD operations for projects, columns, and tasks
- ⚡ Drag & Drop support on frontend via API
- 📊 Full analytics and project statistics
- 🏎 Redis caching for fast performance
- 🔒 CAPTCHA protection during registration/login
- 📜 API documentation with Swagger and JSDoc

---

## 🛠 Технологии / Technologies & Tools

| Компонент / Component | Технология / Technology |
|----------------------|------------------------|
| 🌐 Ядро / Core        | NestJS                 |
| 🗄 База данных / Database | PostgreSQL (TypeORM)   |
| ⚡ Кеширование / Cache | Redis + ioredis        |
| 🔑 Авторизация / Auth & Sessions | express-session, connect-redis, argon2 |
| 📧 Почта / Email & Notifications | nodemailer, @nestjs-modules/mailer, Resend, Twilio |
| 🛡 Безопасность / Security | Helmet, @nestlab/google-recaptcha (Captcha) |
| 📝 Документация / Documentation | Swagger, JSDoc        |
| 📊 Логирование / Logging | pino, pino-pretty, nestjs-pino |
| ⚙️ Дополнительно / Additional | RxJS, class-validator, class-transformer, compression |