import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import styles from './Tags.module.css';

const Tags = ({allTags, thisTag}) => (
  <nav aria-label="Commentary tags" className={styles.tagBar}>
    <span>Tags:</span>
    {[null, ...allTags].map(tag => (
      <Link
        key={tag === null ? 'all' : 'tag-' + tag}
        className="btn btn-secondary btn-sm"
        aria-current={tag === thisTag ? 'page' : undefined}
        to={
          tag === null
            ? '/commentary'
            : '/commentary?tag=' + encodeURIComponent(tag)
        }
      >
        {tag ?? 'All posts'}
      </Link>
    ))}
  </nav>
);
Tags.propTypes = {
  allTags: PropTypes.array.isRequired,
  thisTag: PropTypes.string,
};

export default Tags;
