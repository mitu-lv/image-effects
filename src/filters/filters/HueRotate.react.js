import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';

/**
 * Hue rotate
 *
 * Rotates the colours (in HSL space) of an image by an angle.
 * Slightly LSD-ish recolouring
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount angle of rotation (deg, +/-0-360)
 */
export const HueRotate = ({amount, in1, result}) =>
    <feColorMatrix type="hueRotate" values={amount} in={in1} result={result}/>
;

HueRotate.propTypes = FilterElementPropTypes;

export default {
    Component: HueRotate,
    get caption() {
        return i18n.t('inspector.free.filters.hueRotate');
    },
    max: 360,
    min: 0,
    default: 0,
};
