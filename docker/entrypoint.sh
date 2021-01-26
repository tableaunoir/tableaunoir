#!/usr/bin/env bash

echo "EXTERNAL_WS_URL=$EXTERNAL_WS_URL"
echo "EXTERNAL_HTTP_URL=$EXTERNAL_HTTP_URL"

sed -i "s|EXTERNAL_WS_URL|$EXTERNAL_WS_URL|g" /tableaunoir/src/config.json
sed -i "s|EXTERNAL_HTTP_URL|$EXTERNAL_HTTP_URL|g" /tableaunoir/src/config.json
sed -i "s|EXTERNAL_WS_URL|$EXTERNAL_WS_URL|g" /tableaunoir/dist/tableaunoir.js
sed -i "s|EXTERNAL_HTTP_URL|$EXTERNAL_HTTP_URL|g" /tableaunoir/dist/tableaunoir.js

chmod 0644 /tableaunoir/src/config.json

node /tableaunoir/server/main.js