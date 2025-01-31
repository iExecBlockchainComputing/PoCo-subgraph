// SPDX-FileCopyrightText: 2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';

export function nRLCToRLC(value: BigInt): BigDecimal {
    let divisor = BigDecimal.fromString('1000000000');
    return value.divDecimal(divisor);
}
