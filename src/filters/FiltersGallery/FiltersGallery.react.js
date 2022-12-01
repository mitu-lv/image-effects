import i18n from 'i18next';
import React, {PureComponent} from 'react';
import {PropTypes} from 'prop-types';
import {Map} from 'immutable';
import styled from 'styled-components';

import FiltersPropTypes from '../types';

import FilterThumbnail from './FilterThumbnail.react';

import {presets} from '../filters';
import PercentSlider from '../../../widgets/amount_slider_horizontal/PercentSlider.react';
import ScrollPane from '../../../widgets/ScrollPane';

import PrezigramTheme from '../../../contexts/theme/prezigram';

import './FiltersGallery.css';

// All the filters defined in presets category
const defaultFilters = Object.keys(presets).map(filter => Map({[filter]: presets[filter].default || 0.5}));

const Container = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    background-color: #2d2d2d;

    ${props => props.theme.id === PrezigramTheme.id && `
        background-color: ${PrezigramTheme.white};
    `}
`;

export default class FiltersGallery extends PureComponent {
    static propTypes = {
        onSelect: PropTypes.func.isRequired,
        onDeselect: PropTypes.func.isRequired,
        onSetFilterValue: PropTypes.func.isRequired,
        onReset: PropTypes.func,
        filters: PropTypes.arrayOf(FiltersPropTypes.Filters),
        baseImage: PropTypes.string.isRequired,
        appliedFilters: FiltersPropTypes.Filters,
    }

    static defaultProps = {
        filters: defaultFilters,
        appliedFilters: Map(),
    }

    getSelectedPreset = () =>
        this.props.appliedFilters.findKey((_, name) => !!presets[name]);

    getSelectedPresetIntensity = () =>
        this.props.appliedFilters.find((_, name) => !!presets[name]) || 0;

    onChangeSelectedPresetIntensity = ({name, amount}) =>
        this.props.onSetFilterValue(name, amount);

    render() {
        const selectedPreset = this.getSelectedPreset();
        return (
            <div className="filtersGallery">
                <Container>
                    <div className="scrollContainer">
                        <ScrollPane>
                            <div className="list">
                                {this.props.onReset && (
                                    <FilterThumbnail
                                        url={this.props.baseImage}
                                        key="noFilter"
                                        filter={null}
                                        onSelect={this.props.onReset}
                                        onDeselect={this.props.onReset}
                                        selected={this.props.appliedFilters.isEmpty()}
                                    />
                                )}
                                {this.props.filters.map(filter =>
                                    <FilterThumbnail
                                        url={this.props.baseImage}
                                        key={filter.keySeq().first()}
                                        filter={filter}
                                        onSelect={this.props.onSelect}
                                        onDeselect={this.props.onDeselect}
                                        selected={!!this.props.appliedFilters.has(filter.keySeq().first())}
                                    />
                                )}
                            </div>
                        </ScrollPane>
                    </div>
                </Container>
                {selectedPreset && (
                    <div className="sliderBlock">
                        <PercentSlider
                            name={this.getSelectedPreset()}
                            caption={i18n.t('inspector.free.filters.intensity')}
                            min={presets[selectedPreset].min}
                            max={presets[selectedPreset].max}
                            amount={this.getSelectedPresetIntensity()}
                            onChange={this.onChangeSelectedPresetIntensity}
                            formatDecimals={0}
                        />
                    </div>
                )}
            </div>
        );
    }
}
