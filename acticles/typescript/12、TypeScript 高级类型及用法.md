本文详细介绍了 TypeScript 高级类型的使用场景，对日常 TypeScript 的使用可以提供一些帮助。

## 前言

本文已收录在 `Github`: https://github.com/beichensky/Blog 中，走过路过点个 Star 呗

## 一、高级类型

### 交叉类型(&)

交叉类型是将多个类型合并为一个类型。 这让我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性。

-   语法：` T & U`
    
    > 其返回类型既要符合 `T` 类型也要符合 `U` 类型
    
-   用法：假设有两个接口：一个是 `Ant` 蚂蚁接口，一个是 `Fly` 飞翔接口，现在有一只会飞的蚂蚁：

```ts
interface Ant {
    name: string;
    weight: number;
}

interface Fly {
    flyHeight: number;
    speed: number;
}

// 少了任何一个属性都会报错
const flyAnt: Ant & Fly = {
    name: '蚂蚁呀嘿',
    weight: 0.2,
    flyHeight: 20,
    speed: 1,
};
```

### 联合类型(|)

联合类型与交叉类型很有关联，但是使用上却完全不同。

-   语法：` T | U`
    
    > 其返回类型为连接的多个类型中的任意一个
    
-   用法：假设声明一个数据，既可以是 `string` 类型，也可以是 `number` 类型

```ts
let stringOrNumber： string | number = 0

stringOrNumber = ''
```

再看下面这个例子，`start` 函数的参数类型既是 `Bird | Fish`，那么在 `start` 函数中，想要直接调用的话，只能调用 `Bird` 和 `Fish` 都具备的方法，否则编译会报错

```ts
class Bird {
    fly() {
        console.log('Bird flying');
    }
    layEggs() {
        console.log('Bird layEggs');
    }
}

class Fish {
    swim() {
        console.log('Fish swimming');
    }
    layEggs() {
        console.log('Fish layEggs');
    }
}

const bird = new Bird();
const fish = new Fish();

function start(pet: Bird | Fish) {
    // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
    pet.layEggs();

    // 会报错：Property 'fly' does not exist on type 'Bird | Fish'
    // pet.fly();

    // 会报错：Property 'swim' does not exist on type 'Bird | Fish'
    // pet.swim();
}

start(bird);

start(fish);
```

## 二、关键字

### 类型约束(extends)

语法：`T extends K`

> 这里的 extends 不是类、接口的继承，而是对于类型的判断和约束，意思是判断 T 能否赋值给 K

可以在泛型中对传入的类型进行约束

```TypeScript
const copy = (value: string | number): string | number => value

// 只能传入 string 或者 number
copy(10)

// 会报错：Argument of type 'boolean' is not assignable to parameter of type 'string | number'
// copy(false)
```

也可以判断 T 是否可以赋值给 U，可以的话返回 T，否则返回 never

```TypeScript
type Exclude<T, U> = T extends U ? T : never;
```

### 类型映射(in)

会遍历指定接口的 key 或者是遍历联合类型

```TypeScript
interface Person {
    name: string
    age: number
    gender: number
}

// 将 T 的所有属性转换为只读类型
type ReadOnlyType<T> = {
    readonly [P in keyof T]: T
}

// type ReadOnlyPerson = {
//     readonly name: Person;
//     readonly age: Person;
//     readonly gender: Person;
// }
type ReadOnlyPerson = ReadOnlyType<Person>
```

### 类型谓词(is)

- 语法：`parameterName is Type`

  > `parameterName` 必须是来自于当前函数签名里的一个参数名，判断 parameterName 是否是 Type 类型。

具体的应用场景可以跟着下面的代码思路进行使用：

看完联合类型的例子后，可能会考虑：如果想要在 `start` 函数中，根据情况去调用 `Bird` 的 `fly` 方法和 `Fish` 的 `swim` 方法，该如何操作呢？

首先想到的可能是直接检查成员是否存在，然后进行调用：

```ts
function start(pet: Bird | Fish) {
    // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
    pet.layEggs();

    if ((pet as Bird).fly) {
        (pet as Bird).fly();
    } else if ((pet as Fish).swim) {
        (pet as Fish).swim();
    }
}
```

但是这样做，判断以及调用的时候都要进行类型转换，未免有些麻烦，可能会想到写个工具函数判断下：

```ts
function isBird(bird: Bird | Fish): boolean {
    return !!(bird as Bird).fly;
}

function isFish(fish: Bird | Fish): boolean {
    return !!(fish as Fish).swim;
}

function start(pet: Bird | Fish) {
    // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
    pet.layEggs();

    if (isBird(pet)) {
        (pet as Bird).fly();
    } else if (isFish(pet)) {
        (pet as Fish).swim();
    }
}
```

