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

import { App as AppContract } from "../../generated/AppRegistry/App";

import { Transfer as TransferEvent } from "../../generated/AppRegistry/AppRegistry";

import { App, AppTransfer } from "../../generated/schema";

import {
  createEventID,
  fetchAccount,
  fetchProtocol,
  logTransaction,
  intToAddress,
  ADDRESS_ZERO,
} from "../utils";

export function handleTransferApp(ev: TransferEvent): void {
  let contract = AppContract.bind(intToAddress(ev.params.tokenId));

  let from = fetchAccount(ev.params.from.toHex());
  let to = fetchAccount(ev.params.to.toHex());
  from.save();
  to.save();

  let app = new App(contract._address.toHex());
  app.owner = contract.owner().toHex();
  app.name = contract.m_appName();
  app.type = contract.m_appType();
  app.multiaddr = contract.m_appMultiaddr();
  app.checksum = contract.m_appChecksum();
  app.mrenclave = contract.m_appMREnclave();
  app.timestamp = ev.block.timestamp;
  app.save();

  let transfer = new AppTransfer(createEventID(ev));
  transfer.transaction = logTransaction(ev).id;
  transfer.timestamp = app.timestamp;
  transfer.app = app.id;
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.save();

  if (from.id == ADDRESS_ZERO) {
    let protocol = fetchProtocol();
    protocol.apps = protocol.apps.plus(BigInt.fromI32(1));
    protocol.save();
  }
}
