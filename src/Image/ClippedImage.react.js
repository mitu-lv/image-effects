import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Bowser from 'bowser';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled, {css} from 'styled-components';

import ImageMask from './ImageMask.react';
import {FiltersPropTypes} from '../filters/types';
import BaseImage from '../BaseImage/BaseImage.react';

const OuterContainer = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;

    // Hiding overflow helps aligning cropped content with calculated entity bounds in editor
    // (as bounds are calculated in pixels but clip path for cropping in percents).
    //
    // Also fixes issue with pointer-events outside clip-path in Safari. If image is cropped and has link
    // or tooltip they can be activated with moving/clicking cursor in cropped (not visible) image parts.
    //
    // Cannot be set for masked images as calculated bounds of images with rotated mask does not match
    // real visible content. In result some content could be cut off.
    ${props => props.$clipType === 'crop' && `
        overflow: hidden;
    `}

    ${props => props.$clipType !== 'mask' && (props.$rx || props.$ry) && css`
        border-top-left-radius: ${props.$rx}px ${props.$ry}px;
        border-top-right-radius: ${props.$rx}px ${props.$ry}px;
        border-bottom-left-radius: ${props.$rx}px ${props.$ry}px;
        border-bottom-right-radius: ${props.$rx}px ${props.$ry}px;

        // Fixes border-radius for cropped images in Safari
        transform: translateZ(0);
    `}
`;

// Safari just renders SVG differently than other browsers (worse)
// and doesn't need the inner translation, also is very glitchy if rendered
// as svg <image> instead of regular <img>. Chrome is also sometimes glitchy
// with svg <image> and scales incorrectly. The only browsers that don't support
// css clip-path and need an svg <image> are IE/Edge.
//
// Safari 'SVG as clip-path' behaviour has changed since v12 - no need to remove SVG translation.
// But still Safari incorrectly allows pointer-events outside clipped area
// (hover is triggered on cursor over all image not only clipped image).
//
// “The weak can never forgive. Forgiveness is the attribute of the strong.” – Mahatma Gandhi
const parser = Bowser.getParser(window.navigator.userAgent);
const isPreV12Safari = parser.satisfies({[Bowser.BROWSER_MAP.safari]: '<12'});
const isPreV12iOS = parser.satisfies({[Bowser.PLATFORMS_MAP.ios]: '<12'});
const requiresSVGTranslation = !isPreV12Safari && !isPreV12iOS;

class ClippedImage extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        readOnly: PropTypes.bool,
        clip: PropTypes.object.isRequired,
        type: PropTypes.oneOf(['mask', 'crop']).isRequired,
        src: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        scaleX: PropTypes.number,
        scaleY: PropTypes.number,
        editing: PropTypes.bool,
        opacity: PropTypes.number,
        onDoubleClick: PropTypes.func,
        maskProps: PropTypes.object,
        accessibility: ImmutablePropTypes.record,
        filters: FiltersPropTypes.Filters,
        rx: PropTypes.number,
        ry: PropTypes.number,
    };

    static defaultProps = {
        editing: false,
    };

    render() {
        const {id, clip, type, width, height, src, opacity, filters, editing, rx, ry} = this.props;
        const imageContainerStyle = {};
        const imageStyle = {
            pointerEvents: 'auto',
            opacity,
            width,
            height,
        };
        let imageMask;

        if (type === 'mask') {
            // Shift the image by the negative mask offset so that
            // it is positioned correctly againsted the clipped area.
            if (!editing) {
                const left = clip.get('boundingBox').get('left') * width;
                const top = clip.get('boundingBox').get('top') * height;

                imageContainerStyle.left = -left;
                imageContainerStyle.top = -top;
            }

            const suffix = editing ? 'preview' : 'clip';
            imageStyle.clipPath = `url(#${id}-${suffix})`;
            imageStyle.WebkitClipPath = `url(#${id}-${suffix})`;

            imageMask = (
                <ImageMask
                    id={id}
                    mask={clip}
                    pathSuffix={suffix}
                    applyTranslation={requiresSVGTranslation || editing}
                    {...this.props.maskProps}
                />
            );
        } else if (type === 'crop') {
            // const left = clip.get('left') * width / 100;
            // const top = clip.get('top') * height / 100;

            // imageContainerStyle.left = -left;
            // imageContainerStyle.top = -top;

            // imageStyle.clipPath = `inset(${clip.get('top')}% ${clip.get('right')}% ${clip.get('bottom')}% ${clip.get('left')}%)`;
            // imageStyle.WebkitClipPath = `inset(${clip.get('top')}% ${clip.get('right')}% ${clip.get('bottom')}% ${clip.get('left')}%)`;
        } else {
            return null;
        }

        return (
            <OuterContainer $clipType={type} $rx={rx} $ry={ry}>
                {imageMask}
                <BaseImage
                    id={(this.props.readOnly && this.props.id) || undefined}
                    className="ItemContent-image"
                    src={src}
                    width={width}
                    height={height}
                    scaleX={this.props.scaleX}
                    scaleY={this.props.scaleY}
                    style={{...imageContainerStyle, ...imageStyle}}
                    onDoubleClick={this.props.onDoubleClick}
                    alt={this.props.accessibility && this.props.accessibility.label || ''}
                    filters={filters}
                    clip={clip}
                />
            </OuterContainer>
        );
    }
}

export default ClippedImage;
