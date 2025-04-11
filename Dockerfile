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
RUN deno info
RUN echo "Checking origin storage location:" && ls -la /deno-dir/ || true
RUN deno cache main.ts
CMD ["deno", "task", "start"]