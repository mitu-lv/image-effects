import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import Bowser from 'bowser';
import cx from 'classnames';
import uuid from 'uuid';
import styled, {css} from 'styled-components';

import filtersLibrary, {adjustments, presets} from '../filters/filters';
// import DynamicFiltersProvider from '../filters/DynamicFiltersProvider.react';
import {VignetteRadialGradientPattern, VignetteElement} from './SVGVignette.react';

import './BaseImage.css';
import '../filters/DynamicFiltersProvider.css';
import {Tint} from '../filters/filters/Tint';
import {amountOf} from '../filters/utils';

// Browser detection
const parser = Bowser.getParser(window.navigator.userAgent);

const msIEOrEdge = parser.isBrowser(Bowser.BROWSER_MAP.ie)
    || parser.isBrowser(Bowser.BROWSER_MAP.edge);
const isSafari = parser.isBrowser(Bowser.BROWSER_MAP.safari);
const isFirefox = parser.isBrowser(Bowser.BROWSER_MAP.firefox);

const BaseImageContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    /* For safari to display clipPath */
    transform: translateZ(0);

    ${props => (props.$rx || props.$ry) && css`
        border-top-left-radius: ${props.$rx}px ${props.$ry}px;
        border-top-right-radius: ${props.$rx}px ${props.$ry}px;
        border-bottom-left-radius: ${props.$rx}px ${props.$ry}px;
        border-bottom-right-radius: ${props.$rx}px ${props.$ry}px;

        // Overflow breaks masked images, can be set only for images with border radius and without mask:
        // a) If image is rotated and mask is rotated, content goes out of item bounds,
        //    that is not correct - but that is how rotated masks are implemented. Overflow
        //    cuts part of content.
        // b) In Safari >=v14 parent overflow changes how scale of clip-path for masked images
        //    work. Without overflow scales to original image size, with overflow it scales to
        //    bounds and deforms shape of mask.
        overflow: hidden;
    `}
