import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import IntensityOf from './IntensityOf.react';
import {Brightness} from './Brightness.react';
import {Sepia} from './Sepia.react';
import {Contrast} from './Contrast.react';
import {Saturation} from './Saturation.react';

const tint = 'rgba(3, 230, 26)';

/**
 * Budapest, sunny, warm and mellow city
 *
 * Darkens image, increases shadows, and adds a slightly yellow tint overall
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const Budapest = ({in1, amount, result}) =>
    <>
        <Sepia result="sepia"/>
        <IntensityOf in1="sepia" source={in1} amount={0.3}/>
        <Brightness amount={.95}/>
        <Contrast amount={.95}/>
        <Saturation amount={1.5} result="adjustments"/>
        <feFlood floodColor={tint} floodOpacity=".2" result="fill"/>
        <feBlend in="fill" in2="adjustments" mode="hue" result="Budapest"/>
        <IntensityOf in1="Budapest" source={in1} amount={amount} result={result}/>
    </>
;

Budapest.propTypes = FilterElementPropTypes;

export default {
    Component: Budapest,
    get caption() {
        return i18n.t('inspector.free.filters.budapest');
    },
    default: 0.5,
    min: 0,
    max: 1,
};
