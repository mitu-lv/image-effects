/* eslint-env jasmine, jest */
jest.disableAutomock();

import EditorState from '../EditorState';
import {Background} from '../Background';

describe('EditorState', () => {
    describe('set', () => {
        it('returns new updated state', () => {
            const editorState = EditorState.createEmpty();
            //any "known" field will do to test this
            const otherEditorState = EditorState.set(editorState, {fonts: {}});
            expect(editorState !== otherEditorState).toBeTruthy();
        });
    });

    describe('setPageSize', () => {
        it('returns state with a page size', () => {
            let editorState = EditorState.createEmpty();
            editorState = EditorState.setPageSize(editorState, {
                width: 1729, height: 4104,
            });
            expect(editorState).toBeDefined();
            expect(editorState.getPageSize()).toBeDefined();
            expect(editorState.getPageSize().width).toBe(1729);
            expect(editorState.getPageSize().height).toBe(4104);
        });

        it('throws when setting invalid page size', () => {
            const editorState = EditorState.createEmpty();
            expect(() => EditorState.setPageSize(editorState, 'unknown')).toThrow();
            expect(() => EditorState.setPageSize(editorState, {
                width: -3, height: 6,
            })).toThrow();
            expect(() => EditorState.setPageSize(editorState, {
                width: 3, height: -6,
            })).toThrow();
            expect(() => EditorState.setPageSize(editorState, {
                width: 3,
            })).toThrow();
            expect(() => EditorState.setPageSize(editorState, {
                height: -6,
            })).toThrow();
            expect(() => EditorState.setPageSize(editorState, {})).toThrow();
        });
    });

    describe('createFromJSONObject', () => {
        it('returns new state with a defined page size', () => {
            const editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                pageSize: {width: 1729, height: 4104},
                content: {
                    blocks: {},
                    blockOrder: [],
                    entities: {},
                },
            });
            expect(editorState).toBeDefined();
            const pageSize = editorState.getPageSize();
            expect(pageSize).toBeDefined();
            expect(pageSize.width).toBe(1729);
            expect(pageSize.height).toBe(4104);
        });

        it('returns new state with default page size', () => {
            const editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                content: {
                    blocks: {},
                    blockOrder: [],
                    entities: {},
                },
            });
            expect(editorState).toBeDefined();
            expect(editorState.getPageSize()).toBeDefined();
            expect(editorState.getPageSize().width).toBe(960);
            expect(editorState.getPageSize().height).toBe(720);
        });

        it('returns new state with an entity map', () => {
            const editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                content: {
                    blocks: {
                        a: {
                            entities: ['e1', 'e2'],
                        },
                    },
                    blockOrder: ['a'],
                    entities: {
                        e1: {
                            type: 'TEXT',
                            top: 20,
                            left: 50,
                            width: 200,
                            height: 30,
                        },
                        e2: {
                            type: 'TEXT',
                            top: 30,
                            left: 80,
                            width: 100,
                            height: 60,
                        },
                    },
                },
            });
            expect(editorState).toBeDefined();
            expect(editorState.getCurrentContent().getBlocks().size).toBe(1);
            expect(editorState.getCurrentContent().getBlocks().get(0).getEntities().size).toBe(2);
        });
    });

    describe('setEntity', () => {
        it('updates chosen entity with new the values', () => {
            const editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                assets: {
                    'da53844f-36a0-4061-87dd-b5b917a2c10e': 'http://nowhere.to/nothing.jpg',
                },
                content: {
                    blocks: {
                        a: {
                            entities: ['test-1', 'test-2'],
                        },
                    },
                    blockOrder: ['a'],
                    entities: {
                        'test-1': {
                            type: 'TEXT',
                            top: 10,
                            left: 200,
                            width: 400,
                            height: 30,
                            props: {
                                markup: 'Test',
                            },
                        },
                        'test-2': {
                            type: 'IMAGE',
                            top: 150,
                            left: 200,
                            width: 300,
                            height: 500,
                            props: {
                                assetId: 'da53844f-36a0-4061-87dd-b5b917a2c10e',
                            },
                        },
                    },
                },
            });
            const path = 'test-2';
            const newState = editorState.setEntity(path, {
                top: 200,
                left: 250,
                width: 100,
                height: 20,
            });
            const entity = newState.getEntity('test-2');
            expect(entity.get('top')).toBe(200);
            expect(entity.get('left')).toBe(250);
        });

        it('updates nested props structures', () => {
            let editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                content: {
                    blocks: {
                        a: {
                            entities: ['test-1'],
                        },
                    },
                    blockOrder: ['a'],
                    entities: {
                        'test-1': {
                            type: 'SHAPE',
                            top: 10,
                            left: 20,
                            width: 300,
                            height: 150,
                            props: {
                                shapeType: 'circle',
                                fill: 'red',
                            },
                        },
                    },
                },
            });
            editorState = editorState.setEntity('test-1', {
                props: {
                    fill: 'green',
                },
            });
            expect(editorState).toBeDefined();
            const entity = editorState.getEntity('test-1');
            expect(entity).toBeDefined();
            expect(entity.getProperty('fill')).toBe('green');
            expect(entity.getProperty('shapeType')).toBe('circle');
        });
    });

    describe('contentEquals', () => {
        it('returns false if other state is not defined', () => {
            const editorState = EditorState.createEmpty();
            expect(editorState.contentEquals(null)).toBeFalsy();
        });
    });

    describe('designProperty', () => {
        it('returns a custom property from block', () => {
            const editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                content: {
                    blocks: {
                        'block-0': {
                            entities: [],
                            design: {
                                background: {type: 'color', color: '#ff0'},
                            },
                        },
                    },
                    blockOrder: ['block-0'],
                    entities: {},
                },
            });
            const background = editorState.getBlockDesignProperty('block-0', 'background');
            expect(background).toBeDefined();
            expect(background.get('type')).toBe('color');
            expect(background.get('color')).toBe('#ff0');
        });
        it('returns a default if block does not have a custom one', () => {
            const editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                content: {
                    blocks: {
                        'block-0': {entities: []},
                    },
                    blockOrder: ['block-0'],
                    entities: {},
                },
            });
            const background = editorState.getBlockDesignProperty('block-0', 'background');
            expect(background).toBeDefined();
            expect(background.get('color')).toBe('#FFFFFF');
            expect(background.get('assetId')).toBeUndefined();
            expect(background.get('opacity')).toBe(1);
        });
        it('defaults can change', () => {
            let editorState = EditorState.createFromJSONObject({
                design: {
                    colors: [],
                },
                content: {
                    blocks: {
                        'block-0': {
                            entities: [],
                        },
                        'block-1': {
                            design: {
                                background: {color: '#ff0', opacity: 1, assetId: undefined, galleryImageId: null},
                            },
                            entities: [],
                        },
                    },
                    blockOrder: ['block-0', 'block-1'],
                    entities: {},
                },
            });
            let background0 = editorState.getBlockDesignProperty('block-0', 'background');
            let background1 = editorState.getBlockDesignProperty('block-1', 'background');
            expect(background0).toBeDefined();
            expect(background0.get('color')).toBe('#FFFFFF');
            expect(background1).toBeDefined();
            expect(background1.get('color')).toBe('#ff0');

            editorState = EditorState.setDesignDefaults(
                editorState,
                editorState.getDesignDefaults().setIn(['block', 'background'], Background({color: '#0f0'}))
            );

            background0 = editorState.getBlockDesignProperty('block-0', 'background');
            background1 = editorState.getBlockDesignProperty('block-1', 'background');
            expect(background0).toBeDefined();
            expect(background0.get('color')).toBe('#0f0');
            expect(background1).toBeDefined();
            expect(background1.get('color')).toBe('#ff0');
        });
    });
});
