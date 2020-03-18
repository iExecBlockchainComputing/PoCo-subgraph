import {
	App as AppContract,
} from '../../generated/AppRegistry/App'

import {
	Transfer as TransferEvent,
} from '../../generated/AppRegistry/AppRegistry'

import {
	App,
	AppTransfer,
} from '../../generated/schema'

import {
	createEventID,
	fetchAccount,
	logTransaction,
	intToAddress,
} from '../utils'

export function handleTransferApp(ev: TransferEvent): void {
	let contract = AppContract.bind(intToAddress(ev.params.tokenId))

	let from = fetchAccount(ev.params.from.toHex())
	let to   = fetchAccount(ev.params.to.toHex())
	from.save();
	to.save();

	let app = new App(contract._address.toHex())
	app.owner     = contract.owner().toHex()
	app.name      = contract.m_appName()
	app.type      = contract.m_appType()
	app.multiaddr = contract.m_appMultiaddr()
	app.checksum  = contract.m_appChecksum()
	app.mrenclave = contract.m_appMREnclave()
	app.save();

	let transfer = new AppTransfer(createEventID(ev))
	transfer.transaction = logTransaction(ev).id
	transfer.timestamp   = ev.block.timestamp
	transfer.app         = app.id;
	transfer.from        = from.id;
	transfer.to          = to.id;
	transfer.save();

}
