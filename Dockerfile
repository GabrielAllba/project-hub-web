# Stage 1: Build Vite React App
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the build using `serve`
FROM node:20-alpine

# Install `serve` globally
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/dist .

# Expose the port used by `serve`
EXPOSE 5173

# Start the app
CMD ["serve", "-s", ".", "-l", "5173"]