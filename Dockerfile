# syntax=docker/dockerfile:1

# --- Build Expo web bundle ---
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first for better layer caching
COPY mobile/package.json mobile/package-lock.json ./mobile/
RUN cd mobile && npm ci

# Copy the rest of the app
COPY mobile ./mobile

# Export a static web build
# (Expo Router + web)
RUN cd mobile && npx expo export --platform web

# --- Serve static files ---
FROM nginx:alpine AS runner

# Expo export outputs to `dist/` by default
COPY --from=build /app/mobile/dist /usr/share/nginx/html

EXPOSE 80

# default nginx CMD
