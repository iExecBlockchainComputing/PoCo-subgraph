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

import { log } from '@graphprotocol/graph-ts'

import {
	IexecInterfaceToken  as IexecInterfaceTokenContract,
	OrdersMatched        as OrdersMatchedEvent,
	SchedulerNotice      as SchedulerNoticeEvent,
	TaskInitialize       as TaskInitializeEvent,
	TaskContribute       as TaskContributeEvent,
	TaskConsensus        as TaskConsensusEvent,
	TaskReveal           as TaskRevealEvent,
	TaskReopen           as TaskReopenEvent,
	TaskFinalize         as TaskFinalizeEvent,
	TaskClaimed          as TaskClaimedEvent,
	AccurateContribution as AccurateContributionEvent,
	FaultyContribution   as FaultyContributionEvent,
} from '../../generated/Core/IexecInterfaceToken'

import {
	Account,
	AppOrder,
	DatasetOrder,
	WorkerpoolOrder,
	RequestOrder,
	Deal,
	SchedulerNotice,
	Task,
	Contribution,
	TaskInitialize,
	TaskContribute,
	TaskConsensus,
	TaskReveal,
	TaskReopen,
	TaskFinalize,
	TaskClaimed,
	AccurateContribution,
	FaultyContribution,
} from '../../generated/schema'

import {
	createEventID,
	createContributionID,
	fetchAccount,
	logTransaction,
	toRLC,
} from '../utils'


export function handleOrdersMatched(event: OrdersMatchedEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)
	let deal     = contract.viewDeal(event.params.dealid)

	fetchAccount(deal.requester.toHex()).save()
	fetchAccount(deal.beneficiary.toHex()).save()
	fetchAccount(deal.callback.toHex()).save()

	let d = new Deal(event.params.dealid.toHex())
	d.app                  = deal.app.pointer.toHex()
	d.appOwner             = deal.app.owner.toHex()
	d.appPrice             = toRLC(deal.app.price)
	d.dataset              = deal.dataset.pointer.toHex()
	d.datasetOwner         = deal.dataset.owner.toHex()
	d.datasetPrice         = toRLC(deal.dataset.price)
	d.workerpool           = deal.workerpool.pointer.toHex()
	d.workerpoolOwner      = deal.workerpool.owner.toHex()
	d.workerpoolPrice      = toRLC(deal.workerpool.price)
	d.trust                = deal.trust
	d.category             = deal.category.toString()
	d.tag                  = deal.tag
	d.requester            = deal.requester.toHex()
	d.beneficiary          = deal.beneficiary.toHex()
	d.callback             = deal.callback.toHex()
	d.params               = deal.params
	d.startTime            = deal.startTime
	d.botFirst             = deal.botFirst
	d.botSize              = deal.botSize
	d.workerStake          = deal.workerStake
	d.schedulerRewardRatio = deal.schedulerRewardRatio
	d.apporder             = event.params.appHash.toHex()
	d.datasetorder         = event.params.datasetHash.toHex()
	d.workerpoolorder      = event.params.workerpoolHash.toHex()
	d.requestorder         = event.params.requestHash.toHex()
	d.save()

	let apporder = new AppOrder(event.params.appHash.toHex())
	apporder.app      = d.app
	apporder.appprice = d.appPrice
	apporder.save()

	let datasetorder = new DatasetOrder(event.params.datasetHash.toHex())
	datasetorder.dataset      = d.dataset
	datasetorder.datasetprice = d.datasetPrice
	datasetorder.save()

	let workerpoolorder = new WorkerpoolOrder(event.params.workerpoolHash.toHex())
	workerpoolorder.workerpool      = d.workerpool
	workerpoolorder.workerpoolprice = d.workerpoolPrice
	workerpoolorder.save()

	let requestorder = new RequestOrder(event.params.requestHash.toHex())
	requestorder.requester = deal.requester.toHex()
	requestorder.save()
}

export function handleSchedulerNotice(event: SchedulerNoticeEvent): void {
	let e = new SchedulerNotice(createEventID(event))
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.workerpool  = event.params.workerpool.toHex()
	e.deal        = event.params.dealid.toHex()
	e.save()
}

export function handleTaskInitialize(event: TaskInitializeEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)
	let task     = contract.viewTask(event.params.taskid)

	let t = new Task(event.params.taskid.toHex())
	t.status               = 'ACTIVE'
	t.deal                 = task.dealid.toHex()
	t.index                = task.idx
	t.contributions        = new Array<string>();
	t.contributionDeadline = task.contributionDeadline
	t.finalDeadline        = task.finalDeadline
	t.save()

	let e = new TaskInitialize(createEventID(event));
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.task        = event.params.taskid.toHex()
	e.workerpool  = event.params.workerpool.toHex()
	e.save()
}

