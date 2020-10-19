# iExec PoCo v5 - subgraph


## Usefull commands
* authentification (only once per machine)

	`graph auth https://api.thegraph.com/deploy/ <accesstoken>`

* compilation

	`npm run codegen && npm run build`

* deployment

	`npm run deploy`

* wip goerli

```
graph codegen subgraph.goerli.yaml
graph build subgraph.goerli.yaml
graph deploy pierrejeanjacquot/wip-goerli --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ subgraph.goerli.yaml
```
