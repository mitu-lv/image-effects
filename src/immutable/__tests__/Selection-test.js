/* eslint-env jasmine, jest */
jest.disableAutomock();

import Selection from '../Selection';

describe('Selection', () => {
    describe('createFromArray', () => {
        it('creates new Selection from an array of EntityLocation type items', () => {
            const sel = Selection.createFromEntityKeys(['test1', 'test2']);
            expect(sel).toBeDefined();
            expect(sel.getEntities().size).toBe(2);
            expect(sel.containsEntity('test1')).toBeTruthy();
            expect(sel.containsEntity('test2')).toBeTruthy();
        });
    });
});
