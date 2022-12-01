import {
    Record,
    List,
    OrderedMap,
    Map,
} from 'immutable';

import PageSize from './PageSize';
import {Background} from './Background';

const InfographicStateRecord = Record({
    blocks: List(),
    pageSize: new PageSize({
        width: 960,
        height: 720,
    }),
    //When changing something in design and designDefaults,
    //please verify that nothing breaks in ContentSchema in flexSchema/validate.js
    //Generally, keep both (this and that) files in sync
    design: Map(),
    designDefaults: Map({
        block: Map({
            background: Background({color: '{{backgroundColor|#FFFFFF}}'}),
            hideFooter: false,
        }),
        entity: Map(),
    }),
    layouts: Map(),
    assets: undefined,
    customLogo: undefined,
    notes: undefined,
});

export default class InfographicState extends InfographicStateRecord {
    getDesign() {
        return this.get('design');
    }

    getDesignDefaults() {
        return this.get('designDefaults');
    }

    getLayouts() {
        return this.get('layouts');
    }

    /**
     * @returns {List<InfographicContentBlock>}
     */
    getBlocks() {
        return this.get('blocks');
    }

    getBlock(key) {
        return this.findBlockByKey(key);
    }

    getBlockForEnityKey(key) {
        for (const block of this.get('blocks')) {
            for (const entity of block.getEntities()) {
                if (entity.getKey() === key) {
                    return block;
                }
            }
        }
    }

    getBlockIndex(key) {
        const block = this.getBlock(key);
        return this.getBlocks().indexOf(block);
    }

    getPreviousBlock(block) {
        const blockIndex = this.getBlocks().indexOf(block);
        return this.getBlocks().get(blockIndex - 1);
    }

    getNextBlock(block) {
        const blockIndex = this.getBlocks().indexOf(block);
        return this.getBlocks().get(blockIndex + 1);
    }

    findBlockByKey(key) {
        const blocks = this.getBlocks().filter(block => block.getKey() === key);
        if (blocks.size > 1) {
            //should not happen
            throw new Error(`More than one block present with key ${key}`);
        }
        if (blocks.size) {
            return blocks.get(0);
        }
        return null;
    }

    getPageSize() {
        return this.get('pageSize');
    }

    getEntity(key) {
        for (const block of this.get('blocks')) {
            const entity = block.getEntity(key);
            if (entity) {
                return entity;
            }
        }
        return null;
    }

    /**
     * @param {string[]} [keys]
     * @returns {Immutable.OrderedMap<string, InfographicEntity>}
     */
    getEntities(keys) {
        // Here we always need to return in order they appear in blocks
        return OrderedMap().withMutations(entities => {
            for (const block of this.get('blocks')) {
                for (const entity of block.getEntities()) {
                    if (!keys || keys.includes(entity.getKey())) {
                        entities.set(entity.getKey(), entity);
                    }
                }
            }
        });
    }

    containsEntity(key) {
        return !!this.getEntity(key);
    }

    removeEntities(...entityKeys) {
        const nextContents = this.merge({
            blocks: this.getBlocks().map(block =>
                block.set('entities', block.getEntities().filter(entity =>
                    entityKeys.indexOf(entity.getKey()) === -1
                ))
            ),
        });
        return nextContents.update('layouts', (layouts) => {
            return layouts.reduce((layouts, layout, layoutName) => {
                if (!layout.has('entities')) {
                    return layouts;
                }
                return layouts.set(layoutName, layout.update('entities', (entities) => {
                    entityKeys.forEach(key => entities = entities.delete(key));
                    return entities;
                }));
            }, layouts);
        });
    }

    moveEntitiesToBlock(blockKey, entityKeys) {
        if (!entityKeys || entityKeys.isEmpty()) {
            return this;
        }

        const firstEntity = this.getEntity(entityKeys.first());
        const originalBlock = this.getBlock(firstEntity.blockKey);
        if (originalBlock.getKey() === blockKey) {
            return this;
        }

        let entities = originalBlock.getEntitiesByKeys(entityKeys);
        entities = entities.map(entity => entity.set('blockKey', blockKey));

        return this.merge({
            blocks: this.getBlocks().map(block => {
                if (block.getKey() === blockKey) {
                    return block.set('entities', block.getEntities().push(...entities));
                }
                return block.set('entities', block.getEntities().filter(entity =>
                    entityKeys.indexOf(entity.getKey()) === -1
                ));
            }),
        });
    }

    getAssets() {
        return this.get('assets');
    }

    getCustomLogo() {
        return this.get('customLogo');
    }

    getNotes() {
        return this.get('notes');
    }
}
