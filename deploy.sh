#!/bin/#!/usr/bin/env bash

declare -A SUBGRAPH=(
	[mainnet]=iexecblockchaincomputing/iexec-poco-v5
	[ropsten]=iexecblockchaincomputing/iexec-poco-v5-ropsten
	[rinkeby]=iexecblockchaincomputing/iexec-poco-v5-rinkeby
	[goerli]=iexecblockchaincomputing/iexec-poco-v5-goerli
	[kovan]=iexecblockchaincomputing/iexec-poco-v5-kovan
	[viviani]=iexecblockchaincomputing/iexec-poco-v5-viviani
	[bellecour]=iexecblockchaincomputing/iexec-poco-v5-bellecour
)

declare -A PUBLIC=(
	[mainnet]=true
	[ropsten]=true
	[rinkeby]=true
	[goerli]=true
	[kovan]=true
	[viviani]=false
	[bellecour]=false
)


function deploy               { graph deploy ${SUBGRAPH[$1]} --node $2 --ipfs $3 subgraph.$1.yaml; }
function deploy_thegraph      { deploy $1 https://api.thegraph.com/deploy/ https://api.thegraph.com/ipfs/; }
function deploy_iexec_public  { deploy $1 http://thegraph.iex.ec:8020      http://thegraph.iex.ec:5001;    }
function deploy_iexec_private { deploy $1 http://192.168.100.119:8020      http://192.168.100.119:5001;    }


graph auth https://api.thegraph.com/deploy/ $THEGRAPH_IEXEC
for network in `ls subgraph.*.yaml | cut -d '.' -f 2`;
do
	echo "### ${SUBGRAPH[$network]}"

	# ${PUBLIC[$network]} && graph create ${SUBGRAPH[$network]} --node http://thegraph.iex.ec:8020
	# ${PUBLIC[$network]} || graph create ${SUBGRAPH[$network]} --node http://192.168.100.119:8020

	${PUBLIC[$network]} && deploy $network https://api.thegraph.com/deploy/ https://api.thegraph.com/ipfs/ # thegraph
	${PUBLIC[$network]} && deploy $network http://thegraph.iex.ec:8020      http://thegraph.iex.ec:5001    # iexec public
	${PUBLIC[$network]} || deploy $network http://192.168.100.119:8020      http://192.168.100.119:5001    # iexec private

done;
