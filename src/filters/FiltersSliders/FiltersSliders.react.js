import i18n from 'i18next';
import React, {PureComponent} from 'react';
import {PropTypes} from 'prop-types';
import styled from 'styled-components';

import FiltersPropTypes from '../types';
import PercentSlider from '../../../widgets/amount_slider_horizontal/PercentSlider.react';
import {adjustments} from '../filters';
import ScrollPane from '../../../widgets/ScrollPane/ScrollPane.react';

const Container = styled.div`
    padding: 10px;
`;

const Link = styled.a`
    font-size: 11px;
    display: inline-block;
    margin-top: 1em;
`;

export default class FiltersSliders extends PureComponent {
    static propTypes = {
        currentFilters: FiltersPropTypes.Filters,
        onSetFilterValue: PropTypes.func.isRequired,
        onResetFilters: PropTypes.func.isRequired,
    }

    setValue = ({name, amount}) => this.props.onSetFilterValue(name, amount)

    filterValue = (name) => this.props.currentFilters.get(name) || adjustments[name].default || 0

    render() {
        return (
            <ScrollPane>
                <Container>
                    {Object.entries(adjustments).map(([name, entry]) =>
                        <PercentSlider
                            name={name}
                            caption={entry.caption}
                            key={name}
                            amount={this.filterValue(name)}
                            min={entry.min}
                            max={entry.max}
                            onChange={this.setValue}
                        />
                    )}
                    <Link onClick={this.props.onResetFilters}>
                        {i18n.t('inspector.free.reset_to_default_1')}
                    </Link>
                </Container>
            </ScrollPane>
        );
    }
}
