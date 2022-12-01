import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';

const mask = require('./vignette-mask.png');

/**
 * Vignette blend
 *
 * N.B.! Currently disabled for compatibility with Safari 11-
 * When support for older Safari versions is dropped,
 * can re-intorduce this SVG filter
 *
 * Blends input image with semi-transparent corners to the background
 * Set background to color of your choice to achieve any-color vignette effect
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount level of vignette opaqueness (0-1)
 */
const VignetteBlend = ({amount, in1, result}) =>
    <>
        {/*
      * N.B! Safari is very capricious with various VignetteBlend solutions
      * As of Safari 12.1.1
      * 1) feSpotlight/fePointLight solutions don't work at all (+visual glitches)
      * 2) any width/height parameter to feImage breaks the filter (just mono-colored rectangle)
      * 3) SVG image (IE fallback) works BUT is very glitchy on resizing etc.
      *
      * ¯\_(ツ)_/¯
      */}
        <feComponentTransfer in={in1} result="adjustedSource">
            <feFuncA type="linear" slope={1 - amount}/>
        </feComponentTransfer>
        <feImage
            xlinkHref={mask}
            preserveAspectRatio="none"
            result="mask"
        />
        <feComposite
            in={in1}
            in2="mask"
            operator="arithmetic"
            k1={1}
            k2="0"
            k3="0"
            k4="0"
            result="VignetteBlend"
        />
        <feMerge result={result}>
            <feMergeNode in="adjustedSource"/>
            <feMergeNode in="VignetteBlend"/>
        </feMerge>
    </>
;

VignetteBlend.propTypes = FilterElementPropTypes;

export default {
    Component: VignetteBlend,
    get caption() {
        return i18n.t('inspector.free.filters.vignette');
    },
    max: 1,
    min: 0,
    default: 1,
};
