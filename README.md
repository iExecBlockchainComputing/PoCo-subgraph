# iExec PoCo v5 - subgraph

A subgraph to explore the PoCo smarcontracts

[CHANGELOG](./CHANGELOG.md)

# Setup coverage⁠

> In order for Matchstick to check which handlers are being run, those handlers need to be exported from the test file.

Check how to export handlers with [Matchstick - Test Coverage documentation](https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#test-coverage).

> [!NOTE]
> Since Matchstick code coverage is in very early stages, Matchstick cannot check for branch coverage, but rely on the assertion that a given handler has been called.


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

Here's the revised "Generating Subgraph and Jenkins Configuration Files" section for your README:


## Deployment Configuration

### Jenkins Pipeline Deployment

The project uses a Jenkins pipeline for automated deployment of the subgraph. The deployment can be triggered through Jenkins with interactive parameter selection.

#### Available Parameters

- **Network**: Choose the target blockchain network
- **Environment**: Select deployment environment
  - `staging`: Deploy to staging environment
  - `tmp`: Deploy to temporary environment
  - `prod`: Deploy to production environment
- **Version Label**: Specify the version of the deployment (e.g., `v1.0.0`)
- **Subgraph Name**: Name of the subgraph (default: `poco-v5`)

#### Environment-specific Configurations

Each environment has specific host configurations:

### Adding New Networks

To add support for a new network, update the `networks.json` file with the network configuration:

```json
{
    "network-name": {
        "ERC1538": {
            "address": "0x...",
            "startBlock": 1234567
        },
        "Core": {
            "address": "0x...",
            "startBlock": 1234567
        },
        "AppRegistry": {
            "address": "0x...",
            "startBlock": 1234567
        },
        "DatasetRegistry": {
            "address": "0x...",
            "startBlock": 1234567
        },
        "WorkerpoolRegistry": {
            "address": "0x...",
            "startBlock": 1234567
        }
    }
}
```

Also, update the Jenkins pipeline choices to include the new network:
```groovy
choice(
    name: 'networkName',
    choices: ['bellecour', 'new-network'],
    description: 'Select the target network'
)
```

The deployment process will automatically generate the appropriate subgraph configuration using the network-specific addresses and start blocks from `networks.json`.

## Resources

- [thegraph docs](https://thegraph.com/docs/en/)
