FROM node:14-alpine as base

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .
RUN yarn build

FROM node:14-alpine

WORKDIR /app

ENV NODE_ENV production

COPY package.json yarn.lock ./
RUN yarn install

COPY --from=base /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=base /app/prisma /app/prisma
COPY --from=base /app/dist /app/dist

EXPOSE 4000

CMD ["node", "dist/server"]