看起来简洁了一点，但是调用方法的时候，还是要进行类型转换才可以，否则还是会报错，那有什么好的办法，能让我们判断完类型之后，就可以直接调用方法，不用再进行类型转换呢？

OK，肯定是有的，类型谓词 `is` 就派上用场了

-   用法：

```TypeScript
function isBird(bird: Bird | Fish): bird is Bird {
    return !!(bird as Bird).fly
}

function start(pet: Bird | Fish) {
    // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
    pet.layEggs();

    if (isBird(pet)) {
        pet.fly();
    } else {
        pet.swim();
    }
};
```

每当使用一些变量调用 `isFish` 时，`TypeScript` 会将变量缩减为那个具体的类型，只要这个类型与变量的原始类型是兼容的。

> TypeScript 不仅知道在 if 分支里 pet 是 Fish 类型； 它还清楚在 else 分支里，一定不是 Fish 类型，一定是 Bird 类型

### 待推断类型(infer)

可以用 `infer P` 来标记一个泛型，表示这个泛型是一个待推断的类型，并且可以直接使用

比如下面这个获取函数参数类型的例子：

```TypeScript
type ParamType<T> = T extends (param: infer P) => any ? P : T;

type FunctionType = (value: number) => boolean

type Param = ParamType<FunctionType>;   // type Param = number

type OtherParam = ParamType<symbol>;   // type Param = symbol
```

判断 T 是否能赋值给 `(param: infer P) => any`，并且将参数推断为泛型 P，如果可以赋值，则返回参数类型 P，否则返回传入的类型

再来一个获取函数返回类型的例子：

```TypeScript
type ReturnValueType<T> = T extends (param: any) => infer U ? U : T;

type FunctionType = (value: number) => boolean

type Return = ReturnValueType<FunctionType>;   // type Return = boolean

type OtherReturn = ReturnValueType<number>;   // type OtherReturn = number
```

判断 T 是否能赋值给 `(param: any) => infer U`，并且将返回值类型推断为泛型 U，如果可以赋值，则返回返回值类型 P，否则返回传入的类型

### 原始类型保护(typeof)

-   语法：`typeof v === "typename"` 或 `typeof v !== "typename"`

> 用来判断数据的类型是否是某个原始类型（`number`、`string`、`boolean`、`symbol`）并进行类型保护

> "typename"必须是 "number"， "string"， "boolean"或 "symbol"。 但是 TypeScript 并不会阻止你与其它字符串比较，语言不会把那些表达式识别为类型保护。

看下面这个例子， `print` 函数会根据参数类型打印不同的结果，那如何判断参数是 `string` 还是 `number` 呢？

```TypeScript
function print(value: number | string) {
    // 如果是 string 类型
    // console.log(value.split('').join(', '))

    // 如果是 number 类型
    // console.log(value.toFixed(2))
}
```

有两种常用的判断方式：

1. 根据是否包含 `split` 属性判断是 `string` 类型，是否包含 `toFixed` 方法判断是 `number` 类型

   > 弊端：不论是判断还是调用都要进行类型转换

2. 使用类型谓词 `is`
   
   > 弊端：每次都要去写一个工具函数，太麻烦了

-   用法：这就到了 `typeof` 一展身手的时候了

```TypeScript
function print(value: number | string) {
    if (typeof value === 'string') {
        console.log(value.split('').join(', '))
    } else {
        console.log(value.toFixed(2))
    }
}
```

> 使用 typeof 进行类型判断后，TypeScript 会将变量缩减为那个具体的类型，只要这个类型与变量的原始类型是兼容的。

### 类型保护(instanceof)

与 `typeof` 类似，不过作用方式不同，`instanceof` 类型保护是通过构造函数来细化类型的一种方式。

`instanceof` 的右侧要求是一个构造函数，`TypeScript` 将细化为：

-   此构造函数的 `prototype` 属性的类型，如果它的类型不为 `any` 的话
-   构造签名所返回的类型的联合

还是以 _类型谓词 is_ 示例中的代码做演示：

最初代码：

```TypeScript
function start(pet: Bird | Fish) {
    // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
    pet.layEggs();

    if ((pet as Bird).fly) {
        (pet as Bird).fly();
    } else if ((pet as Fish).swim) {
        (pet as Fish).swim();
    }
}
```

使用 `instanceof` 后的代码：

```TypeScript
function start(pet: Bird | Fish) {
    // 调用 layEggs 没问题，因为 Bird 或者 Fish 都有 layEggs 方法
    pet.layEggs();

    if (pet instanceof Bird) {
        pet.fly();
    } else {
        pet.swim();
    }
}
```

