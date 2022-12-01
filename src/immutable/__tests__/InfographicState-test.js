/* eslint-env jasmine, jest */
jest.disableAutomock();

import EditorState from '../EditorState';

function createStateFixture() {
    const content = {
        blocks: {
            'block-1': {entities: ['test-1', 'test-2']},
            'block-2': {entities: ['test-3']},
        },
        blockOrder: ['block-1', 'block-2'],
        entities: {
            'test-1': {
                top: 100,
                left: 200,
                width: 100,
                height: 50,
                type: 'TEXT',
                props: {
                    content: 'Hello test',
                },
            },
            'test-2': {
                left: 300,
                top: 10,
                width: 80,
                height: 30,
                type: 'SHAPE',
                props: {
                    shapeType: 'rectangle',
                    width: 300,
                    height: 200,
                    fillColor: '#000',
                },
            },
            'test-3': {
                top: 500,
                left: -40,
                width: 400,
                height: 300,
                type: 'IMAGE',
                props: {
                    url: 'http://test.blah/abc',
                },
            },
        },
    };
    return EditorState.createFromJSONObject({content}).getCurrentContent();
}

describe('InfographicState', () => {
    describe('createFromJSONObject', () => {
        it('creates a populated InfographicState', () => {
            const state = createStateFixture();

            expect(state).toBeDefined();
            expect(state.getBlocks().size).toBe(2);

            const block1 = state.getBlocks().get(0);
            expect(block1).toBeDefined();
            expect(block1.getEntities().size).toBe(2);

            const block2 = state.getBlocks().get(1);
            expect(block2).toBeDefined();
            expect(block2.getEntities().size).toBe(1);
        });

        it('block key property must be present', () => {
            const content = {
                blocks: {
                    b1: {entities: []},
                },
                blockOrder: ['b1'],
                entities: {},
            };

            const state = EditorState.createFromJSONObject({content}).getCurrentContent();
            expect(state).toBeDefined();
            expect(state.getBlocks().size).toBe(1);
            expect(state.getBlocks().get(0).getKey()).toBe('b1');
        });
    });

    describe('getEntity', () => {
        it('returns existing entity', () => {
            const state = createStateFixture();
            const entity = state.getEntity('test-3');
            expect(entity).toBeDefined();
            expect(entity.getTop()).toBe(500);
            expect(entity.getLeft()).toBe(-40);
        });

        it('returns null if entity cannot be found', () => {
            const state = createStateFixture();
            expect(state.getEntity('test-nonexisting')).toBeNull();
        });
    });

    describe('getBlock', () => {
        it('returns existing block', () => {
            const state = createStateFixture();
            const block = state.getBlock('block-1');
            expect(block).toBeDefined();
        });

        it('returns null when requesting a non-existing block', () => {
            const state = createStateFixture();
            expect(state.getBlock('non-existing')).toBeNull();
        });
    });
});
