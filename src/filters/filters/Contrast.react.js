import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';

/**
 * Contrast
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount contrast level, 0 - no contrast at all, gray square, 1 - normal, 2 - 2x pronounced
 */
export const Contrast = ({amount, in1, result}) =>
    <feComponentTransfer in={in1} result={result}>
        <feFuncR type="linear" slope={amount.toFixed(2)} intercept={(-(0.5 * amount) + 0.5).toFixed(2)}/>
        <feFuncG type="linear" slope={amount.toFixed(2)} intercept={(-(0.5 * amount) + 0.5).toFixed(2)}/>
        <feFuncB type="linear" slope={amount.toFixed(2)} intercept={(-(0.5 * amount) + 0.5).toFixed(2)}/>
    </feComponentTransfer>
;

Contrast.propTypes = FilterElementPropTypes;

export default {
    Component: Contrast,
    get caption() {
        return i18n.t('inspector.free.filters.contrast');
    },
    max: 2,
    min: 0,
    default: 1,
};
