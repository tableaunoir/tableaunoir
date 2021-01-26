FROM node:15-buster

WORKDIR /tableaunoir/

# Copy source code.
COPY . .

# Put recognizable variable names
# in config.json for replacement
# in tableaunoir.js after build.
RUN echo "{"\
    "\"server\": {"\
        "\"websocket\": \"EXTERNAL_WS_URL\","\
        "\"frontend\": \"EXTERNAL_HTTP_URL\""\
    "}"\
"}"\
> /tableaunoir/src/config.json


# Copy entrypoint at root for easier accesss.
COPY docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

# Update npm.
RUN npm install -g npm@latest

# Install tableaunoir dependencies.
RUN npm install --only=dev
RUN npm install ws small-uuid 

# Include node modules binaries in PATH. 
ENV PATH="/node_modules/.bin:${PATH}"

# Build everything to dist.
RUN npm run build

EXPOSE 8080
ENTRYPOINT [ "/entrypoint.sh" ]