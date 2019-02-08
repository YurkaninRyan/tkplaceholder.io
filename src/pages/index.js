import React from 'react';
import { graphql } from 'gatsby';
import get from 'lodash/get';
import styled from 'styled-components';

import Layout from '../components/Layout';
import Bio from '../components/Bio';
import SEO from '../components/SEO';
import ArticleSummary from '../components/ArticleSummary';

import media from '../utils/media';
import { rhythm } from '../utils/typography';

const MobileBio = styled.aside`
  display: block;
  margin-bottom: ${rhythm(1 / 4)};

  ${media.desktop`
    display: none;
  `}
`;

class BlogIndex extends React.Component {
  render() {
    const siteTitle = get(this, 'props.data.site.siteMetadata.title');
    const posts = get(this, 'props.data.allMarkdownRemark.edges', []).filter(
      ({ node }) => node.fields.langKey === 'en'
    );

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO />
        <MobileBio>
          <Bio />
        </MobileBio>
        {posts.map(({ node }) => {
          if (node.frontmatter.hidden) {
            return null;
          }

          return (
            <ArticleSummary
              to={node.fields.slug}
              title={node.frontmatter.title}
              description={node.frontmatter.description}
              posted={node.frontmatter.date}
              timeToRead={node.timeToRead}
            />
          );
        })}
      </Layout>
    );
  }
}

export default BlogIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          fields {
            slug
            langKey
          }
          timeToRead
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            hidden
          }
        }
      }
    }
  }
`;
