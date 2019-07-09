FROM node:12.4.0-alpine

WORKDIR /usr/app/cyber_bot

COPY ./build ./build
COPY ./node_modules ./node_modules

EXPOSE 4567

CMD ["node", "build/Main.js"]
