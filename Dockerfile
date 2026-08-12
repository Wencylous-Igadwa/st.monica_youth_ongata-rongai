FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/

RUN npm ci --ignore-scripts
RUN cd server && npm ci

COPY vite.config.js vite-plugin-api.mjs ./
COPY *.html ./
COPY src/ ./src/
COPY public/ ./public/
COPY img/ ./img/
COPY sports/ ./sports/
COPY server/ ./server/

RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 3001

COPY server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
