import i18n from 'i18next';

/**
 * Vignette (fake)
 *
 * Adds gradient rounded corners (only one color)
 *
 * Since Safari below version 12 (11, 10 etc.)
 * fails to work with feImage, feSpotLight, fePointLight
 * filter primitives, vignette effect is faked without
 * actual SVG filter @see <CoverImage/> component.
 *
 * When support for older Safari versions is dropped,
 * burn this and use more elegant SVG filter solution.
 *
 * This module is used only for min/max/caption definitions,
 * to keep them in the same place.
*/

export default {
    get caption() {
        return i18n.t('inspector.free.filters.vignette');
    },
    max: 1,
    min: 0,
    default: 0,
};
