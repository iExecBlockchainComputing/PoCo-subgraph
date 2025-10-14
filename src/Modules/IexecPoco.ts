// SPDX-FileCopyrightText: 2020-2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import {
    Address,
    BigInt,
    dataSource,
    DataSourceContext,
    DataSourceTemplate,
    json,
} from '@graphprotocol/graph-ts';
const chainName = dataSource.network();

import {
    AccurateContribution as AccurateContributionEvent,
    FaultyContribution as FaultyContributionEvent,
    IexecInterfaceToken as IexecInterfaceTokenContract,
    OrdersMatched as OrdersMatchedEvent,
    SchedulerNotice as SchedulerNoticeEvent,
    TaskClaimed as TaskClaimedEvent,
    TaskConsensus as TaskConsensusEvent,
    TaskContribute as TaskContributeEvent,
    TaskFinalize as TaskFinalizeEvent,
    TaskInitialize as TaskInitializeEvent,
    TaskReopen as TaskReopenEvent,
    TaskReveal as TaskRevealEvent,
} from '../../generated/Core/IexecInterfaceToken';

import {
    AccurateContribution,
    FaultyContribution,
    OrdersMatched,
    SchedulerNotice,
    TaskClaimed,
    TaskConsensus,
    TaskContribute,
    TaskFinalize,
    TaskInitialize,
    TaskReopen,
    TaskReveal,
} from '../../generated/schema';

import {
    CONTEXT_BOT_FIRST,
    CONTEXT_BOT_SIZE,
    CONTEXT_DEAL,
    createContributionID,
    createEventID,
    fetchAccount,
    fetchApporder,
    fetchContribution,
    fetchDatasetorder,
    fetchDeal,
    fetchProtocol,
    fetchRequestorder,
    fetchTask,
    fetchWorkerpoolorder,
    logTransaction,
    toRLC,
} from '../utils';

