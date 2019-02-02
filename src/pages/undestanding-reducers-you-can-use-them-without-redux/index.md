---
title: "Understanding Reducers: You Can Use Them Without Redux"
description: Reducers create different output depending on input. That's it.
date: "2019-01-29"
---

**TLDR:** You can handle state with a reducer in your Class Components by having one function that translates actions into state changes. It centralizes all your setStates.

* * * * *

### 🤔 What is a Reducer?

Reducers are functions that take input and decide what to do it with it in one central spot. **That's it. 😄**

For example, if you have a function that determines the view to show based on a URL, it's a url view reducer.

Redux Reducers™️ are a specific application of reducers that interpret events in your application, and how that changes application state.

```js
// A classic reducer, all the state
// changes for a slice of state in one spot
function reducer(state, action) {
  switch (action.type) {
    case 'RESET_COUNT_CLICKED':
      return { count: 0 };
    case 'INCREMENT_COUNT_CLICKED':
      return { count: state.count + 1 };
    case 'DECREMENT_COUNT_CLICKED':
      return { count: state.count - 1 };
    default
      return state;
  }
}
```

If you aren't familiar with Redux, the above example is usually kickstarted by calling a `dispatch` function with an `action` (object describing an event). 📣

We can use reducers right now in a class component by creating a function that handles setting the state by an action type like so:

```js
/* Here we centralize all the state transformations in one dispatch function */
/* The UI only emits what has happened, and dispatch handles the transform */
class Counter extends React.Component {
  state = { count: 0 };
  
  /* dispatch is our reducer, it is turning our actions into updated state */
  dispatch = action => {
    switch (action) {
      case 'INCREMENT_CLICKED': {
        return this.setState(state => ({ count: state.count + 1 }));
      }
      case 'DECREMENT_CLICKED': {
        return this.setState(state => ({ count: state.count - 1 }));
      }
    }
  }

  render() {
    return (
      <div>
        {props.count}
        <button onClick={() => this.dispatch('INCREMENT_CLICKED')} />
        <button onClick={() => this.dispatch('DECREMENT_CLICKED')} />
      </div>
    )
  }
}
```

Using a reducer in this simple example is overkill in my opinion. I'm glad React is going to be providing both a `useState` and `useReducer` hook for that reason.

If I noticed I was passing down ways to change the state, and `count` became coupled with a few more state properties, I would switch to a reducer.

Since Redux puts all of its state in one object that grows quickly, it makes the reducer pattern a perfect fit. It's possible to remove reducers from Redux, even though we would lose a ton of awesome features.

Redux lets you `connect` your global store to your component. You can translate state into props. They also provide a `dispatch` function that triggers your reducers.

Instead of passing a `dispatch` function, let's pass in an `update` function that works like `setState`.

### 💩 Creating a "Different" Version of Redux

```js
/* Simple Component that will take in a count, and a way to update it */
function Counter(props) {
  return (
    <div>
      {props.count}
      <button onClick={() => props.update({ count: props.count + 1 })} />
    </div>
  )
}

/* This isn't _exactly_ what redux looks like, but instead of a dispatch */
/* we get an "update" function that takes what the new state looks like */
function mapToProps(store, update) {
  return { update, count: store.count }
}

/* Now we inject our global state/updater into our simple component */
const ConnectedCounter = connect(mapToProps)(Counter)
```

When you call update, you are saying exactly how the state should change inline. It may or may not be next to other similar state changes.

**With a small enough state, this actually feels nice and concise.** If we had 5 or more components changing a few state properties it would be hard to find the source of bugs. 🐛 🕵

Even without changing redux at all you can emulate this pattern. Dispatching actions that look like `SET_COUNT` are hints we really just want `setState`. It's the easy thing to do.

If we create a less opinionated action like`INCREMENT_BUTTON_CLICKED` we could use it in many reducers, and the action payload wouldn't vary too much.

### 💡 Reducers Are Useful for More Than State

```js
import { Switch, Route } from 'react-router;

function RouterViewReducer() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/:user" component={User} />
      <Route component={NoMatch} />
    </Switch>
  )
}
```

Reducers are a great way to colocate decisions. If you've worked with react-router-4 before, then the above code should look pretty familiar.

Thanks to the `<Switch />` component, we can nest these route-view reducers anywhere. 

Now if someone has the question "What are all the ways the URL can change what renders", they have one central place to look. 

### 🏆 Summing It Up

1.  Reducers as a pattern exist outside of Redux and Javascript and are simple to implement. They have one single responsibility of taking input and giving output.
2.  Redux Reducers turn app events into state. You don't need Redux to do this now, you can do it with local component state.
3.  Reducers make it easy to organize and find different variations of what can happen in the code and are useful as apps grow large.

* * * * *

If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me **@yurkaninryan** any time!

Good luck and happy coding!! 😄