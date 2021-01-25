FROM node:15-buster

WORKDIR /tableaunoir/

# Copy source code.
COPY . .

# Update npm.
RUN npm install -g npm@latest

# Install tableaunoir dependencies.
RUN npm install --only=dev
RUN npm install ws small-uuid 

# Include node modules binaries in PATH. 
ENV PATH="/node_modules/.bin:${PATH}"

# Build everything to dist.
RUN npm run build

USER node
EXPOSE 8080
CMD node /tableaunoir/server/main.js