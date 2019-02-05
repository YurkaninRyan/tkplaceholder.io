---
title: Algebraic Effects Help Us Optimize for Change
description: TK-description
date: "2019-02-08"
hidden: true
---

I first heard the term [Algebraic Effects while working with React](https://github.com/reactjs/react-basic#algebraic-effects), and it sparked my curiosity.

I stumbled upon [this tutorial linked in the Eff Docs](https://www.eff-lang.org/handlers-tutorial.pdf) and found an interesting description for Algebraic Effects.

> impure behaviour arises from a set of operations such as get & set for mutable store, read & print for interactive input & output, or **raise for exceptions**
>
> This naturally gives rise to **handlers not only of exceptions, but of any other effect**

Raising exceptions and handling them?  I've been doing that my entire career!  It sounds like they are talking about `try/catch` blocks. 💡

Let's take a look at error handling in Javascript.

```js{2,3,4}
function greet(name) {
  if (!name) {
    throw "You forgot to give a name"
  }

  console.log(`Hey, ${name}`);
}
```


