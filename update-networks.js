import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { NETWORK_NAME, START_BLOCK } = process.env; // Get the network name from env

// Path to the networks.json file (one directory up)
const networksFilePath = join(__dirname, 'networks.json');

/**
 * Update networks.json file with the current block number
 */
async function updateNetworksFile() {
    if (!NETWORK_NAME) {
        console.warn(
            'No NETWORK_NAME environment variable provided. The networks.json file will not be updated.',
        );
        return;
    }
    if (!START_BLOCK) {
        console.warn(
            'No START_BLOCK environment variable provided. The networks.json file will not be updated.',
        );
        return;
    }

    if (!existsSync(networksFilePath)) {
        console.warn(`networks.json file not found at ${networksFilePath}`);
        return;
    }

    try {
        // Read the current networks.json file
        const networksData = JSON.parse(readFileSync(networksFilePath, 'utf8'));

        // Check if the specified network exists in the file
        if (networksData[NETWORK_NAME]) {
            console.log(`Updating startBlock for network '${NETWORK_NAME}' to ${START_BLOCK}`);

            // Update all startBlock values for the specified network
            Object.keys(networksData[NETWORK_NAME]).forEach((contract) => {
                networksData[NETWORK_NAME][contract].startBlock = parseInt(START_BLOCK, 10);
            });

            // Write the updated networks.json file
            writeFileSync(networksFilePath, JSON.stringify(networksData, null, 4));
            console.log(`Successfully updated ${networksFilePath}`);
        } else {
            console.warn(`Network '${NETWORK_NAME}' not found in networks.json. File unchanged.`);
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
        await updateNetworksFile();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

// Run the main function
main();
