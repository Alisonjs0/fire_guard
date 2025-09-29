# Dockerfile para produção no Google Cloud Run
# Multi-stage build otimizado para Next.js

# Estágio de dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instala todas as dependências (incluindo devDependencies para o build)
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Estágio de build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build da aplicação Next.js para produção
RUN npm run build

# Estágio de produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Cria usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Muda para usuário não-root
USER nextjs

# Expõe porta para Cloud Run
EXPOSE 3000

# Configura porta dinâmica do Cloud Run
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Comando de inicialização
CMD ["node", "server.js"]