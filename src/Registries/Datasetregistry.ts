import {
	Dataset as DatasetContract,
} from '../../generated/DatasetRegistry/Dataset'

import {
	Transfer as TransferEvent,
} from '../../generated/DatasetRegistry/DatasetRegistry'

import {
	Dataset,
	DatasetTransfer,
} from '../../generated/schema'

import {
	createEventID,
	fetchAccount,
	logTransaction,
	intToAddress,
} from '../utils'

export function handleTransferDataset(ev: TransferEvent): void {
	let contract = DatasetContract.bind(intToAddress(ev.params.tokenId))

	let from = fetchAccount(ev.params.from.toHex())
	let to   = fetchAccount(ev.params.to.toHex())
	from.save();
	to.save();

	let dataset = new Dataset(contract._address.toHex())
	dataset.owner     = contract.owner().toHex()
	dataset.name      = contract.m_datasetName()
	dataset.multiaddr = contract.m_datasetMultiaddr()
	dataset.checksum  = contract.m_datasetChecksum()
	dataset.save();

	let transfer = new DatasetTransfer(createEventID(ev))
	transfer.transaction = logTransaction(ev).id
	transfer.timestamp   = ev.block.timestamp
	transfer.dataset     = dataset.id;
	transfer.from        = from.id;
	transfer.to          = to.id;
	transfer.save();

}
