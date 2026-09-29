# AI PM Academy

Бесплатная платформа обучения проект-менеджеров, которые работают с ИИ: уровни Junior → Middle → Senior, уроки, тесты, практика, итоговые экзамены и сертификаты с публичной проверкой. Продуктовые требования — в [`docs/PRD.md`](docs/PRD.md).

## Быстрый старт

```bash
pnpm install
cp .env.example .env.local   # по умолчанию ничего менять не нужно
pnpm dev                     # http://localhost:3000
```

Локально база данных — встроенный Postgres на WASM ([PGlite](https://pglite.dev)) в `./.data`: ставить ничего не нужно, миграции применяются при старте. Письма (вход по ссылке, подтверждение email) печатаются в консоль.

| Команда                                                          | Что делает                                                              |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev` / `pnpm build` / `pnpm start`                         | Разработка, production-сборка, запуск сборки                            |
| `pnpm lint` · `pnpm lint:fsd` · `pnpm typecheck` · `pnpm format` | ESLint, архитектура FSD (Steiger), TypeScript, Prettier                 |
| `pnpm content:validate`                                          | Схемы контента, перекрёстные ссылки, компиляция MDX, свежесть ИИ-уроков |
| `pnpm content:generate --module j02`                             | Генерация уроков и теста модуля по спецификации (ИИ, офлайн)            |
| `pnpm content:review --module j02`                               | Перекрёстное ревью уроков моделью другого вендора                       |
| `pnpm content:program`                                           | Пересобрать `docs/PROGRAM.md` — программу курса из спецификаций модулей |
| `pnpm test` · `pnpm test:e2e`                                    | Юнит-тесты (Vitest) · e2e на production-сборке (Playwright)             |
| `pnpm db:generate` · `pnpm db:migrate`                           | Новая миграция из схемы · применение миграций к Postgres                |
| `pnpm check`                                                     | Всё, кроме e2e, одной командой                                          |

## Стек

- **Next.js 16** (App Router, Turbopack, **Cache Components / Partial Prerendering**), React 19, TypeScript strict.
- **Tailwind CSS v4** + дизайн-токены в `src/app/styles/globals.css`.
- UI-библиотеки из [кураторского списка Эмиля Ковальски](https://github.com/emilkowalski/skills): **Base UI** (примитивы), **Sonner** (тосты), **Motion** (анимация перестановки), **NumberFlow** (числа), **cva + clsx**, **next-themes**.
- **MDX + YAML в Git** как источник контента, схемы **Zod**, типограф **Typograf**.
- **Better Auth** (email + пароль, вход по ссылке, Яндекс ID, VK ID), **Drizzle ORM** + PostgreSQL (прод) / PGlite (локально и в e2e).
- Инфраструктура — **Yandex Cloud** (152-ФЗ): Serverless Containers, Managed PostgreSQL, Postbox, Яндекс Метрика.

## Архитектура: Feature-Sliced Design

```
app/                  маршрутизация Next.js — только тонкие файлы, реэкспорт страниц из src/pages
pages/README.md       пустая папка-заглушка, чтобы Next не принял src/pages за Pages Router
src/
  app/                FSD app: провайдеры, глобальные стили и токены, метаданные
  pages/              страницы, сгруппированы: course/ library/ account/ info/ + home
  widgets/            крупные блоки: шапка, hero, тело урока, оглавление, раннеры тестов…
  features/           действия пользователя: вход, отметка урока, копирование промпта, сдача задания…
  entities/           предметная область: course, quiz, prompt, template, glossary, progress, certificate, user
  shared/             ui-кит, lib, config, content (MDX/YAML), db, auth, mail, og
content/              курс, библиотека, юридические документы, стандарт стиля
scripts/              валидация и ИИ-генерация контента, миграции
tests/                unit (Vitest) и e2e (Playwright)
```

Правила:

- Импорт только сверху вниз по слоям и только через публичный API слайса. Проверяет Steiger (`pnpm lint:fsd`).
- У слайса два публичных входа: **`index.ts`** — безопасный для клиента, **`index.server.ts`** — только сервер (БД, файловая система, секреты). Так серверный код не попадает в клиентский бандл.
- Серверные экшены лежат в `features/*/api/actions.ts` (`"use server"`), проверяют сессию и входные данные через Zod.

### Рендеринг (Cache Components)

Каждая страница — статическая оболочка, пререндеренная на сборке, а персональное (сессия, прогресс) приходит потоком через `<Suspense>`. Правила, которые валидирует Next:

- Чтение `cookies()`/`headers()`/сессии — только внутри `<Suspense>`.
- Страницы с параметрами (`[level]`, `[lesson]`…) оборачивают содержимое в `<Suspense>`; известные параметры из `generateStaticParams` всё равно пререндерятся целиком.
- Контент читается синхронно с диска — это «предсказуемые данные», они попадают в оболочку автоматически.

## Контент

```
content/
  course/<level>/_level.yaml
  course/<level>/_exam.yaml                итоговый экзамен (пул ≥ 3× вопросов)
  course/<level>/<id>-<slug>/_module.yaml  спецификация модуля (цели, ключевые понятия, план уроков)
  course/<level>/<id>-<slug>/NN-<slug>.mdx уроки
  course/<level>/<id>-<slug>/quiz.yaml     тест модуля
  course/<level>/<id>-<slug>/assignment.mdx + _solution.mdx
  placement-test.yaml
  library/prompts/*.yaml · library/templates/*.yaml · library/glossary.yaml
  legal/*.mdx
  _meta/style-guide.md · _meta/lesson-template.mdx
```

- В уроках доступны компоненты: `Callout`, `PromptCard`, `Term`, `InlineQuiz`, `BeforeAfter`/`Before`/`After`, `Steps`, `KeyTakeaways`, `TemplateLink`.
- Прогресс хранится по стабильным `id` (`j01-01`), поэтому переименование и перегенерация уроков его не ломают. Поле `version` урока растёт при перегенерации — у пройденного урока появится метка «Обновлён».
- Типографика (кавычки-«ёлочки», тире, неразрывные пробелы) ставится при сборке.
- **Конвейер ИИ-генерации** (PRD, раздел 10.1): спецификация модуля → `content:generate` (черновики, `draft: true`) → `content:review` (модель другого вендора, отчёты в `content/_reports/`) → `content:validate` → PR. Нужен любой OpenAI-совместимый API (переменные `CONTENT_LLM_*` и `CONTENT_REVIEW_*`). Персональные данные в генерацию не попадают.

## Дизайн и анимации

Интерфейс построен по [скиллам Эмиля Ковальски](https://github.com/emilkowalski/skills) (design engineering, animate, review-animations, mobile-native, apple-design):

- **Кривые** — только собственные: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`, `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. `ease-in` не используется нигде.
- **Длительности**: нажатие 160 мс, подсказки 150 мс, поповеры 200 мс, модалки 250 мс, шторка 500 мс. UI — до 300 мс.
- **Что анимируется**: только `transform`, `opacity` (и `clip-path`); никогда `transition: all` и `scale(0)`. Поповеры раскрываются из триггера (`--transform-origin`), модалки — из центра.
- **Частота решает всё**: навигация и фильтры меняются мгновенно; анимации с «вау-эффектом» — только на редких событиях (первый визит, сдача теста, сертификат).
- **Паттерны**: `scale(0.97)` на нажатие у всех кликабельных элементов (`pressable`), кроссфейд с размытием для смены состояния кнопок, stagger 60 мс в hero, одноразовое появление при скролле, сравнение «до/после» на `clip-path` с прямой записью в style (без ререндера React), удержание для удаления аккаунта (2 с linear, отпускание 200 мс), пружина при перестановке ответов, полоса чтения на scroll-driven animations (вне главного потока).
- **Доступность**: `prefers-reduced-motion` (меньше и мягче, но не ноль), `prefers-reduced-transparency`, `prefers-contrast`; hover только для мыши; поля ввода от 16 px; `100dvh`, safe-area, `theme-color` для светлой и тёмной тем.

## SEO и GEO

- JSON-LD: `Course`, `LearningResource`, `FAQPage`, `BreadcrumbList`, `DefinedTerm(Set)`, `Organization`.
- `sitemap.xml`, `robots.txt` (явно открыт для ИИ-краулеров: YandexBot, YandexAdditional, GPTBot, ClaudeBot, PerplexityBot и др.), [`/llms.txt`](https://llmstxt.org) и `/llms-full.txt` генерируются из контента.
- OG-картинки для страниц и каждого урока (Geist с кириллицей, `assets/fonts`).
- У каждого урока первым идёт короткий ответ на главный вопрос (`description`) — его цитируют поисковики и ассистенты.

## Данные и 152-ФЗ

- Все персональные данные — в Yandex Cloud (ru-central1); сторонние сервисы вне РФ ПДн не получают.
- Отдельное согласие на обработку ПДн при регистрации (чекбокс не отмечен заранее), версия политики сохраняется у пользователя.
- В кабинете: экспорт всех своих данных (JSON) и удаление аккаунта.
- Яндекс Метрика подключается только после согласия в cookie-баннере.
- Страницы сертификатов не индексируются (`noindex`).
- Шаблоны юридических документов лежат в `content/legal/` — перед запуском заполните реквизиты оператора и согласуйте тексты с юристом.

## Деплой в Yandex Cloud

1. **Managed Service for PostgreSQL**: создайте кластер и базу, скачайте корневой сертификат (`DATABASE_CA_CERT`).
2. **Container Registry** + **Serverless Containers**: образ собирается из `Dockerfile` (standalone-сервер Next, порт 8080).
   ```bash
   docker build --build-arg NEXT_PUBLIC_SITE_URL=https://aipm.academy --build-arg GIT_COMMIT_SHA=$(git rev-parse --short HEAD) -t cr.yandex/<registry>/aipm:latest .
   ```
3. Перед выкладкой новой ревизии: `DATABASE_URL=… pnpm db:migrate`.
4. Секреты (`BETTER_AUTH_SECRET`, `DATABASE_URL`, `SMTP_URL`, ключи Яндекс ID / VK ID) — в **Lockbox**, передаются контейнеру как переменные окружения. Полный список — в `.env.example`.
5. Письма — **Yandex Cloud Postbox** по SMTP; статика — через **Cloud CDN**.

## Тесты и CI

- **Vitest**: схемы и связность контента, проверка ответов (правильные ответы не утекают на клиент, упорядочивание никогда не приходит в правильном порядке), тест на уровень, прогресс, типограф, вспомогательные функции.
- **Playwright** на production-сборке с PGlite в памяти: регистрация → знакомство → урок → провал и пересдача теста → кабинет; все тесты модулей → экзамен → сертификат с публичной проверкой; тест на уровень без аккаунта; cookie-баннер; SEO-эндпоинты; отсутствие горизонтального скролла на мобильном.
- GitHub Actions (`.github/workflows/ci.yml`): lint → Prettier → Steiger → типы → контент → юнит → сборка → e2e. Для PR с изменениями контента запускается ИИ-ревью, если заданы секреты `CONTENT_REVIEW_*`.
