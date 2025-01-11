#!/bin/bash

# server config
export MIRROR_SITE_URL=$(op read "op://world_site/mirror_service_app_local/url")
export MIRROR_SITE_PORT=$(op read "op://world_site/mirror_service_app_local/port")
export MIRROR_SITE_PORT_TLS=$(op read "op://world_site/mirror_service_app_local/port_tls")

# certs
export MIRROR_SERVER_CERT=$(op document get "mirror_service_server_dev_cert" --vault world_site)
export MIRROR_SERVER_KEY=$(op document get "mirror_service_server_dev_key" --vault world_site)

# gateway config
export GATEWAY_SERVICE_URL=$(op read "op://world_site/erebor_service_container_dev/url"):$(op read "op://world_site/erebor_service_container_dev/port")


