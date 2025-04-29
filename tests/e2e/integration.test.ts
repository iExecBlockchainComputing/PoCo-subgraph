import { InMemoryCache } from '@apollo/client/cache';
import { ApolloClient, gql } from '@apollo/client/core';
import { equal } from 'assert';
import { JsonRpcProvider, Wallet, ZeroHash } from 'ethers';
import { env } from '../../config/env';
import { AppRegistry__factory, IexecInterfaceToken__factory } from '../../generated/typechain';
import config from '../../networks.json' with { type: 'json' };

const APIURL = `http://localhost:8000/subgraphs/name/${env.NETWORK_NAME}/poco`;
const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
});
const networkName = env.NETWORK_NAME!;
const iexecProxyAddress = (config as any)[networkName].ERC1538.address;

describe('Integration tests', () => {
    it('should index a newly created app', async () => {
        const provider = new JsonRpcProvider(`http://localhost:8545`);
        const wallet = Wallet.createRandom(provider);

        const iexecProxy = IexecInterfaceToken__factory.connect(iexecProxyAddress, wallet);
        const appRegistryAddress = await iexecProxy.appregistry();
        const appRegistry = AppRegistry__factory.connect(appRegistryAddress, wallet);

        const appName = 'myy-app' + Date.now().toString();
        const tx = await appRegistry.createApp(
            wallet.address,
            appName,
            'DOCKER',
            ZeroHash,
            ZeroHash,
            ZeroHash,
        );
        await tx.wait();

        const result = await client.query({
            query: gql(`
                    {apps(where: {name:"${appName}"}) {
                        id
                        name
                        multiaddr
                        mrenclave
                        checksum
                    }}
                `),
        });
        const app = result.data.apps[0];
        equal(app.name, appName);
        equal(app.multiaddr, ZeroHash);
        equal(app.mrenclave, ZeroHash);
        equal(app.checksum, ZeroHash);
    });
});
