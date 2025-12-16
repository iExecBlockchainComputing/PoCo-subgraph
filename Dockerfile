# iexec-poco-subgraph deployer

FROM node:20

WORKDIR /iexec-poco-subgraph

COPY package*.json .
COPY schema.graphql .
COPY subgraph.yaml .
COPY networks.json .
COPY update-networks.js .
COPY src ./src

RUN npm ci

ENTRYPOINT [ "npm", "run", "all" ]
