import {Record, Set} from 'immutable';

const SelectionRecord = Record({
    items: Set(),
    blocks: Set(),
});

export default class Selection extends SelectionRecord {
    static createEmpty() {
        return new Selection();
    }

    static singleItem(item) {
        return Selection.createFromEntityKeys([item]);
    }

    static createFromEntityKeys(items) {
        return new Selection({
            items: Set(items),
        });
    }

    static createFromBlockAndEntityKeys(blockKeys, entityKeys) {
        return new Selection({
            items: Set(entityKeys),
            blocks: Set(blockKeys),
        });
    }

    getEntities() {
        return this.get('items');
    }

    getBlocks() {
        return this.get('blocks');
    }

    isEmpty() {
        return this.getEntities().isEmpty();
    }

    hasNoBlocks() {
        return this.getBlocks().isEmpty();
    }

    containsEntity(item) {
        return this.getEntities().contains(item);
    }

    containsBlock(key) {
        return this.getBlocks().contains(key);
    }

    addEntities(...paths) {
        return this.set('items', this.getEntities().concat(paths));
    }

    removeEntities(...paths) {
        return this.set('items', this.getEntities().subtract(paths));
    }

    addBlocks(...keys) {
        return this.set('blocks', this.getBlocks().concat(keys));
    }

    removeBlocks(...keys) {
        let blocks = this.getBlocks();
        for (const key of keys) {
            blocks = blocks.remove(key);
        }

        return this;
    }

    clear() {
        return this.merge({
            items: this.getEntities().clear(),
            blocks: this.getBlocks().clear(),
        });
    }

    clearEntities() {
        return this.set('items', this.getEntities().clear());
    }

    clearBlocks() {
        return this.set('blocks', this.getBlocks().clear());
    }
}
