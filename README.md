# iExec PoCo v5 - subgraph

A subgraph to explore the PoCo smarcontracts

[CHANGELOG](./CHANGELOG.md)

## local dev

run local services:

- blockchain with iExec PoCo deployed
- graph node (with ipfs + DB)

```sh
docker-compose -f docker/test/docker-compose.yml up -d
```

install project deps

```sh
npm ci
```

generate code

```sh
./node_modules/@graphprotocol/graph-cli/bin/graph codegen subgraph.test.yaml
./node_modules/@graphprotocol/graph-cli/bin/graph build subgraph.test.yaml
```

deploy the subgraph on local node

```sh
# create once
./node_modules/@graphprotocol/graph-cli/bin/graph create test/poco --node http://127.0.0.1:8020
./node_modules/@graphprotocol/graph-cli/bin/graph deploy test/poco subgraph.test.yaml --node http://127.0.0.1:8020 --ipfs http://127.0.01:5001 --version-label dev
```

test/poco subgraph graphql API enpoints:

- queries: <http://127.0.0.1:8000/subgraphs/name/test/poco>
- subscriptions: <ws://127.0.0.1:8001/subgraphs/name/test/poco>

debugging:

- monitoring: <http://127.0.0.1:8030/>
- prometeus: <http://127.0.0.1:8040/>
- graphnode logs: `docker logs -f test_graphnode_1`

_NB_: other blockchains setups are availables in [docker/README.md](./docker/README.md).

## Resources

- [thegraph docs](https://thegraph.com/docs/en/)
