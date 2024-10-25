import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import assert from 'assert';
import { DockerComposeEnvironment, Wait } from 'testcontainers';

const APIURL = 'http://localhost:8000/subgraphs/name/test/poco';

async function main() {
    console.log('Running integration tests..');
    const environment = new DockerComposeEnvironment(
        'docker/test/',
        'docker-compose.yml',
    ).withWaitStrategy(
        'poco-subgraph-deployer-1',
        Wait.forLogMessage('Deployed to http://graphnode:8000/subgraphs/name/test/poco/graphql'),
    );
    await environment.up();
    // Wait for graphnode to ingest a few blocks before querying it
    const secondsToWait = 5;
    console.log(`Waiting ${secondsToWait}s..`);
    await new Promise((resolve) => {
        return setTimeout(resolve, secondsToWait * 1000);
    });
    const client = new ApolloClient({
        uri: APIURL,
        cache: new InMemoryCache(),
    });
    const result = await client.query({
        query: gql(`
                query {
                    protocol(id: "iExec") {
                        tvl
                        id
                    }
                }
            `),
    });
    const protocol = result.data.protocol;
    assert.equal(protocol.id, 'iExec');
    assert.equal(protocol.tvl, '0.02025');
    console.log('Completed integration tests ✔️');
}

main();
