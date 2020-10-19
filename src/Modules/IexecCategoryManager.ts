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
  BigInt,
} from '@graphprotocol/graph-ts'

import {
	CreateCategory as CreateCategoryEvent,
} from '../../generated/Core/IexecInterfaceToken'

import {
	Category
} from '../../generated/schema'

import {
  fetchProtocol,
} from '../utils'

export function handleCreateCategory(event: CreateCategoryEvent): void
{
  // categories may be redefined by the administrator
  let category = Category.load(event.params.catid.toString())

  if (category == null) {
    category = new Category(event.params.catid.toString())

    let protocol = fetchProtocol();
    protocol.categories = protocol.categories.plus(BigInt.fromI32(1));
    protocol.save();
  }

	category.name             = event.params.name
	category.description      = event.params.description
	category.workClockTimeRef = event.params.workClockTimeRef
  category.timestamp        = event.block.timestamp;
	category.save()
}
