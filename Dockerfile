# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
COPY . .
RUN deno task build
RUN deno install --entrypoint main.ts
RUN deno cache main.ts
RUN deno info

# Production stage
FROM denoland/deno:latest
EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
CMD ["task", "start"]