import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

export const FiltersPropTypes = {
    Filters: ImmutablePropTypes.mapOf(
        PropTypes.oneOfType([PropTypes.number, PropTypes.string]), PropTypes.string
    ),
};

export const FilterElementPropTypes = {
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    in1: PropTypes.string,
    result: PropTypes.string,
};

export default FiltersPropTypes;
