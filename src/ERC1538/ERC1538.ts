import {
	store,
} from "@graphprotocol/graph-ts"

import {
	CommitMessage  as CommitMessageEvent,
	FunctionUpdate as FunctionUpdateEvent,
} from '../../generated/ERC1538/ERC1538'

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
	let oldmodule = new ERC1538Module(event.params.oldDelegate.toHex())
	let newmodule = new ERC1538Module(event.params.newDelegate.toHex())
	oldmodule.save()
	newmodule.save()

	let func    = new ERC1538Function(event.params.functionId.toHex())
	func.module = newmodule.id;
	func.name   = event.params.functionSignature
	func.save()

	let ev         = new ERC1538FunctionUpdate(createEventID(event))
	ev.transaction = logTransaction(event).id
	ev.timestamp   = event.block.timestamp
	ev.functionId  = event.params.functionId.toHex()
	ev.oldmodule   = oldmodule.id
	ev.newmodule   = newmodule.id
	ev.save()
}
