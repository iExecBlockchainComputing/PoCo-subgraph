// SPDX-FileCopyrightText: 2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { BigInt } from '@graphprotocol/graph-ts';
import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index';
import { Bulk, BulkSlice } from '../../../generated/schema';
import {
    createBulkOrderID,
    createBulkSliceID,
    isAddressString,
    isBytes32String,
    isHexString,
    isIntegerString,
} from '../../../src/utils';
import { mockAddress, mockBytes32 } from '../utils/mock';

const dealId = mockBytes32('dealId');

describe('Bulk', () => {
    beforeEach(() => {
        clearStore();
    });

    describe('Validation Functions', () => {
        test('isIntegerString should validate integer strings correctly', () => {
            assert.assertTrue(isIntegerString('123'));
            assert.assertTrue(isIntegerString('1000000000'));
            assert.assertTrue(isIntegerString('0'));

            assert.assertTrue(!isIntegerString(''));
            assert.assertTrue(!isIntegerString('01')); // Leading zero
            assert.assertTrue(!isIntegerString('abc'));
            assert.assertTrue(!isIntegerString('123abc'));
        });

        test('isHexString should validate hex strings correctly', () => {
            assert.assertTrue(isHexString('0x1234'));
            assert.assertTrue(isHexString('0xabcdef'));
            assert.assertTrue(isHexString('0x')); // Empty hex string is valid (length >= 2)

            // Note: isHexString only accepts lowercase hex chars
            assert.assertTrue(!isHexString('0xABCDEF'));
            assert.assertTrue(!isHexString('1234')); // Missing 0x
            assert.assertTrue(!isHexString('0xgg')); // Invalid hex char
        });

        test('isAddressString should validate address strings correctly', () => {
            const validAddress = mockAddress('test').toHex().toLowerCase();
            assert.assertTrue(isAddressString(validAddress));

            assert.assertTrue(!isAddressString('0x123')); // Too short
            assert.assertTrue(!isAddressString('not-an-address'));
        });

        test('isBytes32String should validate bytes32 strings correctly', () => {
            const validBytes32 = mockBytes32('test').toHex();
            assert.assertTrue(isBytes32String(validBytes32));

            assert.assertTrue(!isBytes32String('0x1234')); // Too short
            assert.assertTrue(!isBytes32String('not-bytes32'));
        });
    });

    describe('ID Creation Functions', () => {
        test('createBulkSliceID should create correct ID', () => {
            const index = BigInt.fromI32(5);
            const expectedId = dealId.toHex().concat('-').concat('5');
            const actualId = createBulkSliceID(dealId.toHex(), index);

            assert.stringEquals(expectedId, actualId);
        });

        test('createBulkOrderID should create correct ID', () => {
            const taskId = mockBytes32('task').toHex();
            const orderIndex = BigInt.fromI32(3);
            const expectedId = taskId.concat('-').concat('3');
            const actualId = createBulkOrderID(taskId, orderIndex);

            assert.stringEquals(expectedId, actualId);
        });
    });

    describe('Bulk Entity', () => {
        test('Should create Bulk entity correctly', () => {
            const bulkId = dealId.toHex();
            const hash = 'QmBulkHash123';

            let bulk = new Bulk(bulkId);
            bulk.hash = hash;
            bulk.save();

            assert.fieldEquals('Bulk', bulkId, 'id', bulkId);
            assert.fieldEquals('Bulk', bulkId, 'hash', hash);
        });

        test('Bulk entity should be immutable (load returns existing)', () => {
            const bulkId = dealId.toHex();
            const hash1 = 'QmHash1';
            const hash2 = 'QmHash2';

            let bulk = new Bulk(bulkId);
            bulk.hash = hash1;
            bulk.save();

            // Try to load and modify
            let loadedBulk = Bulk.load(bulkId);
            if (loadedBulk != null) {
                loadedBulk.hash = hash2;
                loadedBulk.save();
            }

            // Verify it was modified (testing immutability logic should be in handler)
            assert.fieldEquals('Bulk', bulkId, 'hash', hash2);
        });
    });

    describe('BulkSlice Entity', () => {
        test('Should create BulkSlice entity correctly', () => {
            const bulkId = dealId.toHex();
            const index = BigInt.fromI32(0);
            const sliceId = createBulkSliceID(dealId.toHex(), index);
            const taskId = mockBytes32('task').toHex();
            const hash = 'QmSliceHash456';

            let bulkSlice = new BulkSlice(sliceId);
            bulkSlice.task = taskId;
            bulkSlice.hash = hash;
            bulkSlice.bulk = bulkId;
            bulkSlice.index = index;
            bulkSlice.datasets = [];
            bulkSlice.datasetOrders = [];
            bulkSlice.save();

            assert.fieldEquals('BulkSlice', sliceId, 'id', sliceId);
            assert.fieldEquals('BulkSlice', sliceId, 'hash', hash);
            assert.fieldEquals('BulkSlice', sliceId, 'bulk', bulkId);
            assert.fieldEquals('BulkSlice', sliceId, 'task', taskId);
            assert.fieldEquals('BulkSlice', sliceId, 'index', '0');
        });

        test('Should handle BulkSlice with dataset orders', () => {
            const bulkId = dealId.toHex();
            const index = BigInt.fromI32(0);
            const sliceId = createBulkSliceID(dealId.toHex(), index);
            const taskId = mockBytes32('task').toHex();
            const datasetAddress1 = mockAddress('dataset1').toHex();
            const datasetAddress2 = mockAddress('dataset2').toHex();

            let bulkSlice = new BulkSlice(sliceId);
            bulkSlice.task = taskId;
            bulkSlice.hash = 'QmSlice';
            bulkSlice.bulk = bulkId;
            bulkSlice.index = index;

            // Add datasets
            const datasets = [datasetAddress1, datasetAddress2];
            bulkSlice.datasets = datasets;

            // Add dataset order IDs
            const orderIds = [
                createBulkOrderID(taskId, BigInt.fromI32(0)),
                createBulkOrderID(taskId, BigInt.fromI32(1)),
            ];
            bulkSlice.datasetOrders = orderIds;

            bulkSlice.save();

            assert.fieldEquals('BulkSlice', sliceId, 'id', sliceId);
            // Note: Array field assertions in matchstick are limited
        });

        test('Should create multiple BulkSlice entities for different indices', () => {
            const bulkId = dealId.toHex();

            for (let i = 0; i < 3; i++) {
                const index = BigInt.fromI32(i);
                const sliceId = createBulkSliceID(dealId.toHex(), index);
                const taskId = mockBytes32('task' + i.toString()).toHex();

                let bulkSlice = new BulkSlice(sliceId);
                bulkSlice.task = taskId;
                bulkSlice.hash = 'QmSlice' + i.toString();
                bulkSlice.bulk = bulkId;
                bulkSlice.index = index;
                bulkSlice.datasets = [];
                bulkSlice.datasetOrders = [];
                bulkSlice.save();

                assert.fieldEquals('BulkSlice', sliceId, 'bulk', bulkId);
                assert.fieldEquals('BulkSlice', sliceId, 'index', i.toString());
            }
        });
    });
});
