/* eslint-env jasmine, jest */
jest.unmock('../InfographicEntity')
    .unmock('../Transform')
    .unmock('immutable');

import InfographicEntity from '../InfographicEntity';

describe('InfographicEntity', () => {
    describe('fromRawEntity', () => {
        it('creates new instance', () => {
            const entity = InfographicEntity.fromRawEntity({
                top: 100,
                left: 200,
                width: 100,
                height: 25,
                type: 'TEXT',
                props: {
                    content: 'Test',
                },
            });
            expect(entity).toBeDefined();
            expect(entity.getTop()).toBe(100);
            expect(entity.getLeft()).toBe(200);
            expect(entity.getType()).toBe('TEXT');
            expect(entity.getProps()).toBeDefined();
            expect(entity.getProps().get('content')).toBe('Test');
        });

        it('creates new instance with a transform', () => {
            const entity = InfographicEntity.fromRawEntity({
                top: 100,
                left: 200,
                width: 100,
                height: 25,
                type: 'TEXT',
                transform: {
                    rotate: 20,
                },
            });
            expect(entity).toBeDefined();
            const transform = entity.getTransform();
            expect(transform.getRotate()).toBe(20);
        });

        it('throws if a required property is missing', () => {
            expect(function() {
                InfographicEntity.fromRawEntity({
                    top: 200,
                    left: 100,
                    width: 200,
                    height: 100,
                });
            }).toThrow();
        });

        it('creates entity with a defined key', () => {
            const entity = InfographicEntity.fromRawEntity({
                top: 100,
                left: 200,
                width: 200,
                height: 100,
                type: 'TEXT',
            });
            expect(entity).toBeDefined();
            expect(entity.getKey().length).toBeGreaterThan(0);
        });
    });

    describe('getProperty', () => {
        it('returns property value if present', () => {
            const entity = InfographicEntity.fromRawEntity({
                top: 100,
                left: 200,
                width: 100,
                height: 20,
                type: 'TEXT',
                props: {
                    content: 'Test',
                },
            });
            expect(entity.getProperty('content')).toBe('Test');
        });

        it('returns null if property key is not present', () => {
            const entity = InfographicEntity.fromRawEntity({
                top: 100,
                left: 200,
                width: 150,
                height: 80,
                type: 'TEXT',
                props: {
                    foreColor: 'blue',
                },
            });
            expect(entity.getProperty('content')).toBeNull();
        });
    });

    describe('bounds', () => {
        it('rotates item by 90 degrees clockwise', () => {
            const entity = InfographicEntity.fromRawEntity({
                top: 100,
                left: 200,
                width: 150,
                height: 80,
                type: 'TEXT',
                transform: {
                    rotate: 90,
                },
            });
            const bounds = entity.bounds();
            expect(bounds).toBeDefined();
            expect(bounds.left).toBe(235);
            expect(bounds.top).toBe(65);
            expect(bounds.width).toBe(80);
            expect(bounds.height).toBe(150);
        });
    });
});
