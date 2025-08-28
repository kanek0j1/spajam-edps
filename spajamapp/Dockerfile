FROM node:20-bullseye

RUN apt-get update && apt-get install -y \
  git python3 build-essential dumb-init \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable \
  && npm i -g expo@latest eas-cli@latest

ENV EXPO_NO_TELEMETRY=1 \
    EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0 \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true

EXPOSE 19000 19001 19002 19006 8081

CMD ["dumb-init","bash","-lc","[ -f package.json ] && npm install || true; npm run start --workspaces=false || true"]
