FROM node:18-bullseye

WORKDIR /app

COPY server/package.json .
RUN npm install

COPY server/ .

ENV PORT=8080
ENV GOOGLE_CLOUD_PROJECT=myposdata

EXPOSE 8080

CMD ["npm", "start"]