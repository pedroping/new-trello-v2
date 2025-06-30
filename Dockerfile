FROM node:20-alpine as build
WORKDIR /app/src

COPY package*.json ./
RUN npm i

COPY . ./
RUN npm run build

FROM node:20-alpine
WORKDIR /usr/app

COPY --from=build /app/src/dist/new-trello-v2 /usr/app/dist/new-trello-v2

EXPOSE 80

CMD ["node", "dist/new-trello-v2/server/server.mjs"]

