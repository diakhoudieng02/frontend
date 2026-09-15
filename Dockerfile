# Étape 1 : Build (Compilation du code)
FROM node:18-alpine AS build-stage

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source et build
COPY . .
RUN npm run build

# Étape 2 : Production (Serveur ultra-léger)
FROM nginx:stable-alpine

# Copie des fichiers compilés vers Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port 80 (interne au réseau Docker)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]