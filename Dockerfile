FROM node:20-alpine AS build
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./
COPY server/package*.json ./server/

# Install root deps (ignore scripts to skip postinstall)
RUN npm ci --ignore-scripts

# Install server deps with lockfile
RUN cd server && npm ci

# Copy source code needed for Vite build (server/ needed because vite-plugin-api.mjs imports it)
COPY vite.config.js vite-plugin-api.mjs ./
COPY *.html ./
COPY src/ ./src/
COPY public/ ./public/
COPY img/ ./img/
COPY sports/ ./sports/
COPY server/ ./server/

# Build frontend
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Copy only runtime assets
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server

EXPOSE 3001

COPY server/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
