---
title: "How to Automate Social Cards for your Gatsby Blog"
description: Having to make a social card for every blog post you write can be tiresome.  Wouldn't it be awesome if they automatically generated?
date: "2019-04-05"
---

I love having my own blog, but I hate how bland my links look when sharing my posts on twitter.  It's hard to feel proud of your work when this is what your preview looks like:

![](/bland.png)

Why would anyone click that? If I wanted my links to stand out I need to add some branded images to my blog posts. I tried making each image by hand.  It went _okay_, but after updating my profile picture once I realized how hard it would be to keep them up-to-date.

**What if I could build my images at the same time I built my posts?** What if they could use the same data?

We should never have to worry about social cards again.  Let's make a Gatsby Plugin that automates generating images like this for us:

![](/example.png)

### Extending the Gatsby Build System with Plugins

I started researching and stumbled upon [a gatsby plugin](https://www.npmjs.com/package/gatsby-remark-social-cards) for doing exactly what I wanted to do.  It pulls in data from [gatsby-remark-transformer](https://www.gatsbyjs.org/packages/gatsby-transformer-remark/), and generated images based on that data. 🤯

It didn't have a lot of options for injecting my own branding, so I chose not to go with it. If you don't mind the default styling, feel free to install it and add it to your project!

If you do want to roll your own solution, we can get started by [creating a local plugin.](https://www.gatsbyjs.org/docs/how-plugins-work/#local-plugins)  Add a `plugins` folder to your gatsby blog repo with this structure:

```
plugins
└── gatsby-plugin-my-social-cards
    └── index.js
    └── package.json
```

Your `package.json` doesn't need anything in it.  It's fine if it's just an empty object `{}` for now.

Your index file will run for each blog post by `gatsby-transformer-remark`, and it will pass in graphql data about each post.  For now add this to it:

```js
const path = require('path');

module.exports = ({ markdownNode }) => {
  const { frontmatter, fields, } = markdownNode;
  const output = path.join('./public',fields.slug, 'seo.jpg');

  console.log(frontmatter, fields);

  return;
};
```

In your main `gatsby-config.js` add your local plugin to `gatsby-transformer-remark`.

```js{8-11}
module.exports = {
  siteMetadata: {
    title: 'TKPlaceholder',
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: ['gatsby-plugin-my-social-cards'],
      },
    },
  ],
};
```

The next time you run your develop server, you should see a stream of data logged out for each post. 🎉

**With the base of our plugin set up, we are going to need to do a couple more things to get everything functioning:**

1. We need a "base image".  This will be our static image that we write our dynamic content on top of.
2. For every font we want in our generated image, we will need to create a bitmap font, and add it to the plugin (this sucks).
3. We need to add the actual meta tags to each blog post so it links the generated image to the post.

### Creating the Base Image

For these next couple steps, **we are going to struggle.**  I have  no design skills.  Having a designer friend would be a huge help.

If you're like me though and have no friends then let's crack open [gimp](https://www.gimp.org/) and make some magic.

Here's an example of what my current base image looks like.  I was lazy and added my face, name, and job description at the bottom statically, though you could do it dynamically.

![](/base.jpg)

A [study of the top websites of 2018](https://iamturns.com/open-graph-image-size/) showed that the ideal aspect ratio for our social cards are **1.9:1** with a width of 1200 and a height of 630.

 Make sure to give yourself room to add anything you need dynamically later on.  Once you're done making your base image, add it to your plugin folder. It should look something like this now:

 ```bash{4}
plugins
└── gatsby-plugin-my-social-cards
    └── index.js
    └── base.jpg
    └── package.json
```

Now that we have a solid base to work with, we can move on to setting up our dynamic content generation.

### Adding Dynamic Content

Now that we have an image and some data, we need a way to make the two work together.  I decided to go with `jimp` a [javascript based image proccessing library](https://www.npmjs.com/package/jimp) a javascript based image proccessing library.  In your plugin's folder install it with `npm i --save jimp`

In our `index.js` file we can load our image and write it out to each post by adding a few lines of code:

```js{2,8-21}
const path = require('path');
const jimp = require('jimp');
 
module.exports = ({ markdownNode }) => {
  const { frontmatter, fields } = markdownNode;
  const output = path.join('./public', fields.slug, 'seo.jpg');
 
  return Promise.all([
    jimp.read(path.join(__dirname, 'base.jpg')),
    jimp.loadFont(jimp.FONT_SANS_128_BLACK)
  ]).then(([image, font]) => {
    image
      .resize(WIDTH, HEIGHT)
      .print(
        font,
        10,
        10,
        frontmatter.title,
      )
      .write(output);
  });
};
```

If you build out your blog you should be able to navigate to whatever the url of your article is with an added `/seo.jpg` at the end.

Make sure to read the `jimp` documentation for how you can position text and make it wrap.  It has a pretty great api that allows you to do a bunch of dynamic layout.

Websites have no idea you want to show this card though when you post a link.  We can use meta tags to point them in the right direction.

### Helping websites find your social card

For each blog post, we need to add a dynamic link to the social card that we want displayed.

I use `react-helmet` and `gatsby-plugin-react-helmet` because it makes working with meta tags in React a pleasure. You can install them with `npm i --save gatsby-plugin-react-helmet react-helmet`.

Remember to add your new plugin to your `gatsby-config` like so:

```js{13}
module.exports = {
  siteMetadata: {
    title: 'TKPlaceholder',
  },
  pathPrefix: '/',
  plugins: [
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: ['gatsby-plugin-my-social-cards'],
      },
    },
    "gatsby-plugin-react-helmet"
  ],
};
```

I recommend making one component that handles all of your blog post SEO and rendering it with each blog post.  The one that I use simply queries my data and renders `react-helmet`.

```jsx
import React from 'react';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

/* Only showing the relevant meta tags for clarity. */
/* There are a lot more that you can and should add */
function Head({ data, slug }) {

  /* Main gist here is to create the url dynamically for you social card. */
  const { siteMetadata } = data.site;
  const url = `${siteMetadata.siteUrl}${slug}`;
  const socialCard = `${url}seo.jpg`;

  return (
    <Helmet
      meta={[
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          property: 'og:image',
          content: socialCard,
        },
        {
          name: 'twitter:image',
          content: socialCard,
        },
      ]}
    />
  );
}

const query = graphql`
  query GetSiteMetadata {
    site {
      siteMetadata {
        title
        author
        description
        siteUrl
        social {
          twitter
        }
      }
    }
  }
`;

/* If you pass all the data you need in as props, you may not even need to query */
export default function SEO({ slug, }) {
  return (
    <StaticQuery
      query={query}
      render={data => {
        return <Head data={data} slug={slug} />
      }}
    />
  );
}
```

With some tweaking you should be able to render that component in each blog post.  Afterwards, use the chrome dev tools to double check that you have those meta tags in the DOM and that they are updating.

If each blog post has the proper meta tags pointing to the correct url then you should be all set!  If you publish your blog, you can use something like the [twitter card validator](https://cards-dev.twitter.com/validator) to preview what your article links will look like.

My final result ended up looking like this:

![](/final.png)

### 🎉 Bonus: Custom Fonts 🎉

If you're not satisfied with using the default fonts that `jimp` provides, it _is_ possible to use a custom font!

The trick is that you will need to find a bitmap font version of the font you want to use.  For me, this meant converting a font file I downloaded from Google Fonts into a bitmap font.

I used [Hiero](https://github.com/libgdx/libgdx/wiki/Hiero) to do this because I really struggled to find a better tool.  After installing the font of your choice, you can open it in Hiero and start converting it to a bitmap font.

Bitmap Fonts are images with prerendered letters on them.  Make sure that whatever font you export is the correct size and color because you won't be able to easily change that later.

Once you have the font files, you can add them to your plugin folder like so:

 ```bash{5-6}
plugins
└── gatsby-plugin-my-social-cards
    └── index.js
    └── base.jpg
    └── Montserrat-Black-80.fnt
    └── Montserrat-Black-80.png
    └── package.json
```

then your plugin code can consume them like this:

```js{10}
const path = require('path');
const jimp = require('jimp');
 
module.exports = ({ markdownNode }) => {
  const { frontmatter, fields } = markdownNode;
  const output = path.join('./public', fields.slug, 'seo.jpg');
 
  return Promise.all([
    jimp.read(path.join(__dirname, 'base.jpg')),
    jimp.loadFont(path.join(__dirname, 'Montserrat-Black-80.fnt'))
  ]).then(([image, font]) => {
    image
      .resize(WIDTH, HEIGHT)
      .print(
        font,
        10,
        10,
        frontmatter.title,
      )
      .write(output);
  });
};
```

---

If you have any questions or are looking for one-on-one React mentorship, feel free to tweet me **@yurkaninryan** any time!

Good luck and happy coding!! 😄






