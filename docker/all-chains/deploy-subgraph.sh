#!/bin/bash
cd ../..

# viviani
graph create viviani/poco --node http://127.0.0.1:13320
graph deploy viviani/poco subgraph.viviani.yaml --node http://127.0.0.1:13320 --ipfs http://127.0.0.1:5001 --version-label 0.0.1

echo "browse viviani/poco subgraph at http://127.0.0.1:13300/subgraphs/name/viviani/poco/graphql"

# bellecour
graph create bellecour/poco --node http://127.0.0.1:13420
graph deploy bellecour/poco subgraph.bellecour.yaml --node http://127.0.0.1:13420 --ipfs http://127.0.0.1:5001 --version-label 0.0.1

echo "browse bellecour/poco subgraph at http://127.0.0.1:13400/subgraphs/name/bellecour/poco/graphql"
