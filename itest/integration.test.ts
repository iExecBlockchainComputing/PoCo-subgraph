import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { equal } from 'assert';
import { DockerComposeEnvironment, Wait } from 'testcontainers';

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;
const APIURL = 'http://localhost:8000/subgraphs/name/test/poco';
const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
});

describe('Integration tests', () => {
    /**
     * Services are started only once before running all tests to get a decent test
     * suite duration with multiple tests. Please switch to `beforeEach` if necessary.
     * Shutdown of services is handled by `testcontainers` framework.
     */
    before(async () => {
        console.log('Starting services..');
        const environment = new DockerComposeEnvironment('docker/test/', 'docker-compose.yml')
            .withStartupTimeout(3 * MINUTES)
            .withWaitStrategy(
                'poco-subgraph-deployer-1',
                Wait.forLogMessage(
                    'Deployed to http://graphnode:8000/subgraphs/name/test/poco/graphql',
                ),
            );
        await environment.up();
        const secondsToWait = 10;
        console.log(
            `Waiting ${secondsToWait}s for graphnode to ingest a few blocks before querying it..`,
        );
        await new Promise((resolve) => {
            return setTimeout(resolve, secondsToWait * SECONDS);
        });
    });

    it('should get protocol', async () => {
        const result = await client.query({
            query: gql(`
                    query {
                        protocol(id: "iExec") {
                            id
                            tvl
                        }
                    }
                `),
        });
        const protocol = result.data.protocol;
        equal(protocol.id, 'iExec');
        equal(protocol.tvl, '0.02025');
    });
});
