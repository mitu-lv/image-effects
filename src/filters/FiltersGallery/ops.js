import {presets} from '../filters';

/**
 * Set new filter preset
 *
 * Note that filter presets are never stacked, they always replace any present filter preset(s).
 * However, adjustments are not affected (even though they are also technically the same - yeah I know)
 *
 * @param {Immutable.Map({1})} preset single entry map with filter preset as {name, intensity}
 * @param {Immutable.Map({n})} filters multiple entries map that describes applied filters
 */
export const replaceFilterPreset = (preset, filters) =>
    filters
        // remove all filters that are of preset kind
        .filter((_, filterName) => !presets[filterName])
        // insert new preset
        .merge(preset)
;

/**
 * Remove filter preset
 *
 * @param {Immutable.Map({1})} preset single entry map with filter preset as {name, intensity}
 * @param {Immutable.Map({n})} filters multiple entries map that describes applied filters
 */
export const removeFilterPreset = (preset, filters) => filters.remove(preset.keySeq().first());
