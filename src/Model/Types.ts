import { Model } from ".";

// Inspired by React.PropTypes
const createTypeChecker = (typename, validate) => {
    const checkType = (required, value, name) => {
        if (typeof value === "undefined") {
            if (required) {
                throw new Error(`${name} is marked as required`);
            } else { return null; }
        }
        if (!validate(value)) { throw new Error(`${name} is not ${typename}`); }
        return null;
    };
    const checker        = checkType.bind(null, false);
    checker.isRequired = checkType.bind(null, true);
    return checker;
};

const createRecursiveTypeChecker = (structName, iterateNames) => {
    // e.g. shape
    const generate = (validations = {}) => {
        const checkRoot = (required, rootValue, rootName) => {
            if (required && typeof rootValue === "undefined") { throw new Error(`${rootName} is marked as required`); }
            iterateNames(validations).map((fieldName) => {
                const validation = validations[fieldName];
                const value      = rootValue[fieldName];
                validation(value, fieldName);
            });
        };
        const check        = checkRoot.bind(null, false);
        check.isRequired = checkRoot.bind(null, true);
        return check;
    };
    // let generator = generate.bind(null, false);
    // generator.isRequired = generate.bind(null, true);
    return generate;
};

const createArrayValueTypeChecker = () => {
    const generate = (arrayValueValidateFunc) => {
        const checkRoot = (required, rootValue, rootName) => {
            if (typeof rootValue === "undefined") {
                if (required) {
                    throw new Error(`${rootName} is marked as required`);
                } else {
                    return null;
                }
            }
            if (!Array.isArray(rootValue)) { throw new Error(`${rootName} is not an array`); }
            for (let i = 0; i < rootValue.length; i++) {
                arrayValueValidateFunc(rootValue[i], `element[${i}] of ${rootValue}`);
            }
        };
        const check      = checkRoot.bind(null, false);
        check.isRequired = checkRoot.bind(null, true);
        return check;
    };
    return generate;
};

const Types = {
    array:  createTypeChecker("array",    (value) => Array.isArray(value)),
    bool:   createTypeChecker("bool",     (value) => typeof value === "boolean"),
    number: createTypeChecker("number",   (value) => typeof value === "number"),
    object: createTypeChecker("object",   (value) => typeof value === "object"),
    string: createTypeChecker("string",   (value) => typeof value === "string"),

    arrayOf: createArrayValueTypeChecker(),

    // localStorage cannot store function ;)
    // func:   createTypeChecker('function', value => typeof value == 'function'),
    shape: createRecursiveTypeChecker("shape", (value) => Object.keys(value)),
};

export default Types;
