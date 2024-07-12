@Library('global-jenkins-library@2.7.7') _

def userInput

node {
    docker.image('node:20-alpine').inside('--user root') {
        stage('Setup') {
            checkout scm
        }

        stage('Deployment Form') {
            timeout(time: 5, unit: 'MINUTES') {
                userInput = input(
                    id: 'select-deployment',
                    message: 'Select environment & service',
                    parameters: [
                        string(name: 'network', description: 'The network name you want to deploy your subgraph'),
                        string(name: 'targetRemoteHost', description: 'The host you want to deploy the subgraph')
                    ]
                )
            }
            echo "Selected network: '${userInput.network}'"
            echo "Selected service name: '${userInput.targetRemoteHost}'"
        }

        stage('Setup Docker Image') {
            sh 'apk add jq'
        }
        stage('Building Subgraph') {
            sh """
            # Navigate to workspace directory and ensure the script is executable
            chmod +x generate_subgraph.sh &&
            apk add bash &&
            bash ./generate_subgraph.sh '${userInput.network}'
            """
            
            // Validate subgraph file generation
            sh """
            FILE=./subgraph.${userInput.network}.yaml
            if test -f "\$FILE"; then
                echo "Subgraph file generated successfully"
            else
                echo "Failed to generate subgraph file"
                exit 1
            fi
            """
        }

        stage('Build') {
            sh """
            yarn global add @graphprotocol/graph-cli &&
            cd ./ &&
            yarn install &&
            graph codegen subgraph.${userInput.network}.yaml &&
            graph build subgraph.${userInput.network}.yaml &&
            graph create ${userInput.network}/poco-v5 --node http://${userInput.targetRemoteHost}:8020 &&
            graph deploy ${userInput.network}/poco-v5 subgraph.${userInput.network}.yaml --node http://${userInput.targetRemoteHost}:8020 --ipfs http://${userInput.targetRemoteHost}:5001 --version-label v1.0.0-rc.1
            """
        }

        stage('The End') {
            echo 'The end.'
        }
    }
}
