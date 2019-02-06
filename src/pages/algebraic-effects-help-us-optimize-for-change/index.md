---
title: Algebraic Effects Help Us Optimize for Change
description: Algebraic effects help reduce the error surface area of systems by seperating effects from their handlers without requiring the rest of the system to link them together.
date: "2019-02-08"
hidden: true
---

When creating and working in any large system, it's easy to write code that makes refactoring and tinkering within the system more difficult.

```js
function double(x) {
  return x * 2
}
```

`double` is deterministic and composable.  The mental model is simple.  However It gives strange results if you pass in anything other than a number.

We can help by acknowledging that and adding some light logic to warn the user.


```js{2-6}
function double(x) {
  if (!Number.isFinite(x)) {
    return console.error(
      `double(x): ${x} is not a number`
    )
  }

  return x * 2
}
```

Some of our users love this, some hate it.  They don't want `double` logging in production.  They pay for error reporting software they want to hook into.

**We need to lift the handling of this error up.**  We can do that using callbacks and something like an `onError` argument.


```js{3-6}
function double(x, opts = {}) {
  if (!Number.isFinite(x)) {
    const error = `double(x): ${x} is not a number`;
    if (opts.onError) {
      return opts.onError(error)
    }
 
    return console.error(error)
  }

  return x * 2
}
```

### Good Architecture Helps Systems and New Developers Grow

This solution above has some [serious issues](http://callbackhell.com/) at scale.  It causes drag while refactoring and makes it harder for new developers to fall into the [pit of success.](https://blog.codinghorror.com/falling-into-the-pit-of-success/)

1. For every abstraction in your system, you need to be aware of the `onError` function.  It would be easy for a new developer entering your codebase to make a mistake and forget to pass it along.
2. The control flow of your entire system needs to account for the cases where errors cause early returns.  We have to work with the callstack.

Imagine coming into a company with no context of the system, and trying to add something to it that has early returns and threads handlers.

```js
import double from "./double";

// How were we supposed to know we get a second argument
// that has an onError function?
function doublePlusOne(x) {

  // if double isn't a number, it will return a string!
  return double(x) + 1;
}
```

In peer review, you would need someone catch that you're not piping through `onError` or handling a possible early return.  Static Typing helps here, but still errors are possible.

This is the version that handles those edge cases.

```js
function doublePlusOne(x, opts={}) {
  const doubled = double(x, opts);

  // We errored
  if (!doubled) { return; }

  return doubled + 1;
}
```

What if the nested function said what _has_ happened, and yielded control to some outside block of code that says what _should_ happen, without having to thread that logic through the system.  That would reduce the error surface area of the code.

### Learning from `Try/Catch`

Programming languages like Koka and Eff make algebraic effects first class citizens, however Javascript does not.

Javascript has algebraic-like abstractions like `try/catch` and `async/await`, but it doesn't expose anything that allows us to build those two ourselves.

We can use them to help us understand what algebraic effects are.

```js{3,12-18}
function double(x) {
  if (!Number.isFinite(x)) {
    throw `double(x): ${x} is not a number`;
  }

  return x * 2
}
 
// anyone consuming our code can wrap at the top level!
try {
  double("😵")
} catch (error) {
  ErrorService.log(error);
 
  if (!env.PROD) {
    console.error(error)
  }
}
```

Our system has become a lot healthier now that:
* `throw` only needs to change if we want to communicate a different error, and we can colocate it next to relevant code.
* You can override a higher up in the system `catch` by adding another `try` block deeper in the system.
* Neither the consumed module, nor the consumer have to worry about cleaning up everything inbetween the effect and the handler during a refactor

While engineering, change and iteration can be rapid.  The speed at which we can collaborate and refactor is key to getting a quality end result.

**Imagine if we could extract the essence of `try/catch` and apply that to other programming concepts such as fetching data.**

Instead of our effect being named `throw` we will name it `get`.

```js
function double() {
  const x = get "number";
  return x * 2
}
```

Our users can now interact with this double function without our system being aware.  In this imaginary land, when javascript finds a `get` it would start looking for a handler.

```js
function double() {
  const x = get "number";
  return x * 2
}

try {
  double()
} onGet(property, resume) {
  // resume lets double() continue running with the value!
  if (property === "number") {
    API.get("/number").then(
      response => resume(response.data.number)
    )
  }
}
```

We wouldn't have to tightly couple a large system to any specific API, we could easily allow for others to plug and play.  They could even control our system's code flow, all from the outside.

### 🏆 Summing it Up

Algebraic effects allow us to make only two parts of our system aware of side effects. Where the effect fires, and where it is handled.

This reduces drag when iterating, by speeding up the refactor path.  You rarely have to touch where an effect is fired, or the in between code of the system.  Often you just move the handler up and down some levels.

It also gives those consuming your system free entry points to integrate.  As long as this is documented and exposed, you gain a lot of flexibility for free.

---

If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me **@yurkaninryan** any time!

Good luck and happy coding!! 😄










