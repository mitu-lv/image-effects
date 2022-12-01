import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import IntensityOf from './IntensityOf.react';
import {Sepia} from './Sepia.react';
import {Contrast} from './Contrast.react';
import {Vignette} from './Vignette.react';

/**
 * Focus
 *
 * N.B.! Currently disabled for compatibility with Safari 11-
 * When support for older Safari versions is dropped,
 * can re-introduce this SVG filter
 *
 * Bumps up the contrast, adds a strong vignette,
 * and makes all of the colors warmer
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const Focus = ({amount, in1, result}) =>
    <>
        <Contrast amount={1.3}/>
        <Sepia result="sepia"/>
        <feComponentTransfer in="sepia" result="adjusted">
            <feFuncA type="linear" slope={0.2}/>
        </feComponentTransfer>
        <Vignette in1="adjusted" amount={1} result="Focus"/>
        <IntensityOf in1="Focus" source={in1} amount={amount} result={result}/>
    </>
;

Focus.propTypes = FilterElementPropTypes;

export default {
    Component: Focus,
    get caption() {
        return i18n.t('inspector.free.filters.focus');
    },
    max: 1,
    min: 0,
    default: 0.5,
};
