# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
RUN deno task build

# Production stage
FROM denoland/deno:latest
EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
CMD ["deno", "task", "start"]