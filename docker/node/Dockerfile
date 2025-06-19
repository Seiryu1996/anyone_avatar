FROM node:20-alpine

WORKDIR /var/www

# 必要なツールをインストール
RUN apk add --no-cache python3 make g++

# npmを最新版に更新
RUN npm install -g npm@latest

# nodeユーザーのUIDを1000に変更（Linuxのデフォルトユーザーと同じ）
RUN deluser node && \
    addgroup -g 1000 node && \
    adduser -u 1000 -G node -s /bin/sh -D node

# ディレクトリの所有者を設定
RUN chown -R node:node /var/www

USER node
