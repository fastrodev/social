# Build stage
FROM denoland/deno:2.1.11 AS builder
WORKDIR /app
COPY . .
# Install and build
RUN deno task build
RUN deno install --entrypoint main.ts

# Production stage
FROM denoland/deno:2.1.11
EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
CMD ["deno", "task", "start"]