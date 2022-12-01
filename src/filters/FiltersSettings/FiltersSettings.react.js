/* global PREZIGRAM */
import i18n from 'i18next';
import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import styled from 'styled-components';

import FiltersPropTypes from '../types';

import TabBar from '../../../widgets/tabbar/TabBar.react';
import FiltersGallery from '../FiltersGallery/FiltersGallery.react';
import FiltersSliders from '../FiltersSliders/FiltersSliders.react';
import Header from '../../InspectorPanel/panels/Header.react';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100% - 30px);
`;

const TabContent = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`;

export default class FiltersSettings extends Component {
    static propTypes = {
        onAddFilter: PropTypes.func.isRequired,
        onRemoveFilter: PropTypes.func.isRequired,
        onSetFilter: PropTypes.func.isRequired,
        onResetFilters: PropTypes.func.isRequired,
        currentFilters: FiltersPropTypes.Filters,
        baseImage: PropTypes.string.isRequired,
    }

    state = {selectedTabIndex: 0}

    _changeTab = (tabIdx) => this.setState({selectedTabIndex: tabIdx})

    render() {
        const {selectedTabIndex} = this.state;
        return (
            <Container>
                <Header title={i18n.t('inspector.free.adjust_and_filters')}/>
                <TabBar
                    size={'small'}
                    noUnderline={selectedTabIndex === 0 || PREZIGRAM}
                    activeIndex={selectedTabIndex}
                    onChange={this._changeTab}
                >
                    <TabBar.Item>{i18n.t('inspector.free.filters.filters')}</TabBar.Item>
                    <TabBar.Item>{i18n.t('inspector.free.filters.adjust')}</TabBar.Item>
                </TabBar>
                <TabContent>
                    {selectedTabIndex === 0 && (
                        <FiltersGallery
                            onSelect={this.props.onAddFilter}
                            onDeselect={this.props.onRemoveFilter}
                            onSetFilterValue={this.props.onSetFilter}
                            onReset={this.props.onResetFilters}
                            appliedFilters={this.props.currentFilters}
                            baseImage={this.props.baseImage}
                        />
                    )}
                    {selectedTabIndex === 1 && (
                        <FiltersSliders
                            currentFilters={this.props.currentFilters}
                            onSetFilterValue={this.props.onSetFilter}
                            onResetFilters={this.props.onResetFilters}
                        />
                    )}
                </TabContent>
            </Container>
        );
    }
}
