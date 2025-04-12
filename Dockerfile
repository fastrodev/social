# Build stage
FROM denoland/deno:2.2.8 AS builder
WORKDIR /app
RUN mkdir -p /app/db
COPY . .
RUN deno task build

# Production stage
FROM denoland/deno:2.2.8

EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
RUN deno cache main.ts
RUN deno cache scripts/db-sync.ts
CMD ["/bin/bash", "-c", "deno run scripts/db-sync.ts & deno task start"]