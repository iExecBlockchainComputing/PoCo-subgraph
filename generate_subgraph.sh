#!/bin/bash

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "jq is required but not installed. Please install jq to proceed."
    exit 1
fi

# Function to replace placeholders in the template
generate_yaml() {
    local network=$1
    local config_file="config.json"
    local template_file="subgraph.bellecour.template.yaml"
    local output_file="subgraph.${network}.yaml"

    # Read values from config.json
    local start_block=$(jq -r ".${network}.STARTBLOCK" ${config_file})
    local erc1538_address=$(jq -r ".${network}.ERC1538_ADDRESS" ${config_file})
    local core_address=$(jq -r ".${network}.IEXECE_INTERFACE_TOKEN_CORE_ADDRESS" ${config_file})
    local app_registry_address=$(jq -r ".${network}.APP_REGISTRY_ADDRESS" ${config_file})
    local dataset_registry_address=$(jq -r ".${network}.DATATSET_REGISTRY_ADDRESS" ${config_file})
    local workerpool_registry_address=$(jq -r ".${network}.WORKERPOOL_REGISTRY_ADDRESS" ${config_file})

    # Replace placeholders in the template and create the output file
    sed -e "s/#NETWORK_NAME#/network: ${network}/g" \
        -e "s/#STARTBLOCK#/startBlock: ${start_block}/g" \
        -e "s|#ERC1538_ADDRESS#|address: \"${erc1538_address}\"|g" \
        -e "s|#IEXECE_INTERFACE_TOKEN_CORE_ADDRESS#|address: \"${core_address}\"|g" \
        -e "s|#APP_REGISTRY_ADDRESS#|address: \"${app_registry_address}\"|g" \
        -e "s|#DATATSET_REGISTRY_ADDRESS#|address: \"${dataset_registry_address}\"|g" \
        -e "s|#WORKERPOOL_REGISTRY_ADDRESS#|address: \"${workerpool_registry_address}\"|g" \
        ${template_file} > ${output_file}

    echo "Generated ${output_file}"
}


# Function to create the Jenkinsfile
generate_jenkinsfile() {
    local network=$1
    local jenkinsfile="Jenkinsfile_Subgraph_${network}"

    cat <<EOL > ${jenkinsfile}
//Readme @ http://gitlab.iex.ec:30000/iexec/jenkins-library

@Library('global-jenkins-library@2.7.7') _
deploySubGraph(
  targetRemoteHost : 'azubgrpvx-thegraph-${network}.public.az2.internal',
  subgraphFolder: './',
  subgraphFilename: 'subgraph.${network}.yaml',
  subgraphVersionLabel: 'v1.0.0-rc.1',
  subgraphLabel: '${network}/poco-v5'
)
EOL

    echo "Generated ${jenkinsfile}"
}

# Check if the user provided a network name
if [ -z "$1" ]; then
    echo "Usage: $0 <network-name>"
    exit 1
fi

network_name=$1

# Generate the YAML file for the specified network
generate_yaml ${network_name}
generate_jenkinsfile ${network_name}
