Цялата последователност (след рестарт на компютъра)

Винаги:

open -a Docker

изчакай Docker да тръгне

cd ~/ivt.com.de
docker compose -f docker/docker-compose.directus.yml up -d

изчистване на Next cache и старт:
rm -rf .next
npm run dev

само старт
npm run dev