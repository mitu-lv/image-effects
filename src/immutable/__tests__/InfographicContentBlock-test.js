/* eslint-env jasmine, jest */
jest.disableAutomock();

import InfographicContentBlock from '../InfographicContentBlock';

function createBlock() {
    return InfographicContentBlock.createFromJSONObject('block-0', {
        entities: [],
        design: {
            background: {type: 'color', color: '#ff0'},
        },
    });
}

describe('InfographicContentBlock', () => {
    it('correctly parses design properties', () => {
        const block = createBlock();
        expect(block).toBeDefined();
        expect(block.getDesignProperty('background')).toBeDefined();
        expect(block.getDesignProperty('background').get('color')).toBe('#ff0');
    });
    it('can customise design properties', () => {
        let block = createBlock();
        block = block.setDesignProperty('background', {color: '#f00'});
        expect(block.getDesignProperty('background')).toBeDefined();
        expect(block.getDesignProperty('background').get('color')).toBe('#f00');
    });
    it('ignores incorrect design properties', () => {
        let block = createBlock();
        block = block.setDesignProperty('background2', {color: '#f00'});
        expect(block.getDesignProperty('background2')).toBeUndefined();
    });
    it('resets the design property if null or undefined is passed', () => {
        let block = createBlock();
        block = block.setDesignProperty('background', null);
        expect(block.getDesignProperty('background')).toBeUndefined();

        block = createBlock();
        block = block.setDesignProperty('background', undefined);
        expect(block.getDesignProperty('background')).toBeUndefined();
    });
});
