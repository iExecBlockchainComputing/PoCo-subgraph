// SPDX-FileCopyrightText: 2024 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { assert, describe, newTypedMockEventWithParams, test } from 'matchstick-as/assembly/index';
import { DealSponsored } from '../../generated/Core/IexecInterfaceToken';
import { handleDealSponsored } from '../../src/Modules';

describe('IexecPoco', () => {
    test('Should handle DealSponsored', () => {
        // Define mock parameters
        const dealId = Bytes.fromHexString(
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        );
        const sponsor = Address.fromString('0xabcdef1234567890abcdef1234567890abcdef12');
        const timestamp = BigInt.fromI32(123456789);

        // Create the mock event
        let mockEvent = newTypedMockEventWithParams<DealSponsored>([
            new ethereum.EventParam('deal', ethereum.Value.fromFixedBytes(dealId)),
            new ethereum.EventParam('sponsor', ethereum.Value.fromAddress(sponsor)),
        ]);
        mockEvent.block.timestamp = timestamp;

        // Call the handler
        handleDealSponsored(mockEvent);

        // Assert that the DealSponsored entity was created and has correct fields
        const entityId = mockEvent.block.number
            .toString()
            .concat('-')
            .concat(mockEvent.logIndex.toString());

        assert.fieldEquals('DealSponsored', entityId, 'deal', dealId.toHex());
        assert.fieldEquals('DealSponsored', entityId, 'sponsor', sponsor.toHex());
        assert.fieldEquals('DealSponsored', entityId, 'timestamp', timestamp.toString());

        // Assert that a transaction was logged (if applicable)
        const transactionId = mockEvent.transaction.hash.toHex();
        assert.fieldEquals('Transaction', transactionId, 'id', transactionId);
    });
});

export { handleDealSponsored };
