import {
    is,
    fromJS,
    Record,
    List,
    Map,
    Iterable,
} from 'immutable';
import invariant from 'invariant';
import uuid from 'uuid/v4';

import InfographicState from './InfographicState';
import InfographicContentBlock from './InfographicContentBlock';
import Assets from './Assets';

import PageSize from './PageSize';

import resolveDesignProperty from './resolveDesignProperty';
import {autoLayoutAdminEnabled} from '../../InspectorPanel/panels/PageAutoLayout/utils/autoLayoutBetaFlags';
import {EDITOR_DEFAULT_LAYOUT_NAME} from '../../../app/freelayout_editor/constants/EditorConstants';
import {CustomLogoRecord} from '../../../../../public/js/prezigram/watermark/defaultLogo';

const EditorStateRecord = Record({
    currentContent: null,
    fonts: Map(),
    customFonts: Map(),
});

export default class EditorState {
    static createEmpty() {
        return EditorState.createFromJSONObject({
            content: {
                blocks: {},
                blockOrder: [],
                entities: {},
                layouts: {},
            },
        });
    }

    static createFromJSONObject(json) {
        const stateObject = {};
        const contentObject = {};
        invariant(json.content, `Invalid flex structure. No content found.`);
        invariant(json.content.blockOrder, `Invalid flex structure. No blockOrder found.`);
        contentObject.blocks = List(json.content.blockOrder).map(blockKey => {
            const blockData = json.content.blocks[blockKey];
            invariant(blockData, `Invalid flex structure. No block with key ${blockKey} found.`);
            if (autoLayoutAdminEnabled()) {
                // this logs data needed to add project to sandbox for tests
                // so you can then copy paste it there for debugging and tuning
                // just use JSON.stringify on this and then copy/paste to SandboxPages.js
                console.log('createFromJSONObject', {
                    name: '',
                    grid: json.gridSettings,
                    size: json.pageSize,
                    block: [blockKey, blockData, json.content.entities],
                });
            }

            return InfographicContentBlock.createFromJSONObject(blockKey, blockData, json.content.entities);
        });
        contentObject.layouts = fromJS(json.content.layouts || {});
        if (json.pageSize) {
            contentObject.pageSize = new PageSize(json.pageSize);
        }
        if (json.design) {
            contentObject.design = fromJS(json.design);
        }
        if (json.designDefaults) {
            contentObject.designDefaults = fromJS(json.designDefaults);
        }
        if (json.fonts) {
            stateObject.fonts = Map(json.fonts);
        }
        if (json.customFonts) {
            stateObject.customFonts = Map(json.customFonts);
        }
        contentObject.assets = Assets.createFromObject(json.assets);
        if (json.customLogo) {
            contentObject.customLogo = new CustomLogoRecord(json.customLogo);
        }
        contentObject.notes = Map(json.notes || {});
        stateObject.currentContent = new InfographicState(contentObject);
        return new EditorState(EditorStateRecord(stateObject));
    }

    toJSONObject() {
        const pageSize = this.getPageSize();
        const content = this.getCurrentContent();
        const design = this.getDesign();
        const designDefaults = this.getDesignDefaults();
        const fonts = this.getFonts();
        const assets = this.getAssets();
        const notes = this.getNotes();

        const blocks = {};
        const entities = {};
        const blockOrder = [];

        for (const block of content.getBlocks()) {
            const blockKey = block.getKey();
            const animationSequence = block.getAnimationSequence();
            blockOrder.push(blockKey);
            blocks[blockKey] = {
                design: block.getDesign().toJS(),
                entities: [],
                animationSequence: animationSequence ? animationSequence.toArray() : undefined,
            };
            for (const entity of block.getEntities()) {
                const entityKey = entity.getKey();
                blocks[blockKey].entities.push(entityKey);
                const rawEntity = entity.toJS();
                delete rawEntity.blockKey;
                delete rawEntity.key;
                entities[entityKey] = rawEntity;
            }
        }

        return {
            fonts: fonts.toJS(),
            customFonts: this.customFonts.toJS(),
            pageSize: pageSize.toJS(),
            design: design.toJS(),
            designDefaults: designDefaults.toJS(),
            content: {
                blocks,
                blockOrder,
                entities,
                layouts: this.getLayouts().toJS(),
            },
            assets: assets.toJS(),
            customLogo: this.customLogo ? this.customLogo.toObject() : undefined,
            notes: !notes.isEmpty() ? notes.toObject() : undefined,
        };
    }

    static set(editorState, put) {
        const state = editorState.getImmutable();
        return new EditorState(state.merge(put));
    }

    static setPageSize(editorState, size) {
        const content = editorState.getCurrentContent().set('pageSize', new PageSize(size));
        return EditorState.set(editorState, {
            currentContent: content,
        });
    }

