import i18n from 'i18next';
import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button from '../../widgets/button/Button.react';
import PrezigramTheme from '../../contexts/theme/prezigram';

const StyledButton = styled(Button).attrs(({theme}) => ({
    iconSVG: theme.id === PrezigramTheme.id
        ? require('./icon-dark.svg')
        : require('./icon.svg'),
}))`
    ${({theme}) => theme.id === PrezigramTheme.id && `
        background-color: ${PrezigramTheme.neutral80};
        color: ${PrezigramTheme.neutral600};

        &:hover {
            color: inherit;
            background-color: ${PrezigramTheme.neutral100};
        }
    `}
`;

export default class FiltersButton extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
    }

    render() {
        return (
            <StyledButton
                gray
                small
                wide
                center
                onClick={this.props.onClick}
            >
                {i18n.t('inspector.free.adjust_and_filters')}
            </StyledButton>
        );
    }
}
