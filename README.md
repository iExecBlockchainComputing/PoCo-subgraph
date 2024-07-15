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
npx graph codegen subgraph.test.yaml
npx graph build subgraph.test.yaml
```

deploy the subgraph on local node

```sh
# create once
npx graph create test/poco --node http://127.0.0.1:8020
npx graph deploy test/poco subgraph.test.yaml --node http://127.0.0.1:8020 --ipfs http://127.0.01:5001 --version-label dev
```

test/poco subgraph graphql API enpoints:

- queries: <http://127.0.0.1:8000/subgraphs/name/test/poco>
- subscriptions: <ws://127.0.0.1:8001/subgraphs/name/test/poco>

debugging:

- monitoring: <http://127.0.0.1:8030/>
- prometeus: <http://127.0.0.1:8040/>
- graphnode logs: `docker logs -f test_graphnode_1`

_NB_: other blockchains setups are availables in [docker/README.md](./docker/README.md).


---

## Generating Subgraph and Jenkins Configuration Files

This project includes a bash script, `generate_subgraph.sh`, to automate the creation of subgraph YAML configuration files and Jenkinsfiles based on the network settings in `config.json`.


**Run the script with the network name**:
```bash
bash generate_subgraph_file.sh <network-name>
```

### Configuration

Ensure `config.json` is populated with the required values. Example:

```json
{
    "bellecour": {
        "START_BLOCK": 4543300,
        "ERC1538_ADDRESS": "0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f",
        "IEXECE_INTERFACE_TOKEN_CORE_ADDRESS": "0x3eca1B216A7DF1C7689aEb259fFB83ADFB894E7f",
        "APP_REGISTRY_ADDRESS": "0xB1C52075b276f87b1834919167312221d50c9D16",
        "DATATSET_REGISTRY_ADDRESS": "0x799DAa22654128d0C64d5b79eac9283008158730",
        "WORKERPOOL_REGISTRY_ADDRESS": "0xC76A18c78B7e530A165c5683CB1aB134E21938B4"
    }
}
```

### Files Generated

- **subgraph.<network>.yaml**: Subgraph configuration with placeholders replaced.

#### Example Command

```bash
bash generate_subgraph_file.sh bellecour
```

This command generates `subgraph.bellecour.yaml`.


## Resources

- [thegraph docs](https://thegraph.com/docs/en/)
