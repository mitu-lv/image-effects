import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import AccessibleWrapper from '../AccessibleWrapper';
import TooltipWrapper from '../TooltipWrapper.react';

const DEFAULT_FILL_COLOR = '#656565';

export async function initialPropsForData(data, options) {
    return {
        width: options.elementWidth,
        height: options.elementWidth,
        props: {
            fill: `{{fillColor|${DEFAULT_FILL_COLOR}}}`,
            opacity: 1,
        },
    };
}

export default class Icon extends PureComponent {
    static propTypes = {
        id: PropTypes.string.isRequired,
        opacity: PropTypes.number,
        path: PropTypes.string.isRequired,
        pathWidth: PropTypes.number.isRequired,
        pathHeight: PropTypes.number.isRequired,
        fillRule: PropTypes.string.isRequired,
        fill: PropTypes.string,
        tooltipText: PropTypes.string,
        accessibility: ImmutablePropTypes.record,
        callout: ImmutablePropTypes.map,
    };

    render() {
        const {path, pathWidth, pathHeight, fillRule} = this.props;
        let {opacity, fill} = this.props;
        const size = 32;
        const transformW = Math.max((size - pathWidth) / 2, 0);
        const transformH = Math.max((size - pathHeight) / 2, 0);
        const transform = `translate(${transformW} ${transformH})`;
        fill = fill || DEFAULT_FILL_COLOR;

        const props = {
            fill,
            transform,
            d: path,
            fillRule,
        };

        if (typeof opacity !== 'number') {
            opacity = 1;
        }

        const svgStyle = {
            opacity,
            // catch events svg level because content can be made from lines without any fill (important for tooltips)
            pointerEvents: 'auto',
            overflow: 'visible',
        };

        let onClick;
        if (this.props.callout) {
            if (this.props.callout.get('behaviour') === 'click') {
                svgStyle.cursor = 'pointer';
            } else {
                // iOS < 13 have issues with touch events if element is not link or button.
                // In result hover type callouts do not work if empty click listener (or cursor: pointer) is not set.
                onClick = () => {};
            }
        }

        let icon = (
            <svg
                key={path}
                style={svgStyle}
                width="100%"
                height="100%"
                viewBox="0 0 32 32"
                preserveAspectRatio="none"
                onClick={onClick}
            >
                <path {...props}/>
            </svg>
        );

        if (this.props.tooltipText) {
            icon = <TooltipWrapper text={this.props.tooltipText} entityKey={this.props.id}>{icon}</TooltipWrapper>;
        }

        if (this.props.accessibility && this.props.accessibility.enabled) {
            const role = this.props.callout ? 'button' : 'img';
            icon = (
                <AccessibleWrapper id={this.props.id} role={role} accessibility={this.props.accessibility}>
                    {icon}
                </AccessibleWrapper>
            );
        }

        return icon;
    }
}
