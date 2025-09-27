# Estágio 1: Dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependências baseado no lockfile disponível
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Estágio 2: Build da Aplicação
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Desabilita telemetria do Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Build do Next.js para produção
# Variáveis de ambiente podem ser definidas aqui se necessário
# ENV NEXT_PUBLIC_API_URL=http://localhost:8080
RUN npm run build

# Estágio 3: Produção (Imagem final)
FROM node:20-slim AS runner
WORKDIR /app

# Não rode como root por segurança
RUN adduser --system --no-create-home nextjs

# Configura a porta de ambiente
ENV PORT 3000

# Copia os arquivos necessários do estágio de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Comando para iniciar o Next.js em produção
CMD ["node", "server.js"]