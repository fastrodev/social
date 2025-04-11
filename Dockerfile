# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
RUN deno task build
COPY . .
RUN deno install --entrypoint main.ts
RUN deno cache main.ts

# Production stage
FROM denoland/deno:latest
EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
CMD ["task", "start"]