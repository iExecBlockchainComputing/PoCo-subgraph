// SPDX-FileCopyrightText: 2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { BigInt } from '@graphprotocol/graph-ts';
import { assert, beforeEach, clearStore, describe, test } from 'matchstick-as/assembly/index';
import { Bulk, BulkSlice } from '../../generated/schema';
import {
    computeTaskId,
    createBulkOrderID,
    createBulkSliceID,
    fetchBulk,
    fetchBulkSlice,
    isAddressString,
    isBytes32String,
    isHexString,
    isIntegerString,
} from '../../src/utils';
import { mockAddress, mockBytes32 } from './utils/mock';

describe('Utils - Validation Functions', () => {
    test('isIntegerString should validate integer strings correctly', () => {
        // --- GIVEN
        // Valid integer strings
        const validIntegers = ['123', '1000000000', '0'];
        // Invalid integer strings
        const invalidIntegers = ['', '01', 'abc', '123abc'];

        // --- WHEN / THEN
        // Valid strings should pass validation
        assert.assertTrue(isIntegerString(validIntegers[0]));
        assert.assertTrue(isIntegerString(validIntegers[1]));
        assert.assertTrue(isIntegerString(validIntegers[2]));

        // Invalid strings should fail validation
        assert.assertTrue(!isIntegerString(invalidIntegers[0])); // Empty string
        assert.assertTrue(!isIntegerString(invalidIntegers[1])); // Leading zero
        assert.assertTrue(!isIntegerString(invalidIntegers[2])); // Alphabetic
        assert.assertTrue(!isIntegerString(invalidIntegers[3])); // Mixed
    });

    test('isHexString should validate hex strings correctly', () => {
        // --- GIVEN
        // Valid hex strings (lowercase only)
        const validHex = ['0x1234', '0xabcdef', '0x'];
        // Invalid hex strings
        const invalidHex = ['0xABCDEF', '1234', '0xgg'];

        // --- WHEN / THEN
        // Valid hex strings should pass
        assert.assertTrue(isHexString(validHex[0]));
        assert.assertTrue(isHexString(validHex[1]));
        assert.assertTrue(isHexString(validHex[2])); // Empty hex string is valid

        // Invalid hex strings should fail
        assert.assertTrue(!isHexString(invalidHex[0])); // Uppercase not accepted
        assert.assertTrue(!isHexString(invalidHex[1])); // Missing 0x prefix
        assert.assertTrue(!isHexString(invalidHex[2])); // Invalid hex char
    });

    test('isAddressString should validate address strings correctly', () => {
        // --- GIVEN
        const validAddress = mockAddress('test').toHex().toLowerCase();
        const tooShortAddress = '0x123';
        const invalidAddress = 'not-an-address';

        // --- WHEN / THEN
        assert.assertTrue(isAddressString(validAddress));
        assert.assertTrue(!isAddressString(tooShortAddress)); // Too short
        assert.assertTrue(!isAddressString(invalidAddress)); // Invalid format
    });

    test('isBytes32String should validate bytes32 strings correctly', () => {
        // --- GIVEN
        const validBytes32 = mockBytes32('test').toHex();
        const tooShort = '0x1234';
        const invalid = 'not-bytes32';

        // --- WHEN / THEN
        assert.assertTrue(isBytes32String(validBytes32));
        assert.assertTrue(!isBytes32String(tooShort)); // Too short
        assert.assertTrue(!isBytes32String(invalid)); // Invalid format
    });
});

describe('Utils - ID Creation Functions', () => {
    test('createBulkSliceID should create correct ID', () => {
        // --- GIVEN
        const dealId = mockBytes32('dealId').toHex();
        const index = BigInt.fromI32(5);
        const expectedId = dealId.concat('-').concat('5');

        // --- WHEN
        const actualId = createBulkSliceID(dealId, index);

        // --- THEN
        assert.stringEquals(expectedId, actualId);
    });

    test('createBulkOrderID should create correct ID', () => {
        // --- GIVEN
        const taskId = mockBytes32('task').toHex();
        const orderIndex = BigInt.fromI32(3);
        const expectedId = taskId.concat('-').concat('3');

        // --- WHEN
        const actualId = createBulkOrderID(taskId, orderIndex);

        // --- THEN
        assert.stringEquals(expectedId, actualId);
    });
});

