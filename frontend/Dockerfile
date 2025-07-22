# Use official Node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy only dependency files first (for better caching)
COPY frontend/package*.json ./

# Clean up lock and modules (if needed due to native deps issue)
RUN rm -rf node_modules package-lock.json && npm install

# Copy the rest of the frontend source code
COPY frontend .

# Expose Vite's default dev port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev"]
