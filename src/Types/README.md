# Types

`Types` API provides followings:

1. Validation data type of `Model` when it's saved.
2. Resolving relationship of `Model`s.

# Examples

```js
import {Model, Types} from "localstorm";

class User extends Model {
  protected static schema = {
    name: Types.string.isRequired,
    age: Types.number,
    langs: Types.arrayOf(Types.string),
  }
}

class Team extends Model {
  protected static schema = {
    name: Types.string.isRequired,
    active: Types.bool.isRequired,
    address: Types.shape({
      country: Types.string,
      street: Types.string,
      postcode: Types.number,
    }),
    leader: Types.reference(User, {eager: true}),
    members: Types.arrayOf(Types.reference(User)),
    roles: Types.dictOf(Types.reference(User)),
  }
}
```