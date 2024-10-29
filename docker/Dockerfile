FROM node:22

WORKDIR /iexec-poco-subgraph

COPY package*.json .
COPY schema.graphql .
COPY subgraph.template.yaml .
COPY networks.json .
COPY src src

RUN npm ci

ENTRYPOINT [ "npm", "run", "deploy:all" ]
