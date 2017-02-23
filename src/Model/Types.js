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
    string: createTypeChecker('string', value => typeof value == 'string'),
};

export default Types;
