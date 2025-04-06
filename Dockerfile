FROM node:20

WORKDIR /app

# Install dependencies for libheif support
RUN apt-get update && apt-get install -y libheif-dev

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install sharp && npm rebuild sharp
RUN npm install

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 3000

# Use the optimized entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