可以达到相同的效果

### 索引类型查询操作符(keyof)

-   语法：`keyof T`

> 对于任何类型 `T`， `keyof T` 的结果为 `T` 上已知的 **公共属性名** 的 **联合**


```TypeScript
interface Person {
    name: string;
    age: number;
}

type PersonProps = keyof Person; // 'name' | 'age'
```

这里，`keyof Person` 返回的类型和 'name' | 'age' 联合类型是一样，完全可以互相替换

-   用法：`keyof` 只能返回类型上已知的 **公共属性名**

```TypeScript
class Animal {
    type: string;
    weight: number;
    private speed: number;
}

type AnimalProps = keyof Animal; // "type" | "weight"
```

例如我们经常会获取对象的某个属性值，但是不确定是哪个属性，这个时候可以使用 `extends` 配合 `typeof` 对属性名进行限制，限制传入的参数只能是对象的属性名

```TypeScript
const person = {
    name: 'Jack',
    age: 20
}

function getPersonValue<T extends keyof typeof person>(fieldName: keyof typeof person) {
    return person[fieldName]
}

const nameValue = getPersonValue('name')
const ageValue = getPersonValue('age')

// 会报错：Argument of type '"gender"' is not assignable to parameter of type '"name" | "age"'
// getPersonValue('gender')
```

### 索引访问操作符(T[K])

-   语法：`T[K]`

> 类似于 `js` 中使用对象索引的方式，只不过 `js` 中是返回对象属性的值，而在 `ts` 中返回的是 `T` 对应属性 P 的类型

-   用法：

```TypeScript
interface Person {
    name: string
    age: number
    weight: number | string
    gender: 'man' | 'women'
}

type NameType = Person['name']  // string

type WeightType = Person['weight']  // string | number

type GenderType = Person['gender']  // "man" | "women"
```

## 三、映射类型

### 只读类型(`Readonly<T>`)

-   定义：

```TypeScript
type Readonly<T> = {
    readonly [P in keyof T]: T[P];
}
```

> 用于将 `T` 类型的所有属性设置为只读状态。

-   用法：

```TypeScript
interface Person {
    name: string
    age: number
}

const person: Readonly<Person> = {
    name: 'Lucy',
    age: 22
}

// 会报错：Cannot assign to 'name' because it is a read-only property
person.name = 'Lily'
```

> `readonly` 只读， 被 `readonly` 标记的属性只能在声明时或类的构造函数中赋值，之后将不可改（即只读属性）

### 只读数组(`ReadonlyArray<T>`)

-   定义：

```TypeScript
interface ReadonlyArray<T> {
    /** Iterator of values in the array. */
    [Symbol.iterator](): IterableIterator<T>;

    /**
     * Returns an iterable of key, value pairs for every entry in the array
     */
    entries(): IterableIterator<[number, T]>;

    /**
     * Returns an iterable of keys in the array
     */
    keys(): IterableIterator<number>;

    /**
     * Returns an iterable of values in the array
     */
    values(): IterableIterator<T>;
}
```

只能在数组初始化时为变量赋值，之后数组无法修改

-   使用：

```TypeScript
interface Person {
    name: string
}

const personList: ReadonlyArray<Person> = [{ name: 'Jack' }, { name: 'Rose' }]

// 会报错：Property 'push' does not exist on type 'readonly Person[]'
// personList.push({ name: 'Lucy' })

// 但是内部元素如果是引用类型，元素自身是可以进行修改的
personList[0].name = 'Lily'
```

### 可选类型(`Partial<T>`)

用于将 `T` 类型的所有属性设置为可选状态，首先通过 `keyof T`，取出类型 `T` 的所有属性，
然后通过 `in` 操作符进行遍历，最后在属性后加上 `?`，将属性变为可选属性。

-   定义：

```TypeScript
type Partial<T> = {
    [P in keyof T]?: T[P];
}
```

-   用法：

```TypeScript
interface Person {
    name: string
    age: number
}

// 会报错：Type '{}' is missing the following properties from type 'Person': name, age
// let person: Person = {}

// 使用 Partial 映射后返回的新类型，name 和 age 都变成了可选属性
let person: Partial<Person> = {}

person = { name: 'pengzu', age: 800 }

person = { name: 'z' }

person = { age: 18 }
```

### 必选类型(`Required<T>`)

和 `Partial` 的作用相反

用于将 `T` 类型的所有属性设置为必选状态，首先通过 `keyof T`，取出类型 `T` 的所有属性，
然后通过 `in` 操作符进行遍历，最后在属性后的 `?` 前加上 `-`，将属性变为必选属性。

