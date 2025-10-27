// SPDX-FileCopyrightText: 2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { BigInt, Bytes, DataSourceContext } from '@graphprotocol/graph-ts';
import {
    assert,
    beforeEach,
    clearStore,
    dataSourceMock,
    describe,
    test,
} from 'matchstick-as/assembly/index';
import { BulkSlice, DatasetOrder } from '../../../generated/schema';
import { handleBulk, handleBulkSlice } from '../../../src/Modules/Bulk';
import {
    CONTEXT_BOT_FIRST,
    CONTEXT_BOT_SIZE,
    CONTEXT_BULK,
    CONTEXT_DEAL,
    CONTEXT_INDEX,
    createBulkOrderID,
    createBulkSliceID,
} from '../../../src/utils';
import { mockAddress, mockBytes32 } from '../utils/mock';

const dealId = mockBytes32('dealId');

describe('Bulk Module', () => {
    beforeEach(() => {
        clearStore();
    });

    describe('handleBulk', () => {
        test('Should create Bulk entity from JSON content', () => {
            // --- GIVEN
            const bulkId = dealId.toHex();
            const hash = 'QmBulkHash';
            const botFirst = BigInt.fromI32(0);
            const botSize = BigInt.fromI32(2);

            // Create JSON content with slice CIDs
            const jsonContent = '["QmSlice1", "QmSlice2", "QmSlice3"]';
            const content = Bytes.fromUTF8(jsonContent);

            // Mock dataSource
            let context = new DataSourceContext();
            context.setString(CONTEXT_DEAL, bulkId);
            context.setBigInt(CONTEXT_BOT_FIRST, botFirst);
            context.setBigInt(CONTEXT_BOT_SIZE, botSize);

            dataSourceMock.setReturnValues(hash, 'network', context);

            // --- WHEN
            handleBulk(content);

            // --- THEN
            assert.fieldEquals('Bulk', bulkId, 'id', bulkId);
            assert.fieldEquals('Bulk', bulkId, 'hash', hash);
        });
    });

    describe('handleBulkSlice', () => {
        test('Should create BulkSlice entity from JSON content with empty dataset orders', () => {
            // --- GIVEN
            const bulkId = dealId.toHex();
            const index = BigInt.fromI32(0);
            const hash = 'QmSliceHash';
            const sliceId = createBulkSliceID(bulkId, index);

            // Create JSON content with empty dataset orders array
            const jsonContent = '[]';
            const content = Bytes.fromUTF8(jsonContent);

            let context = new DataSourceContext();
            context.setString(CONTEXT_BULK, bulkId);
            context.setString(CONTEXT_DEAL, bulkId);
            context.setBigInt(CONTEXT_INDEX, index);

            dataSourceMock.setReturnValues(hash, 'network', context);

            // --- WHEN
            handleBulkSlice(content);

            // --- THEN
            assert.fieldEquals('BulkSlice', sliceId, 'id', sliceId);
            assert.fieldEquals('BulkSlice', sliceId, 'hash', hash);
            assert.fieldEquals('BulkSlice', sliceId, 'bulk', bulkId);
            assert.fieldEquals('BulkSlice', sliceId, 'index', '0');
        });

        test('Should create BulkSlice entity from JSON content with a dataset order', () => {
            // --- GIVEN
            const bulkId = dealId.toHex();
            const index = BigInt.fromI32(0);
            const hash = 'QmSliceHash';
            const sliceId = createBulkSliceID(bulkId, index);
            const datasetAddr = mockAddress('dataset').toHex().toLowerCase();
            const appAddr = mockAddress('app').toHex().toLowerCase();
            const poolAddr = mockAddress('pool').toHex().toLowerCase();
            const requesterAddr = mockAddress('requester').toHex().toLowerCase();
            const tagHex = mockBytes32('tag').toHex();
            const saltHex = mockBytes32('salt').toHex();
            const signHex = '0x1234';

            // Create JSON content with one valid dataset order
            const jsonContent = `[{
                "dataset": "${datasetAddr}",
                "datasetprice": "1000000000",
                "volume": "1",
                "tag": "${tagHex}",
                "apprestrict": "${appAddr}",
                "workerpoolrestrict": "${poolAddr}",
                "requesterrestrict": "${requesterAddr}",
                "salt": "${saltHex}",
                "sign": "${signHex}"
            }]`;
            const content = Bytes.fromUTF8(jsonContent);

            let context = new DataSourceContext();
            context.setString(CONTEXT_BULK, bulkId);
            context.setString(CONTEXT_DEAL, bulkId);
            context.setBigInt(CONTEXT_INDEX, index);

            dataSourceMock.setReturnValues(hash, 'network', context);

            // --- WHEN
            handleBulkSlice(content);

            // --- THEN
            assert.fieldEquals('BulkSlice', sliceId, 'id', sliceId);

            // Verify BulkSlice has dataset order
            let loadedSlice = BulkSlice.load(sliceId);
            assert.assertTrue(loadedSlice != null);
            if (loadedSlice != null) {
                assert.i32Equals(loadedSlice.datasetOrders.length, 1);
                assert.i32Equals(loadedSlice.datasets.length, 1);
                assert.stringEquals(loadedSlice.datasets[0], datasetAddr);
            }
        });
    });

    describe('DatasetOrder in BulkSlice context', () => {
        test('Should create DatasetOrder with bulk order ID', () => {
            // --- GIVEN
            const taskId = mockBytes32('task').toHex();
            const orderIndex = BigInt.fromI32(0);
            const datasetOrderId = createBulkOrderID(taskId, orderIndex);
            const datasetAddress = mockAddress('dataset').toHex();

            // --- WHEN
            let datasetOrder = new DatasetOrder(datasetOrderId);
            datasetOrder.dataset = datasetAddress;
            datasetOrder.datasetprice = BigInt.zero().toBigDecimal();
            datasetOrder.volume = BigInt.fromI32(1);
            datasetOrder.tag = mockBytes32('tag');
            datasetOrder.apprestrict = mockAddress('app');
            datasetOrder.workerpoolrestrict = mockAddress('pool');
            datasetOrder.requesterrestrict = mockAddress('requester');
            datasetOrder.salt = mockBytes32('salt');
            datasetOrder.sign = mockBytes32('sign');
            datasetOrder.save();

            // --- THEN
            assert.fieldEquals('DatasetOrder', datasetOrderId, 'id', datasetOrderId);
            assert.fieldEquals('DatasetOrder', datasetOrderId, 'dataset', datasetAddress);
        });

        test('Should link multiple DatasetOrders to a BulkSlice', () => {
            // --- GIVEN
            const bulkId = dealId.toHex();
            const index = BigInt.fromI32(0);
            const sliceId = createBulkSliceID(dealId.toHex(), index);
            const taskId = mockBytes32('task').toHex();

            // Create dataset orders
            const orderIds: string[] = [];
            const datasetAddresses: string[] = [];

            for (let i = 0; i < 2; i++) {
                const orderIndex = BigInt.fromI32(i);
                const datasetOrderId = createBulkOrderID(taskId, orderIndex);
                const datasetAddress = mockAddress('dataset' + i.toString()).toHex();

                let datasetOrder = new DatasetOrder(datasetOrderId);
                datasetOrder.dataset = datasetAddress;
                datasetOrder.datasetprice = BigInt.fromI32(i + 1).toBigDecimal();
                datasetOrder.volume = BigInt.fromI32(1);
                datasetOrder.tag = mockBytes32('tag');
                datasetOrder.apprestrict = mockAddress('app');
                datasetOrder.workerpoolrestrict = mockAddress('pool');
                datasetOrder.requesterrestrict = mockAddress('requester');
                datasetOrder.salt = mockBytes32('salt');
                datasetOrder.sign = mockBytes32('sign');
                datasetOrder.save();

                orderIds.push(datasetOrderId);
                datasetAddresses.push(datasetAddress);
            }

            // --- WHEN
            // Create BulkSlice with dataset orders
            let bulkSlice = new BulkSlice(sliceId);
            bulkSlice.task = taskId;
            bulkSlice.hash = 'QmSlice';
            bulkSlice.bulk = bulkId;
            bulkSlice.index = index;
            bulkSlice.datasets = datasetAddresses;
            bulkSlice.datasetOrders = orderIds;
            bulkSlice.save();

            // --- THEN
            // Verify
            let loadedSlice = BulkSlice.load(sliceId);
            assert.assertTrue(loadedSlice != null);
            if (loadedSlice != null) {
                assert.i32Equals(loadedSlice.datasetOrders.length, 2);
                assert.stringEquals(loadedSlice.datasetOrders[0], orderIds[0]);
                assert.stringEquals(loadedSlice.datasetOrders[1], orderIds[1]);
            }
        });
    });
});
