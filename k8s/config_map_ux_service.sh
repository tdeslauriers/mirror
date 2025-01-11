#!/bin/bash

# Set the namespace and ConfigMap name
NAMESPACE="world"
CONFIG_MAP_NAME="cm-ux-service"

# get url, port, and client id from 1password
UX_URL=$(op read "op://world_site/mirror_service_container_prod/url")
UX_PORT=$(op read "op://world_site/mirror_service_container_prod/port")
UX_PORT_TLS=$(op read "op://world_site/mirror_service_container_prod/port_tls")
UX_CLIENT_ID=$(op read "op://world_site/mirror_service_container_prod/client_id")

# validate values are not empty
if [[ -z "$UX_URL" || -z "$UX_PORT" || -z "$UX_CLIENT_ID" ]]; then
  echo "Error: failed to get ux config vars from 1Password."
  exit 1
fi

# generate cm yaml and apply
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: $CONFIG_MAP_NAME
  namespace: $NAMESPACE
data:
  ux-url: "$UX_URL:$UX_PORT"
  ux-port: "$UX_PORT"
  ux-port-tls: "$UX_PORT_TLS"
  ux-client-id: "$UX_CLIENT_ID"
EOF

