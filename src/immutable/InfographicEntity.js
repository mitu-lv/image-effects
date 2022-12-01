import {Record, Map, fromJS} from 'immutable';
import {v4 as uuid} from 'uuid';

import Transform from './Transform';


import resolveDesignProperty from './resolveDesignProperty';
import {rectToBounds, roundRect} from '../util/bounds';
import {calculateClippedRectangle} from '../util/clippedEntity';
import {FACTS_AND_FIGURES_V2} from '../../../shared/chart_constants';

const defaultRecord = {
    key: '',
    type: null,
    blockKey: null,
    top: null,
    left: null,
    width: null,
    height: null,
    transform: new Transform(),
    props: Map(),
    lockAspectRatio: false,
    maxWidth: null,
    maxHeight: null,
    minWidth: null,
    minHeight: null,
    locked: false,
    groupKey: undefined,
    filters: Map(),
    calloutKey: undefined,
    hidden: false,
    opacity: 1,
    flip: true,
    shadow: null,
    rx: 10,
    ry: 10,
};

const SHAPES_WITHOUT_TEXT = ['line', 'arrow', 'calloutCircle', 'pointer', 'path'];

const ACCESSIBILITY_RECORDS = {
    CHART: Record({
        enabled: true,
        label: 'Chart',
        description: '',
    }),
    IMAGE: Record({
        enabled: true,
        label: 'Image',
        description: '',
    }),
    TEXT: Record({
        enabled: true,
    }),
    SHAPE: Record({
        enabled: false,
        label: 'Shape',
        description: '',
    }),
    MEDIA: Record({
        enabled: true,
    }),
    GROUP: Record({
        enabled: true,
        label: 'Group',
        description: '',
        readChildren: true,
    }),
    CONNECTOR: Record({
        enabled: true,
        label: 'Connector',
        description: '',
    }),
};

const InfographicEntityRecord = Record(defaultRecord);

export default class InfographicEntity extends InfographicEntityRecord {
    static fromRawEntity(raw, blockKey) {
        const type = raw.type;
        if (!type) {
            throw new Error('"type" must be defined');
        }

        const left = raw.left;
        if (typeof left === 'undefined') {
            throw new Error('"left" must be defined');
        }

        const top = raw.top;
        if (typeof top === 'undefined') {
            throw new Error('"top" must be defined');
        }

        const width = raw.width;
        if (typeof width === 'undefined') {
            throw new Error('"width" must be defined');
        }

        const height = raw.height;
        if (typeof height === 'undefined') {
            throw new Error('"height" must be defined');
        }

        const record = {
            type: type,
            left: left,
            top: top,
            width: width,
            height: height,
            props: fromJS(raw.props || {}),
            key: raw.key || uuid(),
            lockAspectRatio: raw.lockAspectRatio || false,
            maxWidth: raw.maxWidth || 10000,
            maxHeight: raw.maxHeight || 10000,
            minWidth: raw.minWidth || 1,
            minHeight: raw.minHeight || 1,
            locked: raw.locked,
            groupKey: raw.groupKey,
            filters: Map(raw.filters || {}),
            calloutKey: raw.calloutKey,
            hidden: raw.hidden,
            opacity: raw.opacity,
            flip: raw.flip,
            shadow: raw.shadow,
            rx: raw.rx,
            ry: raw.ry,
        };

        if (raw.transform) {
            record.transform = Transform.fromRawTransform(raw.transform);
        } else {
            record.transform = new Transform();
        }

        if (blockKey) {
            record.blockKey = blockKey;
        }

        return new InfographicEntity(record);
    }

    static set(entity, put) {
        return entity.merge(put);
    }

    getKey() {
        return this.get('key');
    }

    getBlockKey() {
        return this.get('blockKey');
    }

    getType() {
        return this.get('type');
    }

    getTop() {
        return this.get('top');
    }

    getLeft() {
        return this.get('left');
    }

    getWidth() {
        return this.get('width');
    }

    getHeight() {
        return this.get('height');
    }

    isLocked() {
        return this.get('locked');
    }

    isHidden() {
        return this.get('hidden');
    }

