FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV GOOGLE_CLOUD_PROJECT=myposdata
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]