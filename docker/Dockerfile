FROM node:22
WORKDIR /iexec-poco-subgraph
RUN apt-get update && apt-get install -y git
COPY package*.json .
RUN npm ci
COPY schema.graphql .
COPY subgraph.template.yaml .
COPY networks.json .
COPY src src
ENTRYPOINT [ "npm", "run", "deploy:all" ]
