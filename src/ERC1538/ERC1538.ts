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
