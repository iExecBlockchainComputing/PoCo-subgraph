// SPDX-FileCopyrightText: 2024 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { ethereum } from '@graphprotocol/graph-ts';
import { assert, describe, newTypedMockEventWithParams, test } from 'matchstick-as/assembly/index';
import { CreateCategory } from '../../generated/Core/IexecInterfaceToken';
import { handleCreateCategory } from '../../src/Modules/IexecCategoryManager';

describe('IexecCategoryManager', () => {
    test('Should handle CreateCategory', () => {
        const id = 0;
        const name = 'some-name';
        const description = 'some-description';
        const workClockTimeRef = 1;
        let mockEvent = newTypedMockEventWithParams<CreateCategory>([
            new ethereum.EventParam('id', ethereum.Value.fromI32(id)),
            new ethereum.EventParam('name', ethereum.Value.fromString(name)),
            new ethereum.EventParam('description', ethereum.Value.fromString(description)),
            new ethereum.EventParam('workClockTimeRef', ethereum.Value.fromI32(workClockTimeRef)),
        ]);

        handleCreateCategory(mockEvent);
        assert.fieldEquals('Protocol', 'iExec', 'categoriesCount', '1');
        [
            ['name', name],
            ['description', description],
            ['workClockTimeRef', workClockTimeRef.toString()],
            ['timestamp', '1'],
        ].forEach((fieldNameAndExpectedValue) => {
            const fieldName = fieldNameAndExpectedValue[0];
            const expectedValue = fieldNameAndExpectedValue[1];
            assert.fieldEquals('Category', id.toString(), fieldName, expectedValue);
        });
    });
});
