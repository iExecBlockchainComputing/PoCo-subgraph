import { InMemoryCache } from '@apollo/client/cache';
import { ApolloClient, gql } from '@apollo/client/core';
import { equal } from 'assert';
import { JsonRpcProvider, Wallet, ZeroHash } from 'ethers';
import { env } from '../../config/env';
import { AppRegistry__factory, IexecInterfaceToken__factory } from '../../generated/typechain';
import config from '../../networks.json' with { type: 'json' };

const APIURL = `http://localhost:8000/subgraphs/name/${env.NETWORK_NAME}/poco-v5`;
const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
});
const networkName = env.NETWORK_NAME!;
const iexecProxyAddress = (config as any)[networkName].Core.address;

describe('Integration tests', () => {
    it('should index a newly created app', async () => {
        const provider = new JsonRpcProvider(`http://localhost:8545`);
        const wallet = Wallet.createRandom(provider);
        // Fund the random wallet with fork native tokens to pay transaction fees
        await provider.send('anvil_setBalance', [wallet.address, '0x21e19e0c9bab2400000']);

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
