// Inspired by React.PropTypes
// https://github.com/facebook/react/blob/bc2702f8bd89737898874e05adc67a4b4f542929/src/isomorphic/classic/types/ReactPropTypes.js#L157
const createTypeChecker = (typename, validate) => {
    const checkType = (required, value, name) => {
        if (typeof value === 'undefined') {
            if (required) throw `${name} is marked as required`;
            else return null;
        }
        if (!validate(value)) throw `${name} is not ${typename}`;
        return null;
    };
    let checker        = checkType.bind(null, false);
    checker.isRequired = checkType.bind(null, true);
    return checker;
};

const _createRecursiveTypeChecker = (structName, iterateNames) => {
     // e.g. shape
    const generate = (validations = {}) => {
        let checkRoot = (required, rootValue, rootName) => {
            if (required && typeof rootValue == 'undefined') throw `${rootName} is marked as required`;
            iterateNames(validations).map(fieldName => {
                const validation = validations[fieldName];
                const value      = rootValue[fieldName];
                validation(value, fieldName);
            });
        };
        let check        = checkRoot.bind(null, false);
        check.isRequired = checkRoot.bind(null, true);
        return check;
    };
    // let generator = generate.bind(null, false);
    // generator.isRequired = generate.bind(null, true);
    return generate;
};

const Types = {
    string: createTypeChecker('string',   value => typeof value == 'string'),
    number: createTypeChecker('number',   value => typeof value == 'number'),
    object: createTypeChecker('object',   value => typeof value == 'object'),
    bool:   createTypeChecker('bool',     value => typeof value == 'boolean'),
    array:  createTypeChecker('array',    value => Array.isArray(value)),
    // localStorage cannot store function ;)
    // func:   createTypeChecker('function', value => typeof value == 'function'),
    shape: _createRecursiveTypeChecker('shape', value => Object.keys(value))
};

export default Types;
