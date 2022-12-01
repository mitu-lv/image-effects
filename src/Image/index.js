import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import invariant from 'invariant';

import Image, {initialPropsForData as imageInitialProps} from './Image.react';
import Icon, {initialPropsForData as iconInitialProps} from './Icon.react';
import {calculateClippedRectangle} from '../../../../../components/FreeLayoutEditor/util/clippedEntity';
import Link from '../Link/Link.react';
import LinkPreview from '../Link/LinkPreview.react';
import {engagementEvent} from '../../../../../components/EngagementAnalytics/EngagementAnalytics.actions';


const subTypeMap = {
    image: Image,
    atlasImage: Image,
    icon: Icon,
};

export async function initialPropsForData(data, options) {
    if (data.subType === 'icon') {
        return iconInitialProps(data, options);
    }
    return imageInitialProps(data, options);
}

export default class ImageComponent extends PureComponent {
    static propTypes = {
        inEditMode: PropTypes.bool,
        entity: PropTypes.shape({
            getProperty: PropTypes.func.isRequired,
            getKey: PropTypes.func.isRequired,
            getWidth: PropTypes.func.isRequired,
            getHeight: PropTypes.func.isRequired,
            getTransform: PropTypes.func.isRequired,
            getFilters: PropTypes.func.isRequired,
            getCallout: PropTypes.func.isRequired,
            getAccessibility: PropTypes.func.isRequired,
        }).isRequired,
        design: PropTypes.any.isRequired,
        assets: PropTypes.shape({getURL: PropTypes.func.isRequired}),
        onLinkPreviewClickPage: PropTypes.func,
        onLinkPreviewClickTab: PropTypes.func,
        scaleX: PropTypes.number.isRequired,
        scaleY: PropTypes.number.isRequired,
    };

    state = {}

    static getDerivedStateFromProps(props) {
        const {entity} = props;
        const link = entity.getProperty('link');

        let linkProps;
        let component;
        const wrapperSize = {};

        if (!props.inEditMode) {
            const clip = calculateClippedRectangle(entity);
            wrapperSize.width = clip.width * props.scaleX;
            wrapperSize.height = clip.height * props.scaleY;

            if (link) {
                component = Link;
                linkProps = {
                    onClick: function() {
                        engagementEvent(entity.getKey(), 'link', 'click');
                    },
                    url: link,
                    ...wrapperSize,
                };
            }
        }

        return {
            wrapperSize,
            LinkComponent: component,
            linkProps,
        };
    }

    render() {
        const {entity, design, assets, scaleX, scaleY, inEditMode} = this.props;
        const url = assets.getURL(entity.getProperty('assetId'));
        const subType = entity.getProperty('subType') || 'image';
        const Component = subTypeMap[subType];
        invariant(!!Component, `Unknown IMAGE type '${subType}'`);

        if (Component) {
            const component = (
                <Component
                    id={entity.getKey()}
                    readOnly={!inEditMode}
                    url={url}
                    opacity={entity.getProperty('opacity')}
                    mask={entity.getProperty('mask')}
                    crop={entity.getProperty('crop')}
                    path={entity.getProperty('path')}
                    fill={entity.getProperty('fill', design)}
                    tintIntensity={entity.getProperty('tintIntensity', design)}
                    pathWidth={entity.getProperty('width')}
                    pathHeight={entity.getProperty('height')}
                    width={entity.getWidth()}
                    height={entity.getHeight()}
                    transform={entity.getTransform()}
                    tooltipText={entity.getProperty('tooltipText')}
                    scaleX={scaleX}
                    scaleY={scaleY}
                    filters={entity.getFilters()}
                    accessibility={inEditMode ? undefined : entity.getAccessibility()}
                    callout={inEditMode ? undefined : entity.getCallout()}
                    borderRadius={entity.getProperty('rx')}
                    fillRule={entity.getProperty('fillRule') || 'evenodd'}
                />
            );

            if (this.state.LinkComponent) {
                const {LinkComponent, linkProps} = this.state;
                return (<LinkComponent {...linkProps}>{component}</LinkComponent>);
            } else if (this.state.wrapperSize.width && this.state.wrapperSize.height) {
                return <div style={this.state.wrapperSize}>{component}</div>;
            }
            return component;
        }
        return null;
    }
}
