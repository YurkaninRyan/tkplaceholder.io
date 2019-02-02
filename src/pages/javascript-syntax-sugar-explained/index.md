---
title: "Javascript Syntax Sugar Explained"
description: Syntax sugar is shorthand for communicating a larger thought in a programming language.
date: "2018-02-06"
---

Syntactic sugar is shorthand for communicating a larger thought in a programming language.

I like to compare it to acronyms in natural languages. At first, seeing a new acronym can be confusing, but once you know what it means it's way faster!

With syntactic sugar - like with acronyms - you can GTFAMLH! (go too far and make life harder)

I was fresh out of college, making fun apps at hackathons with my friends, and on a newbie JavaScript thrill ride. I felt **unstoppable**. I understood all the Codecademy examples, I committed every front end interview question to memory. I watched ["What the... JavaScript?"](https://www.youtube.com/watch?v=2pL28CcEijU) so many times that if a rampaging monkey scream-slammed random lines of code into a console, I knew what it would evaluate to.

It was time for me to get on GitHub, and share my gift with the *world*. I opened up the first project I could find, and started reading. It looked something like this:

Moments later...

![](https://cdn-images-1.medium.com/max/1600/1*Fyz7A2P4dj7jsBt0vKltZQ.png)

Confused and defeated, I closed out the browser tab and quit for the day. This would begin a chain of me doing the following:

1.  Discover a line of code which at the time was just JavaScript hieroglyphics.
2.  Not knowing how to ask the right questions, and crafting quite possibly the worst Google searches known to humankind.
3.  Bothering random developers until someone could "Explain Like I'm 5," but in the end, still being confused why someone would write something like that. Sadism, *probably*.
4. Having it click, getting why it's useful, understanding what problem it solves, and understanding what people did in the past to solve the problem. It was just a more concise way of writing code! It's just sugar!
5. Sometimes, using it waytoo much and making my code subjectively worse.
6. Finding the balance, and adding a great tool to my JavaScript toolkit. 👷
7. Rinse and repeat about 20 times.

Now I'm here to try and break it down simply for you! For each sugary trick, I'll include some backstory, a problem it could help solve, how you could achieve it before the syntactic sugar, and situations where you may not want to use it! 🎉

### Ternary Operator

The Ternary Operator is one of my favorite ones to start with when talking about sugar in JavaScript, since it's really easy to go too far. It normally takes the form of `x ? a : b`. Here's a more realistic example:

```js
const amILazy = true;
const dinnerForTonight = amILazy ? "spaghetti" : "chicken";
```

Problem: I have a variable that depends on some condition being true or false.
Sugar-free way: This is basically just a really shorthand way to do an `if/else`!

```js
const amILazy = true;
let dinnerForTonight = null;

if (amILazy) {
  dinnerForTonight = "spaghetti";
} else {
  dinnerForTonight = "chicken";
}
```

**When not to use it:** Ternaries are a very simple way to express branching paths. However, they can become hard to read when nested.  Use carefully.

```js
const canYouFireMe = someCondition1 ?
  (someCondition2 ? 
    false :
    (someCondition3 ? true : false)
    : false)
  : false
```

Less code does not mean more concise code.

### Object Spread

In Javascript, when you see `...`, **depending on context** it's going to be Object/Array Spread, or Object/Array Rest. We are going to cover Rest in a bit, so let's put that on the back burner.

Spreading is basically taking a single object, pulling all of its key/value pairs out, and putting them into another object. Here's a basic example of spreading two objects into a new object:

```js
const DEFAULT_CONFIG = {
  preserveWhitespace: true,
  noBreaks: false,
  foo: "bar",
};

const USER_CONFIG = {
  noBreaks: true,
}

const config = { ...DEFAULT_CONFIG, ...USER_CONFIG };
// console.log(config) => {
//   preserveWhitespace: true,
//   noBreaks: true,
//   foo: "bar",
// }
```

**Problem:** I have an object, and I want to make another object that has all the same keys, with all the same values. Perhaps I want to do that with multiple objects, and if there are duplicate keys, choose which object's keys win out.

**Sugar-free way:** You could use `Object.assign()` to [achieve a similar effect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign). It takes any number of objects as arguments, gives priority to the right-most objects when it comes to keys, and ends up mutating the very first object given. A common error is not passing in an empty object as the first argument and accidentally mutating an argument you didn't mean to.

If that's hard to follow, you'll be happy to know that Object Spread makes that impossible. Here's an example that replicates the syntax sugar version.

```js{11,12,13,14,15}
const DEFAULT_CONFIG = {
  preserveWhitespace: true,
  noBreaks: false,
  foo: "bar",
};

const USER_CONFIG = {
  noBreaks: true,
}

// if we didn't pass in an empty object here, config
// would point to DEFAULT_CONFIG, and default config would be
// mutated
const config = Object.assign({}, DEFAULT_CONFIG, USER_CONFIG);
```


Object spread removes the chance for an accidental mutation. So you could do things, like update Redux State, without the fear of accidentally keeping a reference causing shallow comparison to fail.

**🎉 Bonus 🎉** Array spread works very similarly! But since there aren't any keys in arrays, it just kind of adds it to the new array like a `Array.Prototype.concat` call.

```js
const arr1 = ['a', 'b', 'c'];\
const arr2 = ['c', 'd', 'e'];\
const arr3 = [...arr1, ...arr2];\
*// console.log(arr3) => ['a', 'b', 'c', 'c', 'd', 'e']*
```

### Object Destructuring

This one I see pretty commonly out in the wild. Now, we have our new config object from the previous example, and want to use it in our code. You may see something like this scattered about the codebase.

```js
const { preserveWhiteSpace, noBreaks } = config;

// Now we have two new variables to play around with!*
if (preservedWhitespace && noBreaks) { doSomething(); };
```

**Problem:** Having to write out the whole path to a key in an object can get pretty heavy, and clog up a lot of the code. To be more concise, it would be better to make a variable out of the value to keep the code neat.

**Sugar-free way:** You can always do it the old fashioned way! That would look something like this.

```js
const preserveWhitespace = config.preserveWhitepsace;
const noBreaks = config.noBreaks;
// Repeat forever until you have all the variables you need

if (preservedWhitespace && noBreaks) { doSomething(); };
```

**When not to use it:** You can actually destructure an object out of an object, and continue to destructure deeper and deeper! Destructuring isn't the only way to get a key out of an Object. If you find yourself only using destructuring for keys two or three layers deep, chances are you are doing more harm than good to the project.

**🎉 Bonus 🎉** Arrays also have destructuring, but they work based off index.

```js
const arr1 = ['a', 'b']
const [x, y] = arr1
// console.log(y) => 'b'
```

### Object Rest

Object Rest goes hand in hand with Object Destructuring, and is very easy to confuse with Object Spread. Once again we use the `...` operator, however the context is **different**. This time, it shows up while destructuring and is intended to gather leftover keys into one object. 😄

```js
const { preserveWhiteSpace, noBreaks, ...restOfKeys } = config;

// restOfKeys, is an object containing all the keys from config
// besides preserveWhiteSpace and noBreaks
// console.log(restOfKeys) => { foo: "bar" }
```

**Problem:** You want an object that has a subset of keys from another object.

**Sugar-free way:** You could use our old pal `Object.assign` and [delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete) any of the keys that you don't need! 😰

**When not to use it:** Using it to create a new object with omitted keys is a common use case. Just be aware that the keys you are omitting in the destructure are still floating around and potentially taking up memory. If you're not careful, this could cause a bug. 🐛

```js
const restOfKeys = Object.assign({}, config);
delete restOfKeys.preserveWhiteSpace
delete restOfKeys.noBreaks
```

**🎉 Bonus 🎉** Guess what? Arrays can do something similar and it works exactly the same!

```js
const array = ['a', 'b', 'c', 'c', 'd', 'e'];
const [x, y, ...z] = array;
// console.log(z) = ['c', 'c', 'd', 'e']
```

### Wrapping up

JavaScript sugar is great, and understanding how to read it will allow you to enter more diverse code bases and expand your mind as a developer. Just remember that **it's a balancing act between actually being concise, and making your code readable for others and your future self.**

While it might feel awesome showing off your shiny new tool, our job as programmers is to leave codebases more maintainable then they were when we entered them.

Here's a collection of the MDN Documents on what I covered if you want to do some further reading. 😄

-   [Ternary Operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_Operator)
-   [Spread Syntax](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator)
-   [Destructuring Assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
-   [Rest Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)