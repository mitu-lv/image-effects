import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import {MaskPropShape} from '../immutable/Mask';

const AbsoluteSVG = styled.svg`
    position: absolute;
`;


class ImageMask extends PureComponent {
    static propTypes = {
        mask: MaskPropShape.isRequired,
        id: PropTypes.string.isRequired,
        pathSuffix: PropTypes.string,
        applyTranslation: PropTypes.bool,
    };

    static defaultProps = {
        pathSuffix: 'clip',
        applyTranslation: true,
    };

    render() {
        const {mask, id, pathSuffix, applyTranslation} = this.props;

        const pathTransform = mask.get('pathTransform');
        const clipPathScale = mask.get('clipPathScale');

        const translate = applyTranslation ? pathTransform.get('translate') : '0 0';
        const pathProps = {
            d: mask.get('path'),
            transform: `translate(${translate}) rotate(${mask.get('rotate')} ${pathTransform.get('origin')})`,
        };

        return (
            <AbsoluteSVG
                width="100%"
                height="100%"
                viewBox={`0 0 32 32`}
                preserveAspectRatio="none"
            >
                <defs>
                    <clipPath
                        id={`${id}-${pathSuffix}`}
                        clipPathUnits="objectBoundingBox"
                        transform={`scale(${clipPathScale})`}
                    >
                        <path {...pathProps}/>
                    </clipPath>
                </defs>
            </AbsoluteSVG>
        );
    }
}

export default ImageMask;
