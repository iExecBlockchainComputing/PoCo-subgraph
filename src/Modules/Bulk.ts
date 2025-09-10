import {
    BigInt,
    Bytes,
    dataSource,
    DataSourceContext,
    DataSourceTemplate,
    json,
    JSONValueKind,
} from '@graphprotocol/graph-ts';
import { Bulk, BulkSlice } from '../../generated/schema';
import { CONTEXT_BULK, CONTEXT_INDEX, CONTEXT_REQUESTHASH, createBulkSliceID } from '../utils';

function isIntegerString(str: string): boolean {
    // empty string is not valid
    if (str.length == 0) {
        return false;
    }
    // 0 prefixed string is not valid
    if (str[0] === '0' && str.length > 1) {
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

export function handleBulk(content: Bytes): void {
    const hash = dataSource.stringParam();
    const context = dataSource.context();
    const requestorder = context.getString(CONTEXT_REQUESTHASH);

    // multiple deals using same requestorder use the same bulk, we use requestorderHash as bulk ID
    const bulkid = requestorder;

    let bulk = new Bulk(bulkid);
    bulk.hash = hash;
    bulk.content = content.toString();

    const jsonContent = json.try_fromBytes(content);
    if (jsonContent.isOk) {
        const contentObject = jsonContent.value.toObject();

        for (let i = 0; i < contentObject.entries.length; i++) {
            const entry = contentObject.entries[i];

            if (isIntegerString(entry.key)) {
                const index = BigInt.fromString(entry.key);
                if (entry.value.kind == JSONValueKind.OBJECT) {
                    let sliceCid = entry.value.toObject().getEntry('datasets');
                    if (sliceCid != null && sliceCid.value.kind == JSONValueKind.STRING) {
                        let sliceContext = new DataSourceContext();
                        sliceContext.setString(CONTEXT_BULK, bulkid);
                        sliceContext.setBigInt(CONTEXT_INDEX, index);
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

    let bulkSlice = new BulkSlice(createBulkSliceID(bulk, index));
    bulkSlice.hash = hash;
    bulkSlice.bulk = bulk;
    bulkSlice.index = index;
    bulkSlice.content = content.toString();

    const jsonContent = json.try_fromBytes(content);
    if (jsonContent.isOk && jsonContent.value.kind == JSONValueKind.ARRAY) {
        const datasetArray = jsonContent.value.toArray();
        for (let i = 0; i < datasetArray.length; i++) {
            const dataset = datasetArray[i];
            if (dataset.kind == JSONValueKind.STRING) {
                let datasetAddress = dataset.toString().toLowerCase();
                let datasets = bulkSlice.datasets;
                if (datasets == null) {
                    datasets = new Array<string>();
                }
                // dataset address may be invalid, this is not an issue, the model will prune it
                datasets.push(datasetAddress);
                bulkSlice.datasets = datasets;
            }
        }
    }

    bulkSlice.save();
}
