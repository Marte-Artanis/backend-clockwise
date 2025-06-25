FROM node:18-alpine AS builder

WORKDIR /app

# Instala o OpenSSL e suas dependências
RUN apk update && apk upgrade && \
    apk add --no-cache openssl openssl-dev

COPY package*.json ./

# Instala todas as dependências (incluindo as de desenvolvimento)
RUN npm ci

COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Executa o build
RUN npm run build

# Imagem final
FROM node:18-alpine

WORKDIR /app

# Instala o OpenSSL na imagem final também
RUN apk update && apk upgrade && \
    apk add --no-cache openssl

COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm ci --only=production

# Copia os arquivos de build e o cliente Prisma da etapa anterior
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3333

CMD ["npm", "start"] 