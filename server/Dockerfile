FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist/ ./dist/
COPY index.js ./
COPY .env ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