export function handleOrdersMatched(event: OrdersMatchedEvent): void {
    let contract = IexecInterfaceTokenContract.bind(event.address);
    let viewedDeal = contract.viewDeal(event.params.dealid);
    // The `sponsor` has been introduced on Bellecour for the PoCo v5.5.0 release:
    // https://blockscout.bellecour.iex.ec/tx/0x71b904f526a9be218d35748f57d74ef6da20d12c88f94cfa1ec5ae2de187cb98
    // TODO: Use grafting instead, see https://thegraph.com/docs/en/subgraphs/cookbook/grafting/
    const sponsor =
        chainName == 'bellecour' && event.block.number < BigInt.fromI32(30277938)
            ? Address.zero().toHexString()
            : viewedDeal.sponsor.toHex();
    fetchAccount(viewedDeal.requester.toHex()).save();
    fetchAccount(viewedDeal.beneficiary.toHex()).save();
    fetchAccount(viewedDeal.callback.toHex()).save();
    fetchAccount(sponsor).save();

    let deal = fetchDeal(event.params.dealid.toHex());
    deal.app = viewedDeal.app.pointer.toHex();
    deal.appOwner = viewedDeal.app.owner.toHex();
    deal.appPrice = toRLC(viewedDeal.app.price);
    deal.dataset = viewedDeal.dataset.pointer.toHex();
    deal.datasetOwner = viewedDeal.dataset.owner.toHex();
    deal.datasetPrice = toRLC(viewedDeal.dataset.price);
    deal.workerpool = viewedDeal.workerpool.pointer.toHex();
    deal.workerpoolOwner = viewedDeal.workerpool.owner.toHex();
    deal.workerpoolPrice = toRLC(viewedDeal.workerpool.price);
    deal.trust = viewedDeal.trust;
    deal.category = viewedDeal.category.toString();
    deal.tag = viewedDeal.tag;
    deal.requester = viewedDeal.requester.toHex();
    deal.beneficiary = viewedDeal.beneficiary.toHex();
    deal.callback = viewedDeal.callback.toHex();
    deal.params = viewedDeal.params;
    deal.startTime = viewedDeal.startTime;
    deal.botFirst = viewedDeal.botFirst;
    deal.botSize = viewedDeal.botSize;
    deal.workerStake = viewedDeal.workerStake;
    deal.schedulerRewardRatio = viewedDeal.schedulerRewardRatio;
    deal.sponsor = sponsor;
    deal.apporder = event.params.appHash.toHex();
    deal.datasetorder = event.params.datasetHash.toHex();
    deal.workerpoolorder = event.params.workerpoolHash.toHex();
    deal.requestorder = event.params.requestHash.toHex();
    deal.timestamp = event.block.timestamp;
    deal.save();

    // if no dataset, check if params include a bulk_cid reference
    if (deal.dataset == Address.zero().toHex()) {
        const params = json.try_fromString(viewedDeal.params);
        if (params.isOk) {
            const bulkCid = params.value.toObject().getEntry('bulk_cid');
            if (bulkCid) {
                // the same bulk may be used by many deals => we use dealid as bulk ID to avoid collisions
                const bulkId = event.params.dealid.toHex();
                let context = new DataSourceContext();
                // Pass onchain data that will be needed in file handlers
                context.setString(CONTEXT_DEAL, deal.id);
                context.setBigInt(CONTEXT_BOT_FIRST, deal.botFirst);
                context.setBigInt(CONTEXT_BOT_SIZE, deal.botSize);
                DataSourceTemplate.createWithContext('Bulk', [bulkCid.value.toString()], context);
                // bulk may not be indexed, this is not an issue, the model will prune it
                deal.bulk = bulkId;
                deal.save();
            }
        }
    }

    const dataset = deal.dataset;

    let apporder = fetchApporder(event.params.appHash.toHex());
    apporder.app = deal.app;
    apporder.appprice = deal.appPrice;
    apporder.save();

    if (dataset != Address.zero().toHex()) {
        let datasetorder = fetchDatasetorder(event.params.datasetHash.toHex());
        if (dataset) datasetorder.dataset = dataset;
        datasetorder.datasetprice = deal.datasetPrice;
        datasetorder.save();
    }

    let workerpoolorder = fetchWorkerpoolorder(event.params.workerpoolHash.toHex());
    workerpoolorder.workerpool = deal.workerpool;
    workerpoolorder.workerpoolprice = deal.workerpoolPrice;
    workerpoolorder.save();

    let requestorder = fetchRequestorder(event.params.requestHash.toHex());
    requestorder.requester = viewedDeal.requester.toHex();
    requestorder.save();

    let orderMatchedEvent = new OrdersMatched(createEventID(event));
    orderMatchedEvent.transaction = logTransaction(event).id;
    orderMatchedEvent.timestamp = event.block.timestamp;
    orderMatchedEvent.deal = event.params.dealid.toHex();
    orderMatchedEvent.save();

    let protocol = fetchProtocol();
    protocol.dealsCount = protocol.dealsCount.plus(BigInt.fromI32(1));
    protocol.tasksCount = protocol.tasksCount.plus(deal.botSize);
    protocol.save();
}

export function handleSchedulerNotice(event: SchedulerNoticeEvent): void {
    let schedulerNoticeEvent = new SchedulerNotice(createEventID(event));
    schedulerNoticeEvent.transaction = logTransaction(event).id;
    schedulerNoticeEvent.timestamp = event.block.timestamp;
    schedulerNoticeEvent.workerpool = event.params.workerpool.toHex();
    schedulerNoticeEvent.deal = event.params.dealid.toHex();
    schedulerNoticeEvent.save();
}

export function handleTaskInitialize(event: TaskInitializeEvent): void {
    let contract = IexecInterfaceTokenContract.bind(event.address);
    let viewedTask = contract.viewTask(event.params.taskid);

    let task = fetchTask(event.params.taskid.toHex());
    let loadedDeal = fetchDeal(viewedTask.dealid.toHex());
    if (loadedDeal) {
        task.deal = loadedDeal.id;
        task.requester = loadedDeal.requester;
    }
    task.status = 'ACTIVE';
    task.index = viewedTask.idx;
    task.contributions = new Array<string>();
    task.contributionDeadline = viewedTask.contributionDeadline;
    task.finalDeadline = viewedTask.finalDeadline;
    task.timestamp = event.block.timestamp;
    task.save();

    let initializeEvent = new TaskInitialize(createEventID(event));
    initializeEvent.transaction = logTransaction(event).id;
    initializeEvent.timestamp = event.block.timestamp;
    initializeEvent.task = event.params.taskid.toHex();
    initializeEvent.workerpool = event.params.workerpool.toHex();
    initializeEvent.save();
}

