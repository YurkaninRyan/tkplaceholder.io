---
title: "Why React Hooks, and how did we even get here?"
description: "Hooks have learned from the trade-offs of mixins, higher order components, and render props to make it easier to keep related bits of stateful code together and reusable. 💪"
date: "2018-11-12"
---

[React Hooks](https://reactjs.org/docs/hooks-overview.html) are here, and I immediately fell in love with them. To understand why Hooks are great, I think it helps to look at how we've been solving a common problem throughout React's history.

**Here's the situation.**  We need to build a button that allows a user to send and receive messages through it.  It must show old messages, listen for new messages, and change the document title to alert them accordingly.

For this exercise, let's ignore the presentational bit. We're going to focus on the logic surrounding the data.  We can start by making a shell of a component and fetching data on mount.

```js
class Intercom extends Component {
  state = { messages: [] };

  /* Once this component is rendered, it will grab all the old messages */
  componentDidMount() {
    API.getMessages(this.props.user.id, data =>
      this.setState({ messages: data.messages })
    );
  }

  render() {
    return (...);
  }
}
```

Easy enough.  Now we need to set up a subscription for new messages, and clean up when we unmount.

We should keep a seperate state key for new messages because we will need to differentiate in the future.

```js{3,7,8,9,10,11,18,21,22,23}
class Intercom extends Component {
  state = {
    newMessages: [],
    messages: []
  };

  updateNewMessages = data => {
    this.setState({
      newMessages: [...data.messages, ...this.state.newMessages]
    });
  };

  componentDidMount() {
    API.getMessages(this.props.user.id, data =>
      this.setState({ messages: data.messages })
    );

    API.subscribeToNewMessages(this.updateMessages);
  }

  componentWillUnmount() {
    API.unsubscribeFromNewMessages(this.updateMessages);
  }

  render() {
    return (...);
  }
}
```

Now that we are at two behaviors, the component is starting to get a little large but it's not _that_ bad.  Notice though, that the highlights aren't near each other, and are actually starting to fracture.

Moving on, it's time to handle the document title.  We can store the original document title, and update it if we get any new messages.

```js{5,22,23,24,25,26}
class Intercom extends Component {
  state = {
    newMessages: [],
    messages: [],
    originalDocumentTitle: document.title,
  };

  updateNewMessages = data => {
    this.setState({
      newMessages: [...data.messages, ...this.state.newMessages]
    });
  };

  componentDidMount() {
    API.getMessages(this.props.user.id, data =>
      this.setState({ messages: data.messages })
    );

    API.subscribeToNewMessages(this.updateMessages);
  }

  componentDidUpdate() {
    document.title = this.state.newMessages.length ?
      'New Messages' :
      this.state.originalDocumentTitle
  }

  componentWillUnmount() {
    API.unsubscribeFromNewMessages(this.updateMessages);
  }

  render() {
    return (...);
  }
}
```

Alright, now this file is starting to get a little big, and it's getting harder to see the big picture for each of the three behaviors.

If you've been working in React for awhile, you know that we already have techniques for dealing with this in a class component.  If you don't know what to do though, you might keep adding behaviors and going into tech debt.

Hooks has in interesting effect on components by default.  **Take a look at what the above code would look like if written with hooks**.  I'll highlight the code related to the new messages behavior.

```js{9,10,11,12,13,14,15,16,17,18,19}
function Intercom(props) {
  /* Fetch old messages */
  const [messages, setMessages] = useState([]);
  useEffect(
    () => API.getMessages(props.user.id, setMessages),
    [props.user.id]
  );

  /* Watch for new ones */
  const [newMessages, setNewMessages] = useState([]);
  useEffect(
    () => {
      API.subscribeToNewMessages(props.user.id, setNewMessages);

      return () =>
        API.unsubscribeFromNewMessages(props.user.id, setNewMessages);
    },
    [props.user.id]
  );

  /* Update document title as needed */
  const [originalTitle] = useState(document.title);
  useEffect(
    () => {
      document.title = newMessages.length
        ? "You have new messages!"
        : originalTitle;
      return () => (document.title = originalTitle);
    },
    [newMessages.length]
  );

  return (...);
}
```

Everything is clumped together by behavior instead of by lifecycle hook.  This makes the debugging and refactoring stories much shorter.  You don't have to go from lifecycle hook to lifecycle hook plucking out bits of logic to move.

Now that we have these three clear bundles of logic, we can utilize *Custom Hooks*, and write our own hooks that abstract the behaviors away in a reusable way.

```js
function useMessages(id) {
  const [messages, setMessages] = useState([]);
  useEffect(
    () => API.getMessages(props.user.id, setMessages),
    [id]
  );

  return messages;
}

function useNewMessages(id) {
  const [messages, setMessages] = useState([]);
  useEffect(
    () => {
      API.subscribeToNewMessages(id, setMessages);

      return () =>
        API.unsubscribeFromNewMessages(id, setMessages);
    },
    [id]
  );

  return messages;
}

function useTemporaryDocumentTitle(temporary) {
  const [original] = useState(document.title);
  useEffect(
    () => {
      document.title = temporary || original;
      return () => document.title = original;
    },
    [temporary]
  );
}
```

We can import those Custom Hooks into our component, and now our previously complicated Intercom component looks like this:

```js
function Intercom(props) {
  const messages = useMessages(props.user.id);
  const newMessages = useNewMessages(props.user.id);
  useTemporaryDocumentTitle(
    newMessages.length ? "You have new messages!" : null
  )

  return (...);
}
```

So hooks can help us put behaviors into a reusable box, but did you know that we've been doing that already?  We've slowly evolved over time because each technique that's been found has had some problems.

Let's take a look at each one, examine their trade-offs, and think about what could be done to improve.

### Mixins

Mixins get a lot of flak. They set the stage for grouping together lifecycle hooks to describe one effect.

```js
const NewMessagesMixin = {
  getInitialState() {
    return {
      newMessages: []
    }
  },

  updateNewMessages(data) {
    this.setState({
      newMessages: [...data.messages, ...this.state.newMessages]
    });
  };

  componentDidMount() {
    API.subscribeToNewMessages(this.updateMessages);
  }

  componentWillUnmount() {
    API.unsubscribeFromNewMessage(this.updateMessages)
  }
}

const Intercom = React.createClass({
  mixins: [NewMessagesMixin, MessagesMixin, DocumentTitleMixin],

  /* Rest of our component would go here! */
})
```

While the general idea of encapsulating logic is great, we ended up learning some [serious lessons from mixins](https://reactjs.org/blog/2016/07/13/mixins-considered-harmful.html).

It's not obvious where `this.state.newMessages` is coming from. With mixins, it's also possible for the mixin to be blindly relying on that a property exists in the component.

That becomes a huge problem as people start including and extending tons of mixins. You can't simply search in a single file and assume you haven't broken something somewhere else.

Also, you can't easily use `this.state.newMessages` in another mixin.  They don't compose, so you can't plug it into other encapsulations.

Refactoring needs to be easy. **These mixed-in behaviors need to be more obvious that they don't belong to the component.** They shouldn't be using the internals of the component. 🙅‍

Mixins are also very difficult to type and test, which makes them harder to work with in an environment optimized for change.

### Higher Order Components

We can achieve a similar effect, and make it a bit less magical by creating a container that passes in props! Inheritance's main trade-off is it makes refactoring harder, so let's try composition!

```js
/* Function that takes a component and returns a component! */
function withNewMessages(Component){
  return class withNewMessage extends Component {
    state = { newMessages: [] }

    updateNewMessages = data => {
      this.setState({
        newMessages: [...data.messages, ...this.state.newMessages]
      });

      componentDidMount() {
        API.subscribeToNewMessages(this.updateMessages);
      }

      componentWillUnmount() {
        API.unsubscribeFromNewMessage(this.updateMessages)
      }

      render() {
        return (<Component {...this.props} {...this.state} />)
      }
    };
  }
}

class Intercom extends Component {
  /* Component that uses newMessage, messages props*/
}

const DecoratedIntercom = withNewMessages(
  withMessages(
    withDocumentTitle(
      Intercom
    )
  )
)
```

While this is more code, we are moving in the right direction. We have all the benefits of Mixins. Now we have an `<Intercom />` component that is no longer tightly coupled to the subscription behavior.

Testing has become easier, typing still isn't quite as powerful as it could be though.  They can compose together, but there could still be namespace collisions in the props.

### Render Props & Children as a Function

This is the pattern that has been staring us in the face the entire time. All we want is a component that handles the subscribe to new messages behavior, and the ability to render whatever we want.

```js
class NewMessages extends Component {
  state = { newMessages: [], }

  updateNewMessages = data => {
    this.setState({
      newMessages: [...data.messages, ...this.state.newMessages]
    });
  }

  componentDidMount() {
    API.subscribeToNewMessages(this.updateMessages);
  }

  componentWillUnmount() {
    API.unsubscribeFromNewMessage(this.updateMessages)
  }

  render() {
    return this.props.children(this.state)
  }
}

class Intercom extends Component {
  render() {
    <NewMessages>
      {({ newMessages, }) => (
        // Write code that uses them here!
      )}
    </NewMessages>
  }
}
```

**This subtle difference has some pretty awesome benefits**

-   It is now super obvious what is providing `newMessages`. You can also easily rename them to prevent name collisions.
-   We have flexible control over what is rendering. We don't need to be making new components, and if we decide to, it's just a simple copy paste.
-   You can see all of this directly in a components render function. It's in plain sight and easy for new developers coming in to identify. `cmd + f` checks out here.

However, it creates a false sense of hierarchy. Just because a behavior is "nested" under another behavior doesn't mean it relies on the parent behavior.

Also it's such a pain to refactor when you have to add or remove a behavior.  Good luck refactoring something that looks like this:

```jsx
const MyForm = () => (
  <DataFetcher>
    {({ data, }) => (
      <Actions>
        {({ actions, }) => (
          <Translations>
            {({ translations, }) => {
              <Theme>
                {({ theme, }) => (
                  <form styles={theme.form}>
                    <input type="text" value={data.value} />
                    <button onClick={actions.submit}>
                      {translations.submit}
                    </button>
                  </form>
                )}
              </Theme>
            }}
          </Translations>
        )}
      </Actions>
    )}
  </DataFetcher>
)
```

### Things to Remember with Hooks

When using hooks, you have to remember a couple of rules that may seem weird at first:

**⚠️ You should call hooks at the top level of the render function.**

This means no conditional hooks. Our contract with React is that we will call the same amount of hooks, in the same order every time.

This rule starts to make more sense when you compare it to how Mixins, and HOCs work. You can't conditionally use them and reorder them on each render.

If you want conditional effects, you should split your hooks into other components, or consider a different pattern.

⚠️ **You can only use hooks in React Function Components, and in Custom Hooks.**

I'm not sure if there's actually any technical reason to not try calling them in a regular function. This ensures that the data is always visible in the component file.

⚠️ **There aren't hook primitives for componentDidCatch or getSnapshotBeforeUpdate.**

The React team says they are on their way though!

For the componentDidCatch use case, you could create an Error Boundary component, getSnapshotBeforeUpdate is a bit trickier, but fortunately pretty rare.

### Some Final Notes

I have no doubt that hooks are about to change the way we view React, and shake up some best practices. The amount of excitement and libraries coming out is inspiring!

However, I have seen the hype for all of these design patterns in the past. While most have ended up being very valuable tools in our toolboxes, they all come with a price.

I still don't fully understand the trade-offs of hooks, and that scares me. I highly suggest playing around with them, and learning by example. You should probably wait a bit before doing a full rewrite in them though 😉

* * * * *

If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me **@yurkaninryan** any time!

Good luck and happy coding!! 😄
