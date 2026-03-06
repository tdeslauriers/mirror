#!/bin/bash

# variables
NAMESPACE="world"
SECRET_NAME="secret-node-extra-ca"

# get certificate and key from 1Password
CA_CERT=$(op document get "service_ca_prod_cert" --vault world_site)

# check if values are retrieved successfully
if [[ -z "$CA_CERT" ]]; then
  echo "Error: failed to get server ca certificate from 1Password."
  exit 1
fi

# create the TLS secret --> note: using generic secret type because injecting as base64 encoded string to app
kubectl create secret generic $SECRET_NAME \
  --namespace $NAMESPACE \
  --from-literal=server-ca-cert="$CA_CERT" \
  --dry-run=client -o yaml | kubectl apply -f -
