import {Record} from 'immutable';

const PageSizeRecord = Record({
    width: 0,
    height: 0,
});

export default class PageSize extends PageSizeRecord {
    constructor(size) {
        if (!size || !(size.width > 0) || !(size.height > 0)) {
            throw new Error(`Invalid page size specified: ${JSON.stringify(size)}`);
        }
        super(size);
    }
}