    getAccessibility() {
        const type = this.getType();
        let accessibility;
        if (type === 'CHART') {
            accessibility = this.getProperty('chartData').get('accessibility');
        } else {
            accessibility = this.getProps().get('accessibility');
        }

        return ACCESSIBILITY_RECORDS[type](accessibility);
    }

    getProps() {
        return this.get('props');
    }

    getAnimation() {
        return this.getProps().get('animation');
    }

    getCallout() {
        return this.getProps().get('callout');
    }

    getCalloutKey() {
        return this.get('calloutKey');
    }

    getTransform() {
        return this.get('transform');
    }

    getGroupKey() {
        return this.get('groupKey');
    }

    getOpacity() {
        return this.getProps().get('opacity');
    }

    /**
     * Keys of Group's child entities
     *
     * @returns {Immutable.List<string>}
     */
    getChildrenKeys() {
        return this.getProps().get('entityKeys');
    }

    getFilters() {
        return this.get('filters');
    }

    get isAspectRatioLocked() {
        return this.get('lockAspectRatio') || !!this.getProperty('mask');
    }

    get disallowAspectRatioChange() {
        const isMasked = !!this.getProperty('mask');
        const isVideo = this.getProperty('mediaType') === 'video';

        return isMasked || isVideo;
    }

    rectangle() {
        return {
            left: this.left,
            top: this.top,
            height: this.height,
            width: this.width,
        };
    }

    getRotate() {
        const transform = this.get('transform');
        return transform.rotate || 0;
    }

    bounds(unclipped = false, ignoreRotation = false) {
        let rotate = this.transform.rotate;

        if (unclipped) {
            return roundRect(rectToBounds(this.rectangle(), ignoreRotation ? 0 : rotate));
        }

        const rect = calculateClippedRectangle(this);
        const mask = this.getProperty('mask');

        if (mask) {
            rotate += mask.get('rotate');
        }

        return roundRect(rectToBounds(rect, ignoreRotation ? 0 : rotate));
    }

    /**
        @param {string} key
        @param {unknown} design
    */
    getProperty(key, design = null) {
        const props = this.getProps();
        if (props.has(key)) {
            let value = props.get(key);
            if (design) {
                const resolved = resolveDesignProperty(design, this.getType(), value);
                if (resolved.match) {
                    value = resolved.value;
                }
            }
            return value;
        }
        return null;
    }

    isLine() {
        return this.type === 'SHAPE' && this.getProperty('type') === 'line';
    }

    isHeightlessChart() {
        if (!this.type === 'CHART') {
            return false;
        }
        const chartData = this.getIn(['props', 'chartData']);
        if (!chartData) {
            return false;
        }
        return `${chartData.get('chart_type_nr')}_${chartData.get('modifier')}` === FACTS_AND_FIGURES_V2;
    }

    isCustomPath() {
        return this.type === 'SHAPE' && this.getProperty('type') === 'path';
    }

    canHaveText() {
        return this.type === 'SHAPE' && SHAPES_WITHOUT_TEXT.indexOf(this.getProperty('type')) === -1;
    }

    isConnector() {
        return this.type === 'CONNECTOR';
    }

    isGroup() {
        return this.type === 'GROUP';
    }

    /**
     * Tests whether this entity is a chart, or a specific type of a chart -
     * e.g. BAR, BAR_STACKED, WORDCLOUD etc.
     *
     * @param {string|undefined} typeMod one of the predefined constants from 'chart_constants.js' file to test against.
     * If omitted, will check just if this is a chart in general
     * @returns {boolean} true, if typeMod fits this entity; P.S. false also if this is not even a chart
     */
    isChart(typeMod = undefined) {
        if (!typeMod) {
            return this.type === 'CHART';
        }
        const chartData = this.getIn(['props', 'chartData']);
        if (!chartData) {
            return false;
        }
        return typeMod === `${chartData.get('chart_type_nr')}_${chartData.get('modifier')}`;
    }

    getLiveDataKey() {
        const liveDataSettings = this.getProps().getIn(['chartData', 'custom', 'live']);
        return liveDataSettings?.get('enabled') && liveDataSettings?.get('key');
    }
}