export function handleTaskContribute(event: TaskContributeEvent): void {
	let contract     = IexecInterfaceTokenContract.bind(event.address)
	let contribution = contract.viewContribution(event.params.taskid, event.params.worker)

	let c = new Contribution(createContributionID(event.params.taskid.toHex(), event.params.worker.toHex()))
	c.status    = 'CONTRIBUTED'
	c.timestamp = event.block.timestamp.toI32()
	c.task      = event.params.taskid.toHex()
	c.worker    = event.params.worker.toHex()
	c.hash      = contribution.resultHash
	c.seal      = contribution.resultSeal
	c.challenge = contribution.enclaveChallenge
	c.save()

	let t = Task.load(event.params.taskid.toHex())
	let cs = t.contributions
	cs.push(c.id)
	t.contributions = cs
	t.save()

	let e = new TaskContribute(createEventID(event));
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.task        = event.params.taskid.toHex()
	e.worker      = event.params.worker.toHex()
	e.hash        = event.params.hash
	e.save()
}

export function handleTaskConsensus(event: TaskConsensusEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)
	let task     = contract.viewTask(event.params.taskid)

	let t = new Task(event.params.taskid.toHex())
	t.status         = 'REVEALING'
	t.consensus      = task.consensusValue
	t.revealDeadline = task.revealDeadline
	t.save()

	let e = new TaskConsensus(createEventID(event));
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.task        = event.params.taskid.toHex()
	e.consensus   = event.params.consensus
	e.save()
}

export function handleTaskReveal(event: TaskRevealEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)

	let t = new Task(event.params.taskid.toHex())
	t.resultDigest = event.params.digest
	t.save()

	let c = new Contribution(createContributionID(event.params.taskid.toHex(), event.params.worker.toHex()))
	c.status = 'PROVED'
	c.save()

	let e = new TaskReveal(createEventID(event));
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.task        = event.params.taskid.toHex()
	e.worker      = event.params.worker.toHex()
	e.digest      = event.params.digest
	e.save()
}

export function handleTaskReopen(event: TaskReopenEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)

	let t = Task.load(event.params.taskid.toHex())
	let cs = t.contributions;
	for (let i = 0;  i < cs.length; ++i)
	{
		let c = Contribution.load(cs[i]);
		if (c.hash.toHex() == t.consensus.toHex())
		{
			c.status = 'REJECTED'
			c.save()
		}
	}

	// t.contributions
	// .map<Contribution>(value => Contribution.load(value) as Contribution)
	// .filter(contribution => contribution.hash.toHex() == t.consensus.toHex())
	// .forEach(contribution => {
	// 	contribution.status = 'REJECTED'
	// 	contribution.save()
	// })

	t.status         = 'ACTIVE'
	t.consensus      = null
	t.revealDeadline = null
	t.save()

	let e = new TaskReopen(createEventID(event));
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.task        = event.params.taskid.toHex()
	e.save()
}

export function handleTaskFinalize(event: TaskFinalizeEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)

	let t = new Task(event.params.taskid.toHex())
	t.status          = 'COMPLETED'
	t.results         = event.params.results
	t.resultsCallback = contract.viewTask(event.params.taskid).resultsCallback
	t.save()

	let e = new TaskFinalize(createEventID(event));
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.task        = event.params.taskid.toHex()
	e.results     = event.params.results
	e.save()
}

export function handleTaskClaimed(event: TaskClaimedEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)

	let t = new Task(event.params.taskid.toHex())
	t.status = 'FAILLED'
	t.save()

	let e = new TaskClaimed(createEventID(event));
	e.transaction = logTransaction(event).id
	e.timestamp   = event.block.timestamp
	e.task        = event.params.taskid.toHex()
	e.save()
}

export function handleAccurateContribution(event: AccurateContributionEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)

	let e = new AccurateContribution(createEventID(event));
	e.transaction  = logTransaction(event).id
	e.timestamp    = event.block.timestamp
	e.account      = event.params.worker.toHex()
	e.contribution = createContributionID(event.params.taskid.toHex(), event.params.worker.toHex())
	e.score        = contract.viewScore(event.params.worker)
	e.save()

	let w = fetchAccount(event.params.worker.toHex())
	w.score = e.score
	w.save()
}

export function handleFaultyContribution(event: FaultyContributionEvent): void {
	let contract = IexecInterfaceTokenContract.bind(event.address)

	let e = new FaultyContribution(createEventID(event));
	e.transaction  = logTransaction(event).id
	e.timestamp    = event.block.timestamp
	e.account      = event.params.worker.toHex()
	e.contribution = createContributionID(event.params.taskid.toHex(), event.params.worker.toHex())
	e.score        = contract.viewScore(event.params.worker)
	e.save()

	let w = fetchAccount(event.params.worker.toHex())
	w.score = e.score
	w.save()
}
