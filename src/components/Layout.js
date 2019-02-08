import React from 'react';
import styled from 'styled-components';

import Header from './Header';
import Social from './Social';
import Bio from './Bio';
import ThemeSwitch from './ThemeSwitch/ThemeSwitch';

import { rhythm, scale } from '../utils/typography';
import media from '../utils/media';

const DesktopSidebar = styled.aside`
  align-self: flex-end;
  margin-right: 48px;
  position: sticky;
  top: 48px;
  display: none;

  ${media.desktop`
    display: block;
  `}
`;

class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div
        style={{
          color: 'var(--textNormal)',
          background: 'var(--bg)',
          transition: 'color 0.2s ease-out, background 0.2s ease-out',
          minHeight: '100vh',
        }}
      >
        <Header />
        <div
          style={{
            padding: `${rhythm(1)} ${rhythm(1)}`,
            maxWidth: '1300px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse' }}>
            <DesktopSidebar>
              <Bio />
              <Social />
              <ThemeSwitch />
            </DesktopSidebar>
            <main
              style={{ width: rhythm(26), flex: '0 0 auto', maxWidth: '100%' }}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default Layout;
