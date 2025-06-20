FROM node:18

WORKDIR /app

COPY server/package.json .
RUN npm install

COPY server/ .

# Copy service account key
COPY server/credentials.json .

ENV PORT=8080
ENV GOOGLE_CLOUD_PROJECT=myposdata
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/credentials.json

EXPOSE 8080

CMD ["npm", "start"]