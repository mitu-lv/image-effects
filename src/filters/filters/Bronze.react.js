import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';
import IntensityOf from './IntensityOf.react';

const baseColor = '#b77d21'; // 'rgb(161,44,199)';

/**
 * Adds bronze coloring
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount filter intensity (0-1)
 */
const Bronze = ({in1, amount, result}) =>
    <>
        <feFlood floodColor={baseColor} floodOpacity="0.32" result="fill"/>
        <feBlend in={in1} in2="fill" mode="lighten" result="tinted"/>
        <feComposite in="tinted" in2="tinted" operator="arithmetic" k1="0.5" k2="1" k3="1" k4="-0.5" result="Bronze"/>
        <IntensityOf in1="Bronze" source={in1} amount={amount} result={result}/>
    </>
;

Bronze.propTypes = FilterElementPropTypes;

export default {
    Component: Bronze,
    get caption() {
        return i18n.t('inspector.free.filters.bronze');
    },
    default: 0.5,
    min: 0,
    max: 1,
};
