FROM node:22-alpine
RUN apk --no-cache add jq bash
WORKDIR /iexec-poco-subgraph
COPY package*.json .
RUN npm ci
COPY schema.graphql .
COPY subgraph.template.yaml .
COPY networks.json .
COPY config.json .
COPY generate_subgraph_file.sh .
COPY src src
ENTRYPOINT [ "npm", "run", "deploy:all" ]
