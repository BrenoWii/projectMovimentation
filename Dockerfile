FROM node:20-alpine AS development

WORKDIR /usr/src/app
COPY package.json yarn.lock* ./
RUN yarn install
COPY . .
CMD ["yarn", "start:dev"]

FROM node:20-alpine AS production

WORKDIR /usr/src/app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production
COPY . .
RUN yarn build
CMD ["node", "dist/main.js"]
