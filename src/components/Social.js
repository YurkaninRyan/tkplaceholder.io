import React from 'react';

import { rhythm } from '../utils/typography';

export default class Social extends React.Component {
  render() {
    return (
      <footer>
        <a
          href="https://mobile.twitter.com/YurkaninRyan"
          target="_blank"
          rel="noopener noreferrer"
        >
          twitter
        </a>{' '}
        &bull;{' '}
        <a
          href="https://github.com/YurkaninRyan"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>
      </footer>
    );
  }
}
