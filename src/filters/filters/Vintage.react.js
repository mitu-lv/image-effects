import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import IntensityOf from './IntensityOf.react';
import {Brightness} from './Brightness.react';
import {HueRotate} from './HueRotate.react';

const tint = '#e6e6fa';

/**
 * Vintage
 *
 * Gives a slightly washed-out look to an image
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const Vintage = ({in1, amount, result}) =>
    <>
        <feFlood floodColor={tint} floodOpacity="1" result="fill"/>
        <feComposite in="fill" in2={in1} operator="arithmetic" k1="0" k2="0.3" k3="1" k4="0"/>
        <Brightness amount={1.05}/>
        <HueRotate amount={-10} result="Vintage"/>
        <IntensityOf in1="Vintage" source={in1} amount={amount} result={result}/>
    </>
;

Vintage.propTypes = FilterElementPropTypes;

export default {
    Component: Vintage,
    get caption() {
        return i18n.t('inspector.free.filters.vintage');
    },
    default: 0.5,
    min: 0,
    max: 1,
};
