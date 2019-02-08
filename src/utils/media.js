import { css } from 'styled-components';

const sizes = {
  desktop: 1100,
};

const media = Object.keys(sizes).reduce((acc, label) => {
  acc[label] = (...args) => css`
    @media (min-width: ${sizes[label]}px) {
      ${css(...args)}
    }
  `;

  return acc;
}, {});

// Iterate through the sizes and create a media template
export default media;
