# iExec PoCo Subgraph

A subgraph to index the PoCo Smart Contracts.


## Local development

Run local services:

- blockchain with iExec PoCo deployed
- graph node (with ipfs + DB)

```sh
docker-compose -f docker/test/docker-compose.yml up -d
```

Install project dependencies

```sh
npm ci
```

Build the project and generate the necessary files:

```sh
npm run build
```

Deploy the subgraph on local node

```sh
npm run start-test-stack
```

Run integration tests

```sh
npm run itest
```

The subgraph `test/poco` graphql API is accessible at:
- queries: <http://127.0.0.1:8000/subgraphs/name/test/poco>


### Coverage setup

> In order for Matchstick to check which handlers are being run, those handlers need to be exported from the test file.

Check how to export handlers with [Matchstick - Test Coverage documentation](https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#test-coverage).

> [!NOTE]
> Since Matchstick code coverage is in very early stages, Matchstick cannot check for branch coverage, but rely on the assertion that a given handler has been called.

## Deployment Options

### Thegraph network

To deploy this subgraph on Thegraph network:

1. Set up your environment variables in `.env` file:

   ```bash
   SUBGRAPH_SLUG=your-subgraph-slug
   SUBGRAPH_DEPLOY_KEY=your-deploy-key
   SUBGRAPH_NETWORK_NAME=your-network-name
   VERSION_LABEL=your-version-label
   ```

2. Deploy using the npm script:

   ```bash
   npm run deploy-studio
   ```

### Self-Hosted Subgraph Deployment Process


## Docker subgraph deployer

The subgraph is deploy via a generated Docker image.

### Build image

```sh
docker build -f docker/Dockerfile . -t poco-subgraph-deployer
```

### Usage

env:

- `NETWORK_NAME` (optional): custom graphnode network name (default bellecour)
- `IPFS_URL`: IPFS admin api url
- `GRAPHNODE_URL`: graphnode admin api url

```sh
docker run --rm \
  -e NETWORK_NAME=fork-test \
  -e IPFS_URL="http://ipfs:5001" \
  -e GRAPHNODE_URL="http://graphnode:8020" \
  poco-subgraph-deployer
```

## Deployment configuration

### Jenkins pipeline deployment

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

## Changelog

Changes to this project are tracked in [CHANGELOG.md](./CHANGELOG.md)

## Resources

- [The Graph docs](https://thegraph.com/docs/en/)

## TODO

- Rename the `Core` key to `Diamond` in `networks.json` and update all references accordingly.
- Remove support and configuration entries for the `bellecour` network from `networks.json`, GHA pipeline, and related documentation.
