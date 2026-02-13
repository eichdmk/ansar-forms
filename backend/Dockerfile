FROM node:25-alpine

WORKDIR /app

COPY pakgage*.json tsconfig*.json ./

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]