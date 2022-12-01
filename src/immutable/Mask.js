import {Record} from 'immutable';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

const BASE_SCALE = .5;
const BASE_SIZE = 32;

const MaskRecord = Record({
    path: null,
    width: 0,
    height: 0,
    clipPathScale: '0 0',
    pathTransform: {
        translate: '0 0',
        origin: '0 0',
    },
    rotate: 0,
    center: {
        left: 0,
        top: 0,
    },
    boundingBox: {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    },
});

export const MaskPropShape = ImmutablePropTypes.contains({
    path: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    clipPathScale: PropTypes.string.isRequired,
    rotate: PropTypes.number.isRequired,
    pathTransform: ImmutablePropTypes.contains({
        translate: PropTypes.string.isRequired,
        origin: PropTypes.string.isRequired,
    }).isRequired,
    center: ImmutablePropTypes.contains({
        left: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
    }).isRequired,
    boundingBox: ImmutablePropTypes.contains({
        left: PropTypes.number.isRequired,
        top: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    }).isRequired,
});

export default class Mask extends MaskRecord {
    /**
     * Calculates mask transforms for the current image entity state
     * when in mask editing mode.
     *
     * @param entity
     * @param baseMask          Mask instance from which some non-changing props are taken
     */
    static calculateForEntity({entity, baseMask}) {
        const heightToWidthRatio = entity.getHeight() / entity.getWidth();

        const scaleX = heightToWidthRatio * BASE_SCALE;
        const scaleY = BASE_SCALE;

        const entityRotation = entity.getTransform().getRotate();

        const transformX = ((BASE_SIZE / scaleX) - baseMask.width) / 2;
        const transformY = ((BASE_SIZE / scaleY) - baseMask.height) / 2;

        const center = {
            left: 0.5,
            top: 0.5,
        };

        const width = baseMask.get('width') / BASE_SIZE * scaleX;
        const height = baseMask.get('height') / BASE_SIZE * scaleY;

        const boundingBox = {
            left: center.left - (width / 2),
            top: center.top - (height / 2),
            width,
            height,
        };
        const pathScaleX = scaleX / BASE_SIZE;
        const pathScaleY = scaleY / BASE_SIZE;

        return baseMask.merge({
            center,
            boundingBox,
            rotate: -entityRotation,
            clipPathScale: `${pathScaleX} ${pathScaleY}`,
            pathTransform: {
                translate: `${transformX} ${transformY}`,
                origin: `${baseMask.get('width') / 2} ${baseMask.get('height') / 2}`,
            },
        });
    }
}

