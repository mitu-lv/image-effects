import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';

const corners = require('./corners.png');

/**
 * Vignette (classic)
 *
 * N.B.! Currently disabled for compatibility with Safari 11-
 * When support for older Safari versions is dropped,
 * use this SVG filter instead of workaround
 *
 * Adds corners (only one color). Much faster than the other version
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount opacity of corners image (0-1)
*/
export const Vignette = ({amount, in1, result}) =>
    <>
        <feImage
            xlinkHref={corners}
            preserveAspectRatio="none"
            result="corners"
        />
        <feComponentTransfer in="corners" result="adjustedCorners">
            <feFuncA type="linear" slope={amount}/>
        </feComponentTransfer>
        <feMerge result={result}>
            <feMergeNode in={in1}/>
            <feMergeNode in="adjustedCorners"/>
        </feMerge>
    </>
;

Vignette.propTypes = FilterElementPropTypes;

export default {
    Component: Vignette,
    get caption() {
        return i18n.t('inspector.free.filters.vignette');
    },
    max: 1,
    min: 0,
    default: 0,
};
