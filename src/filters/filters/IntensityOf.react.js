import React from 'react';
import PropTypes from 'prop-types';

/**
 * Alpha intensity of a input
 *
 * Blends incoming [filter] with source by specified amount of opacity
 *
 * @param {string} in1 incoming image data (e.g. processed graphic) as SVG filter ref-string
 * @param {string} source original image data (e.g. unchanged "SourceGraphic") to be blended w/
 * @param {number} amount amount of input data in output (0-1)
 * @param {string} result pointer to output (same as SVG *result*)
 */
const IntensityOf = ({in1, source, amount, result}) =>
    <>
        <feComponentTransfer in={in1} result="adjustedFilter">
            <feFuncA type="linear" slope={amount}/>
        </feComponentTransfer>
        <feMerge result={result}>
            <feMergeNode in={source}/>
            <feMergeNode in="adjustedFilter"/>
        </feMerge>
    </>
;

IntensityOf.propTypes = {
    in1: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    result: PropTypes.string,
};

export default IntensityOf;
