import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import {Contrast} from './Contrast.react';
import {Saturation} from './Saturation.react';
import IntensityOf from './IntensityOf.react';
import {Brightness} from './Brightness.react';

/**
 * SanFrancisco
 *
 * Bloom and brighter colors for land of sun and psychodelics
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const SanFrancisco = ({in1, amount, result}) =>
    <>
        <Contrast amount={1.2} in1={in1}/>
        <Brightness amount={1.2}/>
        <Saturation amount={1.5} result="adjustments"/>
        <feGaussianBlur stdDeviation="0.01"/>
        <feComposite in2="adjustments" operator="arithmetic" k2="0.8" k3="1" result="SanFrancisco"/>
        <IntensityOf in1="SanFrancisco" source={in1} amount={amount} result={result}/>
    </>
;

SanFrancisco.propTypes = FilterElementPropTypes;

export default {
    Component: SanFrancisco,
    get caption() {
        return i18n.t('inspector.free.filters.sanfrancisco');
    },
    min: 0,
    max: 1,
    default: 0.5,
};
