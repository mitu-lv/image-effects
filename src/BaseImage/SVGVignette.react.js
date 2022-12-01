import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const TakeNoSpace = styled.svg`
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
`;

function absoluteUrl(fragment) {
    const baseUrl = window.location.href.replace(window.location.hash, '');
    return `${baseUrl}#${fragment}`;
}

/** Reusable radial gradient definition for image vignette */
export const VignetteRadialGradientPattern = () =>
    <>
        <stop offset="69%" stopColor="#000" stopOpacity="0"/>
        <stop offset="100%" stopColor="#000" stopOpacity=".75"/>
    </>
;

/** SVG vignette element to be overlayed over image */
export const VignetteElement = ({id, intensity}) =>
    <TakeNoSpace
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        preserveAspectRatio="none"
        style={{opacity: intensity}}
    >
        <defs>
            <radialGradient id={`vignette-${id}`}>
                <VignetteRadialGradientPattern/>
            </radialGradient>
        </defs>
        {/* If not using absolute URL, gradient not visible in embed on Safari 12 browser */}
        <rect x={0} y={0} width="100%" height="100%" fill={`url("${absoluteUrl(`vignette-${id}`)}")`}/>
    </TakeNoSpace>
;
VignetteElement.propTypes = {
    intensity: PropTypes.number,
    id: PropTypes.string,
};
