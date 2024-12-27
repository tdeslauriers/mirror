#!/bin/bash

docker build -t mirror:latest .

docker run -p 3000:3000 \
    -e GATEWAY_SERVICE_URL=$(op read "op://world_site/erebor_service_container_dev/url") \
    -e GATEWAY_SERVICE_PORT=$(op read "op://world_site/erebor_service_container_dev/port") \
    mirror:latest