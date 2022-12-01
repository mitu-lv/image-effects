import i18n from 'i18next';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import FiltersPropTypes from '../types';
import CoverImage from '../../CoverImage/CoverImage.react';
import filters from '../filters';

import PrezigramTheme from '../../../contexts/theme/prezigram';

const Icon = styled.div`
    /* aligned with tab bar blue selector width */
    width: 95px;
    height: 95px;
    overflow: hidden;
    border-radius: 6px;
    box-sizing: border-box;
    border: 2px solid transparent;

    ${props => props.theme.id === PrezigramTheme.id && `
        width: 101px;
        height: 101px;
    `}
`;

const Thumbnail = styled.div`
    cursor: pointer;
    margin-bottom: 25px;
    position: relative;

    &:nth-child(2n+1) {
        margin-right: 10px;
    }

    &:hover ${Icon} {
        border: 2px solid ${({theme}) => theme.id === PrezigramTheme.id ? PrezigramTheme.blue500 : '#3195CB'};
    }

    ${props => props.selected && `
        ${Icon} {
            border: 2px solid ${props.theme.id === PrezigramTheme.id ? PrezigramTheme.blue500 : '#3195CB'};
        }
    `}
`;

const CheckIcon = styled.img``;

const CheckBar = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 1.5em;
    background-color: #3195CB;
    bottom: 0;
    margin: 0 -2px;
    border-bottom-right-radius: 6px;
    border-bottom-left-radius: 6px;

    ${props => props.theme.id === PrezigramTheme.id && `
        border-radius: 0;
        background-color: transparent;
        margin: 0;
        width: 0;
        height: 0;
        right: 2px;
        top: 2px;
        border-top: 26px solid ${PrezigramTheme.blue500};
        border-left: 26px solid transparent;

        ${CheckIcon} {
            position: absolute;
            top: -21px;
            right: 2px;
        }
    `}
`;

const Caption = styled.div`
    color: #fff;
    font-size: 11px;
    font-weight: 500;
    line-height: 2;
    text-align: center;
    width: 100%;
    position: absolute;

    ${props => props.theme.id === PrezigramTheme.id && `
        font-family: ${PrezigramTheme.fonts.ralewayBold};
        color: ${PrezigramTheme.neutral600};
    `}
`;

export default class FilterThumbnail extends PureComponent {
    static propTypes = {
        url: PropTypes.string.isRequired,
        filter: FiltersPropTypes.Filters,
        onSelect: PropTypes.func.isRequired,
        onDeselect: PropTypes.func.isRequired,
        selected: PropTypes.bool,
    }

    static defaultProps = {
        filter: null,
        selected: false,
    }

    onClick = () =>
        this.props.selected
            ? this.props.onDeselect(this.props.filter)
            : this.props.onSelect(this.props.filter)

    render() {
        const {url, filter, selected} = this.props;
        const name = filter ? filter.keySeq().first() : 'original';
        return (
            <Thumbnail selected={selected} onClick={this.onClick}>
                <Icon>
                    <CoverImage url={url} filters={filter}/>
                    {selected && (
                        <CheckBar>
                            <CheckIcon src={require('./check.svg')}/>
                        </CheckBar>
                    )}
                </Icon>
                <Caption>
                    {filter ? filters[name].caption : i18n.t('inspector.free.filters.original')}
                </Caption>
            </Thumbnail>
        );
    }
}
