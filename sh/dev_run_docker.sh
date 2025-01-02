#!/bin/bash

docker build -t mirror:latest .

docker run --rm -p 3000:3000 \
    -e MIRROR_SITE_URL=$(op read "op://world_site/mirror_service_container_dev/url") \
    -e MIRROR_SITE_PORT=$(op read "op://world_site/mirror_service_container_dev/port") \
    -e MIRROR_SITE_PORT_TLS=$(op read "op://world_site/mirror_service_container_dev/port_tls") \
    -e MIRROR_SERVER_CERT=$(op document get "mirror_service_server_dev_cert" --vault world_site) \
    -e MIRROR_SERVER_KEY=$(op document get "mirror_service_server_dev_key" --vault world_site) \
    -e GATEWAY_SERVICE_URL=$(op read "op://world_site/erebor_service_container_dev/url") \
    -e GATEWAY_SERVICE_PORT=$(op read "op://world_site/erebor_service_container_dev/port") \
    mirror:latest