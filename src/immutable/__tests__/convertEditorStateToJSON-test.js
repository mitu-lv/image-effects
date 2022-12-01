/* eslint-env jasmine, jest */
jest.disableAutomock();

import EditorState from '../../immutable/EditorState';

const fixtureStateData = {
    pageSize: {
        width: 1337,
        height: 42,
    },
    content: {
        blocks: {
            'block-0': {
                design: {
                    background: {type: 'color', color: '#bad'},
                },
                entities: ['entity-0'],
            },
            'block-1': {
                key: 'block-1',
                entities: [],
            },
        },
        blockOrder: ['block-0', 'block-1'],
        entities: {
            'entity-0': {
                type: 'TEXT',
                top: 0,
                left: 100,
                right: 200,
                width: 300,
                height: 50,
            },
        },
    },
};

describe('convertEditorStateToJSON', () => {
    it('converts to JSON omitting internal entity and block fields', () => {
        const editorState = EditorState.createFromJSONObject(fixtureStateData);

        const raw = editorState.toJSONObject();
        expect(raw).toBeDefined();
        expect(raw.pageSize).toBeDefined();
        expect(raw.pageSize.height).toBe(42);
        expect(raw.pageSize.width).toBe(1337);
        expect(raw.content).toBeDefined();
        expect(raw.content.blockOrder).toBeDefined();
        expect(raw.content.blockOrder.length).toBe(2);

        expect(raw.content.blocks['block-0']).toBeDefined();
        expect(raw.content.blocks['block-0'].entities.length).toBe(1);
        expect(raw.content.blocks['block-0'].design).toBeDefined();
        expect(raw.content.blocks['block-0'].design.background).toBeDefined();
        expect(raw.content.blocks['block-0'].design.background.type).toBe('color');
        expect(raw.content.blocks['block-0'].design.background.color).toBe('#bad');
        expect(raw.content.entities).toBeDefined();
        expect(Object.keys(raw.content.entities).length).toBe(1);
        expect(raw.content.entities['entity-0']).toBeDefined();

        expect(raw.content.blocks['block-1'].entities.length).toBe(0);
        expect(raw.content.blocks['block-1'].design).toBeDefined();
        expect(raw.content.blocks['block-1'].design.background).toBeUndefined();
    });
});