describe('Utils - Task ID Computation', () => {
    test('computeTaskId should compute correct task ID from dealId and index', () => {
        // --- GIVEN
        const dealId = mockBytes32('dealId').toHex();
        const index = BigInt.fromI32(0);

        // --- WHEN
        const taskId = computeTaskId(dealId, index);

        // --- THEN
        assert.assertTrue(taskId !== null);
        if (taskId !== null) {
            // Task ID should be a valid bytes32 hex string
            assert.assertTrue(isBytes32String(taskId));
            // Task ID should be deterministic (same inputs = same output)
            const taskId2 = computeTaskId(dealId, index);
            assert.stringEquals(taskId, taskId2!);
        }
    });

    test('computeTaskId should return different IDs for different indices', () => {
        // --- GIVEN
        const dealId = mockBytes32('dealId').toHex();
        const index1 = BigInt.fromI32(0);
        const index2 = BigInt.fromI32(1);

        // --- WHEN
        const taskId1 = computeTaskId(dealId, index1);
        const taskId2 = computeTaskId(dealId, index2);

        // --- THEN
        assert.assertTrue(taskId1 !== null);
        assert.assertTrue(taskId2 !== null);
        if (taskId1 !== null && taskId2 !== null) {
            assert.assertTrue(taskId1 != taskId2);
        }
    });

    test('computeTaskId should return different IDs for different dealIds', () => {
        // --- GIVEN
        const dealId1 = mockBytes32('deal1').toHex();
        const dealId2 = mockBytes32('deal2').toHex();
        const index = BigInt.fromI32(0);

        // --- WHEN
        const taskId1 = computeTaskId(dealId1, index);
        const taskId2 = computeTaskId(dealId2, index);

        // --- THEN
        assert.assertTrue(taskId1 !== null);
        assert.assertTrue(taskId2 !== null);
        if (taskId1 !== null && taskId2 !== null) {
            assert.assertTrue(taskId1 != taskId2);
        }
    });
});

describe('Utils - Fetch Functions', () => {
    beforeEach(() => {
        clearStore();
    });

    test('fetchBulk should create new Bulk if not exists', () => {
        // --- GIVEN
        const bulkId = mockBytes32('bulk').toHex();
        // Ensure it doesn't exist
        let bulk = Bulk.load(bulkId);
        assert.assertTrue(bulk == null);

        // --- WHEN
        bulk = fetchBulk(bulkId);

        // --- THEN
        assert.stringEquals(bulk.id, bulkId);
    });

    test('fetchBulk should return existing Bulk if already exists', () => {
        // --- GIVEN
        const bulkId = mockBytes32('bulk').toHex();
        const hash = 'QmExistingHash';
        // Create and save bulk
        let bulk = new Bulk(bulkId);
        bulk.hash = hash;
        bulk.save();

        // --- WHEN
        let fetchedBulk = fetchBulk(bulkId);

        // --- THEN
        assert.assertTrue(fetchedBulk !== null);
        assert.stringEquals(fetchedBulk.id, bulkId);
        assert.stringEquals(fetchedBulk.hash, hash);
    });

    test('fetchBulkSlice should create new BulkSlice if not exists', () => {
        // --- GIVEN
        const dealId = mockBytes32('deal').toHex();
        const index = BigInt.fromI32(0);
        const bulkSliceId = createBulkSliceID(dealId, index);
        // Ensure it doesn't exist
        let bulkSlice = BulkSlice.load(bulkSliceId);
        assert.assertTrue(bulkSlice == null);

        // --- WHEN
        bulkSlice = fetchBulkSlice(bulkSliceId);

        // --- THEN
        assert.assertTrue(bulkSlice !== null);
        assert.stringEquals(bulkSlice.id, bulkSliceId);
    });

    test('fetchBulkSlice should return existing BulkSlice if already exists', () => {
        // --- GIVEN
        const dealId = mockBytes32('deal').toHex();
        const index = BigInt.fromI32(0);
        const bulkSliceId = createBulkSliceID(dealId, index);
        const taskId = mockBytes32('task').toHex();
        const hash = 'QmExistingSliceHash';
        // Create and save bulkSlice
        let bulkSlice = new BulkSlice(bulkSliceId);
        bulkSlice.task = taskId;
        bulkSlice.hash = hash;
        bulkSlice.bulk = dealId;
        bulkSlice.index = index;
        bulkSlice.datasets = [];
        bulkSlice.datasetOrders = [];
        bulkSlice.save();

        // --- WHEN
        let fetchedBulkSlice = fetchBulkSlice(bulkSliceId);

        // --- THEN
        assert.assertTrue(fetchedBulkSlice !== null);
        assert.stringEquals(fetchedBulkSlice.id, bulkSliceId);
        assert.stringEquals(fetchedBulkSlice.hash, hash);
        let fetchedTask = fetchedBulkSlice.task;
        if (fetchedTask !== null) {
            assert.stringEquals(fetchedTask, taskId);
        }
    });
});
