---
title: Why do refs in React have a key named current?
description: This question boggled my mind for a few months, but after working with function components for awhile it finally clicked.  Let's dig deep and learn about closures, currying, and partial application along the way.
date: "2019-06-28"
---

Before React 16.3, refs were only a special prop you could give to React Elements that allows you to capture the DOM element it points to, or it's instance (if it's a class component)

```jsx
/* React will call this when the input dom element is in the dom */
function focusMyInput(element) {
  if (!element) { return; }

  element.focus();
}

function Input() {
  return (
    <input ref={focusMyInput} />
  )
}
```

That version uses what is called a [callback ref](https://reactjs.org/docs/refs-and-the-dom.html#callback-refs). Callback refs give fine control over what you want to do with the ref you get from React.

Most of the time, we just want to store the ref somewhere and clean it up when the component unmounts.

In class components we can store it as a property of `this` like so:

```jsx{4,7,8,20}
class Input extends React.Component {
  constructor(props) {
    super(props);
    this.storeRef = this.storeRef.bind(this);
  }

  inputRef = null;
  storeRef = element => this.inputRef = element;

  focusInput = () => {
    if (!this.inputRef) { return; }

    this.inputRef.focus();
  }

  render() {
    /* now we have the ref for the rest of the time this component is mounted  */
    return (
      <form>
        <input ref={storeRef} />
        <button onClick={focusInput}>Focus the input!</button>
      </form>
    )
  }
}
```

React 16.3 brought us the `createRef` API to help standardize this common pattern, but it has a curious difference.  Now when we access our refs, we have to do `ref.current`!

```jsx{4,10,11,19}
class Input extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  focusInput = () => {
    if (!this.inputRef.current) { return; }

    /* 🤔🤔🤔 */
    this.inputRef.current.focus();
  }

  render() {
    /* now we have the ref for the rest of the time this component is mounted  */
    return (
      <form>
        <input ref={this.inputRef} />
        <button onClick={focusInput}>Focus the input!</button>
      </form>
    )
  }
}
```

Why is this useful?
Why is the ref always an object with a key named `current`?
Couldn't it just be the value?

To understand this neat little trick, we need to understand what closures are.

### Currying, Closures, and Partial Application

Did you know that a function can return another function?

The returned function even remembers all the variables from the scope above it. <br />Check out this funky way to write an `add` function.

```js
function add(firstNumber) {

  /* When this function is created it will remember what firstNumber was! 🤯 */
  return function(secondNumber) {
    return firstNumber + secondNumber
  }
}

/* Then you can use it like this! */
const sum = add(10)(15); // 25

/* You can also only call it once and make entirely new functions! */
const addTen = add(10);

addTen(15); // 25
```

Read that a few times and let's map these concepts to programming jargon:
* `currying` is making a function return more functions for each of it's arguments.  It's named after [Haskell Curry](https://en.wikipedia.org/wiki/Haskell_Curry)

* a `closure` is when a created function remembers the values for variables from the scope above

* `partial application` is creating a new function from an existing function with some arguments set to static values

I want to dive a bit more into closures, specifically the concept of a "stale" closure.  It's important to understand that closures will remember values **when they are created.**

If that value updates later on, unless the function gets re-created afterwards, it may not have the value you were expecting.  Take a look at this example:

```js
function add(firstNumber) {

  /* When this function is created it will remember what firstNumber was! 🤯 */
  return function(secondNumber) {
    return firstNumber + secondNumber
  }
}

/* Let's partially apply a number that can change! */
let dynamicNumber = 10;
let addDynamicNumber = add(dynamicNumber);

addDynamicNumber(15); // 25

/* Later on we update that dynamicNumber value */
dynamicNumber = 20;
addDynamicNumber(15) // 25 ... wait what?
```

This happens because when our `addDynamicNumber` function was created, the value was 10, and wasn't tied to the dynamicNumber variable anymore.  If we wanted this to work the correct way we would have to recreate the function!

> **Note:** This is also why you can get into some nasty trouble with the dependencies array in `useEffect`.  It doesn't recreate the function everytime if you use it so you can have a stale closure.

In that example we are passing numbers which **pass by value**.  Some types of values will **pass by reference** which causes some interesting interactions.

```js
/* PASS BY VALUE EXAMPLE */
let x = 1;
const y = x; // Here we pass by value.

x = 2;
console.log(y) // 1! y isn't x, it just took it's value

/* PASS BY REFERENCE EXAMPLE */
let me = {};
const you = me; // Here we pass by reference.

me.mindblown = true;
console.log(you.mindblown) // true!  you and me are the same object
```

Let's bring back our ref friend, and show how we can *technically* make our `addDynamicNumber` function work.

```js{4,5,10,13,14}
function add(firstNumber) {
  return function(secondNumber) {

    /* firstNumber is now an object, with a current key! */
    return firstNumber.current + secondNumber
  }
}

/* We surround the number with an object here */
let dynamicNumber = { current: 10, };
let addDynamicNumber = add(dynamicNumber);

dynamicNumber.current = 20;
addDynamicNumber(15) // 35!
```

Even though the closure is stale, it still has the reference to our `dynamicNumber` object.  Meaning if we mutate it, then everything will continue to work fine!

### Bringing it back to React

It's important to understand that in React, each render `props` is a new object, however `this` isn't.  These two bits of code would **NOT** behave the same way.

```js
componentDidMount() {
  window.setInterval(() => {
    /* this is mutated, it doesn't change */
    /* If name updates we will see it */
    console.log(this.props.name)
  }, 1000)
}

/* vs */

componentDidMount() {
  const { props, } = this;
  window.setInterval(() => {
    /* Props changes every time! */
    /* If name updates we won't see it */
    console.log(props.name)
  }, 1000)
}
```

Not all components in React are class components, so relying on `this` not changing isn't sustainable.  The React Team needed to make that behavior accessible everywhere.

`createRef` seemed redundant at first, but it made a lot more sense when they unveiled `useRef` in the hooks update.  Now function components had a way to break through stale closures!

```jsx
function Interval(props) {
  const stored = useRef(props.callback);

  /* Make sure the ref and props are always in sync after each commit */
  React.useEffect(() => {
    stored.current = props.callback;
  })

  /* Make the interval, empty depedencies array means */
  /* the function is only created once */
  React.useEffect(() => {
    window.setInterval(() => {
      /* this closure can be stale, we abuse our trick and it works! */
      stored.current();
    }, 1000)
  }, [])
}
```

`useRef` takes care of maintaing that object reference, as well as cleaning it up when our components unmount.  It makes sense that `createRef` returns the same structure to limit confusion!

* * * * *

If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me **@yurkaninryan** any time!

Good luck and happy coding!! 😄