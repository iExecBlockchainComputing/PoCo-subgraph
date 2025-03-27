//Readme @ http://gitlab.iex.ec:30000/iexec/jenkins-library

@Library('global-jenkins-library@feature/subgraph-networks') _
def userInput

node {
    stage('Choose deployment parameters') {
        timeout(time: 5, unit: 'MINUTES') {
            userInput = input(
                id: 'deployment-params',
                message: 'Select deployment parameters',
                parameters: [
                    choice(
                        name: 'networkName',
                        choices: ['bellecour'],
                        description: 'Select the target network'
                    ),
                    choice(
                        name: 'environment',
                        choices: ['staging','tmp','prod'],
                        description: 'Select deployment environment'
                    ),
                    string(
                        name: 'versionLabel',
                        defaultValue: 'v1.0.0',
                        description: 'Version label for the deployment'
                    ),
                    string(
                        name: 'subgraphName',
                        defaultValue: 'poco-v5',
                        description: 'Name of the subgraph'
                    )
                ]
            )
        }

        // Define host mappings
        def hosts = [
            'staging': [
                'graphNode': 'azubgrpbx-thegraph-staging.public.az2.internal',
                'ipfs': 'ipfs-upload.stagingv8.iex.ec',
                'env' : 'staging-'
            ],
            'tmp': [
                'graphNode': 'azubgrpbp-thegraph.public.az2.internal',
                'ipfs': 'ipfs-upload.v8-bellecour.iex.ec',
                'env' : 'tmp-'
            ],
            'prod': [
                'graphNode': 'azubgrpbp-thegraph.public.az2.internal',
                'ipfs': 'ipfs-upload.v8-bellecour.iex.ec',
                'env' : ''
            ]
        ]
        
        // Call deploySubGraph with user inputs
        deploySubGraph(
            targetRemoteHostGraphNode: hosts[userInput.environment].graphNode,
            targetRemoteHostIPFS: hosts[userInput.environment].ipfs,
            subgraphFolder: './',
            networkName: userInput.networkName,
            deployEnv: hosts[userInput.environment].env,
            subgraphName: userInput.subgraphName,
            subgraphVersionLabel: userInput.versionLabel
        )
    }
}
