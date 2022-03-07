#!/bin/bash
cd ../..

# bellecour
graph create bellecour/poco --node http://127.0.0.1:8020
graph deploy bellecour/poco subgraph.bellecour.yaml --node http://127.0.0.1:8020 --ipfs http://127.0.01:5001 --version-label 0.0.1

echo "browse bellecour/poco subgraph at http://127.0.0.1:8000/subgraphs/name/bellecour/poco/graphql"
