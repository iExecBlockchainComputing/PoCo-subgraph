#!/bin/bash
cd $(dirname $0)
./down.sh
docker compose build --no-cache
docker compose up -d
