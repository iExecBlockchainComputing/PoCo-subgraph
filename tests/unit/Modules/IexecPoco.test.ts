// SPDX-FileCopyrightText: 2024-2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { BigInt, ethereum } from '@graphprotocol/graph-ts';
import { assert, describe, newTypedMockEventWithParams, test } from 'matchstick-as/assembly/index';
import { OrdersMatched } from '../../../generated/Core/IexecInterfaceToken';
import { handleOrdersMatched } from '../../../src/Modules';
import { toRLC } from '../../../src/utils';
import { EventParamBuilder } from '../utils/EventParamBuilder';
import { buildDeal, mockAddress, mockBytes32, mockViewDeal } from '../utils/mock';

const pocoAddress = mockAddress('pocoAddress');
const dealId = mockBytes32('dealId');
const appHash = mockBytes32('appHash');
const datasetHash = mockBytes32('datasetHash');
const workerpoolHash = mockBytes32('workerpoolHash');
const requestHash = mockBytes32('requestHash');
const timestamp = BigInt.fromI32(123456789);
const appAddress = mockAddress('appAddress');
const appOwner = mockAddress('appOwner');
const appPrice = BigInt.fromI32(1);
const datasetAddress = mockAddress('datasetAddress');
const datasetOwner = mockAddress('datasetOwner');
const datasetPrice = BigInt.fromI32(2);
const workerpoolAddress = mockAddress('workerpoolAddress');
const workerpoolOwner = mockAddress('workerpoolOwner');
const workerpoolPrice = BigInt.fromI32(3);
const trust = BigInt.fromI32(4);
const category = BigInt.fromI32(5);
const tag = mockBytes32('tag');
const requester = mockAddress('requester');
const beneficiary = mockAddress('beneficiary');
const callback = mockAddress('callback');
const params = 'params';
const startTime = BigInt.fromI32(6);
const botFirst = BigInt.fromI32(7);
const botSize = BigInt.fromI32(8);
const workerStake = BigInt.fromI32(9);
const schedulerRewardRatio = BigInt.fromI32(10);
const sponsor = mockAddress('sponsor');

describe('IexecPoco', () => {
    test('Should handle OrdersMatched', () => {
        mockViewDeal(pocoAddress, dealId).returns([buildDefaultDeal()]);
        // Create the mock event
        let mockEvent = newTypedMockEventWithParams<OrdersMatched>(
            EventParamBuilder.init()
                .bytes('dealid', dealId)
                .bytes('appHash', appHash)
                .bytes('datasetHash', datasetHash)
                .bytes('workerpoolHash', workerpoolHash)
                .bytes('requestHash', requestHash)
                .build(),
        );
        mockEvent.block.timestamp = timestamp;
        mockEvent.address = pocoAddress;

        // Call the handler
        handleOrdersMatched(mockEvent);

        // Assert that the OrdersMatched entity was created and has correct fields
        const entityId = mockEvent.block.number
            .toString()
            .concat('-')
            .concat(mockEvent.logIndex.toString());

        assert.fieldEquals('OrdersMatched', entityId, 'deal', dealId.toHex());
        assert.fieldEquals('OrdersMatched', entityId, 'timestamp', timestamp.toString());
        // Check deal
        assert.fieldEquals('Deal', dealId.toHex(), 'app', appAddress.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'appOwner', appOwner.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'appPrice', toRLC(appPrice).toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'dataset', datasetAddress.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'datasetOwner', datasetOwner.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'datasetPrice', toRLC(datasetPrice).toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'workerpool', workerpoolAddress.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'workerpoolOwner', workerpoolOwner.toHex());
        assert.fieldEquals(
            'Deal',
            dealId.toHex(),
            'workerpoolPrice',
            toRLC(workerpoolPrice).toString(),
        );
        assert.fieldEquals('Deal', dealId.toHex(), 'trust', trust.toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'category', category.toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'tag', tag.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'requester', requester.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'beneficiary', beneficiary.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'callback', callback.toHex());
        assert.fieldEquals('Deal', dealId.toHex(), 'params', params);
        assert.fieldEquals('Deal', dealId.toHex(), 'startTime', startTime.toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'botFirst', botFirst.toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'botSize', botSize.toString());
        assert.fieldEquals('Deal', dealId.toHex(), 'workerStake', workerStake.toString());
        assert.fieldEquals(
            'Deal',
            dealId.toHex(),
            'schedulerRewardRatio',
            schedulerRewardRatio.toString(),
        );
        assert.fieldEquals('Deal', dealId.toHex(), 'sponsor', sponsor.toHex());
        // TODO: Check other saved entities

        // Assert that a transaction was logged (if applicable)
        const transactionId = mockEvent.transaction.hash.toHex();
        assert.fieldEquals('Transaction', transactionId, 'id', transactionId);
    });
});

function buildDefaultDeal(): ethereum.Value {
    return buildDeal(
        appAddress,
        appOwner,
        appPrice,
        datasetAddress,
        datasetOwner,
        datasetPrice,
        workerpoolAddress,
        workerpoolOwner,
        workerpoolPrice,
        trust,
        category,
        tag,
        requester,
        beneficiary,
        callback,
        params,
        startTime,
        botFirst,
        botSize,
        workerStake,
        schedulerRewardRatio,
        sponsor,
    );
}

export { OrdersMatched };
