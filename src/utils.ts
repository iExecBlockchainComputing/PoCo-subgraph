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

import { Address, BigInt, BigDecimal, ethereum } from "@graphprotocol/graph-ts";

import { Account, Protocol, Task, Transaction } from "../generated/schema";

export function createEventID(event: ethereum.Event): string {
  return event.block.number
    .toString()
    .concat("-")
    .concat(event.logIndex.toString());
}

export function createContributionID(taskid: string, worker: string): string {
  return taskid.concat("-").concat(worker);
}

export function fetchAccount(id: string): Account {
  let account = Account.load(id);
  if (account == null) {
    account = new Account(id);
    account.balance = BigDecimal.fromString("0");
    account.frozen = BigDecimal.fromString("0");
    account.score = BigInt.fromI32(0);
  }
  return account as Account;
}

export function fetchTask(id: string): Task {
  let task = Task.load(id);
  if (task == null) {
    task = new Task(id);
    task.status = "UNSET";
  }
  return task as Task;
}

export function fetchProtocol(): Protocol {
  let protocol = Protocol.load("iExec");
  if (protocol == null) {
    protocol = new Protocol("iExec");
    protocol.categories = BigInt.fromI32(0);
    protocol.apps = BigInt.fromI32(0);
    protocol.datasets = BigInt.fromI32(0);
    protocol.workerpools = BigInt.fromI32(0);
    protocol.deals = BigInt.fromI32(0);
    protocol.tasks = BigInt.fromI32(0);
    protocol.completedTasks = BigInt.fromI32(0);
    protocol.claimedTasks = BigInt.fromI32(0);
  }
  return protocol as Protocol;
}

export function logTransaction(event: ethereum.Event): Transaction {
  let tx = new Transaction(event.transaction.hash.toHex());
  tx.from = fetchAccount(event.transaction.from.toHex()).id;
  const to = event.transaction.to; // may be null
  if (to) {
    tx.to = fetchAccount(to.toHex()).id;
  }
  tx.value = event.transaction.value;
  //   tx.gasUsed = event.transaction.gasUsed; // TODO gasUsed is not accessible from Transaction
  tx.gasPrice = event.transaction.gasPrice;
  tx.timestamp = event.block.timestamp;
  tx.blockNumber = event.block.number;
  tx.save();
  return tx as Transaction;
}

export function toDate(timestamp: BigInt): Date {
  return new Date(timestamp.toI32() * 1000);
}

export function toRLC(value: BigInt): BigDecimal {
  return value.divDecimal(BigDecimal.fromString("1000000000"));
}

export function intToAddress(value: BigInt): Address {
  return Address.fromString(
    value
      .toHex()
      .substr(2)
      .padStart(40, "0")
  ) as Address;
}

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
