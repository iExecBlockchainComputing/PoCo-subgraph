/******************************************************************************
 * Copyright 2020 IEXEC BLOCKCHAIN TECH                                       *
 *                                                                            *
 * Licensed under the Apache License, Version 2.0 (the "License");            *
 * you may not use this file except in compliance with the License.           *
 * You may obtain a copy of the License at                                    *
 *                                                                            *
 *     http://www.apache.org/licenses/LICENSE-2.0                             *
 *                                                                            *
 * Unless required by applicable law or agreed to in writing, software        *
 * distributed under the License is distributed on an "AS IS" BASIS,          *
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.   *
 * See the License for the specific language governing permissions and        *
 * limitations under the License.                                             *
 ******************************************************************************/

import {
	Transfer as TransferEvent,
	Reward   as RewardEvent,
	Seize    as SeizeEvent,
	Lock     as LockEvent,
	Unlock   as UnlockEvent,
} from '../../generated/Core/IexecInterfaceToken'

import {
	Transfer,
	Reward,
	Seize,
	Lock,
	Unlock,
} from '../../generated/schema'

import {
	createEventID,
	fetchAccount,
	logTransaction,
	toRLC,
} from '../utils'

export function handleTransfer(event: TransferEvent): void {
	let value = toRLC(event.params.value)
	let from  = fetchAccount(event.params.from.toHex())
	let to    = fetchAccount(event.params.to.toHex())
	if (from.id != "0x0000000000000000000000000000000000000000") from.balance -= value;
	if (to.id   != "0x0000000000000000000000000000000000000000") to.balance   += value;
	from.save()
	to.save()

	let ev         = new Transfer(createEventID(event))
	ev.transaction = logTransaction(event).id
	ev.timestamp   = event.block.timestamp
	ev.from        = from.id
	ev.to          = to.id
	ev.value       = value
	ev.save()
}

export function handleReward(event: RewardEvent): void {
	let value = toRLC(event.params.amount)

	let op         = new Reward(createEventID(event))
	op.transaction = logTransaction(event).id
	op.timestamp   = event.block.timestamp
	op.account     = event.params.owner.toHex()
	op.value       = value
	op.task        = event.params.ref.toHex()
	op.save()
}

export function handleSeize(event: SeizeEvent): void {
	let value = toRLC(event.params.amount)

	let account = fetchAccount(event.params.owner.toHex())
	account.frozen -= value
	account.save()

	let op         = new Seize(createEventID(event))
	op.transaction = logTransaction(event).id
	op.timestamp   = event.block.timestamp
	op.account     = event.params.owner.toHex()
	op.value       = value
	op.task        = event.params.ref.toHex()
	op.save()
}

export function handleLock(event: LockEvent): void {
	let value = toRLC(event.params.amount)

	let account = fetchAccount(event.params.owner.toHex())
	account.frozen += value
	account.save()

	let op         = new Lock(createEventID(event))
	op.transaction = logTransaction(event).id
	op.timestamp   = event.block.timestamp
	op.account     = event.params.owner.toHex()
	op.value       = value
	op.save()
}

export function handleUnlock(event: UnlockEvent): void {
	let value = toRLC(event.params.amount)

	let account = fetchAccount(event.params.owner.toHex())
	account.frozen -= value
	account.save()

	let op         = new Unlock(createEventID(event))
	op.transaction = logTransaction(event).id
	op.timestamp   = event.block.timestamp
	op.account     = event.params.owner.toHex()
	op.value       = value
	op.save()
}
