// SPDX-FileCopyrightText: 2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { Address, BigInt, ByteArray, Bytes, crypto, ethereum } from '@graphprotocol/graph-ts';
import { createMockedFunction, MockedFunction } from 'matchstick-as';

export function mockBytes32(input: string): Bytes {
    return Bytes.fromHexString(crypto.keccak256(ByteArray.fromUTF8(input)).toHex());
}

export function mockAddress(input: string): Address {
    return Address.fromString(mockBytes32(input).toHex().slice(0, 42));
}

export function mockViewDeal(pocoProxyAddress: Address, dealId: Bytes): MockedFunction {
    return createMockedFunction(
        pocoProxyAddress,
        'viewDeal',
        'viewDeal(bytes32):(((address,address,uint256),(address,address,uint256),(address,address,uint256),uint256,uint256,bytes32,address,address,address,string,uint256,uint256,uint256,uint256,uint256,address))',
    ).withArgs([ethereum.Value.fromFixedBytes(dealId)]);
}

export function buildDeal(
    appAddress: Address,
    appOwner: Address,
    appPrice: BigInt,
    datasetAddress: Address,
    datasetOwner: Address,
    datasetPrice: BigInt,
    workerpoolAddress: Address,
    workerpoolOwner: Address,
    workerpoolPrice: BigInt,
    trust: BigInt,
    category: BigInt,
    tag: Bytes,
    requester: Address,
    beneficiary: Address,
    callback: Address,
    params: string,
    startTime: BigInt,
    botFirst: BigInt,
    botSize: BigInt,
    workerStake: BigInt,
    schedulerRewardRatio: BigInt,
    sponsor: Address,
): ethereum.Value {
    return ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
            ethereum.Value.fromTuple(
                // app
                changetype<ethereum.Tuple>([
                    ethereum.Value.fromAddress(appAddress),
                    ethereum.Value.fromAddress(appOwner),
                    ethereum.Value.fromI32(appPrice.toI32()),
                ]),
            ),
            ethereum.Value.fromTuple(
                // dataset
                changetype<ethereum.Tuple>([
                    ethereum.Value.fromAddress(datasetAddress),
                    ethereum.Value.fromAddress(datasetOwner),
                    ethereum.Value.fromI32(datasetPrice.toI32()),
                ]),
            ),
            ethereum.Value.fromTuple(
                // workerpool
                changetype<ethereum.Tuple>([
                    ethereum.Value.fromAddress(workerpoolAddress),
                    ethereum.Value.fromAddress(workerpoolOwner),
                    ethereum.Value.fromI32(workerpoolPrice.toI32()),
                ]),
            ),
            ethereum.Value.fromI32(trust.toI32()),
            ethereum.Value.fromI32(category.toI32()),
            ethereum.Value.fromFixedBytes(tag),
            ethereum.Value.fromAddress(requester),
            ethereum.Value.fromAddress(beneficiary),
            ethereum.Value.fromAddress(callback),
            ethereum.Value.fromString(params),
            ethereum.Value.fromI32(startTime.toI32()),
            ethereum.Value.fromI32(botFirst.toI32()),
            ethereum.Value.fromI32(botSize.toI32()),
            ethereum.Value.fromI32(workerStake.toI32()),
            ethereum.Value.fromI32(schedulerRewardRatio.toI32()),
            ethereum.Value.fromAddress(sponsor),
        ]),
    );
}
