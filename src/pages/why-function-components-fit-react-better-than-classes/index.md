---
title: Why function components fit React better than classes
description: When making a new React Component you have two options, class or function.  Why the shift from the way we've always known?
hidden: false
date: "2019-05-11"
---

With the release of hooks, React has put a spotlight on the function form of components.

Once again we have to decide what the default boilerplate for our components should be. Which one should be in the official documentation?

```jsx
/* Class Component */
class Hello extends React.Component {
  render() {
    return <span>Hello World!</span>
  }
}

/* Function Component */
function Hello() {
  return <span>Hello World!</span>
}
```

Function components have been around since React 14, **but they couldn't have state or lifecycles.**

That was nice because it kept components pure, but if you needed state you _had_ to convert it to a class. 😩

After hooks, function components can do [almost everything that classes can](https://reactjs.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes).  Now we very rarely have to convert.

React **has no plans to deprecate classes** but I've learned to view classes as an escape hatch.  I try not to use classes in my own code.

Let's talk about why classes may not be the best abstraction for React components.

### Composing vs Inheriting in the React World

If you aren't familiar with composition and inheritance, they are solutions for sharing behavior.

Let's say we already have a class that defines an `Animal`, and now we want to make a `Duck`.  It is an animal, but it needs to be able to fly and quack. 🦆

In inheritance world,`Duck` extends `Animal` and adds the ability to fly/quack.  Now those behaviors are tied with each other.

In composition world, you isolate those behaviors, and can give a class superpowers by adding it in like so `canQuack(canFly(Animal))`

This reduced the amount of coupling that occurs and makes it easier to reuse behaviors. You can make a Pilot with `canFly(Person)` for example.

One of the main selling points of components is that they are a blackbox of UI and side effects.  It makes them less brittle, and encapsulation makes mental models simple.

The React documentation itself [recommends composition over inheritance](https://reactjs.org/docs/composition-vs-inheritance.html) and advises against making another base class off of `React.Component`.

That's why you don't often see code that looks like this:

```js
class CustomDataComponent extends React.Component {
  componentDidMount() {
    ...
  }
}

class MyComponent extends CustomDataComonent {}
```

Before ES6 classes, React exposed `mixins` which had some cons, but were a great attempt at solving the composition problem.

```jsx
const Foo = React.createClass({
  /* These mixins can't effectively communicate between each other */
  /* The also all touch the same this, and by extension, this.state */
  /* Which leads to hard to track errors! */
  mixins: [A(), B(), C()],

  render() {
    return <span>{this.state.bar}</span>
  }
})
```

After moving to the ES6 Class version of components they settled on a new technique called **Higher Order Components**.

Notice that in this example, I'm not using classes because you don't have to!

```jsx
/* Example of what a HOC looks like */
/* Its a function that takes a component, and returns a component */
function A(Component) {
  return function AComponent(props) {
    return <Component {...props} custom="from A!" />
  }
}


const ComposedComponent = A(B(C(MyComponent)))
```

We rarely want to extend `React.Component` and we don't extend classes that we create.  Regular ES6 mixins **don't make sense for our usecase.**

This doesn't actually harm our codebase in anyway though.  Higher Order Components work with both.

Let's look at something that can harm us. 😨

### `this`, Concurrent Mode,  and render ownership of props and state

If you haven't been following React closely, you may not of noticed that they:
*  [Replaced the call stack with fibers](https://code.fb.com/web/react-16-a-look-inside-an-api-compatible-rewrite-of-our-frontend-ui-library/)
* [Created a priority system](https://github.com/facebook/react/tree/master/packages/scheduler) that makes some renders more important than others
* Made renders interruptable and resumable

In [Concurrent Mode](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html), `render` may run more then one time, and since `this` in a class is mutable, renders that should be the same may not be.

That means that the following code snippets could have two completely different results!

```jsx
/* If react interrupts this work, and comes back later, this.props may have already changed! */
class Component extends React.Component {
  render() {
    return <span>Count: {this.props.count}</span>
  }
}

/* Destructuring captures the reference in local scope */
class Component extends React.Component {
  render() {
    const { props, } = this;
    return <span>Count: {props.count}</span>
  }
}

/* Function components do this automatically! */
function Component(props) {
  return <span> Count: {props.count}</span>
}
```

The bugs this causes are _very_ subtle. The default should be to capture the values.  It makes side effects a lot more reliable and you can always use a ref to opt out.

If you're curious, [Dan Abramov does a great job showcasing them](https://overreacted.io/how-are-function-components-different-from-classes/) and breaking down why we should care.

Function components have their own problems.  Subtle bugs stop coming from `this`, but are now coming from closures.

The main difference is that it is _very_ hard to create warnings around `this` but we [already have lint rules](https://www.npmjs.com/package/eslint-plugin-react-hooks) that make `useEffect` much easier to use.

### Write it the way you describe it

My favorite way to describe React components is as functions that return a representation of UI.

`f(context, props, state) => UI`

Anytime one of the three arguments above changes, a new UI is produced.  Then effects are produced and effects can be described in a smilar way.

`f(context, props, state) => cleanup => effect`

So why wouldn't I write out my React components that way?

If we had started with functions and then React introduced classes would we defend them the same way?

---
If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me @yurkaninryan any time!

Good luck and happy coding!! 😄


