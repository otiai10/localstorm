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
const Types = {
    string: createTypeChecker('string',   value => typeof value == 'string'),
    number: createTypeChecker('number',   value => typeof value == 'number'),
    object: createTypeChecker('object',   value => typeof value == 'object'),
    bool:   createTypeChecker('bool',     value => typeof value == 'boolean'),
    array:  createTypeChecker('array',    value => Array.isArray(value)),
    // localStorage cannot store function ;)
    // func:   createTypeChecker('function', value => typeof value == 'function'),
};

export default Types;
