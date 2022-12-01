import {Map} from 'immutable';

import config from '../../../config';

const ABSOLUTE_AND_BLOB_URL_REGEX = /^(blob:)?(?:[a-z]+:)?\/\//i;

export default class Assets {
    static createFromObject(json) {
        return new Assets(Map(json));
    }

    static isValidPrezigramAssetURL(url) {
        return url && (url.startsWith(config.assetsCDN) || !ABSOLUTE_AND_BLOB_URL_REGEX.test(url));
    }

    constructor(immutable) {
        this._immutable = immutable;
    }

    get = assetId => this._immutable.get(assetId)

    getURL(assetId) {
        const url = this.get(assetId);
        if (!url || !config.assetsCDN || ABSOLUTE_AND_BLOB_URL_REGEX.test(url)) {
            return url;
        }
        return `${config.assetsCDN}${url}`;
    }

    /**
     * @param {Immutable.Map|Object.<string, string>} assets
     * @returns {Assets}
     */
    add(assets) {
        const updatedMap = this._immutable.withMutations(mutable => {
            Map(assets).forEach((url, key) => {
                if (url.startsWith(config.assetsCDN)) {
                    // store relative to CDN
                    mutable.set(key, url.substring(config.assetsCDN.length));
                } else {
                    mutable.set(key, url);
                }
            });
        });
        return new Assets(updatedMap);
    }

    /**
     * @param {string[]} assetIds
     * @returns {Assets}
     */
    remove(assetIds) {
        return new Assets(this._immutable.filter((_, key) => !assetIds.includes(key)));
    }

    filter(predicate) {
        return new Assets(this._immutable.filter(predicate));
    }

    has(assetId) {
        return this._immutable.has(assetId);
    }

    findAssetByUrl(url) {
        return this._immutable.findKey(
            assetUrl => assetUrl === url
        );
    }

    toJS() {
        return this._immutable.toJS();
    }

    toJSON() {
        return this._immutable.toJSON();
    }
}
