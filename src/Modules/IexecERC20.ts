import {
	Transfer as TransferEvent,
	Reward   as RewardEvent,
	Seize    as SeizeEvent,
	Lock     as LockEvent,
	Unlock   as UnlockEvent,
} from '../../generated/Core/IexecInterfaceTokenABILegacy'

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
	if (from.id != "0x0000000000000000000000000000000000000000") from.balance += value;
	if (to.id   != "0x0000000000000000000000000000000000000000") to.balance   -= value;
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

	let account = fetchAccount(event.params.owner.toHex())
	account.balance += value
	account.save()

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
	account.balance -= value
	account.frozen  += value
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
	account.balance += value
	account.frozen  -= value
	account.save()

	let op         = new Unlock(createEventID(event))
	op.transaction = logTransaction(event).id
	op.timestamp   = event.block.timestamp
	op.account     = event.params.owner.toHex()
	op.value       = value
	op.save()
}
