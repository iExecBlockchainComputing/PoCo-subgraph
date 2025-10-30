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

#### CI/CD deployment (recommended)

The recommended approach to deploy the subgraph on The Graph network is to use
the dedicated Github Actions workflow:

1. Set up the Github environment for the target network (e.g. `arbitrum`) with
the required environnment variables and secrets:
    - `vars.SUBGRAPH_SLUG`
    - `secrets.SUBGRAPH_DEPLOY_KEY`
    - `vars.SUBGRAPH_NETWORK_NAME`
    - `VERSION_LABEL` is a workfow input

2. Trigger the deployment Action on Github and specify the `version_label` input.

#### Manual deployment

To deploy this subgraph on Thegraph network manually:

1. Set up environment variables in `.env` file:

   ```bash
   SUBGRAPH_SLUG=<subgraph-slug>
   SUBGRAPH_DEPLOY_KEY=<deploy-key>
   SUBGRAPH_NETWORK_NAME=<network-name>
   VERSION_LABEL=<version-label>
   ```

2. Deploy using the npm script:

   ```bash
   npm run deploy-studio
   ```

### Self-hosted subgraph deployment

The subgraph is deployed via a generated Docker image.

#### Build image

```sh
docker build -f docker/Dockerfile . -t poco-subgraph-deployer
```

#### Usage

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

#### Manual Deployment with Custom Values

To deploy the subgraph manually using the deploy script, follow these steps:

1. Set up environment variables in the `.env` file:

   ```bash
   NETWORK_NAME=<network-name>
   DEPLOY_ENV=<deploy-environment>
   IPFS_URL=<ipfs-url>
   GRAPHNODE_URL=<graphnode-url>
   VERSION_LABEL=<version-label>
   ```

   Example:

   ```bash
   NETWORK_NAME=bellecour
   DEPLOY_ENV=staging
   IPFS_URL=http://localhost:5001
   GRAPHNODE_URL=http://localhost:8020
   VERSION_LABEL=1.0.0
   ```

   **DEPLOY_ENV Possible Values:**
   - `''`: For production deployment.
   - `'tmp'`: For temporary indexing and avoiding downtime during production deployment.
   - `'staging'`: For staging environment deployment.

2. Run the deploy script:

   ```bash
   npm run deploy
   ```

   This will deploy the subgraph using the specified values, including the `DEPLOY_ENV` variable for environment-specific configurations.

#### Github Actions pipeline deployment

The subgraph can be deployed using Github Actions (recommended). The dedicated job can be triggered with the desired configuration (environment, version, ...).

### Deployment configuration

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

## Changelog

Changes to this project are tracked in [CHANGELOG.md](./CHANGELOG.md)

## Resources

- [The Graph docs](https://thegraph.com/docs/en/)

## TODO

- Rename the `Core` key to `Diamond` in `networks.json` and update all references accordingly.
- Remove support and configuration entries for the `bellecour` network from `networks.json`, GHA pipeline, and related documentation.
