// SPDX-FileCopyrightText: 2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';

export class EventParamBuilder {
    private params: ethereum.EventParam[] = new Array<ethereum.EventParam>();

    static init(): EventParamBuilder {
        return new EventParamBuilder();
    }

    address(key: string, value: Address): EventParamBuilder {
        this.params.push(new ethereum.EventParam(key, ethereum.Value.fromAddress(value)));
        return this;
    }

    bytes(key: string, value: Bytes): EventParamBuilder {
        this.params.push(new ethereum.EventParam(key, ethereum.Value.fromBytes(value)));
        return this;
    }

    bigInt(key: string, value: BigInt): EventParamBuilder {
        this.params.push(new ethereum.EventParam(key, ethereum.Value.fromUnsignedBigInt(value)));
        return this;
    }

    string(key: string, value: string): EventParamBuilder {
        this.params.push(new ethereum.EventParam(key, ethereum.Value.fromString(value)));
        return this;
    }

    build(): ethereum.EventParam[] {
        return this.params;
    }
}
