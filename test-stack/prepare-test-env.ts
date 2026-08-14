import { ethers } from 'ethers';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const forkUrl = process.env.FORK_URL || 'https://sepolia-rollup.arbitrum.io/rpc';
const networkName = process.env.NETWORK_NAME; // Get the network name from env

// Path to the networks.json file (one directory up)
const networksFilePath = join(__dirname, '..', 'networks.json');

/**
 * Fetch the current block number from the fork URL using ethers
 * @returns {Promise<number>} The current block number
 */
async function getCurrentBlockNumber() {
    try {
        const provider = new ethers.JsonRpcProvider(forkUrl);
        const blockNumber = await provider.getBlockNumber();
        return blockNumber;
    } catch (error) {
        throw Error(`Failed to get current block number from ${forkUrl}: ${error}`);
    }
}

/**
 * Create environment files for the test stack
 * @param {number} forkBlockNumber - The block number to fork from
 */
async function createEnvFiles(forkBlockNumber: number) {
    console.log('Creating .env file for docker-compose test-stack');
    writeFileSync(
        '.env',
        '############ THIS FILE IS GENERATED ############\n' +
            '# run "node prepare-test-env.js" to regenerate #\n' +
            '################################################\n' +
            '\n' +
            '# blockchain node to use as the reference for the local fork\n' +
            `FORK_URL=${forkUrl}\n` +
            '# block number to fork from\n' +
            `FORK_BLOCK=${forkBlockNumber}\n` +
            '# first block indexed by graph-node (the fork block itself is a real network\n' +
            '# block whose non-standard transaction receipts cannot be served by anvil)\n' +
            `GENESIS_BLOCK=${forkBlockNumber + 1}\n`,
    );
}

/**
 * Update networks.json file with the first block to index
 * @param {number} startBlockNumber - The block number to start indexing from
 */
async function updateNetworksFile(startBlockNumber: number) {
    if (!networkName) {
        console.warn(
            'No NETWORK_NAME environment variable provided. The networks.json file will not be updated.',
        );
        return;
    }

    if (!existsSync(networksFilePath)) {
        console.warn(`networks.json file not found at ${networksFilePath}`);
        return;
    }

    console.log(`Updating ${networksFilePath} for network '${networkName}'`);

    try {
        // Read the current networks.json file
        const networksData = JSON.parse(readFileSync(networksFilePath, 'utf8'));

        // Check if the specified network exists in the file
        if (networksData[networkName]) {
            console.log(`Updating startBlock for network '${networkName}' to ${startBlockNumber}`);

            // Update all startBlock values for the specified network
            Object.keys(networksData[networkName]).forEach((contract) => {
                networksData[networkName][contract].startBlock = startBlockNumber;
            });

            // Write the updated networks.json file
            writeFileSync(networksFilePath, JSON.stringify(networksData, null, 4));
            console.log(`Successfully updated ${networksFilePath}`);
        } else {
            console.warn(`Network '${networkName}' not found in networks.json. File unchanged.`);
        }
    } catch (error) {
        console.error(`Error updating networks.json file: ${error}`);
    }
}

/**
 * Main function to orchestrate the process
 */
async function main() {
    try {
        const forkBlockNumber = await getCurrentBlockNumber();
        await createEnvFiles(forkBlockNumber);
        // Index from the first block produced by the local fork
        await updateNetworksFile(forkBlockNumber + 1);
    } catch (error) {
        console.error(`Error in main process: ${error}`);
        process.exit(1);
    }
}

// Run the main function
main();
