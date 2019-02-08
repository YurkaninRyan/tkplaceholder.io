import React from 'react';

export default class ThemeSwitch extends React.Component {
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
    );
  }
}
