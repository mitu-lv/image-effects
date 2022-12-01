import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

import filtersLibrary, {adjustments, presets} from './filters';

import './DynamicFiltersProvider.css';
import {Tint} from './filters/Tint';

export const input = idx => idx ? `fe${idx - 1}` : 'SourceGraphic';
export const output = idx => `fe${idx}`;

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

/**
 * This component provides individual filter definition for
 * every object that is custom constructed
 */
export default class DynamicFiltersProvider extends PureComponent {
    static propTypes = {
        filters: ImmutablePropTypes.mapOf(
            PropTypes.oneOfType([PropTypes.number, PropTypes.string]), PropTypes.string,
        ),
        id: PropTypes.string.isRequired,
        scaleX: PropTypes.number,
        scaleY: PropTypes.number,
    };



    render() {
        const {filters} = this.props;

        if (!filters || filters.isEmpty()) {
            return null;
        }

        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="takeNoSpace">
                <defs>
                    <filter
                        id={this.props.id}
                        // Consider using *objectBoundingBox* if
                        // position/dimensions needed (e.g. feSpotLight, fePointLight)
                        // however note that e.g. Blur filter must be adjusted.
                        // Also, seems Safari runs subjectively better on userSpace
                        primitiveUnits="userSpaceOnUse"
                        // to have better visual compatibility with Safari
                        colorInterpolationFilters="sRGB"
                        x="0" y="0" width="100%" height="100%"
                    >
                        {filters.entrySeq().sort(filterSequence).map(this.definition)}
                    </filter>
                </defs>
            </svg>
        );
    }
}
