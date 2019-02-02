import React from 'react';
import { Link } from 'gatsby';

import { rhythm, scale } from '../utils/typography';

export default class Header extends React.Component {
  render() {
    return (
      <header
        style={{
          background: 'var(--yellow)',
          marginBottom: rhythm(1),
        }}
      >
        <nav
          style={{
            margin: '0 auto',
            padding: rhythm(1 / 2),
            maxWidth: '1200px',
          }}
        >
          <h1
            style={{
              ...scale(0.5),
              marginBottom: 0,
              marginTop: 0,
            }}
          >
            <Link
              style={{
                boxShadow: 'none',
                textDecoration: 'none',
                color: 'var(--textTitle)',
              }}
              to={'/'}
            >
              {this.props.title}
            </Link>
          </h1>
        </nav>
      </header>
    );
  }
}
