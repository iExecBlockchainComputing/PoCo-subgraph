// SPDX-FileCopyrightText: 2024-2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
    createMockedFunction,
    describe,
    newTypedMockEventWithParams,
    test,
} from 'matchstick-as/assembly/index';
import { OrdersMatched } from '../../generated/Core/IexecInterfaceToken';

describe('IexecPoco', () => {
    test('Should handle OrdersMatched', () => {
        let pocoProxyAddress = Address.fromString('0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7');
        const dealId = Bytes.fromHexString(
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        );
        const sponsor = Address.fromString('0xabcdef1234567890abcdef1234567890abcdef12');
        const timestamp = BigInt.fromI32(123456789);
        const assetAddress = Address.fromString('0x90cBa2Bbb19ecc291A12066Fd8329D65FA1f1947');
        const assetOwner = Address.fromString('0x90cBa2Bbb19ecc291A12066Fd8329D65FA1f1947');
        const assetPrice = 100;
        const uint256 = 200;
        const bytes32 = dealId; // change it
        const address = assetAddress; // change it
        const string = 'a string';
        createMockedFunction(
            pocoProxyAddress,
            'viewDeal',
            'viewDeal(bytes32):(((address,address,uint256),(address,address,uint256),(address,address,uint256),uint256,uint256,bytes32,address,address,address,string,uint256,uint256,uint256,uint256,uint256,address))',
        )
            .withArgs([ethereum.Value.fromFixedBytes(dealId)])
            .returns([
                ethereum.Value.fromTuple(
                    // app
                    changetype<ethereum.Tuple>([
                        ethereum.Value.fromAddress(assetAddress),
                        ethereum.Value.fromAddress(assetOwner),
                        ethereum.Value.fromI32(assetPrice),
                    ]),
                ),
                ethereum.Value.fromTuple(
                    // dataset
                    changetype<ethereum.Tuple>([
                        ethereum.Value.fromAddress(assetAddress),
                        ethereum.Value.fromAddress(assetOwner),
                        ethereum.Value.fromI32(assetPrice),
                    ]),
                ),
                ethereum.Value.fromTuple(
                    // workerpool
                    changetype<ethereum.Tuple>([
                        ethereum.Value.fromAddress(assetAddress),
                        ethereum.Value.fromAddress(assetOwner),
                        ethereum.Value.fromI32(assetPrice),
                    ]),
                ),
                ethereum.Value.fromI32(uint256), // trust
                ethereum.Value.fromI32(uint256), // category
                ethereum.Value.fromFixedBytes(bytes32), // tag
                ethereum.Value.fromAddress(address), // requester
                ethereum.Value.fromAddress(address), // beneficiary
                ethereum.Value.fromAddress(address), // callback
                ethereum.Value.fromString(string), // params
                ethereum.Value.fromI32(uint256), // startTime
                ethereum.Value.fromI32(uint256), // botFirst
                ethereum.Value.fromI32(uint256), // botSize
                ethereum.Value.fromI32(uint256), // workerStake
                ethereum.Value.fromI32(uint256), // schedulerRewardRatio
                ethereum.Value.fromAddress(address), // sponsor
            ]);

        // Create the mock event
        let mockEvent = newTypedMockEventWithParams<OrdersMatched>([
            new ethereum.EventParam('deal', ethereum.Value.fromFixedBytes(dealId)),
        ]);
        mockEvent.block.timestamp = timestamp;
        mockEvent.address = pocoProxyAddress;

        /*

        // Call the handler
        handleOrdersMatched(mockEvent);

        // Assert that the OrdersMatched entity was created and has correct fields
        const entityId = mockEvent.block.number
            .toString()
            .concat('-')
            .concat(mockEvent.logIndex.toString());

        assert.fieldEquals('OrdersMatched', entityId, 'deal', dealId.toHex());
        assert.fieldEquals('OrdersMatched', entityId, 'timestamp', timestamp.toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'sponsor', sponsor.toHex());
        // TODO: Verify others fields

        // Assert that a transaction was logged (if applicable)
        const transactionId = mockEvent.transaction.hash.toHex();
        assert.fieldEquals('Transaction', transactionId, 'id', transactionId);
        */
    });
});

export { OrdersMatched };
