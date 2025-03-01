# Use official Node.js image
FROM node:18-alpine  

# Set working directory
WORKDIR /app  

# Copy package.json and package-lock.json first (better for caching)
COPY package*.json ./  

# Install dependencies
RUN npm install  

# Copy the rest of the app
COPY . .  

# Build the Next.js app
RUN npm run build  

# Expose port 3000
EXPOSE 3000  

# Start the app in production mode
CMD ["npm", "run", "start"]
