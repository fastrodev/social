# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
RUN deno install --entrypoint main.ts

# Production stage
FROM denoland/deno:latest
EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
CMD ["task", "start"]