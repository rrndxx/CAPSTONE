# Use Node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy dependency files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY backend .

# Build TypeScript
RUN npm run build

# Expose the port
EXPOSE 4000

# Start the app
CMD ["npm", "run", "dev"]
