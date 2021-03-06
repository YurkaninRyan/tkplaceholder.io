---
title: Algebraic Effects Help Us Optimize for Change
description: Algebraic effects help reduce the mental overhead of working in a codebase allowing new developers to work without fear of breaking the system
hidden: false
date: "2019-02-07"
---

When a function has to interact with anything other than itself it emits **side effects.**

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

`double` is handling an error here by logging with `console`.  The cause and handler of the effect are colocated. 

Some of our users love this; some _hate it._  What if they don't want `double` logging in production, or  they pay for error reporting software they want to hook into?

**We need to lift the handling of this effect up.** How do we signal that an effect should be handled though?

We _could_ do that using callbacks and something like an `onError` argument.


```js{3-6}
function double(x, opts) {
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

This solution has some [serious issues](http://callbackhell.com/) at scale.  It causes drag while refactoring and makes it harder for new developers to fall into the [pit of success.](https://blog.codinghorror.com/falling-into-the-pit-of-success/)

### Good Architecture Helps Codebases and Developers Scale

Imagine having to write code in a layer that lives between `double` and the rest of the code.

```js
import double from "./double";

// How were we supposed to know we get a second argument
// that has an onError function?
function doublePlusOne(x) {

  // if double isn't a number, it will return a string!
  return double(x) + 1;
}
```

**You will break code** if you forget to pipe `onError` through, or if you don't know that `double` returns early on error.

This is the version that handles those edge cases.

```js
import double from "./double";

function doublePlusOne(x, opts) {
  // Can't forget to pipe our "opts"
  const doubled = double(x, opts);

  // We must of received an error.
  if (!Number.isNumber(doubled)) { return null; }

  return doubled + 1;
}
```

If we didn't have to handle these cases and instead could magically connect the cause of the effect to the handler life would be easier for everyone.

```js{3,9-12}
function double(x) {
  if (!Number.isFinite(x)) {
    throw `double(x): ${x} is not a number`;
  }

  return x * 2
}
 
// We don't have to be aware anymore!
function doublePlusOne(x) {
  return double(x) + 1;
}
 
// anyone consuming our code can wrap at the top level!
try {
  doublePlusOne("😵")
} catch (error) {
  ErrorService.log(error);
 
  if (!env.PROD) {
    console.error(error)
  }
}
```

This is a large part of what makes an effect algebraic.  `doublePlusOne` can exist without being aware of the side effect.

Any code added in between is safe from that mental overhead.

### Learning from `Try/Catch`

How would you recreate `try/catch` in Javascript if it wasn't a default part of the language?

1. `throw` stops at the first `catch` block it encounters, allowing for a top level default that can be overridden.
2. When we `throw` the call stack is discarded.  This lets us break the rules of any language that works primarily with `return`.


Programming languages like Koka and Eff make algebraic effects first class citizens, however Javascript does not.  You could build `try/catch` in those languages.

Javascript doesn't expose the tools we need to create algebraic effects, but it does expose abstractions like `try/catch` and `async/await`.

While engineering, change and iteration can be rapid.  The speed at which we can collaborate and refactor is key to getting a quality end result.

**Imagine if we could extract the essence of `try/catch` and apply that to other programming concepts such as fetching data.**

In this imaginary land, when Javascript finds a `fetch.throw` it would start looking for a handler.


```js
const fetch = new Effect();

function double() {
  const x = fetch.throw("number");
  return x * 2
}

try {
  double()
} fetch.catch(resume, ...args) {
  // resume lets double() continue running with the value!
  if (property === "number") {
    API.get("/number").then(
      response => resume(response.data.number)
    )
  }
}
```

You may have noticed `resume` being passed into the handler.  In languages that expose algebraic effects they usually have a way to return to where the `throw` occurred.

### How Does This Help Optimize for Change?

Earlier in this article, I talked about how we had to "lift the handler up", in order to expose behavior.

I like to think of "Time to Refactor" as a very important part of any API.  If an effect pipes through code as you move the handler up and down you have to clean up/pipe it through relevant spots.

Algebraic Effects minimalize the amount of code you have to touch, which means:

1. PR's will be smaller making code review quicker and less intimidating.
2. Iterations will take less time and be smoother because you don't have to touch every file in between the effect and the handler.
3. There are less chances to make a mistake and silently break other parts of the codebase.

### Wrapping Up

Algebraic effects make two parts of our codebase aware of side effects: where the effect fires and where it is handled.

By speeding up the refactor cycle, we can iterate faster.  You rarely have to touch where an effect is fired, or the in between code of the codebase.  Often you just move the handler up and down some levels.

It also gives those consuming your codebase free entry points to integrate.  As long as this is documented and exposed, you gain a lot of flexibility for free.

---

If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me **@yurkaninryan** any time!

Good luck and happy coding!! 😄










