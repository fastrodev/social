# Build stage
FROM denoland/deno:2.1.12 AS builder
WORKDIR /app
RUN mkdir -p /app/db

# Accept build arguments
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET

# Set as environment variables for the build process
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}

COPY . .
RUN deno task build

# Production stage
FROM denoland/deno:2.1.12

EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
RUN deno cache main.ts
RUN deno cache scripts/db-sync.ts
CMD ["/bin/bash", "-c", "deno run --allow-env --allow-read --allow-write --allow-net scripts/db-sync.ts & deno task start"]