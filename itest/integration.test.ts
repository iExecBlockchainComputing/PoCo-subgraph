import { strictEqual } from 'assert';
import { execute } from '../.graphclient';

async function main() {
    console.log('Running integration tests..');
    const result = await execute(
        `
            query {
                protocol(id: "iExec") {
                    tvl
                    id
                }
            }
        `,
        {},
    );
    console.log(result);
    strictEqual(
        JSON.stringify(result.data),
        JSON.stringify({ protocol: { tvl: '0.02025', id: 'iExec' } }),
    );
    console.log('integration tests completed ✔️');
}

main();
