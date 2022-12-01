import blur from './Blur.react';
import brightness from './Brightness.react';
import contrast from './Contrast.react';
import saturation from './Saturation.react';
import blackAndWhite from './BlackAndWhite.react';
import hueRotate from './HueRotate.react';
import hdr from './HDR.react';
import seventies from './Seventies.react';
import bronze from './Bronze.react';
import vintage from './Vintage.react';
import budapest from './Budapest.react';
import riga from './Riga.react';
import sanfrancisco from './SanFrancisco.react';
import vignette from './FakeVignette';

/**
 * For compatibility with Safari 11-
 * Vignette, Vignette blend and Focus
 * have deen removed from exports.
 *
 * TODO: re-enable and cleanup when anything below Safari 12
 * is deprecated.
 *
 * Add component imports to adjustments and presets,
 * to enable missing filters
 */

export const adjustments = {
    blur,
    brightness,
    contrast,
    saturation,
    hueRotate,
    vignette,
};

export const presets = {
    blackAndWhite,
    hdr,
    riga,
    seventies,
    sanfrancisco,
    bronze,
    budapest,
    vintage,
};

export default {
    ...adjustments,
    ...presets,
};
