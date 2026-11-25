import React from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';

import styles from './Pages.module.css';

const Pages = ({pageCount, thisPage, tag}) => (
  <nav aria-label="Commentary pages" className={styles.pageBar}>
    <span>Pages:</span>
    {Array.from({length: pageCount}, (_, i) => i + 1).map(page => (
      <Link
        key={page}
        className="btn btn-secondary btn-sm"
        aria-current={page === Number(thisPage) ? 'page' : undefined}
        to={
          '/commentary?page=' +
          page +
          (tag ? '&tag=' + encodeURIComponent(tag) : '')
        }
      >
        {page}
      </Link>
    ))}
  </nav>
);
Pages.propTypes = {
  pageCount: PropTypes.number.isRequired,
  thisPage: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  tag: PropTypes.string,
};

export default Pages;
