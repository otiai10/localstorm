/**
 * Type checker functions inspired by React.PropTypes.
 */
import { Model } from ".";

/* tslint:disable interface-name */
declare interface TypeCheckFunc {
    (value: any, name: string): null;
    decode?: (value: any) => any;
}

/**
 * createTypeChecker generates a simple type checker.
 * This function is ONLY used internally,
 * and users can use the generated type checker functions.
 *
 * @param typename the name of expected type represented by "typeof" function.
 * @param validate the validator function for this typename.
 */
const createTypeChecker = (typename: string, validate: (value) => boolean): TypeCheckFunc => {
    /**
     * checkType is the base framework function of validation.
     * @param required specifies if this property is required OR NOT.
     * @param value the actual value of this property.
     * @param name the name of this property inside the Model.
     */
    const checkType = (required, value, name): null => {
        if (typeof value === "undefined") {
            if (required) {
                throw new Error(`${name} is marked as required`);
            } else { return null; }
        }
        if (!validate(value)) { throw new Error(`${name} is not ${typename}`); }
        return null;
    };
    /**
     * This `checker` is the actual function users can use.
     * Users can switch `required` OR NOT just by accessing `.isRequired` property
     * of this generated function.
     */
    const checker      = checkType.bind(null, false);
    checker.isRequired = checkType.bind(null, true);
    return checker;
};

/**
 * arrayTypeChecker is a generator function of type checker
 * with checking each element of the array by provided checkFunc.
 * If the provided TypeCheckFunc for the elements is `reference` checker,
 * this generated TypeCheckFunc has `decode` function which can decode each element to Model class.
 *
 * @param checkValue TypeCheckFunc for each element of this array
 */
const arrayValueTypeChecker = (checkValue: TypeCheckFunc): TypeCheckFunc => {
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
            checkValue(rootValue[i], `element[${i}] of ${rootValue}`);
        }
    };
    const check = checkRoot.bind(null, false);
    check.isRequired = checkRoot.bind(null, true);
    // To decode this property as a Model, store the constructor here.
    if (typeof checkValue.decode === "function") {
        check.decode = (rawArrayOfObject = []) => {
            return rawArrayOfObject.map((rawObject) => checkValue.decode(rawObject));
        };
    }
    return check;
};

/**
 * referenceTypeChecker is a generator function of type checker
 * with referencing another Model, known as "relations".
 * The generated type checker function also includes "decode" function
 * so that the referenced peoperties can be decoded at the same time on decoding the root model.
 */
const referenceTypeChecker = (refConstructor: any, opt: any = {}): TypeCheckFunc => {
    const checkRoot = (required: boolean, value: Model, refName: string): null => {
        if (typeof value === "undefined") {
            if (required) {
                throw new Error(`${refName} is marked as required`);
            } else { return null; }
        }
        value._validate();
        return null;
    };
    const check = checkRoot.bind(null, false);
    check.isRequired = checkRoot.bind(null, true);
    // To decode this property as a Model, store the constructor here.
    check.decode = (rawObject) => refConstructor.new(rawObject);
    return check;
};

/**
 * shapeTypeChecker is a generator function of type checker
 * with checking each element of the object.
 *
 * @param validations is a dictionary to map which TypeCheckFunc is used to which property.
 */
const shapeTypeChecker = (validations: { [key: string]: TypeCheckFunc } = {}): TypeCheckFunc => {
    const checkRoot = (required, rootValue, rootName): null => {
        if (required && typeof rootValue === "undefined") {
            throw new Error(`${rootName} is marked as required`);
        }
        Object.keys(validations).map((fieldName) => {
            const validation = validations[fieldName];
            const value = rootValue[fieldName];
            validation(value, fieldName);
        });
        return null;
    };
    const check      = checkRoot.bind(null, false);
    check.isRequired = checkRoot.bind(null, true);
    return check;
};

const Types = {
    // Simple type checkers
    array:  createTypeChecker("array",    (value) => Array.isArray(value)),
    bool:   createTypeChecker("bool",     (value) => typeof value === "boolean"),
    number: createTypeChecker("number",   (value) => typeof value === "number"),
    object: createTypeChecker("object",   (value) => typeof value === "object"),
    string: createTypeChecker("string",   (value) => typeof value === "string"),

    // Recursive type checker generators
    arrayOf: arrayValueTypeChecker,
    reference: referenceTypeChecker,
    shape: shapeTypeChecker,
};

export default Types;