export function handleTaskContribute(event: TaskContributeEvent): void {
    let contract = IexecInterfaceTokenContract.bind(event.address);
    let viewedContribution = contract.viewContribution(event.params.taskid, event.params.worker);

    let contribution = fetchContribution(
        createContributionID(event.params.taskid.toHex(), event.params.worker.toHex()),
    );
    contribution.status = 'CONTRIBUTED';
    contribution.timestamp = event.block.timestamp.toI32();
    contribution.task = event.params.taskid.toHex();
    contribution.worker = event.params.worker.toHex();
    contribution.hash = viewedContribution.resultHash;
    contribution.seal = viewedContribution.resultSeal;
    contribution.challenge = viewedContribution.enclaveChallenge;
    contribution.save();

    let task = fetchTask(event.params.taskid.toHex());
    const contributions = task.contributions;
    contributions.push(contribution.id);
    task.contributions = contributions;
    task.timestamp = event.block.timestamp;
    task.save();

    let contributeEvent = new TaskContribute(createEventID(event));
    contributeEvent.transaction = logTransaction(event).id;
    contributeEvent.timestamp = event.block.timestamp;
    contributeEvent.task = event.params.taskid.toHex();
    contributeEvent.worker = event.params.worker.toHex();
    contributeEvent.hash = event.params.hash;
    contributeEvent.save();
}

export function handleTaskConsensus(event: TaskConsensusEvent): void {
    let contract = IexecInterfaceTokenContract.bind(event.address);
    let viewedTask = contract.viewTask(event.params.taskid);

    let task = fetchTask(event.params.taskid.toHex());
    task.status = 'REVEALING';
    task.consensus = viewedTask.consensusValue;
    task.revealDeadline = viewedTask.revealDeadline;
    task.timestamp = event.block.timestamp;
    task.save();

    let consensusEvent = new TaskConsensus(createEventID(event));
    consensusEvent.transaction = logTransaction(event).id;
    consensusEvent.timestamp = event.block.timestamp;
    consensusEvent.task = event.params.taskid.toHex();
    consensusEvent.consensus = event.params.consensus;
    consensusEvent.save();
}

export function handleTaskReveal(event: TaskRevealEvent): void {
    //   let contract = IexecInterfaceTokenContract.bind(event.address);

    let task = fetchTask(event.params.taskid.toHex());
    task.status = 'REVEALING';
    task.resultDigest = event.params.digest;
    task.timestamp = event.block.timestamp;
    task.save();

    let contribution = fetchContribution(
        createContributionID(event.params.taskid.toHex(), event.params.worker.toHex()),
    );
    contribution.status = 'PROVED';
    contribution.save();

    let revealEvent = new TaskReveal(createEventID(event));
    revealEvent.transaction = logTransaction(event).id;
    revealEvent.timestamp = event.block.timestamp;
    revealEvent.task = event.params.taskid.toHex();
    revealEvent.worker = event.params.worker.toHex();
    revealEvent.digest = event.params.digest;
    revealEvent.save();
}

export function handleTaskReopen(event: TaskReopenEvent): void {
    //   let contract = IexecInterfaceTokenContract.bind(event.address);

    let task = fetchTask(event.params.taskid.toHex());
    let contributions = task.contributions;
    task.status = 'ACTIVE';
    task.consensus = null;
    task.revealDeadline = null;
    task.timestamp = event.block.timestamp;
    task.save();
    for (let i = 0; i < contributions.length; ++i) {
        let loadedContribution = fetchContribution(contributions[i]);
        const consensus = task.consensus;
        if (
            loadedContribution &&
            consensus &&
            loadedContribution.hash.toHex() == consensus.toHex()
        ) {
            loadedContribution.status = 'REJECTED';
            loadedContribution.save();
        }
    }

    let reopenEvent = new TaskReopen(createEventID(event));
    reopenEvent.transaction = logTransaction(event).id;
    reopenEvent.timestamp = event.block.timestamp;
    reopenEvent.task = event.params.taskid.toHex();
    reopenEvent.save();
}

