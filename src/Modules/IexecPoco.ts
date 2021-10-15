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

import { log, BigInt } from "@graphprotocol/graph-ts";

import {
  IexecInterfaceToken as IexecInterfaceTokenContract,
  OrdersMatched as OrdersMatchedEvent,
  SchedulerNotice as SchedulerNoticeEvent,
  TaskInitialize as TaskInitializeEvent,
  TaskContribute as TaskContributeEvent,
  TaskConsensus as TaskConsensusEvent,
  TaskReveal as TaskRevealEvent,
  TaskReopen as TaskReopenEvent,
  TaskFinalize as TaskFinalizeEvent,
  TaskClaimed as TaskClaimedEvent,
  AccurateContribution as AccurateContributionEvent,
  FaultyContribution as FaultyContributionEvent,
} from "../../generated/Core/IexecInterfaceToken";

import {
  //   Account,
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
} from "../../generated/schema";

import {
  createEventID,
  createContributionID,
  fetchAccount,
  fetchProtocol,
  logTransaction,
  toRLC,
} from "../utils";

export function handleOrdersMatched(event: OrdersMatchedEvent): void {
  let contract = IexecInterfaceTokenContract.bind(event.address);
  let viewedDeal = contract.viewDeal(event.params.dealid);

  fetchAccount(viewedDeal.requester.toHex()).save();
  fetchAccount(viewedDeal.beneficiary.toHex()).save();
  fetchAccount(viewedDeal.callback.toHex()).save();

  let deal = new Deal(event.params.dealid.toHex());
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
  deal.apporder = event.params.appHash.toHex();
  deal.datasetorder = event.params.datasetHash.toHex();
  deal.workerpoolorder = event.params.workerpoolHash.toHex();
  deal.requestorder = event.params.requestHash.toHex();
  deal.timestamp = event.block.timestamp;
  deal.save();

  const dataset = deal.dataset;

  let apporder = new AppOrder(event.params.appHash.toHex());
  apporder.app = deal.app;
  apporder.appprice = deal.appPrice;
  apporder.save();

  let datasetorder = new DatasetOrder(event.params.datasetHash.toHex());
  if (dataset) datasetorder.dataset = dataset;
  datasetorder.datasetprice = deal.datasetPrice;
  datasetorder.save();

  let workerpoolorder = new WorkerpoolOrder(
    event.params.workerpoolHash.toHex()
  );
  workerpoolorder.workerpool = deal.workerpool;
  workerpoolorder.workerpoolprice = deal.workerpoolPrice;
  workerpoolorder.save();

  let requestorder = new RequestOrder(event.params.requestHash.toHex());
  requestorder.requester = viewedDeal.requester.toHex();
  requestorder.save();

  let protocol = fetchProtocol();
  protocol.deals = protocol.deals.plus(BigInt.fromI32(1));
  protocol.tasks = protocol.tasks.plus(deal.botSize);
  protocol.save();
}

export function handleSchedulerNotice(event: SchedulerNoticeEvent): void {
  let schedulerNoticeEent = new SchedulerNotice(createEventID(event));
  schedulerNoticeEent.transaction = logTransaction(event).id;
  schedulerNoticeEent.timestamp = event.block.timestamp;
  schedulerNoticeEent.workerpool = event.params.workerpool.toHex();
  schedulerNoticeEent.deal = event.params.dealid.toHex();
  schedulerNoticeEent.save();
}

