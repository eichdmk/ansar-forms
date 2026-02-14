FROM node:25-alpine

WORKDIR /app

COPY package*.json tsconfig*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]