    static setDesign(editorState, design) {
        const content = editorState.getCurrentContent().set('design', design);
        return EditorState.set(editorState, {
            currentContent: content,
        });
    }

    static setDesignDefaults(editorState, defaults) {
        if (!defaults.has('block') || !defaults.has('entity')) {
            throw new Error('Invalid desing defaults');
        }
        const content = editorState.getCurrentContent().set('designDefaults', defaults);
        return EditorState.set(editorState, {
            currentContent: content,
        });
    }

    static addFontReference(editorState, font) {
        let fonts = editorState.getFonts();
        const fontKey = fonts.findKey((f) => font.family === f.family);
        if (fontKey) {
            const existingFont = fonts.get(fontKey);
            //Should handle both cases when `url` field is defiend (in branding)
            //and when it is undefined (as in google fonts)
            if (existingFont.url === font.url) {
                return editorState;
            }
            fonts = fonts.delete(fontKey);
        }
        const newFonts = fonts.set(uuid(), font);
        return EditorState.set(editorState, {
            fonts: newFonts,
        });
    }

    constructor(immutable) {
        this._immutable = immutable;
    }

    getPageSize() {
        return this.getCurrentContent().getPageSize();
    }

    getDesign() {
        return this.getCurrentContent().getDesign();
    }

    getDesignDefaults() {
        return this.getCurrentContent().getDesignDefaults();
    }

    getBlockDesignProperty(blockOrKey, property, resolve = true) {
        let propValue;
        if (typeof(blockOrKey) === 'string') {
            const block = this.getCurrentContent().getBlock(blockOrKey);
            propValue = block.getDesignProperty(property);
        } else if (blockOrKey && blockOrKey.getDesignProperty) {
            propValue = blockOrKey.getDesignProperty(property);
        }

        if (!propValue) {
            propValue = this.getDesignDefaults().getIn(['block', property]);
        }

        if (!resolve) {
            return propValue;
        }
        return traverse(propValue, objectWithPlaceholderValues => {
            const {match, value} = resolveDesignProperty(this.getDesign(), 'BLOCK', objectWithPlaceholderValues);
            if (!match) {
                return objectWithPlaceholderValues;
            }
            return value;
        });
    }

    /**
     * @returns {InfographicState}
     */
    getCurrentContent() {
        return this.getImmutable().get('currentContent');
    }

    getEntity(key) {
        return this.getCurrentContent().getEntity(key);
    }

    /**
     * @param {string[]} [keys]
     * @returns {Immutable.OrderedMap<string, InfographicEntity>}
     */
    getEntities(keys) {
        return this.getCurrentContent().getEntities(keys);
    }

    getFonts() {
        return this.getImmutable().get('fonts');
    }

    getLayouts() {
        return this.getCurrentContent().getLayouts();
    }

    getLayout(name) {
        const layouts = this.getLayouts();
        if (!layouts) {
            return undefined;
        }
        return layouts.get(name);
    }

    getAssets() {
        return this.getCurrentContent().get('assets');
    }

    /**
     * @returns {Immutable.Map<string, string>}
     */
    getNotes() {
        return this.getCurrentContent().get('notes');
    }

    getBlockNotes(blockKey) {
        return this.getCurrentContent().get('notes').get(blockKey);
    }

    get customFonts() {
        return this.getImmutable().get('customFonts');
    }

    contentEquals(other) {
        if (!other) {
            return false;
        }
        const pageSizeEquals = is(this.getPageSize(), other.getPageSize());
        const contentEquals = is(this.getCurrentContent(), other.getCurrentContent());
        return pageSizeEquals && contentEquals;
    }

    getImmutable() {
        return this._immutable;
    }

    moveEntitiesBy(entityKeys, dx, dy) {
        let newState = this;
        this.getEntities(entityKeys).forEach(entity => {
            newState = newState.setEntity(entity.getKey(), {
                top: entity.top + dy,
                left: entity.left + dx,
            });
        });
        return newState;
    }

    setEntity(entityKey, put, options = {}) {
        const content = this.getCurrentContent();
        for (const blockIndex of content.blocks.keys()) {
            const block = content.blocks.get(blockIndex);
            const entityIndex = block.getEntities().findIndex(e => e.getKey() === entityKey);
            if (entityIndex === -1) continue;

            const path = ['currentContent', 'blocks', blockIndex, 'entities', entityIndex];
            let state = this.getImmutable();
            if (options.overwrite) {
                // workaround to replace not unify fields
                state = state.mergeDeepIn(path,
                    Object.fromEntries(
                        Object.entries(put)
                            .map(([key]) => [key, null])
                    )
                );
            }
            return new EditorState(state.mergeDeepIn(path, put));
        }
        return this;
    }