`;

const cachedNothing = Object.freeze({
    id: undefined,
    filter: undefined,
    svgFilters: undefined,
    vignette: undefined,
});

const noop = () => {};

function relativeV(value) {
    const min = 0.1;
    const max = 0.3;
    return (value - min) / (max - min);
  }

function getVignetteRect({width, height, clip}) {
    if (!clip) {
        return {left: 0, top: 0, width, height};
    }
    if (clip.has('boundingBox')) {
        /* MASK */
        return {
            left: clip.getIn(['boundingBox', 'left']) * width,
            top: clip.getIn(['boundingBox', 'top']) * height,
            width: clip.getIn(['boundingBox', 'width']) * width,
            height: clip.getIn(['boundingBox', 'height']) * height,
        };
    }
    /* CROP */
    // Croppping area is defined with actual percentages, must convert
    return {
        left: clip.get('left') * width * 0.01,
        top: clip.get('top') * height * 0.01,
        width: width * 0.01 * (100 - clip.get('right') - clip.get('left')),
        height: height * 0.01 * (100 - clip.get('bottom') - clip.get('top')),
    };
}

function genNewKeyOnEveryMaskMove({clip}) {
    if (!clip || !clip.has('boundingBox')) {
        return undefined;
    }
    const left = clip.getIn(['boundingBox', 'left']);
    const top = clip.getIn(['boundingBox', 'top']);
    const rotation = clip.get('rotate');
    return `mask-${left}-${top}-${rotation}`;
}


/**
 * Filters must be in strict sequence to avoid unwanted artefacts
 * Rules are: always presets first (and there should be just one),
 * follow adjustments in alphabetical order
 */
 const sequence = [
    ...Object.keys(presets).sort(),
    ...Object.keys(adjustments).sort(),
    'tint',
];
const filterSequence = (a, b) => sequence.indexOf(a[0]) - sequence.indexOf(b[0]);

export const input = idx => idx ? `fe${idx - 1}` : 'SourceGraphic';
export const output = idx => `fe${idx}`;

/**
 * Base Image
 *
 * Smart image component, that renders differently based on content
 * and platform for compatibility
 *
 * You should be able to use it as if basic <img>
 * and it would add/manage required subcomponents based on props
 *
 */
export default class BaseImage extends PureComponent {
    static propTypes = {
        id: PropTypes.string,
        src: PropTypes.string.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        scaleX: PropTypes.number,
        scaleY: PropTypes.number,
        className: PropTypes.string,
        style: PropTypes.object,
        onMouseDown: PropTypes.func,
        onDoubleClick: PropTypes.func,
        alt: PropTypes.string,
        clip: PropTypes.object,
        filters: ImmutablePropTypes.mapOf(
            PropTypes.oneOfType([PropTypes.number, PropTypes.string]), PropTypes.string
        ),
        rx: PropTypes.number,
        ry: PropTypes.number,
    }

    static defaultProps = {
        style: {},
    }

    state = cachedNothing

    static getState =
        (filters) => {
            if (filters && !filters.isEmpty()) {
                const id = uuid();

                /**
                 * Vignette is not a real filter,
                 * that's why we have to pick out
                 * before giving filters to provider
                 */
                const vignette = amountOf(filters, 'vignette');
                const rounded = amountOf(filters, 'rounded');
                let svgFilters = filters.delete('vignette');
                svgFilters = svgFilters.delete('rounded');

                if (svgFilters.isEmpty()) {
                    return {
                        id,
                        vignette,

                        /**
                         * Explicitly unset filter properties in state
                         * because if just omitted, will have the old values
                         */
                        filter: undefined,
                        svgFilters: undefined,
                    };
                }
                return {
                    id,
                    vignette,
                    filter: `url(#${id})`,
                    svgFilters,
                    isRounded: rounded > 0,
                    rounded: filters.get('rounded'),
                };
            }
            return cachedNothing;
        }

    static getDerivedStateFromProps({filters}) {
        return BaseImage.getState(filters);
    }

    haveFilters = () => this.props.filters && !this.props.filters.isEmpty()

    hasMask = () => this.props.clip && this.props.clip.has('boundingBox')

    hasCrop = () => this.props.clip && this.props.clip.has('right')

    /**
     * Use SVG <image> instead of HTML <img> for compatibility
     *
     * 1) IE does not support filters and clipPath on <img>
     * 2) on Firefox w/ vignette, mask gets distorted near the edges on HTML
     */
    useSvgFallback = () => (this.props.style.clipPath || this.haveFilters())
        || (this.hasMask() && this.state.vignette)

    renderSVG = () =>
        <svg
            className={cx('ItemContent-image', 'svgBlock')}
            width={this.props.width}
            height={this.props.height}
            style={{top: this.props.style.top, left: this.props.style.left}}
            viewBox={`0 0 ${this.props.width} ${this.props.height}`}
            // fix vignette-hole not moving in sync with mouse on IE11
            key={msIEOrEdge && this.props.clip && this.state.vignette ? Date.now() : undefined}
        >
            {this.renderSVGImageWithVignette()}
        </svg>

    definition = ([name, amount], idx) => {
        const FilterComponent = name === 'tint' ? Tint : filtersLibrary[name].Component;
        return (
            <FilterComponent
                in1={input(idx)}
                amount={amount}
                result={output(idx)}
                key={name}
                scaleX={this.props.scaleX}
                scaleY={this.props.scaleY}
            />
        );
    };

    renderSVGImage = () =>
        <image
            style={this.props.style}
            xlinkHref={this.props.src}
            width={this.props.width}
            height={this.props.height}
            filter={this.state.filter}
        />

    calcRounded = () => {
        const {width:sizeWidth, height: sizeHeight} = this.props;
        const rounded = this.state.rounded / 2;
        const minDim = Math.min(sizeWidth, sizeHeight);
        let x = 0;
        let y = 0;
        let rx = minDim * rounded;
        let width = sizeWidth;
        let height = sizeHeight;

        if (rounded < 0.1) {

        } else if (rounded >= 0.3) {
            x = (sizeWidth - minDim) / 2;
            y = (sizeHeight - minDim) / 2;
            width = minDim;
            height = minDim;
        } else {
            if (sizeWidth < sizeHeight) {
                const o = (sizeHeight - sizeWidth) * relativeV(rounded) / 2;
                y = o/2;
                height = sizeHeight - o;
            } else {
                height = minDim;
                const o = (sizeWidth - sizeHeight) * relativeV(rounded) / 2;
                x = o/2
                width = sizeWidth - o;
            }
        }
        return (
            <mask id={`${this.state.id}-mask`}>
                <rect x={x} y={y} rx={rx} width={width} height={height} fill="white"/>
            </mask>
        );
    }

    renderSVGImageWithVignette = () => {
        const {src, width, height} = this.props;
        const {vignette, filter, svgFilters} = this.state;

        const vignetteRect = getVignetteRect(this.props);
        const vignetteId = `vignette-${this.state.id}`;

        return (
            <>
                <defs>
                    {this.haveFilters() && (<filter
                        id={this.state.id}
                        // Consider using *objectBoundingBox* if
                        // position/dimensions needed (e.g. feSpotLight, fePointLight)
                        // however note that e.g. Blur filter must be adjusted.
                        // Also, seems Safari runs subjectively better on userSpace
                        primitiveUnits="userSpaceOnUse"
                        // to have better visual compatibility with Safari
                        colorInterpolationFilters="sRGB"
                        x="0" y="0" width="100%" height="100%"
                    >
                        {svgFilters.entrySeq().sort(filterSequence).map(this.definition)}
                    </filter>)}
                    {this.state.isRounded && this.calcRounded()}
                    {/*
                        Render gradient dynamically on the fly in the clip area.
                        Note: moving around static gradient resulted in weird
                        glitches and deforming mask ¯\_(ツ)_/¯
                    */}
                    {vignette && (
                    <radialGradient
                        id={vignetteId}
                        cx={vignetteRect.left + vignetteRect.width / 2}
                        cy={vignetteRect.top + vignetteRect.height / 2}
                        r={Math.max(vignetteRect.width, vignetteRect.height) / 2}
                        gradientUnits="userSpaceOnUse"
                    >
                        <VignetteRadialGradientPattern/>
                    </radialGradient>
                    )}
                </defs>
                <g style={this.props.style}>
                    <image
                        xlinkHref={src}
                        width={width}
                        height={height}
                        filter={filter}
                        mask={this.state.isRounded ? `url(#${this.state.id}-mask)` : undefined}
                    />
                    {vignette && (<rect
                        x="0"
                        y="0"
                        width={width}
                        height={height}
                        style={{opacity: vignette}}
                        fill={`url(#${vignetteId})`}
                        mask={this.state.isRounded ? `url(#${this.state.id}-mask)` : undefined}
                    />)}
                </g>
            </>
        );
    }

    renderImageWithVignette = () => {
        const vignetteStyle = this.props.clip
            ? {
                ...getVignetteRect(this.props),
                transform: `rotate(${this.props.clip.get('rotate') || 0}deg)`,
            }
            : undefined;
        return (
            <div
                className={cx('imageContainer', {['fixDeselectJump']: !isSafari})}
                style={this.props.style}
            >
                <img
                    className={cx('ItemContent-image', 'imageBlock')}
                    src={this.props.src}
                    style={{
                        filter: this.state.filter,
                        WebkitFilter: this.state.filter,
                    }}
                    alt={this.props.alt}
                />
                <div
                    className='vignetteContainer'
                    style={vignetteStyle}
                >
                    <VignetteElement intensity={this.state.vignette} id={this.state.id}/>
                </div>
            </div>
        );
    }

    renderImage = () =>
        <img
            className={cx('ItemContent-image', 'imageBlock')}
            src={this.props.src}
            style={{
                ...this.props.style,
                filter: this.state.filter,
                WebkitFilter: this.state.filter,
            }}
            alt={this.props.alt}
        />

    render() {
        return (
            <BaseImageContainer
                $rx={!this.hasMask() ? this.props.rx : 0}
                $ry={!this.hasMask() ? this.props.ry : 0}
                className={cx(this.props.className,
                    {fixCropNotVisibleOnIE: msIEOrEdge && this.hasCrop()}
                )}
                // Fixes weird iOS Safari bug
                // https://bugless.io/app/bug/1563526993.019600
                // My guess - because content of div is *pointer-events: none*,
                // Safari for some reason optimises listeners and doesn't attach/fire them.
                // If you add empty *onClick* listener or *tabIndex=-1/0*, it forces Safari to expect input.
                // Note: *tabIndex* breaks the backspace-to-delete functionality.
                onClick={noop}
                onMouseDown={this.props.onMouseDown}
                onDoubleClick={this.props.onDoubleClick}
                // on Safari dragged mask (w/o filters) is not re-rendered otherwise
                id={this.props.id}
                key={this.props.id || isSafari && genNewKeyOnEveryMaskMove(this.props)}
            >
                {/* {this.haveFilters() && (
                    <DynamicFiltersProvider
                        filters={this.state.svgFilters}
                        id={this.state.id}
                        scaleX={this.props.scaleX}
                        scaleY={this.props.scaleY}
                    />
                )} */}
                {this.useSvgFallback()
                    ? this.renderSVG()
                    : this.state.vignette
                        ? this.renderImageWithVignette()
                        : this.renderImage()
                }
            </BaseImageContainer>
        );
    }
}
