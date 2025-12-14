# --- STAGE 1: Build ---
# Use an official Node.js image as the builder
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# 1. Copy package.json and package-lock.json first
COPY package.json package-lock.json ./

# 2. Install dependencies
RUN npm install

# 3. Copy the rest of your source code
COPY . .

# 4. Build the production static files
RUN npm run build

# --- STAGE 2: Run ---
# Use a lightweight Nginx image for ARM64
# nginx:alpine is multi-arch, so it will work on your Pi
FROM nginx:1.27.0-alpine-slim

# 1. Remove the default Nginx welcome page
RUN rm /usr/share/nginx/html/index.html

# 2. Copy the built static files from the 'build' stage
# The 'npm run build' command creates a 'dist' folder
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy our custom nginx.conf to override the default
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Support running as non-root
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Switch to non-root user
USER nginx

# Expose port 8085 (standard HTTP)
EXPOSE 8085

# 3. Nginx starts automatically
CMD ["nginx", "-g", "daemon off;"]