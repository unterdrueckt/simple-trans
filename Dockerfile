# Stage 1: Build Frontend
FROM node:21-alpine AS build

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Stage 2: Final Image (PocketBase + Nginx + Frontend)
FROM alpine:3.18

RUN apk add --no-cache nginx curl gettext

ADD https://github.com/pocketbase/pocketbase/releases/download/v0.24.1/pocketbase_0.24.1_linux_amd64.zip /pocketbase.zip
RUN unzip /pocketbase.zip -d /usr/local/bin && chmod +x /usr/local/bin/pocketbase && rm /pocketbase.zip

COPY --from=build /app/dist /usr/share/nginx/html/spa

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./start-server.sh /usr/bin/start-server.sh
RUN chmod +x /usr/bin/start-server.sh

RUN mkdir -p /pb_data && chown -R nobody:nobody /pb_data

EXPOSE 80

ENTRYPOINT ["/usr/bin/start-server.sh"]
