import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import IntensityOf from './IntensityOf.react';
import {Contrast} from './Contrast.react';
import {Brightness} from './Brightness.react';
import {Saturation} from './Saturation.react';

/**
 * Riga
 *
 * Everything is gray and slightly depressing
 * for most of the year
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const Riga = ({amount, in1, result}) =>
    <>
        <Contrast amount={0.9}/>
        <Brightness amount={0.9}/>
        <Saturation amount={0.8} result="Riga"/>
        <IntensityOf in1="Riga" source={in1} amount={amount} result={result}/>
    </>
;

Riga.propTypes = FilterElementPropTypes;

export default {
    Component: Riga,
    get caption() {
        return i18n.t('inspector.free.filters.riga');
    },
    max: 1,
    min: 0,
    default: 0.5,
};
