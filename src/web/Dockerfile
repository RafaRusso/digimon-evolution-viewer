# Dockerfile para Digimon Evolution Frontend
FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Stage para dependências
FROM base AS deps
COPY package*.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage para desenvolvimento
FROM base AS dev
COPY package*.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install
COPY . .
EXPOSE 5173
USER nodejs
CMD ["pnpm", "run", "dev", "--host"]

# Stage para build
FROM base AS build
COPY package*.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .

# Build da aplicação
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm run build

# Stage para produção com Nginx
FROM nginx:alpine AS production

# Copiar configuração customizada do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração do Nginx para SPA
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Handle client-side routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    add_header Referrer-Policy "strict-origin-when-cross-origin" always; \
}' > /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]
