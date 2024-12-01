# Base Stage
FROM node:lts-alpine AS base

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent && mv node_modules ../

COPY . .


# Development Stage
FROM base AS dev

EXPOSE 3000

RUN chown -R node /usr/src/app
USER node
CMD ["npm", "run", "dev"]


# Build Stage
FROM base AS build

RUN npm run build


# Prod Stage
FROM node:lts-alpine AS prod

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=build ["/usr/src/app/package.json", "/usr/src/app/package-lock.json*", "/usr/src/app/npm-shrinkwrap.json*", "./"]
COPY --from=build ["/usr/src/app/dist", "./dist"]

RUN npm ci --only=production

EXPOSE 3000

RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
