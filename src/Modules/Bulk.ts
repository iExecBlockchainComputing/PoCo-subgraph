import {
    Address,
    BigInt,
    Bytes,
    dataSource,
    DataSourceContext,
    DataSourceTemplate,
    json,
    JSONValueKind,
} from '@graphprotocol/graph-ts';
import { Bulk, BulkSlice } from '../../generated/schema';
import {
    computeTaskId,
    CONTEXT_BOT_FIRST,
    CONTEXT_BOT_SIZE,
    CONTEXT_BULK,
    CONTEXT_DEAL,
    CONTEXT_DOMAIN_SEPARATOR_HASH,
    CONTEXT_INDEX,
    createBulkOrderID,
    createBulkSliceID,
    fetchDatasetorder,
    isAddressString,
    isBytes32String,
    isHexString,
    isIntegerString,
    toRLC,
} from '../utils';

export function handleBulk(content: Bytes): void {
    const hash = dataSource.stringParam();
    const context = dataSource.context();
    const domainSeparator = context.getBytes(CONTEXT_DOMAIN_SEPARATOR_HASH);
    const dealId = context.getString(CONTEXT_DEAL);
    const botFirst = context.getBigInt(CONTEXT_BOT_FIRST);
    const botSize = context.getBigInt(CONTEXT_BOT_SIZE);

    const bulkId = dealId;

    let bulk = Bulk.load(bulkId);
    if (bulk != null) {
        // immutable bulk already exists nothing to do
        return;
    }
    bulk = new Bulk(bulkId);
    bulk.hash = hash;
    bulk.content = content.toString();

    const jsonContent = json.try_fromBytes(content);
    if (jsonContent.isOk && jsonContent.value.kind == JSONValueKind.OBJECT) {
        const contentObject = jsonContent.value.toObject();

        for (let i = 0; i < contentObject.entries.length; i++) {
            const entry = contentObject.entries[i];

            if (isIntegerString(entry.key)) {
                const index = BigInt.fromString(entry.key);
                if (
                    // exclude slice out of deal bot range
                    index >= botFirst &&
                    index < botFirst.plus(botSize) &&
                    entry.value.kind == JSONValueKind.OBJECT
                ) {
                    let sliceCid = entry.value.toObject().getEntry('orders');
                    if (sliceCid != null && sliceCid.value.kind == JSONValueKind.STRING) {
                        let sliceContext = new DataSourceContext();
                        sliceContext.setString(CONTEXT_BULK, bulkId);
                        sliceContext.setString(CONTEXT_DEAL, dealId);
                        sliceContext.setBigInt(CONTEXT_INDEX, index);
                        sliceContext.setBytes(CONTEXT_DOMAIN_SEPARATOR_HASH, domainSeparator);

                        DataSourceTemplate.createWithContext(
                            'BulkSlice',
                            [sliceCid.value.toString()],
                            sliceContext,
                        );
                    }
                }
            }
        }
    }

    bulk.save();
}

