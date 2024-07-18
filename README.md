# Project Transfer Notice: Please check [jstorm](https://github.com/otiai10/jstorm)

[**localstorm**](https://github.com/otiai10/localstorm) has been officially transferred to the [**jstorm**](https://github.com/otiai10/jstorm). This transfer aims to ensure the continuous development and improvement to support more usecases of the project.

* https://www.npmjs.com/package/jstorm
* https://github.com/otiai10/jstorm

-----
<br><br>

localstorm
========

Object/Relation Mapper for LocalStorage.

[![npm](https://img.shields.io/npm/v/localstorm)](https://www.npmjs.com/package/localstorm)
[![npm downloads](https://img.shields.io/npm/dy/localstorm)](https://www.npmjs.com/package/localstorm)
[![Node.js CI](https://github.com/otiai10/localstorm/actions/workflows/node.js.yml/badge.svg)](https://github.com/otiai10/localstorm/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/github/otiai10/localstorm/branch/main/graph/badge.svg?token=aEjM39lnwW)](https://codecov.io/github/otiai10/localstorm)

# Installation

```sh
npm install localstorm
```

# Model

`Model` is an ORM (Object-Relation Mapper) for `localStorage`, providing simple interfaces like `ActiveRecord`.

> NOTE: `Model` is NOT the best efficient accessor for `localStorage`, BUT provides the best small and easy way to manage `localStorage` and automatically map the object to your `Model` class.

- Methods
  - [new](#new)
  - [save](#save)
  - [find](#find)
  - [update](#update)
  - [delete](#delete)
  - [create](#create)
  - [all](#all)
  - [list](#list)
  - [filter](#filter)
- Properties
  - [schema](#schema)
  - [nextID](#nextID)

# How to use

```js
class Player extends Model {}
let player = new Player({name: 'otiai10', age: 31});
player.name // 'otiai10'
player.age // 31
player._id // undefined, because not saved yet

player.save();
player._id // 1, because it's saved to localStorage
```

More complicated models with relations? See [`schema`](#schema)!

# Methods

## new

- static
- an alias for `constructor`

```js
let player = Player.new({name: 'otiai20', age: 43});
player.name // 'otiai10'
player.age // 31
player._id // undefined, because not saved yet
```

## save

```js
let player = new Player({name: 'otiai20'});
player.save();
player._id // 2
```

## find

- static

```js
let player = Player.find(2);
player.name // 'otiai10'
```

## update

```js
player.update({name: 'otiai22'});
Player.find(player._id).name // 'otiai22'
```

## delete

```js
player.delete();
Player.find(player._id) // undefined
```

## create

- static
- an alias for `new` and `save`

```js
let player = Player.create({name: 'otiai99', age: 99});
player._id // 3

// Is equivalent to
Player.new({name: 'otiai99'}).save();
```

## all

- static
- returns everything as a dictionary

```js
const dict = Player.all(); // Object
dict[1].name // 'otiai10'
dict[1] instanceof Player // true
```

## list

- static
- returns everything as an array

```js
const players = Player.list(); // [Player]
players.length // 2

// Is equivalent to
Player.filter(() => true);
```

## filter

- static
- returns filtered array by filterFunc

```js
const players = Player.filter(p => p.age < 40);
players.length // 1
```

## useStorage

- static
- replace storage with anything which satisfies Storage interface

```js
Model.useStorage(window.sessionStorage);

// For example, you can embed any extra operation for getItem/setItem/removeItem
const storage = new MyStorageWithEffortAsyncPushing();
Model.useStorage(storage);
```

# Properties

## schema

- static
- optional, default `undefined`
- can define validations for each props of this model
- no validations, if `schema` is not set

```js
class Player extends Model {
  static schema = {
    name: Model.Types.string.isRequired,
    age:  Model.Types.number, // optional
    location: Model.Types.shape({
      address: Model.Types.string,
      visible: Model.Types.bool.isRequired,
    }),
  }
}
```

with relations

```js
class Team extends Model {
  static schema = {
    name: Model.Types.string.isRequired,
    leader: Model.Types.reference(Player),
    members: Model.Types.arrayOf(Model.Types.reference(Player)),
  }
}
```

## nextID

- static
- optional, default `timestampID`
- replace it if you want to change algorythm of generating next id

```js
Player.nextID = () => Date.now();
Player.create({name: 'otiai2017'})._id // 1488061388247
Player.create({name: 'otiai1986'})._id // 1488061388928
```

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
