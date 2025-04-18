# Build stage
FROM denoland/deno:2.2.10 AS builder
WORKDIR /app
RUN mkdir -p /app/db
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG REDIRECT_URI
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV REDIRECT_URI=${REDIRECT_URI}
COPY . .
RUN deno task build

# Production stage
FROM denoland/deno:2.2.10
EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
RUN deno cache main.ts
RUN deno cache scripts/db-sync.ts
CMD ["/bin/bash", "-c", "deno run --allow-env --allow-read --allow-write --allow-net scripts/db-sync.ts & deno task start"]