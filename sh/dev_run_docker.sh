#!/bin/bash

docker build -t mirror:latest .

docker run -p 3000:3000 \
    -e MIRROR_CLIENT_CERT=$(op document get "mirror_service_server_dev_cert" --vault world_site | base64 -w 0) \
    -e MIRROR_CLIENT_KEY=$(op document get "mirror_service_server_dev_key" --vault world_site | base64 -w 0) \
    -e GATEWAY_SERVICE_URL=$(op read "op://world_site/erebor_service_container_dev/url") \
    -e GATEWAY_SERVICE_PORT=$(op read "op://world_site/erebor_service_container_dev/port") \
    mirror:latest