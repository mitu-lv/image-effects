import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';

/**
 * Saturation. Colourfulness
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount Saturation level, 0 - black and white, 1 - normal, 2 - 2x pronounced
 */
export const Saturation = ({amount, in1, result}) =>
    <feColorMatrix
        type="saturate"
        values={amount.toFixed(2)}
        in={in1}
        result={result}
    />
;

Saturation.propTypes = FilterElementPropTypes;

export default {
    Component: Saturation,
    get caption() {
        return i18n.t('inspector.free.filters.saturation');
    },
    max: 2,
    min: 0,
    default: 1,
};
