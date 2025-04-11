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
RUN echo "Origin storage contents:" && ls -la /deno-dir/location_data || echo "Directory doesn't exist or is empty"
RUN deno install --entrypoint main.ts
RUN deno cache main.ts
CMD ["task", "start"]