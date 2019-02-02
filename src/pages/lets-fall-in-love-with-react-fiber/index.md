---
title: "Let's fall in love with React Fiber"
description: React Fiber is an internal engine change that allows React to break the limits of the javascript call stack.
date: "2018-05-18"
---

**TLDR,** React Fiber is an internal engine change that allows React to break the limits of the call stack. It's creation enables React to pause/start rendering work at will. Eventually, React users will be able to hint at the "priority" of work.

Currently, we can't directly interface with it, so why should we care about it? Because it's really freaking cool!

### React before Fiber was like working at a fast paced company without git.

Imagine being in the middle of a huge feature, and your boss needs a hotfix, pronto. You can't stop working though because all your changes are in one file, you're committed to finishing this work.

If we were using git, we would be able to commit our work to a branch, and switch to a quick hotfix branch.

**With Fiber, React can pause and resume work at will to get working on what matters as soon as possible! 🎉**

### React Internals in a nutshell 🥜

You create a tree of components. React takes this tree, walks through it, and creates a virtual model of the end result. Perhaps you are rendering to the DOM, perhaps you are targeting native. At this point, that doesn't matter to React.

Here's an example of a tree of components:

```jsx
<App>
  <Navbar />
  <Main>My Blog!</Main>
  <Footer />
</App>
```


Now, as your app updates, React will do that process of creating the virtual result over and over again. Each time, it compares the previous virtual tree to the next one.

At this point, we get platform-dependent. If you are rendering to the DOM, it could be that only one class on one element changed. React will walk through the virtual tree, find what's changed, and update as little as it can.

This could mean updating one class attribute, or it could mean tearing down the whole DOM. This is [Reconciliation](https://reactjs.org/docs/reconciliation.html).

Before Fiber, this was it. The work was laid out, and the renderer of choice got to work. Even if the browser was lagging, the user was typing, or the planet was about to explode, the render train wouldn't stop. 🚋

### How does it work (at a high level)?

With Fiber, there are now varying levels of priority for updates. Updating an input a user is typing into has higher priority than a list with thousands of components.

Fiber breaks tree computation into units of work that it can "commit" at any time. **So what is a unit of work?** It's simply a node in your component tree! 

1.  React can now pause, resume, and restart work on a component. This means certain lifecycle hooks may fire more than once.
2.  React can have a priority-based update system. This allows the React Team to fine tune the renderer so that React is fastest during the most common use cases.

I want to focus on that first point a bit, though. React is going to be moving away from (but still supporting!) some old lifecycle hooks, and adding some new ones! 🚀

`componentWillMount`, `componentWillUpdate`, `componentWillReceiveProps`, can now fire multiple times. You shouldn't trigger side effects here.

Now, you want to fire side effects in the lifecycle hooks that will only fire once: `componentDidMount` and `componentDidUpdate`

To make up for a lot of the use cases that `componentWillReceiveProps` covered, we will be receiving two new hooks.

1.  `getDerivedStateFromProps` which doesn't have access to previous props or the component instance, but allows you to sync state with your props.
2.  `getSnapshotBeforeUpdate` gives you access to the DOM before it gets updated. The value you return is usable in `componentDidUpdate`.

![](https://cdn-images-1.medium.com/max/1600/0*OoDfQ7pzAqg6yETH.)
<figcaption>Here is a graph illustrating how the lifecycle hooks work with React Fiber</figcaption>

> As of React 16.4, getDerivedStateFromProps now always fires before the render method. Not just when props update!

If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me **@yurkaninryan** any time!

Good luck and happy coding! 😌👌