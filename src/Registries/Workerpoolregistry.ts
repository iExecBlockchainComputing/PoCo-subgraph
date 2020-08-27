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
	Workerpool as WorkerpoolContract,
} from '../../generated/WorkerpoolRegistry/Workerpool'

import {
	Workerpool as WorkerpoolTemplate,
} from '../../generated/templates'

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

	WorkerpoolTemplate.create(contract._address)
}