-   定义：

```TypeScript
type Required<T> = {
    [P in keyof T]-?: T[P];
}
```

-   使用：

```TypeScript
interface Person {
    name?: string
    age?: number
}

// 使用 Required 映射后返回的新类型，name 和 age 都变成了必选属性
// 会报错：Type '{}' is missing the following properties from type 'Required<Person>': name, age
let person: Required<Person> = {}
```

### 提取属性(`Pick<T>`)

-   定义：

```TypeScript
type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
}
```

> 从 `T` 类型中提取部分属性，作为新的返回类型。

-   使用：比如我们在发送网络请求时，只需要传递类型中的部分属性，就可以通过 `Pick` 来实现。

```TypeScript
interface Goods {
    type: string
    goodsName: string
    price: number
}

// 作为网络请求参数，只需要 goodsName 和 price 就可以
type RequestGoodsParams = Pick<Goods, 'goodsName' | 'price'>
// 返回类型：
// type RequestGoodsParams = {
//     goodsName: string;
//     price: number;
// }
const params: RequestGoodsParams = {
    goodsName: '',
    price: 10
}
```

### 排除属性(`Omit<T>`)

- 定义：`type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>`

  > 和 `Pick` 作用相反，用于从 `T` 类型中，排除部分属性

- 用法：比如长方体有长宽高，而正方体长宽高相等，所以只需要长就可以，那么此时就可以用 `Omit` 来生成正方体的类型

```TypeScript
interface Rectangular {
    length: number
    height: number
    width: number
}

type Square = Omit<Rectangular, 'height' | 'width'>
// 返回类型：
// type Square = {
//     length: number;
// }

const temp: Square = { length: 5 }
```


### 摘取类型(`Extract<T, U>`)

- 语法：`Extract<T, U>`

  > 提取 `T` 中可以 **赋值** 给 `U` 的类型

- 定义：`type Extract<T, U> = T extends U ? T : never;`

- 用法：

```TypeScript
type T01 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "a" | "c"

type T02 = Extract<string | number | (() => void), Function>;  // () => void
```

### 排除类型(`Exclude<T, U>`)

- 语法：`Exclude<T, U>`

  > 与 `Extract` 用法相反，从 `T` 中剔除可以赋值给 `U`的类型

- 定义：`type Exclude<T, U> = T extends U ? never : T`

- 用法：

```TypeScript
type T00 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"

type T01 = Exclude<string | number | (() => void), Function>;  // string | number
```

### 属性映射(`Record<K, T>`)

-   定义：

```TypeScript
type Record<K extends string | number | symbol, T> = {
    [P in K]: T;
}
```

> 接收两个泛型，`K` 必须可以是可以赋值给 `string | number | symbol` 的类型，通过 `in` 操作符对 `K` 进行遍历，每一个属性的类型都必须是 `T` 类型

-   用法：比如我们想要将 `Person` 类型的数组转化成对象映射，可以使用 `Record` 来指定映射对象的类型

```TypeScript
interface Person {
    name: string
    age: number
}

const personList = [
    { name: 'Jack', age: 26 },
    { name: 'Lucy', age: 22 },
    { name: 'Rose', age: 18 },
]

const personMap: Record<string, Person> = {}

personList.map((person) => {
    personMap[person.name] = person
})
```

比如在传递参数时，希望参数是一个对象，但是不确定具体的类型，就可以使用 `Record` 作为参数类型

```TypeScript
function doSomething(obj: Record<string, any>) {
}
```

### 不可为空类型(`NonNullable<T>`)

-   定义：`type NonNullable<T> = T extends null | undefined ? never : T`

> 从 T 中剔除 `null`、`undefined`、`never` 类型，不会剔除 `void`、`unknow` 类型

```TypeScript
type T01 = NonNullable<string | number | undefined>;  // string | number

type T02 = NonNullable<(() => string) | string[] | null | undefined>;  // (() => string) | string[]

type T03 = NonNullable<{name?: string, age: number} | string[] | null | undefined>;  // {name?: string, age: number} | string[]
```

### 构造函数参数类型(`ConstructorParameters<typeof T>`)

> 返回 class 中构造函数参数类型组成的 **元组类型**

-   定义：

```TypeScript
/**
 * Obtain the parameters of a constructor function type in a tuple
 */
type ConstructorParameters<T extends new (...args: any) => any> = T extends new (...args: infer P) => any ? P : never;
```

-   使用：