export function handleTaskInitialize(event: TaskInitializeEvent): void {
  let contract = IexecInterfaceTokenContract.bind(event.address);
  let viewedTask = contract.viewTask(event.params.taskid);

  let deal = Deal.load(viewedTask.dealid.toHex());

  let task = new Task(event.params.taskid.toHex());
  if (deal) {
    task.deal = deal.id;
    task.requester = deal.requester;
  }
  task.status = "ACTIVE";
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
  let viewedContribution = contract.viewContribution(
    event.params.taskid,
    event.params.worker
  );

  let contribution = new Contribution(
    createContributionID(
      event.params.taskid.toHex(),
      event.params.worker.toHex()
    )
  );
  contribution.status = "CONTRIBUTED";
  contribution.timestamp = event.block.timestamp.toI32();
  contribution.task = event.params.taskid.toHex();
  contribution.worker = event.params.worker.toHex();
  contribution.hash = viewedContribution.resultHash;
  contribution.seal = viewedContribution.resultSeal;
  contribution.challenge = viewedContribution.enclaveChallenge;
  contribution.save();

  let loadedTask = Task.load(event.params.taskid.toHex());
  if (loadedTask) {
    const contributions = loadedTask.contributions;
    contributions.push(contribution.id);
    loadedTask.contributions = contributions;
    loadedTask.timestamp = event.block.timestamp;
    loadedTask.save();
  }

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

  let task = new Task(event.params.taskid.toHex());
  task.status = "REVEALING";
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

  let task = new Task(event.params.taskid.toHex());
  task.resultDigest = event.params.digest;
  task.timestamp = event.block.timestamp;
  task.save();

  let contribution = new Contribution(
    createContributionID(
      event.params.taskid.toHex(),
      event.params.worker.toHex()
    )
  );
  contribution.status = "PROVED";
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

  let loadedTask = Task.load(event.params.taskid.toHex());
  let contributions: string[] = [];
  if (loadedTask) {
    contributions = loadedTask.contributions;
    loadedTask.status = "ACTIVE";
    loadedTask.consensus = null;
    loadedTask.revealDeadline = null;
    loadedTask.timestamp = event.block.timestamp;
    loadedTask.save();
    for (let i = 0; i < contributions.length; ++i) {
      let loadedContribution = Contribution.load(contributions[i]);
      const consensus = loadedTask.consensus;
      if (
        loadedContribution &&
        consensus &&
        loadedContribution.hash.toHex() == consensus.toHex()
      ) {
        loadedContribution.status = "REJECTED";
        loadedContribution.save();
      }
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

  let task = new Task(event.params.taskid.toHex());
  task.status = "COMPLETED";
  task.results = event.params.results;
  task.resultsCallback = contract.viewTask(event.params.taskid).resultsCallback;
  task.timestamp = event.block.timestamp;
  task.save();

  let finalizeEvent = new TaskFinalize(createEventID(event));
  finalizeEvent.transaction = logTransaction(event).id;
  finalizeEvent.timestamp = event.block.timestamp;
  finalizeEvent.task = event.params.taskid.toHex();
  finalizeEvent.results = event.params.results;
  finalizeEvent.save();

  let protocol = fetchProtocol();
  protocol.completedTasks = protocol.completedTasks.plus(BigInt.fromI32(1));
  protocol.save();
}

export function handleTaskClaimed(event: TaskClaimedEvent): void {
  //   let contract = IexecInterfaceTokenContract.bind(event.address);

  let task = new Task(event.params.taskid.toHex());
  task.status = "FAILLED";
  task.timestamp = event.block.timestamp;
  task.save();

  let claimedEvent = new TaskClaimed(createEventID(event));
  claimedEvent.transaction = logTransaction(event).id;
  claimedEvent.timestamp = event.block.timestamp;
  claimedEvent.task = event.params.taskid.toHex();
  claimedEvent.save();

  let protocol = fetchProtocol();
  protocol.claimedTasks = protocol.claimedTasks.plus(BigInt.fromI32(1));
  protocol.save();
}

export function handleAccurateContribution(
  event: AccurateContributionEvent
): void {
  let contract = IexecInterfaceTokenContract.bind(event.address);

  let accurateContributionEvent = new AccurateContribution(
    createEventID(event)
  );
  accurateContributionEvent.transaction = logTransaction(event).id;
  accurateContributionEvent.timestamp = event.block.timestamp;
  accurateContributionEvent.account = event.params.worker.toHex();
  accurateContributionEvent.contribution = createContributionID(
    event.params.taskid.toHex(),
    event.params.worker.toHex()
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
    event.params.worker.toHex()
  );
  faultyContributionEvent.score = contract.viewScore(event.params.worker);
  faultyContributionEvent.save();

  let workerAccount = fetchAccount(event.params.worker.toHex());
  workerAccount.score = faultyContributionEvent.score;
  workerAccount.save();
}
