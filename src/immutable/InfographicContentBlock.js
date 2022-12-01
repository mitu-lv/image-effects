import {Record, List, Map, fromJS} from 'immutable';
import invariant from 'invariant';
import {v4 as uuid} from 'uuid';

import InfographicEntity from './InfographicEntity';
import {fromRawBackground} from './Background';
import {
    getDescendant,
    getEntityAncestorKey,
    getLinkedKeyPart,
} from '../../../app/freelayout_editor/components/Presentation/interstate';

const designSetters = {
    background: fromRawBackground,
    hideFooter: setFooterVisibility,
    header: fromRawHeader,
};

const Header = Record({
    text: '',
});

function fromRawHeader(header) {
    if (!header) {
        return undefined;
    }

    if (header.text) {
        return Header({
            text: header.text,
        });
    }
    return undefined;
}

const InfographicContentBlockRecord = Record({
    key: '',
    design: Map(),
    entities: List(),
    animationSequence: undefined,
});

function setFooterVisibility(value) {
    return value;
}

export default class InfographicContentBlock extends InfographicContentBlockRecord {
    static create() {
        return new InfographicContentBlock({
            key: uuid(),
        });
    }

    static createFromJSONObject(blockKey, blockData, entityMap = {}) {
        const design = fromJS(blockData.design || {});
        const entities = List(blockData.entities || []).map(entityDataOrKey => {
            let entityData, entityKey;
            if (typeof entityDataOrKey === 'string') {
                // Its a key. Load it from external source.
                entityData = entityMap[entityDataOrKey];
                entityKey = entityDataOrKey;
                invariant(entityData, `Invalid flex structure. No entity with key ${entityKey} found.`);
            } else {
                entityData = entityDataOrKey;
                entityKey = entityDataOrKey.key;
                invariant(entityKey, `Invalid flex structure. No key found in inlined entity.`);
            }
            return InfographicEntity.fromRawEntity({...entityData, key: entityKey}, blockKey);
        });
        const animationSequence = blockData ? List(blockData.animationSequence) : undefined;
        return new InfographicContentBlock({key: blockKey, design, entities, animationSequence});
    }

    getKey() {
        return this.get('key');
    }

    getDesign() {
        return this.get('design');
    }

    getDesignProperty(name) {
        return this.getIn(['design', name]);
    }

    setDesignProperty(name, value) {
        if (designSetters[name]) {
            value = designSetters[name](value);
            if (value === undefined) {
                return this.removeIn(['design', name]);
            }
            return this.setIn(['design', name], value);
        }
        return this;
    }

    /**
     * Fairly complicated getter for the sequence
     * in which app will trigger animations on subsequent clicks.
     *
     * The order of animations must be somehow stored because it can be manually adjusted.
     * However, it must also account for any on-click entities that might have been added
     * since last manual adjustment. Every time the sequence is required -
     * either to display/manipulate in editor or to apply in presentation mode -
     * it must calculate the most up-to-date version of the list.
     *
     * @returns most up-to-date sequence that includes both defined order and any added onClick entity keys
     */
    getAnimationSequence() {
        // Take all the keys of entities with onClick trigger
        const clickAnimations = this.getEntities()
            .filter(entity => entity.getIn(['props', 'animation', 'regime']) === 'onClick')
            .map(entity => entity.getKey());

        // Take last saved animation sequence
        const animationSequence = this.get('animationSequence');

        // ...if there isn't one saved, it means list of all onClick entities is de facto the sequence
        if (!animationSequence || animationSequence.isEmpty()) {
            return clickAnimations.size ? clickAnimations : undefined;
        }

        // Append new onClick entities to the end of existing sequence
        return clickAnimations.reduce(
            (returnList, key) => {
                if (!returnList.includes(key)) {
                    return returnList.push(key);
                }
                return returnList;
            },
            animationSequence
                // ...but update old sequence to contain only entities with onClick trigger
                .filter(key => !!clickAnimations.includes(key)),
        );
    }

    setAnimationSequence(sequence) {
        return this.set('animationSequence', sequence);
    }

    getEntity(key) {
        for (const entity of this.get('entities')) {
            if (entity.getKey() === key) {
                return entity;
            }
        }
        return null;
    }

    getDescendant(key) {
        return getDescendant(key, this.get('entities'));
    }

    /**
     * @returns {Immutable.List<InfographicEntity>}
     */
    getEntities() {
        return this.get('entities');
    }

    getEntitiesByKeys(keys, {orderByKeys=false}={}) {
        const entities = this.entities.filter(entity => keys.includes(entity.key));
        if (orderByKeys) {
            return entities.sort((a, b) => keys.indexOf(a.getKey()) - keys.indexOf(b.getKey()));
        }
        return entities;
    }

    getLinkedEntitiesByKeys(keys, {orderByKeys=false}={}) {
        keys = keys.map(key => getLinkedKeyPart(key));
        const entities = this.entities.filter(entity => keys.includes(getEntityAncestorKey(entity)));
        if (orderByKeys) {
            return entities.sort((a, b) => keys.indexOf(a.getKey()) - keys.indexOf(b.getKey()));
        }
        return entities;
    }

    setEntity(key, put) {
        const entityIndex = this.getEntities().findIndex(e => e.getKey() === key);
        return this.mergeDeepIn(['entities', entityIndex], put);
    }

    setEntities(entities) {
        return this.set('entities', entities);
    }

    /**
     * @returns {Set<string>}
     */
    getEntityKeys() {
        return new Set(this.get('entities').map(({key}) => key));
    }

    getAnimationDuration(){
        return this.getEntities().reduce((total, entity)=>total += (entity.getAnimation()?.get('duration') ?? 0) * 1000, 0);
    }
}
