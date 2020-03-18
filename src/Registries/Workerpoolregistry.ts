import {
	Workerpool as WorkerpoolContract,
} from '../../generated/WorkerpoolRegistry/Workerpool'

import {
	Transfer as TransferEvent,
} from '../../generated/WorkerpoolRegistry/WorkerpoolRegistry'

import {
	Workerpool,
	WorkerpoolTransfer,
} from '../../generated/schema'

import {
	createEventID,
	fetchAccount,
	logTransaction,
	intToAddress,
} from '../utils'

export function handleTransferWorkerpool(ev: TransferEvent): void {
	let contract = WorkerpoolContract.bind(intToAddress(ev.params.tokenId))

	let from = fetchAccount(ev.params.from.toHex())
	let to   = fetchAccount(ev.params.to.toHex())
	from.save();
	to.save();

	let workerpool = new Workerpool(contract._address.toHex())
	workerpool.owner                = contract.owner().toHex()
	workerpool.description          = contract.m_workerpoolDescription()
	workerpool.workerStakeRatio     = contract.m_workerStakeRatioPolicy()
	workerpool.schedulerRewardRatio = contract.m_schedulerRewardRatioPolicy()
	workerpool.save();

	let transfer = new WorkerpoolTransfer(createEventID(ev))
	transfer.transaction = logTransaction(ev).id
	transfer.timestamp   = ev.block.timestamp
	transfer.workerpool  = workerpool.id;
	transfer.from        = from.id;
	transfer.to          = to.id;
	transfer.save();

	// WorkerpoolTemplate.create(contract._address)
}
