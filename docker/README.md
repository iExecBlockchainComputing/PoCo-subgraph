# Containerized graphnodes

## Prerequisites:

- install **graph** cli: `npm i -g @graphprotocol/graph-cli` or alias the local install
- blockchain specific:
  - for **viviani graphnodes**, a `viviani-archive-node` docker service must expose `8545` on network `viviani_blockchain`
  - for **bellecour graphnodes**, a `bellecour-archive-node` docker service must expose `8545` on network `bellecour_blockchain`

## Usage

```sh
# choose target blockchain directory (ex: test)
cd test/

# start the graphnode with the dependencies
docker-compose up -d

# deploy the subgraphs on the graphnode
./deploy-subgraph.sh
```
