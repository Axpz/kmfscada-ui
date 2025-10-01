FROM node:22-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm@10.4.1

# 利用缓存，只复制依赖相关文件 再复制其他源码，避免影响依赖缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . ./
COPY .env.local .env

RUN pnpm build


# runner stage
FROM node:22-alpine AS runner

WORKDIR /app
RUN apk add --no-cache dumb-init
ENV TZ=Asia/Shanghai
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --ingroup nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

RUN chown -R nextjs:nodejs /app
USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]