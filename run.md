```
gcloud auth configure-docker us-central1-docker.pkg.dev
```

```
docker compose -f docker-compose.yml build
```

```
docker tag deno-image us-central1-docker.pkg.dev/replix-394315/deno-repository/deno-cloudrun-image
```

```
docker push us-central1-docker.pkg.dev/replix-394315/deno-repository/deno-cloudrun-image
```
