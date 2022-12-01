import i18n from 'i18next';
import React from 'react';

import {FilterElementPropTypes} from '../types';

/**
 * Basic blur. Eats performance for breakfast
 *
 * Note: the blur is coordinate space aware and
 * must be scaled together with project if
 * primitiveUnits==="userSpaceOnUse" otherwise
 * produces inconsistent result in editor/download.
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 * @param {number} amount amount of blur (0-30) (px)
 * @param {number} scaleX horizontal scale of the coordinate system (e.g. project)
 * @param {number} scaleY vertical scale of the coordinate system (e.g. project)
 */
const Blur = ({amount, in1, scaleX = 1.0, scaleY = 1.0, result}) =>
    <>
        <feGaussianBlur
            // Intensity of the blur effect along X and Y axis  (with scale applied)
            stdDeviation={`${amount * scaleX} ${amount * scaleY}`}
            in={in1}
            result={result}
        />
        <feComponentTransfer>
            <feFuncA type="table" tableValues="1 1"/>
        </feComponentTransfer>
    </>
;

Blur.propTypes = FilterElementPropTypes;

export default {
    Component: Blur,
    get caption() {
        return i18n.t('inspector.free.filters.blur');
    },
    /**
     * 30   px      if primitiveUnits="userSpaceOnUse"
     * 0.05 units   if primitiveUnits="objectBoundingBox"
     * */
    max: 30,
    min: 0,
    default: 0,
};
