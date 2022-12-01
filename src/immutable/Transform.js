import {Record} from 'immutable';

const TransformRecord = Record({
    rotate: 0,
    flipHorizontal: false,
    flipVertical: false,
});

export default class Transform extends TransformRecord {
    static fromRawTransform(raw) {
        return new Transform(raw);
    }

    getRotate() {
        return this.get('rotate');
    }
}
