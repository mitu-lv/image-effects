import React from 'react';

import {FilterElementPropTypes} from '../types';

/**
 * Sepia
 *
 * Yellow and dark monochrome conversion.
 * Used as intermediate processing block for other filters.
 *
 * @param {string} in1 pointer to filter's input (same as SVG *in*)
 * @param {string} result pointer to output (same as SVG *result*)
 */
export const Sepia = ({in1, result}) =>
    <feColorMatrix
        in={in1}
        type="matrix"
        values="0.39 0.769 0.189 0  0
                0.349 0.686 0.168 0  0
                0.272 0.534 0.131 0  0
                    0  0 0 1  0"
        result={result}
    />
;

Sepia.propTypes = FilterElementPropTypes;
