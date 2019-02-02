import React from 'react';

import Footer from '../Footer';
import Bio from '../Bio';

import './MoreInfo.css';

export default class MoreInfo extends React.Component {
  state = {
    theme: null,
  };

  componentDidMount() {
    this.setState({ theme: window.__theme });
    window.__onThemeChange = () => {
      this.setState({ theme: window.__theme });
    };
  }

  render() {
    return (
      <aside className="MoreInfo">
        <Bio />
        <Footer />
        <a
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.preventDefault();
            window.__setPreferredTheme(
              this.state.theme === 'light' ? 'dark' : 'light'
            );
          }}
        >
          {this.state.theme === 'light'
            ? 'Turn off the lights'
            : 'Turn on the lights'}
        </a>
      </aside>
    );
  }
}
