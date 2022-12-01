import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import React, {PureComponent} from 'react';
import memoizee from 'memoizee';
import {rgb} from 'd3-color';

import loadImage from '../loadImage';

// import {startImageClipEditing} from '../../../actions/imageClipping';

import {MaskPropShape} from '../immutable/Mask';
import ClippedImage from './ClippedImage.react';
import {FiltersPropTypes} from '../filters/types';
import BaseImage from '../BaseImage/BaseImage.react';
import {calculateBorderSizes} from './calculateBorderSizes';

const convertUrl = (url) =>
    url.replace(/_q\.(jpg|jpeg|png|svg|gif)$/, '.$1');

export async function initialPropsForData(data, options) {
    const {url} = data;

    // If dimensions not provided (FAST),
    // download the image and then extract width, height (SLOW!)
    const {width, height} = data.width && data.height
        ? data
        : await loadImage(convertUrl(url));

    const elementWidth = options.elementWidth || width;
    const elementHeight = height / width * elementWidth;
    return {
        props: {
            opacity: 1,
            mask: null,
            crop: null,
        },
        width: elementWidth,
        height: elementHeight,
    };
}

const getTintFilter = memoizee((fill, tintIntensity) => {
    const alpha = tintIntensity / 100;
    const color = rgb(fill);
    return `${1 - alpha} 0 0 0 ${color.r / 255 * alpha} 0 ${1 - alpha} 0 0 ${color.g / 255 * alpha} 0 0 ${1 - alpha} 0 ${color.b / 255 * alpha} 0 0 0 1 0`;
});

export default class Image extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        readOnly: PropTypes.bool,
        url: PropTypes.string.isRequired,
        scaleX: PropTypes.number.isRequired,
        scaleY: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        opacity: PropTypes.number,
        tooltipText: PropTypes.string,
        mask: MaskPropShape,
        crop: ImmutablePropTypes.contains({
            top: PropTypes.number,
            right: PropTypes.number,
            bottom: PropTypes.number,
            left: PropTypes.number,
        }),
        transform: ImmutablePropTypes.contains({
            rotate: PropTypes.number,
        }),
        accessibility: ImmutablePropTypes.record,
        filters: FiltersPropTypes.Filters,
        borderRadius: PropTypes.number,
        fill: PropTypes.string,
        tintIntensity: PropTypes.number,
    };

    render() {
        const {id, url, height, width, scaleX, scaleY, mask, crop, fill, tintIntensity} = this.props;
        const borderRadius = calculateBorderSizes(width, height, scaleX, this.props.borderRadius);
        let {opacity, filters} = this.props;
        if (typeof opacity !== 'number') {
            opacity = 1;
        }

        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        if (fill && fill !== 'transparent') {
            filters = filters.set('tint', getTintFilter(fill, tintIntensity));
        }

        let graphic = null;
        if (mask || crop) {
            const clip = mask || crop;
            const type = mask ? 'mask' : 'crop';
            graphic = (
                <ClippedImage
                    id={id}
                    readOnly={this.props.readOnly}
                    clip={clip}
                    type={type}
                    src={convertUrl(url)}
                    width={scaledWidth}
                    height={scaledHeight}
                    scaleX={scaleX}
                    scaleY={scaleY}
                    opacity={opacity}
                    onDoubleClick={this._onDoubleClick}
                    accessibility={this.props.accessibility}
                    filters={filters}
                    rx={borderRadius.rx}
                    ry={borderRadius.ry}
                />
            );
        } else {
            const style = {
                pointerEvents: 'auto',
                opacity: opacity,
                width: scaledWidth,
                height: scaledHeight,
                verticalAlign: 'top',
            };
            graphic = (
                <BaseImage
                    id={(this.props.readOnly && this.props.id) || undefined}
                    className="ItemContent-image"
                    src={convertUrl(url)}
                    style={style}
                    width={width}
                    height={height}
                    scaleX={this.props.scaleX}
                    scaleY={this.props.scaleY}
                    onDoubleClick={this._onDoubleClick}
                    alt={this.props.accessibility && this.props.accessibility.label || ''}
                    filters={filters}
                    rx={borderRadius.rx}
                    ry={borderRadius.ry}
                />
            );
        }

        return graphic;
    }
}
