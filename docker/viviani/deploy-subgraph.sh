#!/bin/bash
cd ../..

# viviani
graph create viviani/poco --node http://127.0.0.1:8020
graph deploy viviani/poco subgraph.viviani.yaml --node http://127.0.0.1:8020 --ipfs http://127.0.01:5001 --version-label 0.0.1

echo "browse viviani/poco subgraph at http://127.0.0.1:8000/subgraphs/name/viviani/poco/graphql"
