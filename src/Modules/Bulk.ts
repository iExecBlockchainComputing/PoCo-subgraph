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
    CONTEXT_BULK,
    CONTEXT_DOMAIN_SEPARATOR_HASH,
    CONTEXT_INDEX,
    CONTEXT_REQUESTHASH,
    createBulkSliceID,
    fetchDatasetorder,
    hashDatasetOrder,
    isAddressString,
    isBytes32String,
    isHexString,
    isIntegerString,
    toRLC,
} from '../utils';

export function handleBulk(content: Bytes): void {
    const hash = dataSource.stringParam();
    const context = dataSource.context();
    const requestorder = context.getString(CONTEXT_REQUESTHASH);
    const domainSeparator = context.getBytes(CONTEXT_DOMAIN_SEPARATOR_HASH);

    // multiple deals using same requestorder use the same bulk, we use requestorderHash as bulk ID
    const bulkid = requestorder;

    let bulk = Bulk.load(bulkid);
    if (bulk != null) {
        // immutable bulk already exists nothing to do
        return;
    }
    bulk = new Bulk(bulkid);
    bulk.hash = hash;
    bulk.content = content.toString();

    const jsonContent = json.try_fromBytes(content);
    if (jsonContent.isOk && jsonContent.value.kind == JSONValueKind.OBJECT) {
        const contentObject = jsonContent.value.toObject();

        for (let i = 0; i < contentObject.entries.length; i++) {
            const entry = contentObject.entries[i];

            if (isIntegerString(entry.key)) {
                const index = BigInt.fromString(entry.key);
                if (entry.value.kind == JSONValueKind.OBJECT) {
                    let sliceCid = entry.value.toObject().getEntry('orders');
                    if (sliceCid != null && sliceCid.value.kind == JSONValueKind.STRING) {
                        let sliceContext = new DataSourceContext();
                        sliceContext.setString(CONTEXT_BULK, bulkid);
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
    const index = context.getBigInt(CONTEXT_INDEX);
    const domainSeparator = context.getBytes(CONTEXT_DOMAIN_SEPARATOR_HASH);

    const bulkSliceId = createBulkSliceID(bulk, index);

    let bulkSlice = BulkSlice.load(bulkSliceId);
    if (bulkSlice != null) {
        // immutable bulk slice already exists nothing to do
        return;
    }
    bulkSlice = new BulkSlice(createBulkSliceID(bulk, index));
    bulkSlice.hash = hash;
    bulkSlice.bulk = bulk;
    bulkSlice.index = index;
    bulkSlice.content = content.toString();

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
                    // compute order hash with domain separator from contract
                    const orderHash = hashDatasetOrder(
                        Address.fromString(datasetEntry.value.toString()),
                        BigInt.fromString(datasetPriceEntry.value.toString()),
                        BigInt.fromString(volumeEntry.value.toString()),
                        Bytes.fromHexString(tagEntry.value.toString()),
                        Address.fromString(apprestrictEntry.value.toString()),
                        Address.fromString(workerpoolrestrictEntry.value.toString()),
                        Address.fromString(requesterrestrictEntry.value.toString()),
                        Bytes.fromHexString(saltEntry.value.toString()),
                        domainSeparator,
                    );

                    // store dataset order
                    let datasetOrder = fetchDatasetorder(orderHash.toHex());
                    datasetOrder.dataset = datasetEntry.value.toString().toLowerCase();
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
                    datasetOrder.save();

                    let datasetOrders = bulkSlice.datasetOrders;
                    if (datasetOrders == null) {
                        datasetOrders = new Array<string>();
                    }
                    datasetOrders.push(orderHash.toHex());
                    bulkSlice.datasetOrders = datasetOrders;
                }
            }
        }
    }

    bulkSlice.save();
}
