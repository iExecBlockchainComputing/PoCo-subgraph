import {
	CommitMessage  as CommitMessageEvent,
	FunctionUpdate as FunctionUpdateEvent,
} from '../../generated/ERC1538Proxy/ERC1538Proxy'

import {
	ERC1538Module,
	ERC1538Function,
	ERC1538FunctionUpdate,
	ERC1538CommitMessage,
} from '../../generated/schema'

import {
	createEventID,
	logTransaction,
} from '../utils'

export function handleCommitMessage(event: CommitMessageEvent): void {
	let ev         = new ERC1538CommitMessage(createEventID(event))
	ev.transaction = logTransaction(event).id
	ev.timestamp   = event.block.timestamp
	ev.message     = event.params.message
	ev.save()
}

export function handleFunctionUpdate(event: FunctionUpdateEvent): void {
	let module     = new ERC1538Module(event.params.newDelegate.toHex())
	module.save()

	let func       = new ERC1538Function(event.params.functionId.toHex())
	func.name      = event.params.functionSignature
	func.module    = module.id;
	func.save()

	let ev         = new ERC1538FunctionUpdate(createEventID(event))
	ev.transaction = logTransaction(event).id
	ev.timestamp   = event.block.timestamp
	ev.func        = func.id
	ev.module      = module.id
	ev.save()
}
