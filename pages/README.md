# Пустая папка — так и должно быть

Эта папка нужна, чтобы Next.js не принял слой `src/pages` (Feature-Sliced Design) за Pages Router.
Маршрутизация живёт в корневой папке `app/`, а сами страницы — в `src/pages/*`.

Подробнее: https://feature-sliced.design/docs/guides/tech/with-nextjs
