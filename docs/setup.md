# Локальный запуск

## Требования

- Docker Desktop (или Docker Engine + Compose v2)

## Запуск

```bash
git pull
docker compose up --build
```

Откройте http://localhost:5173

Изменения в `src/` подхватываются автоматически (HMR).

## Полезные команды

| Задача | Команда |
|---|---|
| Остановить | `Ctrl+C` или `docker compose down` |
| Запустить в фоне | `docker compose up -d --build` |
| Логи (в фоне) | `docker compose logs -f` |
| Проверка типов | `docker compose exec app npm run typecheck` |
| Установить пакет | `docker compose exec app npm install <пакет>` |
| Сбросить node_modules | `docker compose down -v` |

## Заметки

- `node_modules` хранятся в Docker volume, на хосте их нет — это нормально.
  IDE может не видеть типы пакетов; при необходимости выполните `npm install` на хосте
  (папка в `.gitignore`).
- Новые пакеты ставьте через `docker compose exec app npm install ...`,
  чтобы обновился `package-lock.json`. Его нужно коммитить.
- Контейнер работает под пользователем `node` (UID 1000). Если ваш `id -u` не 1000,
  файлы, созданные контейнером, будут принадлежать другому пользователю.
- Папка `node_modules` на хосте — пустая точка монтирования Docker volume.