```TypeScript
class Person {
    name: string
    age: number
    weight: number
    gender: 'man' | 'women'

    constructor(name: string, age: number, gender: 'man' | 'women') {
        this.name = name
        this.age = age;
        this.gender = gender
    }
}

type ConstructorType = ConstructorParameters<typeof Person>  //  [name: string, age: number, gender: "man" | "women"]

const params: ConstructorType = ['Jack', 20, 'man']
```

### 实例类型(`InstanceType<T>`)

> 获取 class 构造函数的返回类型

-   定义：

```TypeScript
/**
 * Obtain the return type of a constructor function type
 */
type InstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
```

-   使用：

```TypeScript
class Person {
    name: string
    age: number
    weight: number
    gender: 'man' | 'women'

    constructor(name: string, age: number, gender: 'man' | 'women') {
        this.name = name
        this.age = age;
        this.gender = gender
    }
}

type Instance = InstanceType<typeof Person>  // Person

const params: Instance = {
    name: 'Jack',
    age: 20,
    weight: 120,
    gender: 'man'
}
```

### 函数参数类型(`Parameters<T>`)

> 获取函数的参数类型组成的 **元组**

-   定义：

```TypeScript
/**
 * Obtain the parameters of a function type in a tuple
 */
type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
```

-   用法：

```TypeScript
type FunctionType = (name: string, age: number) => boolean

type FunctionParamsType = Parameters<FunctionType>  // [name: string, age: number]

const params:  FunctionParamsType = ['Jack', 20]
```

### 函数返回值类型(`ReturnType<T>`)

> 获取函数的返回值类型

-   定义：

```TypeScript
/**
 * Obtain the return type of a function type
 */
type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

-   使用：

```TypeScript
type FunctionType = (name: string, age: number) => boolean | string

type FunctionReturnType = ReturnType<FunctionType>  // boolean | string
```

## 四、总结

- 高级类型

  | 用法 | 描述                                                         |
  | ---: | :----------------------------------------------------------- |
  |    & | 交叉类型，将多个类型合并为一个类型，交集                     |
  |    \ | 联合类型，将多个类型组合成一个类型，可以是多个类型的任意一个，并集 |

- 关键字

  | 用法                    | 描述                                                         |
  | :---------------------- | :----------------------------------------------------------- |
  | T extends U             | 类型约束，判断 T 是否可以赋值给 U                            |
  | P in T                  | 类型映射，遍历 T 的所有类型                                  |
  | parameterName is Type   | 类型谓词，判断函数参数 parameterName 是否是 Type 类型        |
  | infer P                 | 待推断类型，使用 infer 标记类型 P，就可以使用待推断的类型 P  |
  | typeof v === "typename" | 原始类型保护，判断数据的类型是否是某个原始类型（`number`、`string`、`boolean`、`symbol`） |
  | instanceof v            | 类型保护，判断数据的类型是否是构造函数的 `prototype` 属性类型 |
  | keyof                   | 索引类型查询操作符，返回类型上已知的 **公共属性名**          |
  | T[K]                    | 索引访问操作符，返回 `T` 对应属性 P 的类型                   |

- 映射类型

  | 用法                            | 描述                                |
  | :------------------------------ | :---------------------------------- |
  | Readonly<T>                     | 将 T 中所有属性都变为只读           |
  | ReadonlyArray<T>                | 返回一个 T 类型的只读数组           |
  | ReadonlyMap<T, U>               | 返回一个 T 和 U 类型组成的只读 Map  |
  | Partial<T>                      | 将 T 中所有的属性都变成可选类型     |
  | Required<T>                     | 将 T 中所有的属性都变成必选类型     |
  | Pick<T, K extends keyof T>      | 从 T 中摘取部分属性                 |
  | Omit<T, K extends keyof T>      | 从 T 中排除部分属性                 |
  | Exclude<T, U>                   | 从 T 中剔除可以赋值给 U 的类型      |
  | Extract<T, U>                   | 提取 T 中可以赋值给 U 的类型        |
  | Record<K, T>                    | 返回属性名为 K，属性值为 T 的类型   |
  | NonNullable<T>                  | 从 T 中剔除 null 和 undefined       |
  | ConstructorParameters<typeof T> | 获取 T 的构造函数参数类型组成的元组 |
  | InstanceType<typeof T>          | 获取 T 的实例类型                   |
  | Parameters<T>                   | 获取函数参数类型组成的元组          |
  | ReturnType<T>                   | 获取函数返回值类型                  |

## 写在后面

如果有写的不对或不严谨的地方，欢迎大家能提出宝贵的意见，十分感谢。

如果喜欢或者有所帮助，欢迎 Star，对作者也是一种鼓励和支持