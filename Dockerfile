# Stage 1: Build the application
FROM node:22-alpine AS builder

# set working directory
WORKDIR /app

# install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Serve the application
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Set environment variables (can be overridden by `docker run -e`)
ENV NODE_ENV=production

# Copy the build output and node_modules from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose the port your application will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]