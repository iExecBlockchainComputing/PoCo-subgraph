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
  PolicyUpdate as PolicyUpdateEvent,
} from "../../generated/templates/Workerpool/Workerpool";
import { Workerpool, PolicyUpdate } from "../../generated/schema";
import { createEventID, logTransaction } from "../utils";

export function handlePolicyUpdate(event: PolicyUpdateEvent): void {
  let workerpool = Workerpool.load(event.address.toHex());
  if (workerpool) {
    workerpool.workerStakeRatio = event.params.newWorkerStakeRatioPolicy;
    workerpool.schedulerRewardRatio = event.params.newSchedulerRewardRatioPolicy;
    workerpool.save();
  
    let policyupdate = new PolicyUpdate(createEventID(event));
    policyupdate.transaction = logTransaction(event).id;
    policyupdate.timestamp = event.block.timestamp;
    policyupdate.workerpool = event.address.toHex();
    policyupdate.oldWorkerStakeRatio = event.params.oldWorkerStakeRatioPolicy;
    policyupdate.newWorkerStakeRatio = event.params.oldSchedulerRewardRatioPolicy;
    policyupdate.oldSchedulerRewardRatio = event.params.newWorkerStakeRatioPolicy;
    policyupdate.newSchedulerRewardRatio =
      event.params.newSchedulerRewardRatioPolicy;
    policyupdate.save();
  }
}
