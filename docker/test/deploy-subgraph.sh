#!/bin/bash
cd ../..

# test
graph create test/poco --node http://127.0.0.1:8020
graph deploy test/poco subgraph.test.yaml --node http://127.0.0.1:8020 --ipfs http://127.0.01:5001 --version-label 0.0.1

echo "browse test/poco subgraph at http://127.0.0.1:8000/subgraphs/name/test/poco/graphql"
