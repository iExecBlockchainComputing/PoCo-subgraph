import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import assert from 'assert';

const APIURL = 'http://localhost:8000/subgraphs/name/test/poco';

async function main() {
    console.log('Running integration tests..');
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
    console.log('integration tests completed ✔️');
}

main();
