import React from 'react';

import Header from './Header';
import MoreInfo from './MoreInfo/MoreInfo';

import { rhythm, scale } from '../utils/typography';

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
        <Header title={this.props.title} />
        <div
          style={{
            padding: `${rhythm(1)} ${rhythm(3 / 4)}`,
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse' }}>
            <MoreInfo />
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
