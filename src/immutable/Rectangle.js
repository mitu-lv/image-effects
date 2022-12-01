import {Record} from 'immutable';

const Rectangle = Record({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    rotation: 0,
}, 'Rectangle');

export default Rectangle;
