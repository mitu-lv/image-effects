import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import IntensityOf from './IntensityOf.react';

/**
 * Black and white image
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const BlackAndWhite = ({in1, amount, result}) =>
    <>
        <feColorMatrix type="matrix"
            values="0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 1 0"
            in={in1}
            result="blackAndWhiteOutput"
        />
        <IntensityOf in1="blackAndWhiteOutput" source={in1} amount={amount} result={result}/>
    </>
;

BlackAndWhite.propTypes = FilterElementPropTypes;

export default {
    Component: BlackAndWhite,
    get caption() {
        return i18n.t('inspector.free.filters.blackAndWhite');
    },
    default: 1,
    min: 0,
    max: 1,
};
