# Dockerfile: the organism as one sandboxed service (his P13: "It should live 24/7 on the cloud
# remember Its literally a sandboxed ARTIFICIAL SUPERINTELLIGENCE"). docs/CLOUD.md is the manual,
# compose.yaml carries the caps, bench/cloud.mjs measures them.
#
# Zero dependencies: nothing is installed. The tree is copied (minus what .dockerignore names:
# state/, organism/scale-*, every .env and key file) and node runs it as the unprivileged `node`
# user. The tree is root-owned, so the runtime user cannot write it; compose.yaml also mounts the
# root filesystem read-only. The one writable place is /state, a volume.
FROM node:24-slim

ENV NODE_ENV=production \
    BRAIN_STATE_DIR=/state \
    BRAIN_IMAGE_SEED=/app/.image \
    BRAIN_NAME=cloud \
    BRAIN_MAJORS=12 \
    BRAIN_LEDGER=summary \
    HEALTH_HOST=0.0.0.0 \
    HEALTH_PORT=8080

WORKDIR /app
COPY . /app

# bench/ladder.mjs writes its dated files and its series next to itself. Those two paths become
# links into the volume, and the image's copies move to /app/.image, which bin/serve.mjs copies
# into /state/verdicts on first boot. Nothing else under /app is written at run time.
RUN mkdir -p /state /app/.image /app/bench/verdicts \
 && if [ -d bench/verdicts/ladder ]; then mv bench/verdicts/ladder /app/.image/ladder; fi \
 && if [ -f bench/verdicts/ladder.json ]; then mv bench/verdicts/ladder.json /app/.image/ladder.json; fi \
 && ln -s /state/verdicts/ladder bench/verdicts/ladder \
 && ln -s /state/verdicts/ladder.json bench/verdicts/ladder.json \
 && chown node:node /state

USER node
VOLUME ["/state"]
EXPOSE 8080

HEALTHCHECK --interval=60s --timeout=5s --start-period=90s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.HEALTH_PORT||8080)+'/health').then(r=>r.json()).then(j=>process.exit(j.ok?0:1),()=>process.exit(1))"]

CMD ["node", "--max-old-space-size=96", "bin/serve.mjs"]
