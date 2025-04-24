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
  Address,
  BigInt,
  BigDecimal,
  ethereum,
  crypto,
  ByteArray,
  Bytes,
} from "@graphprotocol/graph-ts";

import {
  Account,
  AppOrder,
  Contribution,
  DatasetOrder,
  Deal,
  Protocol,
  RequestOrder,
  Task,
  Transaction,
  WorkerpoolOrder,
} from "../generated/schema";

import {
  IexecInterfaceToken__domainResultValue0Struct as IEIP712Domain,
} from "../generated/Core/IexecInterfaceToken";

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
    account.balance = BigDecimal.zero();
    account.frozen = BigDecimal.zero();
    account.score = BigInt.zero();
  }
  return account as Account;
}

export function fetchDeal(id: string): Deal {
  let deal = Deal.load(id);
  if (deal == null) {
    deal = new Deal(id);
    deal.completedTasksCount = BigInt.zero();
    deal.claimedTasksCount = BigInt.zero();
  }
  return deal as Deal;
}

export function fetchTask(id: string): Task {
  let task = Task.load(id);
  if (task == null) {
    task = new Task(id);
    task.status = "UNSET";
  }
  return task as Task;
}

export function fetchApporder(id: string): AppOrder {
  let apporder = AppOrder.load(id);
  if (apporder == null) {
    apporder = new AppOrder(id);
  }
  return apporder as AppOrder;
}

export function fetchDatasetorder(id: string): DatasetOrder {
  let datasetorder = DatasetOrder.load(id);
  if (datasetorder == null) {
    datasetorder = new DatasetOrder(id);
  }
  return datasetorder as DatasetOrder;
}

export function fetchWorkerpoolorder(id: string): WorkerpoolOrder {
  let workerpoolorder = WorkerpoolOrder.load(id);
  if (workerpoolorder == null) {
    workerpoolorder = new WorkerpoolOrder(id);
  }
  return workerpoolorder as WorkerpoolOrder;
}

export function fetchRequestorder(id: string): RequestOrder {
  let requestorder = RequestOrder.load(id);
  if (requestorder == null) {
    requestorder = new RequestOrder(id);
  }
  return requestorder as RequestOrder;
}

export function fetchProtocol(): Protocol {
  let protocol = Protocol.load("iExec");
  if (protocol == null) {
    protocol = new Protocol("iExec");
    protocol.categoriesCount = BigInt.zero();
    protocol.appsCount = BigInt.zero();
    protocol.datasetsCount = BigInt.zero();
    protocol.workerpoolsCount = BigInt.zero();
    protocol.dealsCount = BigInt.zero();
    protocol.tasksCount = BigInt.zero();
    protocol.completedTasksCount = BigInt.zero();
    protocol.claimedTasksCount = BigInt.zero();
    protocol.tvl = BigDecimal.zero();
  }
  return protocol as Protocol;
}

export function fetchTransaction(id: string): Transaction {
  let tx = Transaction.load(id);
  if (tx == null) {
    tx = new Transaction(id);
  }
  return tx as Transaction;
}

export function fetchContribution(id: string): Contribution {
  let contribution = Contribution.load(id);
  if (contribution == null) {
    contribution = new Contribution(id);
  }
  return contribution as Contribution;
}

export function logTransaction(event: ethereum.Event): Transaction {
  let tx = fetchTransaction(event.transaction.hash.toHex());
  tx.from = fetchAccount(event.transaction.from.toHex()).id;
  const to = event.transaction.to; // may be null
  if (to) {
    tx.to = fetchAccount(to.toHex()).id;
  }
  tx.value = event.transaction.value;
  tx.gasUsed = event.transaction.gasLimit; // bugged, keeping for backward compatibility: see https://github.com/graphprotocol/graph-ts/commit/535465263e85f4a14e8217afbe161b22b5ca4a6a
  tx.gasLimit = event.transaction.gasLimit;
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

export function concatByteArrays(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length);
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i];
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j];
  }
  return changetype<ByteArray>(out); // Change from 'as T' to 'changetype<T>'
}

function encodeStringValue(string: string): ethereum.Value {
  return ethereum.Value.fromFixedBytes(
    changetype<Bytes>(crypto.keccak256(ByteArray.fromUTF8(string))) // Change from 'as T' to 'changetype<T>'
  );
}

function hashEIP712(domainHash: ByteArray, structHash: ByteArray): ByteArray {
  return crypto.keccak256(
    concatByteArrays(
      ByteArray.fromHexString("0x1901"),
      concatByteArrays(domainHash, structHash)
    )
  );
}

function hashDomain(domain: IEIP712Domain): ByteArray {
  return crypto.keccak256(
    ethereum.encode(
      ethereum.Value.fromTuple(
        changetype<ethereum.Tuple>([
          encodeStringValue(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
          ),
          encodeStringValue(domain.name),
          encodeStringValue(domain.version),
          ethereum.Value.fromUnsignedBigInt(domain.chainId),
          ethereum.Value.fromAddress(domain.verifyingContract),
        ]) // Change from 'as T' to 'changetype<T>'
      )
    )!
  );
}

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
