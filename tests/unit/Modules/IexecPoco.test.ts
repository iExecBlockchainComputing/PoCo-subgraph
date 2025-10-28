// SPDX-FileCopyrightText: 2024-2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import {
    assert,
    beforeEach,
    clearStore,
    describe,
    newTypedMockEventWithParams,
    test,
} from 'matchstick-as/assembly/index';
import { OrdersMatched } from '../../../generated/Core/IexecInterfaceToken';
import { App, Workerpool } from '../../../generated/schema';
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
    beforeEach(() => {
        clearStore();
    });

    test('Should handle OrdersMatched', () => {
        // Create app and workerpool entities first (they should exist from registry)
        let app = new App(appAddress.toHex());
        app.owner = appOwner.toHex();
        app.name = 'TestApp';
        app.type = 'DOCKER';
        app.multiaddr = mockBytes32('multiaddr');
        app.checksum = mockBytes32('checksum');
        app.mrenclave = mockBytes32('mrenclave');
        app.timestamp = BigInt.zero();
        app.usageCount = BigInt.zero();
        app.lastUsageTimestamp = BigInt.zero();
        app.save();

        let workerpool = new Workerpool(workerpoolAddress.toHex());
        workerpool.owner = workerpoolOwner.toHex();
        workerpool.description = 'TestWorkerpool';
        workerpool.workerStakeRatio = BigInt.fromI32(50);
        workerpool.schedulerRewardRatio = BigInt.fromI32(10);
        workerpool.timestamp = BigInt.zero();
        workerpool.usageCount = BigInt.zero();
        workerpool.lastUsageTimestamp = BigInt.zero();
        workerpool.save();

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

        // Assert that app usage statistics were updated
        assert.fieldEquals('App', appAddress.toHex(), 'usageCount', botSize.toString());
        assert.fieldEquals('App', appAddress.toHex(), 'lastUsageTimestamp', timestamp.toString());

        // Assert that workerpool usage statistics were updated
        assert.fieldEquals(
            'Workerpool',
            workerpoolAddress.toHex(),
            'usageCount',
            botSize.toString(),
        );
        assert.fieldEquals(
            'Workerpool',
            workerpoolAddress.toHex(),
            'lastUsageTimestamp',
            timestamp.toString(),
        );
    });

    test('Should accumulate usage counts for multiple deals', () => {
        const dealId1 = mockBytes32('dealId1');
        const dealId2 = mockBytes32('dealId2');
        const timestamp1 = BigInt.fromI32(123456789);
        const timestamp2 = BigInt.fromI32(123456999);
        const botSize1 = BigInt.fromI32(5);
        const botSize2 = BigInt.fromI32(3);

        // Create app and workerpool entities first (they should exist from registry)
        let app = new App(appAddress.toHex());
        app.owner = appOwner.toHex();
        app.name = 'TestApp';
        app.type = 'DOCKER';
        app.multiaddr = mockBytes32('multiaddr');
        app.checksum = mockBytes32('checksum');
        app.mrenclave = mockBytes32('mrenclave');
        app.timestamp = BigInt.zero();
        app.usageCount = BigInt.zero();
        app.lastUsageTimestamp = BigInt.zero();
        app.save();

        let workerpool = new Workerpool(workerpoolAddress.toHex());
        workerpool.owner = workerpoolOwner.toHex();
        workerpool.description = 'TestWorkerpool';
        workerpool.workerStakeRatio = BigInt.fromI32(50);
        workerpool.schedulerRewardRatio = BigInt.fromI32(10);
        workerpool.timestamp = BigInt.zero();
        workerpool.usageCount = BigInt.zero();
        workerpool.lastUsageTimestamp = BigInt.zero();
        workerpool.save();

        // First deal
        mockViewDeal(pocoAddress, dealId1).returns([
            buildDeal(
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
                botSize1,
                workerStake,
                schedulerRewardRatio,
                sponsor,
            ),
        ]);

        let mockEvent1 = newTypedMockEventWithParams<OrdersMatched>(
            EventParamBuilder.init()
                .bytes('dealid', dealId1)
                .bytes('appHash', appHash)
                .bytes('datasetHash', datasetHash)
                .bytes('workerpoolHash', workerpoolHash)
                .bytes('requestHash', requestHash)
                .build(),
        );
        mockEvent1.block.timestamp = timestamp1;
        mockEvent1.address = pocoAddress;

        handleOrdersMatched(mockEvent1);

        // Verify first deal usage
        assert.fieldEquals('App', appAddress.toHex(), 'usageCount', botSize1.toString());
        assert.fieldEquals('App', appAddress.toHex(), 'lastUsageTimestamp', timestamp1.toString());
        assert.fieldEquals(
            'Workerpool',
            workerpoolAddress.toHex(),
            'usageCount',
            botSize1.toString(),
        );
        assert.fieldEquals(
            'Workerpool',
            workerpoolAddress.toHex(),
            'lastUsageTimestamp',
            timestamp1.toString(),
        );

        // Second deal
        mockViewDeal(pocoAddress, dealId2).returns([
            buildDeal(
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
                botSize2,
                workerStake,
                schedulerRewardRatio,
                sponsor,
            ),
        ]);

        let mockEvent2 = newTypedMockEventWithParams<OrdersMatched>(
            EventParamBuilder.init()
                .bytes('dealid', dealId2)
                .bytes('appHash', mockBytes32('appHash2'))
                .bytes('datasetHash', mockBytes32('datasetHash2'))
                .bytes('workerpoolHash', mockBytes32('workerpoolHash2'))
                .bytes('requestHash', mockBytes32('requestHash2'))
                .build(),
        );
        mockEvent2.block.timestamp = timestamp2;
        mockEvent2.address = pocoAddress;

        handleOrdersMatched(mockEvent2);

        // Verify accumulated usage
        const totalUsage = botSize1.plus(botSize2);
        assert.fieldEquals('App', appAddress.toHex(), 'usageCount', totalUsage.toString());
        assert.fieldEquals('App', appAddress.toHex(), 'lastUsageTimestamp', timestamp2.toString());
        assert.fieldEquals(
            'Workerpool',
            workerpoolAddress.toHex(),
            'usageCount',
            totalUsage.toString(),
        );
        assert.fieldEquals(
            'Workerpool',
            workerpoolAddress.toHex(),
            'lastUsageTimestamp',
            timestamp2.toString(),
        );
    });

    test('Should handle OrdersMatched with bulk_cid when no dataset', () => {
        const bulkCid = 'QmBulkCID123456789';
        const paramsWithBulkCid = `{"bulk_cid": "${bulkCid}"}`;

        // Create a deal without dataset (Address.zero()) but with bulk_cid in params
        const dealWithBulkCid = buildDeal(
            appAddress,
            appOwner,
            appPrice,
            Address.zero(), // zero address for dataset
            Address.zero(), // zero address for dataset owner
            BigInt.zero(), // zero price for dataset
            workerpoolAddress,
            workerpoolOwner,
            workerpoolPrice,
            trust,
            category,
            tag,
            requester,
            beneficiary,
            callback,
            paramsWithBulkCid, // params containing bulk_cid
            startTime,
            botFirst,
            botSize,
            workerStake,
            schedulerRewardRatio,
            sponsor,
        );

        mockViewDeal(pocoAddress, dealId).returns([dealWithBulkCid]);

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

        // Assert that the deal was created with bulk reference
        assert.fieldEquals(
            'Deal',
            dealId.toHex(),
            'dataset',
            '0x0000000000000000000000000000000000000000',
        );
        assert.fieldEquals('Deal', dealId.toHex(), 'bulk', dealId.toHex()); // bulk ID should be the dealId
        assert.fieldEquals('Deal', dealId.toHex(), 'params', paramsWithBulkCid);
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
