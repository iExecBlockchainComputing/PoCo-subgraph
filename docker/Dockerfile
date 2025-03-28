FROM node:22
WORKDIR /iexec-poco-subgraph
COPY package*.json .
RUN npm ci
COPY schema.graphql .
COPY subgraph.yaml .
COPY networks.json .
COPY src src
ENTRYPOINT [ "npm", "run", "deploy:all" ]
