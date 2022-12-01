/* global PREZIGRAM */
import _ from 'lodash';
import {glassboxWebPrezigram} from '@prezi/client-logger-module';

import {logChangeFilterAdjustmentWebJs, logSelectFilterPresetWebJs} from '../../../../glassbox/client_logger';
import {filter_adjustment} from '../../../../glassbox/logger_constants';
import {adjustments} from './filters/index';
import CurrentInfographicStore from '../../app/main/stores/CurrentInfographicStore';

/** Glassbox enums are basically filter keys in caps... */
const filterToLogEnumMapping = {
    ...Object.keys(adjustments).reduce(
        (acc, name) => {
            acc[name] = name.toUpperCase();
            return acc;
        },
        {},
    ),
    // .. except hueRotate is just hue
    hueRotate: 'HUE',
};

export function logSetAdjustment(name, amount) {
    const adjustment = adjustments[name];
    if (adjustment) {
        // recalculate relative value un filter as seen by user
        const percentValue = Math.round((amount - adjustment.min)/(adjustment.max - adjustment.min) * 100);
        if (PREZIGRAM) {
            glassboxWebPrezigram.logAdjustImageFilter({
                prezi_oid: CurrentInfographicStore.infographicId,
                filter_adjustment: filter_adjustment[filterToLogEnumMapping[name]],
                filter_adjustment_value: percentValue,
            });
        } else {
            logChangeFilterAdjustmentWebJs({
                filter_adjustment: filter_adjustment[filterToLogEnumMapping[name]],
                filter_adjustment_value: percentValue,
            });
        }
    }
}

export const logSetAdjustmentDebounced = _.debounce(logSetAdjustment, 1000);

export function logSelectPreset(filter) {
    if (PREZIGRAM) {
        glassboxWebPrezigram.logSelectImageFilterPreset({
            prezi_oid: CurrentInfographicStore.infographicId,
            image_filter_preset_name: filter.keySeq().first(),
        });
    } else {
        logSelectFilterPresetWebJs({
            filter_preset_name: filter.keySeq().first(),
        });
    }
}
