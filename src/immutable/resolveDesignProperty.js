const {Iterable} = require('immutable');
const invariant = require('invariant');

const {placeholderPattern, legacyPlaceholderPattern} = require('../../../shared/freeLayoutVariablePlaceholders');
const resolveParsedReferenceColor = require('../../../shared/resolveParsedReferenceColor');


module.exports = function resolveDesignProperty(design, elementTypeOrPath, propValue) {
    if (typeof propValue !== 'string') {
        return {
            value: propValue,
            match: false,
        };
    }
    let matchedPattern;
    if (placeholderPattern.test(propValue)) {
        matchedPattern = placeholderPattern;
    } else if (legacyPlaceholderPattern.test(propValue)) {
        matchedPattern = legacyPlaceholderPattern;
    } else {
        return {
            value: propValue,
            match: false,
        };
    }

    return {
        value: propValue.replace(matchedPattern, (match, propName) => {
            const [variableName, defaultValue] = propName.split('|');
            const resolvedProp = queryDesignProperty(design, elementTypeOrPath, variableName, defaultValue);
            if (resolvedProp) {
                return resolvedProp;
            }
            return propName;
        }),
        match: true,
    };
};

function queryDesignProperty(design, elementTypeOrPath, propName, notSetValue = undefined) {
    const resolver = resolveParsedReferenceColor(propName, design.get('colors').toJS());

    if (resolver.resolved) {
        return resolver.value || notSetValue;
    }

    const keyPath = ['elements', ...normalizeGetPath(elementTypeOrPath), propName];
    if (!design.hasIn(keyPath)) {
        return design.getIn(['defaults', propName], notSetValue);
    }

    let value = design.getIn(keyPath, notSetValue);
    if (Iterable.isKeyed(value)) {
        invariant(value.has('ref'), 'Non-primitive type must be a map representing a reference and have a "ref" key');
        const refPath = normalizeGetPath(value.get('ref'));
        if (!design.hasIn(refPath)) {
            console.warn(`Cannot find value for path ${value.get('ref')}`);
            return notSetValue;
        }
        value = design.getIn(refPath, notSetValue);
        invariant(!Iterable.isKeyed(value), 'Currently we do not support more than just one ref lookup to prevent circular references');
    }
    return value;
}

function normalizeGetPath(typeOrPath) {
    if (Array.isArray(typeOrPath)) {
        return typeOrPath;
    }
    invariant(typeof typeOrPath === 'string', 'Path parameter must be an array or string');
    const parts = typeOrPath.split('.');
    return parts;
}
