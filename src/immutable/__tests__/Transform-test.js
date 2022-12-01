/* eslint-env jasmine, jest */
jest.disableAutomock();

import Transform from '../Transform';

describe('Transform', () => {
    describe('fromRawTransform', () => {
        it('returns new Transform instance', () => {
            const tr = Transform.fromRawTransform({
                rotate: 30,
            });
            expect(tr).toBeDefined();
            expect(tr.getRotate()).toBe(30);
        });
    });
});
