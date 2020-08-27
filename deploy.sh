#!/bin/#!/usr/bin/env bash

# Copyright 2020 IEXEC BLOCKCHAIN TECH
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
