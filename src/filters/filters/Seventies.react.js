import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import IntensityOf from './IntensityOf.react';
import {Contrast} from './Contrast.react';
import {Saturation} from './Saturation.react';
import {Brightness} from './Brightness.react';

const seventiesColor = 'rgb(243,106,188)';

/**
 * Seventies
 *
 * Old, washed out and slightly decolorized 1970-s photo aesthetic
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const Seventies = ({in1, amount, result}) =>
    <>
        <feFlood floodColor={seventiesColor} floodOpacity="0.1" result="fill"/>
        <Contrast in={in1} amount={1.1}/>
        <Brightness amount={1.1}/>
        <Saturation amount={1.3} result="adjustments"/>
        <feBlend in="fill" in2="adjustments" mode="screen" result="Seventies"/>
        <IntensityOf in1="Seventies" source={in1} amount={amount} result={result}/>
    </>
;

Seventies.propTypes = FilterElementPropTypes;

export default {
    Component: Seventies,
    get caption() {
        return i18n.t('inspector.free.filters.seventies');
    },
    default: 0.5,
    min: 0,
    max: 1,
};
