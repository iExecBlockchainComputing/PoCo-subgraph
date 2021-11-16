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

import { BigInt } from "@graphprotocol/graph-ts";

import { Dataset as DatasetContract } from "../../generated/DatasetRegistry/Dataset";

import { Transfer as TransferEvent } from "../../generated/DatasetRegistry/DatasetRegistry";

import { Dataset, DatasetTransfer } from "../../generated/schema";

import {
  createEventID,
  fetchAccount,
  fetchProtocol,
  logTransaction,
  intToAddress,
  ADDRESS_ZERO,
} from "../utils";

export function handleTransferDataset(ev: TransferEvent): void {
  let contract = DatasetContract.bind(intToAddress(ev.params.tokenId));

  let from = fetchAccount(ev.params.from.toHex());
  let to = fetchAccount(ev.params.to.toHex());
  from.save();
  to.save();

  let dataset = new Dataset(contract._address.toHex());
  dataset.owner = contract.owner().toHex();
  dataset.name = contract.m_datasetName();
  dataset.multiaddr = contract.m_datasetMultiaddr();
  dataset.checksum = contract.m_datasetChecksum();
  dataset.timestamp = ev.block.timestamp;
  dataset.save();

  let transfer = new DatasetTransfer(createEventID(ev));
  transfer.transaction = logTransaction(ev).id;
  transfer.timestamp = dataset.timestamp;
  transfer.dataset = dataset.id;
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.save();

  if (from.id == ADDRESS_ZERO) {
    let protocol = fetchProtocol();
    protocol.datasetsCount = protocol.datasetsCount.plus(BigInt.fromI32(1));
    protocol.save();
  }
}