export function handleTaskFinalize(event: TaskFinalizeEvent): void {
    let contract = IexecInterfaceTokenContract.bind(event.address);

    let task = fetchTask(event.params.taskid.toHex());
    task.status = 'COMPLETED';
    task.results = event.params.results.toHexString();
    task.resultsCallback = contract.viewTask(event.params.taskid).resultsCallback.toHexString();
    task.timestamp = event.block.timestamp;
    task.save();

    let finalizeEvent = new TaskFinalize(createEventID(event));
    finalizeEvent.transaction = logTransaction(event).id;
    finalizeEvent.timestamp = event.block.timestamp;
    finalizeEvent.task = event.params.taskid.toHex();
    finalizeEvent.results = event.params.results;
    finalizeEvent.save();

    let deal = fetchDeal(task.deal);
    deal.completedTasksCount = deal.completedTasksCount.plus(BigInt.fromI32(1));
    deal.save();

    let protocol = fetchProtocol();
    protocol.completedTasksCount = protocol.completedTasksCount.plus(BigInt.fromI32(1));
    protocol.save();
}

export function handleTaskClaimed(event: TaskClaimedEvent): void {
    //   let contract = IexecInterfaceTokenContract.bind(event.address);

    let task = fetchTask(event.params.taskid.toHex());

    task.status = 'FAILLED';
    task.timestamp = event.block.timestamp;
    task.save();

    let claimedEvent = new TaskClaimed(createEventID(event));
    claimedEvent.transaction = logTransaction(event).id;
    claimedEvent.timestamp = event.block.timestamp;
    claimedEvent.task = event.params.taskid.toHex();
    claimedEvent.save();

    let deal = fetchDeal(task.deal);
    deal.claimedTasksCount = deal.claimedTasksCount.plus(BigInt.fromI32(1));
    deal.save();

    let protocol = fetchProtocol();
    protocol.claimedTasksCount = protocol.claimedTasksCount.plus(BigInt.fromI32(1));
    protocol.save();
}

export function handleAccurateContribution(event: AccurateContributionEvent): void {
    let contract = IexecInterfaceTokenContract.bind(event.address);

    let accurateContributionEvent = new AccurateContribution(createEventID(event));
    accurateContributionEvent.transaction = logTransaction(event).id;
    accurateContributionEvent.timestamp = event.block.timestamp;
    accurateContributionEvent.account = event.params.worker.toHex();
    accurateContributionEvent.contribution = createContributionID(
        event.params.taskid.toHex(),
        event.params.worker.toHex(),
    );
    accurateContributionEvent.score = contract.viewScore(event.params.worker);
    accurateContributionEvent.save();

    let workerAccount = fetchAccount(event.params.worker.toHex());
    workerAccount.score = accurateContributionEvent.score;
    workerAccount.save();
}

export function handleFaultyContribution(event: FaultyContributionEvent): void {
    let contract = IexecInterfaceTokenContract.bind(event.address);

    let faultyContributionEvent = new FaultyContribution(createEventID(event));
    faultyContributionEvent.transaction = logTransaction(event).id;
    faultyContributionEvent.timestamp = event.block.timestamp;
    faultyContributionEvent.account = event.params.worker.toHex();
    faultyContributionEvent.contribution = createContributionID(
        event.params.taskid.toHex(),
        event.params.worker.toHex(),
    );
    faultyContributionEvent.score = contract.viewScore(event.params.worker);
    faultyContributionEvent.save();

    let workerAccount = fetchAccount(event.params.worker.toHex());
    workerAccount.score = faultyContributionEvent.score;
    workerAccount.save();
}
