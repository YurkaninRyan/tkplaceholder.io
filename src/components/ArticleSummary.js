import React from 'react';
import { Link } from 'gatsby';

import { formatPostDate, formatReadingTime } from '../utils/helpers';
import { rhythm } from '../utils/typography';

export default function ArticleSummary(props) {
  return (
    <article>
      <header style={{ marginBottom: rhythm(1 / 4) }}>
        <div
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: '600',
            fontSize: rhythm(3 / 4),
            lineHeight: rhythm(5 / 6),
          }}
        >
          <Link
            style={{ boxShadow: 'none', color: 'var(--textTitle)' }}
            to={props.to}
            rel="bookmark"
          >
            {props.title}
          </Link>
        </div>
        <small>
          {formatPostDate(props.posted, 'en')}
          {` • ${formatReadingTime(props.timeToRead)}`}
        </small>
      </header>
      <p
        dangerouslySetInnerHTML={{
          __html: props.description,
        }}
      />
    </article>
  );
}
