# Use official Node.js LTS Alpine
FROM node:20-alpine

# Working directory
WORKDIR /app

# Install git (optional)
RUN apk add --no-cache git

# Copy package manifests and install deps
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Environment for Nitro
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

# Run dev server (for prod you would use `nuxt build` + `node .output/server/index.mjs`)
CMD ["npm", "run", "dev"]
