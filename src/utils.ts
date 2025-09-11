// SPDX-FileCopyrightText: 2020-2025 IEXEC BLOCKCHAIN TECH <contact@iex.ec>
// SPDX-License-Identifier: Apache-2.0

import {
    Address,
    BigDecimal,
    BigInt,
    ByteArray,
    Bytes,
    crypto,
    ethereum,
} from '@graphprotocol/graph-ts';

import {
    Account,
    AppOrder,
    Bulk,
    BulkSlice,
    Contribution,
    DatasetOrder,
    Deal,
    Protocol,
    RequestOrder,
    Task,
    Transaction,
    WorkerpoolOrder,
} from '../generated/schema';

import { IexecInterfaceToken__domainResultValue0Struct as IEIP712Domain } from '../generated/Core/IexecInterfaceToken';

export function createEventID(event: ethereum.Event): string {
    return event.block.number.toString().concat('-').concat(event.logIndex.toString());
}

export function createContributionID(taskid: string, worker: string): string {
    return taskid.concat('-').concat(worker);
}

export function createBulkSliceID(bulk: string, index: BigInt): string {
    return bulk.concat('-').concat(index.toString());
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
        task.status = 'UNSET';
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

export function fetchBulk(id: string): Bulk {
    let bulk = Bulk.load(id);
    if (bulk == null) {
        bulk = new Bulk(id);
    }
    return bulk as Bulk;
}

export function fetchBulkSlice(id: string): BulkSlice {
    let bulkSlice = BulkSlice.load(id);
    if (bulkSlice == null) {
        bulkSlice = new BulkSlice(id);
    }
    return bulkSlice as BulkSlice;
}

export function fetchProtocol(): Protocol {
    let protocol = Protocol.load('iExec');
    if (protocol == null) {
        protocol = new Protocol('iExec');
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
    return value.divDecimal(BigDecimal.fromString('1000000000'));
}

export function toNRlc(value: BigDecimal): BigInt {
    const rlcValue = value.times(BigDecimal.fromString('1000000000')).toString();
    return BigInt.fromString(rlcValue);
}

export function intToAddress(value: BigInt): Address {
    return Address.fromString(value.toHex().substr(2).padStart(40, '0')) as Address;
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
        changetype<Bytes>(crypto.keccak256(ByteArray.fromUTF8(string))), // Change from 'as T' to 'changetype<T>'
    );
}

export function hashDatasetOrder(
    dataset: Address,
    datasetprice: BigInt,
    volume: BigInt,
    tag: Bytes,
    apprestrict: Address,
    workerpoolrestrict: Address,
    requesterrestrict: Address,
    salt: Bytes,
    domainHash: ByteArray,
): ByteArray {
    const structHash = crypto.keccak256(
        ethereum.encode(
            ethereum.Value.fromTuple(
                changetype<ethereum.Tuple>([
                    encodeStringValue(
                        'DatasetOrder(address dataset,uint256 datasetprice,uint256 volume,bytes32 tag,address apprestrict,address workerpoolrestrict,address requesterrestrict,bytes32 salt)',
                    ),
                    ethereum.Value.fromAddress(dataset),
                    ethereum.Value.fromUnsignedBigInt(datasetprice),
                    ethereum.Value.fromUnsignedBigInt(volume),
                    ethereum.Value.fromFixedBytes(tag),
                    ethereum.Value.fromAddress(apprestrict),
                    ethereum.Value.fromAddress(workerpoolrestrict),
                    ethereum.Value.fromAddress(requesterrestrict),
                    ethereum.Value.fromFixedBytes(salt),
                ]),
            ),
        )!,
    );
    return hashEIP712(domainHash, structHash);
}

function hashEIP712(domainHash: ByteArray, structHash: ByteArray): ByteArray {
    return crypto.keccak256(
        concatByteArrays(
            ByteArray.fromHexString('0x1901'),
            concatByteArrays(domainHash, structHash),
        ),
    );
}

function hashDomain(domain: IEIP712Domain): ByteArray {
    return crypto.keccak256(
        ethereum.encode(
            ethereum.Value.fromTuple(
                changetype<ethereum.Tuple>([
                    encodeStringValue(
                        'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)',
                    ),
                    encodeStringValue(domain.name),
                    encodeStringValue(domain.version),
                    ethereum.Value.fromUnsignedBigInt(domain.chainId),
                    ethereum.Value.fromAddress(domain.verifyingContract),
                ]), // Change from 'as T' to 'changetype<T>'
            ),
        )!,
    );
}

export function isIntegerString(str: string): boolean {
    // empty string is not valid
    if (str.length == 0) {
        return false;
    }
    // 0 prefixed string is not valid
    if (str[0] == '0' && str.length > 1) {
        return false;
    }
    // non numeric character is not valid
    for (let i = 0; i < str.length; i++) {
        if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(str[i])) {
            return false;
        }
    }
    return true;
}

export function isHexString(str: string): boolean {
    if (str.length < 2 || str[0] != '0' || str[1] != 'x') {
        return false;
    }
    for (let i = 2; i < str.length; i++) {
        if (
            ![
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                'a',
                'b',
                'c',
                'd',
                'e',
                'f',
            ].includes(str[i])
        ) {
            return false;
        }
    }
    return true;
}

function isHexStringWithLength(str: string, length: number): boolean {
    if (str.length !== length) {
        return false;
    }
    return isHexString(str);
}

export function isAddressString(str: string): boolean {
    return isHexStringWithLength(str, 42);
}

export function isBytes32String(str: string): boolean {
    return isHexStringWithLength(str, 66);
}

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const CONTEXT_REQUESTHASH = 'REQUESTHASH';
export const CONTEXT_DOMAIN_SEPARATOR_HASH = 'DOMAIN_SEPARATOR_HASH';
export const CONTEXT_BULK = 'BULK';
export const CONTEXT_INDEX = 'INDEX';
