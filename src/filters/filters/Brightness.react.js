import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';

/**
 * Brightness
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount level of brightness (0-1)
 */
export const Brightness = ({amount, in1, result}) =>
    <feComponentTransfer in={in1} result={result}>
        <feFuncR type="linear" slope={amount.toFixed(2)}/>
        <feFuncG type="linear" slope={amount.toFixed(2)}/>
        <feFuncB type="linear" slope={amount.toFixed(2)}/>
    </feComponentTransfer>
;

Brightness.propTypes = FilterElementPropTypes;

export default {
    Component: Brightness,
    get caption() {
        return i18n.t('inspector.free.filters.brightness');
    },
    max: 2,
    min: 0,
    default: 1,
};
