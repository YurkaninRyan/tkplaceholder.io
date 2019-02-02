import React from 'react';
import me from '../assets/me.jpg';
import { rhythm } from '../utils/typography';

class Bio extends React.Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
        }}
      >
        <img
          src={me}
          alt="Ryan Yurkanin"
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
            borderRadius: '50%',
            boxShadow: '0 0 0 4px var(--yellow)',
            background: 'var(--yellow)',
          }}
        />
        <div>
          <p style={{ marginBottom: 0 }}>
            <a href="https://mobile.twitter.com/YurkaninRyan">
              Ryan Yurkanin's
            </a>{' '}
            personal blog
          </p>
          <p>Lead Engineer @Guru</p>
        </div>
      </div>
    );
  }
}

export default Bio;
