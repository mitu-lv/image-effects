import _ from 'lodash';
import {Record, Map} from 'immutable';

export const Background = Record({
    color: '#fff',
    assetId: undefined,
    galleryImageId: null,
    opacity: 1,
    filters: Map(),
});

export function fromRawBackground(background) {
    if (!background) {
        return undefined;
    }

    if (background.color || background.assetId) {
        const data = _.pick(background, [
            'color', 'galleryImageId', 'opacity', 'assetId',
        ]);
        if (background.filters) {
            data.filters = Map(background.filters);
        }
        return Background(data);
    }
    return undefined;
}
