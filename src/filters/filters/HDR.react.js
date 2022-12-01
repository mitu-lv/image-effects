import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import {Contrast} from './Contrast.react';
import {Saturation} from './Saturation.react';
import IntensityOf from './IntensityOf.react';
import {Brightness} from './Brightness.react';

/**
 * HDR
 *
 * Flattens the colors, accenting darks and lights
 * to make image seem sharper
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const HDR = ({in1, amount, result}) =>
    <>
        <feBlend mode="screen" in={in1} in2={in1} result="screened"/>
        <feBlend mode="multiply" in={in1} in2="screened"/>
        <Contrast amount={1.2}/>
        <Saturation amount={1.2} result="saturated"/>
        <Brightness amount={1.2} result="HDR"/>
        <IntensityOf in1="HDR" source={in1} amount={amount} result={result}/>
    </>
;

HDR.propTypes = FilterElementPropTypes;

export default {
    Component: HDR,
    get caption() {
        return i18n.t('inspector.free.filters.HDR');
    },
    min: 0,
    max: 1,
    default: 0.5,
};
