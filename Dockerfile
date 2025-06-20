FROM node:22
WORKDIR /app
COPY server/package.json .
RUN npm install
COPY server .
EXPOSE 8080
CMD ["npm", "start"]
