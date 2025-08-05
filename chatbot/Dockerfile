# Stage 1: Build
FROM node:22 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Stage 2: Runtime
FROM node:22-slim

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app /app

# Copy production-only env (user will mount theirs later in real deployments)

# Install Prisma CLI for runtime operations like `migrate deploy`
RUN npm install -g prisma

# Expose port
EXPOSE 3000

# Entrypoint to run migration then start app
ENTRYPOINT ["./entrypoint.sh"]
