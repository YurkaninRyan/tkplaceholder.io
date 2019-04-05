import React from 'react';
import { Link } from 'gatsby';

import { rhythm, scale } from '../utils/typography';

export default class Header extends React.Component {
  render() {
    return (
      <header
        style={{
          background: 'var(--yellow-gradient)',
          position: 'sticky',
          top: '-60px',
          zIndex: 100,
        }}
      >
        <nav
          style={{
            margin: '0 auto',
            padding: rhythm(1 / 2),
            maxWidth: '1300px',
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
                color: 'var(--black)',
              }}
              to={'/'}
            >
              TKPLACEHOLDER
            </Link>
          </h1>
        </nav>
      </header>
    );
  }
}
