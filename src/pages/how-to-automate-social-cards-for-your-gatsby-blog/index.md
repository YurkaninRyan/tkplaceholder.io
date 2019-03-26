---
title: "How to Automate Social Cards for your Gatsby Blog"
description: Having to make a social card for every blog post you write can be tiresome.  Wouldn't it be awesome if they automatically generated? 
date: "2019-04-25"
---

When I first switched from writing on Medium to having my own Gatsby blog, it made me sad that linking to my posts wouldn't show a preview image.

I wanted to have an image similar to this show up whenever I shared my posts:

![](/how-to-automate-social-cards-for-your-gatsby-blog/seo.jpg)

At first, I tried making each image by hand.  It was _okay_, but I quickly realized after changing my job title that method wasn't going to scale.

It would be ideal if Gatsby made the images as a part of the build step, and if they used the same data the rest of my blog is already using.

### Making a Gatsby Plugin

I started researching and eventually stumbled upon [a gatsby plugin](https://www.npmjs.com/package/gatsby-remark-social-cards) for doing exactly what I wanted to do.  It would pull in data from [gatsby-remark-transformer](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/), and generated images based on that data. 🤯

**However**, It didn't have a lot of options for injecting my own branding and I didn't like the default, so I chose not to go with it.

If you don't mind the default styling however, then it's as easy as pulling it down, adding it to your plugins, and suddenly you have magical social card bliss!

If you do want to roll your own solution, we can get started by [creating a local plugin.](https://www.gatsbyjs.org/docs/how-plugins-work/#local-plugins)  Add a `plugins` folder to your gatsby blog repo and make it look like this:

```
plugins
└── gatsby-plugin-my-social-cards
    └── index.js
    └── package.json
```

Your `package.json` doesn't really need anything in it for now because we are making a local plugin.  It's fine if it's just an empty object `{}` for now.

Your index file will be run for each blog post by `gatsby-transformer-remark`, and it will pass in graphql data about each post.  It should look something like this:

```js
const path = require('path');

module.exports = ({ markdownNode }) => {
  const { frontmatter, fields, } = markdownNode;
  const output = path.join('./public',fields.slug, 'seo.jpg');

  console.log(frontmatter, fields);

  return;
};
```

In your main `gatsby-config.js`, add your local plugin (in this case `gatsby-plugin-my-social-cards`) to `gatsby-transformer-remark`.  

The next time you run your develop server, you should see a stream of data being logged out for each post. 🎉

**With the base of our plugin set up, we are going to need to do a couple more things to get everything functioning correctly:**

1. We need a "base image".  This will be our static image that we write our dynamic content on top of.
2. For every font we want in our generated image, we will need to create a bitmap font, and add it to the plugin (this sucks).
3. We need to add the actual meta tags to each blog post so it links the generated image to the post.

### Creating the Base Image

For these next couple steps, **we are going to struggle.**  I have absolutely no background in design or creating assets, so reach out to your nearest designer friend and beg them for mercy.

If you're like me though and have no friends then let's crack open [gimp](https://www.gimp.org/) and make some magic.

Here's an example of what my current base image looks like.  I was lazy and added my face, name, and job description at the bottom statically, but you could do all of that dynamically later on.

![](/base.jpg)

 **TK: ADD THE RATIO AND A LINK TO THE BLOG POST**

 Make sure to give yourself room to add anything you need dynamically later on.  Once you're done making your base image, add it to your plugin folder. It should look something like this now:

 ```plain{4}
plugins
└── gatsby-plugin-my-social-cards
    └── index.js
    └── base.jpg
    └── package.json
```