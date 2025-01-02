#!/bin/bash

# certs
export MIRROR_SERVER_CERT=$(op document get "mirror_service_server_dev_cert" --vault world_site)
export MIRROR_SERVER_KEY=$(op document get "mirror_service_server_dev_key" --vault world_site)

# gateway config
export GATEWAY_SERVICE_URL=$(op read "op://world_site/erebor_service_container_dev/url")
export GATEWAY_SERVICE_PORT=$(op read "op://world_site/erebor_service_container_dev/port")