    _setEntities(put) {
        const content = this.getCurrentContent();
        const entityIndex = content.getBlocks().reduce((acc, block, blockIndex) => {
            return block.getEntities().reduce((acc, entity, entityIndex) => {
                if (put.has(entity.getKey())) {
                    acc[entity.getKey()] = [blockIndex, 'entities', entityIndex];
                }
                return acc;
            }, acc);
        }, {});
        const state = this.getImmutable();
        return new EditorState(state.updateIn(['currentContent', 'blocks'], (blocks) => {
            return Array.from(Object.entries(entityIndex)).reduce((blocks, [entityKey, path]) => {
                return blocks.mergeDeepIn(path, put.get(entityKey));
            }, blocks);
        }));
    }

    setLayout(layoutName, put) {
        const content = this.getCurrentContent();
        const nextContent = content.mergeDeepIn(['layouts', layoutName], put);
        if (content === nextContent) {
            return this;
        }
        return EditorState.set(this, {currentContent: nextContent});
    }

    replaceLayout(layoutName, layout) {
        const content = this.getCurrentContent();
        const nextContent = content.setIn(['layouts', layoutName], layout);
        if (content === nextContent) {
            return this;
        }
        return EditorState.set(this, {currentContent: nextContent});
    }

    removeLayout(layout) {
        const nextContent = this.getCurrentContent().deleteIn(['layouts', layout]);
        return EditorState.set(this, {currentContent: nextContent});
    }

    mergeLayouts(layouts) {
        const content = this.getCurrentContent();
        const nextContent = content.mergeDeepIn(['layouts'], layouts);
        if (content === nextContent) {
            return this;
        }
        return EditorState.set(this, {currentContent: nextContent});
    }

    applyLayout(layoutName) {
        if (layoutName === EDITOR_DEFAULT_LAYOUT_NAME) {
            return this;
        }
        const layout = this.getLayout(layoutName);
        if (!layout) {
            return this;
        }

        let resultingEditorState = this;

        if (layout.has('entities')) {
            resultingEditorState = resultingEditorState._setEntities(layout.get('entities'));
        }

        if (layout.has('pageSize')) {
            const pageSize = this.getPageSize().toJS();
            const layoutPageSize = layout.get('pageSize');
            if (layoutPageSize.has('width')) {
                pageSize.width = layoutPageSize.get('width');
            }
            if (layoutPageSize.has('height')) {
                pageSize.height = layoutPageSize.get('height');
            }
            resultingEditorState = EditorState.setPageSize(resultingEditorState, pageSize);
        }

        return resultingEditorState;
    }

    getAssetURL(id) {
        return this.getAssets().getURL(id);
    }

    /**
     * @param {String} id
     * @param {String} url
     * @returns {EditorState}
     */
    addAsset(id, url) {
        return this.addAssets({[id]: url});
    }

    /**
     * @param {Immutable.Map|Object.<string, string>} assets
     * @returns {EditorState}
     */
    addAssets(assets) {
        const updatedAssets = this.getAssets().add(assets);
        return new EditorState(this.getImmutable().setIn(['currentContent', 'assets'], updatedAssets));
    }

    /**
     * @param {string[]} assetIds
     * @returns {EditorState}
     */
    removeAssets(assetIds) {
        const updatedAssets = this.getAssets().remove(assetIds);
        return new EditorState(this.getImmutable().setIn(['currentContent', 'assets'], updatedAssets));
    }

    get customLogo() {
        return this.getCurrentContent().get('customLogo');
    }

    setCustomLogo(customLogo) {
        return new EditorState(this.getImmutable().setIn(['currentContent', 'customLogo'], customLogo));
    }

    removeCustomLogo() {
        return new EditorState(this.getImmutable().deleteIn(['currentContent', 'customLogo']));
    }

    /**
     * @param {string} blockKey
     * @param {string} notes
     * @returns {EditorState}
     */
    setBlockNotes(blockKey, notes) {
        const updatedNotes = this.getNotes().set(blockKey, notes);
        return this.setNotes(updatedNotes);
    }

    /**
     * @param {Immutable.Map|Object.<string, string>} notes
     * @returns {EditorState}
     */
    setNotes(notes) {
        return new EditorState(this.getImmutable().setIn(['currentContent', 'notes'], notes));
    }
}

function traverse(o, fn) {
    if (Iterable.isKeyed(o)) {
        return o.withMutations(mutable => {
            for (const key of o.keys()) {
                mutable.set(key, fn(o.get(key)));
            }
        });
    } else if (Iterable.isIndexed(o)) {
        return o.map(value => traverse(value, fn));
    }
    return fn(o);
}