export function handleBulkSlice(content: Bytes): void {
    const hash = dataSource.stringParam();
    const context = dataSource.context();
    const bulk = context.getString(CONTEXT_BULK);
    const dealId = context.getString(CONTEXT_DEAL);
    const index = context.getBigInt(CONTEXT_INDEX);
    const taskId = computeTaskId(dealId, index);

    if (taskId !== null) {
        const bulkSliceId = createBulkSliceID(dealId, index);
        let bulkSlice = BulkSlice.load(bulkSliceId);
        if (bulkSlice != null) {
            // immutable bulk slice already exists nothing to do
            return;
        }
        bulkSlice = new BulkSlice(bulkSliceId);
        bulkSlice.task = taskId;
        bulkSlice.hash = hash;
        bulkSlice.bulk = bulk;
        bulkSlice.index = index;
        bulkSlice.content = content.toString();
        bulkSlice.datasets = new Array<string>();
        bulkSlice.datasetOrders = new Array<string>();

        const jsonContent = json.try_fromBytes(content);
        if (jsonContent.isOk && jsonContent.value.kind == JSONValueKind.ARRAY) {
            const datasetOrderArray = jsonContent.value.toArray();

            for (let i = 0; i < datasetOrderArray.length; i++) {
                const datasetOrder = datasetOrderArray[i];
                if (datasetOrder.kind == JSONValueKind.OBJECT) {
                    const orderObj = datasetOrder.toObject();

                    const datasetEntry = orderObj.getEntry('dataset');
                    const datasetPriceEntry = orderObj.getEntry('datasetprice');
                    const volumeEntry = orderObj.getEntry('volume');
                    const tagEntry = orderObj.getEntry('tag');
                    const apprestrictEntry = orderObj.getEntry('apprestrict');
                    const workerpoolrestrictEntry = orderObj.getEntry('workerpoolrestrict');
                    const requesterrestrictEntry = orderObj.getEntry('requesterrestrict');
                    const saltEntry = orderObj.getEntry('salt');
                    const signEntry = orderObj.getEntry('sign');
                    // check that all entries are present and valid
                    if (
                        datasetEntry != null &&
                        datasetEntry.value.kind == JSONValueKind.STRING &&
                        isAddressString(datasetEntry.value.toString().toLowerCase()) &&
                        datasetPriceEntry != null &&
                        datasetPriceEntry.value.kind == JSONValueKind.STRING &&
                        isIntegerString(datasetPriceEntry.value.toString()) &&
                        volumeEntry != null &&
                        volumeEntry.value.kind == JSONValueKind.STRING &&
                        isIntegerString(volumeEntry.value.toString()) &&
                        tagEntry != null &&
                        tagEntry.value.kind == JSONValueKind.STRING &&
                        isBytes32String(tagEntry.value.toString()) &&
                        apprestrictEntry != null &&
                        apprestrictEntry.value.kind == JSONValueKind.STRING &&
                        isAddressString(apprestrictEntry.value.toString().toLowerCase()) &&
                        workerpoolrestrictEntry != null &&
                        workerpoolrestrictEntry.value.kind == JSONValueKind.STRING &&
                        isAddressString(workerpoolrestrictEntry.value.toString().toLowerCase()) &&
                        requesterrestrictEntry != null &&
                        requesterrestrictEntry.value.kind == JSONValueKind.STRING &&
                        isAddressString(requesterrestrictEntry.value.toString().toLowerCase()) &&
                        saltEntry != null &&
                        saltEntry.value.kind == JSONValueKind.STRING &&
                        isBytes32String(saltEntry.value.toString()) &&
                        signEntry != null &&
                        signEntry.value.kind == JSONValueKind.STRING &&
                        isHexString(signEntry.value.toString())
                    ) {
                        // datasetOrderId cannot be orderHash as it could collide with on-chain indexed order
                        const datasetOrderId = createBulkOrderID(taskId, BigInt.fromI32(i));

                        const datasetAddress = datasetEntry.value.toString().toLowerCase();

                        let datasetOrder = fetchDatasetorder(datasetOrderId);
                        datasetOrder.dataset = datasetAddress;
                        datasetOrder.datasetprice = toRLC(
                            BigInt.fromString(datasetPriceEntry.value.toString()),
                        );
                        datasetOrder.volume = BigInt.fromString(volumeEntry.value.toString());
                        datasetOrder.tag = Bytes.fromHexString(tagEntry.value.toString());
                        datasetOrder.apprestrict = Address.fromString(
                            apprestrictEntry.value.toString().toLowerCase(),
                        );
                        datasetOrder.workerpoolrestrict = Address.fromString(
                            workerpoolrestrictEntry.value.toString().toLowerCase(),
                        );
                        datasetOrder.requesterrestrict = Address.fromString(
                            requesterrestrictEntry.value.toString().toLowerCase(),
                        );
                        datasetOrder.salt = Bytes.fromHexString(saltEntry.value.toString());
                        datasetOrder.sign = Bytes.fromHexString(signEntry.value.toString());

                        // todo: it may be useful to keep on order entity?
                        // compute order hash with domain separator from contract
                        // const domainSeparator = context.getBytes(CONTEXT_DOMAIN_SEPARATOR_HASH);
                        // const orderHash = hashDatasetOrder(
                        //     Address.fromString(datasetEntry.value.toString()),
                        //     BigInt.fromString(datasetPriceEntry.value.toString()),
                        //     BigInt.fromString(volumeEntry.value.toString()),
                        //     Bytes.fromHexString(tagEntry.value.toString()),
                        //     Address.fromString(apprestrictEntry.value.toString()),
                        //     Address.fromString(workerpoolrestrictEntry.value.toString()),
                        //     Address.fromString(requesterrestrictEntry.value.toString()),
                        //     Bytes.fromHexString(saltEntry.value.toString()),
                        //     domainSeparator,
                        // );
                        // order.hash = orderHash;
                        datasetOrder.save();

                        let datasetOrders = bulkSlice.datasetOrders;
                        datasetOrders.push(datasetOrderId);
                        bulkSlice.datasetOrders = datasetOrders;

                        let datasets = bulkSlice.datasets;
                        datasets.push(datasetAddress);
                        bulkSlice.datasets = datasets;
                    }
                }
            }
        }
        bulkSlice.save();
    }
}
