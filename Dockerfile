# Build stage
FROM denoland/deno:2.2.8 AS builder
WORKDIR /app
RUN mkdir -p /app/db
COPY . .
RUN deno task build

# Production stage
FROM denoland/deno:2.2.8

# Install Google Cloud SDK
RUN apt-get update && apt-get install -y curl gnupg
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] http://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
RUN apt-get update && apt-get install -y google-cloud-sdk

EXPOSE 8080
WORKDIR /app
COPY --from=builder /app .
RUN deno cache main.ts

# Add sync script
COPY scripts/db-sync.sh /app/scripts/
RUN chmod +x /app/scripts/db-sync.sh

CMD ["/bin/bash", "-c", "/app/scripts/db-sync.sh & deno task start"]