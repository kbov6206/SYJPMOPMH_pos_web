# Use Node.js 18 base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy server files
COPY server/ .

# Expose port 8080
EXPOSE 8080

# Start the application
CMD ["node", "index.js"]